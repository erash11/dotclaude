# OS Audit — 2026-07-24 — `~/.claude`

Scope: `C:\Users\eric_rash\.claude` — the harness layer. 106 skill dirs, 4 nested git repos, 5 scheduled tasks, ~1.4 GB.
Companion to `KeystoneOS/audits/os-audit-2026-07-24.md`, which covered the control plane. This one covers the expertise layer: the config that loads into **every session on this machine**.

**Knowledge current through: 2026-07-24** — daily logs, transcripts, and `MEMORY.md` are all current. Nothing here is stale.

| Check | Verdict | Worst finding |
|---|---|---|
| Routing integrity | **GREEN**  | all 12 `CLAUDE.md` routing targets resolve |
| Index truth       | **GREEN**  | no index/disk divergence found |
| Freshness         | **GREEN**  | one StackDoctor termination on 7/20, reproduced clean since |
| Bloat/duplication | **RED**    | **~10,700 tokens of skill descriptions preloaded every session**; 31 firecrawl skills are 26% of it |
| Hygiene           | **GREEN**  | no tracked secrets; whitelist `.gitignore` is correctly built and documents its own exclusions |
| Context placement | **YELLOW** | `USER.md` at 98.9% of cap, `MEMORY.md` at 99.8% — both effectively full |

## Failure-mode exposure

| Mode | Exposure | Driven by |
|---|---|---|
| Poisoning (false)            | **LOW**  | nothing stale found; the one stale claim (memsearch broken) was fixed hours before this audit |
| Bloat (too much)             | **HIGH** | 10.7K tokens/session of skill descriptions; 213 MB of unswept `jobs/`; memory files at cap |
| Confusion (wrong or missing) | **MED**  | `watch` resolves two ways; 31 near-identical firecrawl descriptions compete for the same routing decision |
| Clash (contradictory)        | **LOW**  | `watch` duplicated between local skills and the `claude-video` plugin |

**This is a well-built layer.** Four of six checks are GREEN, and the two that aren't share one cause: it has grown, not drifted. That's a different disease from KeystoneOS's, and it takes a different fix — subtraction, not correction.

## What would make your agent wrong-answer you today

1. **You pay ~10,700 tokens of skill descriptions before you type anything.** 105 skills × 408 chars mean. That is context spent every single session on routing options, most of which are irrelevant to the session at hand. It doesn't produce a wrong answer directly — it produces a *worse* one, by crowding the window and giving the router 105 candidates to discriminate between.
2. **31 `firecrawl-*` skills consume 26.2% of that budget.** Their descriptions are near-identical in shape ("Use this skill when the user wants to…") and differ mainly in vertical: `firecrawl-lead-gen`, `firecrawl-shop`, `firecrawl-seo-audit`, `firecrawl-company-directories`, `firecrawl-market-research`. For a Director of Applied Performance, most of those verticals will never fire. This is Nate's segmentation argument (hack ④) applied to capabilities rather than knowledge: when one cluster grows to a third of a store, split it out or prune it.
3. **`watch` exists twice** — `~/.claude/skills/watch/` and `plugins/marketplaces/claude-video/skills/watch/`. Two definitions, one name; which wins depends on load order, not intent.
4. **`USER.md` is at 1,360 / 1,375 chars and `MEMORY.md` at 2,496 / 2,500.** Both are within 1% of the caps your own `CLAUDE.md` declares. The next memory write must consolidate before it can add — and a consolidation forced under pressure is where facts get dropped silently.

## Findings by check

### Check 1 — Routing integrity — GREEN

- All 12 paths referenced by `~/.claude/CLAUDE.md` resolve: `global-memory/{USER.md,MEMORY.md,transcripts/,.errors.log}`, `claude-memory-compiler/{,daily/}`, `skills/graphify/SKILL.md`, `projects/`, `RESTORE.md`, `scripts/daily-backup.ps1`, `settings.json`, `skills-archive/`. `[—]`
- The two-tier memory model described in `CLAUDE.md` matches what is on disk: Tier A per-project under `projects/<slug>/memory/`, Tier B global under `global-memory/`. No divergence. `[—]`

