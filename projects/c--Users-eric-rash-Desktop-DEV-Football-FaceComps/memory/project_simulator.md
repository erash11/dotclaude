---
name: simulator
description: Status and key facts about the Next.js simulator app built in simulator/
metadata: 
  node_type: memory
  type: project
  originSessionId: e33d2ec0-8479-4d9f-8df2-a39a8c9fc4e1
---

The simulator is fully built and deployed at https://baylor-load-sim.vercel.app.

**Why:** Coaches needed a web-based tool to plan practice load using GPS data from Catapult, with duration-scaled calculations (PL/min), real-time drill-swap suggestions, and post-practice projection-vs-actual calibration.

**Status as of 2026-05-27:**
- App live, GitHub auto-deploy on push to `main` works end-to-end (~32s build). Vercel project Root Directory = `simulator`.
- **Fall Camp 2026 mode shipped to `main` (2026-05-24, sync Plan 3 done 2026-05-26).** This is what the 2026-05-22 Codex handoff produced (plus subsequent Claude sessions). Verified present: `lib/calibration.ts` (calibration domain abstraction, `SPRING_2026`/`FALL_CAMP_2026`), `lib/fallCampLibrary.generated.ts`, season-aware `syncPractice`. Full handoff in `simulator/AGENTS.md`. Details now live in root `CLAUDE.md` Fall Camp section — treat that as authoritative.
- Root `AGENTS.md` now exists (the handoff note's suggestion was acted on) — Codex opened at repo root sees project context.

**Architecture snapshot (still current as of 2026-05-12 work):**
- **Sync pipeline hardened**: idempotent (every sync wipes auto-created rows + clears actuals, then populates fresh), bounds-validated (rejects impossible values with diagnostic warnings), bulk-capable (`Sync All`/`Sync Unsynced`/`Sync Selected` in `/admin`).
- **Activity matching** is by name-encoded date (`SP26 - P{N} - MM.DD.YY` format) rather than Catapult's unreliable API date filter.
- **Auto-create** for unknown Catapult period names (TEAM PASS, PODS, FAST THURSDAY, TEAM 12P, etc.) inherits a prefix-matched baseline (TEAM PASS → TEAM 432/12) or falls back to 300/10.
- **Aggregation** for multiple Catapult sub-periods → single DB row (INDY 1 + INDY 2 → INDIVIDUAL). Sums PL, recomputes weighted per-min.
- **`(SCRIM)` and other parenthetical tags are preserved as distinct canonical names** — coach decision; they denote scrimmage-day periods vs regular-day periods which must be analyzed separately.
- **Drag-to-reorder periods** on `/simulator` via @dnd-kit, persists via PATCH `/api/practices/[id]/periods/reorder`.
- **Sync rewrites `order_index`** to actual Catapult chronological order at end of every sync. User drag-orders get overwritten on next sync (tradeoff — practice planning typically happens before sync).
- **Two charts**: `PracticeFlowChart` on simulator (3 overlaid metrics: PL/Player primary, PL/min, Duration), `ComparisonChart` on `/practices/[id]/compare` (projected vs actual PL/p with red/green gap shading). Both hand-rolled SVG, no chart library.
- **Vercel Deployment Protection** confirmed OFF for production (the `bearsnation` cookie gate in `proxy.ts` is the access control).

**Unit convention — read before touching sync math:**
- `PERIOD_DEFAULTS.plTeam` values are composite team-scale (TEAM=432, RUN THRU=555). Multiplying by `RATIO=0.09772` gives per-player PL.
- Catapult returns `average_player_load` and `player_load_per_minute` as per-player (typical 2-50). Sync route divides by `RATIO` before storing to keep everything on composite scale.
- If numbers are ~10× off in either direction, the RATIO conversion is the suspect.

**`total_duration` gotcha:** Catapult's `total_duration` field is athlete-seconds (sum across the roster), not wall-clock. Do not use it to derive period minutes. `aggregatePeriodStats` derives duration from `avg_pl / pl_per_min` instead.

**Open follow-ups (NEXT SESSION PRIORITY at top):**
- **Promote Comparison to a top-level nav tab** — STILL OPEN as of 2026-05-27 (verified: `app/layout.tsx` only links Simulator + Reference Card; no `/comparison` route exists). Confirmed 2026-05-12. Add `/comparison` index route listing all practices with sync status + accuracy summary; cards link into the existing `/practices/[id]/compare` page (URL unchanged so LoadGauge link still works). Add "Comparison" between Simulator and Reference Card in `app/layout.tsx`. ~30-45 min, no schema changes. Also natural home for scrim-vs-regular and other season-level views later.
- **Practice-face seed cleanup for scrimmage days**: scrim practices have regular `SPECIAL TEAMS` / `TEAM` seed rows that get left empty because the actual practice ran SCRIM variants. Either fix the practice face seed for scrim days or accept the empty rows.
- **Scrimmage-vs-regular calibration view**: spec at `docs/superpowers/specs/2026-05-12-scrimmage-vs-regular-comparison.md`. Trigger to build = first fall camp scrimmage (late July / early August 2026).
- **Tier-3 polish remaining**: per-practice "lock order" flag if hand-ordering becomes important.

**Codex handoff note (2026-05-22, RESOLVED 2026-05-27):**
- Codex reads `AGENTS.md` files natively. Root `AGENTS.md` now exists, so Codex opened at the repo root sees project context. `simulator/AGENTS.md` carries the Fall Camp handoff detail. Original concern (no root AGENTS.md) is resolved.

**Key gotchas (still current):**
- Next.js 16: `proxy.ts` not `middleware.ts`; route params are `Promise<{...}>`, must `await`.
- Neon returns Date objects — wrap in `JSON.parse(JSON.stringify(...))` before passing to client components, OR use `normalizePractice`/`normalizePeriod` from `lib/normalize.ts` which also coerces numeric columns from string.
- Always use `getDb()` lazy init, never module-level `sql` export (crashes `next build`).
- Env vars (DATABASE_URL, SITE_PASSWORD, COOKIE_SECRET, CATAPULT_TOKEN) all set in Vercel.
- Auto-deploy requires the commit author's email to be verified on the `erash11` GitHub account (see [[github-identity]]).
