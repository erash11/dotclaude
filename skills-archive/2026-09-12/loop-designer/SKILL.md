---
name: loop-designer
description: Designs safe agentic loops from recurring workflows, producing a Loop Card with discovery inputs, durable state, generator task, evaluator checks, human checkpoint, permissions, caps, and schedule. Use when the user says "make this a loop", "turn this workflow into a loop", "design a loop", "loopify this", or asks whether a repeated workflow should become an automation/skill/cadence.
---

# Loop Designer

Turn a repeated workflow into a controlled loop specification. Do not jump straight to automation. First design the loop so it can be run manually once, verified, then scheduled later.

## Operating Stance

- A loop is safe only if it has discovery, handoff, verification, persistence, and scheduling.
- The generator must not be the only evaluator of its own work.
- State must live outside chat in a file, issue, board, note, or dashboard artifact.
- Keep at least one human checkpoint for judgment, especially before merge, send, delete, publish, or claim escalation.
- Prefer read-only or narrowly scoped connectors until the loop has earned write permissions.
- Add verification before adding parallelism.

## Workflow

1. **Identify the repeated workflow:** name the recurring job, user-visible outcome, and cadence or trigger.
2. **Map the five moves:** discovery, handoff, verification, persistence, scheduling.
3. **Define the safety boundary:** allowed actions, no-go actions, human checkpoint, caps, rollback or stop condition.
4. **Choose the first implementation tier:**
   - Tier 0: checklist only; no automation.
   - Tier 1: manual skill-run writes a state file.
   - Tier 2: scheduled read-only loop drafts a packet.
   - Tier 3: scheduled loop opens tickets/PRs but does not merge/send/delete.
   - Tier 4: limited writes after repeated verified success.
5. **Write a Loop Card:** keep it concrete enough that another agent can run the first manual dry run without the original conversation.

## Loop Card Template

```md
# Loop Card: <workflow>

## Purpose
<What recurring outcome this loop creates, and why it matters.>

## Trigger
<Manual phrase, schedule, event, or input source.>

## Discovery Inputs
- <file/query/API/dashboard/inbox/source>

## State File
<Durable path, board, issue, note, or artifact that survives chat.>

## Generator Task
<The bounded work the producing agent may do.>

## Evaluator Checks
- <Command, test, source comparison, browser check, data check, or reviewer agent instructions>

## Human Checkpoint
<Where Eric must approve, inspect, or make a judgment call.>

## Allowed Actions
- <Read/write actions the loop may take.>

## No-Go Actions
- <Actions the loop must not take, such as merge, send, publish, delete, or invent evidence.>

## Caps
- Time:
- Tokens/cost:
- Retries:
- Parallelism:

## Schedule
<Manual first; later cadence only after dry-run evidence.>

## First Manual Dry Run
1. <Step>
2. <Step>
3. <Verification evidence to capture>
```

## KeystoneOS Defaults

When working inside KeystoneOS or one of Eric's active project repos:

**Paths:** canonical vault locations and the KeystoneOS environment paths below live in `/Users/kristinarash/.claude/skills/_shared/config.json` (SecondBrain keys plus the `keystone` block) — load it if unsure; if a literal path here ever disagrees, the config wins.

- Start from `.\scripts\keystone.ps1 context <ProjectKey>` for project loops.
- Use project briefs, `outputs/*`, SecondBrain notes, repo handoff docs, and memory packets as discovery inputs.
- Put generated loop specs in `docs/superpowers/specs/` or a project-local docs folder when the loop changes repo behavior.
- Use `verification/default-checklist.md` as a baseline for evaluator checks.
- Leave commits, publishes, emails, and external writes behind a human checkpoint unless the user explicitly asks to automate that action.

## Output

Return:

1. A short recommendation: do not loop / manual skill / scheduled read-only / scheduled write-limited.
2. The Loop Card.
3. The first manual dry-run command or checklist.
4. The specific evidence required before scheduling.
