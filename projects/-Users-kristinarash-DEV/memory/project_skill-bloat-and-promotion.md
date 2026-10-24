---
name: skill-bloat-and-promotion
description: "Measured skill bloat in this setup, the project-until-promoted rule that fixes it, and the command that re-measures usage from .jsonl session logs"
metadata: 
  node_type: memory
  type: project
  originSessionId: f1097c6d-9db5-4bb5-a0f7-c42d645cf75d
  modified: 2026-10-24T05:38:56.191Z
---

Measured 2026-09-12 from a gap analysis of a Nate Herk / **Mark Kashef** video
("How to Actually Choose the Right AI Agent", 2026-09-11). Full note:
`~/SecondBrain/Inbox/2026-09-12-harness-over-model-mark-kashef.md`.
Same shape as the earlier audit in [[brain-audit-loop]] — that one scored the
**vault**, this one scores the **skill layer**.

## The measurement

| Metric | Count |
|---|---|
| Global skills in `~/.claude/skills/` | 160 (→ **117** after the Tier 1 archive, 2026-09-12) |
| Plugin skills exposed per session | ~37 (6 enabled, 18 disabled) |
| SKILL.md files in plugin cache | 606 — disabled plugins + old versions, NOT the load |
| Project-level skills anywhere in `~/DEV` | **0** |
| `.jsonl` sessions scanned | 414 |
| Distinct real skills **ever** invoked | **58** |
| Used 3+ times | 30 |
| Used exactly once | 19 |

Everything is global. That is the anti-pattern, not the achievement.

## The rule that fixes it — promotion

**Everything stays project-level until it earns global.** A skill lives in
`<project>/.claude/skills/` until it proves itself across 2+ projects, then it
gets promoted to `~/.claude/skills/`. Keeps the global load small and the blast
radius tight — so when something underperforms you can tell a *model* problem
from a *harness* problem from an *organisation* problem.

## The audit question

Not "how often did I run this skill?" but **"would the model do this fine without
the skill now?"** A skill is a crutch; as the brain gets smarter the crutch starts
to *limit* it. Seasonal skills (`forecast-capture`) and occasional ones
(`ingest-book`) are low-count by design — low usage alone is not a delete signal.

## Re-measure (BUILTIN filter is the whole trick)

Without the `BUILTIN` set you also count `/exit`, `/clear`, `/compact` and friends,
which inflates the total to 74 and buries the real skills.

```bash
python3 - <<'EOF'
import glob,re,collections
BUILTIN={'exit','clear','compact','rename','color','login','logout','plugin','doctor',
'help','model','config','resume','cost','status','init','agents','mcp','hooks','memory',
'review','vim','terminal-setup','install-github-app','add-dir','bug','release-notes',
'pr-comments','ide','permissions','statusline','output-style','todos','export',
'privacy-settings','upgrade','fast','artifacts','tasks','loop','context','usage','rewind',
'sandbox','feedback','worktrees','skills','reload-skills','reload-plugins','bashes',
'keybindings','theme'}
c=collections.Counter()
for f in glob.glob('/Users/kristinarash/.claude/projects/**/*.jsonl',recursive=True):
    try:
        for line in open(f,encoding='utf-8',errors='ignore'):
            if 'Skill' not in line and 'command-name' not in line: continue
            for m in re.finditer(r'"name"\s*:\s*"Skill"\s*,\s*"input"\s*:\s*\{[^}]*?"skill"\s*:\s*"([^"]+)"', line):
                c[m.group(1)]+=1
            for m in re.finditer(r'<command-name>/([a-zA-Z0-9:_-]+)</command-name>', line):
                c[m.group(1)]+=1
    except Exception: pass
real={k:v for k,v in c.items() if k.split(':')[-1] not in BUILTIN and k not in BUILTIN}
print("distinct real skills ever invoked:",len(real))
print("used >=3 times:",len([k for k,v in real.items() if v>=3]))
print("used exactly once:",len([k for k,v in real.items() if v==1]))
for k,v in sorted(real.items(),key=lambda x:-x[1]): print(f"{v:5d}  {k}")
EOF
```

## Decision, 2026-09-12

**Do the skill audit BEFORE adopting Pi** (`pi.dev`) as an alternative harness.
Rationale: the leverage is the bloat, not the harness. Auditing first means any
future harness move ports ~30 good skills instead of ~200 mixed ones.

Pi facts, verified from `pi.dev/docs/latest` 2026-09-12 — full note at
`~/SecondBrain/Inbox/2026-09-12-pi-harness-research.md`:

1. **No sandbox, no approval flows.** "Pi does not include a built-in sandbox."
   Project trust only guards resource *loading*, not what the agent then does.
   Never run Pi in `~/DEV` or near `DexaProject`. Trial it in `~/pi-trial` or a
   container (`sbx` keeps the credential off the container).
