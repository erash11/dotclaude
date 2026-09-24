---
name: current-state
description: Risk Stratification Engine current state as of 2026-05-04 — 175 tests, coverage-stratified evaluation complete, ForcePlate backfill incomplete
type: project
originSessionId: 407af261-37d4-435b-ac8f-3f912a8cade0
---
Repository: https://github.com/erash11/Risk_Stratification_Engine.git
Branch: master
Latest commit: 14aa688 feat: add coverage-stratified evaluation sprint artifacts

**Why:** Tracking active state so future sessions don't re-derive what sprints ran and what was found.
**How to apply:** Use as orientation before proposing next work; verify against current code since this may drift.

## Test Count
175 passing (as of 2026-05-04)

## Modules (src/risk_stratification_engine/)
domain, events, trajectories, config, live_sources, data_quality, io, evaluation, graphs, models, experiments, calibration, cli, alert_episodes, episode_quality, case_review, model_diagnostics, injury_context, injury_outcomes, policy_sprints, shadow_mode, season_drift, **coverage_analysis** (newest)

## Graph Snapshot Features (13 total — unchanged)
time_index, node_count, edge_count, mean_abs_correlation, edge_density, delta_edge_count, delta_mean_abs_correlation, delta_edge_density, graph_instability, z_mean_abs_correlation, z_edge_density, z_edge_count, z_graph_instability

## Primary Modeling Candidate
L2 regularized logistic + graph window 4 (confirmed across robustness sprints)

## All CLI Experiment Modes
- Standard run: `risk-engine --from-live-sources --paths-config config/paths.local.yaml --output-dir outputs --experiment-id <id> --model-variant l2`
- Window sensitivity: `--window-sensitivity-sizes 2 4 7`
- Model robustness: `--model-robustness-sprint --stability-splits 5`
- Combined window/model robustness: `--model-robustness-sprint --window-sensitivity-sizes 2 4 7`
- Calibration thresholds: `--calibration-thresholds`
- Alert episodes: `--alert-episodes`
- Injury outcome policies: `--injury-outcome-policies`
- Outcome-policy model comparison: `--outcome-policy-model-comparison`
- Policy decision sprint: `--policy-decision-sprint --policy-window-sizes 2 4 7`
- Shadow-mode stability: `--shadow-mode-stability`
- Season drift diagnostic: `--season-drift-diagnostic`
- Coverage-stratified evaluation: `--coverage-stratified-evaluation` ← newest

## Fixed Shadow-Mode Policy Package (from policy decision sprint)
- broad_30d: exclude_concussion, window 4, top-5%
- severity_7d: model_safe_time_loss, window 4, top-10%
- severity_14d: model_safe_time_loss, window 4, top-10%
- subtype_lower_extremity_soft_tissue_30d: lower_extremity_soft_tissue, window 2, top-10%

## Key Research Findings (chronological)
1. Shadow-mode channels are unstable across seasons (capture range 6%-33%)
2. Season drift diagnostic: 2025-2026 dominates every channel; also has ~25x more measurement rows and 4 sources vs 1 in early seasons
3. **Coverage-stratified evaluation (latest):** coverage_flag = `coverage_confounded`. High-coverage athletes captured at 24-38%, low-coverage at 8-14% across all four channels. Mean high-low gap ~21 pp, well above the 15 pp confounded threshold. Tier distribution: 348 low / 293 medium / 313 high athlete-seasons.

## Coverage Analysis Module (coverage_analysis.py)
- `build_coverage_tiers(measurements)` → population-wide tertile of measurement_days per athlete-season
- `build_coverage_stratified_evaluation(timeline_with_tiers, channel)` → per-tier/season capture stats using population-wide threshold
- `build_coverage_flag(channel_results)` → coverage_confounded / coverage_independent / mixed (15pp / 5pp thresholds; requires consistency across all channels for independent)
- `write_coverage_stratified_evaluation_report(path, result)`
- Artifacts: coverage_tiers.csv, coverage_stratified_evaluation.csv, coverage_stratified_evaluation.json, coverage_stratified_evaluation_report.md

## Upstream Pipeline Status (as of 2026-05-04)
The coverage_confounded finding prompted an attempt to backfill historical data from source systems:

**GPS** (`DataBase_GPS_Reporting/gps_report/bulk_import.py`): ✅ Complete — 514 sessions imported from 2020-07-01 to 2026-04-30, 154 already existed, 0 errors.

**Perch** (`PlayerProfiles_FB_03-28-2026/src/perch_ingest.py`): ✅ Complete — 58,425 set records upserted from 2022-03-01 to 2026-04-29 (Perch data collection started spring 2022).

**ForcePlate** (`ForcePlate_DecisionSystem/run_pipeline.py`): ❌ Incomplete. The VALD API pipeline fetches trial data one test at a time. Two runs were attempted:
- First run (`--from-date 2020-07-01`): Completed IMTP (7,870 tests, 0 new rows — all existed), started CMJ (57,926 total), reached ~4,300/57,926 (7%) before being interrupted by a computer restart.
- Second run (`--from-date 2023-01-01`): Stalled — CPU time stopped advancing, suspected API hang. Process was manually killed.
- ~4,300 CMJ tests already written to the DB from the first run are preserved (`ON CONFLICT DO NOTHING`).

**To complete ForcePlate backfill:** Run from ForcePlate_DecisionSystem directory in a dedicated terminal (not VS Code):
```
python run_pipeline.py --from-date 2023-01-01
```
This is safe to re-run — existing records are skipped. The pipeline may stall on API timeouts; if it hangs, kill and restart. Each restart resumes from what was already written.

## Next Research Step
Re-run the Risk Stratification Engine live ingestion after ForcePlate backfill completes, then re-run `--coverage-stratified-evaluation` to see if the `coverage_confounded` flag persists once pipeline gaps are closed. If it changes to `mixed` or `coverage_independent`, the season drift finding was largely a data artifact. If it remains `coverage_confounded`, true monitoring density is a confounder and the next sprint should test coverage-normalized modeling.
