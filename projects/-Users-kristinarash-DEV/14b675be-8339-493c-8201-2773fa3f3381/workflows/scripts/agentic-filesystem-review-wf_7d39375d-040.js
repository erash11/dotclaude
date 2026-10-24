export const meta = {
  name: 'agentic-filesystem-review',
  description: 'Map Eric\'s agent-system folders, design one-home layout, adversarially check it (read-only)',
  phases: [
    { title: 'Map', detail: '6 read-only readers, one area each' },
    { title: 'Design', detail: 'target layout + ranked steps' },
    { title: 'Verify', detail: 'breakage lens + rules lens' },
  ],
}

const HARD_RULES = `
HARD RULES (read-only job — you change nothing):
- Do NOT modify, move, delete, chmod, git-commit or index anything. Read and list only.
- NEVER read or walk ~/Library/CloudStorage or ~/DEV/_DRIVE (the Google Drive FUSE mount hangs). Learn about Drive only from docs.
- NEVER open DexaProject, Linda_Projects, SpecialRequests/TOS_ES (health/private data). Note existence only.
- NEVER print secret values. For ~/.claude/.credentials.json, ~/.claude/typesafe.env, CREDENTIALS.md, any .env, auth/token files: note path, size, mode only.
- Do not run 'memsearch index' or any job/scheduled script. No network.
- 'timeout' is not installed. Avoid deep recursive scans of huge trees (~/.claude/projects is 3.1 GB of .jsonl transcripts) — use 'du -sh -d 1', 'ls', 'find -maxdepth', and targeted grep with --exclude-dir=projects.
- To find who reads/writes a path, grep ~/.claude/settings.json, ~/.claude/hooks, ~/.claude/scripts, ~/.claude/skills, ~/Library/LaunchAgents/*.plist, ~/.codex (config.toml, hooks), ~/DEV/KeystoneOS, and the routers ~/DEV/*.md.
- Context: today is 2026-10-23. Football is mid-season ("do not break mid-season work"). The Mac is the only automated machine (Windows laptop retired from automation 10-14). A read-only system audit ran 10-22: summary ~/.claude/audits/2026-10-22-system-audit.md, full findings ~/.claude/audits/2026-10-22-system-audit-findings.md (grep it for your area instead of re-deriving; some items were fixed 10-23, so verify current state on disk).
- Storage rules already exist: ~/.claude/STORAGE.md and ~/DEV/docs/FILE-ORGANIZATION-PLAN.md (Tasks 1-8). Read the parts relevant to your area. Do not redesign Drive; that is covered.
Return concrete paths, sizes and evidence. Mark anything you could not check in not_checked.`

const INVENTORY_SCHEMA = {
  type: 'object',
  properties: {
    area: { type: 'string' },
    summary: { type: 'string', description: '3-6 sentences: what lives here and the main organization problems' },
    locations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          path: { type: 'string' },
          size: { type: 'string' },
          purpose: { type: 'string' },
          writers: { type: 'array', items: { type: 'string' } },
          readers: { type: 'array', items: { type: 'string' } },
          tracked_in_git: { type: 'string', description: 'repo name, or "no", or "gitignored"' },
          status: { type: 'string', enum: ['active', 'stale', 'duplicate', 'clutter', 'regenerable-cache', 'app-managed', 'unknown'] },
          notes: { type: 'string' },
        },
        required: ['path', 'purpose', 'status'],
      },
    },
    problems: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          evidence: { type: 'string' },
          impact: { type: 'string' },
          suggested_fix: { type: 'string' },
          risk: { type: 'string', enum: ['low', 'medium', 'high'] },
          reversible: { type: 'boolean' },
        },
        required: ['id', 'title', 'evidence', 'suggested_fix', 'risk'],
      },
    },
    not_checked: { type: 'array', items: { type: 'string' } },
  },
  required: ['area', 'summary', 'locations', 'problems'],
}

