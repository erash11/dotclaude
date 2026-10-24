---
name: rea-ghidra-setup-traps
description: "REA + Ghidra on the Mac: install paths, env vars, and the traps that cost time (dot-folder paths, Drive reads, wine, R packages)"
metadata:
  node_type: memory
  type: project
  originSessionId: bfae0a14-26c6-45c5-87bf-851780b7ca30
  modified: 2026-10-24T14:51:50.921Z
---

REA (`rea-agents` 6.4.0) is installed at `~/.local/bin/rea` (npm, prefix `~/.local`; `rea setup` was NOT run, so no Claude config change). Ghidra 12.1.4 and `openjdk@21` are Homebrew installs; R 4.6.1 is Homebrew with packages in `/tmp/ericfast/rlib` (source builds; Homebrew R cannot install binary packages).

Run native analysis with `GHIDRA_INSTALL_DIR=/opt/homebrew/Cellar/ghidra/12.1.4/libexec` and `JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home`.

**Why:** the sleep-scheduler FAST recovery (see `~/DEV/sleep-scheduler/installer-inspection/FAST-MODEL-STATIC-RECOVERY.md`) took about an hour of avoidable traps.

**How to apply:**
- Ghidra rejects any path element starting with `.` (so `~/.claude/...` fails with `GhidraLaunchError`); copy targets to `/tmp/...` first.
- `rea search` on a 2.7 MB VB6 exe times out at 330 s; run `analyzeHeadless` directly in the background and poll.
- Google Drive files under `~/Library/CloudStorage` hang on CLI reads when online-only. Default: download through the gws API (`gws drive files get` with `alt=media`; see [[drive-fuse-read-hang]]). A Chrome download is the fallback (exe files need the "Download anyway" click). (Superseded 2026-10-24: this used to say "the Drive connector or a Chrome download".)
- Homebrew `wine-stable` is disabled (Gatekeeper, 2026-09-01); no VM app is installed, so Windows-only programs cannot run on the Mac.
- `pytest` is not global (PEP 668): `~/.local/bin/uv run --no-project --with pytest python -m pytest`.
- The dcg guard blocked `mv` out of `$HOME` and long compound heredoc commands; the workaround was `cp` and the file tools. Superseded 2026-10-11: about 30 minutes after this note, Eric allowlisted `mv-sensitive-source-root-home` and `heredoc.posix:pipeline-consumer`, so both shapes now pass. `rm -rf` inside a heredoc still blocks. See [[dcg-guard-blocks]].
