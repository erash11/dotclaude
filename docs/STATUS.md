# STATUS

## Current state
- 2026-09-24 closeout: 147 DEV repositories and 13 nested repositories under `.claude` were checked. SpeedProfiling and PT_Dash are clean, synced feature branches. RunningTheRoom overview and draft plan were committed locally as `ff3cefd`, but that repository has no Git remote configured, so its commit cannot be pushed.
- Windows and macOS share this configuration repo through GitHub. Managed skills remain authored in the separate `~/.claude/skills` repo and published to generated Windows views.

## Next
- Resume from `global-memory/handoffs/2026-09-24-sportsmith-video-workflow.md`.
- Draft a portable video-processing and transcript-review skill in the canonical skills repo, then sync it to Codex and `.agents` views.
- Configure the correct private remote for RunningTheRoom and push `ff3cefd`.
- A human audio-listening pass for Sportsmith Part 2 remains optional; the transcript is caption-cross-checked, not human-verified word-for-word.
## Open questions
- `INDEX full set: Indexed 0 chunks` on the 2026-09-19 run, against 91 the day before. The
  script does not count it as an error, so it fails silently. Not yet investigated.

## Gotchas
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


