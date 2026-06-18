#!/bin/bash
# Deploy QVAC Chimera via Docker
set -e

REPO_URL="https://github.com/TerexitariusStomp/qvac-chimera.git"
DEPLOY_DIR="$HOME/qvac-chimera"

echo "=== Chimera Docker Deploy ==="

# Install Docker if not present
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $(whoami)
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
  echo "Installing Docker Compose..."
  sudo apt-get update && sudo apt-get install -y docker-compose-plugin
fi

# Clone or pull repo
if [ -d "$DEPLOY_DIR" ]; then
  echo "Pulling latest..."
  cd "$DEPLOY_DIR" && git pull origin main
else
  echo "Cloning repo..."
  git clone "$REPO_URL" "$DEPLOY_DIR"
fi

cd "$DEPLOY_DIR/qvac"

# Build and start
docker-compose down 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

echo "=== Deploy Complete ==="
echo "Wiki: http://$(hostname -I | awk '{print $1}'):3002"
echo "Logs: docker-compose logs -f"
