---
name: project-catapult-cli
description: "Catapult Connect CLI built with Printing Press — key API discoveries, CLI location, and what works"
metadata: 
  node_type: memory
  type: project
  originSessionId: 9ad4b586-a29e-48c0-be31-455d712183c5
---

CLI built and working at `~/printing-press/library/catapult` (binary: `catapult-pp-cli.exe`).

**Why:** Sport scientist at Baylor Football needed programmatic access to GPS wearable data without R scripts or manual OpenField exports.

## Critical API Discoveries (do not re-investigate)

- **Correct base URL:** `https://connect-us.catapultsports.com/api/v6` (NOT v4 — v4 gives 404/405 on stats)
- **Stats endpoint:** `POST /stats` (NOT `/statistics` — that path doesn't work)
- **Auth:** Pre-generated JWT Bearer token from OpenField → Settings → API Tokens; set `CATAPULT_TOKEN` env var
- **Token scope matters:** Token with scopes `["connect"]` works. `["connect","catapultr","sensor-read-only"]` may not access stats.
- **Stats body:** `{"filters":[{"name":"activity_id","comparison":"=","values":["<uuid>"]}],"parameters":["average_player_load",...],"group_by":["athlete"]}`
- **Key slug:** `average_player_load` (NOT `total_player_load`) — v6 returns per-athlete session average
- **Date format from API:** `MM/DD/YYYY` — must normalize to `YYYY-MM-DD` before SQLite date comparisons
- **Statistics NOT bulk-syncable:** Must query per-activity; CLI uses Python bulk sync for historical data

## What Works

- `athletes`, `activities`, `parameters` — standard GET endpoints, work with any token
- `stats --activity <uuid> --metric <slugs> --group-by athlete` — live data, caches to local store
- `acwr --squad --metric average_player_load --date YYYY-MM-DD` — ACWR dashboard
- `pb --metric max_vel` — personal bests with trend
- `diff <activity1> <activity2> --metrics ...` — session comparison
- `report --from ... --to ... --squad` — weekly load summary
- `params search <keyword>` — FTS across 1,829 parameter slugs

## Data Available (Baylor Football account)

- 520 athletes, 2,522 activities, 1,829 parameters
- Last 30 days synced: 15 activities, 869 statistics rows (Spring 2026)
- Historical DB at `~/printing-press/.runstate/.../working/catapult-pp-cli/.env` (token file)

## Known Nuances (from prior working system)

- `max_vel` is in **mph** from API (multiply × 0.44704 to store as m/s)
- `velocity_band3_total_distance` = HSD (75–90% max vel), bands 5–8 return 0 for Baylor
- `average_player_load` slug = session average per athlete (misnamed; acts like total)
- Walk-throughs have near-zero velocity — filter by activity name when computing speed metrics
- ACWR values >3 at spring camp start are expected artifact (low chronic denominator)

Superseded by the `pp-catapult-openfield-connect` skill for day-to-day use, but this file's API discoveries below remain the ground truth for the endpoints — don't re-investigate them.
