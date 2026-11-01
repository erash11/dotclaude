# STATUS

## Current state
- 2026-10-31 (Mac, session sweep): `scripts/session-sweep.py` now keeps a finished session only until its transcript (`projects/*/<id>*`, subagent files included) is committed and pushed here; the 24 h rule is gone (`03e3715`, test `scripts/test_session_sweep.py`). 17 sessions deleted with `claude rm` today. Handoff `~/DEV/docs/handoffs/2026-10-31-session-sweep-fix.md`.
- 2026-10-31 (Mac, mod review): `context-mode`, `browser-use@synced`, `desktop-commander@synced` off and the `context-mode-cache-heal.mjs` SessionStart entry removed (`0fa28c2`; backup `settings.json.bak-2026-10-31`). Only the `repo-band` mod loads (Closeout button); 10 mods have `.disabled` (`56acdd6`, `64a993e`). `~/.zshrc` now reads `mods/.loadlist`. Why and numbers: `HARNESS_FIXES.md` Done 10-31; handoff `~/DEV/docs/handoffs/2026-10-31-mod-review.md`.
- 2026-10-31 (Mac, files digest): `scripts/claude-files-digest.py` (06:30 email) rebuilt per Eric's pick: Drive deliverables first (Drive API, linked, grouped by folder, `_MACHINE` mirror left out), then git docs linked to GitHub at the commit and grouped by commit message, then one count line per repo for data/code. Empty days send nothing (log line `empty <day>:`). Subject is now `New docs: ...`. `nightly-digest.py` reuses `drive_deliverables`, so its Mac Drive section is back. Tests: `scripts/test_claude_files_digest.py`; dry-runs 10-27, 10-30, 10-31 checked. Commit `91571de`.
- 2026-10-30 (Mac, session-miner): Tier A memory edits (drive stale mount, Mac Office export, compiler SDK trap + models, zsh traps, backup GONE note) + new `feedback_long-jobs-in-terminal.md`. Ledger `claude-memory-compiler/reports/proposals-pending.md`: 7 applied, 3 rejected.
- 2026-10-30 (closeout): `scripts/backup-manifest.json` gained `DEV/_to_delete` (ssd only, class institutional, like `_ARCHIVE`). It holds the 10-29 pre-repair copy of Wilhelm_Brody_RTP and may hold athlete data. Remove the entry when the folder is deleted. Fixes the `manifest-unmanaged:_to_delete` backup error.
- 2026-10-23 (Mac, Windows holdover audit): report `audits/2026-10-23-windows-holdover-audit.md`. Changed: `scripts/verify-backup.ps1` (Mac paths; FAIL when CRASHBOX absent), `scripts/daily-backup.ps1` (step 2b-harvest), `scripts/nightly-digest.py` + `scripts/com.keystone.nightlydigest.plist` (installed, 21:00), `mods/job-watch` (recall status from the backup log), `audits/recall-eval/recall-eval.py` (index guard reads the backup log). Removed ~20 Windows-only scripts and the recall-eval .ps1 chain + `LATEST.md` (in history); `fix-msys-ad-stall.ps1` kept for Windows desktop sessions. Full entry and deferred list: `~/DEV/docs/STATUS.md`.
- 2026-10-22 (Mac, system audit): report `audits/2026-10-22-system-audit.md`. Changed: `settings.json` (bare Bash + 6 junk allow rules removed), `scripts/where-was-i.py` (skips `_DRIVE`), `scripts/daily-backup-login.sh` (now the AC-only backup gate for both jobs), `scripts/com.keystone.dailybackup.plist` (hourly 12-17), `scripts/cloud-push.py` (+ `test_cloud_push.py`; skips local-only folders and browser profiles, errors to `.errors.log`), `STORAGE.md`. Handoff: `~/DEV/docs/handoffs/2026-10-22-system-audit-and-fixes.md`.
- 2026-10-19 (Windows, prompt audit): pulled 55 commits from origin. To do that, stashed `settings.json` and restored 209 transcripts removed by auto-cleanup; the stash pop merged cleanly with the Mac's settings, and the local plugin toggles (playwright, commit-commands, github, claude-mem-cowork) are committed. `projects/` transcripts are still uncommitted, per the 2026-10-16 rule. Audit report: `audits/2026-10-19-prompt-audit.md`; handoff: `global-memory/handoffs/2026-10-19-prompt-audit.md`.
- 2026-10-16 (BayCap closeout maintenance): Preserved the existing `opus[1m]` settings change. Live `projects/` histories remain local, including pre-existing deletions and active transcript changes; do not publish them while the session-log GitHub decision is unresolved. Backup failures remain logged (Drive mount and unmanaged Cloudroom_Learning); no risky repair attempted.
- 2026-10-12 (closeout 2): backup error fixed. `DEV/house-model` was missing from `scripts/backup-manifest.json` (default-deny). Declared it, commit `7e5bbaf`, pushed. Uncommitted and not from this session: `scripts/cloud-push.py` (new 17:58, needs an owner decision), deleted session transcripts (`projects/…jsonl`), and Tier A memory `MEMORY.md` plus `feedback_no-baylor-onedrive.md`. Left as they are.
- 2026-10-12: Closeout saved live session-log changes. House-model setup and week 7 reports are pushed. One compiler flush hit its two-turn limit at 07:31; a different save passed at 07:31:52. The error log was kept. Details: `global-memory/handoffs/2026-10-12-house-model-closeout.md`.
- 2026-10-11 (Mac, stack-doctor 20:10): 12:09 backup failed `memsearch-index:full-set` (lock collision,
  not a bad DB). A full rebuild (PID 45518, started 20:03, parent launchd) was running WITHOUT the
  shared lock, so I wrote its PID into `global-memory/transcripts/.memsearch-index.lock`; the 21:00
  backup then skips the index step. Global MEMORY.md trimmed 98% → 92% (`3c558ab`).
