---
name: cfb-forecast-capture
description: "CFB Victory Model weekly forecast freeze — all 16 Big 12 teams via scripts/weekly_run.sh, archive mirror, Monday-anchored check 2026-08-24 to 2027-01-23 (logged only, no nag since 2026-09-24), Mac only, no backfill, and how to tell a real missed week from a stale snapshot"
metadata: 
  node_type: memory
  type: project
  originSessionId: 330c1f71-242a-47c7-ac7b-129bd6f5dd3c
  modified: 2026-10-24T14:51:24.467Z
---

The CFB Victory Model's pre-game forecasts are frozen once per week by the
`/forecast-capture` skill, which snapshots predictions **before kickoff** and reports what
moved since the prior week.

## Scope and entry point (changed 2026-09-02, per Eric)

- **All 16 Big 12 teams every week**, not Baylor only. The list is the `BIG12` constant in
  `weekly_capture.py` — one home; do not copy team lists into the wrapper or the skill.
  `--teams`/`--team` still narrow a run. Budget ~10 min for the full sweep.
- **One entry point:** `~/DEV/CFB_Victory_Model/scripts/weekly_run.sh` (capture → compare
  `--all --archive`). It hardcodes the absolute `uv` path.
- **Archive mirror:** every snapshot and comparison is copied to
  `~/DEV/CFB_Forecast_Archive/<season>/`. Read-only copy; truth stays in
  `CFB_Victory_Model/data/`. Registered in `backup-manifest.json` as `personal`/ssd —
  see [[backup-sync-system]] for why a new `~/DEV` folder must be added there.
- The ritual guard still keys off the newest `*_baylor.csv`, which the Big 12 sweep always
  writes, so detection is unaffected.

## A gap can mean the other machine captured it

Confirmed 2026-09-09. The Mac's `data/weekly_forecast_log.csv` looked like it had
missed 2026-08-26 and 2026-08-31 — it jumped 07-31 → 09-02. Neither week was
missed. **Both were captured on the Windows box**, which runs the same wrapper
against the same repo. The two machines had diverged, each holding captures the
other lacked.

Before declaring a missed week, check the other machine's copy of the log.
Merging is safe: the natural key is `(captured_at, season, team, week, game_id)`,
and a union on that key had **zero conflicts** across 216 Mac + 348 Windows rows
→ 540. Same key never carried different values. See [[github-consolidation]].

**Superseded 2026-10-24:** the capture now runs on the Mac only. The Windows laptop has had no
terminal work or jobs since 2026-10-14 (desktop-app only since 10-21). Check the Windows copy
only for weeks before then; a later gap is a real gap.

## An old newest-snapshot file is not proof of a missed week

Checked 2026-09-02: the newest snapshot was `2026-07-31_baylor.csv`, and both the skill and
COMMANDS.md asserted the 08-24 and 08-31 weeks were "gone for good". They were not — Baylor's
opener was 2026-09-05, so no game had been played and nothing had been overwritten. **A week
is lost only if a game was actually played inside the gap.** Verify before declaring a loss:

```
curl -s "https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/239/schedule?season=2026"
```

