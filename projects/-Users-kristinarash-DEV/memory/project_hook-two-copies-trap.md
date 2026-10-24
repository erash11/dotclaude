---
name: hook-two-copies-trap
description: "Hooks Codex shares with Claude are symlinks into ~/.claude/hooks (since 2026-10-24) — edit only there; a regular file in ~/.codex/hooks where a link should be is the old trap coming back"
metadata: 
  node_type: memory
  type: project
  originSessionId: 9422b1a6-8624-4c86-a4f6-3c4b1a4c9fc8
  modified: 2026-10-24T05:38:30.979Z
---

Until 2026-10-23 the hook folder was copied across two harnesses, so a patch to one
copy "reverted" the next time the other harness ran (`transcript-capture.js` drifted
twice: Codex ran the 09-07 copy while Claude had the 10-23 fix).

**Now (2026-10-24):** every hook Codex shares with Claude is a symlink in
`~/.codex/hooks/` pointing into `~/.claude/hooks/`: `transcript-capture.js`,
`context-mode-cache-heal.mjs`, `keystone-unified-snapshot.js`, `memsearch-sync.js`.

- **Edit only `~/.claude/hooks/`.** Never copy a hook into `~/.codex/hooks/`: link it.
- **Never remove or reorder entries in `~/.codex/hooks.json`.** Codex keys its trusted
  hashes (`~/.codex/config.toml [hooks.state]`) by entry position. Swapping a file for a
  link keeps trust (proven by `memsearch-sync.js`, a link since 2026-09-02).
- `hooks/lib/` and `hooks/handlers/` are still identical twin copies in both folders
  (LIFEOS tools import them; retire with LIFEOS).

Check after any hook edit:

```bash
for f in transcript-capture.js context-mode-cache-heal.mjs keystone-unified-snapshot.js memsearch-sync.js; do readlink ~/.codex/hooks/$f; done
diff -rq ~/.claude/hooks ~/.codex/hooks   # expect only the Claude-only herdr-agent-state.sh, session-autopush.js, superpowers-quiet.mjs
```

Codex's own herdr script is `~/.codex/herdr-agent-state.sh` and belongs to herdr.
**Tell that a copy came back:** `missing transcript_path` lines in
`~/.claude/global-memory/transcripts/.errors.log`, or a regular file where a link
should be.

Hook *failures* surface at session start via `.errors.log` — see
[[keystoneos-verification-habits]] for what a clean exit code does and does not
prove, and [[backup-sync-system]] for the ledger rule on that log.
