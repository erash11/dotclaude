#!/bin/bash
# test_backup_gate.sh - offline test for the "already OK today" check in daily-backup-login.sh.
# Sources the gate (which then defines real_ok_today and returns without running a backup).
# Run: bash ~/.claude/scripts/test_backup_gate.sh     (exit 0 = all checks pass)
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
export BACKUP_LOG="$T/log"
source "$HOME/.claude/scripts/daily-backup-login.sh"
TODAY=2026-10-30
fails=0
check() { if [ "$2" = "$3" ]; then echo "PASS $1"; else echo "FAIL $1 (got $2, want $3)"; fails=$((fails+1)); fi; }
run() { printf '%s\n' "$@" > "$BACKUP_LOG"; real_ok_today && echo yes || echo no; }

check 'real run ended OK -> skip' "$(run \
  '2026-10-30 12:00:06 ===== daily-backup start (DryRun=False) run=1 =====' \
  '2026-10-30 12:11:25 ===== daily-backup end: OK (0 errors) =====')" yes
check 'only a dry run ended OK -> run' "$(run \
  '2026-10-30 12:00:06 ===== daily-backup start (DryRun=False) run=1 =====' \
  '2026-10-30 12:11:25 ===== daily-backup end: ERROR (1 errors) =====' \
  '2026-10-30 15:35:59 ===== daily-backup start (DryRun=True) run=2 =====' \
  '2026-10-30 15:36:20 ===== daily-backup end: OK (0 errors) =====')" no
check 'dry run then real OK -> skip' "$(run \
  '2026-10-30 09:00:00 ===== daily-backup start (DryRun=True) run=1 =====' \
  '2026-10-30 09:00:20 ===== daily-backup end: OK (0 errors) =====' \
  '2026-10-30 12:00:06 ===== daily-backup start (DryRun=False) run=2 =====' \
  '2026-10-30 12:11:25 ===== daily-backup end: OK (0 errors) =====')" yes
check 'real OK yesterday only -> run' "$(run \
  '2026-10-29 12:00:06 ===== daily-backup start (DryRun=False) run=1 =====' \
  '2026-10-29 12:11:25 ===== daily-backup end: OK (0 errors) =====')" no
check 'real run crossing midnight ended OK today -> skip' "$(run \
  '2026-10-29 23:50:00 ===== daily-backup start (DryRun=False) run=1 =====' \
  '2026-10-30 00:05:00 ===== daily-backup end: OK (0 errors) =====')" yes
check 'dry run crossing midnight ended OK today -> run' "$(run \
  '2026-10-29 23:50:00 ===== daily-backup start (DryRun=True) run=1 =====' \
  '2026-10-30 00:05:00 ===== daily-backup end: OK (0 errors) =====')" no
check 'no log -> run' "$(rm -f "$BACKUP_LOG"; real_ok_today && echo yes || echo no)" no
exit $fails
