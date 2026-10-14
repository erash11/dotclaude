---
name: cloud-push-launchd-blocked
description: "cloud-push fails under launchd (\"Operation not permitted\"); run it by hand until the VPS"
metadata:
  node_type: memory
  type: project
  originSessionId: 85adb8da-8f6a-4257-bb02-877e354c19b7
  modified: 2026-10-14T14:02:54.380Z
---

`com.keystone.clouddrivepush` (07:00 and 17:30) fails under launchd with rsync `open: Operation not permitted` on `Drive/.../Cloud_Copy/DEV/`. Failing since 2026-10-12 18:19 (last good scheduled run). The same script works from an interactive shell: `python3 ~/.claude/scripts/cloud-push.py` (about 2 minutes). Log: `~/.claude/scripts/logs/cloud-push.log`.

**Why:** On 2026-10-14 Eric added Full Disk Access for the CLT `Python.app` and `/usr/bin/rsync`, then kickstarted the job. It still failed. Cause not found. Untried: launching via `/bin/bash` in a new plist (agents cannot write `~/Library/LaunchAgents`; stage it and Eric installs it).

**Cloudroom tried 2026-10-14, then dropped.** A Cloudroom script automation ran the copy fine (no launchd block), but Eric chose to stay with Claude Code and it was deleted.

**How to apply:** Eric runs the copy by hand each day until the VPS exists. Do not re-try the Full Disk Access fix. Expect the 07:00 and 17:30 scheduled errors in the log. See [[automation-cadence]] and [[cloud-copy-approval]].
