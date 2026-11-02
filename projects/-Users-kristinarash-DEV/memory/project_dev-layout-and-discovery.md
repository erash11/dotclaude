---
name: dev-layout-and-discovery
description: "How DEV projects must be laid out to stay visible to KeystoneOS discovery, and the gitignored-subtree trap that silently voids backups"
metadata: 
  node_type: memory
  type: project
  originSessionId: ea41d487-7812-4180-a6a8-f76a99753f83
  modified: 2026-11-02T23:17:20.641Z
---

Each project gets its own folder in `~/DEV`. KeystoneOS is a map and
control plane, not a monorepo — it maps projects by reference and never holds
their source (`AGENTS.md` operating rules).

**Depth limit.** `data/discovery-roots.json` scans `~/DEV` at `maxDepth 2`,
so `DEV/Project` and `DEV/Group/Project` are discovered but `DEV/Group/Sub/Project`
is invisible to `keystone.ps1 inventory` — it still works as code, it just never
appears in the registry or dashboard. One level of grouping (e.g. `Football\`) is
safe; two is not.

**The trap worth remembering:** never put a project under a path whose whole
subtree is gitignored. On 2026-07-28 two real projects were found living in
`KeystoneOS/outputs/`, which `.gitignore` covers with `outputs/**`. 53 of their 54
files existed only on one laptop, including files edited three weeks earlier. The
gitignore was correct for generated output; the mistake was storing source there.
The folder that looked most "inside the system" was the least protected thing in
the repo.

**Concurrency caveat.** Agent sessions (Claude and Codex) commit to DEV repos
while you are reading them — `SportScienceResearchRepo` moved HEAD and dropped
from 47 dirty files to 0 mid-analysis on 2026-07-28. Re-verify git numbers at the
point you act on them, not from a scan taken minutes earlier.

The root's display name in that config is still the Windows-era string
"Desktop DEV" — a label, not a path. The `path` field is `/Users/kristinarash/DEV`.

**Area folders (2026-11-02).** Repos now sit one level down in `~/DEV/{Personal,Program,Research,Performance}/`
(64 moved); `Football/` was already grouped. Still at the top until the after-season Workflow run: Platform repos
(KeystoneOS, project-triage, claude-global-memory, drive-tools...), `SpecialRequests`, `LibraryProject`, 3 live
pipelines, 4 repos in no router. Before moving a repo: grep consumers for `DEV/<name>` AND `"DEV" / "<name>"` and
`parents[n] / "<name>"`; rebuild any `.venv` (absolute paths); rename its Tier A slug folder; update
`portfolio.json` `dev_folder` and `KeystoneOS/data/projects.json` (UTF-8 BOM). Steps: `~/DEV/docs/FILE-ORGANIZATION-PLAN.md` Task 4.

Related: [[keystoneos-verification-habits]]
