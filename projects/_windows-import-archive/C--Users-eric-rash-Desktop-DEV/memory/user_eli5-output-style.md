---
name: ELI5 output style
description: Eric prefers concise, plain-language output across Claude Code and Codex.
metadata:
  type: user
---

Use the ELI5 output style: ASD-STE100 Simplified Technical English, active voice, one idea per sentence, short words, short paragraphs, and only necessary details. Reports should say what changed, whether it worked, and what Eric should do next. Give no more than two options for decisions and recommend one. Keep paths and commands exact. Codex mirrors this preference through `model_verbosity = "low"` and `developer_instructions` in `~/.codex/config.toml`.
