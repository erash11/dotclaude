---
name: TDD and commit discipline
description: Project requires strict TDD (failing tests before implementation) and targeted commits (no untracked reference files)
type: feedback
originSessionId: d2795305-5160-451e-be06-fea0519bbd22
---
Always write failing tests before any implementation code. Watch each test fail for the correct reason before writing the implementation.

**Why:** Project direction in AGENTS.md explicitly requires TDD. Previous sessions followed this consistently and it's expected.

**How to apply:** For every new feature, write the RED tests first, run pytest to confirm they fail with "missing column" or similar expected errors (not import errors), then implement.

---

Never stage untracked reference files when committing:
- `Local_AI_Analytics_Blueprint.md`
- `Local_AI_Analytics_Blueprint-v2.md`
- `Malum.pdf`
- `Peterson et al. - 2021 - ....pdf`
- `extracted_malum_ui/`
- `.claude/`

**Why:** These are local reference materials, not part of the tracked repo. They appear in `git status` but must never be staged.

**How to apply:** Always stage files explicitly by name, never with `git add -A` or `git add .`.
