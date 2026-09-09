---
name: project_fallcamp_draftuse_review
description: "Read-only audit findings on the new 2026 Fall Camp practice-scripts workbook (DRAFT_USE.xlsx); fixes intentionally deferred pending Eric's 2026-06-23 staff meeting"
metadata: 
  node_type: memory
  type: project
  originSessionId: e9b12684-fa08-44c3-a263-7d6586bd5685
---

On 2026-06-23 Eric asked for a read-only review of `SourceFaces/2026 FALL CAMP - PRACTICE FACES - DRAFT_USE.xlsx` (41 sheets: LIGHT/MED/HVY DAY templates, 18 paired DEFENSE/OFFENSE sheets 07.30-08.20, 08.21 FRIDAY, 08.22 MOCK GAME).

Findings (none fixed — see below):
- **Major:** Only `07.30 - DEFENSE #1` has the correct 2026 6-group staff header (Klanderman/SAF, Orloff/STAR, Modkins/CB, Chaney/LB, Hall/DE, Greer/DL). The other 17 DEFENSE sheets (#2-#18) still carry the old 2025 5-group header (Powledge/S, Gonzales/CB, Chaney/ILB, Hall/OLB, Breckterfield/DL, no STAR column) — confirmed the drill content underneath is real populated data, not a blank template artifact.
- **Major:** All title/date rows still read "2025" (e.g. "2025 DEFENSIVE PRACTICE PLAN", wrong day-of-week labels) — leftover from copying last year's workbook as the template.
- **Minor:** `08.06 - DEFENSE #7` TEMPO field reads "TUD" (likely typo for "THUD"). `08.13 - DEFENSE #12` metadata/header rows are shifted down one row vs. the rest. `08.18/19/20 - DEFENSE #16/17/18` have metadata in column C instead of B and a blank TEMPO field.
- A second, older sibling file exists alongside it: `SourceFaces/2026 Fall Camp - Practice Faces .xlsx` (5/22/2026, smaller) — not yet compared against DRAFT_USE.

**Why:** Eric explicitly said "don't fix anything, I just wanted context before our meeting — I'll report back with what I learned." This was reconnaissance only, not a remediation task.

**How to apply:** Do not edit this workbook or act on these findings until Eric returns with the meeting outcome. When he does, treat the staff-header and stale-date issues as the two confirmed major defects to resolve (and the four minor ones as secondary), but let his meeting takeaways drive scope/priority before touching the file. Related: [[project_camp_models]] (separate thread — the 6 macro-model design work, not this workbook QA pass).
