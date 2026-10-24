---
name: no-follow-up-on-eric
description: "Eric takes the recommended option and does not verify or remember follow-up steps; design every loop so it runs or alerts without him, and verify the work yourself"
metadata:
  type: feedback
---

Eric defers to the recommended option and relies on the agent to verify. Work that depends on him remembering a step, checking a result, or starting a test later will not get done. Example (2026-10-23, recall bench): 'add that to the recall test' was replaced by an agent rule (memory-write skill: a wrong or stale recall becomes a bench question unasked) plus an unattended daily check in the backup (`~/.claude/scripts/recall-bench/check.py`). Related: [[working-conditions-bottleneck]], [[recall-bench]].

**Why:** Eric, 2026-10-23: 'I'm not going to remember to do that. A lot of the times ... I just pick your suggestion and your recommendation ... I don't verify a lot of my work. I ask you to do it for me.' A step that waits on him does not happen.

**How to apply:** Never end on a habit for Eric to keep ('tell me when X'). Make the agent do it unasked (a rule in the skill/AGENTS.md the session reads) or make it run unattended and report through .errors.log, which every session shows. Verify results yourself before calling work done. Still give a recommendation first; it is the option he will take, so make it the safe, complete one. Confirm only hard-to-reverse or outward-facing actions.
