#!/usr/bin/env bash
# harvest-dev-docs.sh -- copy every DEV repo's docs/*.md (STATUS, context, handoffs) into
# ~/.claude/global-memory/dev-docs/<repo>/ so memsearch indexes what Cowork, Codex and Claude Code write into repos.
# Mac twin of harvest-dev-docs.ps1. Run by /closeout and (optionally) a launchd/cron job.
set -e
if [ -d "$HOME/DEV/KeystoneOS" ]; then DEV="$HOME/DEV"; else DEV="$HOME/Desktop/DEV"; fi
OUT="$HOME/.claude/global-memory/dev-docs"
mkdir -p "$OUT"
n=0
for r in "$DEV"/*/ "$DEV"/Football/*/ "$DEV"/SpecialRequests/*/; do
  [ -d "$r" ] || continue
  name=$(basename "$r")
  case "$name" in _DRIVE|_tools|.claude|graphify-out) continue;; esac
  [ -d "$r/docs" ] || continue
  mkdir -p "$OUT/$name"
  rsync -a --include='*/' --include='*.md' --exclude='*' --exclude='node_modules' --exclude='.venv' "$r/docs/" "$OUT/$name/"
  n=$((n+1))
done
echo "harvested docs from $n repos into $OUT"
