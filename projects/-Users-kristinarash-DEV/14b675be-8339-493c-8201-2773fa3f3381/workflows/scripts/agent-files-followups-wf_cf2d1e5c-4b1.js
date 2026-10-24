export const meta = {
  name: 'agent-files-followups',
  description: 'Implement R22-R25 follow-ups in 4 disjoint areas, each then checked by a breakage reviewer',
  phases: [
    { title: 'Implement', detail: '4 agents, disjoint file ownership' },
    { title: 'Verify', detail: 'one breakage reviewer per area' },
  ],
}

const COMMON = `
You are working on Eric Rash's Mac agent setup (macOS, zsh, BSD tools). Eric approved these changes; the mid-season freeze is lifted. Work carefully: read every file you change first, test after, and report exactly what you did.
HARD RULES:
- Never read or walk ~/Library/CloudStorage or ~/DEV/_DRIVE (Google Drive FUSE mount hangs). Never open DexaProject, Linda_Projects, SpecialRequests, Wilhelm_Brody_RTP, Zinnecker_Skylar, TOS_*. Never print secret values.
- Never 'rm' Eric's files. Interactive removals are 'mv <path> ~/.Trash/<name>-2026-10-24'. Code that runs unattended (launchd) must not write ~/.Trash; it may delete regenerable files in place.
- Never run 'memsearch index'. 'timeout' is not installed. Never edit ~/.claude/settings.json or settings.local.json.
- Do NOT 'git commit' in ~/.claude (dotclaude) — leave dotclaude changes uncommitted and list their paths; the main session commits them. Other repos named as yours below: commit with 'git -C <repo>' and explicit paths, push with 'git -C <repo> push -q', and end commit messages with the line: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- Touch ONLY the files and folders your area owns. Another agent works on each other area at the same time.
- If a step is blocked (permission denied, auto-mode refusal) or would need a decision you cannot make safely, skip it and say why.`

const IMPL_SCHEMA = { type: 'object', properties: {
  area: { type: 'string' },
  changes: { type: 'array', items: { type: 'object', properties: { path: { type: 'string' }, what: { type: 'string' } }, required: ['path', 'what'] } },
  commits: { type: 'array', items: { type: 'string' }, description: 'repo: sha subject' },
  uncommitted_dotclaude_paths: { type: 'array', items: { type: 'string' } },
  tests: { type: 'array', items: { type: 'string' }, description: 'command -> result' },
  skipped: { type: 'array', items: { type: 'string' } },
  follow_ups_for_main: { type: 'array', items: { type: 'string' }, description: 'things the main session must do (e.g. a backup-manifest entry)' },
}, required: ['area', 'changes', 'tests', 'skipped'] }

