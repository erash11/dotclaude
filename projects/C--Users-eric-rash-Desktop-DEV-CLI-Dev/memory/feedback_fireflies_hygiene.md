---
name: fireflies-hygiene
description: "Rules for keeping Fireflies meetings retrievable — name titles via the name-meetings skill, label speakers manually in the UI forward-going only"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 3a2e9560-72d2-4a8d-972f-70547df31d13
---

**Rule 1 — Titles:** User does not name Fireflies meetings (almost all default to generic like "Zoom Meeting", "Recording", etc.). Use the `name-meetings` skill to clean these up. It detects generics, proposes structured titles from the AI gist + participants, and writes back via `fireflies-pp-cli transcripts update <id> --title`. Renames propagate to Fireflies UI, mobile app, and all future local syncs (single source of truth).

**Rule 2 — Speakers:** Fireflies' diarization labels unknown participants as "Speaker N". There is **no CLI/API endpoint** to assign speaker names — it has to be done in the Fireflies web UI. Therefore:
- **Do NOT bulk-relabel historical meetings.** Most won't be re-referenced; bad ROI.
- **Forward-going habit:** 2-min post-meeting step — open the meeting in Fireflies web UI, assign names to any "Speaker N" entries while context is fresh.
- **Just-in-time relabeling:** if a weekly review references an old meeting whose speakers aren't named, label that one meeting then. Don't speculatively relabel others.

**Rule 3 — Automatic flagging:** The `weekly-review` skill scans `Inbox/meetings/*.md` for `Speaker N` patterns and surfaces unlabeled meetings under "Pipeline hygiene" so the user doesn't have to remember.

**Why:** Without titles, exported filenames (`YYYY-MM-DD_<title>.md`) are unretrievable. Without speakers, AI-generated summaries lose attribution, action items become orphaned, and cross-meeting queries ("what does X consistently push on?") fail. Both fixes compound forward; bulk historical cleanup is a treadmill.

Related: [[secondbrain-vault]]
