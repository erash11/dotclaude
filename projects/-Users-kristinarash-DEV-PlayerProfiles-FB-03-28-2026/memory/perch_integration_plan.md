---
name: perch-integration-plan
description: Design decisions from 2026-04-23 brainstorming session — 5th TSA domain "Weight Room" using Perch VBT 1RM data
type: project
originSessionId: 7741f8b7-e5f7-45a3-adfc-6681a97c4d3c
---
Design complete as of 2026-04-23. Implementation plan not yet written.

**Why:** Adding Perch velocity-based training data as a 5th domain to the TSA composite gives a weight room performance dimension alongside CMJ, GPS, BW, and Strength (IMTP).

**Decisions locked:**
- Domain name: "Weight Room"
- Exercises: back squat, power clean, bench press, hang power clean
- Metric: 1RM from Perch `/stats` ONE_RM field, normalized by bodyweight (1RM ÷ BW, both in lbs)
- Scoring: 4 t-scores (one per exercise 1RM/BW) → Weight Room domain mean → TSA = mean of 5 domains
- Radar: Weight Room shows as a single composite axis (not 4 individual axes) — keeps radar clean. Individual 1RMs in profile panel only.
- Athlete join: name-match from Perch `/v2/users` using existing `_normalize_name()` pattern (same as BW CSV join)
- Ingestion: `src/perch_ingest.py` → `data/perch.duckdb` local cache. Run separately before report.
- Auth: Bearer token in `.env` as `PERCH_API_TOKEN`
- API pagination: must handle `next_token` on `/stats` and `/sets`

**How to apply:** When resuming this work, invoke `writing-plans` skill — design is approved, next step is implementation plan. Approach B (ingest in this project, single composite axis) is the selected approach.

**Files to create/modify:**
- `src/perch_ingest.py` (new)
- `config.py` (add PERCH_DB path)
- `src/data.py` (add `load_perch()`, `load_perch_history()`, update `merge_all()`)
- `src/scorer.py` (add Weight Room domain, update TSA to 5 domains)
- `templates/report.html.j2` (add Weight Room axis to radar, exercise 1RMs to profile panel)
- `.env` (add PERCH_API_TOKEN — not committed)
- `requirements.txt` (add `requests` if not present)
