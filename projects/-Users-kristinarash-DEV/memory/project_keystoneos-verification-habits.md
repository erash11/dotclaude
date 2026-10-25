---
name: keystoneos-verification-habits
description: "Where KeystoneOS state claims are authoritative vs misleading, and which readings have already produced wrong conclusions"
metadata: 
  node_type: memory
  type: project
  originSessionId: ea41d487-7812-4180-a6a8-f76a99753f83
  modified: 2026-10-24T14:52:01.495Z
---

This system is well-instrumented, which makes its few misleading surfaces
dangerous — they look authoritative. Check these before drawing conclusions.

**"Did a job run today?"** On the Mac (since 2026-10-14 the only scheduler): `launchctl list | grep com.keystone` plus each job's log in `~/.claude/scripts/logs/`. Historical, superseded 2026-10-14 (Windows task names): only `KeystoneOS Morning` runs through `run-job.ps1`;
AgySync, DailyBackup, MsysKeepAlive, Reconcile, Rituals and StackDoctor invoke
their scripts directly and write **no ledger row**. So `outputs/run-ledger.json`
under-reports. Correctness is fine — `Test-JobCompleteOn` checks the ledger *or*
the job's `successProbe`. Ask `.\scripts\keystone-reconcile.ps1 -DryRun -Json`,
never the ledger alone and never `Get-ScheduledTaskInfo`.

**memsearch timeout streaks are not failures.** The SessionEnd hook
(`~/.claude/hooks/memsearch-sync.js`) is deliberately best-effort. Since 2026-09-02
it hands the index to a detached worker and returns at once, so the `timeout: 50`
still in `~/.claude/settings.json` no longer bounds the index; see
[[memsearch-hook-timeout-cap]]. The daily backup's uncapped full reindex absorbs
backlog and resets the counter. Since 2026-10-22 that backup runs hourly
12:00-17:00 on AC power, so a streak clears by afternoon; see [[backup-sync-system]].
(Superseded 2026-10-24: the nightly ran 00:30, then 09:00 from 2026-08-29.) A streak of 16 on 2026-07-28 was
read as a broken indexer and produced a whole plan step to "fix" it — the nightly
cleared it the same night, exactly as designed. Alarm threshold is 6.

**A scheduler's exit code is not the job's outcome.** It reports the last
*scheduled* run, so a green log and a red status routinely coexist: a manual or
out-of-band run never clears it, and a sleep/wake kill mid-run sets it while the
day's work still completed on a later retry. Read the job's own log for a
same-day clean end before treating a red status as rot. Two recorded instances:
the Windows sleep-kill exit on `KeystoneOS-DailyBackup` (2026-08-01, details in
[[backup-task-sleepkill-signature]]), and `launchctl list` on 2026-08-31 still
showing the failed 09:00 `com.keystone.dailybackup` after the corrected re-run
completed with 0 errors. Both cleared themselves at the next scheduled run; a
forced re-run would have been cosmetic. (Generalised from that Windows-only
memory. It was archived to `_archive/` on 2026-09-01, came back as a live copy in
the 2026-09-24 Windows memory mirror, and is kept unindexed as Windows history.)

**The test suite is main-checkout-only.** `Get-KeystoneDevRoot` resolves the DEV
root as `<repoRoot>\..`, which from a worktree yields
`KeystoneOS\.claude\worktrees\`. `tests\keystone-reconcile.ps1` therefore always
throws in a worktree. Baseline on main is 23 pass / 1 fail
(`skill-verification-contracts.ps1`, unrelated). Always baseline against main
before blaming a change.

**Three claims failed verification in one session (2026-07-28/29):** that the
registry pointed at a stale clone, that the reconciler was wasting hours on
redundant backups, and that the indexer was chronically broken. All three were
plausible from a point-in-time reading and all three were wrong. State a claim
about this system only after re-running the check that produces it.

**`canonicalPath` in `data/projects.json` must be a real filesystem path — never a URL.**
Learned the hard way 2026-08-15: retiring a project, I set it to the GitHub URL so the field
would not point at a deleted directory. That took down the entire 06:00 morning cadence at
the dashboard step. `Join-Path`, `Get-Item`, `Resolve-Path`, `Get-ChildItem` and
`Convert-Path` all throw *"Cannot find drive. A drive with the name 'https' does not exist"*
on a URL. **`Test-Path` is the trap: it returns `False` on a URL instead of throwing**, which
is exactly why the `if (-not (Test-Path $Path))` guards in `Get-PathSummary` and
`Get-GitSummary` sail past it and the failure lands somewhere further downstream.

A path that simply *does not exist* is handled cleanly by those guards, so the correct value
for a retired project is its old directory; put the repo URL in a separate field
(`restoreFrom`) that nothing treats as a path.

**Recurrence 2026-09-12 — same class, cross-machine variant: a Windows drive letter.**
The 2026-09-09 GitHub consolidation merge left a **duplicate** `reMarkale_extract` entry in
`data/projects.json` whose `canonicalPath` was `C:\Users\eric_rash\Desktop\DEV\...`. On macOS
that throws *"Cannot find drive. A drive with the name 'C' does not exist"* — identical
mechanism to the URL case, different scheme. It killed morning-cadence on **every run from
2026-09-10 through 2026-09-12** (5 runs), and the failure was **invisible in the usual
places**: `outputs/jobs/morning-cadence-*.{out,err}.log` were both 0 bytes and
`morning-cadence.err` was empty. The only record was `outputs/morning/cadence.log` —
grep it for `cadence FAILED` first, not the job logs. Fixed by deleting the duplicate
(the Mac entry was intact); BOM preserved on the write, see [[settings-json-bom-trap]].

**The asymmetry is the durable lesson: this fault is one-way.** Windows tolerates a
`/Users/...` path (`Test-Path` just returns `False`); macOS *throws* on `C:\` under
`$ErrorActionPreference = "Stop"`. So any shared JSON that both machines write will break
the Mac and never the Windows box — and it will recur every time Windows registers a new
project. Expect it after any cross-machine merge; grep shared `data/*.json` for
`eric_rash` or `C:\\` as part of post-merge cleanup. See [[github-consolidation]].

**How to apply:** after editing any `data/*.json` that KeystoneOS scripts consume, run the
consumers before trusting the edit — `scripts/keystone.ps1 dashboard`, `cockpit`, `snapshot`
are quick and cover most path handling. A JSON-validity check proves nothing here; the file
parsed fine and still broke the cadence. See [[morning-briefing-retired]].

Related: [[dev-layout-and-discovery]]
