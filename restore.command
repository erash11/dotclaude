#!/bin/bash
# restore.command — mechanical restore for the MacBook (Phases 0–5).
# Written 2026-08-04 on the old Windows machine. NEVER EXECUTED ON macOS.
# Treat the first run as a test. Dry-run is the default for that reason.
#
# Covers: drive check, base tools, ~/.claude, AI state, ALL DEV projects
#         (clone + the gitignored-data overlay + non-repo folders), venvs.
# Does NOT cover: credentials, launchd, porting the backup script, skill triage.
#         Those need judgment or your input — open Claude Code and use START-HERE.md
#         Phases 6–9. This script tells you that when it finishes.
#
# Usage:
#   double-click in Finder      -> dry run, changes nothing
#   ./restore.command --run     -> actually do it
#
# Safety rules baked in: never deletes anything, never writes to the backup drive,
# skips work already done (safe to re-run after a failure), stops on first error.

set -uo pipefail

MODE="dry"
[ "${1:-}" = "--run" ] && MODE="run"

RED=$'\033[31m'; GRN=$'\033[32m'; YLW=$'\033[33m'; BLD=$'\033[1m'; RST=$'\033[0m'
LOG="$HOME/restore-$(date +%Y%m%d-%H%M%S).log"
FAILED=0

say()  { printf '%s\n' "$*" | tee -a "$LOG"; }
ok()   { printf '  %sOK%s   %s\n' "$GRN" "$RST" "$*" | tee -a "$LOG"; }
warn() { printf '  %sWARN%s %s\n' "$YLW" "$RST" "$*" | tee -a "$LOG"; }
bad()  { printf '  %sFAIL%s %s\n' "$RED" "$RST" "$*" | tee -a "$LOG"; FAILED=$((FAILED+1)); }
hdr()  { printf '\n%s=== %s ===%s\n' "$BLD" "$*" "$RST" | tee -a "$LOG"; }

# run CMD... — executes unless dry mode
run() {
  if [ "$MODE" = "dry" ]; then printf '  would run: %s\n' "$*" | tee -a "$LOG"; return 0; fi
  "$@" >>"$LOG" 2>&1
}

say "${BLD}Restore — Phases 0–5${RST}"
say "mode: $MODE      log: $LOG"
[ "$MODE" = "dry" ] && say "${YLW}DRY RUN — nothing will change. Re-run with --run to execute.${RST}"

# ---------------------------------------------------------------- Phase 0
hdr "Phase 0 — locate and check the backup drive"

