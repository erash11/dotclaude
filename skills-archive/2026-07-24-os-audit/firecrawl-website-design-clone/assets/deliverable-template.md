# DESIGN.md: [Source Site]

## Source
- URL: [source URL]
- Capture date: [date]
- Evidence: [scrape/screenshot/html/links used]

## Reference Screenshot
![Full-page screenshot of [Source Site]](./.firecrawl/[source]-screenshot.png)

Use this screenshot as the visual source of truth for layout, hierarchy, density, and feel. Tokens below describe the same page in machine-readable form.

## Design Summary
[Short description of the visual language and what an agent should recreate]

## Design Tokens

### Colors
[Named color roles with hex values when known; mark inferred values clearly]

### Typography
[Fonts, fallback recommendations, scale, weights, heading/body rules]

### Spacing And Layout
[Spacing scale, containers, grids, radius, shadows, borders]

## Components
[Buttons, cards, nav, forms, hero, feature sections, pricing, footer, etc.]

## Page Patterns
[Section order, common layouts, responsive behavior]

## Content Style
[Voice, CTA style, heading patterns, copy density]

## Agent Build Instructions
[Concrete instructions an AI coding agent can follow to create a new site in this style]

## Rerun Inputs
workflow: firecrawl-website-design-clone
source_url: [url]
target_stack: [stack]
output: DESIGN.md
