---
name: cloud-push-launchd-blocked
description: "cloud-push under launchd: macOS per-file com.apple.macl blocks it; fixed 2026-10-23 by running it inside Terminal via cloud-push-launch.sh"
metadata:
  node_type: memory
  type: project
  originSessionId: 802ea68a-c53e-4d3a-a897-1d311560fdd1
  modified: 2026-10-23T12:24:59.589Z
---

`com.keystone.clouddrivepush` (07:00 and 17:30) failed under launchd from 2026-10-12 to 10-23 with rsync `open: Operation not permitted` on `Drive/.../_MACHINE/Cloud_Copy/DEV/`. By hand from Terminal it always worked.

**Cause (tested 2026-10-23).** A process started straight by launchd (python3 or bash) can stat, mkdir and create new files in the Drive mount, and rewrite files it made itself. It cannot list Drive folders, or open, rename over, or delete files that Terminal made. Each such file carries `com.apple.macl` naming Terminal; `xattr -d` does not remove it. Full Disk Access on `Python.app`/rsync does not help (tried 10-14). rsync lists the destination, so it failed on the first step.

**Fix (live 2026-10-23).** The plist runs `/bin/bash ~/.claude/scripts/cloud-push-launch.sh`. That runs `open -g -a Terminal ~/.claude/scripts/cloud-push.command`, which runs `cloud-push.py` (rsync, unchanged) with Terminal's access. The launcher waits 90 s for a new `START` line in `cloud-push.log`; if none, it writes an ERROR to the log and to `.errors.log`. Tracked plist copy: `~/.claude/scripts/com.keystone.clouddrivepush.plist`. Proven: kickstarted runs OK 07:15 and 07:21 with the screen locked.

**Known costs.** Each run leaves a Terminal window open (profile "Clear Dark" does not close on exit; an osascript self-close did not work). Under memory pressure Terminal ran queued opens ~5 min late; the 90 s check would log that as an ERROR even if the copy runs later.

**How to apply:** Do not swap rsync for a launchd-run copier: Terminal-made files can never be updated that way, and a by-hand run re-taints files. By hand is still `python3 ~/.claude/scripts/cloud-push.py`, or `launchctl kickstart gui/501/com.keystone.clouddrivepush`. Off switch: `launchctl bootout gui/501/com.keystone.clouddrivepush`. Any other launchd job that must read or change Terminal-made Drive files hits the same wall; route it through Terminal the same way or use the `gws` API. See [[automation-cadence]] and [[cloud-copy-approval]].
