---
name: status-report-sourcing
description: "Where the Applied Performance status report gets its facts, and which sources lie"
metadata: 
  node_type: memory
  type: project
  originSessionId: 412a89e3-b64f-44e6-9c87-4766d44e6c7a
  modified: 2026-08-11T23:02:16.886Z
---

The twice-monthly status report to Chris Ruf (cc Kenny Boyd) is specified by **KR 4.1**
in `SecondBrain/Projects/Applied-Performance-OKRs-2026-27.md` — five sections
(Shipped / In Progress / Decisions Needed / Risks–No-Surprises / Next Two Weeks),
under 300 words. Built by the `status-report` skill; template at
`SecondBrain/Templates/status-report.md`.

**Source rules that matter:**

- **"Shipped" comes only from `SecondBrain/output/_ledger.md`** — never from
  `portfolio.json` `stage`. The registry marks projects shipped that still have
  stakeholder sign-off outstanding (Sport_Tech_Vetting was `shipped` while KR 1.2 showed
  Chris's sign-off pending). Reporting that to a supervisor claims approval that doesn't
  exist. Portfolio `stage` feeds "In Progress" only.
- **Read the OKR doc (v3, 14 KRs), never the cadence doc's KR table** — that one is the
  superseded v2 set of 9 and will produce wrong facts.
- **`portfolio.json` mixes personal tooling with departmental work.** Filter
  `lane == "job"`. Canonical reportable list lives at
  `SecondBrain/Projects/Applied-Performance-Active-Projects.md`.
- **Only 4 of 14 job-lane projects ladder to a KR**, and 10 of 14 KRs have no project.
  The registry and the OKRs track different halves of the job; neither alone gives an
  accurate picture.

**Why the report exists:** primarily alignment, secondarily credit — specifically for
involvement with sports beyond football and basketball. The sport tags and the PDF's
coverage panel are the mechanism, not decoration. Do not pad the coverage panel; a thin
one is real information and padding destroys the evidentiary value of the honest ones.

Related: [[fireflies-cli-broken-on-mac]]
