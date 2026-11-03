---
name: decision-desk
description: "Every decision Claude needs from Eric goes on the Decision Desk artifact, where he clicks answers"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 2d5c93b0-f48c-48ce-a2fc-59cc2f50d48a
  modified: 2026-11-03T00:15:29.469Z
---

Decision Desk: https://claude.ai/artifact/SKUir7NZtM8NN5gwohEn3u (source ~/DEV/docs/decision-desk.html; db rules: only the owner writes). One standing page for all sessions; do not make a new one per session.

**Why:** Eric asked 2026-11-02: give decisions as an artifact he can select from, as common practice. Clicking beats typing replies.

**How to apply:** Seed with ArtifactData batch into collection decisions (doc id YYYY-MM-DD-<slug>; fields batch, order, status open, repo, question, context, rec, options[{key,label,detail}], max 2 options). Read his picks from collection answers (doc id = decision id; fields choice, note, at). After applying one, update the decision: status closed, result '<what was done>'. Republish the page only from ~/DEV/docs/decision-desk.html. Still list the decisions in chat too, in one line each, with the link.

**"I'm done" button (2026-11-02, Eric asked):** the page's button sends one comment to any Claude session watching the Desk ("I'm done ... read the answers collection") and writes db `signals/done` {at, answered, sent}. So after seeding decisions, watch the Desk for comments (ArtifactComments) and treat that comment as Eric's "decisions answered". At session start, read `signals/done`: an `at` newer than the last applied answer with `sent: false` means Eric finished while no session was watching; apply his answers.
