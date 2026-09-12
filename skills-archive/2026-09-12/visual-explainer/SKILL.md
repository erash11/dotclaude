---
name: visual-explainer
description: >
  Generate a beautiful, self-contained HTML page that visually explains any system, concept, plan,
  or data. Use this skill when the user says "explain this visually", "visual explainer",
  "make a diagram page", "interactive explanation", "visualize this", "explain this to my team",
  "architecture overview", "how does this work visually", or wants any concept turned into a
  styled, interactive HTML page they can open in a browser.
argument-hint: "[concept or file to explain]"
---

# Visual Explainer

You generate beautiful, self-contained HTML pages that visually explain complex concepts, systems, plans, or data. These aren't simple text explanations — they're interactive, styled pages with diagrams, cards, sections, and visual hierarchy that make complex ideas immediately understandable.

## When to Use This

- Explaining a system architecture or how tools connect
- Breaking down a business process or workflow
- Visualizing a plan, strategy, or proposal
- Creating a dashboard-style overview of data
- Making a concept understandable for a non-technical audience
- Any time "let me draw this out" would help

## Process

### Step 1: Understand What Needs Explaining
- What is the concept, system, or process?
- Who is the audience? (technical team, non-technical stakeholders, clients)
- What level of detail? (high-level overview vs. detailed breakdown)
- Any specific aspects to emphasize?

### Step 2: Choose Visual Components

Pick the right components for the content:

| Component | Best For |
|-----------|----------|
| **Flow diagram** | Processes, pipelines, step-by-step workflows |
| **Card grid** | Features, categories, team members, tools |
| **Comparison table** | Before/after, options, alternatives |
| **Timeline** | History, roadmaps, project phases |
| **Hierarchy/tree** | Org charts, system layers, taxonomies |
| **Stats dashboard** | KPIs, metrics, data summaries |
| **Annotated diagram** | System architecture, how things connect |
| **Accordion sections** | Detailed breakdowns that can expand/collapse |

### Step 3: Build the Page

Generate a single self-contained HTML file with all CSS and JS inline.

**Design Principles:**
- Dark background (#0a0a0a) with light text for a modern, premium feel
- Clear visual hierarchy — the most important information stands out
- Color-coded sections to group related concepts
- Adequate whitespace — nothing cramped
- Responsive — works on desktop and tablet
- Interactive where it helps (hover states, expandable sections, click-to-highlight)

**Typography:**
- System font stack: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif
- Headlines: 32-48px, weight 700
- Body: 16-18px, weight 400
- Labels: 12-14px, weight 600, uppercase letter-spacing

**Color Palette:**
- Primary: #f5f5f7 (text)
- Secondary: #86868b (muted text)
- Accent: #DA7756 (highlights, active states)
- Cards: rgba(255,255,255,0.04) with subtle borders
- Use color to create zones — different sections get different accent colors

### Step 4: Save and Open

Save the HTML file and open it in the browser for review.

## Output Structure

A typical visual explainer page includes:
1. **Title section** — what this explains, one-line subtitle
2. **Overview** — high-level summary or key stat
3. **Main visual** — the core diagram, flow, or visualization
4. **Detail sections** — deeper breakdowns of each component
5. **Summary or takeaway** — what the viewer should remember

## Rules

- Self-contained. One HTML file. No external dependencies.
- Every section must have a visual component — never just blocks of text.
- The page should be understandable in 30 seconds at a glance, with detail available for those who want to dig deeper.
- Works in any modern browser. No framework dependencies.
- Mobile-friendly is a bonus but desktop is the priority.
- If the concept has more than 7 components, group them into categories first. Don't overwhelm with too many elements at once.
- Use real, specific language. "The API processes 10,000 requests/second" is better than "The API is fast."

## Verification Gate

Borrow `impeccable` for measurable frontend checks. Before delivery:

1. Open the page in a browser and require zero console errors and zero failed local-resource loads.
2. Inspect at 1440x900 and 768x1024. Also inspect 375x667 when mobile support is requested or claimed. Reject horizontal scrolling, clipped content, unintended overlap, unreachable controls, or text below a readable size.
3. Verify keyboard access, visible focus, reduced-motion behavior when animation exists, and WCAG contrast (4.5:1 body text, 3:1 large text and UI).
4. Map every requested concept and relationship to a visible section. Verify material facts and numbers with `fact-checker` or authoritative source evidence.

Report `PASS` only when all applicable checks succeed. Report `FAIL` with blocking defects. Report `DEGRADED` when browser or source verification is unavailable, naming each unverified check.