- 2026-10-11 (Mac, /doctor + dcg): Root cause of the returning dcg hook found: dcg's own
  `self_heal_hook` (default on) re-adds the absolute-path entry on every run. Set
  `self_heal_hook = false` in `~/.config/dcg/config.toml` (Mac only, not in any repo). Six noisy
  dcg rules allowlisted in `~/Library/Application Support/dcg/allowlist.toml`; rm -rf and
  branch -D stay guarded. /doctor cleanup: fixed `persistent-localhost` YAML, `articulation-skill`
  name-only, removed `design-taste-frontend-v1` link, disabled 4 unused claude.ai connectors in
  ~/DEV. Handoff: `global-memory/handoffs/2026-10-11-doctor-dcg.md`.
- 2026-10-11 (Mac, doctor-plus): `claude doctor` clean (2.1.296; one failed auto-update today). Tier A
  `MEMORY.md` index de-duplicated (19.8 KB → 7.1 KB, `06dc069`; the 59 long lines came from
  `cb4ace5` Windows import merge). Duplicate dcg hook removed by Eric by hand; the backup commit
  `ff6a02b` carries it. Handoff: `~/DEV/docs/handoffs/2026-10-11-doctor-plus-context-audit.md`.
- 2026-10-10 (Mac): `/doctor` check. Claude Code 2.1.296 is the latest. Background auto-updates turned on (`autoUpdates` in `~/.claude.json`). Two SessionStart hooks (`superpowers-quiet.mjs`, `keystone-unified-snapshot.js`) timeout raised 5s → 15s. Both run in about 0.1s by hand, so the cause of the 17 startup timeouts is unknown. Handoff: `global-memory/handoffs/2026-10-10-doctor-config.md`.
- 2026-10-07 (Mac): mattpocock-skills 1.3.1 win every overlap (Tier A
  `feedback_defer-to-mattpocock-skills.md`). The memsearch Milvus and nightly-digest
  failures in `.errors.log` are both Windows-side; queued as `HARNESS_FIXES.md` #9 and #10.
  Handoff: `global-memory/handoffs/2026-10-07-pocock-skills-and-windows-failures.md`.
- 2026-10-03 (Mac): harness time budget adopted. System work only in the Friday 1–2 PM slot;
  the queue lives in `HARNESS_FIXES.md`. First pass done: CommandCentre `server.out`
  untracked; dcg job-dir redirect is won't-fix. Handoff:
  `global-memory/handoffs/2026-10-03-harness-time-budget.md`.
- 2026-09-24 closeout: 147 DEV repositories and 13 nested repositories under `.claude` were checked. SpeedProfiling and PT_Dash are clean, synced feature branches. RunningTheRoom was subsequently advanced by another session; its current `main` branch includes the closeout commit and is synced with `origin/main`.
- Windows and macOS share this configuration repo through GitHub. Managed skills remain authored in the separate `~/.claude/skills` repo and published to generated Windows views.

