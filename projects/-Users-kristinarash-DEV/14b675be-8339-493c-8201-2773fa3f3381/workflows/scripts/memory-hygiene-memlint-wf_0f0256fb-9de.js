export const meta = {
  name: 'memory-hygiene-memlint',
  description: 'Fix 41 stale/contradictory/redundant Tier A memory findings from memlint 2026-10-24 in 5 disjoint file groups, then one accuracy check',
  phases: [
    { title: 'Fix', detail: '5 agents, disjoint memory files' },
    { title: 'Check', detail: 'one accuracy + structure reviewer over all edits' },
  ],
}

const GROUPS = args.groups.map(files => ({ files }))
const SLUGS = 'Path prefixes: "DEV/x.md" = ~/.claude/projects/-Users-kristinarash-DEV/memory/x.md; "~/x.md" = ~/.claude/projects/-Users-kristinarash/memory/x.md; "global-memory/MEMORY.md" = ~/.claude/global-memory/MEMORY.md (Tier B, hard cap 2,500 chars).'

const RULES = `
You are fixing Eric Rash's Claude memory files on his Mac. A memory linter (memlint, 2026-10-24) flagged the findings below as STALE, CONTRADICTION or REDUNDANT. Your job: make each named memory true today, with the smallest edit.
${SLUGS}
Rules:
- First read ~/.claude/skills/memory-write/SKILL.md (name rule, Verification Gate). Read every file in your group in full before editing.
- Verify current truth on disk before you change a fact: ~/.claude/STORAGE.md, ~/DEV/docs/STATUS.md (top entries are newest), ~/.claude/docs/STATUS.md, the newer memory named in the finding, launchctl list, ls, grep. The linter can be wrong: if a finding is false or already fixed, leave the file and say so.
- Known current facts (2026-10-24): Cloudroom dropped entirely 2026-10-24 (app, LaunchAgent, room-cli skill removed); the Windows laptop has had no automation or terminal work since 2026-10-14 and is desktop-app only since 2026-10-21; Windows Docker/Milvus is gone; com.keystone.rituals is disabled (since 2026-09-24); morning-briefing is archived in ~/DEV/_ARCHIVE; 15 com.keystone launchd jobs are loaded; the daily backup runs hourly 12:00-17:00 on AC power through daily-backup-login.sh; ~/.codex/hooks is a symlink to ~/.claude/hooks; dcg allowlisted redirect-truncate-root-home, mv-sensitive-source-root-home and heredoc.posix:pipeline-consumer on 2026-10-11 (see DEV/project_dcg-guard-blocks.md); Drive items move with the gws CLI (the Drive MCP update_file was blocked); nothing goes to Baylor OneDrive except Kenny's ITS tracker in the Teams team; session transcripts are committed by Eric's choice (option b); DexaProject is identifiable health data that never leaves the Mac or its one Drive folder.
- Prefer fixing the STALE file. Mark superseded history in place ("Superseded 2026-10-24: ...") rather than silently deleting a lesson that may still teach something. For a REDUNDANT pair, keep the full text in the stronger file and cut the other's duplicate passage to one line plus a [[link]] to the stronger file's name. NEVER delete or move a memory file, and never rename one.
- Keep frontmatter valid (name, description, metadata.type). If a description becomes wrong, fix it, and fix that file's one-line pointer in its folder's MEMORY.md index the same way (exact filename link must still resolve). Keep [[links]] to bare names that exist.
- Global MEMORY.md: edit only if a finding requires it; check 'wc -c' stays under 2,500.
- Never print secret values. Never open DexaProject, Linda_Projects, SpecialRequests or health data.
- Do NOT git commit anywhere (the main session commits). Touch ONLY the files in your group (and their MEMORY.md index line). Another agent works on each other group at the same time.
- Plain English, short sentences; match each file's existing style.`

const FIX_SCHEMA = { type: 'object', properties: {
  results: { type: 'array', items: { type: 'object', properties: {
    finding: { type: 'string', description: 'first 80 chars of the finding' },
    action: { type: 'string', enum: ['fixed', 'already-true', 'linter-wrong', 'skipped'] },
    files_changed: { type: 'array', items: { type: 'string' } },
    what: { type: 'string', description: 'what changed and the evidence used' },
  }, required: ['finding', 'action', 'what'] } },
  index_lines_changed: { type: 'array', items: { type: 'string' } },
}, required: ['results'] }

phase('Fix')
const fixes = (await parallel(GROUPS.map((g, i) => () => agent(
  `${RULES}\n\nYOUR GROUP ${i + 1} — files you own: ${JSON.stringify(g.files)}\n\nFindings: read ~/.claude/claude-memory-compiler/reports/memlint-2026-10-24.md and take every line marked "(cross-file)" (CONTRADICTION, STALE or REDUNDANT) that names at least one of your files in square brackets. Skip the one about global-memory/MEMORY.md vs DEV/project_hook-two-copies-trap.md (already fixed). Every such finding names only files from your group.`,
  { label: `fix:group${i + 1}`, phase: 'Fix', schema: FIX_SCHEMA }
).then(r => r ? { group: i + 1, files: g.files, ...r } : null)))).filter(Boolean)
log(`${fixes.length}/${GROUPS.length} groups returned; ${fixes.reduce((n, f) => n + f.results.filter(r => r.action === 'fixed').length, 0)} findings fixed`)

phase('Check')
const check = await agent(
  `You are a read-only reviewer of edits just made to Eric Rash's Claude memory files (do NOT edit anything). ${SLUGS}
Reports from the 5 fixing agents:\n${JSON.stringify(fixes, null, 1)}\n
For every changed file: (1) diff it against git: 'git -C ~/.claude diff -- projects/<slug>/memory/<file>' (Tier A lives in the dotclaude repo) and 'git -C ~/.claude/global-memory diff -- MEMORY.md'; (2) check each changed fact against the live Mac (STATUS files, STORAGE.md, launchctl, ls, the newer memory) and flag anything now WRONG, any lesson silently lost, or any secret or health detail added; (3) frontmatter valid and name = bare kebab stem (memory-write SKILL.md rule); (4) every MEMORY.md index line still resolves; global MEMORY.md under 2,500 chars; (5) run 'cd ~/.claude/claude-memory-compiler && ~/.local/bin/uv run python scripts/memlint.py --structural-only' and report its error/warning counts (do not run the LLM mode). Return problems with exact fixes, or verdict ok.`,
  { label: 'check:all', phase: 'Check', schema: { type: 'object', properties: {
    verdict: { type: 'string', enum: ['ok', 'problems'] },
    problems: { type: 'array', items: { type: 'object', properties: { file: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' } }, required: ['file', 'problem', 'fix'] } },
    memlint_structural: { type: 'string' },
  }, required: ['verdict', 'problems'] } })

return { fixes, check }
