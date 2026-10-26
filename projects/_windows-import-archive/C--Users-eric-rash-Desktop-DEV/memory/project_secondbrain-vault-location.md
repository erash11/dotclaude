---
name: secondbrain-vault-location
description: SecondBrain vault lives at ~/SecondBrain (moved off the iCloud-synced Desktop 2026-08-14); config.json is the source of truth but ~29 files hardcode the path
metadata: 
  node_type: memory
  type: project
  originSessionId: a344e278-9d2a-4998-836a-fc0ece8896e2
  modified: 2026-08-15T00:50:26.229Z
---

The SecondBrain vault is at `/Users/kristinarash/SecondBrain`. It was relocated from
`~/Desktop/SecondBrain` on 2026-08-14.

**Why it moved:** macOS Desktop & Documents syncing was on, so the vault sat inside the iCloud
container (`~/Desktop` is a firmlink to `~/Library/Mobile Documents/com~apple~CloudDocs/Desktop` —
same inode, not a copy). That consumed iCloud storage, and "Optimize Mac Storage" can evict files
into `.icloud` placeholder stubs, which would break every scripted read (sync ledgers, memsearch
indexing, graphify) on files that still *appear* to exist. `~/SecondBrain` is outside iCloud sync.

**How to apply:**
- Never write vault files to `~/Desktop/SecondBrain` — that path no longer exists.
- `~/.claude/skills/_shared/config.json` is the documented source of truth, but it is NOT the only
  place the path lives. A relocation touches ~29 live files: 13 skill docs, `backup-manifest.json`
  (entry is `$HOME`-relative: `SecondBrain`), `daily-backup.ps1`, `restore.command`,
  `setup-agents-symlinks.sh`, KeystoneOS `data/*.json` (discovery-roots, memory-index-paths,
  memory-sources, projects), KeystoneOS `scripts/*.ps1`, `tests/keystone-memory-index-paths.ps1`
  (asserts exact path strings — update in lockstep or the test goes red), and
  `morning-briefing/config.toml`.
- Do NOT rewrite generated outputs (`KeystoneOS/outputs/**`), historical design docs, session
  `.jsonl` logs, or `file-history/` — those are records and regenerate on their own.
- Before any vault move, `launchctl bootout` the 7 loaded `com.keystone.*` agents first. `agysync`
  fires every 6h and would recreate a partial vault at the old path — the same two-writer failure
  recorded in [[backup-sync-system]].
- Vault contains zero self-referential absolute paths, so it is portable; `ditto` + a clean
  `git status` at the destination is sufficient proof of a good copy.

Related: [[backup-sync-system]], [[automation-cadence]]
