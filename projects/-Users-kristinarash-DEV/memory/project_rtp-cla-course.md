---
name: rtp-cla-course
description: "RTP Constraints-Led course — book ingest state, page-offset facts, and the one rebuild still outstanding"
metadata: 
  node_type: memory
  type: project
  originSessionId: b89c2f0b-04a6-4248-9c74-5f9b535a314c
  modified: 2026-09-07T23:14:12.464Z
---

`DEV/RTP_Constraints_Course` — a return-to-play course built on constraints-led
practice design, sourced from Myszka et al., *Enhancing Skill*.

**Ingest state (as of 2026-09-05): DONE.** 84 atomized advisor entries live in a
new SecondBrain vault domain:
`Knowledge/library/skill-acquisition/enhancing-skill--myszka/`.

**Page-offset facts — do not re-derive these.**
- Phone scans on disk cover printed pages p001–p253.
- The built PDF holds printed p14–p253, so PDF page N = printed page N + 13
  (offset **+13**).
- Ordering was verified five separate ways, including against the book's own
  printed contents page. Treat the current order as correct; folio OCR lies.
  See [[book-scan-page-ordering]].

**Outstanding — the one open gap.** Printed pages **254–255** (About the Authors)
were never scanned. Scan them, then run **ONE** rebuild: it folds in the front
matter and the tail together and drops the offset to **0**. The authoritative
checklist is the `Outstanding` section of the domain's `_book.md`. Do not do two
partial rebuilds.

**Also open:**
- Import `sources/myszka-references-new.ris` (122 records) into Zotero via
  File → Import.
- Write lesson 0002.

Before any further expensive atomization here, apply the arithmetic gate in
[[ingest-review-gate]].
