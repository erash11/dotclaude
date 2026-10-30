I found issues in five areas. I found none in **(f)**.

**(a) Backup gate**

- [daily-backup-login.sh:15](/Users/kristinarash/.claude/scripts/daily-backup-login.sh:15) — A real run that starts before midnight and ends OK after midnight is missed. The gate can run a second backup that day.
- [daily-backup-login.sh:15](/Users/kristinarash/.claude/scripts/daily-backup-login.sh:15) — Overlapping runs can pair an OK line with the wrong start line. The gate can count a dry run as a real success, or miss a real success.
- The `return 0` guard does **not** stop normal launchd execution.
- The offline test could not run. This read-only session blocked its temporary files.

**(b) Meeting titles**

- [keystone.ps1:2936](/Users/kristinarash/DEV/KeystoneOS/scripts/keystone.ps1:2936) — The email pattern matches **any** email address and text in the middle. A real curated title with that shape can be skipped.
- [keystone.ps1:2933](/Users/kristinarash/DEV/KeystoneOS/scripts/keystone.ps1:2933) — The date patterns cover only a few formats. A date-only timestamp such as `2026-10-30 09:00` is missed.
- [keystone.ps1:3017](/Users/kristinarash/DEV/KeystoneOS/scripts/keystone.ps1:3017) — A skipped meeting stays out of the shared ledger. It is tried again, but can fall outside the 14-day window before the skill exports it.
- The offline title test passed.

**(c) Backup skill**

- [backup/SKILL.md:20](/Users/kristinarash/.claude/skills/backup/SKILL.md:20) — The `awk` range ends at the next end line, even if another run starts first. An unfinished run can include another run’s errors.
- [backup/FIXES.md:29](/Users/kristinarash/.claude/skills/backup/FIXES.md:29) — The stated code `snapshot-ssd` is incomplete. The script emits `snapshot-ssd:.codex` for this failure.
- [backup/FIXES.md:41](/Users/kristinarash/.claude/skills/backup/FIXES.md:41) — `-DryRun` still writes the log and `backup-state.json`. It is not a test “without writing.”
- [backup/SKILL.md:22](/Users/kristinarash/.claude/skills/backup/SKILL.md:22) — The claim that unsaved files were saved nowhere is too broad. Another existing backup could hold them.

**(d) Meeting sync**

- [meeting-sync/SKILL.md:30](/Users/kristinarash/.claude/skills/meeting-sync/SKILL.md:30) — `xargs` splits paths at spaces. A note with spaces in its filename is sent as broken paths.
- [meeting-sync/SKILL.md:30](/Users/kristinarash/.claude/skills/meeting-sync/SKILL.md:30) — An empty list still starts the tagger on macOS. The tagger then fails because it requires a path.
- [meeting-sync/SKILL.md:30](/Users/kristinarash/.claude/skills/meeting-sync/SKILL.md:30) — The date check has no upper limit. It also selects notes dated after today.
- [meeting-sync/SKILL.md:25](/Users/kristinarash/.claude/skills/meeting-sync/SKILL.md:25) — The requested unattended, ID-scoped run conflicts with [name-meetings/SKILL.md:32](/Users/kristinarash/.claude/skills/name-meetings/SKILL.md:32). That skill first resumes all pending renames and asks about queued reviews.
- [meeting-sync/SKILL.md:32](/Users/kristinarash/.claude/skills/meeting-sync/SKILL.md:32) — A missing transcript produces a `skip` line, not a `WARNING`. The note can remain untagged without the required warning in the report.

**(e) Weekly review**

- [weekly-review/SKILL.md:29](/Users/kristinarash/.claude/skills/weekly-review/SKILL.md:29) — `crosswalk` reads the Google Drive mount. It can hang, despite the claim at line 34 that the review reads nothing there.
- [weekly-review/SKILL.md:51](/Users/kristinarash/.claude/skills/weekly-review/SKILL.md:51) — The skill asks for sweep choices before it reads and builds the project map in step 5. A choice can miss evidence that the review gathers later.

**(f) Fireflies intake: NONE.**

I did not run the restricted commands. I did not edit files.