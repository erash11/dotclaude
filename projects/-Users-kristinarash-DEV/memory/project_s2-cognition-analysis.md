---
name: s2-cognition-analysis
description: "S2 Cognition data traps (vendor reference group, P/K short battery, invalid reports) and the standing rule that any flagging threshold must be null-calibrated and pre-registered before the data is touched"
metadata: 
  node_type: memory
  type: project
  originSessionId: 856bd54e-8db3-42f5-a770-103ee081614e
  modified: 2026-08-16T18:37:34.242Z
---

S2 Cognition analysis lives at `~/DEV/Performance/S2_Evaluation` (private repo `erash11/S2_Evaluation`). V1 shipped 2026-08-16 with a **null finding**: no offensive lineman is cognitively atypical once the flagging threshold is calibrated against a null model.

**Vendor data traps** (learned the hard way, not documented by S2):

- Percentiles are scored against **"NFL PROSPECTS - ALL POSITIONS"**, not a college or position-specific reference group. So a percentile is only comparable *within* that reference group — cross-position pooling is legitimate (Baylor rooms range 42nd–82nd), but "50th percentile" does not mean "average for his position."
- The **P/K battery has only 7 measures**, not the usual 9, with zero N/A cells. That is structural to the vendor's short battery, not a parse bug — don't chase it.
- Some reports fail S2's own **validity check**; the vendor marks them INVALID. Exclude them from analysis and surface as a retest recommendation instead of silently dropping.
- Test years are mixed across a roster. Flag the year as a diagnostic; don't filter on it.

**Standing methodological rule** (ADR 0013, applies beyond S2): never set a "flag the outlier" threshold without first simulating what a **pure-noise room** produces at that threshold. The original 1.5 SD rule flagged 10 of 15 linemen; a homogeneous null room flags 7–13 of 15, so the rule was measuring nothing. Related: with 9 categories, max-over-N inflation makes almost any naive threshold vacuous.

Corollary — because Eric is his own reviewer on side-lane projects, thresholds get **pre-registered in a timestamped git commit before the data is on the machine**. Changing a threshold after seeing results requires a new ADR stating what was wrong; never retune silently.

Related: [[cfb-analytics-lab]], [[status-report-sourcing]]
