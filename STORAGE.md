# STORAGE — where every file lives

Read this before you save, move, back up, or copy any file. One rule set for every agent
(Claude Code, Codex, Gemini) on every machine. Decided by Eric 2026-10-16.

## The model

Every file has one **true copy**. Edit the true copy, or a working copy that syncs back to it
the same day. Everything else is a **backup** (machine-written, never edited) or **scratch**
(thrown away).

Drive is the one place Eric looks. Documents live there directly. Code lives in GitHub and is
mirrored into Drive, so Drive still shows everything.

## Where things go

| What you are saving | True copy | Work on it at | Gets back to the true copy by |
|---|---|---|---|
| Document, PDF, deck, spreadsheet for humans | Drive `00_Primary_Storage_Drive/`, filed by its `README.md` ladder | Drive desktop app, or `~/DEV/_DRIVE` | Drive sync (automatic) |
| Finished deliverable from a repo | Drive `00_Primary_Storage_Drive/03_REPORTS/`, named `YYYY-MM-DD_<Sport>_<Topic>_<Audience>.<ext>` | made in `<repo>/outputs/` | `closeout` copies it (copy, keep the repo one) |
| Code, scripts, project docs, `STATUS.md` | GitHub `erash11/<repo>` | `~/DEV/<repo>` | `git commit` + `git push`, every session |
| Generated output (charts, exports, logs) | `<repo>/outputs/` | same | regenerate from code; gitignore it if large |
| Database (DuckDB, SQLite) | local disk, inside its repo or `~/DEV` | same | nightly `daily-backup.ps1` stages the live DBs (not dated `before`/`backup` copies) into `dev-databases.tgz`, uploaded via `gws` to Drive `_MACHINE/Backups/Machine` (since 2026-10-20; one copy, no history) |
| Secrets (`.env`, tokens, keys) | macOS Keychain or local `.env` | same | nowhere else — never in git, Drive, or chat |
| Claude/Codex config, skills, memory | GitHub `dotclaude`, `claude-skills`, `claude-global-memory` | `~/.claude` | `git push` (daily-backup also pushes) |
| A loose file with no home yet | `~/DEV/_INBOX/` | same | `weekly-review` drains it within 7 days |
| Temporary agent work | the session scratchpad | same | thrown away |

Identifiable athlete health data (`DexaProject`, case reviews like `SpecialRequests/TOS_ES`) stays
where it is: local or its one Drive folder. Never push it to GitHub, never paste it into chat or an
external service. A folder with a `CLAUDE.md` saying "local only" is in this class.

## Machine-written copies (backups)

Scripts write to Drive `_MACHINE/`. Humans browse `00_Primary_Storage_Drive/`. Nothing lives in both.

- `_MACHINE/Cloud_Copy/DEV` — one-way mirror of `~/DEV`, minus databases, secrets, and regenerable/catalog
  caches (`printing-press-library`, `graphify-out/cache`, `.build`, `node_modules`, `.venv`, `__pycache__`).
  Written by `~/.claude/scripts/cloud-push.py` (07:00 and 17:30).
- `_MACHINE/Backups/Machine` — nightly `.tgz` snapshots of `~/.claude/projects`, Codex, Gemini, and LaunchAgents
  uploaded directly by `gws` API (`daily-backup.ps1` `Snapshot-Gws`), plus SSD captures of repo data git does not
  carry from `~/.claude/scripts/backup-manifest.json`.
- External SSD `CRASHBOX` — second nightly copy when it is plugged in.

Read a backup to restore. Edit only the true copy. To add a path to the backups, add it to
`backup-manifest.json`; a path missing from the manifest is not backed up.

## How agents reach Drive

- Read, list, move, and upload through the API: the `gws` CLI (`gws drive files …`), or the Drive MCP.
  Moves keep file IDs; use `gws drive files update` with `addParents`/`removeParents`.
- The mount (`~/Library/CloudStorage/GoogleDrive-…`) is for Eric and for `cloud-push.py`. Agent
  reads through it can hang, and its view can lag the server by days. Before trusting the mount,
  compare its folder list with `gws drive files list`.
- `gws --upload` only takes a path inside the current directory: `cd` to the file's folder first.

## Places that are never a destination

Baylor OneDrive, `~/Desktop`, `~/Downloads`, and the Drive root. If something lands in one of
these, file it by the table above in the same session.

## Before you finish a session

- Every repo you touched: committed and pushed.
- Every deliverable you made: copied to `03_REPORTS/`.
- Every new top-level folder in `~/DEV`: has a `portfolio.json` row (`new-project` does this).

## Known gaps (2026-10-16)

- The Mac's Drive mount went stale because DriveFS was choked on 68,000+ small files in
  `_MACHINE/Cloud_Copy/DEV` (`printing-press-library`, `graphify-out/cache`, leftover `node_modules`).
  Those folders were trashed on Drive via `gws` and excluded in `cloud-push.py` (cutting the file count
  from 104,945 to ~33,735), and `daily-backup.ps1` now uploads its Drive `.tgz` snapshots, receipt, and
  `RESTORE.md` directly via the `gws` API to `_MACHINE/Backups/Machine`, so a lagging local mount can
  never block nightly backups.
- Night backups failed whenever the Mac slept on battery (every 21:00 run 10-13 to 10-22). Since 2026-10-22 the
  backup runs in the daytime: launchd tries hourly 12:00-17:00 through `scripts/daily-backup-login.sh`, which runs
  it only on AC power, at most 2 tries a day, and stops once a run ends OK.
- `cloud-push.py` could not run straight from launchd (macOS blocks it from Terminal-made Drive files). Since
  2026-10-23 launchd opens it in Terminal via `scripts/cloud-push-launch.sh`; a run that never starts logs an ERROR.
- Windows laptop retired 2026-10-14. If a second machine returns, it follows this same table:
  documents through Drive sync, code through `git pull`/`git push`, never a second true copy.

Background and history: `~/DEV/docs/FILE-ORGANIZATION-PLAN.md`.
