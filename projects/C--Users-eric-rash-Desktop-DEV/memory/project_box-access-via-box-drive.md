---
name: box-access-via-box-drive
description: Baylor blocks Box apps/MCP; reach Baylor Box through the Box Drive folder on the Windows laptop
metadata:
  node_type: memory
  type: project
  originSessionId: 0034ec57-b6bb-4981-8c1a-28ec40711534
  modified: 2026-09-30T19:03:36.949Z
---

Baylor blocks third-party Box apps (confirmed 2026-09-30). So the Box plugin's MCP server
(`https://mcp.box.com`) and the claude.ai Box connector cannot reach Baylor Box. The MCP
server also needs a registered Box OAuth app: it rejects Claude Code's automatic client
registration ("does not support dynamic client registration"). No Box CLI is installed.

The working route is Box Drive desktop sync on the Windows laptop: `C:\Users\eric_rash\Box`.
Files there are cloud placeholders that download when opened. This route offers no Box AI,
shared links, collaborations, or metadata. The box plugin's skills only give guidance.

The folder holds identifiable athlete health data (for example, injury and concussion tracking CSVs).
Handle it like DexaProject: never paste it into chat, an artifact, or an external service.

**Why:** The first attempt spent a session trying MCP setup before this block surfaced.
**How to apply:** For any Box request, go straight to the Box Drive path; don't retry MCP
unless Baylor IT approves a Box app.
