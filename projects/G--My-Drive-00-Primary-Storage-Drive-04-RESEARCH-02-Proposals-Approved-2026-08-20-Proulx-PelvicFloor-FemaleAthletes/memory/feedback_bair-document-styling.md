---
name: bair-document-styling
description: "BAIR proposal decision letters and evaluation reports share one house style (BU logo header, gold rule, Aptos, green decision labels); template paths"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 1c966ef7-fbcb-43cb-9e07-565a5f0b9c26
  modified: 2026-09-29T20:40:31.072Z
---

BAIR research proposal documents (decision letters and evaluation reports) use the BAIR evaluation report styling: BU logo header with gold rule, Aptos 9.5pt, bold centered title and subtitle, green (#1E6B33) bold decision/result labels, dark-green header tables, a centered bold underlined "Conditions of Approval" heading, and numbered conditions with bold lead-ins. A letter and report sent together must match.

**Why:** Eric asked on 2026-09-29 that the next docs follow the same format and styling as the prior versions. The original Proulx decision letter used a plain navy header that didn't match the report.

**How to apply:** Build new BAIR letters and reports on the report .docx as the base (keep its header, styles, numbering). References:
- Report: `G:\My Drive\00_Primary_Storage_Drive\04_RESEARCH\02_Proposals\Approved\2026-08-20_Proulx_PelvicFloor_FemaleAthletes\2026-09-29_Proulx_PFD_Eval_Report_Phase1.docx`
- Letter: same folder, `2026-09-29_Proulx_PFD_Decision_Letter_Phase1.docx`
- Letter builder (python, swaps body XML into the report template): `G:\My Drive\00_Primary_Storage_Drive\04_RESEARCH\02_Proposals\_templates\build_bair_decision_letter.py`
Use Athletic Medicine / Athletic Performance terminology. Export PDFs via Word COM.