2. **Skills port for one line.** Pi implements the Agent Skills standard and already
   auto-discovers `~/.agents/skills/` — where 45 of the skills live. Add the rest with
   `{"skills": ["~/.claude/skills"]}` in `~/.pi/agent/settings.json`. It loads
   `AGENTS.md` **or** `CLAUDE.md` directly.
3. **Hooks → TypeScript extensions is a bounded port, not a rewrite** (earlier note
   said "weeks", that was wrong). Hooks here are already `.ts`; Pi's `tool_call` event
   returns `{block, reason}` — the same shape as the dcg guard.
4. **Claude subscription through Pi bills per token as "extra usage", NOT against plan
   limits.** Changes the economics of brain-swapping.

Config lives in `~/.pi/agent/` and survives npm uninstall.
See also [[hook-two-copies-trap]] and [[dcg-guard-blocks]].

## Audit outcome, 2026-09-12

**Both tiers executed.** 99 skills archived, global **160 → 61**, roster cost
**19,158 → 6,428 tokens/session (a 66% cut)**. Zero regressions: none of the 99
had ever been invoked in 414 sessions.

Decision 2026-09-12: keep the `mattpocock-skills` and `superpowers` **plugins** and
archive the local bare-name duplicates. The plugin (v1.2.3, 35 skills) ships every
duplicate removed and is newer than the July symlinks. Rule that follows: when a
plugin and a local skill share a name, **the plugin wins** — delete the local copy.

Script: the one-off `skills-audit-2026-09-12.sh` went to `~/.Trash/` on 2026-10-24 (it archived,
never deleted). Undo still works: `mv ~/.claude/skills-archive/2026-09-12/* ~/.claude/skills/`.
Report: `~/SecondBrain/Inbox/2026-09-12-skill-audit.md`.

Traps found while doing it:
1. **CORRECTED 2026-09-12 — `~/.claude/skills/` IS version-controlled.** It is its own
   git repo, remote `https://github.com/erash11/claude-skills.git`, and the audit was
   committed as `3ab4467 chore: apply global skill audit` and pushed. The earlier note
   that it is "gitignored, archive is the only undo" was true only of the *`dotclaude`*
   repo, which ignores this path — a different thing. **Git IS the safety net here, and
   it is also how the cut reaches Windows.** Undo with
   `git -C ~/.claude/skills revert <sha> && git push`, not the archive folder
   (`skills-archive/` is not in the repo and never reaches the other machine).
2. **A cut in `~/.claude/skills/` does NOT reach `~/.agents/skills/`.** After the audit,
   98 of the 99 archived skills were still live in the pool (306 entries there vs 61
   canonical). Claude Code stopped seeing them; **Pi auto-discovers that folder**, so
   installing Pi would have re-exposed all of them. Always cut both.
3. **Skills live in three places and it is easy to edit the wrong copy.**
   `~/.claude/skills/` (19 entries were symlinks pointing *out* to the pool),
   `~/.agents/skills/` (Pi, Cowork), `~/.codex/skills/` (Codex, 27 symlinks + 5 real
   dirs). Count with `find -L`; plain `find` undercounts.
4. **`sync-to-codex.sh` did `rm -rf "$dst/$s"; cp -R "$SRC/$s"`** over a 7-name
   allowlist. If `$SRC/$s` ever became a symlink into `$dst`, that deletes the real
   data. `dev-sync` tells you to run it after every pull. A `.ps1` twin has the same
   shape — patch both.
5. **`~/.claude/skills/_shared/`** holds `config.json` + `Inference/` and is resolved by
   10+ skills via `parents[2]/_shared/config.json`. It has **no SKILL.md**. Never treat
   "no SKILL.md" as "orphan, delete".
6. **"606 plugin skills" is cache, not load.** Only 6 of 24 plugins are enabled
   (~37 skills exposed). The rest are disabled plugins and old cached versions.

## Executed 2026-09-12 — traps the live run found

- **Views are live links now.** `~/.agents/skills/<owned>` and `~/.codex/skills/<owned>`
  point into canonical, so anything that writes a view path writes canonical
  (`graphify install --platform agents` does; see [[graphify-runtime-setup]]).
- **`skillOverrides` in `~/.claude/settings.json` breaks parity silently.** Codex and Pi
  ignore that file, so an owned skill set `"off"` there is hidden in Claude Code but live
  elsewhere. Perfect frontmatter does not help; `skill-portability-check.py` fails it.
  Resolved 2026-09-13: Eric re-enabled the 7 (ArXiv, ISA, Science, capture-insight,
  library-review, pp-espn, session-miner) — `~/.claude` commit `21c686d`, checker 42/42.
  Never set an owned skill "off" again; retire it from canonical instead.
