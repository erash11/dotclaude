---
name: backup-task-sleepkill-signature
description: "DailyBackup task exit 3221225786 (0xC000013A) with a same-day clean log is benign — sleep/wake killed the multi-hour reindex, and a later retry converged"
metadata: 
  node_type: memory
  type: project
  originSessionId: 36532e34-922c-46c2-a6fc-42003c78d3dd
  modified: 2026-08-01T23:59:40.683Z
---

> Windows history (marked 2026-10-25): this describes the Windows laptop, which has had no terminal work or scheduled tasks since 2026-10-14. See [[work-laptop-hands-off]].

`KeystoneOS-DailyBackup` (triggers 00:30, runs on wake if missed) can report Task Scheduler `FAIL(code=3221225786)` (0xC000013A, STATUS_CONTROL_C_EXIT — process killed, not a script error) even though the day's backup is fine. Cause: the git-push + robocopy phases finish in minutes, but the full memsearch reindex runs for hours; a laptop sleep/wake cycle mid-reindex kills the process, and the missed-start relaunch retries on each wake until one run completes (seen 2026-08-01: four killed starts 08:27–11:32, clean end 16:36).

**Why:** stack-doctor flags `task:KeystoneOS-DailyBackup` on the stale exit code; treating it as real rot wastes a foreground re-run.

**How to apply:** when this code appears, check `~\.claude\scripts\logs\daily-backup.log` for a same-day `===== daily-backup end: OK =====` and the script's own "Backup freshness" section. If both are clean, the failure is the sleep-kill signature — no fix needed; the code clears at the next completed scheduled run. Only escalate if no clean end exists for the day. Related: [[keystoneos-verification-habits]].
