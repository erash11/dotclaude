---
name: upload-new-docs-to-drive
description: "New documents Claude builds also go to the project's Drive folder in the same session"
metadata:
  type: feedback
---

When Claude creates a new document, it is also uploaded to Google Drive, into that project's Drive folder.

**Why:** Eric, 2026-10-28: the filled NCAA outline sat only in repo deliverables/; he asked for it on Drive and said new docs should always be uploaded.

**How to apply:** After a build, upload with gws (cd to the file's folder first; not the mount) into the project's Drive folder named in its docs/STATUS.md, e.g. NCAA 01_CURRENT. Add beside older versions; do not overwrite a file someone is reviewing. Record the Drive id in STATUS. Separate from closeout's copy to 03_REPORTS (~/.claude/STORAGE.md). Health data stays local.
