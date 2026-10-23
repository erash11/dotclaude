#!/bin/bash
# Launcher for com.keystone.clouddrivepush (07:00, 17:30). launchd runs `open -g -a Terminal` on this
# file, so cloud-push.py runs with Terminal's Google Drive access.
# Why: run straight from launchd, macOS lets a job create new Drive files but blocks listing Drive
# folders and opening files another app made (each file's com.apple.macl list names Terminal).
# rsync lists the destination, so every scheduled run failed "Operation not permitted" (tested 2026-10-23).
/usr/bin/caffeinate -i /usr/bin/python3 "$HOME/.claude/scripts/cloud-push.py" \
    >> "$HOME/.claude/scripts/logs/cloud-push.out" 2>> "$HOME/.claude/scripts/logs/cloud-push.err"
exit 0
