---
name: feedback-daily-brief-and-execution-partner
description: Eric wants Claude used as thought-partner + execution layer, and wants a daily morning on-ramp brief
metadata:
  type: feedback
---

Eric wants to lean on Claude more as both a **thought partner and an execution layer** — his self-identified bottleneck is distilling his many ideas into a few actionable steps and holding daily momentum (things fall through the cracks). He wants a **daily morning on-ramp brief**: yesterday's incompletes → today's must-dos → the week's big rocks.

**Why:** 2026-06-02 end-of-day interview — frustrated by low progress on a Tuesday; named focus, organization, and clarity-of-outcomes as the gap. See vault notes [[the-daily-on-ramp]] and [[self-authored-direction]].

**How to apply:**
- When he idea-dumps, don't just discuss — distill into a short, ordered, actionable list and offer to drive execution.
- Push for outcome clarity early ("what does done look like?") rather than activity.
- Tie daily work up to weekly big rocks / the Applied Performance OKR cadence (weekly Thursday check-in). The daily brief is the daily tier beneath the weekly OKR check-in.
- **Daily on-ramp ritual (built 2026-06-03):** run `bash morning-briefings/onramp.sh` — it pulls gws calendar + OKR next-actions + carry-forward (yesterday's unchecked `- [ ]`) into a compact payload, deliberately keeping raw calendar/email JSON OUT of context to save tokens. Then distill "today's must-dos" and prepend the on-ramp (① carry-forward → ② must-dos → ③ week's big rocks) to `morning-briefings/<date>.md`, above the existing Outlook inbox triage.
- Eric chose "Claude assembles it" (vs a full script) but **explicitly worried about token burn** — so keep it cheap: lean on `onramp.sh` for the deterministic pulls and only add the judgment/distillation layer. Don't re-parse raw JSON in-session.
- The Outlook inbox triage in `morning-briefings/<date>.md` is produced by a separate `morning-briefing` system; the on-ramp sits on top of it, doesn't replace it.