## Next
- `/claude-stack-doctor` on 2026-10-12. If PID 45518 has finished, the next backup clears `backup-error`. Do NOT move `~/.memsearch/milvus.db` aside again. After one clean backup, delete the 4 old copies in `~/.memsearch/` (`.bak-*`, `.pre-3x-*`, `.broken-*`).
- `git -C ~/.claude stash drop` — stash@{0} (2026-10-05 dcg removal) is redundant; the `grep -c "local/bin/dcg" ~/.claude/settings.json` check printed 1 on 2026-10-11 with self-heal off.
- On Windows: decide whether dcg there also needs `self_heal_hook = false` (check `dcg config | grep -i self-heal`).
- Check the startup hook timeouts again around 2026-10-17. Count `hook_cancelled` entries with `timedOut` in recent transcripts.
- On Windows: `Get-Content ~\.claude\scripts\logs\nightly-digest.log -Tail 5` to get the real
  send error (`HARNESS_FIXES.md` #10), then the Milvus checks in #9.
- Everything else system-side: `HARNESS_FIXES.md`, Friday slot only.
- Resume from `global-memory/handoffs/2026-09-24-sportsmith-video-workflow.md`.
- Draft a portable video-processing and transcript-review skill in the canonical skills repo, then sync it to Codex and `.agents` views.
- Configure the correct private remote for RunningTheRoom and push `ff3cefd`.
- A human audio-listening pass for Sportsmith Part 2 remains optional; the transcript is caption-cross-checked, not human-verified word-for-word.
## Open questions
- Is the Windows laptop still meant to run no automation? Global MEMORY.md says "Win laptop hands-off 10/8, no automation", but `skills/claude-stack-doctor/SKILL.md` describes the Windows scheduled task `\Eric\memsearch-drain-weekly` (Sundays 02:00) as active. Decide which is current, then fix the other.
- The GitHub plugin is now enabled in `settings.json`, but on 2026-10-19 its MCP server rejected the configured token (HTTP 401). Keep it and fix the token, or turn the plugin off again?

## Gotchas
- **A finished session's transcript is committed only by the backup (hourly 12:00-17:00) or `/closeout`.** A session that ends after 17:00 shows as kept by `session-sweep.py` until the next day's backup. `claude rm` keeps the transcript file; it only drops the session from the list (2026-10-31).
- **A hand-run `memsearch index` takes no lock.** Only the SessionEnd hook and daily-backup use `.memsearch-index.lock`, so a manual rebuild collides with the next backup and Milvus Lite reports it as "older database". Write the rebuild's PID into the lock, or start it through the hook (2026-10-11).
- **`.errors.log` syncs between machines.** A Windows failure shows up on the Mac. Look for
  `C:\Users\` in a traceback before debugging on the wrong machine (2026-10-07).
- **dcg self-heal rewrites settings.json.** With `self_heal_hook = true` (the default) every dcg run re-adds the absolute-path hook. Keep it `false` in `~/.config/dcg/config.toml`; a dcg update may reset it (2026-10-11).
- **Never run `dcg install` here.** `dcg doctor` only recognizes the absolute-path hook and
  will ask for it; the portable guarded entry already covers both machines. Installing
  re-adds a Mac-only line that then gets swept into a settings commit (e72c374).
- **The closeout repo sweep used to miss nested repos under `~/.claude`.** It walked `~/DEV`
  plus three named config repos, so `claude-memory-compiler` sat on an unmerged branch for 17
  days while closeout reported "clear to sign off". A sweep must walk nested git repos under
  `~/.claude` too, and should flag any repo not on `main`/`master`, not just dirty ones.
- A pre-merge `git merge-tree` "clean" result is not trustworthy - it reported clean for a merge
  that then conflicted on `uv.lock`. Merge into the feature branch first and look.
- `projects/**.jsonl` files are live session logs and may change again after a closeout commit when the stop hook writes its final entry.
- `scripts/backup-manifest.json` is **not** globally sorted — some `DEV/` entries were appended
  after the non-`DEV` block. Insert new entries in place; a full re-sort churns unrelated lines.
  `json.dumps(d, indent=1, ensure_ascii=False) + "\n"` round-trips the file byte-identically.
- Two sessions can write to this repo at once. Check `git log` before assuming a change is yours.
- `~/Library/LaunchAgents` is **not backed up** - not in `backup-manifest.json`, not snapshotted.
  The launchd job definitions exist in exactly one place on this machine.
- After editing a launchd plist, reload it or the change does nothing:
  `launchctl bootout gui/$(id -u)/<label>` then `launchctl bootstrap gui/$(id -u) <plist>`.
  Confirm with `launchctl print gui/$(id -u)/<label>`.
- `daily-backup.out` now grows with every run, as `daily-backup.log` already did. Neither is
  rotated.
- **There is no "no-op push" bug, despite the 2026-09-17 note saying so.** A genuine no-op push
  prints `Everything up-to-date` to stderr and exits **0**, and the script only records an error
  on a non-zero exit, so it stays silent. Verified on a throwaway repo 2026-09-19.
  The 2026-09-17 `repo-push:dotclaude` error was a REAL failure - the full block reads
  `RPC failed; curl 55 Recv failure`, `send-pack: unexpected disconnect`,
  `fatal: the remote end hung up unexpectedly`, and `Everything up-to-date` was merely the last
  of git's four stderr lines. Reading one line out of four produced the wrong diagnosis, and the
  double-logging made that block twice as long and easy to misread.
- That 2026-09-17 failure was a transient network error, and the job has **no retry**. A push
  that fails this way is not reattempted until the next day's run.




