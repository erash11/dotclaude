---
name: decision-desk
description: "Every decision Claude needs from Eric goes on the Decision Desk artifact, where he clicks answers"
metadata:
  type: feedback
---

Decision Desk: https://claude.ai/artifact/SKUir7NZtM8NN5gwohEn3u (source ~/DEV/docs/decision-desk.html; db rules: only the owner writes). One standing page for all sessions; do not make a new one per session.

**Why:** Eric asked 2026-11-02: give decisions as an artifact he can select from, as common practice. Clicking beats typing replies.

**How to apply:** Seed with ArtifactData batch into collection decisions (doc id YYYY-MM-DD-<slug>; fields batch, order, status open, repo, question, context, rec, options[{key,label,detail}], max 2 options). Read his picks from collection answers (doc id = decision id; fields choice, note, at). After applying one, update the decision: status closed, result '<what was done>'. Republish the page only from ~/DEV/docs/decision-desk.html. Still list the decisions in chat too, in one line each, with the link.
