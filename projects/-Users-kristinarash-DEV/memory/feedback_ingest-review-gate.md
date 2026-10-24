---
name: ingest-review-gate
description: "Before any expensive, hard-to-inspect ingest (ingest-book atomization): a verification step plus an independent model review must pass first"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4597514e-1de9-4f80-87b7-4c8742ddec83
  modified: 2026-10-24T14:53:06.831Z
---

**Stated 2026-09-05**, finishing the Myszka book scan, when Eric was asked how much of the
pipeline could run on a cheaper model.

**Do not run `/ingest-book` (or any comparable atomization) straight off a freshly built
artifact. Gate it on two things: an automated verification step, and a review by an
independent model — Codex, or a fresh adversarial agent if Codex is unavailable.**

**Why:** the ingest is the expensive step *and* the one whose output is hardest to eyeball.
A page-order error costs almost nothing to make, is baked into the PDF, and is then
inherited silently by every note built from it. Eric's own framing: "cheap step, very
expensive mistake." He explicitly declined to cheapen the ingest itself, because that is
where judgement about what matters in the text happens.

**How to apply:**

- Build the artifact, then **verify by a route that shares no code path with how it was
  built.** For the book scan: the order was set by a *visual* read of cropped folio bands,
  so verification read the folio out of the *full-page OCR text* of the finished PDF, and a
  third pass rendered the PDF and read the folios off the rendered pages.
- **A cheap arithmetic identity is worth having as a hard gate, but it is not a proof of
  order.** Why, with the Myszka evidence: [[book-scan-page-ordering]].
- **Audit the verification itself, not just the artifact.** The first version of
  `verify_pdf.py` "checked" that folios increase by appending the *expected* value and
  testing that those increased — true by construction, so it printed YES unconditionally.
  A check that cannot fail is worse than no check. **Prove a check can fail**: feed it a
  deliberately corrupted copy and confirm it says NO.
- **State coverage and blind spots in the output.** Six of 240 pages printed no folio and
  contributed no evidence; a uniform offset error is invisible to a folio check. Print
  that, do not imply 100%.
- Then hand it to the independent reviewer with an instruction to **falsify**, not confirm,
  and with the specific claims spelled out.

**The related cheap-model decision (same conversation):** a small model may take the first
pass at reading page numbers off contact sheets, because the sheet prints the *expected*
number beside each crop — so the job is spotting disagreements, not reading every number.
Anything it flags, and anything ambiguous, gets a careful second look. Eric chose this
mainly for speed; he was explicit that the savings are small and **the gate is the part
worth keeping.**

**What the gate actually caught, 2026-09-05.** The independent review returned **GO** on the
book PDF and **NO-GO** on the reference file shipped alongside it — which is the whole
argument for the gate in one result. It found: a verification check that was a tautology and
could never fail; an overstated claim about what the arithmetic gate proves; 7 chimeric
bibliography records welding one entry's authors to another's title; and 67 of 113 records
carrying a phantom author literally named "K". All were fixed before ingest. **The page order
was sound, and the thing shipped beside it was not** — so gate every deliverable, not just
the expensive one.

Related: [[book-scan-page-ordering]] · [[keystoneos-verification-habits]]
