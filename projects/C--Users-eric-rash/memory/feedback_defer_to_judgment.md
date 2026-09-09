---
name: feedback-defer-to-judgment
description: "User delegates technical micro-decisions to me; don't bikeshed on tooling/version/path questions when an established convention exists in the project"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 27df54a5-abaf-449b-8ec7-f36ba16bb6b5
---

When I asked Eric to choose between two equally-reasonable technical micro-decisions (e.g. module path style, Go toolchain version) on the Zotero CLI scaffolding, he said "I defer to whatever you recommend. You're the expert here."

**Why:** Eric is a sport scientist, not a Go/CLI ecosystem maintainer. Asking him to arbitrate decisions like "bare module path vs github.com/user/repo" or "Go 1.26.3 vs whatever's installed" wastes his time on choices he has no strong opinion about — and where I have all the context to choose well (e.g. matching the existing [[project-catapult-cli]] convention).

**How to apply:**
- For decisions that have a clear "match existing convention" answer, just make it and move on. Don't surface the micro-question.
- Save the question form for genuine forks: scope (what to build), data sources, UX behavior, stack choices when no precedent exists.
- The litmus test: would Eric have a domain-rooted opinion? If no, decide and ship. If yes (sport science domain, his research workflow, his existing tooling), ask.
- After deciding silently, state the decision in one line ("Matching catapult: bare module path, Go 1.26.3") so he can override if he wants — don't bury it.
