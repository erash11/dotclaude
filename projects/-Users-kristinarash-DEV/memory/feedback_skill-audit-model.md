---
name: skill-audit-model
description: "Skill-audit agents run on Sonnet, not Opus; never Haiku"
metadata:
  type: feedback
---

Skill-audit agents use a cheaper model: Sonnet (Agent tool model: "sonnet"). Not Opus. Never Haiku.

**Why:** Eric asked 2026-10-31 after the first parallel 5-agent audit (forecast-capture, project, codex-review, name-meetings, ingest-book) ran on Opus. He is usage-sensitive. Haiku is too weak: audits must find real bugs and verify claims (it also wrote wrong facts in the memory-compiler test, see [[memory-compiler-pipeline]]).

**How to apply:** Pass model: "sonnet" on every Agent call that audits a skill from ~/DEV/docs/SKILL-AUDIT-LIST.md. Keep the coordinator (main session) for the list updates and pushes. Related: [[skill-audit-list]].
