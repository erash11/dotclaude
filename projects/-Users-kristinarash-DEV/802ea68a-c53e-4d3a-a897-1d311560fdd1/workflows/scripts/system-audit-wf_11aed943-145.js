export const meta = {
  name: 'system-audit',
  description: 'Read-only audit of Eric\'s Mac agent stack: 8 domain auditors, skeptic verify on high/critical, gap critic',
  phases: [
    { title: 'Audit', detail: '8 read-only domain auditors' },
    { title: 'Verify', detail: 'skeptic re-checks HIGH/CRITICAL findings' },
    { title: 'Gaps', detail: 'completeness critic' },
  ],
}

const RULES = `
HARD RULES (this is an AUDIT, strictly READ-ONLY):
- Do NOT modify anything: no file writes/edits/deletes/moves, no settings edits, no git commit/push/pull/fetch that changes state, no launchctl load/unload/kickstart/bootout, no brew install/upgrade/cleanup, no pip/uv/npm installs, no kill.
- NEVER run \`memsearch index\` (it is destructive). \`memsearch search\`/stats-type reads are OK.
- NEVER read, list, stat, or copy anything under ~/Library/CloudStorage/ (the Google Drive FUSE mount hangs). Use logs and receipts that live outside it instead.
- NEVER open DexaProject, ~/DEV/Linda_Projects, SpecialRequests/TOS_ES, or any folder whose CLAUDE.md says "local only". Never print secret values (tokens, keys, passwords) — report only that/where they exist.
- 'timeout' is not installed; avoid long-running commands. Do not run the backup, cloud-push, or any scheduled job script to "test" it — read its logs instead.
- Evidence must be a real path, line, or command output you saw. No inference presented as fact. If you could not check something, say so in 'not_checked'.
- Known context: Mac is the primary machine. Windows laptop was retired 2026-10-14 but is back for Claude desktop-app sessions only since 2026-10-21 (no automation). cloud-push.py failing under launchd ('Operation not permitted') is already known and run by hand. Hooks have two copies (see memory 'hook two-copies trap').
- To mark already_known, check: Tier A memory ~/.claude/projects/-Users-kristinarash-DEV/memory/*.md, ~/DEV/docs/STATUS.md, ~/.claude/STORAGE.md (Known gaps), ~/.claude/HARNESS_FIXES.md, and recent audits in ~/.claude/audits/ (2026-09-30-memory-infra-audit.md, 2026-10-19-prompt-audit.md). Say where it is already recorded.
- Severity: critical = data loss / security exposure / core pipeline silently broken now; high = something Eric relies on is failing or will fail soon; medium = drift, waste, or a trap waiting; low = cosmetic/cleanup.
- Be exhaustive within your domain but concrete. Aim for every real issue; skip pure style opinions.
`

const FINDINGS = {
  type: 'object',
  properties: {
    domain: { type: 'string' },
    summary: { type: 'string', description: '2-3 sentence health verdict for this domain' },
    healthy: { type: 'array', items: { type: 'string' }, description: 'things checked and found working (short)' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'short slug, domain-prefixed' },
          title: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          evidence: { type: 'string', description: 'exact paths, lines, command + output excerpt' },
          impact: { type: 'string' },
          fix: { type: 'string', description: 'concrete recommended fix (do NOT apply it)' },
          effort: { type: 'string', enum: ['minutes', 'hour', 'half-day', 'bigger'] },
          already_known: { type: 'boolean' },
          known_where: { type: 'string' },
        },
        required: ['id', 'title', 'severity', 'evidence', 'impact', 'fix', 'effort', 'already_known'],
      },
    },
    not_checked: { type: 'array', items: { type: 'string' } },
  },
  required: ['domain', 'summary', 'findings', 'healthy', 'not_checked'],
}

const VERDICTS = {
  type: 'object',
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          verdict: { type: 'string', enum: ['confirmed', 'refuted', 'downgrade', 'uncertain'] },
          corrected_severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          reason: { type: 'string', description: 'what you re-ran and saw' },
        },
        required: ['id', 'verdict', 'reason'],
      },
    },
  },
  required: ['verdicts'],
}