const AREAS = [
  { key: 'A-everythingd', prompt: `AREA A — stop everythingd crawling Drive. You own ~/DEV/MacEverything (repo erash11/MacEverything; commit there) and the running daemon.
Problem: ~/Library/Logs/everythingd.log (about 5.5 MB) fills with 'giving up … FileProvider/…/wharf/propagate … Resource deadlock avoided' lines: the daemon indexes ~/Library/Application Support/FileProvider and the Drive mount.
Do: read ~/DEV/MacEverything/docs/STATUS.md and CLAUDE.md/AGENTS.md first. Find where index roots/excludes are set. Exclude ~/Library/Application Support/FileProvider, ~/Library/CloudStorage and ~/Library/Mobile Documents (iCloud) from indexing. Add or update a test if the repo has tests for excludes. Rebuild and reinstall the daemon the way the repo's docs say (the binary runs from ~/.local/bin/everythingd; find its launchd label with 'launchctl list | grep -i everything'). Restart it with 'launchctl kickstart -k gui/$(id -u)/<label>'. Verify: note the line count of everythingd.log, wait by doing other checks for a few minutes (do NOT use sleep in the foreground; use a background command or re-check later in your run), and confirm no new 'giving up' lines appear after the restart. Truncating the old log is NOT allowed (it is history); leave it. Update the repo's docs/STATUS.md and commit.` },
  { key: 'B-daily-backup', prompt: `AREA B — the daily backup script. You own ~/.claude/scripts/daily-backup.ps1, ~/.claude/scripts/backup-manifest.json and any test files for them in ~/.claude/scripts/ (all dotclaude: do NOT commit). Also ~/.claude/HARNESS_FIXES.md items #3, #4, #7 (move each to Done when fixed).
Read first: ~/.claude/scripts/daily-backup.ps1 in full, ~/.claude/HARNESS_FIXES.md, ~/.claude/audits/2026-10-03-daily-backup-index-logging.patch, ~/.claude/STORAGE.md backup sections. Find the offline test used on 2026-10-23 ('backup changes passed an offline test'; look for test_*.ps1/py or a -DryRun / fake-gws mode in ~/.claude/scripts) and use it.
Do, each as a small change:
1. Log trims (R22): the script already trims one log over 2 MB to its last 2000 lines (around line 809). Reuse that same logic for a list: ~/.claude/scripts/logs/daily-backup.log, ~/.claude/scripts/logs/daily-backup.out, ~/.claude/permission-gate/shadow.jsonl, ~/Library/Logs/everythingd.log, ~/.claude/claude-memory-compiler/scripts/{flush,compile,adjudicate}.log, ~/DEV/KeystoneOS/outputs/morning/cadence.log, ~/.claude/skill-router/skill_router.log and ~/.claude/skill_router.log. Only files that exist. Also delete files older than 60 days in ~/DEV/KeystoneOS/outputs/inventory and ~/DEV/KeystoneOS/outputs/jobs (in place; regenerable).
2. HARNESS #3: port the intent of the memsearch index logging patch to the current code (log path and file counts, 'no new content' on 0, errors on no input or unexpected output). #4: after an 'INDEX path set' log line, record an error if the run ends without 'INDEX full set' (or add the check where the index step finishes).
3. R23: replace the Snapshot lines for .codex/memories (does not exist) and the empty .codex/agents with one snapshot of ~/.codex/{config.toml,hooks.json,rules,memories_1.sqlite,state_5.sqlite,history.jsonl,session_index.jsonl} (only those that exist; never auth.json). In the manifest's .codex SSD capture, exclude packages, plugins, .tmp, cache, computer-use, visualizations if the manifest supports excludes.
4. uv cache: add a step that runs '~/.local/bin/uv cache prune' with UV_LOCK_TIMEOUT=10 (environment variable), logging 'uv-prune: ok <before>-><after>' or 'uv-prune: skipped (locked)' — a lock skip is NOT an error. Run it at most once per day (use a stamp file under ~/.claude/scripts/logs/).
Test: pwsh syntax parse of the script (e.g. pwsh -NoProfile -Command "[System.Management.Automation.Language.Parser]::ParseFile('<path>',[ref]$null,[ref]$e); $e.Count"), the offline/fake-gws test, and 'python3 -m json.tool' on the manifest. Do NOT run a real backup. Report every change and test result.` },
  { key: 'C-lifeos', prompt: `AREA C — retire LIFEOS. You own ~/.claude/skills (repo claude-skills; commit there), ~/.claude/LIFEOS, ~/.config/LIFEOS, ~/.agents/skills/{LifeOS,Upgrade,advisor,CLAUDE.md}, ~/.claude/hooks/{lib,handlers} and ~/.codex/hooks/{lib,handlers} (dotclaude: do not commit), ~/.codex/hooks as a whole, ~/.gemini/skills, and ~/.zshrc (only the bun and lifeos lines).
Context: ~/.claude/LIFEOS (v6.0.5, dormant since Jul 8) is still pointed at by owned skills ArXiv, Science, ISA (SKILL.md 'LIFEOS CUSTOMIZATIONS' pointer and execution.jsonl logging) and by skills/_shared (Inference.ts writes LIFEOS/MEMORY) and skills/docs. LIFEOS/TOOLS/*.ts import ~/.claude/hooks/lib. ~/.zshrc line ~17 has a 'lifeos' alias running lifeos.ts; lines ~10 and ~13 source bun (check whether anything else uses bun: context-mode re-execs under Bun only on Linux).
Do, in order:
1. grep -rln 'LIFEOS\\|LifeOS' ~/.claude/skills; edit each owned skill to drop the LIFEOS pointer and the execution.jsonl logging, keeping the skill working (follow ~/.claude/skills/mattpocock-skills writing-for-agents style if present: short, plain). Commit claude-skills.
2. mv ~/.claude/LIFEOS ~/_PARKED_COPIES/LIFEOS-v6.0.5 and ~/.config/LIFEOS ~/_PARKED_COPIES/config-LIFEOS (append one line each to ~/_PARKED_COPIES/README.md). Move ~/.agents/skills/{LifeOS,Upgrade,advisor} and ~/.agents/skills/CLAUDE.md to the Trash (check they are not symlinks into ~/.claude/skills first).
3. In dotclaude: git -C ~/.claude rm -r -q --cached hooks/lib hooks/handlers; move ~/.claude/hooks/{lib,handlers} and ~/.codex/hooks/{lib,handlers} to the Trash. Then make ~/.codex/hooks a symlink to ~/.claude/hooks: first confirm every regular file left in ~/.codex/hooks is byte-identical to its ~/.claude/hooks twin or is already a link (diff -rq), then mv ~/.codex/hooks ~/.Trash/codex-hooks-dir-2026-10-24 && ln -s ~/.claude/hooks ~/.codex/hooks. NEVER edit ~/.codex/hooks.json or ~/.codex/config.toml. Verify every command path in ~/.codex/hooks.json still resolves (test -e).
4. ~/.zshrc: remove the lifeos alias, and the bun lines only if nothing else needs bun (grep ~/.claude, ~/DEV/*/package.json scripts, launchd plists). Back up first: cp -p ~/.zshrc ~/.zshrc.bak-2026-10-24-lifeos. zsh -n ~/.zshrc must pass. Never print secret values from ~/.zshrc (it has Keychain lookups).
5. ~/.gemini/skills holds about 21 drifted copies of owned skills. Read ~/.claude/skills/sync-to-codex.sh; add ~/.gemini/skills as a third VIEW for owned skills only (links, like the other two), after moving the drifted copies of OWNED skills to the Trash (leave anything that is not an owned skill). Run the script; confirm 0 dangling links in all views. Commit claude-skills.
Report every change and test.` },
  { key: 'D-tooling', prompt: `AREA D — tool and repo hygiene. You own ~/DEV/CLI_Dev, ~/DEV/graphify-out, ~/DEV/KeystoneOS, ~/DEV/project-triage/portfolio.json (commit each repo; registry changes get their own 'data:' commit), ~/.claude/permission-gate (not tracked), and ~/DEV/TypeSafe_Sandbox/permission_gate (read-only source).
Do:
1. permission-gate: the installed copies in ~/.claude/permission-gate (rules.py, sanitize.py, shadow_hook.py) differ from ~/DEV/TypeSafe_Sandbox/permission_gate only by CRLF line endings. Reinstall LF copies from the source (copy, not symlink: STORAGE.md says install targets are reinstalled from source). If the source has an installer, use it. Keep shadow.jsonl. Verify with a syntax check (python3 -m py_compile) and that the hook still runs: find how settings.json invokes it (read-only) and run that command with a harmless JSON on stdin; confirm a new shadow.jsonl line if it logs.
2. CLI_Dev: add printing-press/.runstate/, printing-press/.locks/ and printing-press/.publish-repo-*/ to its .gitignore and 'git rm -r --cached' them if tracked. Commit. Do not change the backup manifest (report it as a follow-up instead).
3. graphify-out (~/DEV/graphify-out is a git repo; the nightly com.keystone.graphextract job runs scripts/daily_extract.sh from it): git rm the superseded baselines graph.superseded-vendor-noise.json and graph.presanitize-baseline.json if nothing reads them (grep the scripts); gitignore daily_extract.log only after confirming the job does not commit it on purpose. Commit. Report a backup-manifest entry for it as a follow-up.
4. KeystoneOS data/jobs.json knows only 3 of the 15 loaded com.keystone launchd jobs. Read KeystoneOS AGENTS.md, decisions/log.md and the reconcile script (it does make-up runs from jobs.json). Add rows for the missing jobs with make-up runs DISABLED for each new row (whatever field the reconcile code uses), then run the reconcile in its dry-run/report mode to prove it would not start anything. If there is no safe dry-run, do not change jobs.json; report instead. Also: data/projects.json has dead paths (and one Drive path); repoint or prune per the decisions log. Commit KeystoneOS.
5. Write nothing into ~/DEV/docs or the DEV thin repo (the main session owns them).
Report every change and test.` },
]

