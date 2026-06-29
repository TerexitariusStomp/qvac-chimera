#!/usr/bin/env bash
set -euo pipefail

# update-tasking-forks.sh — Pull the latest upstream commits into the forked tasking-network submodules.
#
# Usage:
#   ./scripts/update-tasking-forks.sh           # update all tasking submodules
#   ./scripts/update-tasking-forks.sh --dry-run # show what would be updated
#
# After running, review the submodule refs and commit them:
#   git add upstream/ && git commit -m "chore: bump tasking network forks"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

SUBMODULES=(
  upstream/chutes-miner
  upstream/routstr-core
  upstream/btt-ai-miner
  upstream/golem
  upstream/anyone-protocol
  upstream/mysterium
  upstream/btfs
)

DRY_RUN=false
if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN=true
fi

log() { echo "[update-tasking-forks] $*"; }

if [ "$DRY_RUN" = true ]; then
  log "Dry-run: would update the following submodules to their latest upstream commits:"
  printf '  - %s\n' "${SUBMODULES[@]}"
  exit 0
fi

log "Updating tasking network forks..."
for sm in "${SUBMODULES[@]}"; do
  log "--- $sm ---"
  git -C "$ROOT_DIR" submodule update --remote --merge "$sm" || true
done

log "Done. Review the submodule refs and then commit with:"
log "  git add upstream/ && git commit -m \"chore: bump tasking network forks\""
