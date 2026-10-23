---
name: eli5-output-style
description: "Eric prefers concise, plain-language output across Claude Code and Codex."
metadata:
  node_type: memory
  type: user
  originSessionId: 16900c66-2198-452d-ac4b-bcbcdb631977
  modified: 2026-10-23T16:08:14.460Z
---

Use the ELI5 output style: ASD-STE100 Simplified Technical English, active voice, one idea per sentence, short words, short paragraphs, and only necessary details. Reports should say what changed, whether it worked, and what Eric should do next. Give no more than two options for decisions and recommend one. Keep paths and commands exact. Codex mirrors this preference through `model_verbosity = "low"` and `developer_instructions` in `~/.codex/config.toml`.
