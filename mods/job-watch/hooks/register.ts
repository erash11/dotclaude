import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { DockerState, Job, JobReport } from '../types'

// Job watch: answers "did the overnight job run?" without asking. A status
// line entry for scheduled jobs (Windows Task Scheduler \Eric\, Mac launchd
// com.keystone.*), the global errors.log, the scheduled recall eval and the
// Docker-hosted Milvus that memsearch needs, plus a toast when a job's last
// run changes mid-session, Milvus goes down, or a background task Claude
// started reports back. Local reads only; no model calls.

const report = atom({ plugin: 'job-watch', key: 'report' } as const, null)

const PERIOD_MS = 10 * 60_000
const SAW_MILVUS = 'sawMilvus' // $.store: this machine has had a milvus container

// Task Scheduler result codes that are not failures.
const NOT_YET_RUN = 267011 // 0x41303
const RUNNING = 267009 // 0x41301

const WIN_SCRIPT = `
$ErrorActionPreference = 'SilentlyContinue'
$rows = Get-ScheduledTask -TaskPath '\\Eric\\' | ForEach-Object {
  $i = $_ | Get-ScheduledTaskInfo
  [pscustomobject]@{
    name = $_.TaskName
    lastRun = if ($i.LastRunTime -and $i.LastRunTime.Year -gt 2000) { $i.LastRunTime.ToString('o') } else { $null }
    result = $i.LastTaskResult
    nextRun = if ($i.NextRunTime) { $i.NextRunTime.ToString('o') } else { $null }
  }
}
ConvertTo-Json -InputObject @($rows) -Compress
`

export function isFailure(job: Job): boolean {
  return job.result !== null && job.result !== 0 && job.result !== NOT_YET_RUN && job.result !== RUNNING
}

export function parseWindows(stdout: string): Job[] {
  try {
    const raw: unknown = JSON.parse(stdout.trim() || '[]')
    const list = Array.isArray(raw) ? raw : [raw]
    return list
      .filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null && typeof r.name === 'string')
      .map(r => ({
        name: String(r.name),
        lastRun: typeof r.lastRun === 'string' ? r.lastRun : null,
        result: typeof r.result === 'number' ? r.result : null,
        nextRun: typeof r.nextRun === 'string' ? r.nextRun : null,
      }))
  } catch {
    return []
  }
}

// `launchctl list`: PID, last exit status, label.
export function parseLaunchctl(stdout: string): Job[] {
  return stdout
    .split('\n')
    .map(l => l.trim().split(/\s+/))
    .filter(cols => cols.length >= 3 && (cols[2] ?? '').startsWith('com.keystone.'))
    .map(cols => ({
      name: (cols[2] ?? '').replace(/^com\.keystone\./, ''),
      lastRun: null,
      result: cols[0] !== '-' ? RUNNING : Number(cols[1] ?? 0),
      nextRun: null,
    }))
}

// `docker ps -a --filter name=milvus` as `name|status` lines. No milvus
// container means this machine does not run memsearch on Docker: null.
export function parseDocker(exitCode: number | null, stdout: string): DockerState {
  if (exitCode === null) return null // docker not installed
  if (exitCode !== 0) return 'docker-down'
  const rows = stdout.split('\n').map(l => l.trim()).filter(Boolean)
  if (!rows.length) return null
  const standalone = rows.find(r => r.startsWith('milvus-standalone|')) ?? rows[0] ?? ''
  return /\|Up\b/.test(standalone) ? 'up' : 'milvus-down'
}

const DOCKER_TEXT: Record<Exclude<DockerState, null>, string> = {
  up: 'milvus ✓',
  'docker-down': 'docker ✗',
  'milvus-down': 'milvus ✗',
}

function when(iso: string | null): string {
  if (!iso) return 'never'
  const d = new Date(iso)
  const now = new Date()
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return d.toDateString() === now.toDateString() ? hm : `${d.getMonth() + 1}/${d.getDate()} ${hm}`
}

const hex = (n: number) => `0x${(n >>> 0).toString(16)}`

// Last "RECALL recall-check: <WORD>" in daily-backup.log (OK, DROP, ...). The Windows
// weekly eval and its LATEST.md retired 2026-10-23; the backup's check.py replaced them.
export function recallStatus(log: string): string | null {
  return [...log.matchAll(/RECALL recall-check:\s*(\w+)/g)].pop()?.[1] ?? null
}

export function statusText(r: JobReport): string {
  const failed = r.jobs.filter(isFailure)
  const running = r.jobs.filter(j => j.result === RUNNING)
  const parts: string[] = []
  if (failed.length) {
    parts.push(`jobs ✗ ${failed.map(j => `${j.name} (${hex(j.result ?? 0)})`).join(', ')}`)
  } else {
    const latest = [...r.jobs].filter(j => j.lastRun).sort((a, b) => (b.lastRun ?? '').localeCompare(a.lastRun ?? ''))[0]
    parts.push(`jobs ✓ ${r.jobs.length}${latest ? ` (last ${latest.name} ${when(latest.lastRun)})` : ''}`)
  }
  if (running.length) parts.push(`running: ${running.map(j => j.name).join(', ')}`)
  parts.push(r.errorLines ? `errors.log ${r.errorLines} ⚠` : 'errors.log 0')
  if (r.evalStatus) parts.push(`eval ${r.evalStatus}`)
  if (r.docker) parts.push(DOCKER_TEXT[r.docker])
  return parts.join(' · ')
}

