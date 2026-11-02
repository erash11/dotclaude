---
name: baylor-house-style
description: "Where the Baylor Athletics Applied Performance printed house style lives, and its exact color/font tokens"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 24188e64-cd3b-4d08-a65f-fd2807d3bfb7
  modified: 2026-08-20T02:41:13.520Z
---

The printed house style for Baylor Athletics Applied Performance one-pagers and reports
is documented, not improvised. Chain of authority:

1. `~/DEV/Education_Content_Agent/context/house-style.md` — governing doc. Format 2 is
   "the one-pager" and names the block spec plus the hard rule: one page, US Letter
   portrait, and **if it does not fit, cut content — never shrink the type**.
2. `~/DEV/Program/TechEd_Prop/ShitfWave/option-c-matrix.html` — the precedent artifact. Best
   single file to copy from.
3. `~/DEV/Program/TechEd_Prop/ShitfWave/baylor-brand.css` (1.6 MB) — fonts and BU logo marks
   embedded as data URIs, zero external deps. Exposes `var(--bu-mark-white)`,
   `--bu-mark-green`, `--bear-gold`, `--bear-green`, `--lockup-white`.

Tokens: `#1E1F1F` charcoal ground · `#154734` Baylor green, used only as a radial wash
`rgba(21,71,52,.55)`, never a fill · `#FFB81C` gold for every rule (2px border-top) and
accent · `#E0DDD1` bone body text · `#D2D3D3` secondary · `#AFD2C0` mint sub-labels.

Fonts (as declared in baylor-brand.css — use these names, plus font-weight):
`'Baylor Bears'` display · `'DIN Pro Condensed'` labels · `'DIN Pro'` body. The OTFs are
also installed on this Mac under different family names (`Baylor Bears Font`, `DIN Pro`),
and `Education_Content_Agent/web/data-to-decision.html` relies on that instead of
`@font-face` — do not copy its family names.

Structure: 8.5×11in fixed `.sheet`, 38px side rail, `overflow:hidden` so it can never
spill to page 2, footer always `Baylor Athletics · Applied Performance`.

Worked example of the multi-page adaptation (charcoal band + light body, so checkboxes
stay writable): `~/DEV/Linda Projects/source/report.css` and `build.py`.

See [[chrome-pdf-font-gotcha]] before rendering any of this to PDF.
