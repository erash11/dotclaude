# Recall eval ledger

One row per backend per run. Decision rule: audit section 6.2.

| date | machine | label | backend | n | hit@1 | hit@5 | MRR | p50 ms | p95 ms | fail% | coverage% | by layer (hit@5) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-09-30 | bu-1979fj4 | baseline pre-vault-index | fts5 | 23 | 18 | 21 | 0.848 | 5 | 30 | 0.0 | 100.0 | tierA 9/9, transcript 1/1, vault 11/13 |
| 2026-09-30 | bu-1979fj4 | baseline pre-vault-index | rg | 23 | 8 | 16 | 0.475 | 228 | 348 | 0.0 | 100.0 | tierA 4/9, transcript 1/1, vault 11/13 |
| 2026-09-30 | bu-1979fj4 | baseline n30 (fts5/rg; memsearch pending vault index) | fts5 | 30 | 21 | 25 | 0.767 | 1 | 3 | 0.0 | 100.0 | compiled 1/1, dev-docs 0/1, tierA 12/14, transcript 1/1, vault 11/13 |
| 2026-09-30 | bu-1979fj4 | baseline n30 (fts5/rg; memsearch pending vault index) | rg | 30 | 12 | 22 | 0.533 | 94 | 132 | 0.0 | 100.0 | compiled 1/1, dev-docs 1/1, tierA 8/14, transcript 1/1, vault 11/13 |
