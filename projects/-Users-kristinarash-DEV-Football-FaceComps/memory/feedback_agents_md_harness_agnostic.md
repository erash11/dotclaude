---
name: agents-md-harness-agnostic
description: "Eric wants all projects harness-agnostic — AGENTS.md is the source of truth, CLAUDE.md is only a pointer shim"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5ebae01f-a66c-4382-b5b7-e0eea475de1a
---

For any new project setup, write agent instructions in `AGENTS.md` (the cross-harness convention) and make `CLAUDE.md` a short pointer to it. Never put project instructions in CLAUDE.md directly.

**Why:** Eric is building an "agentic operating system" and wants every project to work seamlessly across any coding harness (Claude Code, Codex, Copilot, Gemini, etc.), with no Claude Code-only dependencies. Stated 2026-06-09 when setting up the AT_Utilization_Benchmarks project.

**How to apply:** New project → create AGENTS.md with harness-neutral instructions (describe requirements, mention CC skills only as one implementation); CLAUDE.md contains only "read AGENTS.md." When touching older projects with real CLAUDE.md content, suggest migrating to this pattern.
