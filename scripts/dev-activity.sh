#!/usr/bin/env bash
# dev-activity.sh -- macOS twin of dev-activity.ps1. Rank DEV repos by how much they
# are actually WORKED. Read-only: touches no path, moves nothing, writes nothing.
#
# Signal is DISTINCT COMMIT DAYS, not recency. Recency is fooled by a bulk migration:
# on 2026-09-09, 43 repos got one commit each and all then looked "recently active".
#
# An earlier plan to move dormant repos into DEV/_archive was dropped because it would
# break three things: harvest-dev-docs reads <dir>/docs/*.md without recursing (archived
# repos drop out of the memsearch index silently); KeystoneOS data files hold DEV paths;
# and Tier A project memory is slug-keyed by absolute path, so moving a repo orphans it.
#
# Usage: dev-activity.sh [days] [active-threshold]
set -uo pipefail
DAYS="${1:-90}"
ACTIVE="${2:-5}"

DEV="$HOME/DEV"
[ -d "$DEV" ] || DEV="$HOME/Desktop/DEV"   # not keyed on KeystoneOS: repos move into Areas (plan Task 4)

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

for root in "$DEV" "$DEV/Football" "$DEV/SpecialRequests" "$DEV/Personal" "$DEV/Program" "$DEV/Research" "$DEV/Performance" "$DEV/Platform"; do   # Areas: plan Task 4
  [ -d "$root" ] || continue
  for p in "$root"/*/; do
    [ -e "$p/.git" ] || continue   # a worktree has a .git file, not a folder
    name="$(basename "$p")"
    case "$name" in .*|_*|*_OLD_merged*) continue ;; esac
    d=$(git -C "$p" log --since="$DAYS days ago" --format=%ad --date=short 2>/dev/null | sort -u | wc -l | tr -d ' ')
    c=$(git -C "$p" log --since="$DAYS days ago" --oneline 2>/dev/null | wc -l | tr -d ' ')
    l=$(git -C "$p" log -1 --format=%ad --date=short 2>/dev/null)
    printf '%s\t%s\t%s\t%s\n' "$d" "$name" "$c" "$l" >> "$tmp"
  done
done

total=$(wc -l < "$tmp" | tr -d ' ')
echo "=== DEV activity: $total repos, ${DAYS}-day window, active = ${ACTIVE}+ commit days ==="
echo
echo "ACTIVE:"
awk -F'\t' -v a="$ACTIVE" '$1 >= a' "$tmp" | sort -t$'\t' -k1,1nr |
  awk -F'\t' '{ printf "  %-40s %3s days  %4s commits  last %s\n", $2, $1, $3, $4 }'
echo
dormant=$(awk -F'\t' -v a="$ACTIVE" '$1 < a' "$tmp" | wc -l | tr -d ' ')
echo "DORMANT: $dormant repos with fewer than $ACTIVE commit days."
echo "  They stay exactly where they are and on GitHub. Nothing is archived or moved."
