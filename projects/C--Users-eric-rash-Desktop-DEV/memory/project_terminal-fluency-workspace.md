---
name: terminal-fluency-workspace
description: "Stateful CLI-learning workspace at ~/DEV/Terminal_Fluency — mission, resume protocol, and the teach-skill traps"
metadata: 
  node_type: memory
  type: project
  modified: 2026-08-16T18:38:42.018Z
  originSessionId: 7c7ca38f-e834-48b6-bae9-d7d80bbbbb95
---

`~/DEV/Terminal_Fluency` is a multi-session teaching workspace created 2026-08-13 via the
`mattpocock-skills:teach` skill. Three lessons written as of 2026-08-16.

**Mission:** fluency at the command line specifically to drive Claude Code and Codex rather than
the desktop/web UIs — control, composability, headless runs. *Not* general shell mastery; writing
shell scripts and building CLIs are out of scope (the latter is [[printing-press-spec-traps]]).

**To resume:** `cd ~/DEV/Terminal_Fluency`, then read `MISSION.md` → `NOTES.md` (teaching
preferences, verified environment, lesson ledger) → newest `learning-records/`. Self-describing by
design; do **not** re-interview about the mission. Lessons 01–03 done; 04 is sessions/permission
modes, 05 quoting+exit codes grounded in [[zsh-shell-traps]], 06 `--output-format json` + jq.

**How he learns — the single most useful fact here.** Twice now the pattern has been: learn a
concept → find it applies to a real defect on his own machine → fix it → ask for the next lesson.
Build drills from his actual files and tools, never synthetic examples. A lesson that ends in a
real repair sticks; an exercise does not.

**Non-obvious traps, all learned the hard way:**
- The `teach` skill has `disable-model-invocation: true`, so it is absent from the registered skill
  list and the Skill tool cannot load it. Read
  `~/.claude/plugins/cache/mattpocock/mattpocock-skills/<ver>/skills/productivity/teach/SKILL.md`
  plus its four `*-FORMAT.md` siblings and follow them directly.
- The skill forbids parametric knowledge — every `RESOURCES.md` entry must be fetched before citing.
- Glossary terms are promoted only after he *uses* them correctly, never on introduction. Four
  lesson-01 terms are still pending; lesson 03's footer asks him to name them.
- Standalone HTML needs an explicit `<meta charset="utf-8">` or every em-dash renders as mojibake,
  and a `.js` file's own non-ASCII breaks separately from the HTML's.
- `~/DEV/CLI_Dev` is an unrelated empty stub. Not this workspace.

**Why:** the mission grounds every lesson; losing it makes lessons drift abstract and the zone of
proximal development uncomputable.
**How to apply:** when Eric asks to continue learning the CLI, open this workspace rather than
teaching ad hoc, and build the next lesson only after the previous drill has been reported.