async function homeDir($: EngineInterface): Promise<string> {
  return ((await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')) ?? '').replace(/\\/g, '/')
}

async function collect($: EngineInterface): Promise<JobReport> {
  const home = await homeDir($)
  const isWindows = (await $.env.get('OS')) === 'Windows_NT'
  let jobs: Job[] = []
  if (isWindows) {
    const r = await $.process
      .run(['powershell', '-NoProfile', '-NonInteractive', '-Command', WIN_SCRIPT], { timeoutMs: 20_000 })
      .catch(() => null)
    if (r && r.exitCode === 0) jobs = parseWindows(r.stdout)
  } else {
    const r = await $.process.run(['launchctl', 'list'], { timeoutMs: 10_000 }).catch(() => null)
    if (r && r.exitCode === 0) jobs = parseLaunchctl(r.stdout)
  }

  const errText = await $.fs.read(`${home}/.claude/global-memory/transcripts/.errors.log`).catch(() => '')
  const errorLines = String(errText).split('\n').filter(l => l.trim()).length

  const backupLog = await $.fs.read(`${home}/.claude/scripts/logs/daily-backup.log`).catch(() => '')
  const evalStatus = recallStatus(String(backupLog))

  const d = await $.process
    .run(['docker', 'ps', '-a', '--filter', 'name=milvus', '--format', '{{.Names}}|{{.Status}}'], { timeoutMs: 15_000 })
    .catch(() => null)
  let docker = parseDocker(d ? d.exitCode : null, d?.stdout ?? '')
  // A stopped Docker matters only where memsearch runs on it (not Milvus Lite).
  if (docker === 'up' || docker === 'milvus-down') await $.store.set(SAW_MILVUS, true)
  else if (docker === 'docker-down' && !(await $.store.get(SAW_MILVUS))) docker = null

  return { checkedAt: await $.clock.now(), jobs, errorLines, evalStatus, docker }
}

function dockerWarning(state: DockerState): string | null {
  if (state === 'docker-down') return 'Docker is not running: memsearch recall and session sync will fail. Start Docker Desktop.'
  if (state === 'milvus-down') return 'Milvus container is down: memsearch recall and session sync will fail. Start milvus-standalone.'
  return null
}

async function refresh($: EngineInterface, announce: boolean): Promise<void> {
  const before = await read($, report)
  const now = await collect($)
  await update($, report, () => now)
  $.ui.status(statusText(now))

  // Milvus down is said once when first seen, then again each time it drops.
  const warning = dockerWarning(now.docker)
  if (warning && (!before || before.docker === 'up' || before.docker === null)) $.ui.toast(warning)
  if (before && before.docker && before.docker !== 'up' && now.docker === 'up') $.ui.toast('Milvus is back up.')

  if (!announce || !before) return
  for (const job of now.jobs) {
    const old = before.jobs.find(j => j.name === job.name)
    if (old && job.lastRun && job.lastRun !== old.lastRun && job.result !== RUNNING) {
      $.ui.toast(`${job.name} ran at ${when(job.lastRun)}: ${isFailure(job) ? `failed ${hex(job.result ?? 0)}` : 'OK'}`)
    }
  }
  if (now.errorLines > before.errorLines) {
    $.ui.toast(`errors.log has ${now.errorLines - before.errorLines} new line(s)`)
  }
}

// "<status>completed</status> ... <summary>Agent "x" finished</summary>"
export function taskNotice(text: string): string | null {
  const summary = /<summary>([\s\S]*?)<\/summary>/.exec(text)?.[1]?.trim()
  const status = /<status>([\s\S]*?)<\/status>/.exec(text)?.[1]?.trim()
  if (!summary && !status) return null
  return `${status === 'completed' ? '✓' : status === 'failed' ? '✗' : '•'} ${summary ?? `background task ${status}`}`
}

export const register: Register = on => {
  let timer: { cancel: () => void } | undefined

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'jobs',
      description: 'Scheduled jobs, errors.log and recall-check status (job-watch)',
    })
    timer?.cancel()
    timer = $.clock.every(PERIOD_MS, () => void refresh($, true).catch(() => {}))
    $.clock.after(1_000, () => void refresh($, false).catch(() => {}))
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    if (e.origin.kind === 'task-notification') {
      const notice = taskNotice(e.text)
      if (notice) $.ui.toast(notice.slice(0, 120))
    }
    return next(e)
  })

  on('command.run', { command: 'jobs' }, async $ => {
    await refresh($, false)
    const r = await read($, report)
    if (!r) return { text: 'job-watch: nothing collected.' }
    const rows = r.jobs.map(
      j =>
        `- ${j.name}: last ${when(j.lastRun)}, result ${j.result === null ? '?' : j.result === NOT_YET_RUN ? 'not yet run' : j.result === RUNNING ? 'running' : j.result === 0 ? 'OK' : `FAILED ${hex(j.result)}`}${j.nextRun ? `, next ${when(j.nextRun)}` : ''}`,
    )
    return {
      text: [
        `Scheduled jobs (${r.jobs.length}):`,
        ...(rows.length ? rows : ['- none found']),
        `errors.log: ${r.errorLines} line(s)`,
        `recall check: ${r.evalStatus ?? 'no RECALL line in daily-backup.log'}`,
        `memsearch backend: ${r.docker ? (dockerWarning(r.docker) ?? 'Milvus up') : 'no Milvus container on this machine'}`,
      ].join('\n'),
    }
  })
}
