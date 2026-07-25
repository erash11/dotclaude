---
name: firecrawl-knowledge-ingest
description: Ingest public or authenticated knowledge bases and docs portals with Firecrawl browser. Use for JS-heavy docs, login-gated portals, paginated help centers, support knowledge bases, or structured JSON/markdown extraction from documentation sites.
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

# Firecrawl Knowledge Ingest

Use this when a docs portal needs browser navigation, auth, pagination, or JS rendering.

## Onboarding Interview

Infer the portal URL, output format, auth needs, and page limit from context. If the portal is clear, proceed immediately.

Ask at most 1-3 concise questions only if blocked, such as the portal URL, whether authentication is required, or the desired output format.

## Firecrawl Collection Plan

Use Firecrawl browser to:

- open the portal and inspect navigation
- identify sections, categories, sidebar links, and article URLs
- follow sidebar navigation, next links, pagination, load-more controls, or search
- scrape article content as markdown
- extract metadata such as title, section, last updated date, author, and tags

Try Firecrawl map as a supplement for public URLs, but use browser navigation for auth-gated or JS-heavy content.

## Final Deliverable

Fill the template at `assets/deliverable-template.md` exactly.

## JSON Shape

Use `source`, `url`, `extractedAt`, `totalArticles`, and `sections[]` with article `title`, `url`, `section`, `content`, and `metadata`. A machine-readable schema is at `assets/output-schema.json`.

## Quality Bar

- Preserve code examples, tables, and formatting.
- Strip nav chrome, headers, and footers.
- Track extraction progress and page failures.
- Respect authentication boundaries.

On rate limits, credit exhaustion, expired auth, or partial scrape failures, follow the Failure Handling section in [firecrawl-workflows](../firecrawl-workflows/SKILL.md).
