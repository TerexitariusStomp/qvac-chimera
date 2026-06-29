#!/usr/bin/env bash
set -euo pipefail
#
# setup-btfs.sh — Walletless BTFS storage node setup for Localchimera
#
# This node pins and serves storage jobs assigned via the Casper escrow contract.
# It does NOT enable storage-host mode or airdrops, so no BTT wallet is required
# on the untrusted machine. The only key material is the libp2p peer identity.
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BTFS_BIN="$PROJECT_ROOT/upstream/btfs/btfs"
BTFS_REPO="${HOME}/.btfs-chimera"
STORAGE_PATH="${BTFS_STORAGE_PATH:-${HOME}/btfs-chimera-storage}"
STORAGE_MAX="${BTFS_STORAGE_MAX:-100GB}"

if [[ ! -f "$BTFS_BIN" ]]; then
  echo "ERROR: BTFS binary not found at $BTFS_BIN"
  echo "Build it first: cd upstream/btfs && go build -o btfs ./cmd/btfs"
  exit 1
fi

echo "=== BTFS Walletless Storage Node Setup ==="
echo "Repo:     $BTFS_REPO"
echo "Storage:  $STORAGE_PATH ($STORAGE_MAX)"
echo ""

# 1. Initialize BTFS repo if not already present
if [[ ! -d "$BTFS_REPO" ]]; then
  echo "[1/5] Initializing BTFS repo..."
  mkdir -p "$BTFS_REPO"
  BTFS_PATH="$BTFS_REPO" "$BTFS_BIN" init --profile=server
else
  echo "[1/5] BTFS repo already exists — skipping init"
fi

# 2. Configure storage settings (storage-host mode disabled for walletless operation)
echo "[2/5] Configuring walletless storage settings..."
mkdir -p "$STORAGE_PATH"

BTFS_PATH="$BTFS_REPO" "$BTFS_BIN" config --json StorageMax '"'$STORAGE_MAX'"'
BTFS_PATH="$BTFS_REPO" "$BTFS_BIN" config --json Experimental.StorageHostEnabled false

# 3. Disable airdrops (no BTT wallet on device)
echo "[3/5] Disabling airdrops (walletless mode)..."
BTFS_PATH="$BTFS_REPO" "$BTFS_BIN" config --json Experimental.AirdropEnabled false

# 4. Set API and gateway ports
echo "[4/5] Configuring API ports..."
BTFS_PATH="$BTFS_REPO" "$BTFS_BIN" config Addresses.API /ip4/127.0.0.1/tcp/5001
BTFS_PATH="$BTFS_REPO" "$BTFS_BIN" config Addresses.Gateway /ip4/127.0.0.1/tcp/8080

# 5. Create systemd service file for auto-start
echo "[5/5] Creating systemd service..."
cat > "${HOME}/.config/systemd/user/btfs.service" <<EOF
[Unit]
Description=BTFS Storage Node
After=network.target

[Service]
Type=simple
Environment=BTFS_PATH=${BTFS_REPO}
ExecStart=${BTFS_BIN} daemon --enable-storage-host=false --storage-max ${STORAGE_MAX}
Restart=on-failure
RestartSec=10

[Install]
WantedBy=default.target
EOF

mkdir -p "${HOME}/.config/systemd/user"
echo "Systemd service created at ~/.config/systemd/user/btfs.service"
echo ""

echo "=== Setup Complete ==="
echo ""
echo "This node runs in walletless mode. It only accepts jobs assigned through the"
echo "Casper escrow contract. No BTT wallet is required on the device."
echo ""
echo "Next steps:"
echo "  1. Forward port 4001/TCP for P2P connectivity"
echo "  2. Start the node:  BTFS_PATH=${BTFS_REPO} ${BTFS_BIN} daemon --enable-storage-host=false"
echo "  3. Or use systemd:    systemctl --user enable --now btfs"
echo ""
echo "API: http://127.0.0.1:5001"
