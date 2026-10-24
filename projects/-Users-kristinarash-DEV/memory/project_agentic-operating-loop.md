---
name: agentic-operating-loop
description: "The agreed day-to-day process for running coding agents (one task, one agent, one commit) and the stack decisions behind it; where it is written down"
metadata:
  node_type: memory
  type: project
  originSessionId: 408ba3bc-96bc-4947-9341-3eca45e1fb41
  modified: 2026-10-24T05:58:42.332Z
---

Decided 2026-10-14. The operating process for coding agents is the 8-step loop now in
`~/DEV/WORKFLOW.md` ("The work block: the loop"): pull one Next item, read its doc, run the
validate command (it must fail), start one agent with the goal contract, re-run the command
yourself, read the diff, gate, commit that item alone. Source: Asyncdot's "Chief of Staff"
pattern plus David Ondrej's `goal-loop` skill. Full notes:
`~/DEV/_INBOX/2026-10-14-agentic-operating-process.md` and
`~/DEV/_INBOX/2026-10-14-david-ondrej-repos-agentic-review.md`.

Stack decisions: stay on Claude Code; Codex plugin is the single second-opinion reviewer;
no five-reviewer fan-outs, no autogit auto-push, no Pi/OpenRouter model sprawl. Many small
repos stay (cloud sessions clone from GitHub, so push first).
**Cloudroom dropped entirely 2026-10-24** (Eric): app, LaunchAgent and `room-cli` skill removed.
Long runs go to a separate Claude Code session (desktop app, or claude.ai/code cloud).

**Why:** Eric is usage-sensitive and was at 55% system / 45% real work. The loop is habits,
not tools. **How to apply:** when Eric asks about agent workflow, Cloudroom, worktrees,
reviewers or "how should I run this", point at WORKFLOW.md and the loop before proposing a
new tool. Related: [[skill-bloat-and-promotion]], [[harness-time-budget]],
[[cloud-copy-approval]], [[session-hygiene]].
