#!/usr/bin/env python3
"""OpenViking Shim Server

A lightweight drop-in replacement for the OpenViking server that:
- Implements the same HTTP API (sessions, messages, context)
- Stores data in SQLite without any embeddings / vector search
- Requires zero compilation, zero API keys, zero model downloads

This is NOT the real OpenViking — it is a shim that lets Chimera use
OpenViking's session/memory paradigm without needing the full Rust/C++
stack and embedding models.

Start:
    python openviking_shim_server.py --port 1933

Upstream reference:
    https://github.com/volcengine/OpenViking
"""

import argparse
import json
import sqlite3
import sys
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "qvac"))

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uvicorn

DB_PATH = Path(__file__).resolve().parents[2] / "llmwiki-data" / "openviking_shim.db"


def _init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            created_at TEXT,
            updated_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            role TEXT,
            content TEXT,
            created_at TEXT,
            FOREIGN KEY(session_id) REFERENCES sessions(id)
        )
    """)
    conn.commit()
    conn.close()


def _get_conn():
    return sqlite3.connect(str(DB_PATH), check_same_thread=False)


@asynccontextmanager
async def lifespan(app: FastAPI):
    _init_db()
    yield


app = FastAPI(title="OpenViking Shim", version="0.1.0", lifespan=lifespan)


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/api/v1/sessions")
async def list_sessions():
    conn = _get_conn()
    rows = conn.execute(
        "SELECT id, created_at, updated_at FROM sessions ORDER BY updated_at DESC"
    ).fetchall()
    conn.close()
    return {"result": [{"id": r[0], "created_at": r[1], "updated_at": r[2]} for r in rows]}


@app.post("/api/v1/sessions")
async def create_session(request: Request):
    body = await request.json()
    session_id = body.get("session_id", f"sess-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}")
    now = datetime.now(timezone.utc).isoformat()
    conn = _get_conn()
    conn.execute(
        "INSERT OR IGNORE INTO sessions (id, created_at, updated_at) VALUES (?, ?, ?)",
        (session_id, now, now),
    )
    conn.commit()
    conn.close()
    return {"result": {"id": session_id, "created_at": now, "updated_at": now}}


@app.get("/api/v1/sessions/{session_id}")
async def get_session(session_id: str):
    conn = _get_conn()
    row = conn.execute(
        "SELECT id, created_at, updated_at FROM sessions WHERE id = ?", (session_id,)
    ).fetchone()
    conn.close()
    if not row:
        return JSONResponse(status_code=404, content={"error": "Session not found"})
    return {"result": {"id": row[0], "created_at": row[1], "updated_at": row[2]}}


@app.get("/api/v1/sessions/{session_id}/context")
async def get_session_context(session_id: str, token_budget: int = 128_000):
    conn = _get_conn()
    rows = conn.execute(
        "SELECT role, content, created_at FROM messages WHERE session_id = ? ORDER BY created_at ASC",
        (session_id,),
    ).fetchall()
    conn.close()

    messages = []
    total_chars = 0
    for role, content, created_at in rows:
        msg = {"role": role, "content": content, "created_at": created_at}
        messages.append(msg)
        total_chars += len(content)
        # Rough token budget check (1 token ≈ 4 chars)
        if total_chars > token_budget * 4:
            break

    return {
        "result": {
            "session_id": session_id,
            "messages": messages,
            "message_count": len(messages),
            "token_budget": token_budget,
        }
    }


@app.post("/api/v1/sessions/{session_id}/messages")
async def add_message(session_id: str, request: Request):
    body = await request.json()
    role = body.get("role", "user")
    content = body.get("content", "")
    parts = body.get("parts")

    # If parts provided, convert to simple text
    if parts and not content:
        content = "\n".join(p.get("text", "") for p in parts if p.get("type") == "text")

    now = datetime.now(timezone.utc).isoformat()
    conn = _get_conn()
    # Ensure session exists
    conn.execute(
        "INSERT OR IGNORE INTO sessions (id, created_at, updated_at) VALUES (?, ?, ?)",
        (session_id, now, now),
    )
    conn.execute(
        "INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)",
        (session_id, role, content, now),
    )
    conn.execute("UPDATE sessions SET updated_at = ? WHERE id = ?", (now, session_id))
    conn.commit()
    conn.close()
    return {"result": {"session_id": session_id, "role": role, "content": content, "created_at": now}}


@app.delete("/api/v1/sessions/{session_id}")
async def delete_session(session_id: str):
    conn = _get_conn()
    conn.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
    conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    conn.commit()
    conn.close()
    return {"result": {"deleted": True}}


@app.get("/api/v1/sessions/{session_id}/messages")
async def list_messages(session_id: str):
    conn = _get_conn()
    rows = conn.execute(
        "SELECT role, content, created_at FROM messages WHERE session_id = ? ORDER BY created_at ASC",
        (session_id,),
    ).fetchall()
    conn.close()
    return {
        "result": [
            {"role": r[0], "content": r[1], "created_at": r[2]} for r in rows
        ]
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=1933)
    args = parser.parse_args()
    uvicorn.run(app, host=args.host, port=args.port, log_level="info")
