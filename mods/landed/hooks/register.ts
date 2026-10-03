import type { EngineInterface, Register } from 'claude-code'

// Front end for ~/DEV/project-triage/landed.py: a ledger of files created or changed (git in
// every DEV repo, file times on Drive and the vault), mapped to registry projects. The scan is
// slow (Drive walk, ~1 min) so it runs in the background at session start; /landed reads the
// ledger, which is instant. Same config lookup as slate-status: portfolio_json in
// ~/.claude/skills/_shared/config.<platform>.json, python on Windows, python3 on the Mac.

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
    if (!(await $.fs.exists(`${dir}/landed.py`))) continue
    return { script: `${dir}/landed.py`, dir, python: c.python }
  }
  return 'no project-triage/landed.py found through skills/_shared/config.*.json'
}

/** "/landed", "/landed 7", "/landed refresh", "/landed HPI" -> what to run. */
export function parse(args: string): { days: number; refresh: boolean; project?: string } {
  let days = 1
  let refresh = false
  const words: string[] = []
  for (const w of args.trim().split(/\s+/).filter(Boolean)) {
    if (w === 'refresh') refresh = true
    else if (w === 'today') days = 1
    else if (w === 'week') days = 7
    else if (/^\d+(\.\d+)?$/.test(w)) days = Number(w)
    else words.push(w)
  }
  return { days, refresh, project: words.length ? words.join(' ') : undefined }
}

async function run($: EngineInterface, argv: string[], timeoutMs: number): Promise<string> {
  const where = await locate($)
  if (typeof where === 'string') return `landed: ${where}`
  const { exitCode, stdout, stderr } = await $.process.run([where.python, where.script, ...argv], { cwd: where.dir, timeoutMs })
  return exitCode === 0 ? stdout.trim() : `landed: ${argv[0]} failed: ${(stderr || `exit ${exitCode}`).trim().slice(0, 300)}`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'landed', description: 'Where files landed, by project: /landed [today|week|N] [refresh] [project]' })
    void run($, ['scan', '--days', '2'], 600_000)
    return next(e)
  })

  on('command.run', { command: 'landed' }, async ($, e) => {
    const a = parse(e.args)
    const scanned = a.refresh ? (await run($, ['scan', '--days', String(Math.max(2, a.days))], 600_000)) + '\n\n' : ''
    const argv = ['show', '--days', String(a.days), ...(a.project ? ['--project', a.project] : [])]
    return { text: scanned + '```\n' + (await run($, argv, 60_000)) + '\n```' }
  })
}
