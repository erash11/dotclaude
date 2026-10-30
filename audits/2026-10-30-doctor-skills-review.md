# doctor-plus + claude-stack-doctor review — 2026-10-30

Lens: `mattpocock-skills:writing-for-agents` (+ SKILL-MECHANICS), plus a check that each skill
actually does its job. Nothing edited yet.

stack-doctor's prose was already reviewed with this lens on 2026-10-25 and all 13 items applied
(`31e7631`, see `2026-10-25-stack-doctor-skill-review.md`). This pass reviews whether it *works*.
doctor-plus has never been reviewed with this lens.

## A. claude-stack-doctor — gaps in what it does (urgent)

1. **The weekly run missed Monday 10-26, and nothing noticed.** `scripts/last-weekly-run.log` is
   dated 10-19. The Mac booted Mon 10-26 08:43, before the 10:30 slot. The job was re-registered
   10-29 16:00 (`backgroundtaskmanagementd`), so `runs = 0` now says nothing about Monday.
   Cause not proven: unified log does not reach back to 10-26. Not a pwsh outage:
   `com.keystone.morning` and `agysync` run on the same `/opt/homebrew/bin/pwsh` (runs 3 and 2,
   exit 0). Next scheduled run: Mon 11-02 10:30.
2. **The watcher has no watcher.** `stack-check.ps1:62-66` lists 14 jobs and omits
   `com.keystone.stackdoctor` and `com.keystone.snapshot`. Even if added, a dead weekly job means
   the check never runs, so it cannot report itself. Fix needs a **dead-man check** outside the
   job: the SessionStart hook (`keystone-unified-snapshot.js`) adds one line when
   `last-weekly-run.log` is older than 8 days. Automatic, no habit for Eric.
   Also add both jobs to the list (`snapshot` proof = snapshot file mtime under 1 day).
3. **One Mac code has no fix section.** `task-dual-run` (the Mac emits it for a loaded
   `com.keystone.rituals`) is absent from `FIXES.md` and the SKILL.md code index.
   (Corrected while applying: `task-never-run` is Windows-only and documented in `WINDOWS.md`.)

## B. doctor-plus — writing-for-agents findings

SKILL.md 4,952 chars; description 619 chars, loaded every session.

4. **Invocation: make it user-invoked.** Nothing reaches it autonomously. The only references are
   `WORKFLOW.md:216` (human, "`/doctor-plus`") and a hint in stack-doctor's description.
   SKILL-MECHANICS: fires only by hand → `disable-model-invocation: true`, one-line human
   description. Saves ~600 chars every session. Drop "for context-engineering practice use
   doctor-plus" from stack-doctor's description too.
5. **Trigger list is one branch written four times** ("/doctor-plus", "doctor plus",
   "doctor-plus", "extended doctor"), and the body's `## Trigger Phrases` repeats it. Delete the
   section; it dies with item 4 anyway.
6. **Description carries identity the body owns:** the six shifts in parentheses. Cut.
7. **Each shift is defined twice** (table "principle" column + numbered checks in Part 2).
   Co-locate: one entry per shift with principle, smell, and the hard-rule exception together.
8. **No completion criterion.** "Map that set first" and "one findings table" have no bound.
   Proposed done line: *every always-loaded source has a measured size, every shift has PASS or
   FLAG citing file and passage, and every FLAG from the last report is re-checked.*
9. **Missing step: re-check last time's flags.** The 09-30 run did this on its own ("Re-check of
   the 08-29 flags"); the skill never asks. Make it step 1. It turns six one-off opinions into a
   regression check.
10. **Findings have three homes.** `doctor-plus/findings-2026-08-29.md` and `-09-30.md` (inside
    the skill folder), `~/DEV/docs/handoffs/*doctor-plus*` (09-14, 09-22, 10-02, 10-11). The skill
    names none. Pick one: `~/DEV/docs/handoffs/YYYY-MM-DD-doctor-plus.md` (where the last four
    went). Move the two in-folder files there.
11. **Measurement duplicated with stack-doctor.** Shift 3 re-measures always-loaded context by hand
    (the 08-29 run built a chars table). `stack-check.ps1` already measures it: `context-floor`,
    `skill-tax`, `memfile-full`. Part 2 reads those numbers first; one home for measurement.
12. **Hard-rule exception said twice** (shift 1 "never flag those" + Rules "Never recommend
    softening those"). Keep one, positive: "Leave safety, money, deletion and health-data rules
    as they are."
13. **Negations.** "Never block on it", "No vibes", "don't assume the workspace's layout".
    Positive forms: "Move on after 60 s"; "Cite the file and passage for every finding"; "Map the
    loaded set first". Keep the zero-hit gotcha (it names a real trap).
14. **Shift lens vs writing-for-agents.** Shifts 1, 3, 4 overlap the writing-for-agents levers
    (no-op, disclosure, single source of truth). Point per-file skill review at
    `writing-for-agents`; keep doctor-plus for the workspace-wide pass. One line.

`README.md`, `LICENSE`, banner: upstream vendor files, never loaded. Leave them.

## Effect

- Every session: ~600 chars less always-loaded context (item 4).
- A dead weekly stack check shows up at the next session start instead of never (item 2).
- doctor-plus runs become cumulative: each one re-checks the last (items 8–10).

## Applied 2026-10-30 (Eric chose "fix all of it")

- Hook `~/.claude/hooks/keystone-unified-snapshot.js`: dead-man line when `last-weekly-run.log`
  is over 8 days old (Mac only). Test `scripts/test-weekly-deadman.sh` 3/3.
- `stack-check.ps1`: `com.keystone.stackdoctor` and `com.keystone.snapshot` added to the job list;
  new `proof:stack-doctor-weekly`. `test-job-proof.sh` 8/8. All 4 test files pass.
- Real weekly run by hand: it caught the stale log (`proof:stack-doctor-weekly`, 11 d) on its
  first run, then rewrote the log. Re-run: weekly OK; only `errors-log` (that entry), cleared.
- stack-doctor SKILL.md: `task-dual-run` in the index, overdue line as a trigger, doctor-plus hint
  dropped from the description. FIXES.md: `task-dual-run` and `proof:stack-doctor-weekly`.
- doctor-plus SKILL.md rewritten: user-invoked (`disable-model-invocation: true`), one-line
  description, 7 numbered steps with a done line, step 1 re-checks the last report, step 3 reads
  stack-check's numbers, shifts co-located, one report home `~/DEV/docs/handoffs/`.
  Old in-folder findings moved there as `2026-08-29-doctor-plus.md`, `2026-09-30-doctor-plus.md`.
