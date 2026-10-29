---
name: pmc-open-access-pdf-download
description: "Download open-access PMC PDFs with curl from the public pmc-oa-opendata S3 bucket; PMC, Europe PMC and Springer block curl"
metadata:
  type: reference
---

Open-access PMC article PDFs download with plain curl from the public PMC open-data S3 bucket. List a paper's files with https://pmc-oa-opendata.s3.amazonaws.com/?list-type=2&prefix=<PMCID>. and take the main PDF <PMCID>.<ver>/<PMCID>.<ver>.pdf (highest ver). Files like *_ESM.pdf and Data_Sheet_*.PDF are supplements, not the article. pmc.ncbi.nlm.nih.gov pages, Europe PMC ?pdf=render and Springer return a bot check or 403 to curl, and the old NCBI oa.fcgi URL now 404s; the earlier workaround was Chrome. Check each file: %PDF header, page count, printed DOI via pdftotext. Verified 2026-10-29 on 24 papers for the Evidence Library (SportScienceResearchRepo batch 133-139, docs/STATUS.md).
