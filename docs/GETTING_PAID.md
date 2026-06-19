# Getting Paid for Real

This guide explains how to earn **real Bitcoin** with your Chimera node.

There are **two independent ways** to get paid:

1. **[Lightning Address](#1-lightning-address--routstr-payouts)** — Easiest. Set a Lightning address in `~/.routstr/.env` and Routstr pays you there.
2. **[Cashu Mint + Greenlight](#2-cashu-mint--greenlight-backend)** — Advanced. Run a real Cashu eCash mint backed by a hosted Lightning node.

You can use **either or both**.

---

## 1) Lightning Address — Routstr Payouts (Easiest)

This is the fastest way to start earning. Routstr collects payments from clients and sends your share to a Lightning address.

### Step 1 — Get a Lightning Address

A Lightning address looks like an email: `yourname@walletofsatoshi.com`

**Recommended wallets** (all free, instant setup):

| Wallet | Platform | Link |
|---|---|---|
| **Wallet of Satoshi** | iOS / Android | https://www.walletofsatoshi.com |
| **Alby** | Browser + Mobile | https://getalby.com |
| **Blink** | iOS / Android | https://www.blink.sv |
| **Zebedee** | iOS / Android | https://zebedee.io |

1. Download the app
2. Sign up (no KYC for small amounts)
3. Find your Lightning address in the app (usually under "Receive" or "Profile")

### Step 2 — Add it to Routstr

Edit `~/.routstr/.env`:

```bash
RECEIVE_LN_ADDRESS=yourname@walletofsatoshi.com
```

### Step 3 — Restart

```bash
cd qvac && node src/index.js
```

Routstr will now send your earnings to that address.

### How payouts work

- Clients pay Routstr via Cashu / Lightning
- Routstr deducts its fee + your configured profit margin
- Your share is sent to `RECEIVE_LN_ADDRESS` via Lightning
- You receive sats instantly (usually sub-second)

**Minimum payout:** depends on the wallet (Wallet of Satoshi ~1 sat, Alby ~1 sat)

---

## 2) Cashu Mint + Greenlight Backend (Real eCash)

This makes your Cashu mint issue **real** eCash tokens backed by actual Bitcoin. Clients can mint/redeem tokens with real sats.

### Why you need this

Without a real Lightning backend, the Cashu mint runs in `fakewallet` mode:
- Tokens have **no real value** — they're just for testing
- Clients can't actually deposit or withdraw Bitcoin

With a real backend:
- Clients deposit real sats → receive real eCash tokens
- Clients redeem eCash → receive real sats back
- You earn fees on every mint/redeem

### Step 1 — Sign up for Greenlight

Greenlight is Blockstream's **hosted Lightning service**. You get a real Lightning node without running a Bitcoin node yourself.

1. Go to https://greenlight.blockstream.com
2. Sign up / log in
3. Create a new node (or use an existing one)
4. Download your device credentials:
   - `device.crt`
   - `device-key.pem`

### Step 2 — Place credentials

```bash
cp ~/Downloads/device.crt ~/CascadeProjects/qvac-chimera/cashu/greenlight/
cp ~/Downloads/device-key.pem ~/CascadeProjects/qvac-chimera/cashu/greenlight/
```

### Step 3 — Update mint config

Edit `cashu/orchard.toml`:

```toml
[lightning]
backend = "greenlight"

[greenlight]
device_cert_path = "/app/greenlight/device.crt"
device_key_path  = "/app/greenlight/device-key.pem"
```

### Step 4 — Restart the mint

```bash
cd cashu && docker compose down && docker compose up -d
```

Wait for it to sync (~1-2 minutes for Greenlight).

### Step 5 — Verify

```bash
curl http://localhost:3338/v1/info
```

You should see the mint is online. Now any Cashu wallet connecting to `http://localhost:3338` is using **real Bitcoin**.

---

## 3) Both Together (Recommended for Production)

For the full setup:

| Layer | What it does | Real money? |
|---|---|---|
| **Routstr** | Routes AI requests, handles billing | Pays you via Lightning address |
| **Cashu mint** | Issues eCash tokens to clients | Real sats if Greenlight is configured |
| **Chimera inference** | Runs AI models locally | No external API costs |

### Full restart checklist

```bash
# 1. Start Cashu mint (with real backend)
cd cashu && docker compose up -d

# 2. Start Chimera node (starts Routstr automatically)
cd qvac && node src/index.js

# 3. Verify everything
curl http://localhost:3338/v1/info      # Cashu mint
curl http://localhost:8000/v1/info      # Routstr node
curl http://localhost:3002/api/status   # Chimera node
```

---

## Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT                                      │
│  1. Requests AI inference via Nostr / Routstr.com                 │
│  2. Pays with Cashu eCash tokens                                  │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ROUTSTR NODE (:8000)                           │
│  3. Validates Cashu payment                                         │
│  4. Proxies request to Chimera inference                            │
│  5. Collects payment, deducts margin                                │
└────────────┬──────────────────────────────┬─────────────────────────┘
             │                              │
             ▼                              ▼
┌───────────────────────┐      ┌──────────────────────────────────────┐
│   CASHU MINT (:3338)  │      │  YOUR LIGHTNING ADDRESS              │
│  6a. Mint/redeem real │      │  6b. Routstr sends your earnings     │
│      sats (if real    │      │      via Lightning                   │
│      backend)         │      │                                      │
└───────────────────────┘      └──────────────────────────────────────┘
```

---

## Quick Reference

| What | Where | To change |
|---|---|---|
| Lightning payout address | `~/.routstr/.env` → `RECEIVE_LN_ADDRESS` | Set to your wallet address |
| Cashu mint backend | `cashu/orchard.toml` → `[lightning].backend` | `fakewallet` → `greenlight` |
| Greenlight credentials | `cashu/greenlight/` | Copy `device.crt` + `device-key.pem` |
| Routstr profit margin | http://localhost:8000 (dashboard) | Admin → Pricing |
| Mint public URL | `cashu/orchard.toml` → `[mint].url` | Change when deploying publicly |

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| "No payouts received" | `RECEIVE_LN_ADDRESS` is empty | Add your Lightning address and restart |
| "Mint says test mode" | `backend = "fakewallet"` | Switch to `greenlight` and add credentials |
| "Greenlight won't start" | Missing device certs | Verify `cashu/greenlight/` has both `.crt` and `.pem` |
| "Cannot reach mint from outside" | `url` is `localhost` | Change `[mint].url` to your public IP/domain |
| "Docker volume mount error" | greenlight dir missing | `mkdir -p cashu/greenlight` |
