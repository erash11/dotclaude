---
name: project-perch-api-gotchas
description: "Verified gotchas for the Perch API (api.perch.fit) set-level ingest used in Tezino_CampPrep — auth, /v3/sets filtering, units, session_id semantics, Tezino IDs"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4abf626b-9e3e-4402-90f7-6bbb71afcc12
---

Perch API (`api.perch.fit`) gotchas, all verified live 2026-06-11 while building
`scripts/extract_tezino_perch.py`:

- **Auth**: Bearer token. Token lives in `DEV/PlayerProfiles_FB_03-28-2026/.env`
  (`PERCH_API_TOKEN`); the extractor loads it from there by default. Reference client
  (1RM-only) is `PlayerProfiles_FB_03-28-2026/src/perch_ingest.py`.
- **IDs**: Tezino Perch `user_id` = 20043 (match on "devonte tezino" in POST /v2/users).
  org / group_id = 959 (resolve at runtime via GET /v2/user -> data.org_id).
- **POST /v3/sets takes a server-side `user_id` filter AND works WITHOUT `exercise_id`** —
  `{"group_id":959,"user_id":20043}` paginated by `next_token` returns the athlete's whole
  history across all 116 catalog exercises in one stream (~6 pages of 500). No need to
  iterate exercises. `user_ids` (plural), `athlete_id`, `start_date`, `end_date` are all
  rejected HTTP 400 ("Unknown field") — filter dates client-side, same as the Catapult CLI.
- **Units gotcha**: every set's `weight_unit` reads "KG" but `weight` values are
  pounds-scale (Tezino max Back Squat 1RM = 525, sane as lbs, absurd as kg). Treat weight
  as lbs; the extractor prints a Back Squat 1RM sanity check each run.
- **`session_id` is a per-exercise tracking block, not a workout-day** — one calendar date
  can hold several session_ids. For training-day counts use distinct `date`, not session_id.
- Exercise names come from GET /v3/exercises (id -> name catalog, 116 entries).

**Why:** these cost live probing to establish and are invisible in any CLI docs; the
reference client only swept 4 exercises over short windows and never needed the user filter.
**How to apply:** any future Perch pull — use the user_id filter without exercise_id, pull
all and filter dates locally, treat weight as lbs. Working reference:
`scripts/extract_tezino_perch.py` -> `data/tezino_perch_sets.csv`. Related: [[project-catapult-cli-gotchas]].
