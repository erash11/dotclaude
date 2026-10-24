---
name: zotero-cli
description: "Zotero research-library CLI built in Go (~/go/bin/zotero-research-library-pp-cli, plus the pp-mcp server behind mcp__zotero__*) — catapult conventions, Web API v3 only; cache found stale 2026-10-13, live layer is the ZoteroInjestion bridge"
metadata: 
  node_type: memory
  type: project
  originSessionId: 27df54a5-abaf-449b-8ec7-f36ba16bb6b5
---

Eric built a Zotero CLI (`zotero-research-library-pp-cli`) so both he and Claude have scriptable access to his research-paper library. Plan approved 2026-05-18 on the Windows laptop (`C:\Users\eric_rash\.claude\plans\i-want-to-dig-peppy-hoare.md`; not on the Mac).

**Status 2026-10-24 (supersedes the build-era notes below).** Built. Binary `~/go/bin/zotero-research-library-pp-cli` (source `~/printing-press/library/zotero-research-library/`). An MCP companion shipped too: `~/go/bin/zotero-research-library-pp-mcp`, wired as MCP `zotero` in `~/.claude.json` (the `mcp__zotero__*` tools). Skill: `pp-zotero-research-library`. Flint's 2026-10-13 check (`~/DEV/Flint/docs/zotero-setup.md`) found the CLI cache six weeks stale (last sync 2026-09-02, no full text). The live, recommended layer is the read-only bridge in `~/DEV/ZoteroInjestion` (`uv run zotero-bridge ...`). See DEV memory `reference_zotero-expert-reference.md`.

**Locked architecture decisions:**
- Mirrors [[catapult-cli]] conventions exactly: Go, Cobra, `cmd/<binary>/`, `internal/{cli,client,config,store,cache,cliutil,types}`, TOML config in `~/.config/`, SQLite store via `modernc.org/sqlite`, file-based HTTP cache
- **Zotero Web API v3 only** — no local SQLite reads of `~/Zotero/zotero.sqlite` (avoids fighting desktop app for lock; trades offline for sync consistency)
- **No MCP companion in v1** — CLI only; Claude shells out via Bash (superseded: the `-pp-mcp` companion shipped, see Status above)
- Full library mgmt scope: read, add (DOI/arXiv/ISBN via Crossref/arXiv/OpenLibrary lookups, NOT Zotero translation-server), edit, delete (PATCH `deleted: 1` for trash, hard DELETE for `--permanent`), notes, annotations (read/export only)
- Better BibTeX citekey bridge via JSON-RPC at `127.0.0.1:23119/better-bibtex/json-rpc` — opportunistic, graceful-degrades when desktop app is closed
- Group libraries supported via `--library user|group:<id>` global flag

**Why:** Today Eric pastes paper details manually when he wants Claude to scaffold a project from a method or recreate an analysis from a paper. The CLI removes that friction.

**How to apply:**
- When Eric mentions a paper/citation in any project, look it up instead of asking him to paste: the bridge for live data, or the CLI (`search`, `item get`, `pdf text`) / `mcp__zotero__*` after a sync. (Superseded 2026-10-24: this said to check whether the CLI exists yet.)
- Out-of-scope for v1 (don't quietly add): local-SQLite read mode, Zotero translation-server, group discovery UX, annotation writes, BBT citekey writes. (An MCP server was on this list; it shipped anyway.)
- History, build done: skeleton (go.mod, main, root, config) → reusable catapult utilities (ratelimit, cache, store skeleton) → client → auth/doctor/sync → commands.
