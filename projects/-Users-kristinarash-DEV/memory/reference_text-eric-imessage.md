---
name: text-eric-imessage
description: "Text Eric's phone via iMessage from the Mac: ~/.claude/scripts/text-eric.sh"
metadata:
  type: reference
---

Claude can text Eric's iPhone with ~/.claude/scripts/text-eric.sh "message". It sends an iMessage through the Mac's Messages app; the phone number is stored in the macOS Keychain (item text-eric-number). Set up and tested 2026-10-31.

**Why:** Eric asked 2026-10-31 for a way for Claude to text him; Messages on the Mac sends iMessage, no new accounts

**How to apply:** Run ~/.claude/scripts/text-eric.sh "<one line>" (Mac only; number in Keychain item text-eric-number, never write it to a synced file). Text only when he asked, or when something he is waiting on finished and he is likely away; one line, lead with what to act on. Exit 0 means Messages accepted it, not proof of delivery.
