---
name: drive-fuse-read-hang
description: "Reading or hashing files through the Google Drive CloudStorage mount hangs; stat() does not. Index Drive by name+size only, move with the Drive MCP, skip 02_Raw_Tagging"
metadata:
  node_type: memory
  type: project
  originSessionId: dc65ba85-7374-4641-97a3-dad384e86ec2
  modified: 2026-10-14T18:56:53.821Z
---

Opening files through `~/Library/CloudStorage/GoogleDrive-…/My Drive/` hangs when the file is
not cached locally. Measured 2026-10-14: a sha256 walk of `_FROM_WORK_LAPTOP` sat 65 minutes with
0.2 s of CPU, frozen on a `.lock` file. A hash walk of the OneDrive mirror did the same (that
folder is 0 KB on disk — all cloud placeholders). `stat()` and `os.walk` are fine: five Drive
folders, 76k files, 10 seconds by name+size.

One folder hangs even on listing: `00_Primary_Storage_Drive/02_SPORTS/Football/FA2026/02_Raw_Tagging`
(thousands of face images). Skip it in any Drive walk.

**How to apply:**
- Compare Drive copies by `(basename, size)`, never by content. `~/DEV/_INBOX/tools/drain_diff.py --names-only`.
- Move or rename Drive folders with the Drive MCP (`update_file` with `parentId`) — server-side, instant,
  no FUSE. Never `mv` a big tree through the mount.
- Put any Drive walk under a wall-clock watchdog; a hang shows as elapsed time with no CPU.
- Related: [[drive-fuse-rsync-mtime-loop]] (rsync re-sends), [[rea-ghidra-setup-traps]] (Drive reads hang R).
