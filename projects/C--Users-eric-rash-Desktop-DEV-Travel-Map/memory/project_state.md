---
name: Project deployment and live state
description: Where the app is deployed, how to deploy, current feature state, and handoff docs
type: project
originSessionId: fdcd7ac4-6db3-4b52-943a-0e60fae67a61
---
Live at: https://erash11.github.io/Travel_Map/ — GitHub repo erash11/Travel_Map (main).
Deployed via GitHub Actions on push to main (npm ci → build → deploy-pages).

**As of 2026-06-10:**
- Softball 2026 data complete + verified vs BaylorBears.com/big12sports.com (58 games incl. Big 12 Tourney + NCAA Austin Regional; 30-28; 10,842 mi).
- Cinematic mode shipped: full-screen 3D globe season tour (react-globe.gl, lazy chunk). Spec: `docs/superpowers/specs/2026-06-10-cinematic-mode-design.md`.
- CSV schedule import SHIPPED (Eric-only tool; geocoded validation, localStorage preview, download JSON → commit to publish). Spec: `docs/superpowers/specs/2026-06-10-schedule-import-design.md`. Regenerate city DB: `node scripts/build-cities.mjs`.
- `AGENTS.md` in repo = cross-agent handoff doc (Codex-compatible); keep it updated alongside CLAUDE.md.

**Why:** Re-running a failed deploy job causes "duplicate artifact" — use workflow_dispatch for fresh deploys.

**How to apply:** Push to main only when tests+build pass (deploys production immediately). Destination identity is `lat,lng`, never location string (two Austin trips). Check Actions tab if deploy looks stuck.

Worktrees at .worktrees/ (gitignored); `feature/multi-sport-travel-map` fully merged.
