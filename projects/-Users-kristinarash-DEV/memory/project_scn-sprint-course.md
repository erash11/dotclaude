---
name: scn-sprint-course
description: "SCN Fundamentals of Sprinting (Moyer + Natera isometrics) — where the 58 library entries and the review live, its place in the RTP stack, open decisions"
metadata:
  node_type: memory
  type: project
  originSessionId: afe0ff48-dfa7-46d6-8732-fabc387127ee
  modified: 2026-09-26T22:05:13.438Z
---

**Ingested 2026-09-25.** Strength Coach Network, *Fundamentals of Sprinting* (Jeff Moyer;
lesson 16 is a guest talk by Alex Natera on run-specific isometrics).

- **Library:** `Knowledge/library/strength-and-conditioning/fundamentals-of-sprinting--moyer/`
  in the vault. 58 entries, **confidence capped at `supported`** (31 supported, 20 untested,
  7 contested). Registered with the S&C advisor. Vault commit `23d0ad0`, left unpushed for closeout.
  `_book.md` there lists the entries to start with, the known source errors and the Zotero counterparts.
- **Review + plan:** `G:\My Drive\00_Primary_Storage_Drive\09_PRO_DEV\SCN_Course_Sprinting\Review and Plan - Fundamentals of Sprinting course.md`.
- **Role in the RTP stack:** the technique/capacity layer. Harries (On-Field RTP) = dosage,
  Myszka/Gray = task complexity, Moyer/Natera = *how* he runs and which physical limit explains it.
  See [[rtp-cla-course]].
- **Sprint Film Check built 2026-09-26.** `RTP_Constraints_Course/reference/sprint-film-check.html`
  (PR #6), with a print PDF in the course folder. S-MAS (Bramah 2024, Zotero `HIZLWBSU`) for the
  score, Moyer's words for the talk. Next: Jacob and Tim review it, then re-run Joe's export.
  Moyer and Bramah were added to that repo's `RESOURCES.md` in the same PR.
- **Natera push-test norms:** deferred to January winter testing (WR/DB); not in season.

**Traps.** Moyer's injury and transfer claims (heel strike or long lever → hamstring,
wearable resistance, narrow squats) are untested, and he has a LILA/Dashr conflict of interest.
The source has anatomy and history errors, listed in `_book.md`. The NFL running back in the
case entries is de-identified on purpose; do not add the name back. Ingest followed
[[ingest-review-gate]]: the independent review returned GO-WITH-FIXES, and every fix was applied.
