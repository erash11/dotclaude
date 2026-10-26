---
name: project-memsearch-setup
description: "Eric's cross-project semantic-recall stack — memsearch CLI + Milvus 2.6.4 in Docker, ONNX bge-m3 local embeddings, plus a fragile in-place patch that must be re-applied after pip upgrades"
metadata: 
  node_type: memory
  type: project
  originSessionId: abcc9872-c477-4634-a2cc-8d3fc9f247f3
---

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

**Auto-sync:** A SessionEnd hook at `~/.claude/hooks/memsearch-sync.js` reindexes after every session, so transcripts captured this turn are searchable next session. It indexes 4 paths: `global-memory/transcripts/`, `projects/C--Users-eric-rash/memory/`, and the compiler's `claude-memory-compiler/daily/` + `knowledge/`. Output is captured to `global-memory/transcripts/.memsearch-index.log` (truncated each run); errors to `.errors.log`.

**⚠️ SessionEnd hook redesign (2026-06-11):** The hook ran `stats → index → stats` (the trailing stats was a flush-bug detector) which took ~18s, but its settings.json timeout was only **5s** — so the harness killed it every single session ("`SessionEnd hook ... failed: Hook cancelled`") and the index often never committed. Root cause was a too-tight timeout, NOT a memsearch fault (corpus was healthy, `.errors.log` empty). Fix: dropped the stats bracketing, run `index` **synchronously** via spawnSync (18s internal cap), bumped the hook timeout to **20s**. Steady-state session-end indexing is ~5s (fixed model-load + scan overhead; only the new transcript is fresh). NOTE: do NOT "optimize" this back to a detached/fire-and-forget spawn — tested 2026-06-11 and detached children are unreliable on Windows here (cmd.exe opens the redirect file but memsearch gets killed in the parent-exit race; creates a 0-byte log, never finishes). Synchronous + adequate timeout is the deliberate, correct trade.

**⚠️ Fragile patch — must re-apply after `pip install --upgrade memsearch`:**

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

**How to verify the system works:**
1. `docker ps` — three milvus-* containers should be Up
2. `curl http://localhost:9091/healthz` — returns `OK`
3. `memsearch stats` — non-zero chunk count
4. `memsearch search "<known phrase>" --top-k 3` — returns hits

**How to restart after machine reboot:**
- Docker Desktop should autostart. If not, launch from Start menu.
- The Milvus containers have `restart: unless-stopped` — they auto-restart with Docker.
- If something looks wrong: `cd ~/.memsearch/milvus && docker compose up -d`.

**[[project-catapult-cli]]** and **[[project-zotero-cli]]** memories are indexed by this — cross-project recall works.
