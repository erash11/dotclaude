---
name: project-springevals-pff
description: Spring 2026 player-eval × PFF correlation project — purpose, data sources, methodology decisions, key finding, and state
metadata:
  type: project
---

**SpringPlayerEvals_SymAnalysis** (`DEV/Football/SpringPlayerEvals_SymAnalysis`, standalone git repo). Layers semantic analysis + PFF on-field reality on top of Baylor's Spring 2026 1-on-1 exit-meeting notes (99 athletes, 4 departments: PC/N/STR/AC). Goal: do internal evaluations track on-field grade and playing time?

**Data sources**
- Eval workbook `2026 Spring Football 1on1 Exiting Meetings.xlsx`, sheet `Wide Format` (99 athletes × 4 notes) + `Player Rankings` (existing keyword scores; has a repeated header row mid-sheet at row 54 — extractor skips non-numeric IDs).
- PFF data is the [[project-drive-topology]]-adjacent `DEV/Football/PFF_Data_Project/data/pff.db` — a **DuckDB** file (NOT sqlite), opened **read-only**. Baylor `team_id='118'`; seasons 2023-25; `pff_grades` carries `grade_value`+`snap_count` per grade_type; PFF uses position abbrevs `ED`(edge)/`DI`(interior).

**Key methodology decisions**
- Semantic scoring is Claude reading all 99 notes → 1-5 trajectory, rationale, tier, per-dept sentiment, red_flag (≥2 concerning depts). Stored `data/semantic_scores.json`.
- PFF headline = recency-weighted **3:2:1** (2025:2024:2023) snap-weighted primary-unit grade + same-weighted snaps.
- No athlete_id↔pff_player_id crosswalk exists (PFF project defers it to a future AMS layer). Built here by name match (nickname fallback = unique last name + first initial). Reviewer decisions persist in `data/crosswalk_overrides.csv` so `python run.py` stays reproducible.
- Mis-valued flags require ≥25 PFF snaps (avoid small-sample noise).

**Key finding (MVP)**: semantic trajectory → blended snaps Spearman **+0.35, p=0.041** — the only significant correlation and stronger than the keyword score on every pairing. Internal perception tracks *playing time* more than PFF *grade quality*. Grade correlations weak (+0.22-0.25, n=33, n.s.).

**State (2026-06-14)**: MVP + Phase 2 DONE. `python run.py` builds 4 deliverables in `outputs/`: `SpringEvals_PFF_Master.xlsx` (8 sheets), `SpringEvals_PFF_Report.md`, `index.html` (self-contained dashboard — Plotly scatter w/ axis toggles + filterable table, Plotly via CDN), `SpringEvals_PFF_CoachOnePager.pdf` (Baylor-styled decision one-pager via headless Chrome; `src/coach_pdf.py` graceful-skips if no Chrome). 34/99 matched to PFF (rest = 2026 transfer/freshman newcomers = projection cohort; heavy portal turnover). 29 pytest pass. Spec+plan in `docs/superpowers/`. Browser verification: use Playwright MCP + `python -m http.server` (extension blocks file:// and needs site perms). NEXT (optional): Vercel deploy, position-group deep-dives, refresh when 2026 PFF lands.
