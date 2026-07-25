---
name: hyperframes-cli
description: HyperFrames CLI dev loop — `npx hyperframes` for scaffolding (init), website capture (capture), validation (lint, inspect), preview, visual QA snapshots (snapshot), render, publishing (publish), and environment troubleshooting (doctor, browser, info, upgrade). Use when running any of these commands or troubleshooting the HyperFrames build/render environment. For asset preprocessing commands (`tts`, `transcribe`, `remove-background`), invoke the `hyperframes-media` skill instead.
---

# HyperFrames CLI

Everything runs through `npx hyperframes`. Requires Node.js >= 22 and FFmpeg.

## Workflow

1. **Scaffold** — `npx hyperframes init my-video` (or **Capture** a website first — `npx hyperframes capture <URL>`)
2. **Write** — author HTML composition (see the `hyperframes` skill)
3. **Lint** — `npx hyperframes lint`
4. **Visual inspect** — `npx hyperframes inspect`
5. **Snapshot** — `npx hyperframes snapshot` (PNG key frames for visual QA)
6. **Preview** — `npx hyperframes preview`
7. **Render** — `npx hyperframes render` (or **Publish** — `npx hyperframes publish` for a shareable URL)

Lint and inspect before preview. `lint` catches missing `data-composition-id`, overlapping tracks, and unregistered timelines. `inspect` opens the rendered composition in headless Chrome, seeks through the timeline, and reports text spilling out of bubbles/containers or off the canvas.

## Scaffolding

```bash
npx hyperframes init my-video                        # interactive wizard
npx hyperframes init my-video --example warm-grain   # pick an example
npx hyperframes init my-video --video clip.mp4        # with video file
npx hyperframes init my-video --audio track.mp3       # with audio file
npx hyperframes init my-video --example blank --tailwind # with Tailwind v4 browser runtime
npx hyperframes init my-video --non-interactive       # skip prompts (CI/agents)
```

Templates: `blank`, `warm-grain`, `play-mode`, `swiss-grid`, `vignelli`, `decision-tree`, `kinetic-type`, `product-promo`, `nyt-graph`.

`init` creates the right file structure, copies media, transcribes audio with Whisper, and installs AI coding skills. Use it instead of creating files by hand.

When using `--tailwind`, invoke the `tailwind` skill before editing classes or theme tokens. The scaffold uses Tailwind v4.2 via the browser runtime, not Studio's Tailwind v3 setup.

## Website Capture

Capture a website as editable HyperFrames components — screenshots, assets, SVGs, fonts, extracted design tokens. This is Step 0 of the `website-to-hyperframes` skill.

```bash
npx hyperframes capture <URL>                             # into ./capture (then ./capture-2, ...)
npx hyperframes capture <URL> -o <project-dir>/capture    # explicit output directory
npx hyperframes capture <URL> --json                      # machine-readable output for agents
npx hyperframes capture <URL> --skip-assets               # skip downloading images/SVGs
npx hyperframes capture <URL> --max-screenshots 40        # default 24
npx hyperframes capture <URL> --timeout 180000            # page-load timeout ms (default 120000)
```

