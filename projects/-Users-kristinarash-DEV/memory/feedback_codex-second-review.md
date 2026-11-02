---
name: codex-second-review
description: "Every code change or script Claude writes gets a Codex second review before Eric runs it or it is called done"
metadata:
  type: feedback
---

Run every code change and new script through Codex (codex-review skill) as a second reviewer before handing it to Eric or calling it done.

**Why:** Eric asked 2026-11-02 during the Drive project-folder work: run all coding through Codex as a second reviewer.

**How to apply:** After a code change, run the codex-review skill on the diff (bounded review-fix-recheck). Fix real findings, then tell Eric the review result in one line. Scripts Eric will run (Terminal --apply lines) are reviewed before the command is handed over. See [[codex-exec-stdin-hang]] before calling codex exec from a script.
