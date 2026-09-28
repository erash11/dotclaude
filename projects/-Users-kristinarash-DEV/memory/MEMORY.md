# Memory Index

One line per memory: title, file, and a hook that says when to open it.
Never put memory content here — the file itself holds the facts.

<!-- re-keyed 2026-08-15 from C--Users-eric-rash-Desktop-DEV -->

- [Printing Press spec traps](project_printing-press-spec-traps.md) — writing a CLI spec: pagination, envelope fields, fixtures, doc regen
- [zsh shell traps](project_zsh-shell-traps.md) — reserved vars, word-splitting, pipeline exit codes
- [Status report sourcing](project_status-report-sourcing.md) — which source counts as "Shipped", which OKR doc is live
- [Fireflies CLI on Mac](project_fireflies-cli-broken-on-mac.md) — "out of memory (14)", getting transcript text, renames that don't stick
- [gws Google Forms API](project_gws-forms-api.md) — scopes, create vs batchUpdate, duplicated items
- [Kenny Boyd doc review](project_kenny-boyd-doc-review-preferences.md) — tone and labelling rules for review docs
- [Terminal Fluency workspace](project_terminal-fluency-workspace.md) — resume protocol and how he learns CLI
- [PATH shadowing and cleanup](project_path-shadowing-and-cleanup.md) — measuring PATH honestly; before deleting any binary
- [Backup/sync system](project_backup-sync-system.md) — manifest routing, verify-by-receipt, schedule history
- [CFB Analytics Lab](project_cfb-analytics-lab.md) — resume protocol and CFBD API traps
- [CFB forecast capture](project_cfb-forecast-capture.md) — Big 12 weekly freeze; one wrapper command; is a gap really a missed week?
- [Drive FUSE rsync loop](project_drive-fuse-rsync-mtime-loop.md) — rsync re-sending identical files to Google Drive
- [SecondBrain vault location](project_secondbrain-vault-location.md) — current path and what hardcodes it
- [Milvus lock misdiagnosis](project_milvus-lock-misdiagnosis.md) — Zotero/Milvus errors; diagnose before rebuilding
- [Memory compiler pipeline](project_memory-compiler-pipeline.md) — dead-flush tells, backfilling a date, "Indexed 0 chunks"
- [memsearch index path drift](project_memsearch-index-path-drift.md) — silent fallback to fewer indexed paths
- [memsearch hook timeout cap](project_memsearch-hook-timeout-cap.md) — slow or timed-out index; check Mac sleep (`pmset -g log`) first, then corpus growth
- [Morning briefing retired](project_morning-briefing-retired.md) — where the code, briefings and config went
- [graphify runtime setup](project_graphify-runtime-setup.md) — venv location, install flags, rebuild triggers
- [graphify semantic extraction](project_graphify-semantic-extraction.md) — quota traps and silent 429s
- [Automation cadence](project_automation-cadence.md) — ritual times, reindex, audit due dates, gws/Gmail limits
- [S2 Cognition analysis](project_s2-cognition-analysis.md) — norms scope, battery size, threshold discipline
- [Sports teams](user_sports-teams.md) — default team for ambiguous WNBA asks
- [Working-conditions bottleneck](user_working-conditions-bottleneck.md) — what limits him; the permission gate on acting unasked
- [Zero-edit YouTube pipeline](reference_zero-edit-youtube-pipeline.md) — Jack Roberts' Claude Code video system
- [DEV layout and discovery](project_dev-layout-and-discovery.md) — folder rules, depth-2 scan limit, gitignore trap
- [KeystoneOS verification habits](project_keystoneos-verification-habits.md) — which state claims mislead; re-check before asserting; morning-cadence dies on a `C:\` or URL `canonicalPath` in projects.json
- [Portfolio registry provenance](project_portfolio-registry-write-provenance.md) — who writes portfolio.json; how to commit changes
- [Command centre](project_command-centre.md) — localhost:7373 front door + the /os board, daemon health, backup default-deny
- [Vendored skill install](project_vendored-skill-install.md) — installing a third-party skill for Claude Code + Codex + Cowork; the `-a` flag trap
- [Vendored skill repair](project_vendored-skill-repair.md) — a skill returns empty output; which copy is actually live; patches that revert
- [Personal site build routes](project_personal-site-build-routes.md) — Artifact constraints vs scroll-craft; where the standalone build lives
- [Book scan page ordering](project_book-scan-page-ordering.md) — phone-scanned book pages out of order; folio OCR lies, read a contact sheet
- [Ingest review gate](feedback_ingest-review-gate.md) — before ingest-book or any expensive atomization; what the arithmetic gate does and does not catch
- [Dormant threads](project_dormant-threads.md) — Tezino CampPrep and FaceComps sim: where each stopped and what is still open
- [RTP CLA course](project_rtp-cla-course.md) — book ingest state, the +13 page offset, the one rebuild still outstanding
- [Post-merge cleanup](feedback_post-merge-cleanup.md) — standing OK to delete merged worktrees/branches unasked; verify-first rule; Windows read-only "Permission denied" fix
- [SCN sprint course](project_scn-sprint-course.md) — Moyer/Natera sprint course: where the 58 library entries and review live, RTP-stack role, open decisions
- [ATH Tech framework](project_ath-tech-framework.md) — the shipped 08-14 doc set, the five unwritten gaps, the ITS blocker
- [Supervisor log pipeline](project_supervisor-log-pipeline.md) — nightly log feeding the Kenny/Chris report; action-items-are-not-outcomes trap
- [dcg guard blocks](project_dcg-guard-blocks.md) — a Bash command was rejected outright; which shapes trip it and the rewrite that works
- [Headless tool-deny gap](project_headless-claude-tool-deny-gap.md) — `claude -p --disallowedTools Bash` still runs shell via context-mode MCP; before calling a headless run read-only
- [Config encoding damage from Windows](project_settings-json-bom-trap.md) — dcg cries "hook missing", or the statusline bars render as `â–“` junk; one bad write causes both, in settings.json AND CLAUDE.md/AGENTS.md
- [Tech inventory refresh](project_tech-inventory-refresh.md) — which forms platform is live, why gws cannot pull responses, the stale OneDrive copy, reminder sent 9/8, the refresh command
- [Brain audit loop](project_brain-audit-loop.md) — scoring the second brain; why manual rituals die and cron ones live
- [Hook two-copies trap](project_hook-two-copies-trap.md) — a hook patch "reverts"; `.claude/hooks/` and `.codex/hooks/` both need it
- [Child dental plan](user_child-dental-plan.md) — 4yo cavities: pediatric dentist not yet booked, SDF vs n-HAp
- [ELI5 output style](user_eli5-output-style.md) — concise plain-language output rules shared by Claude Code and Codex
- [GitHub consolidation](project_github-consolidation.md) — ~/DEV on GitHub: the thin root repo, _ARCHIVE, where DexaProject went, merge traps
- [Skill bloat and promotion](project_skill-bloat-and-promotion.md) — before touching ANY skill folder: which of the three copies is canonical, why `~/.claude/skills` IS a git repo, the sync script that deletes, the 2026-09-12 audit, the 40 name-only skills (9/14), Pi/pi.dev facts
- [Prioritization slate](project_prioritization-slate.md) — Eric proposes a new project or idea; the cap, charters, slate-check timer, clearing a nag with mark-done
- [Baylor department names](user_baylor-department-names.md) — Athletic Performance / Athletic Medicine / Applied Performance, never S&C / sports medicine / sport science
- [Git Bash MSYS/AD stall](project_git-bash-msys-ad-stall.md) — why bash randomly dies with `add_item errno 1`: AD lookup exceeds MSYS2's 15s spinlock; fix via nsswitch files-only + `shell: powershell` hooks
- [Backup task sleep-kill signature](project_backup-task-sleepkill-signature.md) — DailyBackup exit 3221225786 + same-day clean log = benign sleep interruption, not rot
- [Sport-science thought partner](user_sport-science-thought-partner.md) — why he feeds in Oldbull/SCN/SportSmith/CLA; how to answer performance, S&C, rehab questions
- [Third-party skill install](project_third-party-skill-install.md) — clone to ~/.agents/skills + symlink to 4 harnesses; Windows `ln -s` copies silently; sync-to-codex clears the pre-commit/backup jam