### Check 2 — Index truth — GREEN

- 105 of 106 skill dirs carry a valid `SKILL.md` with a non-empty `description`. The exception, `_shared/`, holds only `config.json` — a helper directory, not a skill, and correctly named to sort out of the way. Not a dead capability. `[—]`
- `skills-archive/` holds 2 archived skills (`FireFlies_to_Obsidian`, `pocock-local-2026-07-14`), consistent with the 7/13 audit's "3 removed" note. `[—]`

### Check 3 — Freshness — GREEN

| Feed | Newest | Cadence | Verdict |
|---|---|---|---|
| `claude-memory-compiler/daily/` | 2026-07-24 | per-session | **FRESH** (56 logs) |
| `global-memory/transcripts/` | 2026-07-24 | Stop hook | **FRESH** (50 files) |
| `global-memory/MEMORY.md` | 2026-07-23 | on write | **FRESH** |
| `global-memory/USER.md` | 2026-07-06 | on change | **FRESH** (durable by design) |
| `KeystoneOS-DailyBackup` | 2026-07-24 06:15, result 0 | daily | **FRESH** |
| `KeystoneOS-StackDoctor` | 2026-07-20, `0xC000013A` | weekly | **ON-DEMAND / one-off** — reproduced clean in 49s on 7/24; a terminated process, not a chronic failure |
| memsearch index | 1,558 chunks | nightly (new) | **FRESH** |

- **Correction to this morning's reading:** the `ETIMEDOUT` entries in `.errors.log` were real when the session snapshot was taken, but a fix landed at **18:59:55 today** (`01d410e` — nightly uncapped reindex moved to the 06:15 backup task with a 2h limit, hook alarm threshold raised to 6). The errors log was cleared at 18:57 and is now 0 bytes; `memsearch stats` returns 1,558 indexed chunks. **memsearch is not broken.** `[—]`
- All four nested repos are healthy with remotes: `skills` → `claude-skills` (clean, last commit today), `global-memory` → `claude-global-memory` (3 uncommitted, swept by the 06:15 task), `claude-memory-compiler` → fork (clean), `dotclaude` (clean). `[—]`

### Check 4 — Bloat, duplication, organization — RED

- **The per-session skill tax: 42,885 chars ≈ 10,700 tokens across 105 descriptions**, mean 408 chars. This is the single largest always-loaded cost in the system, and unlike KeystoneOS's routers (556 words total) it is well past where bloat bites. `[bloat]`

| Cluster | Skills | Chars | Share of tax |
|---|---|---|---|
| `firecrawl-*` | **31** | 11,241 | **26.2%** |
| `pp-*` | 7 | 2,886 | 6.7% |
| `hyperframes*` | 4 | 2,126 | 5.0% |
| `starter-*` | 3 | 797 | 1.9% |
| everything else | 60 | 25,835 | 60.2% |

- **The 12 heaviest descriptions run 637–977 chars each.** `process-interviewer` (977), `pbir-report-builder` (905), `remotion-to-hyperframes` (896), `impeccable` (895), `hyperframes` (826), `design-academy-skill` (791). A description's job is routing — deciding whether to load the skill. Anything past ~2 sentences of trigger conditions is body content in the wrong place, paid for on every call whether or not the skill fires. `[bloat]`
- **8 descriptions run 130–240 chars**, mostly `firecrawl-*`. Too thin to discriminate between 31 sibling skills — the opposite failure, and a routing risk. `[confusion]`
- `watch` is defined in both `~/.claude/skills/watch/` and `plugins/marketplaces/claude-video/skills/watch/`. `[clash]`
- **`jobs/` — 213 MB across 267 files**, background-session scratch, never swept. Not knowledge, but it lives inside the tree anything greps. `[bloat]`
- `plugins/` — 731 MB / 19,162 files. A cache, correctly ignored by git, but it dominates any broad filesystem search of `~/.claude`. Worth knowing before pointing a tool at this root. `[bloat]`

### Check 5 — Hygiene — GREEN