SSD=""
for cand in /Volumes/ASSISTANT/AssistantBackup /Volumes/*/AssistantBackup; do
  [ -d "$cand" ] && { SSD="$cand"; break; }
done
if [ -z "$SSD" ]; then
  bad "no AssistantBackup found under /Volumes. Plug the drive in, then:  ls /Volumes/"
  exit 1
fi
ok "drive: $SSD"

for d in DEV-repo-data DEV-nonrepo DEV-working-tree repos claude codex gemini SecondBrain MANIFEST; do
  [ -d "$SSD/$d" ] && ok "present: $d" || bad "MISSING: $d"
done

if [ -f "$SSD/MANIFEST/TRANSFER-CHECK.txt" ]; then
  if grep -q "RESULT : PASS" "$SSD/MANIFEST/TRANSFER-CHECK.txt"; then
    ok "transfer check: PASS"
  else
    bad "transfer check is NOT PASS — do not restore from this drive until you know why"
    grep "RESULT" "$SSD/MANIFEST/TRANSFER-CHECK.txt" | tee -a "$LOG"
    exit 1
  fi
else
  warn "no TRANSFER-CHECK.txt — cannot confirm the drive verified"
fi
[ "$FAILED" -gt 0 ] && { say "${RED}Phase 0 failed. Stopping.${RST}"; exit 1; }

# ---------------------------------------------------------------- Phase 1
hdr "Phase 1 — base tools"

if ! command -v brew >/dev/null 2>&1; then
  say "  Homebrew not found. Install it first, then re-run:"
  say '    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
  [ "$MODE" = "run" ] && exit 1
else
  ok "brew $(brew --version 2>/dev/null | head -1)"
fi

for pkg in git gh node go uv; do
  if command -v "$pkg" >/dev/null 2>&1; then ok "$pkg already installed"
  else run brew install "$pkg" && ok "installed $pkg" || bad "brew install $pkg"
  fi
done
if command -v pwsh >/dev/null 2>&1; then ok "pwsh already installed"
else run brew install powershell/tap/powershell && ok "installed pwsh" || warn "pwsh install failed — needed for the KeystoneOS .ps1 jobs"
fi
command -v python3 >/dev/null 2>&1 && ok "python3 $(python3 --version 2>&1)" \
  || warn "python3 missing — install from python.org, NOT brew and NOT the App Store"

if ! gh auth status >/dev/null 2>&1; then
  warn "GitHub not authenticated. Run:  gh auth login    (account: erash11)"
  [ "$MODE" = "run" ] && { say "${RED}Stopping — repo cloning needs auth.${RST}"; exit 1; }
else
  ok "gh authenticated"
fi

# ---------------------------------------------------------------- Phase 2
hdr "Phase 2 — ~/.claude (do this before anything else)"

if [ -d "$HOME/.claude/.git" ]; then
  ok "~/.claude already a git repo — skipping clone"
else
  run mkdir -p "$HOME/.claude"
  run git -C "$HOME/.claude" init -b main
  run git -C "$HOME/.claude" remote add origin https://github.com/erash11/dotclaude.git
  run git -C "$HOME/.claude" fetch origin
  run git -C "$HOME/.claude" checkout -f origin/main -b main && ok "dotclaude restored" || bad "dotclaude restore"
fi

clone_into() {  # repo_url dest
  if [ -d "$2/.git" ]; then ok "$(basename "$2") already present"
  else run git clone "$1" "$2" && ok "cloned $(basename "$2")" || bad "clone $(basename "$2")"
  fi
}
clone_into https://github.com/erash11/claude-skills.git          "$HOME/.claude/skills"
clone_into https://github.com/erash11/claude-global-memory.git   "$HOME/.claude/global-memory"
clone_into https://github.com/erash11/claude-memory-compiler.git "$HOME/.claude/claude-memory-compiler"

# ---------------------------------------------------------------- Phase 3
hdr "Phase 3 — conversation history and AI state"

sync_dir() {  # label src dst
  if [ ! -d "$2" ]; then warn "$1: source absent on drive, skipping"; return; fi
  run mkdir -p "$3"
  run rsync -a "$2/" "$3/" && ok "$1 restored" || bad "$1 rsync"
}
sync_dir "claude/projects"  "$SSD/claude/projects"       "$HOME/.claude/projects"
sync_dir "global-memory"    "$SSD/claude/global-memory"  "$HOME/.claude/global-memory"
sync_dir "codex"            "$SSD/codex"                 "$HOME/.codex"
sync_dir "gemini"           "$SSD/gemini"                "$HOME/.gemini"
sync_dir "SecondBrain"      "$SSD/SecondBrain"           "$HOME/SecondBrain"

# ---------------------------------------------------------------- Phase 4
hdr "Phase 4 — DEV projects (three passes; all three matter)"

DEV="$HOME/Desktop/DEV"
run mkdir -p "$DEV"

say "  4.1 tracked code from GitHub"
REPOS="CFB_Victory_Model DataBase_GPS_Reporting DexaProject ForcePlate_DecisionSystem \
KeystoneOS Kinexon_Volleyball morning-briefing PlayerProfiles_FB_03-28-2026 \
Program_Context_Meet project-triage Risk_Stratification_Engine RTP_DataCollection_Talk \
SportScienceResearchRepo Travel_Map ValdReport ZoteroInjestion"
for r in $REPOS; do
  if [ -d "$DEV/$r/.git" ]; then ok "$r already cloned"
  else run git clone "https://github.com/erash11/$r.git" "$DEV/$r" && ok "cloned $r" || bad "clone $r"
  fi
done
[ -d "$DEV/Website/.git" ] || run git clone https://github.com/erash11/AppliedPerformance-Site.git "$DEV/Website"
[ -d "$DEV/token-dashboard/.git" ] || run git clone https://github.com/nateherkai/token-dashboard.git "$DEV/token-dashboard"

say ""
say "  ${BLD}4.2 THE OVERLAY — the step that matters${RST}"
say "      Cloning restores only files git TRACKS. Gitignored data — databases, model"
say "      outputs — was never in GitHub. ForcePlate is 7 MB on GitHub vs 1,709 MB on"
say "      disk. This is ~4 GB that exists nowhere else."
run rsync -a "$SSD/DEV-repo-data/"    "$DEV/" && ok "gitignored data overlaid" || bad "DEV-repo-data overlay"
run rsync -a "$SSD/DEV-working-tree/" "$DEV/" && ok "uncommitted edits overlaid" || bad "DEV-working-tree overlay"

say ""
say "  4.3 non-git project folders"
run rsync -a "$SSD/DEV-nonrepo/" "$DEV/" && ok "non-repo folders restored" || bad "DEV-nonrepo rsync"

say ""
say "  verifying the overlay actually landed:"
if [ "$MODE" = "run" ]; then
  FP="$DEV/ForcePlate_DecisionSystem/data/forceplate.db"
  if [ -f "$FP" ]; then
    SZ=$(du -m "$FP" | cut -f1)
    [ "$SZ" -gt 150 ] && ok "forceplate.db ${SZ} MB (expect ~173)" || bad "forceplate.db only ${SZ} MB — overlay incomplete"
  else
    bad "forceplate.db MISSING — the overlay did not work. Fix before continuing."
  fi
  for chk in "Risk_Stratification_Engine:1500" "Football:2000"; do
    n="${chk%%:*}"; min="${chk##*:}"
    if [ -d "$DEV/$n" ]; then
      m=$(du -sm "$DEV/$n" | cut -f1)
      [ "$m" -gt "$min" ] && ok "$n ${m} MB" || warn "$n only ${m} MB (expected >${min})"
    else bad "$n missing"; fi
  done
else
  say "  would verify: forceplate.db ~173 MB, Risk_Stratification_Engine ~1.8 GB, Football ~3 GB"
fi

# ---------------------------------------------------------------- Phase 5
hdr "Phase 5 — Python environments"

if [ -d "$DEV/morning-briefing" ]; then
  if [ -d "$DEV/morning-briefing/.venv" ]; then ok "morning-briefing venv exists"
  else
    run bash -c "cd '$DEV/morning-briefing' && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt" \
      && ok "morning-briefing venv built" || warn "morning-briefing venv failed — build it manually"
  fi
fi
if [ -d "$DEV/ZoteroInjestion" ] && command -v uv >/dev/null 2>&1; then
  run bash -c "cd '$DEV/ZoteroInjestion' && uv sync" && ok "ZoteroInjestion synced" || warn "uv sync failed"
fi
run bash -c "pip install memsearch" && ok "memsearch installed" || warn "memsearch install failed"
warn "REMINDER: reapply the memsearch flush patch (notes in claude-memory-compiler)."
warn "          Missing it is silent except for entries in global-memory/transcripts/.errors.log"

# ---------------------------------------------------------------- Summary
hdr "Summary"
if [ "$MODE" = "dry" ]; then
  say "${YLW}Dry run complete. Nothing changed.${RST}"
  say "To execute:   ${BLD}$0 --run${RST}"
else
  if [ "$FAILED" -eq 0 ]; then say "${GRN}Phases 0–5 complete with no failures.${RST}"
  else say "${RED}Phases 0–5 finished with $FAILED failure(s). Review $LOG before continuing.${RST}"; fi
fi

say ""
say "${BLD}What is NOT done — these need Claude Code:${RST}"
say "  Phase 6  credentials      — interactive, per service. See CREDENTIALS.md"
say "  Phase 7  launchd jobs     — 8 agents; MsysKeepAlive is retired, not ported"
say "  Phase 8  port the backup  — robocopy->rsync, depath 3 files, skill triage"
say "  Phase 9  verification     — and correct the runbook from what actually happened"
say ""
say "Next:  open Claude Code and paste:"
say "  Read $SSD/START-HERE.md and execute Part 2 from Phase 6 onward."
say "  Phases 0-5 were completed by restore.command; the log is at $LOG."
say "  Stop at every CHECKPOINT and show me what you found."
say ""
say "log: $LOG"
