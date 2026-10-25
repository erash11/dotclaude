# Recall eval ledger

One row per backend per run. Decision rule: audit section 6.2.

| date | machine | label | backend | n | hit@1 | hit@5 | MRR | p50 ms | p95 ms | fail% | coverage% | by layer (hit@5) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-09-30 | bu-1979fj4 | baseline pre-vault-index | fts5 | 23 | 18 | 21 | 0.848 | 5 | 30 | 0.0 | 100.0 | tierA 9/9, transcript 1/1, vault 11/13 |
| 2026-09-30 | bu-1979fj4 | baseline pre-vault-index | rg | 23 | 8 | 16 | 0.475 | 228 | 348 | 0.0 | 100.0 | tierA 4/9, transcript 1/1, vault 11/13 |
| 2026-09-30 | bu-1979fj4 | baseline n30 (fts5/rg; memsearch pending vault index) | fts5 | 30 | 21 | 25 | 0.767 | 1 | 3 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-09-30 | bu-1979fj4 | baseline n30 (fts5/rg; memsearch pending vault index) | rg | 30 | 12 | 22 | 0.533 | 94 | 132 | 0.0 | 100.0 | compiled 1/1, dev-docs 1/1, tierA 8/14, transcript 1/1, vault 11/13 |
| 2026-09-30 | bu-1979fj4 | fts5 vs fts5+jev n30 | fts5 | 30 | 21 | 25 | 0.767 | 1 | 3 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-09-30 | bu-1979fj4 | fts5 vs fts5+jev n30 | jev | 30 | 19 | 27 | 0.756 | 408 | 745 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 13/14, transcript 1/1, vault 12/13 |
| 2026-10-01 | bu-1979fj4 | post-vault-index | memsearch | 30 | 15 | 29 | 0.694 | 5701 | 9740 | 0.0 | 100.0 | compiled 1/1, dev-docs 1/1, tierA 14/14, transcript 1/1, vault 12/13 |
| 2026-10-01 | bu-1979fj4 | post-vault-index | fts5 | 30 | 20 | 25 | 0.75 | 5 | 16 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-01 | bu-1979fj4 | post-vault-index | rg | 30 | 11 | 23 | 0.509 | 111 | 129 | 0.0 | 100.0 | compiled 1/1, dev-docs 1/1, tierA 8/14, transcript 1/1, vault 12/13 |
| 2026-10-04 | bu-1979fj4 | weekly | memsearch | 30 | 15 | 28 | 0.684 | 4048 | 21025 | 0.0 | 100.0 | compiled 1/1, dev-docs 1/1, tierA 14/14, transcript 1/1, vault 11/13 |
| 2026-10-04 | bu-1979fj4 | weekly | fts5 | 30 | 19 | 25 | 0.733 | 2 | 6 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-04 | bu-1979fj4 | weekly | rg | 30 | 10 | 22 | 0.468 | 115 | 183 | 0.0 | 100.0 | compiled 1/1, dev-docs 1/1, tierA 8/14, transcript 1/1, vault 11/13 |
| 2026-10-04 | bu-1979fj4 | weekly | jev | 30 | 19 | 27 | 0.758 | 581 | 993 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 13/14, transcript 1/1, vault 12/13 |
| 2026-10-04 | bu-1979fj4 | chain-test | fts5 | 30 | 19 | 25 | 0.733 | 2 | 5 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-23 | kristinas-macbook.local | recall.py first Mac run | fts5 | 30 | 19 | 25 | 0.728 | 8 | 80 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-23 | kristinas-macbook.local | recall.py first Mac run | recall | 30 | 17 | 23 | 0.639 | 499 | 1296 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 11/14, transcript 0/1, vault 11/13 |
| 2026-10-23 | kristinas-macbook.local | recall.py on fts5 (Mac) | fts5 | 30 | 19 | 25 | 0.728 | 32 | 393 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-23 | kristinas-macbook.local | recall.py on fts5 (Mac) | recall | 30 | 18 | 25 | 0.692 | 35 | 399 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-23 | kristinas-macbook.local | recall.py Tier A first | fts5 | 30 | 19 | 25 | 0.728 | 9 | 43 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-23 | kristinas-macbook.local | recall.py Tier A first | recall | 30 | 21 | 25 | 0.747 | 11 | 27 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-23 | kristinas-macbook.local | recall.py Tier A first, coverage guard | fts5 | 30 | 19 | 25 | 0.728 | 4 | 20 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-23 | kristinas-macbook.local | recall.py Tier A first, coverage guard | recall | 30 | 21 | 25 | 0.747 | 18 | 729 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-23 | kristinas-macbook.local | recall.py Tier A first, name guard | fts5 | 30 | 19 | 25 | 0.728 | 6 | 19 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-23 | kristinas-macbook.local | recall.py Tier A first, name guard | recall | 30 | 22 | 25 | 0.764 | 11 | 36 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-23 | kristinas-macbook.local | recall.py newest Tier A copy | fts5 | 30 | 19 | 25 | 0.728 | 4 | 14 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-23 | kristinas-macbook.local | recall.py newest Tier A copy | recall | 30 | 22 | 25 | 0.764 | 9 | 22 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-23 | kristinas-macbook.local | recall.py all memory folders | fts5 | 30 | 19 | 25 | 0.728 | 3 | 9 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-23 | kristinas-macbook.local | recall.py all memory folders | recall | 30 | 21 | 25 | 0.747 | 12 | 22 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-23 | kristinsmacbook.lan | recall.py about guard (name+description) | fts5 | 30 | 19 | 25 | 0.722 | 2 | 9 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-23 | kristinsmacbook.lan | recall.py about guard (name+description) | recall | 30 | 20 | 25 | 0.731 | 7 | 33 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-23 | kristinsmacbook.lan | recall.py memory description guard | fts5 | 30 | 19 | 25 | 0.722 | 2 | 7 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-23 | kristinsmacbook.lan | recall.py memory description guard | recall | 30 | 21 | 25 | 0.747 | 8 | 92 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-10-25 | kristinsmacbook.lan | INVALID: ran while SessionEnd index held the Milvus lock (fail 100%); see audits/2026-10-25-memory-recall-audit.md §5 | memsearch | 30 | 0 | 0 | 0.0 | 8175 | 17855 | 100.0 | 100.0 | compiled 0/1, dev-docs 0/1, tierA 0/14, transcript 0/1, vault 0/13 |
| 2026-10-25 | kristinsmacbook.lan | audit 10-25 post-lock | memsearch | 30 | 13 | 25 | 0.611 | 6230 | 7274 | 0.0 | 100.0 | compiled 1/1, dev-docs 1/1, tierA 11/14, transcript 1/1, vault 11/13 |
