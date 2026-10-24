# RESTORE.md: rebuild Eric's Mac agent setup
Use this on a new, wiped or replaced Mac. Mac only. Checked against the live Mac 2026-10-24. Read it anywhere: `github.com/erash11/dotclaude/blob/main/RESTORE.md` (sign in as erash11), or Drive `_MACHINE/Backups/RESTORE.md` (each backup run refreshes it).

## 1. What lives where (rules for every kind of file: `~/.claude/STORAGE.md`)
| What | True copy | Backup |
|---|---|---|
| `~/.claude` settings, hooks, scripts, agents, session transcripts | GitHub `dotclaude` | CRASHBOX `claude/{agents,hooks,projects,scripts}` (not `settings.json`); Drive `claude-projects.tgz` (transcripts only) |
| Shell setup (`~/.zshrc`, `~/.zprofile`, `~/.zshenv`, `~/.gitconfig`) | local | Drive `shell-dotfiles.tgz` |
| Skills / working memory | GitHub `claude-skills` / `claude-global-memory` | CRASHBOX `claude/skills`, `claude/global-memory` |
| Memory compiler | GitHub `claude-memory-compiler` (code only) | CRASHBOX `claude/claude-memory-compiler`: the ONLY copy of `daily/`, `knowledge/`, `reports/` |
| DEV router files / projects | GitHub `DEV` / `erash11/<folder>` | Drive `_MACHINE/Cloud_Copy/DEV` (no DBs, no secrets) |
| DEV gitignored data, uncommitted edits, databases | local | CRASHBOX `DEV-repo-data/`, `DEV-working-tree/`, `DEV-nonrepo/`; DBs also Drive `dev-databases.tgz` |
| SecondBrain vault | GitHub `SecondBrain` | CRASHBOX `SecondBrain/` |
| Codex, Gemini, launchd jobs, Zotero | local (`~/Zotero` for Zotero) | Drive tgz files (Zotero at most weekly); CRASHBOX `codex/`, `gemini/`, `LaunchAgents/` |
| Documents | Drive `00_Primary_Storage_Drive/` | Google |
| Secrets | macOS Keychain, local `.env` | password manager only |

## 2. Accounts you need first
- GitHub `erash11`: every repo. Google (personal gmail): Drive backups. claude.ai: Claude Code sign-in. Then sign in again to OpenAI (Codex), Gemini, Fireflies, Zotero, VALD, Catapult and the claude.ai connectors.
- Get every password and 2FA code from the password manager. No backup holds a credential.

## 3. Clone the config repos
First run the first two lines of section 7. `gh` and `git` must exist before you clone.
```bash
curl -sI https://github.com | head -1    # must print an HTTP line; no network = every clone fails
gh auth login && gh auth setup-git       # account erash11; lets git clone the private repos
mkdir -p ~/.claude && cd ~/.claude && git init -b main
git remote add origin https://github.com/erash11/dotclaude.git && git fetch origin
git checkout -f origin/main -b main                       # -f replaces fresh-install files
[ -e ~/.claude/skills ] && mv ~/.claude/skills ~/.claude/skills.fresh-install
git clone https://github.com/erash11/claude-skills.git ~/.claude/skills
git clone https://github.com/erash11/claude-global-memory.git ~/.claude/global-memory
git clone https://github.com/erash11/claude-memory-compiler.git ~/.claude/claude-memory-compiler
git clone https://github.com/erash11/DEV.git ~/DEV
git clone https://github.com/erash11/SecondBrain.git ~/SecondBrain    # backup syncs this exact path
cp ~/.claude/machine.macos.md ~/.claude/machine.md
for p in ~/.claude ~/.claude/skills ~/.claude/global-memory ~/.claude/claude-memory-compiler ~/DEV ~/SecondBrain; do git -C "$p" remote get-url origin; done
```
- Expect six `https://github.com/erash11/...` URLs, and `ls ~/.claude/skills | wc -l` = 48 right after the clone (the old Mac showed 60: 12 more are links into `~/.agents/skills`; add their names to `~/.claude/skills/.git/info/exclude` before reinstalling them, or the nightly backup commits them).
- Never remove the `/*` line at the top of `~/DEV/.gitignore`. It keeps the thin repo out of the project repos.
- Clone each folder the area indexes name (`~/DEV/FOOTBALL.md`, `PERFORMANCE.md`, `RESEARCH.md`, `PLATFORM.md`, `PROGRAM.md`, `PERSONAL.md`) into `~/DEV/<folder>` from `erash11/<folder>`; `Website` clones from `erash11/AppliedPerformance-Site`. Use `gh repo list erash11 --no-archived --limit 300` only as a cross-check: an extra top-level folder in `~/DEV` makes every backup run end ERROR (`manifest-unmanaged`).
- `Football` is also a thin repo: clone it, then its 16 nested repos inside it. `LibraryProject` holds 1 (`ZoteroInjestion`). `SpecialRequests` holds 2 nested folders with health data: they come back only from CRASHBOX `DEV-nonrepo/SpecialRequests`. `DexaProject` holds health data and has no repo: it lives in Drive `00_Primary_Storage_Drive/DexaProject`. Never put it on GitHub, in chat or in another service.

