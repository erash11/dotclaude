import type { EngineInterface, Register } from 'claude-code'

// Front end for ~/DEV/project-triage/board.py, the live project board (PM system design,
// docs/project-management-system-design.md, "Starting the board"). `board.py --background`
// reuses the board already running on this machine (pid/port file in the temp dir) or starts
// one as a child of this session and returns once it answers, so it stops when Claude Code
// does. The shell's `pm` runs the same command. Same config lookup as slate-status/landed.

const CONFIGS = [
  { file: 'config.windows.json', python: 'python' },
  { file: 'config.macos.json', python: 'python3' },
]

export async function locate($: EngineInterface): Promise<{ script: string; dir: string; python: string } | string> {
  const home = (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME'))
  if (!home) return 'no home directory'
  for (const c of CONFIGS) {
    let cfg: { portfolio_json?: string }
    try {
      cfg = JSON.parse(await $.fs.read(`${home}/.claude/skills/_shared/${c.file}`))
    } catch {
      continue
    }
    const registry = cfg.portfolio_json?.replace(/\\/g, '/')
    if (!registry) continue
    const dir = registry.slice(0, registry.lastIndexOf('/'))
    if (!(await $.fs.exists(`${dir}/board.py`))) continue
    return { script: `${dir}/board.py`, dir, python: c.python }
  }
  return 'no project-triage/board.py found through skills/_shared/config.*.json'
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'pm', description: 'Open the project board (starts it if it is not running)' })
    return next(e)
  })

  on('command.run', { command: 'pm' }, async $ => {
    const where = await locate($)
    if (typeof where === 'string') return { text: `pm: ${where}` }
    const { exitCode, stdout, stderr } = await $.process.run(
      [where.python, where.script, '--background'], { cwd: where.dir, timeoutMs: 30_000 })
    return { text: exitCode === 0 ? stdout.trim() : `pm: board did not start: ${(stderr || `exit ${exitCode}`).trim().slice(0, 300)}` }
  })
}
