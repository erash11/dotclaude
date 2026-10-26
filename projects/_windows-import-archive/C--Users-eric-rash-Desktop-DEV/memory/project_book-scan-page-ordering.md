---
name: book-scan-page-ordering
description: "Putting phone-scanned book pages in page order: OCR of the folio is unreliable, read a contact sheet instead; sort by mtime, never filename"
metadata: 
  node_type: memory
  type: project
  modified: 2026-09-05T15:14:58.631Z
  originSessionId: 2a119c54-f684-43a9-b1a0-c8653e1c2320
---

**Learned 2026-09-03** putting 88 vFlat iPhone scans of the Myszka football book into page
order. Cost several wasted OCR-tuning passes before the right method surfaced.

## Do not trust OCR for the page number

Three tuning attempts; **one made it worse** (80 of 88 unread). Two failure modes:

- A bottom-strip crop catches **body text and citation years**. Taking the longest digit
  token then picks a 4-digit year over a 2-digit folio.
- Tesseract **confuses 5 with 9**. It read page **50 as 90 with 8/8 unanimous votes** — a
  confident wrong answer, which is worse than an unread one. Vote counts do not rescue this.

## What actually works — read a contact sheet

1. Crop a tight band around the **centred** folio: `x 0.36–0.64`, `y 0.900–0.952` of the
   page image. Autocontrast, grayscale.
2. Tile ~44 of them into one PNG with the capture index labelled beside each.
3. **Look at it.** Two sheets covered 88 pages, unambiguously, in two passes.

Folios are large, bold and isolated — trivial to read by eye, and the thing OCR keeps
getting wrong. Do not keep tuning tesseract; switch methods after the second failure.

## Ordering traps

- **Sort by mtime, never by filename.** macOS appends ` (1)` on download collisions, and
  `…17-35-17 (1).jpg` sorts *before* `…17-35-17.jpg` while the timestamps say the reverse.
- **Same-second captures land out of page order.** Two pairs were swapped this way.
- A page shot out of sequence (67 before 66) looks exactly like a **missing page** if your
  sample happens to skip the tile it is on. Verify a "gap" before believing it.

## Other findings

- **A zero-word OCR page may just be blank.** One page returned no text and was genuinely
  blank in the book — but still carried a printed folio.
- **Bad pages cluster in time**, not randomly: all 7 poor scans fell inside one two-minute
  window. Re-shoot the window, not the whole book.
- **The scan folder is live** while the human is still working. Any script must re-verify
  its map rather than assert on a file count — a new shot broke an `assert` mid-analysis.
- Rename via a **temp prefix in two passes** so no collision is possible, and always write
  an old→new manifest so the rename is reversible.

## Quality bar that worked

vFlat Scan on iPhone, ~2000×3200 px (~360 DPI) — above the 300 DPI OCR target. Median
tesseract confidence **95.0**. Turn the app's OCR off, or just use
`ocrmypdf --force-ocr`, which discards any text layer the app added and makes the setting
irrelevant.

Pipeline: `img2pdf` (page order) → `ocrmypdf --force-ocr --rotate-pages --deskew` →
`ingest-book` at **full-text tier**.

## Second batch, 2026-09-05 — what changed

157 more pages finished the book (printed 14–253, 240 pages). Median confidence **95.5**,
consistent with the first batch, so the quality bar above holds.

**All of this is now code:** `DEV/RTP_Constraints_Course/scripts/scan_pipeline.py`. Read
its docstring before the next book rather than rebuilding the method. `verify_pdf.py`
beside it proves page order afterwards.

**The arithmetic gate is worth having but is NOT a page-order proof** — corrected after
review. `files − duplicates == last − first + 1` is enforced in code that refuses to
rename, and it does catch gaps, doubled folios and collisions. But with no overrides the
folios are a running counter, so the identity holds *by construction* and the gate compares
a number with itself. **A transposition, a wrong start page, a missed duplicate and two
cancelling errors all pass it.** What actually proved order was `verify_pdf.py` reading the
folio out of the finished PDF's full-page OCR — plus a fourth pass reading prose continuity
across every page boundary. Never let the gate stand in for those.

**Collision pairs are not rare.** Twelve same-second ` (1)` pairs this batch against two
last time, and one pair (`08-08-44`) was genuinely inverted on disk relative to capture.
The mtime rule handles it; filename sort would not have.

**Re-shoots cluster into runs.** Printed 170–173 were each shot twice, in two passes ~30 s
apart, with the *first* pass interleaved so 170 and 171 shared a second. Resolve duplicates
by **measured OCR confidence**, not by eye or by assuming the later shot is better — here
the earlier copy won three of the four.

**Blank versos carry folios.** Printed 62, 194 and 236 are blank in the book and each still
prints its number. Open the page before calling a zero-word OCR result a failed scan.

## Scan the front matter FIRST on the next book

Learned 2026-09-05, the expensive way. The Myszka front matter was scanned *last*, as an
afterthought, and it produced two things nothing else could:

1. **The printed contents page is external ground truth for page order.** It listed all
   thirteen landmarks and matched the scan-derived map exactly — a stronger check than any
   of the four internal ones, and free.
2. **It revealed that the book was longer than the scan.** The contents ended with "About
   the Authors 255"; the scan stopped at 253. **Nothing in the body revealed the gap** — no
   header, no folio, no cross-reference — and it survived five verification passes
   unnoticed. Only the contents page exposed it.

The copyright page also settles the publication year, which the body never states.

**So: photograph the contents page and copyright page before scanning the body.** It costs
two shots, tells you where the book ends, and gives you the check to grade every later
page against.

Related: [[dev-layout-and-discovery]] · [[ingest-review-gate]]
