---
name: starter-icp-positioning
version: 1.0.0
description: >
  Build your ICP and positioning in one pass — who it's for, what you stand
  for, and what you're against. Triggers on: "ICP", "ideal customer",
  "positioning", "who is my customer", "target audience", "what do I stand for".
  Produces brand_context/icp.md.
---

# ICP & Positioning Builder

Define who you're for, what you stand for, and what you're against — so every piece of content lands with the right person.

## Outcome

`brand_context/icp.md` — your audience, your angle, and your anti-stance in one file.

## Before You Start

Check if `brand_context/icp.md` already has content beyond template comments.
- If yes → show a summary and ask what to change.
- If no → proceed to Step 1.

## Step 1 — Positioning Questions

Ask these one at a time using AskUserQuestion. These come first because your stance shapes how you talk about your audience.

1. "What do you believe about your industry that most people in your space wouldn't say out loud?"

2. "What are you against? What frustrates you about how things are typically done in your space — the approaches, the advice, the status quo?"

3. "In one sentence, what's different about how you think or what you do compared to everyone else?"

## Step 2 — ICP Questions

Continue one at a time.

4. "Who is your best customer? Not your most common — your best. The one who gets the most value, stays longest, refers others. Describe them as specifically as you can."

5. "What specific problem drives them to find you? Not the surface version — what's it actually costing them in their day-to-day?"

6. "What have they already tried that didn't work? And why did those things fail them?"

7. "How would they describe this problem to a friend over drinks? Not professional language — the casual, frustrated version. Their actual words."

Q7 is the most important question. The language your customer actually uses is the language that resonates in content. Push for specifics here.

## Step 3 — Synthesize and Fill

From the seven answers, build five sections:

**What You Stand For** — from Q1 + Q3. The core belief that drives everything. Not a mission statement — the real conviction. Then the one-sentence differentiator (Q3). Write this sharp and specific, not corporate.

**What You're Against** — from Q2. The industry BS, the broken approaches, the things you reject. This is the anti-stance that gives content its edge. Be direct — the reader should immediately know what camp you're NOT in.

**Who It's For** — from Q4 + Q5. A specific description of the person: their situation, identity, stage, and the problem that defines them right now. Frame it from the customer's perspective, not the founder's marketing angle.

**What They Care About** — from Q5 + Q7. Their goals and pain points, written in their language (Q7). Quote their actual phrases wherever possible.

**What They Don't Respond To** — derived from Q2 + Q6. Combine two sources: your anti-stance (Q2) tells you what messaging you'd never use. Their failed alternatives (Q6) tell you what promises they've already been burned by. Each failed alternative maps to an angle that won't land.

## Step 4 — Write the File

Write `brand_context/icp.md`:

```markdown
# Ideal Customer Profile

## What You Stand For
{core belief + one-sentence differentiator}

## What You're Against
{anti-stance — the approaches, advice, and status quo you reject}

## Who It's For
{specific audience — situation, identity, defining problem}

## What They Care About
{goals, pain points, and the language they actually use}

## What They Don't Respond To
{approaches and phrases that fall flat — from your anti-stance + their failed alternatives}
```

Show the user the filled file. Ask: "Does this feel pointed enough? Would your ideal customer read this and feel like you get them — and would your competitors feel called out?"

Adjust if needed, then save.

## Rules

- Ask questions ONE AT A TIME. Never batch them.
- Positioning first, then ICP. The stance shapes the audience framing.
- Use the customer's language in "What They Care About", not the founder's marketing language. Q7 exists for this reason.
- Keep each section 80-150 words. Sharp and specific beats comprehensive.
- The "What You're Against" section should have teeth. Vague anti-stances ("we don't believe in bad service") are useless. Push for the specific broken approaches, bad advice, or industry norms they reject.
- Create `brand_context/` directory if it doesn't exist.
