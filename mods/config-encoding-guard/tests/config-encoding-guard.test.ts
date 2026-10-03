import { describe, expect, test } from 'claude-code/testing'

import { decodeRun, hasBom, repairText } from '../hooks/register'

// Each glyph run the way a CP1252 round trip garbles it (project_settings-json-bom-trap).
const garble = (s: string) =>
  s
    .replace(/—/g, 'â€”')
    .replace(/…/g, 'â€¦')
    .replace(/’/g, 'â€™')
    .replace(/·/g, 'Â·')
    .replace(/▓/g, 'â–“')
    .replace(/░/g, 'â–‘')
    .replace(/↑/g, 'â†‘')
    .replace(/→/g, 'â†’')

describe('repairText', () => {
  test('statusline meter, arrows and prose come back', async () => {
    const good = 'ctx ▓▓░░ ↑2 cache→12:00 — Eric’s note… a · b'
    const r = repairText(garble(good))
    expect(r.text).toBe(good)
    expect(r.fixed).toBe(10)
  })
  test('clean text and real accents are left alone', async () => {
    for (const s of ['plain ascii', 'café naïve résumé', 'Ñandú über', '— already fine ▓ →']) {
      expect(repairText(s)).toEqual({ text: s, fixed: 0 })
    }
  })
  test('drops a leading BOM character', async () => {
    expect(repairText('﻿{"a":1}').text).toBe('{"a":1}')
  })
  test('JSON stays valid after repair', async () => {
    const good = JSON.stringify({ statusLine: { command: "printf '▓░ ↑↓ —'" } })
    expect(JSON.parse(repairText(garble(good)).text)).toEqual(JSON.parse(good))
  })
})

describe('decodeRun', () => {
  test('one character per run', async () => {
    expect(decodeRun('â€”')).toBe('—')
    expect(decodeRun('Ã©')).toBe('é')
  })
  test('rejects runs that are not well-formed UTF-8', async () => {
    expect(decodeRun('é»')).toBeNull() // "é»": lead wants 3 bytes
    expect(decodeRun('Ãx')).toBeNull()
  })
})

test('hasBom', async () => {
  expect(hasBom('77u/eyJhIjox')).toBe(true)
  expect(hasBom('eyJhIjox')).toBe(false)
})
