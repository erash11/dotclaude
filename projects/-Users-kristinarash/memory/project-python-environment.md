---
name: python-environment
description: "Windows history (2026-06): Python 3.14 via the Install Manager, ai-check.ps1, upgrade gotchas. On the Mac use venvs or uv; paths in ~/.claude/TOOLPATHS.md"
metadata:
  type: project
---

**Superseded 2026-10-24: Windows history only.** The Windows laptop has had no terminal work since 2026-10-14 and runs desktop-app sessions only since 2026-10-21. The Mac is primary. There, `python3` is Homebrew 3.14 and PEP 668-managed: use a venv or `uv` (`~/.local/bin/uv`), never a global `pip install`. Paths: `~/.claude/TOOLPATHS.md`. The Install Manager steps and `ai-check.ps1` below do not apply to the Mac.

# Python environment (Windows 11, fixed 2026-06-11)

- Python is managed by the **modern Python Install Manager** (not WinGet, not standalone installers). Current: **3.14.6**, unified across `python` and `py`.
- Active binary dir: `C:\Users\eric_rash\AppData\Local\Python\bin` (user PATH, top priority).
- Legacy system PATH entries (`C:\Python314\`, `C:\Python314\Scripts\`) were deleted and the legacy "Python Launcher" app uninstalled to kill execution-alias collisions. **Do not re-add these paths or reinstall the old launcher.**
- `C:\Python314\` directory fully deleted 2026-06-11 (had to stop the token-dashboard process at `DEV\token-dashboard`, which was running on the old interpreter, to release the folder lock). If `python` and `py` ever disagree again, restart the shell/app first — stale processes inherit old PATH.
- Global AI packages (anthropic, openai, langchain) were re-linked post-upgrade via `python -m pip install ...` and `py install --refresh`.

**Why:** WinGet upgrades fail for Python 3.14.x ("No package found matching input criteria") because of deprecated packaging params, and stale PATH entries silently hijack `python` back to old versions, breaking Claude Code / Codex tooling.

**How to apply:**
- For Python upgrades, use the Python Install Manager (`py install --refresh` after upgrades), never WinGet.
- After any Python patch update, expect global packages to be isolated; re-run `python -m pip install anthropic openai langchain` if imports fail.
- Health-check tool: `C:\Users\eric_rash\ai-check.ps1` — audits python/py version priority, scans core AI modules (anthropic, openai, langchain, langgraph, websockets), and auto-repairs via pip + `py install --refresh`. Run it first when diagnosing Python/AI-SDK breakage.
- If `python --version` disagrees with `py --version`, suspect PATH ordering; the AppData\Local\Python\bin entry must resolve first, and PowerShell sessions must be restarted after PATH edits.
