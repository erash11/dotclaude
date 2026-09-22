# RECOVERY-INVENTORY.md — what would I lose if a machine died today?

Surveyed 2026-09-12 on the Windows laptop (`bu-1979fj4`). This is the cheap version of a
restore runbook: for each category of state, where the second copy lives. Write the runbook
only after the holes below are closed, because a runbook that restores from a backup that
was never taken is worse than none.

`START-HERE.md` is the Mac restore runbook and has been executed once. There is no Windows
equivalent, and the findings below are why one cannot be written yet.

---

## VERDICT

**As surveyed, the Windows laptop had no working automated backup.** Anything pushed to
GitHub was safe; everything else on this machine existed in exactly one place.

**Fixes 1-3 were applied the same day** — both backup tasks now have a trigger and a real
next-run time, and the DEV copy is additive rather than mirrored. Fixes 4-6 are open, so
the machine is covered but not yet *verifiably* covered: nothing on Windows reads the
backup state to tell you when a run stops happening. Re-run
`scripts/survey-recovery.ps1` to refresh the findings below.

Git coverage is genuinely good: 131 repos, 0 unpushed, 0 without a remote, 1 uncommitted
file at survey time. The gap is entirely in what git does not track.

---

## What IS covered

| State | Second copy | Verified |
|---|---|---|
| Tracked code, all 131 DEV repos | GitHub `erash11` | 0 unpushed, 0 missing remotes |
| `~/.claude` config, hooks, settings | GitHub `dotclaude` | in sync |
| Skills (~160) | GitHub `claude-skills` | in sync |
| Global memory, handoffs, transcripts | GitHub `claude-global-memory` | in sync, both machines pushing |
| Documents and deliverables | Google Drive `00_Primary_Storage_Drive` (G:) | DriveFS, continuous |
| Credentials | Password manager | the only source, by design |

## What is NOT covered

| State | Size | Where it exists |
|---|---|---|
| Gitignored data across DEV | ~15 GB | this disk only |
| `SportScienceResearchRepo` working data | 4.37 GB | this disk only |
| `Football` (non-repo folder) | 2.94 GB | this disk only |
| `Risk_Stratification_Engine` | 1.80 GB | this disk only |
| `ForcePlate_DecisionSystem` (incl. the DB) | 1.69 GB | this disk only |
| Uncommitted working-tree edits | varies | this disk only |
| `~/.codex` session history | large | this disk only |

Some of these have a Mac counterpart from the 2026-08-05 restore, but only as of that date.
Anything worked on Windows since then is single-copy.

---

## Why: three findings

### 1. Every KeystoneOS scheduled task on Windows is Disabled

All nine, `KeystoneOS-DailyBackup` included. They were switched off around the Mac migration
and never switched back on or replaced. Nothing has replaced their function.

### 2. The two replacement tasks have never run

`Backup DEV to Drive` and `Backup AI Sessions to Drive` are registered and report state
`Ready`, which reads as healthy and is not. Both have **no last run time and no next run
time** — registered without a trigger, so they will never fire on their own. Their scripts
were written 2026-09-10 and live in `DEV\_INBOX\`, a staging folder that `dev-sync` skips
because it starts with `_`, so they are not in any repo either.

`Ready` with no trigger is the exact silent-failure shape this stack keeps producing: a
component reports success while the path it belongs to does nothing.

### 3. The backup manifest on this machine is the Mac's

`~/.claude/scripts/backup-manifest.json` syncs through dotclaude, so Windows has it, but
every destination in it is a Mac path:

```
ssd        -> /Volumes/CRASHBOX/AssistantBackup
transport  -> /Volumes/ASSISTANT/AssistantBackup
drive      -> /Users/kristinarash/Library/CloudStorage/GoogleDrive-.../Backups/Machine
baylor     -> /Users/kristinarash/Library/CloudStorage/OneDrive-BaylorUniversity/...
github     -> https://github.com/erash11
```

Only `github` resolves on Windows. The last `backup-state.json` written here is dated
**2026-08-14** with `status: ERROR` and `repo-diverged:global-memory` — nearly a month
stale, from the day the Mac took over.

---

## Fix, in order

1. ~~**Give the two tasks a trigger.**~~ **DONE 2026-09-12.** `install-backup-triggers.ps1`
   set both actions and triggers: AI sessions daily 00:30, DEV weekly Sunday 02:00, both
   `StartWhenAvailable` so a run missed while the laptop was asleep is caught up rather
   than skipped. Both now report a real `NextRunTime`. First DEV run was started by hand
   through the scheduler to prove the path end to end, not just the script.
   **Update 2026-09-22: `Backup DEV to Drive` retired.** It never finished a run: the
   9/13 run was killed by sleep, the 9/20 run was missed, and no `DEV_Backup` folder or
   state file was ever written. Drive for Desktop already syncs `C:\Users\eric_rash\Desktop\DEV`
   as a root (`root_preference_sqlite.db`), and the repos are on GitHub. Task XML and
   script are in `scripts/retired/`; re-import with
   `Register-ScheduledTask -Xml (Get-Content <xml> -Raw) -TaskName 'Backup DEV to Drive' -TaskPath '\Eric\'`.

2. ~~**Move the scripts out of `_INBOX`.**~~ **DONE 2026-09-12.** New copies at
   `~/.claude/scripts/backup-dev-to-drive.ps1` and `backup-ai-sessions.ps1`, tracked in
   dotclaude. The `_INBOX` originals were left unmodified rather than deleted.

3. ~~**Reconsider `/MIR`.**~~ **DONE 2026-09-12.** The new DEV script uses `/E`. Both scripts
   now also write `backup-state.json`, which the existing health checks read, and both
   abort loudly when `G:\My Drive` is not mounted instead of exiting quietly. Robocopy
   exit codes below 8 count as success, since the code is a bitmask and 1/2/4 mean work
   was done.

   Consequence to watch: an additive backup only grows. It will need pruning by hand
   eventually. That is the right trade for a copy of last resort, but it is not free.

4. **Give Windows its own manifest.** Either a `backup-manifest.windows.json` alongside the
   Mac's, following the `machine.md` pattern already used for machine-specific config, or
   per-destination platform keys.

5. **Add a Windows freshness check.** `stack-check.ps1` is Mac-only (launchd). Its backup
   section would have caught the 2026-08-14 ERROR if anything on Windows ran it.
   `handoff-check.ps1` is the precedent for a check that runs on both.

6. **Only then write `RESTORE-WINDOWS.md`.** And execute it once against a scratch account
   or a VM. The Mac runbook found roughly 30 discrepancies on its first real execution; an
   unexecuted runbook is a hypothesis.

---

## The general pattern

Every failure found on 2026-09-12 — the disabled tasks, the untriggered replacements, the
unpulled `global-memory`, the Mac-only manifest — is the same shape: **a component reports
healthy while the path it belongs to is broken.** Checks that assert a part are cheap and
already everywhere. Checks that assert a path end to end are rarer and are the ones that
would have caught all four.