const AREAS = [
  { key: 'dotclaude-top', prompt: `Area: the TOP LEVEL of ~/.claude (files and folders directly inside it), excluding the internals of plugins/, projects/, skills/ (other readers cover those). ~/.claude is the git repo "dotclaude" (check .gitignore to see what is tracked). For each entry: what it is, who writes/reads it, tracked or not, and whether it is active, stale, a backup (.bak*, *-backup-*, doctor-backup-*, skills-backup-*, _to_delete, .gitignore.bak, machine.md.encoding-bak), or a duplicate (e.g. ~/.claude/rot.md vs ~/.claude/global-memory/dev-docs/KeystoneOS/rot.md; agents vs agents-disabled; skills-archive; skills-audit*; LIFEOS; _windows-import-archive 930M; root-level .md docs START-HERE/RESTORE/RECOVERY-INVENTORY/MIGRATION-MACOS/HARNESS_FIXES/CREDENTIALS/TOOLPATHS). Say which docs overlap. Note which top-level items are Claude Code app-owned (history.jsonl, file-history, shell-snapshots, session-env, paste-cache, statsig, todos, tasks, sessions, ide, telemetry, cache, .claude.json) and must stay where the app puts them.` },
  { key: 'plugins-appdirs', prompt: `Area: plugin and app-managed folders. ~/.claude/plugins (cache/ incl. ~25 temp_git_* dirs, thedotmack/claude-mem 1.2G disabled, claude-plugins-official, synced/, marketplaces/, data/, .trash/, installed_plugins.json, known_marketplaces.json), ~/.claude/vendor, ~/.claude/node_modules + package.json, ~/.claude/mods, ~/.claude/dev-mods, ~/.claude/skill-router, ~/.claude/context-mode, ~/.claude/chrome, ~/.claude/daemon*, and (sizes + top-level names only, read-only) ~/Library/Application Support/Claude (local-agent-mode-sessions/*/*/rpm holds the desktop app's own plugin copies). For each: is it regenerable cache, app-managed (do not touch), or Eric-owned? Which temp_git_* dirs are referenced by installed_plugins.json or known_marketplaces.json (orphans are not)? What is safe to clear and how much space returns? Which plugin is enabled in ~/.claude/settings.json enabledPlugins but inert or duplicated?` },
  { key: 'cross-harness', prompt: `Area: other agent harnesses and cross-harness duplication. ~/.codex (3.4G: hooks/, skills view, config.toml, AGENTS.md, sessions, log), and any other agent homes in ~ (look for ~/.gemini, ~/.antigravity, ~/.pi, ~/.kimi, ~/.cursor, ~/.opencode, ~/.grok, ~/.agents, ~/.config/* agent dirs, ~/.local/share/* agent dirs, ~/.memsearch, ~/.cache sizes). The rule "hooks live in two directories, patch both" (~/.claude/hooks vs ~/.codex/hooks) is a known trap. Map: which files are symlinked vs copied between harnesses; where copies drifted ('diff -rq ~/.claude/hooks ~/.codex/hooks'); where skills are exposed to Codex (symlinks?); which harness dirs are dead (retired tools like Grok, model-router ~/.cli-proxy-api) and how big. Recommend where symlinks would end the two-copies trap.` },
  { key: 'memory-stores', prompt: `Area: memory and knowledge stores. ~/.claude/global-memory (repo claude-global-memory: USER.md, MEMORY.md, dev-docs/, transcripts/, other folders), ~/.claude/projects/*/memory (Tier A, ~31 folders), ~/.claude/claude-memory-compiler (daily/, knowledge/, hooks, 561M — what is the bulk?), ~/.memsearch, ~/.claude/scripts/recall.py + recall-bench, context-mode's store, ~/SecondBrain (folder names and counts only — do not read notes), KeystoneOS dashboards/snapshots (~/DEV/KeystoneOS/outputs). Questions: how many places can hold "a fact"? Which hold the same fact twice? Which Tier A folders belong to dead project slugs (e.g. Windows C--Users-... slugs, renamed folders) and are orphaned? Are dev-docs/ in global-memory the right home for KeystoneOS docs (vs the KeystoneOS repo)? Which store is the source of truth per kind of fact? Read the memory-write skill (~/.claude/skills/memory-write/SKILL.md) for the intended tier rules.` },
  { key: 'records-logs', prompt: `Area: agent records — audits, handoffs, status, logs, backups. Find every place these land: ~/.claude/audits, ~/.claude/global-memory/dev-docs/KeystoneOS/audits, ~/.claude/skills-audit*, ~/DEV/docs/handoffs (count, oldest/newest), ~/DEV/docs/STATUS.md (size, lines; Q3 archive exists), per-repo docs/STATUS.md + docs/handoffs patterns, logs (~/.claude/scripts/logs, ~/.claude/daemon.log, ~/.claude/skill_router.log, ~/.claude/global-memory/transcripts/.errors.log, ~/Library/Logs, KeystoneOS logs), backups (~/.claude/backups, settings.json.bak*, doctor-backup-*, skills-backup-*, claude-json-backup-*, settings-backup-*). For each kind of record (audit report, handoff, status entry, log, config backup): how many homes exist today, which are stale, which grow without rotation (size), and which one should be canonical. Check what skills/scripts write to each (grep closeout, session-handoff, doctor-plus, brain-audit, claude-stack-doctor, aios-audit skills and ~/.claude/scripts).` },
  { key: 'dev-agentic-repos', prompt: `Area: the ~/DEV side of the agent system. Identify every repo/folder in ~/DEV (depth 1-2, skip _DRIVE and health/private folders) that is about the agent system rather than sport work: e.g. KeystoneOS, TypeSafe_Sandbox, project-triage, _INBOX/tools, cli-printing-press sources, claude-skills (find where its git root is — maybe ~/.claude/skills), memory-compiler, skill/mod repos, dashboards. Read ~/DEV/PLATFORM.md and ~/DEV/CLAUDE.md and check every path PLATFORM.md names still exists (stale pointers are findings). Check ~/DEV/KeystoneOS (portfolio.json, data/, outputs/, scripts) for where it writes. Are agent-system repos grouped or scattered among sport repos? Is there a clear split between "agent config/home" (~/.claude) and "agent tooling source" (~/DEV/...)? Note repos with no area-index entry (the 10-22 audit said 11 repos are in no area index).` },
]

