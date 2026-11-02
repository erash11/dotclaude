#!/usr/bin/env bash
# setup-agents-symlinks.sh — one shared context file for Claude Code AND Codex.
#
# Codex reads AGENTS.md; Claude Code reads CLAUDE.md. This links the two so both
# agents work from the same brain, globally and in every project repo.
# Idempotent — safe to re-run on any machine (Mac, VPS, Linux).
#
# What it links:
#   ~/.codex/AGENTS.md      -> ~/.claude/CLAUDE.md          (global context)
#   <repo>/AGENTS.md        -> CLAUDE.md                     (per project repo)
#
# It NEVER overwrites a real (non-symlink) AGENTS.md — those are reported so you
# can merge their content into CLAUDE.md by hand first.
set -euo pipefail

link_agents() {
  local target="$1" linkpath="$2"
  if [ -e "$linkpath" ] && [ ! -L "$linkpath" ]; then
    echo "SKIP  $linkpath is a real file — merge its content into ${target##*/} first"
    return 1
  fi
  ln -sfn "$target" "$linkpath"
  echo "LINK  $linkpath -> $target"
}

# 1. Global: Codex's user-level context now IS Claude's user-level context.
mkdir -p "$HOME/.codex"
link_agents "$HOME/.claude/AGENTS.md" "$HOME/.codex/AGENTS.md" || true

# 2. Per-project: every git repo with a CLAUDE.md under the usual dev roots.
#    (Relative symlink so it works wherever the repo is cloned.)
LINKED=()
for root in "$HOME/DEV" "$HOME/projects"; do
  [ -d "$root" ] || continue
  for repo in "$root"/*/ "$root"/Personal/*/ "$root"/Program/*/ "$root"/Research/*/ "$root"/Performance/*/ "$root"/Platform/*/; do   # Areas: plan Task 4
    [ -e "$repo.git" ] && [ -f "${repo}CLAUDE.md" ] || continue   # .git file = worktree
    if (cd "$repo" && link_agents "CLAUDE.md" "AGENTS.md"); then
      LINKED+=("$repo")
    fi
  done
done
# SecondBrain lives outside DEV
if [ -d "$HOME/SecondBrain/.git" ] && [ -f "$HOME/SecondBrain/CLAUDE.md" ]; then
  (cd "$HOME/SecondBrain" && link_agents "CLAUDE.md" "AGENTS.md") \
    && LINKED+=("$HOME/SecondBrain/")
fi

# 3. Offer to commit the new symlinks in each repo (git stores symlinks portably).
if [ "${1:-}" = "--commit" ]; then
  for repo in "${LINKED[@]}"; do
    (cd "$repo" \
      && git add AGENTS.md \
      && git diff --cached --quiet AGENTS.md 2>/dev/null \
      || git commit -m "share agent context: AGENTS.md -> CLAUDE.md" -- AGENTS.md)
  done
  echo "Committed in ${#LINKED[@]} repo(s). Push each when ready."
else
  echo
  echo "Symlinks created but NOT committed. Re-run with --commit to commit them"
  echo "in each repo, or commit by hand where you want them tracked."
fi
