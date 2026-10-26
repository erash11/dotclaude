# claude-stack-doctor skill review — 2026-10-25

Lens: `mattpocock-skills:writing-for-agents` (+ SKILL-MECHANICS). Target:
`~/.claude/skills/claude-stack-doctor/SKILL.md` (20,180 chars, loaded whole on every run) and
the script behind it where the skill's claims depend on it. Today's run: ALL CLEAR.

## A. Wrong facts (they send an agent the wrong way) — fix first

1. **"After ANY reinstall/upgrade of memsearch the local flush patch is stripped. Re-apply it."**
   The Mac has no flush patch (Tier A `project_memory-compiler-pipeline.md`, superseded 10-24:
   the patch was Windows-only). An agent following this hunts for a patch that does not exist.
2. **"add `--backends fts5,rg` when Docker is down"** (recall section). Docker and Milvus standalone
   are gone (10-24). Mac memsearch is Milvus Lite.
3. **Backup schedule history contradicts itself.** "hourly 12:00-17:00 since 2026-10-22; 21:00
   from 2026-09-24" and, in the SSD paragraph, "The schedule moved 00:30 → 09:00 on 2026-08-29".
4. **Windows memsearch backend = Docker `milvus-standalone`** (table, issue codes, script lines
   130–136). Docker was removed from the laptop; if the Windows task ever runs, it fails
   `milvus-docker` for nothing.

## B. Script false passes (same class as the recall.py bug fixed today)

5. **memsearch check passes on exit code alone** (`stack-check.ps1:127`). During an index lock
   `memsearch search` exits 0 with empty stdout (seen today, 23 min). Fix: require non-empty
   output; report `memsearch-busy` (warn) when stderr shows the lock, `memsearch-run` otherwise.
6. **`recall-regress` reads every ledger row** (`:169`). Today's locked run (0/30) is marked
   `INVALID` in `ledger.md`; the check does not skip such rows, so a broken run can raise a false
   regress or mask a real one. Fix: skip rows whose label starts with `INVALID`.

## C. Structure

7. **Sprawl.** Every run loads 20 KB; most runs end ALL CLEAR. Disclosure test: every branch
   needs "run, read VERDICT, report"; only the branch whose code fired needs its fix.
   Proposed: SKILL.md = steps + one-line issue-code index (~3–4 KB); per-code fixes →
   `FIXES.md`; laptop material → `WINDOWS.md`. One pointer each.
8. **Steps are split across the file.** "Run, report, apply fix" is at the top; "confirm the cause
   with a foreground re-run, re-run until the code clears, note new classes in memory" is in
   **Rules** at the bottom. Make one numbered list with a checkable done line:
   *Done when VERDICT is ALL CLEAR, or every remaining code is reported with its cause and why it waits.*
9. **Windows sediment (~30%).** Table column, Windows issue codes, `\Eric\KeystoneOS-StackDoctor`,
   Desktop Commander and worktree gotchas, the PowerShell 5.1 note, Windows-box venv history.
   The laptop has had no automation since 10-14. Move it to `WINDOWS.md` behind one line.
10. **Caches of the environment.** Context-floor baseline numbers (live in
    `context-floor-baseline.json`), the backup schedule (the plist; Tier A `automation-cadence`),
    the backup internals (backup skill, `RESTORE.md`). Keep only what no file says: receipt not
    mtime, FUSE `--modify-window=5`, exit 0 is not proof.
11. **Co-location.** Clearing `.errors.log` sits under "Weekly scheduled run"; "read entries before
    clearing" sits under `errors-log`; "`transcript missing` is not a fault" sits in Gotchas, far
    from the flush codes. Group each under its issue code.
12. **Negation.** "Don't assume the obvious culprit" → "Confirm each cause with a foreground re-run
    before fixing." (Guardrails like "do not fix the mixed separators" stay; they name the target.)

## D. Description (always loaded)

13. Keep it model-invoked (closeout, backup, doctor-plus and brain-audit reach it; the agent should
    fire it on its own). But: `"/claude-stack-doctor"` is a no-op trigger (typing the name always
    works); "when closeout/morning sessions should verify" is redundant (closeout names it); and the
    most common real trigger is missing: a stack-doctor or backup entry in `.errors.log` at session
    start. Draft:

    > Health check for the automation and memory stack: launchd jobs and their log proof, backups,
    > memory flush, memsearch and recall, cross-machine sync, context size. Use when asked whether
    > the stack is healthy, when a scheduled job or backup did not run, when memory or recall seems
    > broken, or when `.errors.log` shows an entry at session start. For running the backup use
    > `backup`; for context-engineering practice use `doctor-plus`.

## Not changed by this review

Nothing edited yet. Script tests to extend if B is applied: `scripts/test-*.sh` pattern.

## Applied 2026-10-25 (Eric chose "all of it") — skills `31e7631`

All 13 items. SKILL.md 20,180 → 3,498 chars (steps + done line + issue-code index); per-code fixes
in `FIXES.md` (12.6 KB, read only when a code fires); laptop material in `WINDOWS.md`. Script:
memsearch empty output fails / lock warns; `INVALID` ledger rows skipped; Windows memsearch section
skipped. Found while applying: 8 script codes the old skill never explained (`task-unloaded`,
`backup-dryrun-only`, `backup-repo-gone`, `skill-tax`, `memfile-full`, `memfile-missing`,
`handoff-upstream`, `handoff-check-missing`); all 37 codes now documented. Verified: real run ALL
CLEAR; tests 18/18 (memsearch-check 8, job-proof 6, pwsh-tap 4).
