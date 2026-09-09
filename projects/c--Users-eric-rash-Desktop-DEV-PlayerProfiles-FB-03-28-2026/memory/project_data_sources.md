---
name: PlayerProfiles — actual data source paths and schemas
description: Absolute paths to the three pipeline databases and body weight CSV, with key table/field names
type: project
---

All source paths are defined in `config.py`. Do not hardcode — always read from config.

- ForcePlate DB: `C:/Users/eric_rash/Desktop/DEV/ForcePlate_DecisionSystem/data/forceplate.db`
  - `raw_tests` (metric_name/metric_value pivot) — use `"Jump Height (Imp-Mom)"` and `"Peak Power / BM"`
  - `classified_athletes` — use `mrsi`
- GPS DB: `C:/Users/eric_rash/Desktop/DEV/DataBase_GPS_Reporting/gps_report/data/gps_history.duckdb`
  - `athlete_sessions` — use `high_speed_distance_m`, `total_player_load`, `max_velocity_ms`
- Body Weight: `C:/Users/eric_rash/Desktop/DEV/Football/BodWeightWeb/BodyWeightMaster.csv`
  - Columns: DATE (M/D/YYYY), POS, NAME ("Last, First"), WEIGHT (lbs — convert x0.453592)
- Roster crosswalk: `data/athlete_roster.csv` (98 athletes, join key for all three sources)

**Why:** User has existing DuckDB pipelines from prior projects; this project reads from them directly rather than re-importing data.

**How to apply:** When touching data loading, always open config.py first. Never prompt the user to provide CSV exports — the pipelines are live.
