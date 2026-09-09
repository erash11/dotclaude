---
name: personal-site-build-routes
description: "Eric's personal site is an Artifact with hard constraints — what that forbids, why scroll-craft cannot run on it, and where the standalone build lives instead"
metadata: 
  node_type: memory
  type: project
  originSessionId: a6dfb3da-c339-44b1-a836-2a6884e07ea6
  modified: 2026-09-02T23:05:38.332Z
---

Two separate things, both under `~/DEV/Website/` (which **is** a git repo,
remote `erash11/AppliedPerformance-Site`, though `personal/` is deliberately
untracked):

**1. The live site — `~/DEV/Website/personal/index.html`.** Published as a Claude
Artifact; republish with the stored `url` to keep the link. Current brief is
`BRIEF-V3.md` ("Night Field", dark-first, Texas, kitsch ban) — V1 and V2 are
superseded, so quote V3. Its hard rules: one Google Fonts link and **no other
external resource**, no libraries, no fetch, Canvas 2D and inline SVG only,
nothing readable parked at `opacity: 0`, `prefers-reduced-motion` fully usable.

**These constraints structurally forbid scroll-craft**, which needs an engine
JS/CSS pair on disk, external video, and scroll-assembled text. It is not a
tuning problem; the two cannot both be satisfied. Anything premium wanted on the
Artifact has to be hand-built inline: layering via transforms, stacking cards,
counting numbers.

**2. The standalone build — `~/DEV/Website/scrollcraft/builds/eric-rash/`.**
Eric's chosen answer (2026-09-02). A real scroll-craft build, split-stage
grammar, no video, all visuals code-drawn. Serve it:

```bash
cd ~/DEV/Website/scrollcraft/builds/eric-rash
node ~/.agents/skills/scroll-craft/scripts/serve.mjs --root . --port 4500
```

Not hosted, and it does not touch the Artifact. `lab/` holds a few hundred
verification PNGs and is gitignored; it reached 339MB in one session, so never
stage it.

**Before critiquing his site, read it.** It already leads with the problem
("Most performance problems are not data problems. They are question problems.")
and already has a scroll-driven jump-trace scrub. Assuming otherwise produced a
wrong claim that had to be retracted.

Redesign notes live in `~/DEV/Website/personal/DESIGN-IDEAS.md`.
Related: [[vendored-skill-install]], [[dev-layout-and-discovery]].

- **Cowork install route (2026-09-02):** Claude Code and Codex load scroll-craft directly. Cowork cannot; it needs the skill uploaded as a zip from `~/Downloads`.
