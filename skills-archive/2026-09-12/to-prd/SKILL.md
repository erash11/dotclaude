---
name: to-prd
description: Turn the current conversation into a PRD and publish it to the project issue tracker. Use only when the user explicitly asks to create, synthesize, or publish a PRD from context already discussed; do not trigger for ordinary planning or implementation.
---

This skill takes the current conversation context and codebase understanding and produces a PRD. Do NOT interview the user — just synthesize what you already know.

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-matt-pocock-skills` if not.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's domain glossary vocabulary throughout the PRD, and respect any ADRs in the area you're touching.

2. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better - the ideal number is one.

Check with the user that these seams match their expectations.

3. Write the PRD using the template below, then publish it to the project issue tracker. Apply the `ready-for-agent` triage label - no need for additional triage.

<prd-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this PRD.

## Further Notes

Any further notes about the feature.

</prd-template>

## Verification Gate

Before publishing, create a requirement ledger from the conversation and referenced artifacts. Give each requirement an ID and map it to exactly one of: a PRD section, `Out of Scope`, or an explicit open question.

Require all of the following for `PASS`:

- Every requirement is mapped; no request is silently dropped.
- Every user story describes observable user value and has a corresponding test seam or testing decision.
- Implementation decisions are supported by the conversation, codebase, ADRs, or are clearly labeled as proposals.
- Scope boundaries and unresolved decisions are explicit; no unexplained placeholder remains.
- The user-confirmed test seams still match the final PRD.
- After publication, the returned issue URL opens and its body matches the final artifact.

Report `FAIL` for an orphan requirement, invented decision, missing verification method, or publication mismatch. Report `DEGRADED` when the issue tracker cannot be read back; do not claim publication was verified.
