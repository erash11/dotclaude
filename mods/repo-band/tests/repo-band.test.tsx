import { describe, expect, test } from 'claude-code/testing'

import { parseStatus } from '../hooks/register'

describe('parseStatus', () => {
  test('clean branch tracking a remote', async () => {
    const r = parseStatus('Flint', '/x/Flint', '## main...origin/main\n')
    expect(r).toEqual({ name: 'Flint', path: '/x/Flint', branch: 'main', dirty: 0, ahead: 0, hasUpstream: true })
  })

  test('dirty and ahead', async () => {
    const out = '## feat/x...origin/feat/x [ahead 2, behind 1]\n M a.py\n?? b.md\n'
    const r = parseStatus('PP', '/x/PP', out)
    expect(r.dirty).toBe(2)
    expect(r.ahead).toBe(2)
    expect(r.branch).toBe('feat/x')
  })

  test('no upstream, first commit pending', async () => {
    const r = parseStatus('New', '/x/New', '## No commits yet on main\n?? README.md\n')
    expect(r.branch).toBe('main')
    expect(r.hasUpstream).toBe(false)
    expect(r.dirty).toBe(1)
  })
})

describe('band', () => {
  test('draws a summary and both closeout buttons on terminal and desktop', async $ => {
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({
        plugin: 'repo-band',
        surface,
        component: 'AbovePrompt',
        props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 120, scroll: { offset: 0, bodyRows: 10 }, view: {} },
      })
      expect(await ui.find({ type: 'Text', text: /repos/ })).toBeDefined()
      expect(await ui.find({ key: 'closeout' })).toBeDefined()
      expect(await ui.find({ key: 'closeout-exit' })).toBeDefined()
      await ui.unmount()
    }
  })

  test('yields to a survey', async $ => {
    const ui = await $.ui.mount({
      plugin: 'repo-band',
      surface: 'terminal',
      component: 'AbovePrompt',
      props: { hasSurvey: true, isWorking: false, maxRows: 10, bodyColumns: 120, scroll: { offset: 0, bodyRows: 10 }, view: {} },
    })
    expect(await ui.find({ key: 'closeout' })).toBeUndefined()
    await ui.unmount()
  })
})
