---
name: pwsh-launchd-wrapper-trap
description: "Swapping pwsh from powershell/tap to Homebrew core breaks every launchd .ps1 job: core's bin/pwsh is a bash wrapper launchd refuses (tested, rolled back 2026-10-24)"
metadata:
  type: project
---

The deprecated powershell/tap pwsh 7.5.2 is a real Mach-O binary; Homebrew core's powershell installs bin/pwsh as a bash wrapper (DOTNET_ROOT=... exec libexec/pwsh). launchd cannot start that wrapper as ProgramArguments[0] on this macOS. Related: [[automation-cadence]], [[cloud-push-launchd-blocked]].

**Why:** On 2026-10-24 brew install homebrew/core/powershell (7.6.8) made /opt/homebrew/bin/pwsh a #!/bin/bash wrapper; launchd killed com.keystone.morning and agysync with OS_REASON_CODESIGNING (Launch Constraint Violation, failure proc /bin/bash). Rolled back to the tap's 7.5.2 real binary within 5 minutes; jobs re-ran OK.

**How to apply:** Before the swap (tap disabled 2027-06-18; stack-check fails from 2027-03-01): prepend /bin/bash to ProgramArguments in every plist that starts /opt/homebrew/bin/pwsh (KeystoneOS/ops/com.keystone.*.plist; a test agent with /bin/bash /opt/homebrew/bin/pwsh ran OK), reload each, kickstart each, and test daily-backup-login.sh (it execs caffeinate ... pwsh). Core needs no admin password. Its dotnet dependency is ~700 MB.