## 4. Pull the machine backups from Drive
First route (gws is not signed in on a fresh Mac): open drive.google.com > My Drive > `_MACHINE` > `Backups` > `Machine`. Download one file at a time (Drive zips a multi-file download).
```bash
cd ~/Downloads && mkdir -p ~/.codex && tar -xzf claude-projects.tgz -C ~/.claude    # -> ~/.claude/projects
tar -xzf codex-sessions.tgz -C ~/.codex; tar -xzf codex-sqlite.tgz -C ~/.codex; tar -xzf codex-config.tgz --strip-components 1 -C ~/.codex   # config.toml, hooks.json, rules, history
tar -xzf shell-dotfiles.tgz --strip-components 1 -C ~   # ~/.zshrc, ~/.zprofile, ~/.zshenv, ~/.gitconfig (Keychain lookups only, no values)
tar -xzf gemini.tgz -C ~                         # -> ~/.gemini (OAuth files left out: sign in again)
tar -xzf launchagents.tgz -C ~/Library           # -> ~/Library/LaunchAgents (load in section 7)
tar -xzf dev-databases.tgz --strip-components 1 -C ~/DEV   # after the project clones: live DBs into their repos
tar -xzf zotero.tgz -C ~                         # -> ~/Zotero; quit Zotero first
```
- Each tgz is one copy, replaced on each run, with no history. `codex-memories.tgz` and `codex-agents.tgz` are no longer made: skip them. Receipts: `Machine/_receipts/run-<id>.txt`. DEV files not on GitHub: copy the folders you need from `_MACHINE/Cloud_Copy/DEV` in the Drive app.

Second route, once gws signs in. Run from `~/Downloads`: gws writes `--output` only inside the current folder.
```bash
npm install -g @googleworkspace/cli && gws auth login -s drive   # no OAuth client? save it as ~/.config/gws/client_secret.json, or run gws auth setup (needs gcloud-cli)
gws drive files list --params "{\"q\":\"'1ALag3z9Ew5ihBZKjt_1yZzsNpX-K4UJn' in parents and trashed = false\",\"fields\":\"files(id,name,size,modifiedTime)\"}"
gws drive files get --params '{"fileId":"<id>","alt":"media"}' --output ./<name>.tgz
```