const VERIFY_SCHEMA = { type: 'object', properties: {
  verdict: { type: 'string', enum: ['ok', 'problems'] },
  problems: { type: 'array', items: { type: 'object', properties: { path: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' } }, required: ['path', 'problem', 'fix'] } },
  tests: { type: 'array', items: { type: 'string' } },
}, required: ['verdict', 'problems'] }

const results = await pipeline(
  AREAS,
  (a) => agent(`${a.prompt}\n${COMMON}`, { label: `impl:${a.key}`, phase: 'Implement', schema: IMPL_SCHEMA }),
  (impl, a) => impl ? agent(
    `You are a read-only breakage reviewer for one area of changes just made on Eric Rash's Mac. Do NOT edit anything (you may run tests, syntax checks, dry runs and 'git diff'/'git show').
Area brief given to the implementer:\n${a.prompt}\n
Implementer's report:\n${JSON.stringify(impl, null, 1)}\n
Check: (1) every claimed change is really on disk / in the named commit; (2) nothing still references a moved or removed path (grep ~/.claude/settings.json, ~/.claude/hooks, ~/.codex/hooks.json, ~/.claude/scripts, ~/.claude/skills, ~/Library/LaunchAgents/*.plist, ~/DEV/KeystoneOS, ~/.zshrc); (3) the tests the implementer ran pass when you run them again, plus any obvious missing test (syntax parse, py_compile, json.tool, zsh -n); (4) nothing violates the hard rules (no Trash writes from unattended code, no edits to settings.json/hooks.json/config.toml, no secrets printed, no health-data folders touched, no commit in ~/.claude). Return problems with exact fixes, or verdict ok.
${COMMON}`, { label: `verify:${a.key}`, phase: 'Verify', schema: VERIFY_SCHEMA }).then(v => ({ area: a.key, impl, verify: v })) : null,
)
return results.filter(Boolean)
