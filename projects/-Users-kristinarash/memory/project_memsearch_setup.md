---
name: memsearch-setup
description: "Windows-era (2026-05-18) memsearch setup, superseded on the Mac — today memsearch is a uv tool on an embedded Milvus Lite file (no Docker, no server) with a detached SessionEnd worker; Windows history kept below"
metadata: 
  node_type: memory
  type: project
  originSessionId: abcc9872-c477-4634-a2cc-8d3fc9f247f3
---

> **Superseded 2026-10-24 — everything below is the Windows setup (history).** On the Mac today
> (checked 2026-10-24): memsearch 0.4.17 is a **uv tool** (`~/.local/bin/memsearch`). It stores
> chunks in the embedded **Milvus Lite** file `~/.memsearch/milvus.db`: no Docker, no Milvus
> server, nothing on port 19530. `~/.memsearch/config.toml` holds only `provider = "onnx"`.
> Index paths come from `~/DEV/KeystoneOS/data/memory-index-paths.json`. The SessionEnd hook is a
> **detached worker** since 2026-09-02 (DEV memory `project_memsearch-hook-timeout-cap.md`), and the daily backup runs
> the full reindex. Reinstall with `uv tool install --force memsearch`, never pip
> (DEV memory `project_memory-compiler-pipeline.md`). No flush patch is present in the Mac `store.py`, and indexing
> works without it (the 2026-10-24 backup indexed 2,941 chunks).

Set up 2026-05-18 on Eric's Windows 11 machine to give Claude cross-project semantic recall over markdown memory files and captured Stop-hook transcripts.

**Stack:**
- memsearch 0.4.3 (PyPI) — CLI at `memsearch.exe` in `C:\Users\eric_rash\AppData\Roaming\Python\Python314\Scripts\`
- Milvus 2.6.4 via Docker Compose at `~/.memsearch/milvus/docker-compose.yml` (3 containers: etcd, minio, standalone). Ports: 19530 (gRPC), 9091 (healthz), 2379 (etcd).
- ONNX bge-m3 (1024-dim) — local embeddings, no API key, model cached at `~/.cache/huggingface/`.
- Config: `~/.memsearch/config.toml`. Key settings: `embedding.provider = "onnx"`, `milvus.uri = "http://localhost:19530"`.

**Indexed paths (the corpus memsearch knows about):**
- `~/.claude/global-memory/memory/` — daily logs
- `~/.claude/global-memory/transcripts/` — Stop-hook transcript captures
- `~/.claude/projects/C--Users-eric-rash/memory/` — Tier A structured memories (this file lives here)

**Auto-sync** (Windows, May 2026; Mac paths are in `memory-index-paths.json`)**:** A SessionEnd hook at `~/.claude/hooks/memsearch-sync.js` reindexes after every session, so transcripts captured this turn are searchable next session. It indexes 4 paths: `global-memory/transcripts/`, `projects/C--Users-eric-rash/memory/`, and the compiler's `claude-memory-compiler/daily/` + `knowledge/`. Output is captured to `global-memory/transcripts/.memsearch-index.log` (truncated each run); errors to `.errors.log`.

**⚠️ SessionEnd hook redesign (2026-06-11)** — superseded 2026-09-02: the hook is now a detached background worker on the Mac, on purpose; do not put the synchronous version back (DEV memory `project_memsearch-hook-timeout-cap.md`). Original note: The hook ran `stats → index → stats` (the trailing stats was a flush-bug detector) which took ~18s, but its settings.json timeout was only **5s** — so the harness killed it every single session ("`SessionEnd hook ... failed: Hook cancelled`") and the index often never committed. Root cause was a too-tight timeout, NOT a memsearch fault (corpus was healthy, `.errors.log` empty). Fix: dropped the stats bracketing, run `index` **synchronously** via spawnSync (18s internal cap), bumped the hook timeout to **20s**. Steady-state session-end indexing is ~5s (fixed model-load + scan overhead; only the new transcript is fresh). NOTE: do NOT "optimize" this back to a detached/fire-and-forget spawn — tested 2026-06-11 and detached children are unreliable on Windows here (cmd.exe opens the redirect file but memsearch gets killed in the parent-exit race; creates a 0-byte log, never finishes). Synchronous + adequate timeout is the deliberate, correct trade.

**⚠️ Fragile patch — must re-apply after `pip install --upgrade memsearch`** (Windows, remote Milvus server only). Superseded 2026-10-24: on the Mac memsearch is a uv tool on Milvus Lite; reinstall with `uv`, never pip, and no patch is present there (see the top note).

memsearch 0.4.3 does not flush after `upsert()` against a remote Milvus server. Rows queue but never become searchable. The fix is a 4-line addition in `<site-packages>/memsearch/store.py` `upsert()`:

```python
# after self._client.upsert(...)
try:
    self._client.flush(self._collection)
except Exception:
    pass
```

If `memsearch index` reports "Indexed N chunks" but `memsearch stats` shows `Total indexed chunks: 0`, the patch was lost. Re-apply it. (Consider filing an upstream PR; until then, this is local.)

**⚠️ Windows env-var requirement — `memsearch search` crashes without it:**

`memsearch search` writes results via `click.echo`, which on Windows uses the console's `cp1252` codepage by default. Any chunk containing unicode (em-dashes, smart quotes, arrows — i.e. most logs) triggers `UnicodeEncodeError` and the command exits with a Python traceback instead of results. Verified 2026-05-19.

Fix is two user-level env vars:

```powershell
[Environment]::SetEnvironmentVariable('PYTHONIOENCODING', 'utf-8', 'User')
[Environment]::SetEnvironmentVariable('PYTHONUTF8', '1', 'User')
```

These persist across reboots. If they ever get unset (profile reset, new Windows account, group-policy push), symptom is the cp1252 traceback. Re-apply with the snippet above and restart the shell.

**How to verify the system works** (Windows; on the Mac skip steps 1-2, there is no Docker or server)**:**
1. `docker ps` — three milvus-* containers should be Up
2. `curl http://localhost:9091/healthz` — returns `OK`
3. `memsearch stats` — non-zero chunk count
4. `memsearch search "<known phrase>" --top-k 3` — returns hits

**How to restart after machine reboot** (Windows/Docker only; the Mac has no containers)**:**
- Docker Desktop should autostart. If not, launch from Start menu.
- The Milvus containers have `restart: unless-stopped` — they auto-restart with Docker.
- If something looks wrong: `cd ~/.memsearch/milvus && docker compose up -d`.

**[[catapult-cli]]** and **[[zotero-cli]]** memories are indexed by this — cross-project recall works.
