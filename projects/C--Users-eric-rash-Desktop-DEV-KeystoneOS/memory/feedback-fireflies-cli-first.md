---
name: feedback-fireflies-cli-first
description: Fireflies meeting work defaults to fireflies-pp-cli; MCP tools are fallback only
metadata: 
  node_type: memory
  type: feedback
  originSessionId: de90a625-5dd7-4cfa-9932-c56baff02066
  modified: 2026-07-25T17:44:10.984Z
---

When working with Fireflies meetings (sync, find, summaries, transcripts, analytics), use `fireflies-pp-cli` (`C:\Users\eric_rash\go\bin\fireflies-pp-cli.exe`) as the primary tool. Use the `mcp__claude_ai_Fireflies__*` MCP tools only as a fallback when the CLI can't do the job.

**Why:** Eric established this default on 2026-07-22. The CLI is auth'd via `FIREFLIES_API_KEY`, backed by a local SQLite DB (offline queries, no MCP connection latency), and is the mechanism the meeting skills ([[project-morning-briefing-pipeline]], meeting-sync, name-meetings, pp-fireflies) are built around.

**How to apply:** Reach for the CLI first for any Fireflies operation, including title renames — the CLI's old `transcripts update` GraphQL bug (flat args instead of input object) was fixed 2026-07-22: patched binary installed at `~/go/bin/fireflies-pp-cli.exe` (old one at `.exe.bak`), upstream draft PR mvanhorn/printing-press-library#1571. If the binary is ever reinstalled from an unmerged upstream, the bug returns — then fall back to `mcp__claude_ai_Fireflies__fireflies_update_meeting_title` until re-patched. Any other MCP use should be justified by a concrete CLI gap or failure, not convenience.

**Verify renames through MCP, never through the CLI read (found 2026-07-25).** `transcripts update` genuinely works — 14 renames applied and confirmed — but `transcripts get --data-source live` **silently falls back to the local SQLite cache and returns pre-update titles despite `live` meaning "API only."** Reading back through the CLI therefore makes a successful rename batch look like a total failure, which is exactly what happened and produced a wrong "none applied" report before MCP cross-checking caught it. Use `mcp__claude_ai_Fireflies__fireflies_get_transcripts` to verify any write. Separately, a handful of older transcripts return `Transcript not found` on update and are absent from live listings while still present in the local cache — those exist only locally; rename the vault file and move on.
