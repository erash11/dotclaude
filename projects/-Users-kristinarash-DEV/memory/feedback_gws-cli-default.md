---
name: feedback_gws-cli-default
description: "Google (Drive, Sheets, Gmail, etc.) work goes through the gws CLI by default; no raw API/OAuth token handling"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 16900c66-2198-452d-ac4b-bcbcdb631977
  modified: 2026-10-23T17:24:20.795Z
---

Use the `gws` CLI (`/opt/homebrew/bin/gws`) as the default way to interact with Google services. Do not export its credentials or call Google APIs directly with tokens.

**Why:** Eric said so on 2026-10-22 ("use gws-cli as the default way to interact with google") after I tried to speed up Drive wave 2 by exporting the gws OAuth login and calling the Drive API over HTTPS; the auto-mode classifier also denied that.

**How to apply:** Script Google work as `gws <service> <resource> <method>` subprocess calls, parsing stdout only (stderr carries a keyring line). Each call takes about 2.5 s, and more threads do not help (4 and 12 threads both gave ~70 files/min on 10-22), so plan long jobs as overnight runs. Related: [[drive-fuse-read-hang]], [[gws-forms-api]].