Video-download mode (reads a prior capture's `video-manifest.json`; URL omitted):

```bash
npx hyperframes capture --video <capture-dir> --list        # list manifest entries
npx hyperframes capture --video <capture-dir> --index 0     # download entry by index
npx hyperframes capture --video <capture-dir> --video-url <url>  # download exact manifest URL
```

No API key required. If `GEMINI_API_KEY` is set (`.env` in the project root), captured images get AI vision descriptions instead of DOM-context-only descriptions — worth recommending to the user before a capture that feeds a video build.

## Linting

```bash
npx hyperframes lint                  # current directory
npx hyperframes lint ./my-project     # specific project
npx hyperframes lint --verbose        # info-level findings
npx hyperframes lint --json           # machine-readable
```

Lints `index.html` and all files in `compositions/`. Reports errors (must fix), warnings (should fix), and info (with `--verbose`).

## Visual Inspect

```bash
npx hyperframes inspect                 # inspect rendered layout over the timeline
npx hyperframes inspect ./my-project    # specific project
npx hyperframes inspect --json          # agent-readable findings
npx hyperframes inspect --samples 15    # denser timeline sweep
npx hyperframes inspect --at 1.5,4,7.25 # explicit hero-frame timestamps
```

Use this after `lint` and `validate`, especially for compositions with speech bubbles, cards, captions, or tight typography. It reports:

- Text extending outside the nearest visual container or bubble
- Text clipped by its own fixed-width/fixed-height box
- Text extending outside the composition canvas
- Children escaping clipping containers

Errors should be fixed before rendering. Warnings are surfaced for agent review; add `--strict` to fail on warnings too. Repeated static issues are collapsed by default so JSON output stays compact for LLM context windows. If overflow is intentional for an entrance/exit animation, mark the element or ancestor with `data-layout-allow-overflow`. If a decorative element should never be audited, mark it with `data-layout-ignore`.

`npx hyperframes layout` remains available as a compatibility alias for the same visual inspection pass.

## Snapshots

Capture key frames as PNG screenshots for visual verification — the standard way to review what a composition actually looks like without rendering a full video.

```bash
npx hyperframes snapshot                       # 5 evenly-spaced frames into <project>/snapshots
npx hyperframes snapshot ./my-project          # specific project
npx hyperframes snapshot --frames 12           # denser sweep (default 5)
npx hyperframes snapshot --at 1.0,3.0,5.0,7.0  # exact timestamps in seconds
npx hyperframes snapshot -o ./qa-shots         # custom output directory
```

| Flag           | Default                | Notes                                                                                                     |
| -------------- | ---------------------- | --------------------------------------------------------------------------------------------------------- |
| `-o, --output` | `<project>/snapshots`  | Directory to write PNGs into                                                                               |
| `--frames`     | 5                      | Number of evenly-spaced frames                                                                             |
| `--at`         | —                      | Comma-separated timestamps in seconds (overrides even spacing)                                             |
| `--end`        | on                     | Always include a readable end-of-timeline frame; `--no-end` captures only your exact `--at` times          |
| `--zoom`       | —                      | Zoom into a CSS selector or pixel region `x,y,w,h` (high-density crop; a selector matching nothing errors) |
| `--zoom-scale` | 3                      | Device-scale-factor density for `--zoom` crops                                                             |
| `--angle`      | —                      | Orthogonal 3D camera for depth checks: preset (`front`\|`iso`\|`top`\|`side`) or `yaw,pitch` degrees        |
| `--describe`   | auto                   | Gemini vision frame analysis — runs by default when `GEMINI_API_KEY` is set; pass a custom question, or `--describe false` to opt out |
| `--timeout`    | 5000                   | Ms to wait for runtime init                                                                                |

Read the PNGs after capturing — snapshots only help if you actually look at them. Scale the count to video length (the `website-to-hyperframes` skill uses `max(beats × 3, ceil(duration_seconds / 2))`).

## Previewing

```bash
npx hyperframes preview                   # serve current directory
npx hyperframes preview --port 4567       # custom port (default 3002)
```

Hot-reloads on file changes. Opens the studio in your browser automatically.

When handing a project back to the user, use the Studio project URL, not the
source `index.html` path:

```text
http://localhost:<port>/#project/<project-name>
```

Use the actual port from the preview output and the project directory name. For
example, after `npx hyperframes preview --port 3017` in `codex-openai-video`,
report `http://localhost:3017/#project/codex-openai-video`.

Treat `index.html` as source-code context only. It is fine to link it as an
implementation file, but do not label it as the project or preview surface.

## Rendering

```bash
npx hyperframes render                                # standard MP4
npx hyperframes render --output final.mp4             # named output
npx hyperframes render --quality draft                # fast iteration
npx hyperframes render --fps 60 --quality high        # final delivery
npx hyperframes render --format webm                  # transparent WebM
npx hyperframes render --docker                       # byte-identical
```

| Flag                 | Options               | Default                    | Notes                                                              |
| -------------------- | --------------------- | -------------------------- | ------------------------------------------------------------------ |
| `--output`           | path                  | renders/name_timestamp.mp4 | Output path                                                        |
| `--fps`              | 24, 30, 60            | 30                         | 60fps doubles render time                                          |
| `--quality`          | draft, standard, high | standard                   | draft for iterating                                                |
| `--format`           | mp4, webm             | mp4                        | WebM supports transparency                                         |
| `--workers`          | 1-8 or auto           | auto                       | Each spawns Chrome                                                 |
| `--docker`           | flag                  | off                        | Reproducible output                                                |
| `--gpu`              | flag                  | off                        | GPU-accelerated encoding                                           |
| `--strict`           | flag                  | off                        | Fail on lint errors                                                |
| `--strict-all`       | flag                  | off                        | Fail on errors AND warnings                                        |
| `--variables`        | JSON object           | —                          | Override variable values declared in `data-composition-variables`  |
| `--variables-file`   | path                  | —                          | JSON file with variable values (alternative to `--variables`)      |
| `--strict-variables` | flag                  | off                        | Fail render on undeclared keys or type mismatches in `--variables` |

**Quality guidance:** `draft` while iterating, `standard` for review, `high` for final delivery.

**Parametrized renders:** the composition declares its variables on the `<html>` root with **`data-composition-variables`** — a JSON **array of declarations** (`{id, type, label, default}` per entry) that defines the schema. Scripts inside read the resolved values via `window.__hyperframes.getVariables()`. The CLI **`--variables '{"title":"Q4 Report"}'`** is a JSON **object keyed by id** that overrides those declared defaults for one render; missing keys fall through, so the same composition runs unchanged in dev preview and in production. (Sub-comp hosts can also override per-instance with **`data-variable-values`** — same object shape, scoped to one mount of the sub-composition. See the `hyperframes` skill for the full pattern.)

## Publishing

Upload a project to hyperframes.dev and get a stable public URL — used to share work for review (e.g. registry-contribution PRs via the `contribute-catalog` skill).

```bash
npx hyperframes publish                        # upload current directory (asks to confirm)
npx hyperframes publish ./my-project -y        # skip the confirmation prompt
npx hyperframes publish --public               # make the claimed project public to anyone
npx hyperframes publish --update <url-or-id>   # update an existing published project in place
npx hyperframes publish --space <space-id>     # publish into a shared team space
```

## Asset Preprocessing

`npx hyperframes tts`, `transcribe`, and `remove-background` produce assets (narration audio, word-level transcripts, transparent video) that get dropped into a composition. Each downloads its own model on first run. For voice selection, whisper model rules (the `.en`-translates-non-English gotcha), output format choice (VP9 alpha WebM vs ProRes), and the TTS → transcribe → captions chain, invoke the `hyperframes-media` skill.

## Troubleshooting

```bash
npx hyperframes doctor       # check environment (Chrome, FFmpeg, Node, memory)
npx hyperframes browser      # manage bundled Chrome
npx hyperframes info         # version and environment details
npx hyperframes upgrade      # check for updates
```

Run `doctor` first if rendering fails. Common issues: missing FFmpeg, missing Chrome, low memory.

## Other

```bash
npx hyperframes compositions   # list compositions in project
npx hyperframes docs           # open documentation
npx hyperframes benchmark .    # benchmark render performance
```
