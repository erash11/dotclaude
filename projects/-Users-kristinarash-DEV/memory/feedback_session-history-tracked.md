---
name: session-history-tracked
description: "Eric's decision (2026-10-23, option b): session history files may be committed; the old no-history rule is retired, but tracked transcripts can hold secrets"
metadata:
  node_type: memory
  type: feedback
  modified: 2026-10-23T16:30:55.104Z
  originSessionId: 16900c66-2198-452d-ac4b-bcbcdb631977
---

Session history files **may be committed**: `~/.claude/projects/*/*.jsonl` (dotclaude repo) and
`~/.claude/global-memory/transcripts/` (global-memory repo). The daily backup (`git add -A` in
`~/.claude/scripts/daily-backup.ps1`) and `dev-sync` Step 1 (`git add -A`) keep committing them.
This retires the old "no history" rule (the 2026-10-22 closeout kept history unstaged; see
`~/DEV/docs/STATUS.md` and `~/DEV/docs/handoffs/2026-10-22-system-audit-and-fixes.md`).

**Why:** Eric chose option b on 2026-10-23, over option a (change the backup and `dev-sync` to
skip session files). Both jobs already stage history with `git add -A`.

**How to apply:** do not gitignore, untrack, skip or purge session `.jsonl` or `transcripts/`
files, and do not hold a commit back because it contains them. Tracked transcripts **can hold
secrets**: a Windows `reg query` dump in one held a GitHub PAT, `GMAIL_APP_PASSWORD` and
`FIREFLIES_API_KEY` (those were rotated 10-22). The 10-22 audit also found 17 Google
API-key-shaped strings; nobody has checked whether those are live or restricted. On 10-23 a
review agent printed the `MODEL_ROUTER_KEY` value from `~/.zshrc` into its transcript. Never paste a secret into a session. If one leaks, rotate it; do not rewrite
history without Eric. See [[backup-sync-system]].
