import { describe, expect, test } from 'claude-code/testing'

import { handoffSuggestions, parseSuggestions } from '../hooks/register'

describe('parseSuggestions', () => {
  test('reads a JSON array wrapped in prose or fences', async () => {
    const text = 'Here:\n```json\n[{"label":"Run tests","prompt":"run the tests"},{"label":"Ship","prompt":"commit and push"},{"label":"Docs","prompt":"update STATUS.md"},{"label":"x","prompt":"y"}]\n```'
    const s = parseSuggestions(text)
    expect(s.length).toBe(3)
    expect(s[0]).toEqual({ label: 'Run tests', prompt: 'run the tests' })
  })
  test('garbage gives nothing', async () => {
    expect(parseSuggestions('no json here')).toEqual([])
    expect(parseSuggestions('[{"label": 1}]')).toEqual([])
  })
})

describe('handoffSuggestions', () => {
  test('newest three markdown handoffs, newest first', async () => {
    const s = handoffSuggestions(['2026-09-24-a.md', 'README.txt', '2026-09-30-memory-infra-audit.md', '2026-09-29-prompt-audit.md', '2026-09-01-old.md'])
    expect(s.length).toBe(3)
    expect(s[0]?.label).toBe('Resume 09-30 memory-infra-audit')
    expect(s[0]?.prompt).toBe('Read docs/handoffs/2026-09-30-memory-infra-audit.md and docs/STATUS.md, then pick this work back up.')
  })
})

describe('band', () => {
  test('stays out of the way when it has nothing to offer', async $ => {
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({
        plugin: 'next-steps',
        surface,
        component: 'AbovePrompt',
        props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 120, scroll: { offset: 0, bodyRows: 10 }, view: {} },
      })
      expect(await ui.find({ key: 'next-0' })).toBeUndefined()
      await ui.unmount()
    }
  })
})
