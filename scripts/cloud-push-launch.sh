#!/bin/bash
# launchd entry for com.keystone.clouddrivepush: opens cloud-push.command in Terminal (see that file for why),
# then checks that the copy started. Terminal can stall for minutes when the Mac is short on memory (seen
# 2026-10-23: queued opens ran ~5 min late); without this check a skipped run would leave no line anywhere.
LOG="$HOME/.claude/scripts/logs/cloud-push.log"
ERRORS="$HOME/.claude/global-memory/transcripts/.errors.log"
before=$(grep -c ' START ' "$LOG" 2>/dev/null)
/usr/bin/open -g -a Terminal "$HOME/.claude/scripts/cloud-push.command"
for _ in $(seq 1 18); do
    sleep 5
    [ "$(grep -c ' START ' "$LOG" 2>/dev/null)" -gt "$before" ] && exit 0
done
msg="ERROR cloud-push did not start within 90 s (Terminal did not open it; Mac busy or Terminal stuck?)"
echo "$(date +%Y-%m-%dT%H:%M:%S) $msg" >> "$LOG"
echo "[$(date -u +%Y-%m-%dT%H:%M:%S+00:00)] cloud-push: $msg" >> "$ERRORS"
exit 1
