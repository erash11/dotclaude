---
name: tech-inventory-refresh
description: "Baylor Tech Inventory survey — which forms platform is really live, why live responses cannot be pulled from the CLI, and the refresh command"
metadata: 
  node_type: memory
  type: project
  originSessionId: b189fe96-f0c2-4eb0-87ed-6c5f33cadcd7
  modified: 2026-09-08T22:39:48.668Z
---

Analysis project: `~/DEV/Tech_Inventory_Analysis` (**not a git repo** — nothing to
commit there). Survey data feeds the framework in `~/DEV/SoftwareTech_Mgmt_Framework`.

**The forms-platform trap.** The live survey runs on **Microsoft Forms**. The 08-29
export header row proves it: `ID · Start time · Completion time · Email · Name ·
Last modified time`. But `SoftwareTech_Mgmt_Framework/docs/INVENTORY_FORMS_LINKS.md`
documents two **Google** Forms with real form IDs. The Google forms are 08-13
proposal-era prototypes — their dropdown has 26 options against the 33 units in
`clean/coverage.csv`.

**Consequence:** `gws` can reach those Google form IDs and will return few or no
responses. That is a **false negative**, not evidence that nobody new replied.
Live responses cannot be reached from the CLI at all. Eric must download the
export from Microsoft Forms by hand.

**Baseline checked 2026-09-07** (verified against the .xlsx itself, not the derived
CSV): newest export anywhere on disk is `raw/Quick_Inventory_export_2026-08-29.xlsx`
— 37 responses, 27 of 33 units, 147 distinct technologies. The OneDrive copy at
`~/Library/CloudStorage/OneDrive-BaylorUniversity/Documents/` is byte-identical
(same md5). Nothing newer exists in `~`.

**Two OneDrive copies — one is stale.** `OneDrive-BaylorUniversity/Documents/
Quick_Inventory_export_2026-08-29.xlsx` is current. But
`OneDrive-BaylorUniversity/Athletics Technology - Quick Inventory.xlsx`, at the
OneDrive **root** with the survey's display name, is the **08-24** export — md5
`0f7874bbddb3cc10592805687aff6ea1`, identical to `raw/..._2026-08-24.xlsx`. Eric
linked that root file on 2026-09-08 believing it was the update. Its friendly name
makes it look canonical; it is five days behind. Always md5 an OneDrive copy against
`raw/` before treating it as new.

Units with no response: Golf (M) · Tennis (M) · Tennis (W) · Volleyball ·
Business Office. `Other` also shows zero but is a catch-all box, not a department —
do not report it as a sixth missing unit. Department soft deadline: **29 September 2026**,
so gaps before then are expected, not a coverage failure.

**Reminder sent 2026-09-08.** Eric emailed all five non-responding units as five
separate per-unit notes (not one group email), with a **Tuesday 29 September**
deadline. He edited the wording himself before sending, so the file record is the
ask, not a transcript: `~/DEV/SoftwareTech_Mgmt_Framework/docs/
INVENTORY_REMINDER_2026-09-08-sent.md`. **Kenny Boyd and Jovon Overshown were
deliberately left off the CC** — the 08-13 original CC'd them, and holding that
back keeps it available as escalation for a second reminder. Do not suggest
sending a first reminder again; the open question is now whether responses arrived.

**Refresh path:** save the download as `raw/Quick_Inventory_export_YYYY-MM-DD.xlsx`
(never edit `raw/`), then
`cd ~/DEV/Tech_Inventory_Analysis && uv run --with openpyxl python3 scripts/clean_inventory.py`.
The script always picks the newest `raw/` file. Then confirm `clean/unmapped_review.csv`
is empty; if it has rows, add them to `scripts/aliases.py` and re-run.

**Why:** the two documents disagree about which platform is live, and the disagreement
is invisible unless you read the export's header row. Answering "did any data change?"
from the Google forms would look like a clean check and be wrong.

**How to apply:** to answer "has anyone new responded", first confirm no newer file
exists on disk, then say plainly that a manual download is required — do not attempt
a `gws` pull. Read the header row before trusting the forms-links doc. Related:
[[ath-tech-framework]] (the framework these findings feed), [[gws-forms-api]],
[[dcg-guard-blocks]].