phase('Map')
const maps = (await parallel(AREAS.map(a => () =>
  agent(`You are mapping one area of Eric Rash's agentic-work file system on his Mac, so a later step can propose a cleaner layout.\n\n${a.prompt}\n${HARD_RULES}`,
    { label: `map:${a.key}`, phase: 'Map', schema: INVENTORY_SCHEMA })
))).filter(Boolean)
log(`${maps.length}/${AREAS.length} area maps returned; ${maps.reduce((n, m) => n + (m.problems || []).length, 0)} problems found`)

const DESIGN_SCHEMA = {
  type: 'object',
  properties: {
    principles: { type: 'array', items: { type: 'string' }, description: '3-6 one-line rules: one home per kind of agent file' },
    target_layout: { type: 'string', description: 'markdown table: kind of agent file -> its one home -> who writes it -> how it is kept tidy' },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          why: { type: 'string' },
          steps: { type: 'array', items: { type: 'string' }, description: 'exact shell commands or edits; removals are mv to ~/.Trash/<name>-2026-10-23, never rm' },
          paths_touched: { type: 'array', items: { type: 'string' } },
          gain: { type: 'string', description: 'space freed or friction removed, concrete' },
          risk: { type: 'string', enum: ['low', 'medium', 'high'] },
          reversible: { type: 'boolean' },
          when: { type: 'string', enum: ['now', 'after_season', 'needs_eric'] },
          effort_min: { type: 'number' },
        },
        required: ['id', 'title', 'why', 'steps', 'paths_touched', 'risk', 'reversible', 'when'],
      },
    },
    doc_updates: { type: 'array', items: { type: 'string' }, description: 'which existing docs to update (prefer STORAGE.md and FILE-ORGANIZATION-PLAN.md) and the exact rule text' },
    rejected_ideas: { type: 'array', items: { type: 'string' } },
  },
  required: ['principles', 'target_layout', 'recommendations', 'doc_updates'],
}

phase('Design')
const design = await agent(
  `Design a cleaner organization for Eric Rash's agentic-work files on his Mac, from these six read-only area maps:\n\n${JSON.stringify(maps, null, 1)}\n\n` +
  `Read ~/.claude/STORAGE.md and ~/DEV/docs/FILE-ORGANIZATION-PLAN.md first — build on them (they own Drive and DEV area grouping; Task 4 DEV area grouping is "after season"). Do not redesign Drive.\n` +
  `Goal: one home per kind of agent file (config, hooks, skills, plugins/caches, memory facts, audits, handoffs, status, logs, config backups, agent tooling source), so an agent or Eric can find anything and nothing piles up.\n` +
  `Climb the reuse ladder: prefer deleting clutter, symlinking a duplicate to its one home, and adding one rule line to an existing doc over new folders, new scripts or new systems. Eric is usage-sensitive and tired of process: no new habits, reminders or manual rituals for him.\n` +
  `Never move app-owned paths (Claude Code / Codex / desktop app put them there). Never move a path that a hook, script, launchd plist, skill or Codex config references unless the step also updates every reference (list them). Removals are 'mv <path> ~/.Trash/<name>-2026-10-23' (reversible), never rm. Secrets and health data never move to git, Drive or chat.\n` +
  `Mark when='now' only for low-risk, reversible steps that cannot break mid-season pipelines (GPS, Perch, VALD, PFF, backups, cloud-push, memory compiler, hooks). Larger moves are 'after_season'. Anything that is Eric's call (deleting his own working files, account settings, security settings) is 'needs_eric'.\n` +
  `Rank recommendations by gain/effort. Be concrete: exact paths and commands.`,
  { label: 'design', phase: 'Design', schema: DESIGN_SCHEMA })

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          verdict: { type: 'string', enum: ['keep', 'change', 'drop'] },
          reason: { type: 'string' },
          blocking_refs: { type: 'array', items: { type: 'string' }, description: 'file:line that still points at a path the step moves/removes' },
          corrected_steps: { type: 'array', items: { type: 'string' } },
          corrected_when: { type: 'string', enum: ['now', 'after_season', 'needs_eric', ''] },
        },
        required: ['id', 'verdict', 'reason'],
      },
    },
    missed: { type: 'array', items: { type: 'string' }, description: 'important problems or better options the design missed' },
  },
  required: ['verdicts'],
}

