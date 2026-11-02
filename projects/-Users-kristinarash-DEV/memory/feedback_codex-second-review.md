---
name: codex-second-review
description: "Every code change or script Claude writes gets a Codex second review before Eric runs it or it is called done; bounded by the 5-round cap"
metadata:
  type: feedback
---

Run every code change and new script through Codex (codex-review skill) as a second reviewer before handing it to Eric or calling it done; stop at the 5-round cap.

**Why:** Eric asked 2026-11-02 during the Drive project-folder work: run all coding through Codex as a second reviewer.

**How to apply:** After a code change, run the codex-review skill on the diff. Fix real findings. Stop at the skill's 5 completed rounds: fixes after the cap are committed with 'post-cap, NOT Codex-reviewed' in the message and named to Eric. Never edit the repo while an inspect round runs (it fails the round). Review a tool against the job it will do, and pre-flight the real input live; a general tool reviewed against arbitrary inputs never converges (11-02: 8 rounds on file_moves.py). See [[codex-exec-stdin-hang]].
