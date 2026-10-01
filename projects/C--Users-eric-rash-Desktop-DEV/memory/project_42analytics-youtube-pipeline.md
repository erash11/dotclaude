---
name: 42analytics-youtube-pipeline
description: "42 Analytics YouTube channel to Flint pipeline; caption 429 throttling, subagent summary.md write block, empty TypeSafe key trap"
metadata:
  node_type: memory
  type: project
  originSessionId: 19043f0d-1f5f-4547-b866-477df56e6bfa
  modified: 2026-09-30T23:28:45.054Z
---

`DEV/42Analytics` (private repo `erash11/42Analytics`) holds transcripts, summaries and Baylor applications from the 42 Analytics YouTube channel (SSAC talks), for batch ingest into Flint. Video files stay on Drive, never git. State and next steps: `42Analytics/docs/STATUS.md` and `docs/handoffs/2026-09-30-channel-pipeline.md`.

**Traps**
- yt-dlp caption requests get HTTP 429 after about 4 in a row from this laptop. `scripts/fetch_captions.py` backs off and leaves rows `todo`; rerun it. Cloud IPs are likelier to be blocked.
- Subagents may write `applications.md` but the harness refuses `summary.md`. Do not work around it: agents return summary text, the main session saves it, then `scripts/check_summary.py`.
- `SetEnvironmentVariable("TYPESAFE_API_KEY", (Read-Host ...))` saved an EMPTY value when the paste did not land. Check `.Length` before saving. Never paste keys into chat.

**State 2026-10-01:** tier A 128 of 139 summarized, baseline lines verified, 23 supported talks atomized to Flint staging (152 entries, awaiting 2nd review before promote); 6 still rate-limited, 5 no-captions.

**Why:** Eric chose tier A only, Sonnet summaries, and a Jev claim-check test (bars proposed, unapproved) on 2026-09-30.
**How to apply:** read the repo STATUS first; related [[flint-knowledge-base]] and the TypeSafe prereg `TypeSafe_Sandbox/docs/VIDEO_SUMMARY_CHECK_PREREG.md`.
