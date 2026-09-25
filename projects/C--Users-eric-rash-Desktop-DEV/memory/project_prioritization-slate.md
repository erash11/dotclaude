---
name: prioritization-slate
description: "Eric's job-lane prioritization system (built 2026-09-14): charters, cap, timer check; where it lives, how to clear a nag, why it exists"
metadata: 
  node_type: memory
  type: project
  originSessionId: df3b3576-b317-408d-964a-187d57ed18ca
  modified: 2026-09-15T03:00:00.777Z
---

Built 2026-09-14 from that day's interview. Eric's diagnosis in his words: projects started on random ideas or suggestions, no deadlines, no staged deliverables, "done is never really defined", and work nobody asked for so nobody to deliver it to. Four earlier fixes (5/22 note, 6/2 morning brief, 6/12 okr-tracker, 7/31 note) died because each needed remembering.

**Rules** (vault `Projects/Applied-Performance-Operating-Cadence.md`, which replaced the v2 OKR playbook): an active job project needs a `charter` in `~/DEV/project-triage/portfolio.json` — pillar (data/education/research), jd_duty, named receiver, done_means, 4 dated steps (plan agreed → first draft → final → in use), finish_by ≤ semester close. Cap in `meta.slate.cap` (default 4; **5 for Fall 2026 only**). Ideas wait in `/project` ideas. Side lane is outside the cap by Eric's choice.

**Timer:** `KeystoneOS/scripts/ritual-check.ps1` runs `portfolio.py slate-check --json` as the `slate` ritual. Over cap, late step, past finish, missed checkpoint → OVERDUE; incomplete charter or open slot with next_up → DUE. A check that cannot run reports DUE, never OK.

**Clearing a nag:** `python3 ~/DEV/project-triage/portfolio.py mark-done <Project> --step N` or `mark-done "report #2"` (checkpoint match must be unique).

**Fall 2026 slate:** Tech_Inventory_Analysis (Kenny, 10-09) · HPI_Protocol (Chris+Kenny, 12-11) · Education_Curriculum (Student Services leadership, 12-11) · RTP_Constraints_Course (Joe Smith, 12-11) · WomensHealth_Survey (Andrew Gallucci, 12-11). Next up: NCAA_BestPractices_Doc. Checkpoints: status reports #2 09-18 … #9 12-18, Oct 15 OKR checkpoint, Dec 18 close. Summer KRs scored 09-14, avg 0.23; Fall KRs in the OKR doc.

**Parked (as of 2026-09-14):** Baseball profiles · Acro pass builder · 6 job projects. Moved here from `global-memory/MEMORY.md` on 2026-09-19 to stay under its 2,500-char cap; MEMORY.md no longer lists them, so this line is the record.

**Time + tracking loop (added 2026-09-14):** calendar blocks from `project-triage/slate_calendar.py` → Drive `05_SYSTEMS/ProjectBlocks/fall-2026-project-blocks.ics` (Focus time first; future weeks fitted to recurring meetings only — rerun ~every 2 weeks; busy times need the Google Calendar MCP, work calendar is the imported "Calendar"). `/interview-me` Part 0b logs `add-update <Project> "[block] ..."`. Friday ritual runs write `SecondBrain/Inbox/weekly-slate/YYYY-MM-DD.md` via `portfolio.py week-report`. Eric chose to keep the debrief inside interview-me rather than a separate skill. 2026-09-14: the 65 blocks were imported into Outlook web (Add calendar → Upload from file → main "Calendar"); no Outlook app on the Mac. The Chrome upload tool only accepts files under the working dir, so copy the .ics into ~/DEV first. Before re-importing a regenerated file, delete the old "Project block" events — Outlook import may duplicate despite stable UIDs.

**How to apply:** when Eric proposes a new project or idea, check the slate first (`slate-check`) and name the trade-off — which active project it displaces — before helping start it. `okr-tracker/` is retired; do not revive it. Design: `project-triage/docs/superpowers/specs/2026-09-14-prioritization-system-design.md`.

Related: [[portfolio-registry-write-provenance]], [[supervisor-log-pipeline]], [[automation-cadence]]
