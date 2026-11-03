---
name: synthetic-keystrokes-frontmost
description: "Before sending test key presses (System Events keystroke/key code, CGEvent) to an app: check it is frontmost first"
metadata:
  type: feedback
---

Synthetic key presses go to whatever app is in front, not the app under test: guard every send on a frontmost check, and prefer Accessibility actions.

**Why:** 2026-11-03: MacEverything test keys (Cmd+A, a line of text, 3 Down) landed in Ghostty because the panel was hidden; no Return was sent. Eric uses the Mac at the same time (Muse, Herdr took the front).

**How to apply:** Before every key, check name of first process whose frontmost is true is the target AND its window is window 1; otherwise send nothing. Stop key-driven tests while Eric is on the Mac. Prefer Accessibility element actions (click, AXPress, AXCancel) and AX reads (focused role, selected rows), which do not depend on focus. MacEverything's menu-bar Search item does not open the panel via AXPress, so its UI checks go to Eric. Lesson note: SecondBrain Knowledge/tooling/synthetic-keystrokes-go-to-the-frontmost-app.md.
