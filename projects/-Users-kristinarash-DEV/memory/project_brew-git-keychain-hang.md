---
name: brew-git-keychain-hang
description: "After a brew git upgrade, git to GitHub hung on a Keychain prompt; git now signs in through gh (2026-10-25)"
metadata:
  type: project
---

On 2026-10-25 a Homebrew upgrade of git made every git pull and push to GitHub hang on 'git credential-osxkeychain get' (macOS Keychain dialog for the new ad-hoc-signed helper). Fixed with 'gh auth setup-git': github.com and gist.github.com now use gh as the credential helper.

**Why:** brew ships an ad-hoc-signed git-credential-osxkeychain, so each new build triggers a Keychain allow-access dialog; pulls, pushes, autopush and the backup wait on it silently.

**How to apply:** If git to GitHub hangs after a brew upgrade, look in ps for 'git credential-osxkeychain get', and check that 'git config --global --get-regexp credential' still sends github.com to '!/opt/homebrew/bin/gh auth git-credential'. gh reads its token through Apple's /usr/bin/security, so it does not prompt after upgrades. Old ~/.gitconfig: ~/.claude/backups/gitconfig.pre-gh-helper-2026-10-25. Related: brew openssl@3 now tracks the 3.5 LTS (3.6.4 -> 3.5.9 looks like a downgrade but is intended) and rebuilds node and python@3.14; DEV venvs use /opt/homebrew/opt/python@3.14, so patch upgrades do not break them. See [[path-shadowing-and-cleanup]], [[pwsh-launchd-wrapper-trap]].