const DOMAINS = [
  { key: 'settings-hooks', prompt: `Domain: Claude Code harness config and hooks on this Mac.
Check ~/.claude/settings.json and ~/.claude/settings.local.json (and any project .claude/settings*.json in ~/DEV root): every hook command wired there resolves to a file that exists, is executable/runnable, and does not error when its interpreter parses it (syntax check only, e.g. node --check, python3 -m py_compile into a temp dir under /Users/kristinarash/.claude/jobs/802ea68a/tmp, bash -n). Note hooks that call uv/node/python by path and whether those paths exist.
Compare ~/.claude/hooks/*.hook.ts and ~/.claude/hooks/hooks.json against what settings.json actually wires: which hook files are orphaned (never run), and is hooks.json a second, conflicting config (LIFEOS/PAI leftover?). Check the two-copies trap: are there duplicate hook copies (e.g. in a dotclaude repo vs ~/.claude, or plugin copies) that have drifted (diff them)?
Permissions: flag risky allow rules (bare "Bash", "Bash(git:*)", "Bash(pip install:*)" which violates PEP668 rule, defaultMode, skipDangerousModePermissionPrompt, autoMode), and stale rules (C:/Users/eric_rash Windows paths, one-off commands, task ids). Count them.
Check skill-router (~/.claude/skill-router/router.py and skill_router.log for errors/latency), permission-gate shadow_hook.py and its logs, dcg (~/.local/bin/dcg exists?), statusLine command works (parse only), outputStyle file exists, enabledPlugins vs ~/.claude/plugins/installed_plugins.json or equivalent, extraKnownMarketplaces reachable entries, and the many settings.json.bak* files.
Check ~/.claude/global-memory/transcripts/.errors.log and other hook logs (autopush.log, transcript-capture output) for recent recurring failures.` },
  { key: 'scheduled-jobs', prompt: `Domain: scheduled automation (launchd) and KeystoneOS job runs.
For EVERY plist in ~/Library/LaunchAgents matching com.keystone.*, com.erash11.*, dev.cloudroom.*: read it, record schedule, program, log paths. Check: is it loaded (launchctl list | grep), last exit status, does the program/script it calls exist, do its log files exist and when were they last written vs the schedule (stale = missed runs), and the last error lines in its .err/.log. Specifically: com.keystone.dailybackup shows last exit 1 — find why from ~/.claude/scripts/logs/daily-backup.log/.out/.err and backup-state.json. com.keystone.clouddrivepush exit 1 (known: launchd 'Operation not permitted', run by hand) — confirm whether anything changed. com.keystone.stackdoctor: its outputs in ~/DEV/KeystoneOS/outputs look last written July 27 — find where it really writes and whether it is producing anything. Check com.keystone.morning, commandcentre (retired 10-03 per memory — is the plist still present/loaded?), graphextract, gpspull/perchpull/valdpull (live data pipelines — mid-season critical), reconcile, adjudicate, rituals, aiosaudit, agysync, filesdigest. Note .plist.bak files left in LaunchAgents and the plist copy in ~/.claude/scripts that may differ from the installed one (diff).
Read ~/DEV/KeystoneOS/outputs/run-ledger.json and summarize failing/stale jobs. Compare against memory file project_automation-cadence.md for the intended schedule.
Also check crontab -l and any CronCreate/remote routines you can see locally (do not create any).` },
  { key: 'memory-pipeline', prompt: `Domain: memory and knowledge pipeline.
claude-memory-compiler (~/.claude/claude-memory-compiler): the hook error log says '2 log(s) backlogged' (compiler-backlog). Find the backlog mechanism, how many daily logs are uncompiled, last successful compile, any errors in its logs/state files, its uv env health (uv run --directory ... python -c 'import sys' is OK). Check daily/ and knowledge/ consistency (index.md entries vs files on disk, broken links, counts — SessionStart said 518 articles 388 concepts 124 connections 0 qa).
global-memory: ~/.claude/global-memory/USER.md and MEMORY.md character caps (1,375 and 2,500 per their header comments) — measure actual char counts. transcripts/ size and errors.
Tier A: ~/.claude/projects/-Users-kristinarash-DEV/memory/MEMORY.md — every link resolves to a file, every .md file in that folder is indexed, frontmatter valid (name/description/metadata.type), [[links]] dangling, duplicates/contradictions (e.g. Windows laptop retired 10-14 vs back in use 10-21; command centre retired), stale facts that name files/paths that no longer exist (spot-check paths named in memories).
memsearch: which binary, config, index path vs what paths it should index (see memory project_memsearch-index-path-drift.md), last sync time, hook ~/.claude/hooks/memsearch-sync.js logs. Run a harmless 'memsearch search "backup" --top-k 3' to confirm it answers. NEVER run memsearch index.
claude-mem plugin, context-mode knowledge DB (~/.claude/context-mode 172M), token-dashboard.db — are these duplicate memory systems that are all active? Report overlap.
Check SessionStart/PreCompact/SessionEnd compiler hooks run without error (look at their logs).` },
  { key: 'backups-sync', prompt: `Domain: backups and sync (data-loss risk). Do NOT read the Drive mount.
Read ~/.claude/STORAGE.md, memory files project_backup-sync-system.md, project_cloud-copy-approval.md, project_cloud-push-launchd-blocked.md, project_drive-fuse-*.md.
daily-backup: ~/.claude/scripts/daily-backup.ps1 run via pwsh by launchd. From ~/.claude/scripts/logs/daily-backup.log (tail and grep for 'daily-backup end', FAIL, ERROR, skipped, backup-target-offline), backup-state.json, daily-backup.err/out: what layers ran last night (22 Oct 06:53) and which failed/skipped; what is the last fully successful run date for each target (GitHub pushes, local snapshot, Drive gws upload). Why did launchd record exit 1?
backup-manifest.json: every source path in it exists? any repo under ~/DEV with a git remote that is NOT covered? ~15 .bak copies of the manifest — flag clutter.
GitHub as backup: for ~/.claude itself and for nested git repos in ~/.claude (global-memory, skills, claude-memory-compiler etc.), and the DEV root repo, check git status (dirty files count) and ahead/behind vs upstream using only local refs (git status -sb, git rev-list --count @{u}..HEAD — do NOT fetch). Unpushed commits = unbacked work.
session-autopush.js: read its log ~/.claude/global-memory/transcripts/autopush.log for failures.
cloud-push.py logs (~/.claude/scripts/logs/cloud-push.log/.out): last run result.
Local DB backups (memory says live DEV databases back up nightly since 10-20): confirm from logs which DBs, last success.
Restore readiness: ~/.claude/RESTORE.md, restore.command exist and refer to paths that exist. Any secret files (CREDENTIALS.md, .env) being backed up to places they should not be?` },
  { key: 'dev-repos', prompt: `Domain: the ~/DEV project portfolio (145 git repos within depth 3, excluding _ARCHIVE).
First read ~/.claude/scripts/where-was-i.py to confirm it is read-only; if so run it and use its output. Then for every git repo under ~/DEV (find ~/DEV -maxdepth 3 -name .git -not -path '*/_ARCHIVE/*' -not -path '*/node_modules/*'), excluding Linda_Projects and any DexaProject, gather with local-only git commands (no fetch): branch, dirty file count, ahead/behind upstream, no upstream/no remote, last commit date, presence and age of docs/STATUS.md, stale branches already merged into main (post-merge cleanup rule), stray worktrees (git worktree list).
Check ~/DEV root repo: .gitignore starts with /* (must never be removed), docs/STATUS.md length (is it bloated? count lines/chars), and the area indexes (FOOTBALL.md, PERFORMANCE.md, RESEARCH.md, PLATFORM.md, PROGRAM.md, PERSONAL.md, COMMANDS.md, WORKFLOW.md): every folder they name exists, and every top-level ~/DEV folder (and depth-2 project in grouping folders like Football/) is named in some index. Check KeystoneOS portfolio registry (find portfolio.json) rows vs folders on disk.
Check for secrets committed or sitting untracked-but-not-ignored in repos (grep -rIl for patterns like 'sk-ant-', 'AKIA', 'ghp_', 'xoxb-', 'BEGIN PRIVATE KEY', 'api_key\\s*=\\s*["\\']\\w{16,}' in tracked files via git grep; report file paths only, never values).
Flag large files tracked in git (>50MB), repos with DuckDB/SQLite files inside Drive-synced paths, and node_modules/.venv committed.` },
  { key: 'skills-plugins-mcp', prompt: `Domain: skills, plugins, agents, MCP servers, and instruction files (context budget).
Skills: ~/.claude/skills (61 entries, 228M), ~/.claude/skills-archive (55M), ~/.claude/agents and agents-disabled. For each skill: SKILL.md exists with valid frontmatter (name, description), name matches folder, broken symlinks, scripts referenced by SKILL.md exist. Find duplicates: same skill name provided by user skills AND plugins (e.g. research-in-5, sports-science-research-grounding exist as both a user skill and anthropic-skills:*), and settings.json skillOverrides that point at skills that do not exist. Why is skills/ 228M (find the big subfolders). Read memory project_skill-bloat-and-promotion.md first and respect it.
Plugins: ~/.claude/plugins is 5.5G — break down by marketplace/plugin/version, count stale cached versions (multiple versions of one plugin). enabledPlugins in settings.json (25) vs installed; plugins enabled but never used (check ~/.claude/skill_router.log, history or telemetry if available — say if you cannot tell). Overlapping memory plugins: claude-mem@thedotmack AND claude-mem-cowork AND context-mode AND claude-memory-compiler AND memsearch.
MCP: read MCP server config (~/.claude.json mcpServers, project-level .mcp.json in ~/DEV, plugin .mcp.json). The github plugin MCP failed this session with "Authorization header is badly formatted" — find the cause (e.g. empty/malformed GITHUB token env var referenced by plugins/.../github/.mcp.json; check whether the var is set, without printing it — print only its length and whether it starts with expected prefix). Check other MCP servers configured but unreachable. Check ~/.claude/mcp-needs-auth-cache.json.
Instruction files: ~/.claude/CLAUDE.md, machine.md, AGENTS.md, ~/DEV/CLAUDE.md, ~/DEV/AGENTS.md — contradictions between them (e.g. USER.md 'Win laptop desktop app only 10/21' vs CLAUDE.md 'Windows laptop retired 2026-10-14'), stale pointers (files they reference that do not exist: check every path they name), and total always-loaded context size (chars) including injected USER.md/MEMORY.md/Tier A MEMORY.md and the skill list. Check output-styles/ files.` },
  { key: 'disk-security', prompt: `Domain: disk usage, clutter, and security hygiene of ~/.claude and the home folder (excluding ~/Library/CloudStorage entirely).
Disk: df -h /; du -sh of ~/.claude/* (projects 3.1G, plugins 5.5G, _windows-import-archive 930M, claude-memory-compiler 560M, context-mode 172M, token-dashboard.db 143M, jobs 132M, doctor-backup-20260807-135924 23M, _to_delete, file-history, shell-snapshots, session-env, paste-cache, telemetry). For each big one: what it is, is it safe to prune, what tool already exists to prune it (session-sweep.py for projects — read it, don't run it with delete flags; a dry-run/list mode is OK if it clearly exists). Also ~/Library/Caches top entries, ~/DEV size top 15 (du -sh ~/DEV/* | sort -h | tail -15), ~/Downloads and ~/Desktop size (STORAGE.md says they are never destinations — list how many files sit there).
Clutter: count backup/bak files in ~/.claude (settings.json.bak*, AGENTS.md.bak*, CLAUDE.md.bak*, backup-manifest.json.bak*, daily-backup.ps1.bak*, memsearch-sync.js.bak*, machine.md.encoding-bak, claude-json-backup-*.json, settings-backup-*.json), retired Windows .ps1 scripts in ~/.claude/scripts that no Mac job calls (grep plists and settings for each), _to_delete contents, LIFEOS folder (is it still used?).
Security: CREDENTIALS.md — does it contain actual secrets in plaintext (report yes/no and which kinds, NEVER values)? File permissions on it and on any .env files under ~/.claude and ~/DEV (world-readable?). Plaintext tokens in settings.json env, ~/.claude.json, shell rc files (~/.zshrc, ~/.zprofile, ~/.bashrc) — memory says secrets belong in macOS Keychain, not ~/.zshrc. history.jsonl or paste-cache containing pasted secrets (grep for key patterns, report counts and file names only). Localhost services listening (lsof -nP -iTCP -sTCP:LISTEN) — any bound to 0.0.0.0 instead of 127.0.0.1 (memory project_command-centre.md has localhost web-service security rules). permission-gate / dcg guard installed and active. skipDangerousModePermissionPrompt / bypass mode implications.` },
  { key: 'mac-toolchain', prompt: `Domain: Mac toolchain and OS basics (secondary to the agent stack; keep it light but accurate).
Read ~/.claude/TOOLPATHS.md and memory project_path-shadowing-and-cleanup.md. Then: PATH from a clean login shell (env -i HOME="$HOME" USER="$USER" TERM=xterm SHELL=/bin/zsh /bin/zsh -lic 'echo $PATH'); duplicates or missing dirs in PATH; for key tools (python3, uv, node, npm, git, gh, claude, codex, pwsh, duckdb, R, Rscript, memsearch, graphify, rg, jq, gws, room-cli, browser-use, dcg) run which -a and --version; flag shadowing (two copies, different versions), and tools TOOLPATHS.md names that no longer exist. uv must be at ~/.local/bin/uv. /usr/local/bin should be empty.
Homebrew: brew doctor (read-only) and brew outdated count (do NOT upgrade). npm -g ls --depth=0 for stale globals. Python: any packages installed globally in Homebrew python (violates PEP 668 rule)? venvs referenced by hooks/jobs exist.
gh auth status (is the token valid; which scopes — no token value). git config --global (user, credential helper). Keychain: confirm expected secrets are referenced from keychain by scripts (security find-generic-password -s <name> existence checks only, never -w).
macOS: sw_vers, softwareupdate --list (may be slow — skip if it hangs), FileVault status (fdesetup status), firewall status, Time Machine status (tmutil latestbackup / destinationinfo), login items (osascript -e 'tell application "System Events" to get the name of every login item'), uptime, memory pressure (memory_pressure | tail -1 or vm_stat), top CPU processes (ps -Ao pid,pcpu,pmem,comm -r | head -15) — note any runaway node/python/claude processes and how many claude processes are running.` },
]

