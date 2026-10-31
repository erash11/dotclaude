#!/bin/bash
# Text Eric's phone through the Mac's Messages app (iMessage). Mac only.
# Usage: ~/.claude/scripts/text-eric.sh "message"
# The number lives in the macOS Keychain (item text-eric-number), never in a synced file.
set -euo pipefail
msg="${1:?usage: text-eric.sh \"message\"}"
# Every text is signed at the start (Eric 2026-10-31), where the lock screen preview shows it.
case "$msg" in "From Claude:"*) ;; *) msg="From Claude: $msg" ;; esac
num="$(security find-generic-password -s text-eric-number -w)"
osascript - "$num" "$msg" <<'OSA'
on run argv
  tell application "Messages"
    set svc to 1st account whose service type = iMessage
    send (item 2 of argv) to participant (item 1 of argv) of svc
  end tell
end run
OSA
echo "sent"