## 5. CRASHBOX SSD
- Path `/Volumes/CRASHBOX/AssistantBackup` (500 GB, exFAT). The daily backup writes to it only if it is mounted when that day's run happens (12:00-17:00 on AC power, or at login). It is additive: it never deletes.
- Holds `claude/{agents,claude-memory-compiler,global-memory,hooks,projects,scripts,skills}`, `codex/` (no `work/`, `packages/`, `plugins/`, `.tmp/`, `cache/`, `computer-use/`, `visualizations/`, `auth.json`), `gemini/`, `LaunchAgents/`, `SecondBrain/` (no `.git`), `DEV-repo-data/<repo>/`, `DEV-working-tree/<repo>/`, `DEV-nonrepo/<folder>/`, `_receipts/`, and `DexaProject/` (identifiable health data, copied from its one Drive folder: never GitHub, chat or another service).
- Clone first. Then overlay:
```bash
SSD=/Volumes/CRASHBOX/AssistantBackup
rsync -a "$SSD/DEV-repo-data/" ~/DEV/ && rsync -a "$SSD/DEV-working-tree/" ~/DEV/
for d in daily knowledge reports; do rsync -a "$SSD/claude/claude-memory-compiler/$d/" ~/.claude/claude-memory-compiler/$d/; done
```
- Copy a `DEV-nonrepo/<folder>` only when GitHub has no repo for it: its copy can hold an older `.git`. The SSD copies are never pruned, so after the overlay run `git -C ~/DEV/<repo> status` and `git checkout -- <file>` for any file the last commit already covers. In each repo that took CRASHBOX files, run `git config core.fileMode false` (exFAT has no Unix permissions).

## 6. Secrets
- The Keychain does not come back from any backup. Enter each value again from the password manager. Project `.env` key names and where to reissue each: `~/.claude/CREDENTIALS.md`.
- Items (names only): `FIREFLIES_API_KEY` (read by `~/.zshrc`), `typesafe-api-key` (read by `~/.zshenv` into `TYPESAFE_API_KEY`), `Claude Code-credentials` (Claude Code writes it at sign-in; do not add it).
- Add: `security add-generic-password -U -s FIREFLIES_API_KEY -a "$USER" -w` (a final `-w` prompts, so the value stays out of shell history). Check one: `security find-generic-password -s FIREFLIES_API_KEY -a "$USER"` (no `-w`: it prints the item, not the value).