phase('Audit')
const results = await pipeline(
  DOMAINS,
  d => agent(`You are auditing one part of Eric Rash's Mac (user kristinarash) agent/automation system. Today is 2026-10-22.\n${RULES}\n\n${d.prompt}\n\nUse a scratch dir /Users/kristinarash/.claude/jobs/802ea68a/tmp/${d.key} for any temp files. Return structured findings for domain '${d.key}'.`,
    { label: `audit:${d.key}`, phase: 'Audit', schema: FINDINGS }),
  async (res, d) => {
    if (!res) return null
    const serious = res.findings.filter(f => f.severity === 'critical' || f.severity === 'high')
    if (!serious.length) return { ...res, verdicts: [] }
    const v = await agent(`You are a skeptical verifier. Another agent audited '${d.key}' on Eric's Mac and claims the findings below are HIGH or CRITICAL. For EACH one, independently re-run the evidence (read the files, re-run the read-only commands) and try to REFUTE it: is it actually false, already fixed, intended behavior, mis-read logs, or over-rated in severity? Default to 'uncertain' if you cannot check. Use 'downgrade' with corrected_severity when real but overstated.\n${RULES}\n\nFINDINGS:\n${JSON.stringify(serious, null, 2)}`,
      { label: `verify:${d.key}`, phase: 'Verify', schema: VERDICTS })
    return { ...res, verdicts: v ? v.verdicts : [] }
  },
)