- **No tracked secrets.** `git ls-files` across `dotclaude` returns 98 files, none matching credential patterns. `[—]`
- **The whitelist `.gitignore` is the best-built artifact in either audit.** It ignores `/*` and re-includes only durable config, and it *documents its own exclusions in comments* — `.credentials.json`, `token-dashboard.db`, caches, session state, and nested repos. That last line is why `skills/` appears untracked in `dotclaude`: it is deliberately a separate repo with its own remote, not a backup gap. Verified. `[—]`
- No orphans, no 0-byte skills, no skill dirs with a misnamed file. `[—]`
- Cadence is real: 4 of 5 scheduled tasks returned 0 today. `[—]`

### Check 6 — Context placement — YELLOW

- **Both always-loaded memory files are at their caps:** `USER.md` 1,360/1,375 (98.9%), `MEMORY.md` 2,496/2,500 (99.8%). The caps are self-imposed and correct in principle — but at 99.8% the next write is a forced consolidation, and forced consolidations lose things quietly. Budget headroom, not a bigger budget. `[bloat]`
- `CLAUDE.md` (5,705 bytes) is well-placed expertise context: shell rules, tool paths, the memory tier model, the retrieval ladder. **No situational facts baked in** — no counters, no in-progress statuses, no dated claims. It states the retrieval *policy* and points at the stores rather than summarizing them. This is the pattern the KeystoneOS audit had to retrofit; here it was right from the start. `[—]`
- Skill descriptions are the expertise layer whether or not they are thought of that way. 105 of them are preloaded; their bodies are not. That split is correct — the problem is only that the preloaded half has grown to 10.7K tokens. `[bloat]`

## Questions for you

1. **Which firecrawl verticals do you actually use?** My read: `firecrawl-scrape`, `-search`, `-crawl`, `-map`, `-deep-research`, `-research-papers` plausibly serve sport-science research. `-lead-gen`, `-shop`, `-seo-audit`, `-company-directories`, `-competitive-intel`, `-market-research`, `-lead-research`, `-demo-walkthrough` look like they came with the pack. Archiving ~12 of them would recover roughly 4K chars/session at zero cost to you.
2. **`hyperframes` (4) + `remotion-to-hyperframes` + `website-to-hyperframes` + animation adapters (`gsap`, `animejs`, `lottie`, `waapi`, `three`, `typegpu`, `css-animations`, `tailwind`)** — is video/animation authoring live work, or an experiment that ended? That's ~11 skills.
3. **`watch`** — keep the local copy or the `claude-video` plugin version?
4. **`gsd-*` agents (23 of them)** are agent definitions rather than skills, so they don't hit the skill tax — but do you use the GSD workflow?

## Fix list (batched, await approval)

**Batch A — duplication and dead weight (highest value per unit of effort)**
- A1. Resolve the `watch` collision — archive one.
- A2. Archive the firecrawl verticals you confirm you don't use to `skills-archive/`. Reversible; `skills-archive` is tracked in `dotclaude`, so nothing is lost.
- A3. Same for the animation/hyperframes cluster if it's dormant.
- *Estimated recovery from A2+A3: 4,000–7,000 chars/session, i.e. 10–16% of the skill tax, with no loss of capability you use.*

**Batch B — description discipline**
- B1. Trim the 12 descriptions over 600 chars to trigger conditions only; move the explanatory content into the SKILL.md body, which loads on demand. Recovers ~4K chars with **zero** capability loss — this is pure relocation, the same expertise-vs-situational move the KeystoneOS audit made for facts.
- B2. Thicken the 8 thin firecrawl descriptions that survive A2 so the router can tell them apart.

**Batch C — housekeeping**
- C1. Sweep `jobs/` older than ~14 days (213 MB).
- C2. Give `USER.md` and `MEMORY.md` headroom: consolidate now, deliberately, rather than under pressure on the next write.

**Batch D — durability**
- D1. Add a skill-tax assertion to StackDoctor: warn when total description chars exceed ~35K, so this can't silently regrow. The 7/13 audit pruned skills and they grew back; a number that nobody watches is a number that drifts.
- D2. Re-audit `~/.claude` quarterly alongside KeystoneOS (next: 2026-10-24).
