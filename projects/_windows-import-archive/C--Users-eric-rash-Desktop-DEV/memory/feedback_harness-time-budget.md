---
name: harness-time-budget
description: "Harness/system work is done as it comes up, not on a schedule; start with project work, a new tool must replace an old one"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 786ccf63-5477-4140-ad17-9a8760e9a864
  modified: 2026-10-12T00:58:04.873Z
---

Eric set a budget on harness and system work (hooks, skills, memory, KeystoneOS, sync, doctor checks) on 2026-10-03. On 2026-10-11 he dropped the Friday slot: he does system work as it is needed, as the work comes up, not on a schedule.

- No weekly Friday "Harness slot". Do harness fixes when they come up.
- A new tool, hook or skill must replace an old one.
- Start sessions with the project work, not doctor/stack checks. Run `claude-stack-doctor` only after a second failure.
- Let small breakage (noisy logs, stale counts, duplicate hooks) wait if there is a workaround.

**Why:** A 60-day measurement to 2026-10-03 estimated ~55% system / 45% real work (commits: 65/35). Eric wants more time creating and shipping. He chose to handle system work as it comes up instead of in a fixed slot.

**How to apply:** Do system work when it is needed, without a time box. Still start with project work. Do not propose new system pieces unasked. A ratio recheck is on the calendar for 2026-11-02 (method in the event notes); the goal is real work above 50%.

Related: [[working-conditions-bottleneck]], [[skill-bloat-and-promotion]], [[session-hygiene]].
