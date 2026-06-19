#!/usr/bin/env bash
# Start the OpenViking Shim Server for Chimera
#
# This is a lightweight drop-in for the full OpenViking server.
# It implements the same HTTP API (sessions, messages, context) but
# stores data in SQLite without any embeddings / vector search.
# Zero compilation, zero API keys, zero model downloads.
#
# Usage:
#   ./scripts/start-openviking-shim.sh
#   ./scripts/start-openviking-shim.sh --port 1933 --host 127.0.0.1

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SHIM="$PROJECT_ROOT/qvac/src/llmwiki/openviking_shim_server.py"

HOST="127.0.0.1"
PORT="1933"

while [[ $# -gt 0 ]]; do
  case $1 in
    --host) HOST="$2"; shift 2 ;;
    --port) PORT="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

echo "[openviking-shim] Starting on $HOST:$PORT ..."
echo "[openviking-shim] Database: $PROJECT_ROOT/qvac/llmwiki-data/openviking_shim.db"

# Ensure the database directory exists
mkdir -p "$PROJECT_ROOT/qvac/llmwiki-data"

# Kill any existing shim on the same port
if command -v lsof >/dev/null 2>&1; then
  PID=$(lsof -ti :$PORT 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo "[openviking-shim] Stopping existing process on port $PID"
    kill "$PID" 2>/dev/null || true
    sleep 1
  fi
fi

# Start the shim server in the background
nohup python3 "$SHIM" --host "$HOST" --port "$PORT" \
  > "$PROJECT_ROOT/qvac/llmwiki-data/openviking_shim.log" 2>&1 &

SHIM_PID=$!
echo "[openviking-shim] PID: $SHIM_PID"

# Wait for it to be ready
for i in {1..30}; do
  if curl -fsS "http://$HOST:$PORT/health" >/dev/null 2>&1; then
    echo "[openviking-shim] Ready at http://$HOST:$PORT"
    exit 0
  fi
  sleep 0.5
done

echo "[openviking-shim] ERROR: Server did not start within 15 seconds"
exit 1
