---
name: fireflies-cli-bug
description: "fireflies-pp-cli `transcripts update --title` is broken; use the native Fireflies MCP tool instead. Daily API rate limit also discovered."
metadata: 
  node_type: memory
  type: project
  originSessionId: 3a2e9560-72d2-4a8d-972f-70547df31d13
---

**Bug discovered 2026-05-21:** `fireflies-pp-cli transcripts update <id> --title "..."` returns `HTTP 400: Unknown argument "id" on field "Mutation.updateMeetingTitle"`. The CLI's GraphQL mutation uses `id` but the Fireflies API expects `meetingId`. This is a printing-press CLI generation bug.

**Workaround:** Use the native Fireflies MCP tool `mcp__claude_ai_Fireflies__fireflies_update_meeting_title(meetingId, title)` instead. Schema accepts `meetingId` (camelCase) and `title` (5-256 chars). Works reliably.

**Rate limit discovered:** Fireflies enforces a **hard daily rate limit** that includes all GraphQL mutations and sync queries. After ~15 successive `fireflies_update_meeting_title` calls in quick succession, the API returns `Too many requests. Please retry after <next midnight UTC>`. Backoff sleeps of 1-3 minutes do not help — the limit window is daily (resets at 00:00 UTC). Both the MCP tool AND `fireflies-pp-cli sync` are blocked once the quota is exhausted.

**How to apply:**
- For renames: always use MCP tool, never the CLI.
- Cap rename batches at ~10–15 per day to stay under the quota.
- If hit: persist remaining work to `Inbox/meetings/.pending-renames.json` and resume after midnight UTC.
- `name-meetings` skill has resume-mode built in — re-running it picks up pending work automatically.
- File a /printing-press-amend issue against `fireflies-pp-cli` to fix the `id` → `meetingId` argument name.

**Search-index lag (2026-05-21):** After `fireflies_update_meeting_title` returns `success: true`, the Fireflies web UI shows the new title immediately, but the API's read endpoints (`transcripts` query, `transcripts get`) continue to return the old title for several hours. This is server-side search-index caching, not a local CLI cache. Implications:
- Downstream pipeline (meeting-sync `transcripts export --vault`) uses the cached titles for filenames, so exporting too soon after rename produces files with the old date-time names.
- Cannot force-refresh via `transcripts pull <id>` — that command requires a Business plan tier the user doesn't have.
- Practical rule: after renaming, wait several hours before running meeting-sync, or accept that early filenames will be wrong and we'll have to mv them later.

Related: [[fireflies-hygiene]], [[secondbrain]]
