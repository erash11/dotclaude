export const meta = {
  name: 'audit-picks-apply',
  description: "Apply Eric's accepted picks from the 2026-10-25 audit sweep: ~/.claude work serially, outside work serially, shadow-log review read-only",
  phases: [
    { title: 'Apply', detail: '2 serial fixers on disjoint trees + 1 read-only reviewer' },
  ],
}

const HANDOFF = '~/DEV/docs/handoffs/2026-10-25-audit-sweep-all-domains.md'
const AUDIT = '~/.claude/audits/2026-10-22-system-audit-findings.md'
const COMMON = `
Eric accepted the agent's pick on each item below ("all picks", 2026-10-25). The full option text for each id is in ${HANDOFF} under "Eric decisions"; the evidence and original fix are under the same id's heading in ${AUDIT}. Read both before acting on an item.
House rules:
- Never print secret values, tokens, keys, or athlete/health data (names, injuries, body composition). Count or name files only.
- Never open contents of DexaProject, SpecialRequests/TOS_ES, or Linda_Projects beyond its CLAUDE.md/AGENTS.md first lines.
- Never read or walk files through the Google Drive FUSE mount; use the gws CLI for Drive (gws is the default for any Google API work).
- Never run \`memsearch index\` by hand. Never upgrade or reinstall pwsh/PowerShell (launchd wrapper trap).
- Shared hooks: edit only ~/.claude/hooks (~/.codex/hooks links there).
- Never delete with rm. Move to ~/.Trash/<name>-2026-10-25. Drive deletes go to Drive Trash via gws (files update --params with trashed true), never permanent delete.
- Football season is on: do not change live football/CFB pipelines or schedules.
- Read every file before editing; smallest change; match style. Run the repo tests touched (python3 -I ~/.claude/scripts/test_*.py; pytest via ~/.local/bin/uv run --with pytest pytest -q; pwsh test files where present).
- Commit per repo, only the files you changed (never git add -A in ~/.claude; other sessions may have uncommitted work). Do NOT commit ${AUDIT} or ${HANDOFF}; the caller records status. End every commit message with exactly:
Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013cwnYrAYa2PQ3pgLjQbq1g
Push after committing.
- If a step turns out riskier than the pick described, or a precondition fails, skip it and say why. Do not improvise a different option.`

const RESULT_SCHEMA = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          outcome: { type: 'string', enum: ['done', 'skipped', 'failed', 'needs-eric'] },
          commit: { type: 'string', description: 'repo + short sha(s), or empty' },
          note: { type: 'string', description: 'one or two sentences: what changed and the check/test result, or why not' },
        },
        required: ['id', 'outcome', 'commit', 'note'],
      },
    },
  },
  required: ['results'],
}

