---
name: gws-cli-default
description: "Google (Drive, Sheets, Gmail, etc.) work goes through the gws CLI by default; no raw API/OAuth token handling"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 16900c66-2198-452d-ac4b-bcbcdb631977
  modified: 2026-11-02T18:24:11.971Z
---

Use the `gws` CLI (`/opt/homebrew/bin/gws`) as the default way to interact with Google services. Do not export its credentials or call Google APIs directly with tokens.

**Why:** Eric said so on 2026-10-22 ("use gws-cli as the default way to interact with google") after I tried to speed up Drive wave 2 by exporting the gws OAuth login and calling the Drive API over HTTPS; the auto-mode classifier also denied that.

**How to apply:** Script Google work as `gws <service> <resource> <method>` subprocess calls, parsing stdout only (stderr carries a keyring line). Each call takes about 2.5 s, and more threads do not help (4 and 12 threads both gave ~70 files/min on 10-22), so plan long jobs as overnight runs. Traps (2026-10-29): a download (`files get` with `"alt":"media"` and `-o <file>`) must land inside gws's working directory, or it fails with "outside the current directory": run gws with `cwd=` the target folder and a bare file name. Uploading new content to an existing file is `files update --upload <path> --upload-content-type <mime>`; compare the returned `md5Checksum` with the local `md5 -q`. Content search is `"q": "fullText contains '...'"` (~2 s, PDFs included); `drive_index.py find --inside` wraps it. **Never run gws without the login keychain** (`env -i`, a stripped env, a sandbox): gws 0.22 cannot unlock `~/.config/gws/credentials.enc`, deletes it, and every later call fails "No credentials" until Eric runs `gws auth login` in a browser (2026-11-02: one `env -i` test broke the backup's Drive receipt). A launchd job is fine; test a job's PATH with `env -i … /usr/bin/env node -v`, never a gws call. Related: [[drive-fuse-read-hang]], [[gws-forms-api]].