const done = results.filter(Boolean)
log(`${done.length}/${DOMAINS.length} domains returned; ${done.reduce((n, r) => n + r.findings.length, 0)} findings`)

phase('Gaps')
const digest = done.map(r => `## ${r.domain}\n${r.summary}\nFindings: ${r.findings.map(f => `[${f.severity}] ${f.title}`).join('; ')}\nNot checked: ${r.not_checked.join('; ')}`).join('\n\n')
const gaps = await agent(`You are the completeness critic for a read-only audit of Eric Rash's Mac agent/automation system (~/.claude harness, launchd jobs, memory pipeline, backups, ~/DEV repos, skills/plugins/MCP, disk/security, toolchain). Below is what 8 domain auditors found and what they said they did NOT check. Find what is MISSING: important parts of the system nobody looked at (look around ~/.claude, ~/DEV/KeystoneOS, ~/SecondBrain, ~/go/bin CLIs, Zotero/Milvus, Cloudroom, Codex ~/.codex config, Gemini/Antigravity config, the 'not_checked' items), and check the most important of those gaps yourself. Return findings in the same schema with domain 'gaps'.\n${RULES}\n\nAUDIT SO FAR:\n${digest}`,
  { label: 'critic:gaps', phase: 'Gaps', schema: FINDINGS })

return { domains: done, gaps }
