---
name: brain-audit-loop
description: "The /brain-audit skill — what it scores, where reports and the trend live, and the manual-vs-cron failure it exists to catch"
metadata: 
  node_type: memory
  type: project
  originSessionId: 83464d9d-8262-4ca8-9aed-13167ae4fa1f
  modified: 2026-10-23T16:08:16.654Z
---

Built 2026-09-07 from a gap analysis of a Nate Herk AIOS video. The video's own
content was mostly things already built better here (routing map, graphify,
command centre); the four things missing were a **recurring scored audit**, a
**level-up step**, a **topic-driven grill that files itself**, and a **rubric for
"is this working"**. Analysis: `~/SecondBrain/Inbox/2026-09-07-aios-video-gap-analysis.md`.

**The skill:** `~/.claude/skills/brain-audit/` — `SKILL.md` plus `measure.sh`
(deterministic facts, ~7s). Scores the four C's (context, connections,
capabilities, cadence) 25 points each, runs three pass/fail tests, writes
`~/SecondBrain/audits/brain-audit-YYYY-MM-DD.md`, appends one row to
`~/SecondBrain/audits/_trend.md`, and proposes **exactly two** builds. Paths are
registered in `~/.claude/skills/_shared/config.json` as `vault_audits` /
`vault_audit_trend`.

**Baseline 2026-09-07: 67/100** (context 17, connections 22, capabilities 15,
cadence 13). Two builds it proposed and Eric has not yet started: `/grill-me
<topic>` writing to `Inbox/grills/`, and putting `/brain-audit` on the monthly
`com.keystone.rituals` timer.

**Why:** The recurring failure in this system is not bloat or drift — it is that
**everything with a cron stays alive and everything manual freezes inside six
weeks.** Measured twice: `Notes/` froze 2026-06-05, restarted after the
2026-07-24 audit (11 → 23 notes), froze again 2026-08-03. The single prior audit
sat alone for 45 days. A scored trend is the countermeasure, and it only works if
it is itself on a timer.

**How to apply:** Don't score `Inbox/` freshness as health — it is cron-fed by
`meeting-sync` and grows daily regardless. `Notes/` and `Drafts/` are the honest
signal, which is why cadence is scored on `Notes/` rather than on job exit codes.
When proposing builds, prefer automating an existing manual step over adding a new
capability, and check the proposal against [[working-conditions-bottleneck]] —
the grill-me build was chosen because that memory says the limiting factor is the
absence of a thinking partner and the right move is helping him capture what
surfaces. Stay off two neighbours' territory: `claude-stack-doctor` owns plumbing,
`improve-system` owns note-level rot. Related: [[keystoneos-verification-habits]],
[[ingest-review-gate]].
