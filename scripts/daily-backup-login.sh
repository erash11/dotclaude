#!/bin/bash
# Gate for daily-backup.ps1. Both launchd jobs call it:
#   com.keystone.dailybackup        hourly 12:00-17:00, so a failed try gets another chance
#   com.keystone.dailybackup-login  at login, so a Mac that was off still gets a backup
# Runs the backup only when: no run ended OK today, the Mac is on AC power, no backup is
# running, and fewer than 2 real runs started today (a lasting error must not run 6 times).
# Why daytime + AC: every 21:00 run from 10-13 to 10-22 ended ERROR because the Mac slept
# on battery, and caffeinate -s only holds sleep off on AC (audit 2026-10-22).
# shortcut: checks the log, not a lock file; two runs at the same moment could both start.
LOG="${BACKUP_LOG:-$HOME/.claude/scripts/logs/daily-backup.log}"
TODAY=$(date +%Y-%m-%d)
skip() { echo "$(date '+%F %T') gate skip: $1"; exit 0; }
# A dry run also logs "daily-backup end: OK", so an OK counts only when its run started DryRun=False.
# The start may be yesterday (a run crossing midnight), so every start line sets the flag.
# shortcut: pairs each end with the latest start, so a dry run started during a real run hides
# that real OK and the gate may run once more (capped at 2 tries); end lines carry no run id.
real_ok_today() {
  awk -v d="$TODAY" '/daily-backup start/ {real = /DryRun=False/}
                     $1==d && /daily-backup end: OK/ && real {found=1}
                     END {exit !found}' "$LOG" 2>/dev/null
}
# Sourced (by test_backup_gate.sh): define the function only, run nothing.
[[ "${BASH_SOURCE[0]}" != "$0" ]] && return 0

real_ok_today && skip "already OK today"
pmset -g ps | grep -q "AC Power" || skip "on battery"
# [.] keeps the pattern from matching any shell whose command line merely mentions the script
pgrep -f "pwsh.*daily-backup[.]ps1" >/dev/null && skip "a backup is already running"
STARTS=$(grep -c "^$TODAY .*daily-backup start (DryRun=False)" "$LOG" 2>/dev/null)
[ "${STARTS:-0}" -ge 2 ] && skip "2 tries already today"

exec /usr/bin/caffeinate -i -s /opt/homebrew/bin/pwsh -NoProfile -File "$HOME/.claude/scripts/daily-backup.ps1"
