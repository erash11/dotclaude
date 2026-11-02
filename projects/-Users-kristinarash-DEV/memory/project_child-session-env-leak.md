---
name: child-session-env-leak
description: "A Claude session started from inside another (open -a Terminal/Ghostty, a .command) inherits CLAUDE_CODE_SESSION_ID and CHILD_SESSION and saves no transcript"
metadata:
  node_type: memory
  type: project
  originSessionId: 9ee722ce-6e25-464c-9f15-e1302baabe2a
  modified: 2026-11-02T19:19:40.476Z
---

A Claude session opened from inside another Claude session inherits the parent's CLAUDE_* variables and saves no transcript of its own.

**Why:** 2026-11-02: the AIOS audit session 15d95b4f was opened by the main session via open -a Terminal; Terminal was not running, so it copied the parent's environment (same CLAUDE_CODE_SESSION_ID, CLAUDE_JOB_DIR, CLAUDE_CODE_CHILD_SESSION). It wrote only a subagent file, no main .jsonl, and transcript-capture.js logged 'transcript_path does not exist' 3 times. Likely also the 2026-10-23 'hidden sessions' bursts (DEV/docs/handoffs/2026-10-23-audit-followup.md), whose source was never found. Confirmed the same day: the clean-env rerun (13:03, no CLAUDE_* vars) saved its transcript (KeystoneOS 516a6136). `claude -p` with the same leaked vars still saves one (tested), so only interactive sessions are hit. Project folders with no .jsonl at all are normal: Claude Code deletes transcripts after 30 days (KeystoneOS 09-12 -> 10-12).

**How to apply:** Start new sessions with ~/.claude/scripts/new-session.sh <dir> <cmd> (strips CLAUDE* and CODEX_COMPANION_* only; tested 18 -> 0). Never env -i (it deletes the gws login, see [[gws-cli-default]]). An app first launched by such an open keeps the leaked environment until it quits, and every new tab inherits it (Terminal opens tabs with `login -pf`; `-p` keeps the environment). Seen 2026-11-02: session 0c8c7095, a `claude` started at 12:56 in a new tab of the leaked Terminal (launched 12:37), also saved no transcript. Quit Terminal/Ghostty after.