(239 = Baylor; read each event's `status.type.name`.) Both docs were corrected.

## Cadence

- ~~**Wednesdays**, season window **2026-08-26 → 2027-01-20**~~ — superseded
  2026-08-15. Current cadence is **Monday-anchored**, season window
  **2026-08-24 → 2027-01-23**. See "Cadence" below, which is authoritative.

## "Nothing moved" in season = dead report link (2026-10-23)

The site swapped to a new Power BI report around 10-05. `REPORT` in `weekly_capture.py` still
opened the old one, which kept loading with no error but froze at ~10-02. Three captures
(10-07, 10-14, 10-23) were copies; a session wrongly told Eric the *site* was stale, and Eric
corrected it (the site was current). Week 6-7 pre-game forecasts are lost. Fix: compare `REPORT`
with the iframe on `cfbvictorymodel.com/team-schedule-overview/`. Also in the repo's STATUS Gotchas.

## The constraint that makes the cadence non-negotiable

**There is no backfill.** A pre-game forecast is only capturable before the game is played;
a missed week is permanently missing from the series, not a chore that rolls
forward. This is why the reminder escalates rather than silently re-queuing.

## Mac-side guard (built 2026-08-15)

`ritual-check.ps1` now carries a fourth ritual, `forecast-capture`, so the cadence is
enforced on this machine rather than depending on memory (enforced only while the rituals
timer ran; see "Superseded 2026-10-24" under Schedule below). It detects captures from the
artifact itself — newest `*_baylor.csv` in `~/DEV/CFB_Victory_Model/data/weekly_snapshots/`
— matching the script's existing "the artifact is the record, not a state file" rule.

**The real deadline is Saturday's kickoffs, not a maintenance window.** The report
overwrites its Chance of Victory column with the realised result once a game is *played* —
that is what destroyed 2019–2025. Nothing scheduled updates midweek.

Cadence (Monday-anchored, per Eric 2026-08-15 — he wanted the warning early in the week):
**Mon DUE → Tue–Sat OVERDUE → Sun silent** (games played, week gone). Season bounds are the
Monday of the opening week (2026-08-24) and the Saturday of the closing week (2027-01-23),
widened from the documented 08-26 → 01-20 so neither end truncates a live capture window.

A third status, **RECHECK**, exists because an early capture is not proof of a good one: the
source may not have refreshed the coming weekend's numbers on Monday, so a Monday snapshot
can hold last week's figures. Treating "captured this week" as done would let a stale
snapshot pass for a good week — the exact risk that makes capturing early otherwise unsafe.
So a capture taken *earlier* in the week keeps surfacing through Wednesday. Capturing today
always satisfies today; RECHECK means *verify*, not *you missed it*.

Three counterintuitive silences (off-season, Sunday, post-Wednesday-once-captured) plus the
RECHECK window are pinned by `tests/keystone-ritual-forecast-capture.ps1`. Both a
days-since-last-capture and a naive "captured this week → OK" implementation fail them. The
script gained `-Today` and `-CfbSnapshotDir` seams to make this testable.

**`-Notify` was mute on this Mac from the migration until 2026-08-15** — it shelled out to
`msg.exe` (Windows-only), so every scheduled run hit the catch and logged "desktop prompt
unavailable" where nobody reads it. Now `osascript`, dialog with a banner fallback. This
affected *all* rituals, which is consistent with interview-me sitting 12 days overdue and
weekly-review 15. If ritual nags ever go quiet again, test `-Notify` directly before
assuming the rituals are simply current.

Schedule: `com.keystone.rituals` fires Mon–Fri 17:00 plus Fri 15:30, so Monday's DUE and the
Tue–Fri escalation all land. **Saturday and Sunday have no trigger** — Saturday's OVERDUE is
therefore only visible if the script is run by hand. Acceptable because Fri 15:30 and 17:00
are the last useful warnings anyway, but it does mean the Saturday branch is effectively a
manual-run safety net, not a live alarm.

**Superseded 2026-10-24 — nothing nags any more.** `com.keystone.rituals` has been disabled
since 2026-09-24, so none of the triggers above fire. `ritual-check.ps1` still runs daily at
06:00 inside `com.keystone.morning` (`morning-cadence.ps1`), without `-Notify`: the
forecast-capture DUE/OVERDUE shows only in `KeystoneOS/outputs/morning/cadence.log`. In season
the capture depends on someone running `/forecast-capture`. See [[automation-cadence]].

A Windows-side scheduled task `CFB-ForecastCaptureReminder` was left enabled when the
Windows box was retired 2026-08-14 — it operates under that machine's own `~/Desktop/DEV`
and touches none of the Mac repos, so it is harmless but is *not* the authoritative
reminder. See [[backup-sync-system]]. **Superseded 2026-10-24:** all Windows scheduled tasks
were disabled 2026-10-08, and the 2026-10-23 audit found this one is dead code (it calls the
archived morning-briefing package). See [[automation-cadence]] and [[work-laptop-hands-off]].

Related model/data work lives in [[cfb-analytics-lab]] (a separate project —
`~/DEV/CFB_Analytics_Lab` vs the Victory Model's own tree).

## Evaluation and the market line (2026-10-30)

- **Late capture check for all 16 teams in one call:** the ESPN scoreboard with the Big 12
  group, one date at a time (a date range returned nothing):
  `curl -s "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?groups=4&dates=YYYYMMDD&limit=100"`.
  A Friday capture is safe if no Big 12 game was played Thursday.
- **The opening betting line beat the model** on the first 68 true pregame games (winners 76% vs
  81%, margin miss 12.9 vs 11.4). A Codex audit found no correction to the model's numbers with
  a clear gain. So `weekly_run.sh` now also prints model vs opening line (`market_view.py`).
- **REA does not apply:** there is no binary, only Garrett's published Power BI report. The
  model's structure was recovered from its outputs instead (in the repo's STATUS).
- Details: `EVAL_2026_SEASON.md`, `docs/MODEL_AUDIT_2026-10-30.md` in the repo.
