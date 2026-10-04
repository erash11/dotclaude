---
name: harness-time-budget
description: "Harness/system work is capped to a weekly Friday slot; outside it, defer fixes and steer to real work"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 786ccf63-5477-4140-ad17-9a8760e9a864
  modified: 2026-10-03T15:52:10.338Z
---

Eric set a budget on harness and system work (hooks, skills, memory, KeystoneOS, sync, doctor checks) on 2026-10-03.

- System work happens only in the weekly Friday 1:00–2:00 PM Central "Harness slot" (Google Calendar, from 2026-10-09).
- Outside the slot, note the fix in a list. Fix it now only if it blocks real work today.
- Stop when the hour ends. Leftovers wait for next Friday.
- A new tool, hook or skill must replace an old one.
- Start sessions with the project work, not doctor/stack checks. Run `claude-stack-doctor` only after a second failure.
- Let small breakage (noisy logs, stale counts, duplicate hooks) wait if there is a workaround.

**Why:** A 60-day measurement to 2026-10-03 estimated ~55% system / 45% real work (commits: 65/35). Eric wants more time creating and shipping.

**How to apply:** When a session drifts into harness tinkering outside Friday's slot, say so and offer to log it instead. Do not propose new system pieces unasked. A ratio recheck is on the calendar for 2026-11-02 (method in the event notes); the goal is real work above 50%.

Related: [[working-conditions-bottleneck]], [[skill-bloat-and-promotion]], [[session-hygiene]].
