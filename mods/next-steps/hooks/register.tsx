import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Suggestion, SuggestionSet } from '../types'

// Next-steps band (the "next steps" mod from the Chase AI video, plus the
// resume list from the session audit). Before the first prompt it offers the
// newest handoffs in docs/handoffs; after each answered turn it asks Haiku
// for three follow-up prompts. A press puts the prompt in the box to edit;
// Enter sends it. The band clears when any prompt is sent.

const current = atom({ plugin: 'next-steps', key: 'current' } as const, null)
const isThinking = atom({ plugin: 'next-steps', key: 'isThinking' } as const, false)
const isHidden = atom({ plugin: 'next-steps', key: 'isHidden' } as const, false)

const ENABLED_KEY = 'enabled'
const MIN_ANSWER_CHARS = 120
const MAX_CONTEXT_CHARS = 6000
const SKIP_PROMPTS = /^\s*\/(closeout|exit|clear|compact|next-steps|repos)\b/i

const SYSTEM = `You suggest what the user of a coding agent might ask next.
Reply with JSON only: an array of exactly 3 objects {"label": string, "prompt": string}.
- "prompt" is written in the user's voice, as they would type it: direct, imperative, one sentence, at most 140 characters.
- "label" is 2 to 5 words summarising the prompt.
- Make the three meaningfully different: e.g. continue the obvious next step, verify or test what was done, and wrap up or change direction.
- If the assistant asked the user a question, at least one suggestion answers it.
- Never suggest anything destructive (deleting data, force-pushing, dropping tables).`

export function parseSuggestions(text: string): Suggestion[] {
  const start = text.indexOf('[')
  const end = text.lastIndexOf(']')
  if (start < 0 || end <= start) return []
  try {
    const raw: unknown = JSON.parse(text.slice(start, end + 1))
    if (!Array.isArray(raw)) return []
    return raw
      .filter(
        (s): s is Suggestion =>
          typeof s === 'object' && s !== null && typeof s.label === 'string' && typeof s.prompt === 'string',
      )
      .map(s => ({ label: s.label.trim().slice(0, 40), prompt: s.prompt.trim().slice(0, 300) }))
      .filter(s => s.label && s.prompt)
      .slice(0, 3)
  } catch {
    return []
  }
}

export function handoffSuggestions(names: string[]): Suggestion[] {
  return names
    .filter(n => n.endsWith('.md'))
    .sort()
    .reverse()
    .slice(0, 3)
    .map(n => ({
      label: `Resume ${n.replace(/\.md$/, '').replace(/^\d{4}-(\d{2}-\d{2})-/, '$1 ')}`.slice(0, 40),
      prompt: `Read docs/handoffs/${n} and docs/STATUS.md, then pick this work back up.`,
    }))
}

async function isEnabled($: EngineInterface): Promise<boolean> {
  return ((await $.store.get(ENABLED_KEY)) ?? true) !== false
}

async function seedFromHandoffs($: EngineInterface): Promise<void> {
  const entries = await $.fs.list('docs/handoffs').catch(() => [])
  const items = handoffSuggestions(entries.filter(e => e.kind === 'file').map(e => e.name))
  if (items.length) await update($, current, () => ({ source: 'handoffs', items }) satisfies SuggestionSet)
}

async function suggest($: EngineInterface, ask: string, answer: string): Promise<void> {
  await update($, isThinking, () => true)
  try {
    const prompt = `The user asked:\n${ask.slice(0, 1500)}\n\nThe assistant answered:\n${answer.slice(-MAX_CONTEXT_CHARS)}\n\nSuggest the user's 3 best next prompts.`
    const r = await $.model.complete({ model: 'haiku', system: SYSTEM, prompt, maxTokens: 400, timeoutMs: 30_000 })
    const items = r.isAnswered ? parseSuggestions(r.text) : []
    await update($, current, () => (items.length ? ({ source: 'model', items } satisfies SuggestionSet) : null))
  } finally {
    await update($, isThinking, () => false)
  }
}

export const register: Register = on => {
  let lastAsk = ''

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'next-steps',
      description: 'Toggle the next-steps band (on/off); with no argument, show it again',
    })
    if (await isEnabled($)) await seedFromHandoffs($)
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    // Only what the person typed; background-task notices and plugin
    // prompts leave the band and the last ask alone.
    if (e.origin.kind === 'composer') {
      lastAsk = e.text
      await update($, current, () => null)
    } else {
      lastAsk = ''
    }
    return next(e)
  })

  // A slash command run from a button (repo-band's /closeout) bypasses
  // prompt.submit; record it so SKIP_PROMPTS still applies.
  on('command.run', ($, e, next) => {
    lastAsk = `/${e.command} ${e.args}`
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId || e.reason !== 'answer') return result
    if (!lastAsk || e.answer.length < MIN_ANSWER_CHARS || SKIP_PROMPTS.test(lastAsk)) return result
    if (!(await isEnabled($))) return result
    const ask = lastAsk
    const answer = e.answer
    // Run outside the turn's dispatch so the turn ends at once.
    $.clock.after(0, () => void suggest($, ask, answer).catch(() => {}))
    return result
  })

  on('command.run', { command: 'next-steps' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'off') {
      await $.store.set(ENABLED_KEY, false)
      await update($, current, () => null)
      return { text: 'next-steps: off (no more Haiku calls). /next-steps on to resume.' }
    }
    if (arg === 'on') await $.store.set(ENABLED_KEY, true)
    await update($, isHidden, () => false)
    return { text: `next-steps: ${(await isEnabled($)) ? 'on' : 'off'}.` }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const below = await next(e)
    if (e.props.hasSurvey || e.props.isWorking || (await read($, isHidden))) return below
    const set = await read($, current)
    const thinking = await read($, isThinking)
    if (!set && !thinking) return below
    const { Box, Text, Button } = $.ui.resolve(e)

    const mine = (
      <Box flexDirection="row" gap={1} flexWrap="wrap">
        <Text dimColor>{set?.source === 'handoffs' ? 'Resume:' : 'Next:'}</Text>
        {thinking && !set && <Text dimColor>thinking…</Text>}
        {(set?.items ?? []).map((s, i) => (
          <Button
            key={`next-${i}`}
            label={s.label}
            hotkey={String(i + 1)}
            onPress={async () => {
              const filled = await $.prompt.fill({ text: s.prompt, mode: 'replace' })
              if (!filled.isFilled) $.ui.toast('Could not fill the prompt box')
            }}
          />
        ))}
        <Button key="hide" label="Hide" plain role="dismiss" onPress={() => update($, isHidden, () => true)} />
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
