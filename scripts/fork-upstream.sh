#!/usr/bin/env bash
set -euo pipefail

# Fork all tasking/mining network upstream repos into a GitHub org/user and
# repoint the local .gitmodules to those forks. This lets Localchimera track
# upstream development while keeping a stable fork for pinning builds.
#
# Usage:
#   export GITHUB_TOKEN=ghp_xxx          # or rely on `gh auth status`
#   ./scripts/fork-upstream.sh <fork-owner>
#
# Example:
#   ./scripts/fork-upstream.sh TerexitariusStomp

FORK_OWNER="${1:-}"
if [ -z "$FORK_OWNER" ]; then
  echo "Usage: $0 <fork-owner>"
  echo "Example: $0 TerexitariusStomp"
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: GitHub CLI (gh) is required. Install from https://cli.github.com/"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Error: 'gh' is not authenticated. Run 'gh auth login' first."
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GITMODULES="$REPO_ROOT/.gitmodules"

# Map submodule names to their upstream repos. Keys match [submodule "upstream/<name>"]
# Only networks that are safe on untrusted hardware are kept here.
declare -A UPSTREAMS=(
  [chutes-miner]=chutesai/chutes-miner
  [routstr-core]=routstr/routstr-core
  [btt-ai-miner]=BTT-AI-labs/miner-cli
  [golem]=golemfactory/yagna
  [anyone-protocol]=anyone-protocol/ator-protocol
  [mysterium]=mysteriumnetwork/node
  [btfs]=bittorrent/go-btfs
)

# Non-GitHub / non-forkable networks that the script should not touch
NO_FORK_NAMES=(
  "earnidle"
)

fork_repo() {
  local upstream="$1"
  local fork_url="https://github.com/$FORK_OWNER/$(basename "$upstream").git"

  echo "==> Forking $upstream into $FORK_OWNER..."
  if gh repo view "$FORK_OWNER/$(basename "$upstream")" >/dev/null 2>&1; then
    echo "    Fork already exists at $fork_url"
  else
    gh repo fork "$upstream" --remote=false --clone=false || true
  fi
}

repoint_submodule() {
  local name="$1"
  local upstream="$2"
  local fork_url="https://github.com/$FORK_OWNER/$(basename "$upstream").git"

  echo "==> Repointing upstream/$name to $fork_url"
  git -C "$REPO_ROOT" config --file=.gitmodules "submodule.upstream/$name.url" "$fork_url"
}

echo "Forking tasking network upstream repos into github.com/$FORK_OWNER..."
for name in "${!UPSTREAMS[@]}"; do
  upstream="${UPSTREAMS[$name]}"
  fork_repo "$upstream"
  repoint_submodule "$name" "$upstream"
done

echo ""
echo "Done. Forked repos now referenced in .gitmodules."
echo "Next steps:"
echo "  1. Review the changes: git diff .gitmodules"
echo "  2. Stage and commit: git add .gitmodules && git commit -m 'chore: fork tasking network upstreams into $FORK_OWNER'"
echo "  3. Re-sync submodules: git submodule sync && git submodule update --init --recursive"
echo ""
echo "Skipped (no public GitHub repo or incompatible with untrusted hardware):"
printf '  - %s\n' "${NO_FORK_NAMES[@]}"
