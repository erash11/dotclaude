---
name: cfb-analytics-lab
description: "CFB Analytics Lab workspace at ~/DEV/CFB_Analytics_Lab — resume protocol, and the CFBD API traps that cost real budget to rediscover"
metadata: 
  node_type: memory
  type: project
  originSessionId: f6ecdcbb-242a-4647-a903-9d4ba12a4d93
  modified: 2026-08-30T05:46:29.856Z
---

`~/DEV/CFB_Analytics_Lab` is a teaching workspace created 2026-08-13 for working through
techniques from *Football Analytics with Python and R* (Eric A. Eager & Richard A. Erickson,
O'Reilly 2023) applied to **college** football data instead of the book's NFL/nflfastR data.
Private GitHub repo `erash11/CFB_Analytics_Lab`; the foundation work is **PR #1, still open** as of
2026-08-16 — `foundation` sits 21 commits ahead of `main`, and `main` holds only the spec and plan.
Check out `foundation`, not `main`, or the workspace looks empty.

**To resume:** `cd ~/DEV/CFB_Analytics_Lab`, read `MISSION.md`, then `NOTES.md`, then the newest
`learning-records/` entry. Self-describing by design — do not re-interview about the mission.
Same pattern as [[terminal-fluency-workspace]].

**Teaching protocol:** lessons are built one at a time, gated on the previous drill being
reported. Lesson 0001 (stability) is built; the drill is not yet done. Remaining planned:
EDA/regression, over-expected metrics (CPOE/RYOE), GLMs, clustering+PCA, tree ensembles,
Bayesian hierarchical. Bayesian is an extension past the book, which stops at frequentist GLMs.

**CFBD API traps — verified live 2026-08-13, each cost real calls to establish:**
- Free tier is **1,000 calls/month**, hard reset on the 1st. CFB and CBB share one pool.
- **`GET /info` does NOT decrement the quota** — budget checks are free. Verified by two
  consecutive calls leaving `usedCalls` unchanged.
- **`/plays/stats` silently truncates at exactly 2000 rows** with no error or cursor — one week
  returned 2000 rows spanning only 10 of ~107 games. Always narrow by `gameId` or `team`.
- **`/plays` requires an explicit `week`** for both `regular` and `postseason`; omitting it is a
  400. No whole-season call exists, so per-week iteration sets the cost floor (~23/season).
- **`/plays` returns no `season`, `week`, or `seasonType` field** — they must be stamped on at
  write time or every downstream aggregation breaks.
- **`/plays` includes FCS games, and coverage roughly doubles at 2022** (887 → 1,459 games/season).
  Cross-2022 year-over-year analysis on unfiltered plays compares ~217 teams against ~300 and
  gives confident wrong answers. `fbs_only` collapses it to a flat 770–808.
- Postseason weeks are **non-contiguous** (1, then 11–15, then 20), so break-on-empty stops at
  week 2. Current pull is week 1 only; the missing 127 games are all FCS.
- **A season query returns postseason rows mixed in, re-labelled with a regular-season week
  number.** `/stats/game/advanced?year=2025&team=TCU` came back with two `week: 1` rows — one
  `seasonType: "regular"` (North Carolina) and one `seasonType: "postseason"` (USC). Anything
  keyed or sorted on `week` alone silently gains a phantom duplicate game, and per-week averages
  are then wrong. **Always filter `seasonType == "regular"`** on season endpoints, not just
  `/plays`. Found 2026-08-30 building the Baylor coach report, where it printed a fake second
  week-1 opponent in a snap-count table.
- Tier-gated (401 on free): `/live/plays`, `/scoreboard`, `/games/weather`, all `/wepa/*`
  (opponent-adjusted EPA). Everything historical and play-level is available.

**Local data:** `data/raw/plays/` holds 1,495,005 plays for 2019–2025 (73 MB Parquet), pulled for
129 calls. Gitignored and regenerable via `python -m cfblab.cli pull`. Lesson 0001 needs no API
calls — it runs on `~/DEV/CFB_Victory_Model/data/cfbd/` CSVs, which also supply the `games_*.csv`
needed for FBS filtering.

**Testing:** `pytest` is free and offline (49 tests). `pytest -m live` spends one real call.

**Why:** the API constraints above are not in CFBD's docs and were established by probing that
spent budget from a cap that only resets monthly. Rediscovering them costs calls and can strand
the project for weeks.
**How to apply:** read this before touching CFBD from any project, including
[[cfb-forecast-capture]] work, which shares the same key and the same 1,000-call pool.
