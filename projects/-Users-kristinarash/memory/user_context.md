---
name: context
description: "Who Eric Rash is, his role, technical environment, and how to work with him"
metadata: 
  node_type: memory
  type: user
  originSessionId: 9ad4b586-a29e-48c0-be31-455d712183c5
---

Director of Applied Performance, Baylor Athletics. Works with football GPS and force plate data.

**Role:** Primary builder and user of athlete performance data pipelines. Also hands off running scripts to assistant coaches and directors during season.

**Technical profile:**
- Comfortable in Python and R
- Mac is primary; projects live in `~/DEV`. The Windows laptop runs desktop-app sessions only (since 2026-10-21).
- Mac Python is PEP 668-managed: use venvs or `uv`, never a global `pip install`. Tool paths (python3, uv, go) live in `~/.claude/TOOLPATHS.md`.
- Databases stay local (SQLite/DuckDB), never in a synced folder: sync causes file locks.

**Working style:**
- Direct — says "stop" or "we can call it done" when finished, no ceremony needed
- Prefers tangible working examples over documentation
- Builds incrementally; has started/stopped projects multiple times due to API friction
- Never paste credentials or tokens into a session: session transcripts are committed to git (DEV memory `feedback_session-history-tracked.md`). Secrets live in the macOS Keychain.

**Active projects:** Superseded 2026-10-25: live threads are in `global-memory/MEMORY.md` (Active Threads), not here.
- [[catapult-cli]] — GPS CLI built with Printing Press, now wrapped as the `pp-catapult-openfield-connect` skill

**Design preferences:**
- Nothing that breaks mid-season and requires significant effort to fix
- Transparent, editable pipelines
- Cloud servers and schedulers are approved since 2026-10-14 (DEV memory `project_cloud-copy-approval.md`). Databases stay off the ~/DEV mirror (consistent copies go to Drive as `dev-databases.tgz`, see the `~/.claude/scripts/cloud-push.py` header). Secrets stay in the Keychain. DexaProject stays in its one Drive folder and never goes to GitHub, cloud servers or cloud sessions. Nothing goes to Baylor OneDrive.

Superseded 2026-10-24: this file used to say "Sport Scientist", a Windows 11 machine with project folders on OneDrive, Python via the Windows Install Manager (Windows history in [[python-environment]]), Go at `C:\Program Files\Go\bin`, no cloud or schedulers without IT approval, and that Eric shares credentials in chat. The Mac, the 10-14 cloud approval and the committed-transcripts rule replaced all of these.
