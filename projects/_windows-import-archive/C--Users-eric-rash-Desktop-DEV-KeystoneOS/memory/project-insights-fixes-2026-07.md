---
name: insights-fixes-2026-07
description: "Fixes applied 2026-07-16 from the /insights report — SHELL=\"\" removed (Bash-failure hypothesis to verify), Fireflies loop hardened, permissions allowlisted"
metadata: 
  node_type: memory
  type: project
  originSessionId: ccea8971-8775-4e40-a085-45d7c614b08b
---

Applied from the 2026-07-16 /insights report (sessions 6/15–7/16):

- **Removed `"SHELL": ""` from ~/.claude/settings.json env** — suspected root cause of the recurring silent Bash failures (exit 1, empty output). Also set `defaultShell: "powershell"`. **VERIFY:** if Bash failures stop recurring, soften the "always prefer PowerShell" rule in global CLAUDE.md's Shell/Environment section.
- meeting-sync `scripts/sync.py` now passes `--limit 100000` to `transcripts find` (CLI default 100 silently truncated large backfills).
- name-meetings: all rename failures (not just rate limits) persist to `.pending-renames.json` for auto-resume; re-sync failure now reported explicitly (Fireflies = source of truth, local DB stale).
- Permissions allowlisted: Fireflies rename/read MCP calls + Edit/Write on `~/.claude/**` (previously blocked mid-task by the auto-mode classifier).
- Global CLAUDE.md gained Shell/Environment (verified binary paths) and Workflow Expectations (verify-then-create for artifacts) sections.

- **Scheduled weekly stack-doctor** (2026-07-16): Task Scheduler job `KeystoneOS-StackDoctor`, Mondays 6:40 AM, runs `weekly-check.ps1` (read-only, no headless Claude). Failures surface via `.errors.log` at session start; full output in `last-weekly-run.log`.

- **Milvus boot race diagnosed + hardened** (2026-07-16): morning scheduled sessions end before Docker Desktop starts Milvus (Docker starts at login), so session-end memsearch indexing fails transiently and self-heals on the next run. Both hooks now treat "Fail connecting to server" as transient (Node hook: streak-gated like ETIMEDOUT; codex PS hook: index-log note). Also fixed PS 5.1 `Start-Process -PassThru` null-ExitCode bug that made the codex hook log every SUCCESS to .errors.log (KeystoneOS commit 55a390e). errors.log cleared; stack-check ALL CLEAR.

Still open from the report (deliberately deferred): monthly skill regression check (ties to [[skill-audit-2026-07]] dead-weight list); render/link verify step in presentation skills.

**Why:** the report showed Bash failures and blocked approvals were the top two friction categories across ~59 sessions.
**How to apply:** in a future session, check whether Bash works normally; if yes, update CLAUDE.md guidance and mark the SHELL hypothesis confirmed here.
