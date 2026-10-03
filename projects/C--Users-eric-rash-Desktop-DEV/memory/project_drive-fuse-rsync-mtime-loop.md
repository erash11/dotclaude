---
name: drive-fuse-rsync-mtime-loop
description: "Google Drive CloudStorage rounds mtimes it didn't write, making rsync -a re-send byte-identical files forever; fix is --modify-window=5"
metadata: 
  node_type: memory
  type: project
  originSessionId: fa062f93-2c55-4016-b9c6-f1a32e0a7083
  modified: 2026-10-02T21:48:00.682Z
---

Anything rsyncing into the Google Drive for Desktop mount (`~/Library/CloudStorage/GoogleDrive-*/`) needs `--modify-window=5`. Drive stores an mtime 1–2s below what rsync set, and for large files it stamps its own upload time instead (skew of hours). rsync's quick-check is size+mtime, so byte-identical files read as changed and are re-sent on **every** run, permanently.

Diagnosed 2026-08-14 on `daily-backup.ps1` → `codex/sessions`: all 256 files size-identical, yet 134 re-sent nightly (252 MB). That perpetual write load into FUSE is what fed the wedge the watchdog was catching — the snapshot had been failing since 2026-08-06 (rsync exit 23, then 1, then 124 once the watchdog landed).

**Why:** `du` on the mount reports less than the source (171M vs 289M) because Drive doesn't materialize every file — that discrepancy looks like an incomplete mirror and sends you hunting for missing data that isn't missing. Compare `stat -f%z` per file, not `du`.

**How to apply:**
- Diagnose with dry runs, not `du`: `rsync -an -i <src>/ <dst>/ | grep -c '^>f'` with and without `--modify-window=5`. A large gap between the two *is* the diagnosis.
- Files already stamped with Drive's own upload time need a one-time `touch -r <src> <dst>`; the flag alone won't close a multi-hour skew. The repair sticks across Drive re-sync.
- Never substitute `--size-only` — `claude-projects` has genuine same-size edits that only mtime catches.
- Genuinely-new files re-send under both settings (gemini's 428 were all NEW). If the count is identical with and without the window, it's real work, not this bug.

**`--modify-window` has a blind spot — cover it for SQLite (found 2026-08-15 while reviewing the fix).** The window makes rsync's quick-check tolerate a 5s mtime difference. That is safe for append-only logs, where any real change also moves the size. It is NOT safe for files rewritten in place at identical size — SQLite updates rows inside existing pages, so `~/.codex/sqlite/codex-dev.db` (229,376 B) can change content with size unchanged. If that write lands within 5s of the dest's Drive-rounded mtime, rsync skips it, and keeps skipping forever because neither side changes again.

Reproduced: two 8-byte files, same size, content differing, mtimes 3s apart → `--modify-window=5` copies **0** files (silent loss); adding `--checksum` copies **1**. Fix in `daily-backup.ps1`: `Invoke-Rsync`/`Snapshot` take an `$extraArgs` param and the `.codex/sqlite` snapshot alone passes `--checksum`. Do not apply `--checksum` broadly — it re-reads every byte on both sides; it is cheap only because that DB is ~224 KB.

**How to apply:** when adding a new `Snapshot` call, ask whether the source can change without changing size. Databases, fixed-width records, and image/binary formats with in-place headers all can — give those `--checksum`. Logs and transcripts cannot — leave them on the window.

**One-way copy of new files into Drive: use `--ignore-existing`, never `--update` (2026-10-02).** `rsync -a --update` from `~/DEV/S2_Evaluation/data/` into the Drive mount hung 11 min, with nothing copied. `--update` did not skip files already on Drive, because Drive's mtimes are its own. The receiving child was blocked reading an existing Drive file. `--ignore-existing` copied the 2 missing files at once. macOS rsync is openrsync: its receiving child shows as `rsync --server`, so `pgrep -f "rsync -a ..."` misses it. Stop a hung run with TaskStop, not `kill`.

Related: [[backup-sync-system]]
