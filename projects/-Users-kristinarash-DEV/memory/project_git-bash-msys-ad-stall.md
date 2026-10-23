---
name: git-bash-msys-ad-stall
description: "Why Git Bash randomly dies on this machine (add_item errno 1) — AD lookup blows past MSYS2's 15s spinlock; fix is nsswitch files-only + shell:powershell hooks"
metadata: 
  node_type: memory
  type: project
  originSessionId: 1af2d0a6-e25b-4097-a3e5-e0f45a6e5d14
  modified: 2026-10-23T16:07:45.810Z
---

Git Bash on this machine intermittently dies at startup with
`bash.exe: *** fatal error - add_item ("\??\C:\Program Files\Git", "/", ...) failed, errno 1`
(exit 0xC0000005). This is the real explanation behind the global CLAUDE.md rule
"prefer PowerShell, Bash fails silently on this Windows setup."

**Mechanism (measured 2026-08-02):** MSYS2 builds its shared-memory mount table once,
guarded by a spinlock in `shared.cc` with a hard **15-second timeout**. Past that, waiting
processes enter the critical section anyway, `mountinfo.init()` runs twice, and `add_item("/")`
aborts. Observed directly: three consecutive launches took **15.17–15.20 s** then died — the
timeout itself.

**Trigger:** machine is domain-joined to `baylor.edu`; `C:\Program Files\Git\etc\nsswitch.conf`
ships `passwd: files db` with **no `/etc/passwd`**, so every bash launch resolves identity over
LDAP. Slow DC → >15 s → crash. Bursty, not constant: ~0.5% of launches normally (0/500 when the
DC is fast, `id` = 421 ms), but once one process wedges, *every* concurrent launch fails. Claude
Code fires 3–4 Stop hooks simultaneously, landing right in that window.

**Verified non-causes:** not the `bin\bash.exe` wrapper (0/700 vs 4/788, not significant), not
concurrency alone (0/48 parallel), not mandatory ASLR (NOTSET), not a username with a period
(`Eric_Rash` has none), not duplicate msys DLLs (one only).

**Fixes applied:** hooks once used `"shell": "powershell"`; as of 2026-10-23 neither settings file
sets a shell field (Windows is desktop-app only since 10-21). (`shell` is a real hook field; Windows
defaults to bash.) Switching shell **requires rewriting POSIX commands** —
`[ ! -f X ] || node X` is a PowerShell syntax error; use `if (Test-Path X) { node X }`. stdin JSON
passes through the wrapper fine.

**Root-cause fix — APPLIED 2026-08-02** via `~/.claude/scripts/fix-msys-ad-stall.ps1` (run elevated):
static `/etc/passwd` (13 entries, incl. SYSTEM for scheduled tasks) + `/etc/group` (29) generated
with `mkpasswd -l -c` / `mkgroup -l -c` — never `-d`, which enumerates the whole domain — and
nsswitch set to `passwd: files` / `group: files` / `db_enum: builtin`. uid/gid and
`HOME=/c/Users/eric_rash` unchanged. Verified 550 consecutive clean launches (400 sequential +
150 concurrent), max 2.3 s. Backup `nsswitch.conf.bak-*` in `Git\etc`; `-Rollback` to undo.

**Verification gotcha that cost a run:** comparing the whole `id` string false-fails. Adding
`/etc/group` legitimately *enriches* the output — group names start resolving and the full
supplementary list appears (`gid=1049089` → `gid=1049089(Domain Users) groups=...,545(Users)`).
Compare **uid + primary gid only**. Also: an elevated shell's token includes `Administrators`,
so `id` output differs between elevated and normal shells — not a regression. And any script that
verifies by shelling out to bash must **retry**, since bash is the thing that intermittently
crashes; a single transient failure otherwise triggers a spurious rollback of a good config.

Gotcha when testing: `id`/`mkpasswd` reporting "command not found" from `bash -c` is just PATH
(non-login shell inherits Windows PATH) — use `bash -lc`, not evidence the tools are missing.

Related: [[keystoneos-verification-habits]]
