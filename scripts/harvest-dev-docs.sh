#!/usr/bin/env bash
# harvest-dev-docs.sh -- copy every DEV repo's docs/*.md (STATUS, context, handoffs) into
# ~/.claude/global-memory/dev-docs/<repo>/ so memsearch indexes what Cowork, Codex and Claude Code write into repos.
# Mac twin of harvest-dev-docs.ps1. Run by /closeout and daily-backup (launchd).
#
# A true mirror (2026-10-24): rsync --delete, and a folder whose repo is no longer harvested
# is parked in ~/_PARKED_COPIES/ (not ~/.Trash: launchd-run bash may not write there).
# Archived repos stay searchable under dev-docs/_ARCHIVE/<repo>.
# Never mirrored: local-only repos (CLAUDE.md says "local only"), health and confidential
# folders. recall output lands in committed session transcripts, so these stay out of the index.
set -e
if [ -d "$HOME/DEV/KeystoneOS" ]; then DEV="$HOME/DEV"; else DEV="$HOME/Desktop/DEV"; fi
OUT="$HOME/.claude/global-memory/dev-docs"
PARK="$HOME/_PARKED_COPIES/dev-docs-orphans-$(date +%F)"
mkdir -p "$OUT"
n=0
seen="|_ARCHIVE|"

skip() {  # $1 = repo dir, $2 = name
  case "$2" in
    _DRIVE|_tools|_ARCHIVE|_INBOX|.claude|graphify-out|docs) return 0;;
    *Linda_Projects|*"Linda Projects"|SpecialRequests*|TOS_*|*DexaProject*) return 0;;
    *Wilhelm_Brody_RTP*|*Zinnecker_Skylar*) return 0;;   # named-athlete case reviews
  esac
  grep -qis 'local only' "$1/CLAUDE.md" && return 0
  [ -d "$1/docs" ] || return 0
  return 1
}

mirror() {  # $1 = source docs dir, $2 = destination
  mkdir -p "$2"
  rsync -a --delete --exclude='node_modules' --exclude='.venv' \
    --include='*/' --include='*.md' --exclude='*' "$1/" "$2/"
}

for r in "$DEV"/*/ "$DEV"/Football/*/; do
  [ -d "$r" ] || continue
  r=${r%/}; name=$(basename "$r")
  skip "$r" "$name" && continue
  case "$seen" in *"|$name|"*) echo "harvest: duplicate $name skipped" >&2; continue;; esac
  seen="$seen$name|"
  mirror "$r/docs" "$OUT/$name"
  n=$((n+1))
done

a=0
aseen="|"
for r in "$DEV"/_ARCHIVE/*/; do
  [ -d "$r" ] || continue
  r=${r%/}; name=$(basename "$r")
  skip "$r" "$name" && continue
  aseen="$aseen$name|"
  mirror "$r/docs" "$OUT/_ARCHIVE/$name"
  a=$((a+1))
done

# Park folders whose repo is no longer harvested (archived, gone, or now skipped).
p=0
for d in "$OUT"/*/ "$OUT"/_ARCHIVE/*/; do
  [ -d "$d" ] || continue
  d=${d%/}; b=$(basename "$d")
  case "$d" in
    "$OUT/_ARCHIVE/"*) case "$aseen" in *"|$b|"*) continue;; esac; dest="$PARK/_ARCHIVE";;
    *) case "$seen" in *"|$b|"*) continue;; esac; dest="$PARK";;
  esac
  mkdir -p "$dest" && mv "$d" "$dest/" && p=$((p+1)) || echo "harvest: could not park $b" >&2
done

echo "harvested docs from $n repos and $a archived repos into $OUT; parked $p"
