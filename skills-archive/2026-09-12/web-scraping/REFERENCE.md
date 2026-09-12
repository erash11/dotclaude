# Web Scraping — Advanced Reference

Parameters beyond what the scripts expose. For these, call the APIs directly (PowerShell `Invoke-RestMethod` or extend the scripts). Keys load the same way: env var or `.env` in this folder.

## Exa API (`https://api.exa.ai`, header `x-api-key`)

### POST /search — extra body fields
- `category`: `"research paper" | "news" | "company" | "pdf" | "github" | "tweet" | "personal site" | "linkedin profile" | "financial report"`
- `startPublishedDate` / `endPublishedDate` / `startCrawlDate` / `endCrawlDate`: ISO 8601
- `includeText` / `excludeText`: `["phrase"]` — one string, max 5 words; must (not) appear in page text
- `contents.text`: `{ "maxCharacters": 8000, "includeHtmlTags": false }`
- `contents.highlights`: `{ "maxCharacters": 2000, "numSentences": 5, "highlightsPerUrl": 3, "query": "refine highlight focus" }`
- `contents.summary`: `{ "query": "what to summarize" }` — LLM summary per result
- `contents.livecrawl`: `"never" | "fallback" | "preferred" | "always"` — force fresh crawl vs index cache
- Query phrasing matters for neural search: phrase as a link-sharing statement ("Here is an excellent guide to X:") rather than a question

### POST /findSimilar
Body: `{ "url": "https://...", "numResults": 5, "contents": {...} }` — pages semantically similar to a given URL. Same contents options as /search.

### POST /contents
Body: `{ "urls": ["https://..."], "text": true }` — fetch Exa-indexed content for known URLs (cheaper than Firecrawl when the page is static and indexed).

### POST /answer
Body: `{ "query": "question", "text": true }` — direct answer with citations (Exa runs search + synthesis).

## Firecrawl API (`https://api.firecrawl.dev/v2`, header `Authorization: Bearer fc-...`)

### POST /scrape — extra body fields
- `formats`: strings or typed objects, e.g. `{"type": "json", "prompt": "Extract plan names and prices"}` (structured extraction), `{"type": "screenshot", "fullPage": true}`
- `actions`: pre-scrape interactions for pages needing clicks/scrolls:
  ```json
  [{"type": "click", "selector": "#accept"},
   {"type": "wait", "milliseconds": 750},
   {"type": "scroll", "direction": "down"},
   {"type": "write", "text": "query"}, {"type": "press", "key": "Enter"},
   {"type": "scrape"}]
  ```
- `location`: `{"country": "US", "languages": ["en-US"]}`
- `parsers`: `[{"type": "pdf", "maxPages": 5}]` — PDF parsing
- `blockAds`, `removeBase64Images` (booleans), `proxy: "auto"` (anti-bot sites), `maxAge` (ms; accept cached result up to this age — much cheaper/faster)

### POST /crawl — whole-site crawl (async)
Body: `{ "url": "https://docs.site.com", "limit": 50, "scrapeOptions": {"formats": ["markdown"]} }`
Returns a job `id`; poll `GET /v2/crawl/{id}` until `status: "completed"`. Each page appears in `data[]` with markdown + metadata. Use `includePaths`/`excludePaths` (regex arrays) to scope. **Warn the user before crawling — cost scales with page count.**

### POST /map — fast URL discovery
Body: `{ "url": "https://site.com", "search": "optional keyword" }` — returns the site's URLs without scraping. Cheap way to scope before a crawl.

### POST /search — Firecrawl's own web search
Body: `{ "query": "...", "limit": 5, "scrapeOptions": {"formats": ["markdown"]} }` — keyword search + scrape in one call. Prefer Exa for semantic/discovery queries; this is useful when you want full markdown of search hits in one shot.

## Cost notes
- Exa: per-search pricing; `contents.text` costs more than bare results.
- Firecrawl: credit per page scraped; crawls multiply fast; `maxAge` cache hits are discounted.
- Order of preference for a known URL: WebFetch (free) → Exa /contents (cheap, static) → Firecrawl /scrape (renders JS, most reliable).
