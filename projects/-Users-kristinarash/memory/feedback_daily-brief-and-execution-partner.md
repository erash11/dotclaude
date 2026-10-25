---
name: daily-brief-and-execution-partner
description: Eric wants Claude used as thought-partner + execution layer, and wants a daily morning on-ramp brief
metadata:
  type: feedback
---

Eric wants to lean on Claude more as both a **thought partner and an execution layer** — his self-identified bottleneck is distilling his many ideas into a few actionable steps and holding daily momentum (things fall through the cracks). He wants a **daily morning on-ramp brief**: yesterday's incompletes → today's must-dos → the week's big rocks.

**Why:** 2026-06-02 end-of-day interview — frustrated by low progress on a Tuesday; named focus, organization, and clarity-of-outcomes as the gap. See vault notes [[the-daily-on-ramp]] and [[self-authored-direction]].

**How to apply:**
- When he idea-dumps, don't just discuss — distill into a short, ordered, actionable list and offer to drive execution.
- Push for outcome clarity early ("what does done look like?") rather than activity.
- Tie daily work up to weekly big rocks / the Applied Performance OKR cadence (weekly Thursday check-in). The daily brief is the daily tier beneath the weekly OKR check-in. Superseded 2026-09-14: the Thursday check-ins are history; the Prioritization Rules slate replaced the cadence doc (see DEV memory `project_prioritization-slate.md`).
- **The on-ramp mechanism is gone.** `morning-briefings/onramp.sh`, the Outlook
  inbox triage, and the `morning-briefing` system were retired 2026-08-14: the
  directory was deleted, the launchd job disabled, and Outlook auth destroyed.
  Do not try to run them. The *preference* above still stands — the daily
  distillation is now done in-session, not by a script.
- His original constraint still applies: he chose "Claude assembles it" over a
  full script but was explicit about token burn. Keep the daily pass cheap and
  do not re-parse raw calendar/email JSON in-session.
- The weekly tie-up is the Applied Performance OKR cadence. Use the v3 OKR doc
  as the source, not the older cadence doc — see the DEV memory
  `status-report-sourcing`.
