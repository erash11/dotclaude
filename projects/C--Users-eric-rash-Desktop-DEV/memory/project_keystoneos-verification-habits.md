---
name: project-keystoneos-verification-habits
description: "Where KeystoneOS state claims are authoritative vs misleading, and which readings have already produced wrong conclusions"
metadata: 
  node_type: memory
  type: project
  originSessionId: ea41d487-7812-4180-a6a8-f76a99753f83
  modified: 2026-07-29T13:05:40.363Z
---

This system is well-instrumented, which makes its few misleading surfaces
dangerous — they look authoritative. Check these before drawing conclusions.

**"Did a job run today?"** Only `KeystoneOS Morning` runs through `run-job.ps1`;
AgySync, DailyBackup, MsysKeepAlive, Reconcile, Rituals and StackDoctor invoke
their scripts directly and write **no ledger row**. So `outputs/run-ledger.json`
under-reports. Correctness is fine — `Test-JobCompleteOn` checks the ledger *or*
the job's `successProbe`. Ask `.\scripts\keystone-reconcile.ps1 -DryRun -Json`,
never the ledger alone and never `Get-ScheduledTaskInfo`.

**memsearch timeout streaks are not failures.** The 45s SessionEnd hook is
deliberately best-effort (`daily-backup.ps1:122-125`); the uncapped nightly at
00:30 absorbs backlog and resets the counter. A streak of 16 on 2026-07-28 was
read as a broken indexer and produced a whole plan step to "fix" it — the nightly
cleared it the same night, exactly as designed. Alarm threshold is 6.

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

Related: [[project-dev-layout-and-discovery]]
