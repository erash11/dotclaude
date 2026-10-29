import { expect, mock, test } from 'claude-code/testing'

import { bar, clock } from '../hooks/register'

test('the bar fills in half steps and keeps its width', async () => {
  expect(bar(0, 4, 8)).toEqual({ filled: '', rest: '────────' })
  expect(bar(2, 4, 8)).toEqual({ filled: '━━━━', rest: '────' })
  expect(bar(1, 3, 8)).toEqual({ filled: '━━╸', rest: '─────' })
  expect(bar(4, 4, 8)).toEqual({ filled: '━━━━━━━━', rest: '' })
  expect(clock(42)).toBe('42s')
  expect(clock(192)).toBe('3m12s')
})

test('a todo update draws the thin line', async ($, on) => {
  const time = mock.clock(on)
  on('command.register', () => ({ value: { command: 'progress-clear' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('agent.list', () => ({ value: [] }))
  on('tool.call', () => ({ result: {} }))
  // Another mod's band beneath, which the line must stack above.
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>repos: clean</Text>
  })

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.tool.call({
    tool: 'TodoWrite',
    todos: [
      { content: 'a', status: 'completed', activeForm: 'a' },
      { content: 'b', status: 'in_progress', activeForm: 'b' },
    ],
  })
  await time.advance(1100)

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({
      plugin: 'progress-line',
      surface,
      component: 'AbovePrompt',
      props: {
        hasSurvey: false,
        isWorking: true,
        maxRows: 10,
        bodyColumns: 64,
        scroll: { offset: 0, bodyRows: 10 },
        view: {},
      },
    })
    expect((await ui.find({ type: 'Text', text: /1\/2/ }))?.text).toContain('1/2')
    expect(await ui.find({ type: 'Text', text: /repos: clean/ })).toBeTruthy()
    await ui.unmount()
  }
})
