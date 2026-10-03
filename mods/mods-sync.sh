#!/usr/bin/env bash
# mods-sync.sh (Mac): load every mod in ~/.claude/mods, nothing hand-listed.
#
# Same rules as mods-sync.ps1: a mod loads when it has .claude-plugin/plugin.json, has no
# .disabled file, and passes `claude plugin validate`. The list is written to
# ~/.claude/mods/.loadlist (gitignored, per machine), which ~/.zshrc reads:
#
#   [ -f ~/.claude/mods/.loadlist ] && export CLAUDE_CODE_PLUGIN_DIRS="$(cat ~/.claude/mods/.loadlist)"
#
#   bash ~/.claude/mods/mods-sync.sh              # validate and write .loadlist
#   bash ~/.claude/mods/mods-sync.sh --no-validate
# no `set -u`: macOS bash 3.2 errors on empty arrays under it
root="$HOME/.claude/mods"
validate=1; [ "${1:-}" = "--no-validate" ] && validate=0
loaded=(); disabled=(); invalid=()
for dir in "$root"/*/; do
  dir="${dir%/}"; name="$(basename "$dir")"
  [ -f "$dir/.claude-plugin/plugin.json" ] || continue
  if [ -e "$dir/.disabled" ]; then disabled+=("$name"); continue; fi
  if [ $validate -eq 1 ] && ! claude plugin validate "$dir" >/dev/null 2>&1; then invalid+=("$name"); continue; fi
  loaded+=("$dir")
done

value="$(IFS=:; echo "${loaded[*]:-}")"
before="$(cat "$root/.loadlist" 2>/dev/null || true)"
[ "$before" != "$value" ] && printf '%s' "$value" > "$root/.loadlist"

line="mods: ${#loaded[@]} loaded, ${#disabled[@]} disabled, ${#invalid[@]} invalid"
[ ${#disabled[@]} -gt 0 ] && line="$line | disabled: $(IFS=,; echo "${disabled[*]}")"
[ ${#invalid[@]} -gt 0 ] && line="$line | INVALID (not loaded; run claude plugin validate): $(IFS=,; echo "${invalid[*]}")"
[ "$before" != "$value" ] && line="$line | changed: open a new shell and restart Claude Code"
echo "$line"
