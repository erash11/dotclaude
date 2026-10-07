---
name: memsearch-index-is-destructive
description: "`memsearch index <paths>` deletes every indexed source outside the given paths — never run it with a partial or test path set; plus the 2026-10-07 Windows failure causes"
metadata:
  node_type: memory
  type: project
  originSessionId: 4f57cc78-0bf6-4202-bd61-8f428a3c6dca
  modified: 2026-10-07T22:05:05.745Z
---

`memsearch index <paths>` is **never read-only**. It reconciles the collection against
the path set it is given and deletes every indexed source not under those paths
(core.py `index()` → store.py delete). An empty or partial path set wipes the rest.

On 2026-10-07 a diagnostic run against an empty temp dir deleted ~12,900 of ~31,000
vectors before it was stopped. Recovery: a full re-index over all 13 paths in
`KeystoneOS/data/memory-index-paths.json`, which takes hours on Windows (~3 s/chunk).
`memsearch stats` counts tombstones until compaction, so use `count(*)` for live rows.

**Why:** a "just timing it" run silently destroyed 40% of the index.
**How to apply:** never pass a test or partial path set to `memsearch index`. To time
indexing, use a throwaway collection or time `memsearch search`. For a catch-up run,
use `~/.claude/scripts/memsearch-drain.ps1`: it resolves the full path set and holds
the hook's lock.

Windows failure causes found the same day:
- **10-06 "Milvus unreachable":** Docker Desktop's vpnkit port forward to
  milvus-standalone flapped after days of uptime through Modern Standby. Milvus itself
  never restarted. A Docker restart cleared it.
- **10-07 ETIMEDOUT ×9:** low free RAM (1–2 GB) slowed indexing to ~1.2 s/chunk, so the
  hook's 600s cap killed every run partway. The cap was raised to 3h on 2026-10-07.
  The streak never resets on Windows because no nightly reindex runs there.

Related: [[memsearch-hook-timeout-cap]], [[automation-cadence]].
