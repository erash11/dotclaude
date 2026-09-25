---
name: wilhelm-rtp-report
description: Wilhelm RTP one-pager shipped 2026-07-21; Catapult /stats + VALD data gotchas learned building it
metadata: 
  node_type: memory
  type: project
  originSessionId: 658bd694-549a-4e96-b200-1f73f780d77d
  modified: 2026-07-21T21:33:15.825Z
---

RTP clearance one-pager for Brody Wilhelm (TE, ACLR 2025-10-01) shipped 2026-07-21 for the PT/physician meeting: repo `DEV\SpecialRequests\Wilhelm_Brody_RTP` (params.yaml is the reuse seam — athlete/position/dates parameterized for the next RTP case), PDF + private artifact. Criteria at ship: velocity 103% MET, asym 3.7% MET, Power Clean 100% MET, workload 83% APPROACHING, mRSI 79% and IMTP 83% NOT MET.

Data gotchas (verified, will recur):
- Catapult v6 `/stats` via `catapult-openfield-connect-pp-cli statistics`: `athlete_name` filter makes the server hang past 120s; `athlete_id` returns fast; **date filters are silently ignored** — always filter client-side. Default `sync` does NOT sync the statistics resource (only activities/athletes/parameters).
- Units: session `max_vel` comes back in account display units (**mph** here); the athlete-profile `velocity_max` field is **m/s** — never mix them; derive pre-injury max from session history.
- VALD `forceplate.db` (DuckDB, long format): IMTP has **no L/R split** → IMTP LSI is not computable; the limb-symmetry measure is CMJ `Eccentric Braking Impulse Asymmetry` (pre-derived in `classified_athletes.asymmetry_pct`).
- Perch `perch_1rm` has no position column — join TE membership from the VALD TE name list (lowercased).
- **VALD DynaMo works live** (v3, 2026-07-21): base `https://prd-use-api-extdynamo.valdperformance.com` (the `ext` prefix host — `prd-use-api-dynamo` is the internal app API and 401s external tokens); same Auth0 token as ForceDecks (`auth.prd.vald.com`, audience `vald-api-external`, ForcePlate `.env` creds); `GET /v2022q2/teams/{teamId}/tests?athleteId=&testFromUTC=&includeRepSummaries=true`; response `{items,...}`; per-rep `maxForceNewtons` keyed by `laterality` LeftSide/RightSide. Wide date ranges (>~13 mo) silently return 0 items.
- v3 report: radar clearance profile (attainment % of target per criterion), Bench Press replaced Power Clean (Perch Power Clean values were carried-forward/stale — bench = 76% NOT MET vs clean's fake 100%), quad LSI 92% from DynaMo knee extension (right limb assumed involved; Jul LSI jump partly from LEFT limb testing lower, flagged to PT).
- **forceplate.db goes stale** — pull_data now does a live ForceDecks top-up for CMJ tests newer than the DB (found 3: 6/15, 6/22, 6/29 → mRSI flipped 79% NOT MET → 92% MET). API gotchas: trial `RSI-modified` is ×100 vs the DB scale; asymmetry = metric `Eccentric Braking Impulse` with `limb='Asym'` (validated to match DB −3.7 on the 6/08 test); tests endpoint = `GET {region}/tests?TenantId&ModifiedFromUtc` paged by last `modifiedDateUtc` until 204.

Related: [[speedprofiling-data-gotchas]]
