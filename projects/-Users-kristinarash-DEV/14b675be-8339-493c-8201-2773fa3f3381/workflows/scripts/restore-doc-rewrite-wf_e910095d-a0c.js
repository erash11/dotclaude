export const meta = {
  name: 'restore-doc-rewrite',
  description: 'Draft a Mac-true ~/.claude/RESTORE.md into the scratchpad, then fact-check every path and command (read-only)',
  phases: [
    { title: 'Draft', detail: 'one writer, scratchpad only' },
    { title: 'Check', detail: 'verify each path/command on disk' },
  ],
}

const OUT = '/private/tmp/claude-501/-Users-kristinarash-DEV/14b675be-8339-493c-8201-2773fa3f3381/scratchpad/RESTORE.draft.md'
const RULES = `
HARD RULES: Do not edit, move or delete anything outside ${OUT}. Never read or walk ~/Library/CloudStorage or ~/DEV/_DRIVE (Drive FUSE hangs). Never open DexaProject, Linda_Projects, SpecialRequests. Never print secret values: Keychain item NAMES only (e.g. from ~/.zshrc 'security find-generic-password -s NAME' lines), never values. No network. 'timeout' is not installed.`

phase('Draft')
const draft = await agent(
`Write a new Mac-true recovery guide for Eric Rash's agent setup and save it to ${OUT} (create the file with your Write tool). It will replace ~/.claude/RESTORE.md, which today gives Windows steps (robocopy from G:\\, Task Scheduler, Milvus, bare pip install) and is uploaded to Drive nightly by ~/.claude/scripts/daily-backup.ps1 (lines ~792-798), so it is the copy Eric would read on a phone during a real restore.

Read first: ~/.claude/RESTORE.md (keep what is still true), ~/.claude/START-HERE.md Part 2 (the exFAT-drive Mac restore runbook that was actually executed once — fold in its checkpoints that still apply), ~/.claude/MIGRATION-MACOS.md, ~/.claude/RECOVERY-INVENTORY.md, ~/.claude/STORAGE.md (the 'Machine-written copies (backups)' and 'Agent files' sections are current truth), ~/.claude/scripts/backup-manifest.json (destinations), ~/.claude/scripts/daily-backup.ps1 (which tgz files it uploads to Drive _MACHINE/Backups/Machine: grep for '.tgz'), ~/.claude/machine.md and ~/.claude/TOOLPATHS.md.

Required content, under 120 lines, plain imperative steps, Mac only:
1. What lives where: one short table, then point at ~/.claude/STORAGE.md.
2. Accounts needed first (GitHub erash11, Google, claude.ai) — no secrets.
3. Clone the config repos to their exact paths: dotclaude -> ~/.claude, claude-skills -> ~/.claude/skills, claude-global-memory -> ~/.claude/global-memory, claude-memory-compiler -> ~/.claude/claude-memory-compiler, the DEV thin repo -> ~/DEV (its .gitignore starts with /* — never remove), then project repos via 'gh repo list erash11'. Verify each remote URL from the live clones (git -C <path> remote get-url origin).
4. Pull machine backups: FIRST route is the drive.google.com web UI -> _MACHINE/Backups/Machine (gws is not authorized on a fresh Mac); gws only after 'gws auth login'. List the real tgz names daily-backup uploads and what each restores to.
5. CRASHBOX SSD captures (what is there, from the manifest 'ssd' destination).
6. Secrets: from the macOS Keychain; list item NAMES only.
7. Tooling: Homebrew, uv at ~/.local/bin/uv (not Homebrew), never global pip (PEP 668), 'uv sync' for the memory compiler, the LaunchAgents restore (launchagents.tgz -> ~/Library/LaunchAgents, then launchctl bootstrap gui/$(id -u) per plist), Full Disk Access for Terminal (cloud-push needs it).
8. The START-HERE corrections that still apply on the Mac.
9. 'Deliberately NOT backed up' (keep the current list if still true) and 'Keeping this document honest' (one short rule).
Delete both pointers to MIGRATION-MACOS.md. Use ASD-STE100-style plain English: short sentences, one instruction each. Return a list of every path and command you put in the doc, and anything you could not verify.
${RULES}`,
  { label: 'draft', phase: 'Draft', schema: { type: 'object', properties: {
      written: { type: 'boolean' }, lines: { type: 'number' },
      claims: { type: 'array', items: { type: 'string' }, description: 'every path, repo URL, tgz name, plist, keychain name and command in the doc' },
      unverified: { type: 'array', items: { type: 'string' } } }, required: ['written', 'claims'] } })

phase('Check')
const check = await agent(
`Fact-check the draft recovery guide at ${OUT} for Eric Rash's Mac. Read it in full. For every path, repo URL, tgz name, plist label, Keychain item name and command in it, verify against the live Mac: the path exists (or is correctly described as created by the step), the remote URL matches 'git -C <path> remote get-url origin', each tgz name is one daily-backup.ps1 really uploads (grep ~/.claude/scripts/daily-backup.ps1), each plist exists in ~/Library/LaunchAgents, each Keychain name appears in ~/.zshrc or ~/.zshenv (do not read values), each command is valid on macOS zsh with BSD tools. Also check that nothing in it is Windows-only, that it is under 120 lines, that it never tells the reader to remove '/*' from ~/DEV/.gitignore or run 'memsearch index' by hand, and that it does not contain a secret value.
The drafter's own claim list: ${JSON.stringify(draft?.claims || [])}
Return each wrong or doubtful line with the exact correction text. Do NOT edit the file.
${RULES}`,
  { label: 'fact-check', phase: 'Check', schema: { type: 'object', properties: {
      problems: { type: 'array', items: { type: 'object', properties: {
        line_text: { type: 'string' }, problem: { type: 'string' }, correction: { type: 'string' } }, required: ['line_text', 'problem', 'correction'] } },
      verified_count: { type: 'number' }, verdict: { type: 'string', enum: ['ready', 'ready_after_fixes', 'not_ready'] } },
    required: ['problems', 'verdict'] } })

return { draft, check }
