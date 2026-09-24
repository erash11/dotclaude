---
name: tech-inventory-refresh
description: "Baylor Tech Inventory survey — 09-15 baseline, how to pull the live responses, the renumbered-ID trap, and the Business Office proxy entries"
metadata: 
  node_type: memory
  type: project
  originSessionId: 3101f63e-ae24-43b1-9f12-b3bcdc82bdcc
  modified: 2026-09-16T20:55:38.440Z
---

Analysis repo: `~/Desktop/DEV/Tech_Inventory_Analysis` — **a git repo** (erash11,
private). Supersedes the Mac-slug note of the same name, which still says "not a
git repo" and has the 08-29 baseline.

**Latest run 2026-09-16** (merged to `main` 2026-09-16, commit `6edf470`): 52
responses, **Volleyball answered for itself → 32 of 32 units**, 188 products, 75
athlete-data, 123 single-unit, 9 retired, 18 BO-only (VB confirmed Hawkin +
DVSport outside the form → `UNIT_CONFIRMED` in `aliases.py`). Write-up
`docs/FINDINGS_2026-09-16.md`. The fresh Forms download lands as
`...Inventory(1-NN).xlsx` in Downloads; the OneDrive-synced copy did not update.

**Previous baseline 2026-09-15** (merged to `main` 2026-09-15): 51
responses, 31 of 32 units answering for themselves, **Volleyball covered only by a
Business Office entry**, 185 products, 75 athlete-data candidates, 9 retirements.
Write-up `docs/FINDINGS_2026-09-15.md`; deliverables dated 2026-09-15.

**Getting the data.** Live survey is Microsoft Forms. The Forms page's download
menu sits in an iframe the browser tool cannot click; Eric downloaded the
OneDrive-synced workbook `Athletics Technology - Quick Inventory.xlsx` himself.

**Trap — renumbered IDs.** That synced workbook heads the column `Id`, has no
`Last modified time`, and renumbers responses (StatCrew went 5 → 3). Match
responses across exports on start + completion time; compare products on
unit × product, never by diffing `clean/`.

**Trap — Business Office proxies.** One Business Office respondent entered vendor
lists for 11 units (2 in August, 9 on 9/14) plus a department-wide contract list.
`clean_inventory.py` tags these `source=business-office`; coverage status
`BUSINESS OFFICE ONLY` marks a unit whose own staff never answered.

**Refresh:** save as `raw/Quick_Inventory_export_YYYY-MM-DD.xlsx`, run
`clean_inventory.py`, loop `unmapped_review.csv` into `aliases.py`, then the three
builders (`build_docx.py`, `build_exec_summary.py`, `build_tech_lists.py`) — they run
on Windows via Word COM. Update `PREVIOUS` in `build_docx.py` each run.

**Why:** the ID renumbering makes a naive diff report every row as changed, and the
proxy entries would otherwise read as 100% coverage.

**How to apply:** before the post-9/29 final run, merge the refresh branch first.
Related: [[ath-tech-framework]], [[baylor-house-style]].
