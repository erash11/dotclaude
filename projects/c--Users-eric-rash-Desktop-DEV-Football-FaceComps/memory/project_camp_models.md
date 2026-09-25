---
name: camp-models
description: "2026 Fall Camp candidate macro models (v2) — six builds, two-decision frame, built & pushed 2026-06-08"
metadata: 
  node_type: memory
  type: project
  originSessionId: 817f23be-bc87-42a6-a6b4-3985e5950351
---

Six candidate 2026 Fall Camp macro models for Dave Aranda + defensive staff, built and pushed to
`main` on 2026-06-08 (commit `de1e7fb`). New v2 files only; v1 originals left intact for diffing.

**Frame:** two decisions, not a flat menu. Decision 1 (Coach's call, presented equal weight, NO
recommended structure) = **14-day (3/3/4/4)** vs **15-day (3/3/4/5)**, the latter Coach's "3-4-5"
five-in-a-row finish that spends the Aug 22 film day (taper unchanged). Decision 2 (Eric's call) =
intensity **Conservative / Moderate / Aggressive**, with **Moderate the recommended flavor**. Coach
navigates 2-then-3.

**Hard rules (machine-checked in `render_camp_models_v2.py`):** no two reds on consecutive PRACTICE
days (off/film day between reds counts as recovery — red-off-red is legal); every model ramps to a
single Block-4 peak; scrimmages ride intensity (Cons 2 / Mod 2 / Agg 3, the 3rd is a re-characterized
live red = contact, not load); 5-day peak block carries embedded recovery; taper held constant.

**Relabel (key reframe):** the 92-min / 370-min anchors are in-season PREP-PRACTICE load
(`inseason_duration_2025.csv`), NOT a game. Say "in-season day" (92) / "in-season week" (370). Lead
the room with the block-vs-in-season-WEEK comparison. Pitch: camp builds up to and past the season's
daily demand. See [[simulator]] for the broader sim/calibration context.

**Build finding worth presenting:** no-back-to-back caps every model's peak ~125-135% (can't stack
reds); models differ by red count and how early heat starts, not peak height. A 7th red won't fit the
14-day without front-loading an early block hotter than the finish, so 14-day Aggressive = 6 reds
(B3≈B4 plateau); the 15-day's 5-day block absorbs the 7th into a clean peak. Red ladder: Cons 3 /
Mod 5 / Agg 6 (14d), 3 / 6 / 7 (15d). Day targets: GREEN 85m/9 · YELLOW 112/12 · RED 132/13-14.

**Files:** source of truth `docs/fall-camp/2026-06-08-candidate-camp-models-v2.md`; build spec (full
locked-decision record) `docs/fall-camp/2026-06-08-camp-models-build-spec.md`; renderer
`scripts/render_camp_models_v2.py` → `2026-fall-camp-models-v2.html` (coach, color toggle),
`-internal-v2.html` + `.pdf` (internal color); relabel addendum
`docs/superpowers/specs/2026-06-08-load-model-relabel-addendum.md`. Back end (constant): taper Aug
23-28 → Mock Game Aug 29 → game week Aug 31-Sep 4 → Auburn Sep 5.
