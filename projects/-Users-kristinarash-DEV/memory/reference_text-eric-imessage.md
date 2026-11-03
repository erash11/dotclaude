---
name: text-eric-imessage
description: "Text Eric via iMessage (~/.claude/scripts/text-eric.sh); standing rule since 2026-11-01: text him whenever a long run finishes or fails"
metadata:
  node_type: memory
  type: reference
  originSessionId: 2d5c93b0-f48c-48ce-a2fc-59cc2f50d48a
  modified: 2026-11-03T18:19:53.632Z
---

Claude can text Eric's iPhone with ~/.claude/scripts/text-eric.sh "message". It sends an iMessage through the Mac's Messages app; the phone number is stored in the macOS Keychain (item text-eric-number). Set up and tested 2026-10-31. The script signs every text with a leading "From Claude: " (Eric asked 2026-10-31 so he knows it is from Claude); do not add a second signature.

**Why:** Eric asked 2026-10-31 for a way for Claude to text him; Messages on the Mac sends iMessage, no new accounts. On 2026-11-01, after asking for a text on three long runs in a row, he made it standing: "when ever you finish a long run on something you text me when your complete".

**How to apply:** Run ~/.claude/scripts/text-eric.sh "<one line>" (Mac only; number in Keychain item text-eric-number, never write it to a synced file). **Standing rule (Eric, 2026-11-01): text him unasked whenever a long run finishes** (a job of about 30+ minutes, or any background or launchd job he is waiting on), and also when one fails. Send it after the result is verified and saved (not when the job merely exits), one line, lead with what to act on or "no action needed". Other texts only when he asks. See [[long-jobs-in-terminal]]. Exit 0 means Messages accepted it, not proof of delivery.

**If it fails with "AppleEvent timed out (-1712)"** (2026-11-03, Messages open 3+ h, no dialog on screen): restart Messages yourself (`osascript -e 'tell application "Messages" to quit'`, then `open -a Messages`), then resend. That fixed it. Do not ask Eric to look for a pop-up. Separate quirk, harmless: on macOS 27.2, asking some accounts for `service type` one by one gives -10000; the script's `whose` lookup still works.