## 7. Tooling
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" && echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile && eval "$(/opt/homebrew/bin/brew shellenv)"
brew install gh git go node powershell/tap/powershell ripgrep tmux rclone yt-dlp ocrmypdf poppler pipx r ghidra
brew install --cask google-drive gcloud-cli
npm install -g @openai/codex @googleworkspace/cli @google/gemini-cli   # old Mac also had @playwright/cli opencode-ai @earendil-works/pi-coding-agent
curl -LsSf https://astral.sh/uv/install.sh | sh          # uv -> ~/.local/bin/uv, NOT Homebrew
curl -fsSL https://claude.ai/install.sh | bash            # claude -> ~/.local/bin/claude, NOT npm; then open a new terminal
uv tool install 'memsearch[onnx]' && uv tool install cli-anything-hub && memsearch config set embedding.provider onnx
cd ~/.claude/claude-memory-compiler && uv sync
python3 ~/DEV/TypeSafe_Sandbox/skill_router/install.py   # restores ~/.claude/skill-router (in no backup)
mkdir -p ~/.claude/permission-gate && cp ~/DEV/TypeSafe_Sandbox/permission_gate/{rules,sanitize,shadow_hook}.py ~/.claude/permission-gate/
# third-party skills (pp-espn, pp-fireflies, ...): since 2026-10-24 the daily backup uploads ~/.agents as
# _MACHINE/Backups/Machine/agents.tgz. Unpack it first: tar -xzf agents.tgz -C ~
mkdir -p ~/.agents && touch ~/.agents/.sync-v2-ready && bash ~/.claude/skills/sync-to-codex.sh   # fresh Mac: rebuilds ~/.agents/skills and ~/.codex/skills
ln -s ~/.claude/AGENTS.md ~/.codex/AGENTS.md && ln -s ~/.claude/hooks ~/.codex/hooks && ln -s ~/DEV/CLI_Dev/printing-press ~/printing-press
ln -s "$HOME/Library/CloudStorage/GoogleDrive-eric.rash11@gmail.com/My Drive/00_Primary_Storage_Drive" ~/DEV/_DRIVE
```
- Homebrew Python 3.14 is PEP 668-managed. Never `pip install` globally. Use a venv or `uv`. Go CLIs into `~/go/bin`: `go install github.com/mvanhorn/cli-printing-press/v4/cmd/cli-printing-press@latest`, and `go install github.com/mvanhorn/printing-press-library/library/<category>/<name>/cmd/<name>-pp-cli@latest` for espn, fireflies, flight-goat, movie-goat, recipe-goat (old Mac: `go version -m ~/go/bin/*` lists each path). The two zotero binaries build locally from `~/DEV/CLI_Dev/printing-press/library/zotero-research-library`; the `zotero` MCP in `~/.claude.json` runs the `-pp-mcp` one.
- Never run `memsearch index` by hand. It deletes every source outside the paths you give. The next daily backup rebuilds the index.
- Load the launchd jobs LAST, after you extract every Drive tgz: the first backup run replaces each Drive tgz. launchd does not expand `~` or `$HOME`. If the account is not `kristinarash`, fix the paths in each plist first.
```bash
grep -l /Users/kristinarash ~/Library/LaunchAgents/com.keystone.*.plist
for f in ~/Library/LaunchAgents/com.keystone.*.plist; do
  [ "$(basename "$f")" = com.keystone.rituals.plist ] && continue   # off on purpose since 2026-09-24
  launchctl bootstrap gui/$(id -u) "$f"
done
launchctl disable gui/$(id -u)/com.keystone.rituals
launchctl list | grep -c 'com\.keystone\.'      # expect 15; com.google.keystone.* is Google Updater, not ours
```
- Give Terminal Full Disk Access: System Settings > Privacy & Security > Full Disk Access > Terminal. `com.keystone.clouddrivepush` opens `cloud-push.command` in Terminal, because a job started by launchd cannot list Drive folders. Full Disk Access on Python.app or rsync does not help.
- The daily backup runs only on AC power, hourly 12:00-17:00 and at login. The first run is slow. Verify: `pwsh -NoProfile -File ~/.claude/skills/claude-stack-doctor/scripts/stack-check.ps1` must print `ALL CLEAR`.

## 8. Lessons from the 2026-08-05 restore that still apply
- DEV lives at `~/DEV`, not `~/Desktop/DEV`. A clone into a folder that already exists fails, and nothing reports it: move the old folder aside first.
- To repair a folder that already holds overlay files: `git init -b main`, `git remote add origin <url>`, `git fetch origin`, `git reset --mixed origin/main`, `git branch -u origin/main`, then `git ls-files -z --deleted | xargs -0 git checkout --`. This keeps the overlay edits.
- A plist whose job calls pwsh, git, uv or a Go CLI needs an `EnvironmentVariables` PATH with `/opt/homebrew/bin`, `/Users/<you>/.local/bin` (uv, claude) and `/Users/<you>/go/bin`, as the live plists have.
- The old `restore.command`, `START-HERE.md`, `MIGRATION-MACOS.md` and `RECOVERY-INVENTORY.md` were retired 2026-10-24 (Windows era; still in dotclaude git history). Do not use `backup-manifest.json` as a repo list: many `remote` and `isRepo` fields date from 2026-09-19.

## 9. Deliberately NOT backed up
- `~/.codex/work` (disposable clones), caches, `.venv`, `node_modules`, tool binaries. The memsearch index `~/.memsearch/milvus.db` (the daily backup rebuilds it).
- All credentials: `.env` files, `.credentials.json`, OAuth tokens, `~/.config/gws`, Gemini `oauth_creds.json`, browser profiles.
- Known gaps (in no backup; rebuild by hand): `~/.claude.json` (the `zotero` MCP server; may hold tokens, so it stays local), `~/.memsearch/config.toml` (one line: `memsearch config set embedding.provider onnx`), and `~/.config/gws/client_secret.json`.

## Keeping this document honest
When a backup, repo, store or scheduled job changes, update this file in the same session and commit it to dotclaude.
