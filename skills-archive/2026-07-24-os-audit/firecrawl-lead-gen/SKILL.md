---
name: firecrawl-lead-gen
description: Generate structured lead lists from prospect databases and web directories with Firecrawl browser. Use for finding prospects by role, company type, industry, stage, location, technologies, or other criteria and exporting CRM-ready JSON or CSV.
license: ISC
metadata:
  author: firecrawl
  version: "0.1.0"
  homepage: https://www.firecrawl.dev
  source: https://github.com/firecrawl/firecrawl-workflows
inputs:
  - name: FIRECRAWL_API_KEY
    description: Firecrawl API key for hosted Firecrawl requests.
    required: true
---

# Firecrawl Lead Gen

Use this to extract legitimately accessible prospect lists.

## Onboarding Interview

Infer the prospect target, source, lead count, and output format from context. If the target is clear, proceed immediately.

Ask at most 1-3 concise questions only if blocked, such as the prospect definition, source/auth requirement, or target lead count.

## Firecrawl Collection Plan

Use Firecrawl browser for databases requiring filters, search forms, pagination, or login. Use search/scrape for public sources.

Apply filters such as role, company size, industry, geography, funding stage, and technologies when available.

## Extraction Fields

Capture visible or legitimately accessible fields:

- name
- title
- company
- company URL
- location
- email, phone, and LinkedIn only when visible/allowed
- industry, company size, funding stage
- notes and profile URL

## Final Deliverable

Fill the template at `assets/deliverable-template.md` exactly.

## Quality Bar

- Only extract publicly visible or legitimately accessible data.
- Note masked, unavailable, or paywalled fields.
- Deduplicate leads.
- Do not bypass CAPTCHAs or access controls.

On rate limits, credit exhaustion, expired auth, or partial scrape failures, follow the Failure Handling section in [firecrawl-workflows](../firecrawl-workflows/SKILL.md).
