# System audit — 2026-10-22

Read-only audit of the Mac agent stack. 8 domain auditors, a skeptic re-check of every HIGH/CRITICAL
finding, and a gap critic (workflow `wf_11aed943-145`). Nothing was changed.
Full list (145 findings, evidence and fixes): `2026-10-22-system-audit-findings.md` in this folder.

**After the skeptic pass:** 1 critical · 8 high · 74 medium · 62 low. Most are new; known ones are marked.

## Do these first

| # | What | Why it matters | Who | Effort |
|---|---|---|---|---|
| 1 | **Rotate 4 secrets:** GitHub PAT (`GITHUB_PERSONAL_ACCESS_TOKEN`, `CODEX_GITHUB_PERSONAL_ACCESS_TOKEN`), `GMAIL_APP_PASSWORD`, `FIREFLIES_API_KEY`. | A Windows `reg query` dump sits in `~/.claude/projects/C--Users-eric-rash-Desktop-DEV/9378b738-….jsonl`. It is tracked in dotclaude (commit `1d27e80`), pushed to private GitHub, and uploaded nightly to Drive inside `claude-projects.tgz`. 17 Google `AIza…` keys also sit in 19 tracked transcripts. | Eric (only he can rotate) | 30 min |
| 2 | **Quit Grok Bot.** | Still running (pid 74109) and serving remote "local exec" with `localToolPermission: always`, after Grok was declared finished. | Eric | 2 min |
| 3 | **Fix the nightly backup.** | Every scheduled 21:00 run since 10-13 ends `ERROR` (launchd exit 1). The Mac sleeps on battery; `caffeinate -s` only works on AC. The catch-ups cannot replay it: reconcile runs at 07:00 when the job is "not due until 22:00", and `daily-backup-login.sh` line 7 counts `end: ERROR` as done. Today's data is safe only because of a by-hand run at 06:53. | Claude, after Eric picks the time | 1 h |
| 4 | **cloud-push has failed silently since 10-16.** | 17 runs, all `Operation not permitted` into the Drive mount, including by-hand runs. Nothing raises an alert. Its file list also includes `Linda_Projects`, `SpecialRequests/TOS_ES`, and an Edge browser profile (cookies, saved logins). | Claude | 1 h |
| 5 | **The Mac is out of memory.** | 8 GB RAM, 94% swap used, load 6–13 on 6 cores, ~330 GB/day of swap writes. 4 Claude sessions each load their own MCP set (context-mode, playwright, desktop-commander ×3). | Eric: keep ≤2 sessions open | now |

## Quick wins (minutes each, Claude can do on a yes)

- `chmod 600` on `~/.claude/.credentials.json` and `~/.claude/typesafe.env` (both mode 666 today).
- GitHub MCP 400 and the superpowers "EXTREMELY_IMPORTANT" text come from **claude.ai-synced plugin copies** in `~/.claude/plugins/synced/`. The `settings.json` toggles do not reach them. Turn both off in claude.ai plugin settings.
- `where-was-i.py` follows `~/DEV/_DRIVE` into the Drive mount and prints DexaProject and Linda_Projects NEXT lines. Skip that symlink.
- `settings.local.json` is tracked in dotclaude, so 5 Windows-only impeccable hooks fire on the Mac. Untrack it.
- Codex copy of `keystone-unified-snapshot.js` has drifted (two-copies trap). Symlink it.
- Remove the bare `"Bash"` allow rule. 129 allow rules; 20 Windows paths, 57 one-offs. (Skeptic: medium, not high — the auto classifier and dcg still apply.)
- Reclaim ~30 GB: `uv` cache 22 GB, npm cache 7.3 GB, 9 orphan claude-mem plugin versions 4.4 GB.

## Other gaps worth a decision

- No Time Machine, firewall off. Zotero (`~/Zotero`, 1.6 GB) is in no backup layer.
- Nightly `gemini.tgz` carries `~/.gemini/oauth_creds.json` to Drive.
- Nightly SSD layer reads DexaProject through the Drive mount onto the exFAT CRASHBOX.
- Antigravity runs with "always-proceed" and no dcg guard; `cc`/`cx` aliases skip all prompts.
- Three files disagree on the Windows laptop: retired 10-14 (CLAUDE.md, Tier A) vs back for desktop-app 10-21 (USER.md, STATUS).
- `~/DEV/docs/STATUS.md` is 266 lines / 39 KB. 11 repos are in no area index. `portfolio.json` has 3 duplicate names.

## What is healthy

Hook chain (all 13 wired hooks exist and parse). GPS, Perch and VALD pulls ran on schedule today. Memory
compiler and memsearch answer (48,221 chunks). All 144 DEV repos have a remote; none have unpushed commits.
All 55 owned skills parse. uv, Homebrew Python, gh auth, FileVault, SIP and macOS are current.

The compiler-backlog alert is stale: the real backlog is 1 failed log (`daily/2026-10-16.md`).