- **Git's spelling wins, not the Mac's.** APFS is case-insensitive: the folder showed
  `Harvest` while git recorded `harvest/`. Check `git ls-files` before "fixing" a
  name to match the disk.
- **A `closeout` in another session commits your uncommitted work** (it swept Task 5's
  34 SKILL.md edits into its own commit). Commit each verified step immediately.
- **Description budget:** keep each description under ~650 chars; Claude Code caps the
  combined listing.

## Architecture decided 2026-09-12 (executed through Task 5 the same day)

**Canonical = `~/.claude/skills/`** (the git repo, real directories only, **never commit
a symlink** — Windows pulls this repo). `~/.agents/skills/` and `~/.codex/skills/` are
**generated views**, rebuilt by `sync-to-codex.sh` from a complete manifest of every
canonical dir holding a SKILL.md, recorded in a `.generated-by-sync-to-codex` ownership
file so an audit can tell a generated entry from a third-party `npx skills add` install.
Symlink on Mac, copy on Windows.

Portable frontmatter contract (fires in Claude Code *and* Codex): `name` must equal the
directory name (TitleCase is legal), and `description` needs **both** a positive
"Use when …" clause with literal trigger phrases *and* a negative "Do not use …" clause.
Codex reads only `name` + `description` (+ optional `metadata.short-description`) and
ignores `argument-hint` / `allowed-tools`. Codex over-fires without the negative clause;
Claude will not trigger without the literal phrases.

Plan (Codex-approved after 6 review rounds, 10→0 findings):
`~/DEV/KeystoneOS/docs/superpowers/plans/2026-09-12-harness-agnostic-aios.md`.
See [[dev-layout-and-discovery]], [[hook-two-copies-trap]], [[vendored-skill-install]].

## claude.ai-synced duplicates, 2026-10-02 (doctor-plus)

`~/.claude/skills/synced/<account-id>/` is claude.ai account skills synced down (gitignored,
re-synced each start — deleting the folder does not stick). They list as `anthropic-skills:<name>`.
Where one duplicates a local skill, **local wins**: set `"anthropic-skills:<name>": "off"` in
`skillOverrides` (namespaced keys work — verified with a headless on/off control run). Done for
closeout, dev-sync, five-slides-generator, new-project, watch, last30days (2026-10-06; the
plugins `watch@claude-video` and `last30days@last30days-skill` keep them; local `watch` was
already "off"), articulation-skill (the last one re-tracked
in canonical 2026-10-02 after a 9/10 removal left untracked per-machine copies). Do not delete them on claude.ai: the synced
five-slides is written for the claude.ai sandbox and is the right copy there. The "never off" rule
above is for *owned* skills only.

## Listing trim, 2026-09-14 (doctor-plus)

**40 owned skills are `"name-only"` in `~/.claude/settings.json` `skillOverrides`**
(dotclaude commit `172d547`). 13 stay full: the ones Claude invoked itself 2+ times
(memory-write, CreateSkill, impeccable, claude-stack-doctor, codex-review, name-meetings,
project, graphify, fireflies-intake, html-to-pdf, meeting-prep, status-report) plus
sports-science-research-grounding. Chosen from the usage scan above (model calls vs typed).

- Why `name-only`, not `"off"` or `disable-model-invocation`: the name stays listed, so
  Skill-tool chains (`startup`→`dev-sync`, `weekly-review`→`meeting-sync`) still work,
  the portability checker only fails `"off"`, and Codex/Pi still see full descriptions.
- Cost: those 40 fire less on phrases ("goodnight", "capture this"). Type `/name`.
- Next-session check: if ~17 local skills still show as bare names, the listing budget
  is being eaten by plugin skills, not these. Promote a skill back to `"on"` by deleting
  its line.

## Plugin/skill dedupe, 2026-10-07

- `mattpocock-skills` now comes from Matt's own marketplace (`@mattpocock`, 1.3.1, autoUpdate).
  The `@claude-plugins-official` copy was uninstalled: that marketplace pins a commit SHA and
  lagged at 1.2.3. Prefer the author's own marketplace.
- Removed 6 untracked symlinks in `~/.claude/skills/` that shadowed plugin skills (code-review,
  grilling, handoff, prototype, teach, watch). Targets stay in `~/.agents/skills/` for Codex/Pi.
- Review skills trimmed (Eric's choice, same day): keep `mattpocock-skills:code-review` +
  `codex-review`. Built-in `code-review` set "off" (bare key; does not hit the namespaced plugin
  skill). `superpowers:requesting-code-review` "off" (Eric's call; superpowers
  executing-plans and subagent-driven-development call it by name, so their review step may fail).
- `superpowers:test-driven-development` "off" too; `mattpocock-skills:tdd` is the TDD skill.
- A description/body similarity scan of 148 active skills found no other duplicates.
