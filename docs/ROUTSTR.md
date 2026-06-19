# Routstr Network Integration

## Overview

Routstr is a decentralized AI inference router that uses **Nostr** for censorship-resistant discovery and **Cashu / Bitcoin Lightning** for private, instant payments.

As a Routstr provider, your Chimera node:
1. Connects to upstream AI providers (OpenAI, Anthropic, etc.)
2. Accepts Bitcoin payments via Cashu eCash
3. Serves AI requests to clients on the network

## Where Your Node Appears

Your node announces itself on Nostr relays. Clients discover it there.

- **Routstr frontend:** https://routstr.com
- **Dashboard (local):** http://localhost:8000
- **Nostr relays:** wss://relay.damus.io, wss://relay.nostr.band, wss://nos.lol

## Setup Steps

### Step 1 — Prerequisites

- Docker + Docker Compose installed
- At least one upstream AI provider API key (OpenAI, Anthropic, OpenRouter, etc.)
- A Lightning address for receiving payouts (e.g. Wallet of Satoshi, Alby, etc.)

### Step 2 — Configure

Edit `~/.routstr/.env` (auto-created on first init):

```bash
# Lightning payout address (required to earn)
RECEIVE_LN_ADDRESS=yourname@walletofsatoshi.com

# Upstream AI provider (add at least one)
OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=...
# OPENROUTER_API_KEY=...
```

### Step 3 — Start Chimera Node

```bash
cd qvac && node src/index.js
```

The `RoutstrMiner` will:
1. Create `~/.routstr/.env` with your Nostr identity
2. Pull the latest Routstr Docker image
3. Start the container on port 8000
4. Wait for the API to be ready

### Step 4 — Configure via Dashboard

Open http://localhost:8000 and log in with the admin password from `.env`.

In the dashboard:
- Connect upstream AI providers
- Set your profit margin
- Verify Nostr relay announcements

### Step 5 — Start Earning

Once configured, your node appears in Nostr relay discovery. Clients find you and pay via Cashu / Lightning.

## Architecture

```
[Client] ──Nostr──> [Routstr Node :8000] ──HTTP──> [OpenAI / Anthropic / etc.]
                             │
                             └── Cashu / Lightning payments
```

Chimera manages the Routstr container lifecycle via `docker compose`.

## API Reference

| Endpoint | Description |
|---|---|
| `GET /v1/info` | Node info and status |
| `GET /v1/models` | Available models |
| `POST /v1/chat/completions` | Chat completion proxy |
| `GET /admin/api/settings` | Admin settings (requires auth) |
| `PATCH /admin/api/settings` | Update settings |

## Troubleshooting

| Issue | Fix |
|---|---|
| `docker not available` | Install Docker Desktop or Docker Engine |
| `Compose dir missing` | Ensure `routstr/docker-compose.yml` exists |
| `No upstream providers` | Add `OPENAI_API_KEY` or similar to `.env` |
| `No earnings` | Set `RECEIVE_LN_ADDRESS` for Lightning payouts |
| `Not in discovery` | Check Nostr relay connections in dashboard |

## Config Fields

```json
"routstr": {
  "enabled": true,
  "config": {
    "nsec": "nsec1...",           // Nostr private key
    "npub": "npub1...",           // Nostr public key
    "name": "My Node",
    "description": "...",
    "receiveLnAddress": "...",     // Lightning address for payouts
    "adminPassword": "...",
    "apiPort": 8000
  }
}
```
