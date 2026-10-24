---
name: rtp-report-data-gotchas
description: "Catapult /stats, VALD ForceDecks/DynaMo and Perch data gotchas learned building an RTP clearance one-pager (2026-07-21); no athlete details"
metadata:
  type: project
---

An RTP clearance one-pager was shipped 2026-07-21 from a repo under `~/DEV/SpecialRequests/` (health data: local only). Its `params.yaml` is the reuse seam: athlete, position and dates are parameters for the next RTP case. Athlete details stay in that repo, never in memory.

Data gotchas (verified, will recur):
- Catapult v6 `/stats` via `catapult-openfield-connect-pp-cli statistics`: an `athlete_name` filter makes the server hang past 120s; `athlete_id` returns fast; **date filters are silently ignored**, so always filter client-side. Default `sync` does NOT sync the statistics resource (only activities, athletes, parameters).
- Units: session `max_vel` comes back in account display units (**mph** here); the athlete-profile `velocity_max` field is **m/s**. Never mix them; derive a pre-injury max from session history.
- VALD `forceplate.db` (DuckDB, long format): IMTP has **no L/R split**, so IMTP LSI is not computable. The limb-symmetry measure is CMJ `Eccentric Braking Impulse Asymmetry` (pre-derived in `classified_athletes.asymmetry_pct`).
- Perch `perch_1rm` has no position column: join position membership from the VALD roster name list (lowercased). Perch Power Clean values can be carried forward and stale; check the dates before using one as a criterion (Bench Press was used instead).
- **VALD DynaMo works live** (v3): base `https://prd-use-api-extdynamo.valdperformance.com` (the `ext` host; `prd-use-api-dynamo` is the internal app API and 401s external tokens). Same Auth0 token as ForceDecks (`auth.prd.vald.com`, audience `vald-api-external`, ForcePlate `.env` creds). `GET /v2022q2/teams/{teamId}/tests?athleteId=&testFromUTC=&includeRepSummaries=true`; response `{items,...}`; per-rep `maxForceNewtons` keyed by `laterality` LeftSide/RightSide. Date ranges wider than about 13 months silently return 0 items. Quad LSI comes from DynaMo knee extension.
- **forceplate.db can lag the API.** Do a live ForceDecks top-up for CMJ tests newer than the DB before reporting. API gotchas: trial `RSI-modified` is x100 vs the DB scale; asymmetry = metric `Eccentric Braking Impulse` with `limb='Asym'`; the tests endpoint is `GET {region}/tests?TenantId&ModifiedFromUtc`, paged by the last `modifiedDateUtc` until 204.

Related: [[speedprofiling-data-gotchas]]
