---
name: starter-design-tokens
description: >
  Build a design tokens file with your brand colors, fonts, and visual style.
  Triggers on: "design tokens", "brand colors", "brand fonts", "visual
  identity", "set up my brand look", "how things look".
  Produces brand_context/design-tokens.md.
argument-hint: "[website URL]"
---

# Design Tokens Builder

Capture your visual identity so Claude creates on-brand slides, images, and assets.

## Outcome

`brand_context/design-tokens.md` — your colors, fonts, logo info, and visual style.

## Before You Start

Check if `brand_context/design-tokens.md` already has content beyond template comments.
- If yes → show a summary and ask what to change.
- If no → proceed to Step 1.

## Step 1 — Website or Manual

Ask using AskUserQuestion:

> "Do you have a website I can pull your brand colors and fonts from?"
>
> - **Yes** — I'll give you the URL
> - **No** — I'll describe my brand manually

**If yes:** Ask for the URL. Use WebFetch to load the homepage. Extract:
- Colors: CSS custom properties, meta theme-color, dominant colors in the design
- Fonts: font-family declarations, Google Fonts links, @font-face rules
- Visual style: spacing, border-radius, shadow usage, overall aesthetic

Show what you found and ask: "Here's what I pulled from your site — does this look right? Anything to add or correct?"

Skip to any questions not answered by the extraction (typically visual style preferences and logo info).

**If no:** Proceed to Step 2, all questions.

## Step 2 — Four Questions

Ask relevant questions one at a time using AskUserQuestion. Skip any already answered by website extraction.

1. "What are your brand colors? If you know hex codes, share them. Otherwise just describe them — 'navy blue and gold' works. I need at minimum: a primary color and whether your background is light or dark."

2. "What fonts do you use? Exact names if you know them, or describe the feel — 'clean sans-serif' or 'modern with personality' is enough."

3. "Describe your visual style in a few words. Examples: 'clean and minimal', 'bold and colorful', 'dark and techy', 'warm and friendly'. What should things look like when they're yours?"

4. "Where are your logo files? Any rules about how the logo should be used — preferred formats, sizes, backgrounds it works on?"

## Step 3 — Synthesize and Fill

From the website extraction and/or answers, build four sections:

**Colours** — list each color with its role (primary, secondary, accent, background, text) and hex codes. If they only gave descriptions ("navy blue"), suggest a specific hex and confirm before writing.

**Fonts** — heading font, body font, and any others. Include weights and sizes if extracted from the website. If they only described the feel, suggest specific Google Fonts that match and confirm.

**Logo & Assets** — where to find logo files, preferred formats, any usage rules they mentioned. Keep this practical.

**Visual Style** — synthesize their description into guidance Claude can follow when creating slides and images. Include: corner style (rounded/sharp), spacing feel (tight/airy), color usage (minimal accent/bold saturated), photography or illustration preferences.

## Step 4 — Write the File

Write `brand_context/design-tokens.md`:

```markdown
# Design Tokens

## Colours
{color table or list with roles and hex codes}

## Fonts
{font specifications}

## Logo & Assets
{logo locations and usage rules}

## Visual Style
{visual preferences and guidelines}
```

Show the user the filled file. Ask: "Does this capture your brand look? Anything to adjust?"

Adjust if needed, then save.

## Rules

- Ask questions ONE AT A TIME. Never batch them.
- When suggesting hex codes or fonts, always confirm with the user before writing.
- If WebFetch fails on their URL, fall back to asking all four questions manually. Never block on a failed fetch.
- Keep the output practical and concise. This is a reference file, not a full design system.
- Create `brand_context/` directory if it doesn't exist.

## Evidence Gate

Before saving, verify every extracted color, font, logo path, and visual-style claim against either the source site/assets or an explicit user answer. Require valid hex syntax, existing local asset paths, and loadable font names when those can be tested. Calculate contrast for any foreground/background pair presented as usable text colors.

Report `PASS` when every token has a source and all mechanical checks succeed. Report `FAIL` for invented tokens, missing assets presented as available, invalid color values, or inaccessible recommended text pairs. Label manually described, untested tokens `DEGRADED: user-specified, not source-verified`.
