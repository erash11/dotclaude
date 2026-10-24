---
name: memsearch-index-is-destructive
description: "`memsearch index <paths>` deletes every indexed source outside the given paths — never run it with a partial or test path set; plus the 2026-10-07 Windows failure causes (history: Windows no longer indexes)"
metadata:
  node_type: memory
  type: project
  originSessionId: 4f57cc78-0bf6-4202-bd61-8f428a3c6dca
  modified: 2026-10-24T15:00:22.564Z
---

`memsearch index <paths>` is **never read-only**. It reconciles the collection against
the path set it is given and deletes every indexed source not under those paths
(core.py `index()` → store.py delete). An empty or partial path set wipes the rest.

On 2026-10-07 a diagnostic run against an empty temp dir deleted ~12,900 of ~31,000
vectors before it was stopped. Recovery: a full re-index over every path in
`KeystoneOS/data/memory-index-paths.json` (13 paths then), which took hours on Windows
(~3 s/chunk). The Mac runs ~0.7 s/chunk.
`memsearch stats` counts tombstones until compaction, so use `count(*)` for live rows.

**Why:** a "just timing it" run silently destroyed 40% of the index.
**How to apply:** never pass a test or partial path set to `memsearch index`. To time
indexing, use a throwaway collection or time `memsearch search`. For a catch-up run,
let the daily backup do it: `~/.claude/scripts/daily-backup.ps1` step 2c reads the full
path set from `memory-index-paths.json` and takes the hook's `.memsearch-index.lock`.
It runs once a day, so by hand use `node ~/.claude/hooks/memsearch-sync.js --worker`
(same path set and lock; it skips if an index started in the last 30 min).
Superseded 2026-10-24: this used to name `~/.claude/scripts/memsearch-drain.ps1`; the
Windows drain chain was retired and its scripts deleted (see [[automation-cadence]]).

Windows failure causes found the same day. Superseded 2026-10-24: history only. Docker
was removed from the laptop, there is no Milvus standalone, and Windows runs no indexing
(see [[work-laptop-hands-off]]). The 3h hook cap still holds on the Mac.
- **10-06 "Milvus unreachable":** Docker Desktop's vpnkit port forward to
  milvus-standalone flapped after days of uptime through Modern Standby. Milvus itself
  never restarted. A Docker restart cleared it.
- **10-07 ETIMEDOUT ×9:** low free RAM (1–2 GB) slowed indexing to ~1.2 s/chunk, so the
  hook's 600s cap killed every run partway. The cap was raised to 3h on 2026-10-07.
  The streak never resets on Windows because no nightly reindex runs there.

Related: [[memsearch-hook-timeout-cap]], [[automation-cadence]].
