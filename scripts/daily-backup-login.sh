#!/bin/bash
# Runs daily-backup.ps1 once at login, so a Mac that was off overnight still gets a backup.
# Skips if any daily-backup run already ended today (the nightly run or an earlier login run).
# shortcut: checks the log, not a lock file; two runs at the same moment could both start.
LOG="$HOME/.claude/scripts/logs/daily-backup.log"
TODAY=$(date +%Y-%m-%d)
if grep -q "^$TODAY .*daily-backup end:" "$LOG" 2>/dev/null; then
  exit 0
fi
exec /usr/bin/caffeinate -i -s /opt/homebrew/bin/pwsh -NoProfile -File "$HOME/.claude/scripts/daily-backup.ps1"
