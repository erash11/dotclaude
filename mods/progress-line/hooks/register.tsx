import { atom, read, update } from 'claude-code'
import type { AgentInfo, EngineInterface, Register, Timer } from 'claude-code'

import type { View } from '../types'

// Change the tag when View's fields change: it declines what an earlier
// version stored, which outlives a reload.
const view = atom({ plugin: 'progress-line', key: 'view' } as const, null, {
  shape: 'view-1',
})

const SPINNER = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
const ACTIVE = new Set(['pending', 'running', 'waiting'])
const FAILED = new Set(['failed', 'killed'])
const LINGER_MS = 5000

/** A thin bar: `━` done, `╸` a half step, `─` still to do. */
export function bar(done: number, total: number, width: number) {
  const exact = total === 0 ? 0 : (Math.min(done, total) / total) * width
  const full = Math.floor(exact)
  const half = full < width && exact - full >= 0.5 ? 1 : 0

  return {
    filled: '━'.repeat(full) + (half ? '╸' : ''),
    rest: '─'.repeat(width - full - half),
  }
}

export function clock(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60

  return m > 0 ? `${m}m${String(s).padStart(2, '0')}s` : `${s}s`
}

// Module state: a reload starts it over, which only empties the line.
// Main-loop tasks only: a subagent's own todo list would clobber these.
const tasks = new Map<string, string>()
let todos: string[] = []
// Agents from a batch already shown as done; never counted again.
const hidden = new Set<string>()
let startedAt: number | null = null
let finishedAt: number | null = null
let frame = 0
let tick: Timer | null = null
let isFast = false
let isBusy = false

async function listAgents($: EngineInterface) {
  return (await $.agent.list()).filter(
    a => !hidden.has(a.id) && a.teammateId === undefined,
  )
}

function clearBatch(agents: AgentInfo[]) {
  for (const a of agents) hidden.add(a.id)
  for (const [id, status] of tasks) if (status === 'completed') tasks.delete(id)
  todos = []
  startedAt = null
  finishedAt = null
}

// Only the timer session.start made calls refresh, so the long-lived work
// always runs on that hook's $; other hooks just record what changed.
// One poll a second; eight a second while an agent spinner turns.
function setSpeed($: EngineInterface, wantFast: boolean) {
  if (tick && isFast === wantFast) return
  tick?.cancel()
  isFast = wantFast
  tick = $.clock.every(wantFast ? 125 : 1000, () => void refresh($))
}

async function refresh($: EngineInterface) {
  if (isBusy) return
  isBusy = true
  try {
    const agents = await listAgents($)
    const statuses = [...tasks.values(), ...todos]
    const total = statuses.length
    const done = statuses.filter(s => s === 'completed').length
    const running = agents.filter(a => ACTIVE.has(a.status))
    const hasWork = total > 0 || agents.some(a => a.status !== 'idle')

    if (!hasWork) {
      startedAt = null
      await update($, view, () => null)
      setSpeed($, false)
      return
    }

    const now = await $.clock.now()
    startedAt ??= now
    const isFinished = running.length === 0 && done === total
    finishedAt = isFinished ? (finishedAt ?? now) : null

    if (finishedAt !== null && now - finishedAt > LINGER_MS) {
      clearBatch(agents)
      await update($, view, () => null)
      setSpeed($, false)
      return
    }

    frame = (frame + 1) % SPINNER.length
    const next: View = {
      done,
      total,
      running: running.map(a => a.type),
      agentsDone: agents.filter(a => a.status === 'completed').length,
      agentsFailed: agents.filter(a => FAILED.has(a.status)).length,
      seconds: Math.round((now - startedAt) / 1000),
      frame,
      isFinished,
    }
    await update($, view, () => next)
    setSpeed($, running.length > 0)
  } finally {
    isBusy = false
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'progress-clear',
      description: 'Clear the progress line above the prompt',
    })
    setSpeed($, false)

    return next(e)
  })

  on('command.run', { command: 'progress-clear' }, async $ => {
    clearBatch(await listAgents($))
    tasks.clear()
    await update($, view, () => null)

    return { text: 'Progress line cleared.' }
  })

  on('tool.call', { tool: 'TaskCreate' }, async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId === undefined && ran.deny === undefined && !ran.isError) {
      tasks.set(ran.result.task.id, 'pending')
    }

    return ran
  })

  on('tool.call', { tool: 'TaskUpdate' }, async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId === undefined && ran.deny === undefined && !ran.isError) {
      if (e.status === 'deleted') tasks.delete(e.taskId)
      else if (e.status) tasks.set(e.taskId, e.status)
    }

    return ran
  })

  on('tool.call', { tool: 'TodoWrite' }, async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId === undefined && ran.deny === undefined && !ran.isError) {
      todos = e.todos.map(t => t.status)
    }

    return ran
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    // Stack above the other bands (repo-band, next-steps), never in place of them.
    const below = await next(e)
    const v = await read($, view)
    if (e.props.hasSurvey || v === null) return below

    const { Box, Text } = $.ui.resolve(e)
    const width = Math.max(8, Math.min(24, e.props.bodyColumns - 40))
    const { filled, rest } = bar(v.done, v.total, width)
    const agents =
      v.running.length === 1 ? v.running[0] : `${v.running.length} agents`

    const mine = (
      <Box flexDirection="row" gap={2}>
        {v.isFinished ? <Text color="success">✓ all done</Text> : null}
        {v.total > 0 ? (
          <Text>
            <Text color="success">{filled}</Text>
            <Text dimColor>{rest}</Text> {v.done}/{v.total}
          </Text>
        ) : null}
        {v.running.length > 0 ? (
          <Text color="suggestion">
            {SPINNER[v.frame]} {agents}
          </Text>
        ) : null}
        {v.agentsDone > 0 && !v.isFinished ? (
          <Text dimColor>✓ {v.agentsDone}</Text>
        ) : null}
        {v.agentsFailed > 0 ? (
          <Text color="error">✗ {v.agentsFailed} failed</Text>
        ) : null}
        <Text dimColor>{clock(v.seconds)}</Text>
      </Box>
    )

    if (!below || (below as { type?: string }).type === 'engine') return mine
    return (
      <Box flexDirection="column">
        {mine}
        {below}
      </Box>
    )
  })
}