const LENSES = [
  { key: 'breakage', prompt: `BREAKAGE LENS. For every recommendation (focus hardest on when='now'), try to prove it would break something. For each path it moves, removes or symlinks, grep for references: ~/.claude/settings.json, ~/.claude/settings.local.json, ~/.claude/hooks, ~/.codex (hooks, config.toml, AGENTS.md), ~/.claude/scripts, ~/.claude/skills (SKILL.md and scripts), ~/Library/LaunchAgents/*.plist, ~/DEV/KeystoneOS, ~/.claude/claude-memory-compiler, the backup manifest (find backup-manifest.json), ~/.claude/.gitignore, and the routers (~/.claude/CLAUDE.md, AGENTS.md, STORAGE.md, TOOLPATHS.md, ~/DEV/*.md). Check that each command is correct on macOS zsh (BSD tools). Check any symlink proposal survives git (dotclaude tracks ~/.claude) and the app rewriting the file. Verdict 'drop' or 'change' if any live reference would break; list file:line in blocking_refs. Default to 'change' with a correction when unsure.` },
  { key: 'rules-value', prompt: `RULES AND VALUE LENS. Check each recommendation against Eric's established rules and decisions: ~/.claude/CLAUDE.md, ~/.claude/machine.md traps, ~/.claude/STORAGE.md, ~/DEV/CLAUDE.md (thin repo: ~/DEV .gitignore starts with /* — never remove; health data stays local), ~/DEV/docs/FILE-ORGANIZATION-PLAN.md decisions (2026-10-14), the hook-two-copies trap (~/.claude/projects/-Users-kristinarash-DEV/memory/project_hook-two-copies-trap.md), session-history-tracked decision (history files stay committed, option b), skill-bloat rules (~/.claude/projects/-Users-kristinarash-DEV/memory/project_skill-bloat-and-promotion.md — read before judging any skill-folder step), no-follow-up-on-eric (no new habits for Eric), and "do not break mid-season work". Also judge value: does the step remove real friction or space, or is it tidiness for its own sake? Is 'when' right? Is anything marked 'now' actually Eric's call? Verdict per recommendation.` },
]

phase('Verify')
const checks = (await parallel(LENSES.map(l => () =>
  agent(`Adversarially review this file-organization design for Eric Rash's agentic-work files on his Mac. You are read-only: change nothing.\n\n${l.prompt}\n\nDESIGN:\n${JSON.stringify(design, null, 1)}\n${HARD_RULES}`,
    { label: `verify:${l.key}`, phase: 'Verify', schema: VERDICT_SCHEMA })
))).filter(Boolean)

const byId = {}
for (const c of checks) for (const v of (c.verdicts || [])) (byId[v.id] = byId[v.id] || []).push(v)
const recs = (design?.recommendations || []).map(r => {
  const vs = byId[r.id] || []
  const dropped = vs.some(v => v.verdict === 'drop')
  const changed = vs.filter(v => v.verdict === 'change')
  return { ...r, verdicts: vs, status: dropped ? 'dropped' : changed.length ? 'changed' : (vs.length === LENSES.length ? 'kept' : 'unreviewed') }
})
log(`design: ${recs.length} recs; kept ${recs.filter(r => r.status === 'kept').length}, changed ${recs.filter(r => r.status === 'changed').length}, dropped ${recs.filter(r => r.status === 'dropped').length}, unreviewed ${recs.filter(r => r.status === 'unreviewed').length}`)

return {
  principles: design?.principles,
  target_layout: design?.target_layout,
  doc_updates: design?.doc_updates,
  rejected_ideas: design?.rejected_ideas,
  recommendations: recs,
  missed: checks.flatMap(c => c.missed || []),
  map_summaries: maps.map(m => ({ area: m.area, summary: m.summary, not_checked: m.not_checked })),
}
