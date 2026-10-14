---
name: cloud-push-launchd-blocked
description: "cloud-push fails under launchd (\"Operation not permitted\"); now runs as a Cloudroom script automation instead"
metadata:
  node_type: memory
  type: project
  originSessionId: 85adb8da-8f6a-4257-bb02-877e354c19b7
  modified: 2026-10-14T14:02:54.380Z
---

`com.keystone.clouddrivepush` (07:00 and 17:30) fails under launchd with rsync `open: Operation not permitted` on `Drive/.../Cloud_Copy/DEV/`. Failing since 2026-10-12 18:19 (last good scheduled run). The same script works from an interactive shell: `python3 ~/.claude/scripts/cloud-push.py` (about 2 minutes). Log: `~/.claude/scripts/logs/cloud-push.log`.

**Why:** On 2026-10-14 Eric added Full Disk Access for the CLT `Python.app` and `/usr/bin/rsync`, then kickstarted the job. It still failed. Cause not found. Untried: launching via `/bin/bash` in a new plist (agents cannot write `~/Library/LaunchAgents`; stage it and Eric installs it).

**Fixed 2026-10-14 via Cloudroom.** Cloudroom local script automation `auto_xeoiqyfly1q` ("drive-cloud-copy", project DEV) runs the same script at 18:00 and 21:00 America/Chicago. Test run exit 0, rsync OK. It needs the Cloudroom app open. Runs: `room-cli automation runs auto_xeoiqyfly1q --project proj_494djs26ru`.

**How to apply:** Do not run the copy by hand unless a Cloudroom run failed. Before 10-14 Eric ran it by hand each day. Do not re-try the Full Disk Access fix. Expect the 07:00 and 17:30 scheduled errors in the log. See [[automation-cadence]] and [[cloud-copy-approval]].
