---
name: skill-audit-list
description: "Where 'the list' of skills to audit lives, its rules, and how to take the next one"
metadata:
  type: reference
---

Eric set 'the list' on 2026-10-30: ~/DEV/docs/SKILL-AUDIT-LIST.md (Next, Rules, Method, Done). When Eric says 'audit the next skill on the list', take the first Next row and follow Method. Rules (Eric, 2026-10-30): Next always holds five; a finished skill moves to Done and the top pick of python3 ~/.claude/scripts/skill-audit-next.py joins Next, in the same commit. Done is final: a skill returns to Next only when Eric explicitly names it. Every audit calls mattpocock-skills:writing-for-agents through the Skill tool, fresh each audit and again for the review pass, never from memory of it. Related: [[defer-to-mattpocock-skills]], [[skill-bloat-and-promotion]].
