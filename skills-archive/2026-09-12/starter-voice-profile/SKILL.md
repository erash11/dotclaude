---
name: starter-voice-profile
description: >
  Build a voice profile from real writing examples so Claude writes like you.
  Triggers on: "voice profile", "brand voice", "set up my voice", "how should
  I sound", "make Claude sound like me".
  Example-driven: user pastes writing, connects Gmail, or shares a URL.
  Produces brand_context/voice-profile.md.
---

# Voice Profile Builder

Build a voice profile so Claude writes like you, not like a robot.

## Outcome

`brand_context/voice-profile.md` — your voice, extracted from real writing.

## Before You Start

Check if `brand_context/voice-profile.md` already has content beyond template comments.
- If yes → show a summary and ask what to change.
- If no → proceed to Step 1.

## Step 1 — Get Writing Examples

Ask using AskUserQuestion:

> "I need examples of your real writing to extract your voice. How do you want to provide them?"
>
> - **Paste** — I'll paste examples (LinkedIn posts, blog posts, emails, social posts)
> - **Gmail** — Connect to my Gmail and pull my recent sent emails
> - **Link** — Here's a URL to my blog, LinkedIn, or website

**If paste:** Ask them to paste 3-5 pieces of their best writing. The more variety (different platforms, different topics), the better the extraction.

**If Gmail:** Authenticate via `mcp__claude_ai_Gmail__authenticate` and `mcp__claude_ai_Gmail__complete_authentication`. Fetch 10-15 recent sent emails. Extract the body text — skip auto-replies and one-liners.

**If link:** Use WebFetch to pull content from their URL. Extract blog posts, about page copy, or any substantial writing. If the page doesn't have enough text, ask them to paste examples instead.

Minimum: 3 examples or ~500 words of writing. If they provide less, ask for more — accuracy depends on volume.

## Step 2 — Extract Voice Patterns

Analyze all provided writing across six dimensions:

1. **Tone** — where do they land on formal↔casual, serious↔playful, reserved↔bold?
2. **Sentence patterns** — short punchy sentences? Long flowing ones? Fragments? How do they open and close?
3. **Connectors and transitions** — how do they stitch ideas together? ("So," "And," "But," "Here's the thing...")
4. **Signature expressions** — recurring phrases, intensifiers, verbal habits they may not even notice
5. **Vocabulary** — jargon level, preferred words, words they clearly avoid
6. **POV and address** — I/we/you usage, how they relate to the reader (teacher, peer, insider, authority)

## Step 3 — Confirm With Samples

Write 2-3 short sentences in their extracted voice on a generic topic (e.g. introducing a new tool, explaining a concept, responding to a question).

Show them and ask: "Does this sound like you? What's off?"

- If it sounds right → proceed to Step 4
- If something's off → ask what specifically feels wrong, adjust the extraction, and retest once

## Step 4 — Write the File

Write `brand_context/voice-profile.md`:

```markdown
# Voice Profile

## How You Sound
{100-200 words synthesizing their voice: tone, energy, sentence patterns, connectors, signature phrases, vocabulary preferences and avoidances, POV style. Write this as a brief to a ghostwriter — specific enough that someone could write a paragraph in this voice without asking more questions.}

## Examples
{2-3 direct quotes from their actual writing that best represent their voice. Each with a one-line note on why it's representative.}
```

Show the user the filled file. Ask: "Does this capture how you sound? Anything to adjust?"

Adjust if needed, then save.

## Rules

- This skill is example-driven. Always try to get real writing before falling back to questions.
- If all three paths fail (paste empty, Gmail auth fails, URL has no content) — fall back to asking 5 quick questions: personality words, who they admire, signature phrases, words they hate, formal vs casual level. But real writing always produces better results.
- Keep "How You Sound" to 100-200 words. Specific and actionable beats comprehensive.
- Keep "Examples" to 2-3 quotes. Quality over quantity.
- Create `brand_context/` directory if it doesn't exist.

## Evidence Gate

Support every one of the six voice dimensions with at least one quotation or observable pattern from the writing corpus. Hold out one example from extraction, generate a short sample from the profile, and compare the sample with the holdout across all six dimensions.

Report `PASS` when at least five of six dimensions match and the user confirms the sample is representative. Report `FAIL` when the profile invents phrases or traits not present in the corpus. When the profile is built only from questionnaire answers, label it `DEGRADED: preference-derived, not writing-verified`.
