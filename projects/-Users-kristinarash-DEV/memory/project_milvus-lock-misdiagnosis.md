---
name: milvus-lock-misdiagnosis
description: milvus-lite reports lock contention as a version-incompatibility error; following its advice destroys a working memsearch index for hours
metadata: 
  node_type: memory
  type: project
  originSessionId: fa062f93-2c55-4016-b9c6-f1a32e0a7083
  modified: 2026-08-15T02:42:26.304Z
---

When memsearch fails to open `~/.memsearch/milvus.db`, milvus-lite prints:

> Failed to open the local Milvus Lite database. If this database was created with an older Milvus Lite release, it may not be compatible with Milvus Lite 3.x. Move the existing .db file aside, then rebuild the index...

**That text is a generic open-failure string, not a version verdict.** It fires just as readily on plain lock contention. Diagnosed 2026-08-14: the underlying error was `BlockingIOError: [Errno 35]` from `flock`, and `lsof +D ~/.memsearch/milvus.db` named the holder — a concurrent manual `memsearch index` running after the SecondBrain vault move. The same DB with the same milvus-lite 3.1.1 had indexed successfully hours earlier.

(Attribution caution: at the time this was written the holder was assumed to be "another Claude session," inferred from an unfamiliar PID and shell-snapshot id. Eric corrected that — it was not. `lsof` tells you *which process*, never *which agent or person*; state the process and leave the actor unnamed.)

**Why:** following the message's advice (move the .db aside, rebuild) throws away a working index and costs an hours-scale re-index of the SecondBrain library — a self-inflicted outage in response to a transient collision.

**How to apply:**
- Before believing any milvus-lite "incompatible database" message, run `lsof +D ~/.memsearch/milvus.db` and `ps aux | grep memsearch`. A live holder means wait, not rebuild.
- Milvus Lite is single-writer. `daily-backup.ps1`'s advisory lock (`.memsearch-index.lock`, ~line 416) coordinates the nightly reindex with the SessionEnd hook only — it cannot see a hand-run `memsearch index`, so manual indexing during a backup window collides. Avoid running `memsearch index` by hand while the nightly backup may fire.
- `memsearch-index:full-set` in `.errors.log` is therefore usually transient. Confirm the lock is free, then let the next scheduled run clear it.

**Tooling mitigation added 2026-08-14 (because the written warning was not enough).** Later the same day a session ran `memsearch reset --yes` anyway and triggered a ~2h full rebuild — the exact outage this note warns about, with the note already on disk. Prose guidance does not survive contact with a scary error message, so the guard is now in code:

- `~/.local/bin/ms-search` — lock-aware retry wrapper for reads (`search` / `stats` / `expand` / `transcript`; write subcommands are refused). Retries with backoff to 60s (`MS_SEARCH_MAX_WAIT`), then exits **75** saying the DB is healthy and not to run `reset`. It retries **only** on `DataDirLockedError` / `another process holds the lock` / `Resource temporarily unavailable` / `_acquire_lock` / `fcntl.flock`; it deliberately does **not** key on the "may not be compatible with Milvus Lite 3.x" sentence, since that same wording is emitted for genuine incompatibility — so real corruption still fails fast and passes its exit code through.
- `~/.claude/hooks/memsearch-sync.js` now classifies those same lock signatures as transient instead of escalating them as hard errors. Caveat: `bumpTransientStreak` shares one counter across all transient classes at threshold 6, so a cluster of session-ends during a long rebuild can still escalate — downgraded, not eliminated.

**How to apply (updated):** prefer `ms-search "query"` over `memsearch search` for recall; it waits out a busy index instead of surfacing the misleading message. Reserve bare `memsearch` for writes.

Related: [[backup-sync-system]] (carries the earlier two-writer lesson), [[memsearch-index-path-drift]] (the config drift found while fixing this), [[drive-fuse-rsync-mtime-loop]]
