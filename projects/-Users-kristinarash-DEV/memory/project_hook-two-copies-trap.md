---
name: hook-two-copies-trap
description: "~/.codex/hooks is a symlink to ~/.claude/hooks (since 2026-10-24): one folder, edit only there; a real folder at ~/.codex/hooks is the old two-copies trap coming back"
metadata: 
  node_type: memory
  type: project
  originSessionId: 9422b1a6-8624-4c86-a4f6-3c4b1a4c9fc8
  modified: 2026-10-24T08:45:54.102Z
---

Until 2026-10-23 the hook folder was copied across two harnesses, so a patch to one
copy "reverted" the next time the other harness ran (`transcript-capture.js` drifted
twice: Codex ran the 09-07 copy while Claude had the 10-23 fix).

**Now (2026-10-24):** `~/.codex/hooks` is a symlink to the whole `~/.claude/hooks`
folder, so both harnesses run the same files. LIFEOS `hooks/lib` and `hooks/handlers`
were retired the same day.

- **Edit only `~/.claude/hooks/`** (dotclaude). Anything written into `~/.codex/hooks`
  lands there too.
- **Never remove or reorder entries in `~/.codex/hooks.json`.** Codex keys its trusted
  hashes (`~/.codex/config.toml [hooks.state]`) by entry position and command string, so
  the folder link kept trust.
- Codex's own herdr script is `~/.codex/herdr-agent-state.sh` (outside the folder) and
  belongs to herdr.

Check after any hook edit:

```bash
readlink ~/.codex/hooks        # must print /Users/kristinarash/.claude/hooks
```

**Tell that the trap came back:** `readlink` prints nothing (a real folder again), or
`missing transcript_path` lines reappear in `~/.claude/global-memory/transcripts/.errors.log`.

Hook *failures* surface at session start via `.errors.log` — see
[[keystoneos-verification-habits]] for what a clean exit code does and does not
prove, and [[backup-sync-system]] for the ledger rule on that log.