phase('Apply')
const [inside, outside, shadow] = await parallel([
  () => agent(`${COMMON}

You own everything under ~/.claude (dotclaude repo, ~/.claude/claude-memory-compiler, ~/.claude/skills). Nobody else edits there in this run. Do the items in this order:

1. ids disksec-github-pat-in-pushed-transcript + backups-secrets-in-tracked-transcripts (one change): a WARN-ONLY secret check in ~/.claude/scripts/daily-backup.ps1 that runs before the dotclaude commit, scans the staged projects/ files with the script's existing secret regex, and writes matching FILE NAMES only (never values) to ~/.claude/global-memory/transcripts/.errors.log and the backup log. It must never block or fail the backup. Add an offline test in the existing daily-backup test file. No history purge.
2. id backups-dexa-via-fuse-to-exfat, pick B (no spare encrypted disk exists): remove DexaProject from the SSD layer in ~/.claude/scripts/backup-manifest.json so nothing reads it through the Drive mount. Validate the JSON loads and run the backup script's dry-run/offline test if one exists.
3. id mp-health-data-in-compiler-stores, pick (a) going forward only: add a rule to the flush and compile prompts ("never record athlete names with medical, injury or body-composition details; refer to them by role") and a regex warning in flush.py. Then list the existing daily-log/article FILES that match health keywords, by name only, in your note (no content). Do not scrub them.
4. id mp-recompile-on-append, pick (a): stop the compile step; keep flush and the daily logs; leave the existing articles frozen. Find where compile is triggered (flush.py end-of-day trigger, launchd, jobs.json) and turn off only the compile trigger, with a comment saying why (cost vs use, Eric 2026-10-25). Make sure session-start still works and tests pass.
5. id mp-windows-slug-stale-indexed, pick (a), WITH A PRECONDITION: the Windows laptop is still used for desktop-app sessions. First check the newest mtime of any file in ~/.claude/projects/C--Users-*/memory/. If any file there changed after 2026-10-14, SKIP with outcome needs-eric and give the folder names and dates. Otherwise move the C--Users-* memory folders to ~/.claude/_windows-import-archive/ and drop them from recall.py's glob; run recall.py tests. Do not run memsearch index.
6. Settings LAST, one edit of ~/.claude/settings.json (back up first to ~/.claude/backups/settings.json.pre-picks-2026-10-25):
   - id disksec-auto-mode-python-allow, pick (a): remove the blanket python/python3 allow rules and any remaining Windows-path rules; add deny rules Bash(rm -rf:*) and Edit/Write denies for ~/.claude/settings.json and ~/.claude/settings.local.json (use the exact rule syntax Claude Code documents; check existing rule formats in the file).
   - id settings-hooks-bare-bash-allow, pick A: remove Bash(launchctl:*) and Bash(git:*); set skipDangerousModePermissionPrompt to false. Keep the other interpreter rules.
   - id spm-superpowers-overrides-ineffective, pick A: set enabledPlugins "superpowers@claude-plugins-official" to false.
   Write with python (json, indent=2, ensure_ascii=False, trailing newline). Check: the JSON loads, \`claude --version\` runs, git diff shows only the intended lines. Commit.
Return one result per id (use both ids for item 1).`, { label: 'apply:inside-claude', phase: 'Apply', schema: RESULT_SCHEMA }),

  () => agent(`${COMMON}

You own everything OUTSIDE ~/.claude (~/DEV repos, ~/.zshrc, ~/.gemini, Homebrew, npm, Drive via gws, files in ~). Never edit files under ~/.claude. Do the items in order:

1. id disksec-skill-button-closeout-bypass, pick (a): drop closeout from the skill-button BUTTONS list and from the docs (the handoff names COMMANDS.md:395 and SKILL-BUTTONS.md:16 and :42; find the BUTTONS file with grep under ~/DEV). Leave forecast-capture and every other button unchanged. Run that repo's tests if any.
2. id backups-local-only-folders-in-cloud-mirror, pick A: make the first line of ~/DEV/Linda_Projects/CLAUDE.md carry the "local only" marker that ~/.claude/scripts/cloud-push.py looks for (read cloud-push.py's check to match it exactly; read only the first lines of that CLAUDE.md). Commit and push in that repo. Then confirm with a dry check (call cloud-push.py's own local-only function from python, without running a push) that Linda_Projects is now skipped. Then move the Drive folder _MACHINE/Cloud_Copy/DEV/Linda_Projects to Drive Trash with gws (find its id with gws; never via the mount).
3. id gaps-antigravity-unguarded, pick A: in ~/.gemini/antigravity-cli/settings.json set toolPermission to ask and allowNonWorkspaceAccess to false (back the file up first next to it as .pre-2026-10-25, outside git). Validate the JSON.
4. id gaps-bypass-aliases: change only the cx alias to sandboxed 'codex --full-auto' (pick A for cx). Leave cc unchanged (Eric's pick allowed either; keep his habit). Find the alias in ~/.zshrc or files it sources; back up the file first; check with zsh -n.
5. id gaps-parked-zip-health-data, pick A: first read the README/notes that say these copies were hash-checked against the live copies; if that claim is missing, skip. Then mv ~/DEV_backup_2026-09-09.zip (or the zip the finding names), ~/Restore and ~/handoff-staging to ~/.Trash/<name>-2026-10-25. Leave the LIFEOS folders and dotclaude-windows-import where they are. Do not open the contents. Make sure no process has files open there (lsof +D is fine on small dirs; otherwise just check ps for anything referencing the path).
6. id mac-brew-npm-outdated, pick (a): \`brew upgrade --dry-run gh git openssl@3 sqlite\` first; if powershell/pwsh appears anywhere in the list, stop and skip. Otherwise run it. Then uninstall the unused npm globals opencode-ai and pi-coding-agent (keep gemini-cli). Check gh --version and git --version still work.
Return one result per id.`, { label: 'apply:outside', phase: 'Apply', schema: RESULT_SCHEMA }),

  () => agent(`${COMMON}

READ-ONLY. id settings-hooks-shadow-gate-unreviewed, pick (A): review the permission shadow-gate log (find the PreToolUse shadow entry in ~/.claude/settings.json and the log it writes, likely ~/.claude/permission-gate/shadow.jsonl). Report counts only plus a sanitized sample: total entries, date range, verdict/decision counts, top tool names, how often the gate would have blocked something that ran, and 5 example entries reduced to tool name + a short generic description (never raw command bodies, paths with names, or secret-looking strings). End with a recommendation: promote the gate (enforce), or retire it, in 2 options max with your pick. Do not edit anything. Return a single result with outcome done and the review in note (note may be long here: up to ~15 lines).`, { label: 'review:shadow-gate', phase: 'Apply', schema: RESULT_SCHEMA }),
])

return { inside: inside && inside.results, outside: outside && outside.results, shadow: shadow && shadow.results }
