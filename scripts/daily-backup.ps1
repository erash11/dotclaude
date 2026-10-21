# daily-backup.ps1 — KeystoneOS durability automation (macOS port, 2026-08-05)
# Runs daily at 00:30 via launchd agent "com.keystone.dailybackup".
# Windows original preserved at daily-backup.ps1.win-orig.
#
# Jobs:
#   1. Git-sync the memory repos (auto-commit + push).
#   2. Snapshot non-git stores to the cloud targets (rsync, ADDITIVE - no delete).
#   3. Manifest-driven coverage. backup-manifest.json is the single authority.
#
# COVERAGE MODEL — three states, all covered (each gap was a real failure):
#   tracked + committed + pushed  -> GitHub
#   untracked or ignored          -> SSD (captureOrphans)
#   tracked + modified            -> SSD (captureWorkingTree)
# DEFAULT-DENY: a DEV directory absent from the manifest raises an error.
# Never reintroduce repo-detection as a coverage test.

param([switch]$DryRun)

$ErrorActionPreference = 'Continue'
$U = $HOME
# ~/DEV on the Mac, ~/Desktop/DEV on Windows. Resolved the same way as memsearch-sync.js
# (2026-09-30): the hardcoded "$U/DEV" made every Windows run fall back to the 5-path index
# list and report all 52 DEV dirs "absent from disk".
$DevRoot = @("$U/DEV", "$U/Desktop/DEV") | Where-Object { Test-Path -LiteralPath "$_/KeystoneOS" } | Select-Object -First 1
if (-not $DevRoot) { $DevRoot = "$U/DEV" }
$LogDir = "$U/.claude/scripts/logs"
$LogFile = "$LogDir/daily-backup.log"
$StateFile = "$LogDir/backup-state.json"
$ErrorsLog = "$U/.claude/global-memory/transcripts/.errors.log"
$Errors = [System.Collections.Generic.List[string]]::new()
# Per-copy wall-clock ceiling for Invoke-Rsync's watchdog. Generous: the largest healthy
# snapshot here finishes in seconds, so anything near this is wedged, not busy.
$RsyncTimeoutSec = 900
$Results = [System.Collections.Generic.List[object]]::new()

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Log($msg) {
    $line = "{0} {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $msg
    Add-Content -Path $LogFile -Value $line
    Write-Output $line
}

function Sync-Repo($path, $branch) {
    $name = Split-Path $path -Leaf
    if ($path -eq "$U/.claude") { $name = 'dotclaude' }
    if (-not (Test-Path (Join-Path $path '.git'))) { $Errors.Add("repo-missing:$name"); return }
    Push-Location $path
    try {
        git fetch origin 2>&1 | Out-Null
        $counts = git rev-list --left-right --count "origin/$branch...HEAD" 2>$null
        $behind = 0; $ahead = 0
        if ($counts) { $p = $counts -split '\s+'; $behind = [int]$p[0]; $ahead = [int]$p[1] }
        $dirty = (git status --porcelain | Measure-Object).Count

        if ($behind -gt 0 -and $ahead -gt 0) {
            # True divergence: both sides carry commits. Never merge blindly from
            # automation - this one needs a human.
            $Errors.Add("repo-diverged:$name")
            Log "REPO $name : DIVERGED (behind=$behind ahead=$ahead dirty=$dirty) - manual reconcile needed"
            return
        }
        if ($behind -gt 0) {
            # Behind only, whatever the tree looks like. A dirty tree is NOT a reason to
            # refuse: --ff-only succeeds when the local changes do not overlap the incoming
            # commits, and git refuses on its own when they do. Let git decide.
            #
            # R10-02: the old pre-check treated "behind + dirty" as divergence and returned
            # before asking git. dotclaude and global-memory are permanently dirty, because
            # live session transcripts and .jsonl logs are written into them while a session
            # runs, so every day the other machine pushed produced a false repo-diverged
            # error (2026-09-18 and 2026-09-19 both did) and skipped the sync entirely.
            if ($DryRun) {
                # R10-03: do not claim a fast-forward that was never attempted. A dirty file
                # that the incoming commits also touch makes --ff-only refuse, and the old
                # dry-run line reported "would fast-forward" anyway - which is how a dry run
                # came back OK (0 errors) on 2026-09-19 for a state the real run would have
                # refused. Compare the dirty paths against the incoming changed paths instead.
                $incoming = @(git diff --name-only HEAD "origin/$branch" 2>$null)
                $dirtyPaths = @(git status --porcelain | ForEach-Object { ($_ -replace '^.{3}', '').Trim('"') })
                $clash = @($dirtyPaths | Where-Object { $incoming -contains $_ })
                if ($clash.Count -gt 0) {
                    Log "REPO $name : [dry-run] would be REFUSED - $($clash.Count) dirty file(s) also changed upstream: $($clash -join ', ')"
                } else {
                    Log "REPO $name : [dry-run] would fast-forward $behind commit(s)"
                }
            } else {
                $pullOut = git pull --ff-only origin $branch 2>&1
                if ($LASTEXITCODE -ne 0) {
                    # Real overlap, or a non-ff remote. Now it is worth an error, and git's
                    # own message says which file is in the way.
                    $Errors.Add("repo-behind-blocked:$name")
                    Log "REPO $name : FAST-FORWARD REFUSED (behind=$behind ahead=$ahead dirty=$dirty) - manual reconcile needed"
                    foreach ($l in $pullOut) { if ("$l".Trim()) { Log "REPO $name : PULL ERR | $l" } }
                    return
                }
                Log "REPO $name : fast-forwarded $behind commit(s)"
            }
        }
        if ($dirty -gt 0) {
            if ($DryRun) {
                Log "REPO $name : [dry-run] would commit $dirty change(s)"
            } else {
                git add -A 2>&1 | Out-Null
                git diff --cached --quiet 2>$null
                if ($LASTEXITCODE -eq 0) {
                    # Dirty but nothing stageable (e.g. modified content inside a
                    # submodule). Not a failure - there is simply nothing to commit.
                    Log "REPO $name : $dirty change(s) but nothing stageable - no commit"
                } else {
                    # R10-01: capture and check the commit, as the push below already
                    # does. A commit refused by a hook (the skills repo's pre-commit
                    # rejects symlinks) used to be thrown away by Out-Null and logged
                    # as "committed": a silent failure that repeated every day.
                    $commitOut = git commit -m ("chore: daily backup sync {0} [auto]" -f (Get-Date -Format 'yyyy-MM-dd')) 2>&1
                    if ($LASTEXITCODE -ne 0) {
                        $Errors.Add("repo-commit:$name")
                        Log "REPO $name : COMMIT FAILED"
                        foreach ($l in $commitOut) { if ("$l".Trim()) { Log "REPO $name : COMMIT ERR | $l" } }
                        return
                    }
                    Log "REPO $name : committed $dirty change(s)"
                }
            }
        }
        $counts = git rev-list --left-right --count "origin/$branch...HEAD" 2>$null
        $ahead = if ($counts) { [int](($counts -split '\s+')[1]) } else { 0 }
        if ($DryRun -and $dirty -gt 0) { $ahead = 1 }
        if ($ahead -gt 0) {
            $attempt = 1
            if (-not $DryRun) {
                # Capture push output instead of discarding it. Scheduled runs have failed
                # to push for weeks with no recorded reason (2026-09-02 handoff); Out-Null
                # threw the error text away. Success stays silent - only failures log.
                #
                # R10-04: retry a failed push. On 2026-09-17 a whole day's push was lost to a
                # transient 'curl 55 Recv failure / remote end hung up' and nothing reattempted
                # it until the next day's run. Only transient failures are retried. A rejected
                # or unauthorised push fails identically every time, so retrying it would just
                # delay the error behind a longer log block - those bail out immediately.
                $Deterministic = '\[rejected\]|non-fast-forward|fetch first|Updates were rejected|Permission denied|403 Forbidden|Authentication failed|does not match any|Repository not found'
                $delays = @(5, 15)
                while ($true) {
                    $pushOut = git push origin $branch 2>&1
                    if ($LASTEXITCODE -eq 0) { break }
                    $text = ($pushOut | Out-String)
                    if ($text -match $Deterministic -or $attempt -gt $delays.Count) {
                        $Errors.Add("repo-push:$name")
                        Log "REPO $name : PUSH FAILED after $attempt attempt(s)"
                        foreach ($l in $pushOut) { if ("$l".Trim()) { Log "REPO $name : PUSH ERR | $l" } }
                        return
                    }
                    $wait = $delays[$attempt - 1]
                    foreach ($l in $pushOut) { if ("$l".Trim()) { Log "REPO $name : PUSH ERR (attempt $attempt) | $l" } }
                    Log "REPO $name : push attempt $attempt failed - transient, retrying in ${wait}s"
                    Start-Sleep -Seconds $wait
                    $attempt++
                }
            }
            $suffix = if ($attempt -gt 1) { " on attempt $attempt" } else { '' }
            Log "REPO $name : $(if ($DryRun) { '[dry-run] would push' } else { "pushed$suffix" })"
        }
        $Results.Add(@{ kind='repo'; name=$name; status='OK' })
    } finally { Pop-Location }
}

# CREDENTIAL DENY-LIST — applies to every capture path. Do not weaken.
# Files are gitignored for two OPPOSITE reasons: too big (back up) and secret
# (never). On 2026-08-04 the capture swept 7,633 files of a live authenticated
# Outlook browser profile onto a portable drive. This list is why it cannot recur.
# 2026-08-05 restore finding: five project .env files DID reach the transport
# drive via a pre-deny-list capture - the list below now provably excludes them.
$CredDenyDirs  = @('secrets', 'owa-profile', 'edge-profile', 'chrome-profile', '.aws', '.ssh')
$CredDenyFiles = @('.env', '.env.local', '.env.production', '.env.production.local',
                   'Cookies', 'Login Data', 'Local State', '.credentials.json',
                   'gmail_token.json', 'gmail_credentials.json', 'token.json', 'credentials.json')
# Regex form (forward-slash paths). '.env.example' is deliberately NOT denied.
$CredDenyRe = '(^|/)(secrets|owa-profile|edge-profile|chrome-profile|\.aws|\.ssh)(/|$)' +
              '|(^|/)\.env(\.local|\.production(\.local)?)?$' +
              '|(^|/)(Cookies|Login Data|Local State)$' +
              '|(^|/)(\.credentials|gmail_token|gmail_credentials|token|credentials)\.json$'

# rsync wrapper. ADDITIVE - never --delete: a mirror faithfully replicates the
# deletion you are trying to recover from. (The Windows original mirrored the
# cloud snapshots with /MIR; the macOS port makes every destination additive.)
function Invoke-Rsync($src, $dst, [string[]]$excludeDirs, [string[]]$excludeFiles, [string[]]$extraArgs = @()) {
    if (-not (Test-Path $src)) { return $null }
    New-Item -ItemType Directory -Force -Path $dst | Out-Null
    # --modify-window=5: the CloudStorage mount rounds mtimes it did not itself write,
    # typically 1-2s below what rsync set. rsync's quick-check is size+mtime, so a
    # byte-identical file whose stored mtime drifted reads as changed and is re-sent
    # EVERY run, forever. Measured 2026-08-14 on codex/sessions: 256/256 files
    # size-identical, yet 134 re-sent nightly (252MB) purely on 1-2s skew. That
    # perpetual write load is what fed the FUSE wedge below. A 5s window absorbs the
    # rounding without hiding real edits (a real edit moves size or mtime far more).
    # Do NOT swap this for --size-only: claude-projects has genuine same-size edits
    # that only mtime catches.
    $a = @('-a', '--no-specials', '--no-devices', '--modify-window=5') + $extraArgs
    if ($DryRun) { $a += '-n' }
    foreach ($d in $excludeDirs)  { $a += "--exclude=$d/" }
    foreach ($f in $excludeFiles) { $a += "--exclude=$f" }
    $a += @("$src/", "$dst/")
    # Guard the launch, and clear $LASTEXITCODE first: if rsync never runs, a stale
    # exit code from an earlier command would make a zero-byte copy report OK.
    $rsync = '/usr/bin/rsync'
    if (-not (Test-Path $rsync)) {
        $Errors.Add('rsync-missing')
        Log "RSYNC binary not found at $rsync - copy SKIPPED (not a success)"
        return $false
    }
    # WATCHDOG. rsync against the CloudStorage mount can wedge indefinitely. Observed
    # 2026-08-14 on codex/sessions with an ALREADY-COMPLETE 256/256 mirror: the client and
    # its --server receiver both sat at ~0.02s CPU across 85 minutes and ignored SIGTERM.
    # Because the Drive snapshots run BEFORE the SSD capture, one wedged copy silently
    # costs the whole orphan/working-tree layer for that night - the run never gets there.
    # So: no single copy may block the run. Bound it and move on.
    # Two details that cost hours to learn, do not "simplify" them away:
    #   - SIGTERM does not clear a wedged rsync. Only SIGKILL does.
    #   - The --server child's argv[0] is bare "rsync", not the full path, so an anchored
    #     pattern like "^/usr/bin/rsync" matches the client ONLY and strands the receiver.
    #     Match on the destination path instead - it appears in both command lines.
    $tmpOut = [IO.Path]::GetTempFileName()
    $global:LASTEXITCODE = 0
    $job = Start-Job -ScriptBlock {
        param($exe, $argv, $out)
        & $exe @argv *> $out
        $LASTEXITCODE
    } -ArgumentList $rsync, $a, $tmpOut

    if (Wait-Job $job -Timeout $RsyncTimeoutSec) {
        $code = [int](Receive-Job $job)
        Remove-Job $job -Force -ErrorAction SilentlyContinue
    } else {
        Stop-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -Force -ErrorAction SilentlyContinue
        & /usr/bin/pkill -9 -f -- "$dst" 2>$null
        $code = 124
        $Errors.Add('rsync-timeout')
        Log "RSYNC TIMEOUT after ${RsyncTimeoutSec}s, killed (-9): $src -> $dst"
    }

    if (Test-Path $tmpOut) {
        Get-Content $tmpOut -Tail 3 -ErrorAction SilentlyContinue | Add-Content -Path $LogFile
        Remove-Item $tmpOut -Force -ErrorAction SilentlyContinue
    }
    $global:LASTEXITCODE = $code
    return ($code -eq 0)
}

$GwsExe = @('/opt/homebrew/bin/gws', '/usr/local/bin/gws') | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $GwsExe) { $GwsExe = (Get-Command gws -ErrorAction SilentlyContinue).Source }
$DriveBackupsId  = '1uQrhPOPSrgBnR4bzH51xdw4Fd9v-GM0Q' # _MACHINE/Backups
$DriveMachineId  = '1ALag3z9Ew5ihBZKjt_1yZzsNpX-K4UJn' # _MACHINE/Backups/Machine
$DriveReceiptsId = '1uur-TnO4LMD91yYiPatTBb6DpnlyP89U' # _MACHINE/Backups/Machine/_receipts
$DriveRestoreId  = '1yeDWZNXG-nR3RzmyCPEuEiW-07nYBAkf' # _MACHINE/Backups/RESTORE.md

function Invoke-GwsJson([string[]]$gwsArgs) {
    $out = & $GwsExe @gwsArgs 2>&1
    $code = $LASTEXITCODE
    $jsonLines = @($out | Where-Object { "$_" -notmatch '^Using keyring backend:' })
    $text = ($jsonLines -join "`n").Trim()
    if ($code -ne 0 -or -not $text) {
        # Log gws's own error text so a failed upload says why. shortcut: first 300 chars only, enough for the error line.
        $shown = if ($text.Length -gt 300) { $text.Substring(0, 300) } else { $text }
        Log "GWS-ERR exit=$code $($gwsArgs[0]) $($gwsArgs[1]) : $shown"
        return $null
    }
    try { return ($text | ConvertFrom-Json) } catch { return $null }
}

function Snapshot-Gws($src, $archiveName, [string[]]$extraXD = @()) {
    if (-not (Test-Path $src)) { Log "SNAP skip (missing): $src"; return }
    if ($DryRun) {
        Log "SNAP-GWS $src -> _MACHINE/Backups/Machine/$archiveName : [dry-run] would archive and upload via gws"
        $Results.Add(@{ kind='snapshot'; name=$archiveName; status='OK' })
        return
    }
    if (-not $GwsExe) {
        $Errors.Add("snapshot:$archiveName")
        Log "SNAP-GWS $src -> $archiveName : FAILED (gws binary not found)"
        return
    }
    $tmpDir = Join-Path ([IO.Path]::GetTempPath()) "gws-snap-$([guid]::NewGuid().ToString('N'))"
    New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null
    try {
        $xd = @('node_modules', '.venv', '__pycache__', '.git', 'cache', 'tmp') + $extraXD
        $tarArgs = @('-czf', "$tmpDir/$archiveName")
        foreach ($d in $xd) { $tarArgs += "--exclude=$d" }
        $tarArgs += @('-C', (Split-Path $src -Parent), (Split-Path $src -Leaf))
        & /usr/bin/tar @tarArgs 2>$null
        if (-not (Test-Path "$tmpDir/$archiveName")) {
            $Errors.Add("snapshot:$archiveName")
            Log "SNAP-GWS $src -> $archiveName : FAILED (tar archive not created)"
            return
        }
        Push-Location $tmpDir
        try {
            $q = "name = '$archiveName' and '$DriveMachineId' in parents and trashed = false"
            $params = @{ q = $q; fields = 'files(id,name)' } | ConvertTo-Json -Compress
            $listObj = Invoke-GwsJson @('drive', 'files', 'list', '--params', $params)
            $existingId = if ($listObj -and $listObj.files -and $listObj.files.Count -gt 0) { $listObj.files[0].id } else { $null }
            # One retry after a short pause, so one failed upload does not mark the snapshot as failed.
            $resObj = $null
            for ($try = 1; $try -le 2 -and -not ($resObj -and $resObj.id); $try++) {
                if ($try -gt 1) { Start-Sleep -Seconds 10; Log "SNAP-GWS $archiveName : retry after failed upload" }
                if ($existingId) {
                    $upParams = @{ fileId = $existingId; fields = 'id,name,size' } | ConvertTo-Json -Compress
                    $resObj = Invoke-GwsJson @('drive', 'files', 'update', '--params', $upParams, '--upload', "./$archiveName")
                } else {
                    $resObj = Invoke-GwsJson @('drive', '+upload', "./$archiveName", '--parent', $DriveMachineId)
                }
            }
            if ($resObj -and $resObj.id) {
                Log "SNAP-GWS $src -> _MACHINE/Backups/Machine/$archiveName : OK (id=$($resObj.id))"
                $Results.Add(@{ kind='snapshot'; name=$archiveName; status='OK' })
            } else {
                $Errors.Add("snapshot:$archiveName")
                Log "SNAP-GWS $src -> $archiveName : FAILED (gws upload failed)"
            }
        } finally {
            Pop-Location
        }
    } finally {
        Remove-Item -LiteralPath $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

function Write-DriveReceiptGws($runId) {
    if ($DryRun) { return $true }
    if (-not $GwsExe) { return $false }
    $tmpDir = Join-Path ([IO.Path]::GetTempPath()) "gws-rcpt-$([guid]::NewGuid().ToString('N'))"
    New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null
    try {
        $fname = "run-$runId.txt"
        Set-Content -LiteralPath (Join-Path $tmpDir $fname) -Value "run=$runId written=$(Get-Date -Format 'o') host=$(hostname)" -Encoding UTF8
        Push-Location $tmpDir
        try {
            $resObj = Invoke-GwsJson @('drive', '+upload', "./$fname", '--parent', $DriveReceiptsId)
            return [bool]($resObj -and $resObj.id)
        } finally {
            Pop-Location
        }
    } catch {
        return $false
    } finally {
        Remove-Item -LiteralPath $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

function Snapshot($src, $dst, [string[]]$extraXD, [string[]]$extraArgs = @()) {
    if (-not (Test-Path $src)) { Log "SNAP skip (missing): $src"; return }
    # Drive targets live under _MACHINE/Backups (2026-10-14). If the mount has not refreshed and cannot see
    # that folder, rsync would mkdir a SECOND copy on Drive. Check Backups, not just _MACHINE: on 2026-10-16
    # the mount showed _MACHINE but still listed Backups at the root. Skip and flag instead.
    if ($GDrive -and $dst.StartsWith("$GDrive/") -and -not (Test-Path "$GDrive/_MACHINE/Backups")) {
        $Errors.Add('backup-target-offline:GoogleDrive/_MACHINE')
        Log "SNAP skip (Drive _MACHINE not visible on the mount yet): $dst"; return
    }
    $xd = @('node_modules', '.venv', '__pycache__', '.git', 'cache', 'tmp') + $extraXD
    $ok = Invoke-Rsync $src $dst $xd @() $extraArgs
    if ($ok -ne $true) {
        $Errors.Add("snapshot:$([IO.Path]::GetFileName($dst))")
        Log "SNAP $src -> $dst : FAILED (rsync exit $LASTEXITCODE)"
    } else {
        Log "SNAP $src -> $dst : OK"
        $Results.Add(@{ kind='snapshot'; name=$dst; status='OK' })
    }
}

function Snapshot-Additive($src, $dst, [string[]]$extraXD) {
    $xd = @('node_modules', '.venv', 'venv', '__pycache__', '.next', '.build', 'dist', '.pytest_cache') + $CredDenyDirs + $extraXD
    $ok = Invoke-Rsync $src $dst $xd $CredDenyFiles
    if ($null -eq $ok) { return $false }
    return $ok
}

# Capture what git will never carry. Authoritative source is git itself, not a
# path regex - an approximated .gitignore will drift from the real rules.
function Capture-RepoData($repoPath, $repoName, $ssdRoot) {
    $skipRe = '(^|/)(node_modules|\.venv|venv|__pycache__|\.next|\.build|dist|\.pytest_cache)(/|$)' + '|' + $CredDenyRe
    $copied = 0
    $denied = 0

    $orphans = @()
    $orphans += (git -C $repoPath ls-files --others --exclude-standard 2>$null)
    $orphans += (git -C $repoPath ls-files --others --ignored --exclude-standard 2>$null)
    foreach ($rel in ($orphans | Where-Object { $_ } | Sort-Object -Unique)) {
        if ($rel -match $skipRe) { if ($rel -match $CredDenyRe) { $denied++ }; continue }
        $s = Join-Path $repoPath $rel
        if (-not (Test-Path -LiteralPath $s -PathType Leaf)) { continue }
        $d = Join-Path $ssdRoot "DEV-repo-data/$repoName/$rel"
        if (-not $DryRun) {
            New-Item -ItemType Directory -Force -Path (Split-Path $d -Parent) | Out-Null
            try { Copy-Item -LiteralPath $s -Destination $d -Force -EA Stop; $copied++ } catch {}
        } else { $copied++ }
    }

    # Uncommitted edits to tracked files: GitHub holds only the last committed state.
    foreach ($rel in (git -C $repoPath diff --name-only 2>$null)) {
        $s = Join-Path $repoPath $rel
        if (-not (Test-Path -LiteralPath $s -PathType Leaf)) { continue }
        $d = Join-Path $ssdRoot "DEV-working-tree/$repoName/$rel"
        if (-not $DryRun) {
            New-Item -ItemType Directory -Force -Path (Split-Path $d -Parent) | Out-Null
            try { Copy-Item -LiteralPath $s -Destination $d -Force -EA Stop; $copied++ } catch {}
        } else { $copied++ }
    }
    if ($denied -gt 0) { Log "  DENY $repoName : $denied credential file(s) excluded by policy" }
    return $copied
}

# A receipt proves the destination accepted a write in THIS run.
function Write-Receipt($root, $runId) {
    if ($DryRun) { return $true }
    try {
        $rd = Join-Path $root '_receipts'
        New-Item -ItemType Directory -Force -Path $rd | Out-Null
        $f = Join-Path $rd "run-$runId.txt"
        Set-Content -LiteralPath $f -Value "run=$runId written=$(Get-Date -Format 'o') host=$(hostname)" -Encoding UTF8
        # CloudStorage mounts (Google Drive/OneDrive) can lag between write and
        # read-back visibility; retry briefly before declaring the receipt lost.
        for ($i = 0; $i -lt 6; $i++) {
            try {
                $back = Get-Content -LiteralPath $f -Raw -ErrorAction Stop
                if ($back -match [regex]::Escape($runId)) { return $true }
            } catch { }
            Start-Sleep -Seconds 5
        }
        return $false
    } catch { return $false }
}

$ManifestFile = "$U/.claude/scripts/backup-manifest.json"
$Manifest = $null
if (Test-Path $ManifestFile) {
    try { $Manifest = Get-Content -Raw $ManifestFile | ConvertFrom-Json }
    catch { $Errors.Add('manifest-unreadable'); }
}

$RunId = (Get-Date -Format 'yyyyMMdd-HHmmss')
Log "===== daily-backup start (DryRun=$DryRun) run=$RunId ====="

# --- 0. Platform guard ---
# This file is the macOS port. Every path below is macOS-specific: /usr/bin/rsync,
# $HOME/DEV, and the ~/Library/CloudStorage mount. On Windows it failed silently and
# WORSE than silently - snapshots logged "SNAP OK" off a stale $LASTEXITCODE, so the
# run reported success while copying nothing. That false receipt is the reason this
# guard exists. Refuse loudly instead of pretending.
# The Windows original is preserved at daily-backup.ps1.win-orig: restore and re-port
# it before re-enabling KeystoneOS-DailyBackup on any Windows host.
# Note $IsMacOS is a PowerShell 6+ automatic variable; on Windows PowerShell 5.1 it is
# undefined, so -not $null still aborts. That is the intended outcome.
if (-not $IsMacOS) {
    Log "ABORT: daily-backup.ps1 is the macOS port and will not run on this platform. No backup ran, and no receipt was written. See daily-backup.ps1.win-orig before re-enabling a scheduled task here."
    Log "===== daily-backup end: ABORTED (wrong platform) ====="
    exit 1
}

# --- 1. Git memory repos ---
Sync-Repo "$U/SecondBrain"      'main'
Sync-Repo "$U/.claude/global-memory"    'main'
Sync-Repo "$U/.claude"                  'main'
Sync-Repo "$U/.claude/skills"           'main'

# --- 2a. Personal-context snapshots -> personal Google Drive via gws API ---
# Uploaded directly as .tgz archives to _MACHINE/Backups/Machine (1ALag3z9Ew5ihBZKjt_1yZzsNpX-K4UJn)
# via gws API so a stale or wedged CloudStorage FUSE mount can never block nightly backups.
$GDrive = "$U/Library/CloudStorage/GoogleDrive-eric.rash11@gmail.com/My Drive"
Snapshot-Gws "$U/.claude/projects"      'claude-projects.tgz'  @('worktrees')
Snapshot-Gws "$U/.codex/memories"       'codex-memories.tgz'   @()
Snapshot-Gws "$U/.codex/sessions"       'codex-sessions.tgz'   @()
Snapshot-Gws "$U/.codex/agents"         'codex-agents.tgz'     @()
Snapshot-Gws "$U/.codex/sqlite"         'codex-sqlite.tgz'     @()
Snapshot-Gws "$U/.gemini"               'gemini.tgz'           @('antigravity_browser_profile')
Snapshot-Gws "$U/Library/LaunchAgents"  'launchagents.tgz'     @()

# --- 2a-db. Live DEV databases -> dev-databases.tgz (added 2026-10-20) ---
# cloud-push.py keeps DB files off the FUSE mount (sync can lock or corrupt a live DB).
# This stages a consistent copy of each live DB and uploads one archive through gws instead.
# Live = not under backups/, renv/, edge-profile/, .build/, printing-press-library/, and no
# 'before'/'backup' in the name. Dated backups stay local.
# shortcut: re-uploads the whole archive every night (~1 GB) and keeps only one cloud copy
# (update in place, no history); add a skip-if-unchanged hash check if upload time hurts.
function Snapshot-Databases {
    $stage = Join-Path ([IO.Path]::GetTempPath()) "dev-db-$([guid]::NewGuid().ToString('N'))"
    $root = Join-Path $stage 'dev-databases'
    New-Item -ItemType Directory -Force -Path $root | Out-Null
    try {
        $prune = @('node_modules', '.venv', 'venv', '.git', 'renv', 'edge-profile', '.build', 'printing-press-library', 'backups')
        $findArgs = @("$U/DEV", '(')
        foreach ($p in $prune) { $findArgs += @('-name', $p, '-o') }
        $findArgs = $findArgs[0..($findArgs.Count - 2)] + @(')', '-prune', '-o', '-type', 'f',
            '(', '-name', '*.duckdb', '-o', '-name', '*.db', '-o', '-name', '*.sqlite', '-o', '-name', '*.sqlite3', ')',
            '!', '-iname', '*before*', '!', '-iname', '*backup*', '-print')
        $dbs = @(& /usr/bin/find @findArgs 2>$null)
        $ok = 0
        foreach ($src in $dbs) {
            $rel = $src.Substring("$U/DEV/".Length)
            $dst = Join-Path $root $rel
            New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null
            $buf = New-Object byte[] 15
            $fs = [IO.File]::OpenRead($src)
            try { [void]$fs.Read($buf, 0, 15) } finally { $fs.Dispose() }
            $head = [Text.Encoding]::ASCII.GetString($buf)
            if ($head -eq 'SQLite format 3') {
                # .backup gives a consistent copy even if a writer has it open.
                & /usr/bin/sqlite3 $src ".backup '$dst'" 2>$null
                $check = & /usr/bin/sqlite3 $dst 'PRAGMA quick_check;' 2>$null
                if ($check -ne 'ok') { $Errors.Add("db:$rel"); Log "DB $rel : FAILED (sqlite check: $check)"; continue }
            } else {
                # DuckDB: a plain copy is only safe when no process has the file open.
                $holders = & /usr/sbin/lsof -t -- $src 2>$null
                if ($holders) { $Errors.Add("db:$rel"); Log "DB $rel : SKIPPED (open by pid $($holders -join ','))"; continue }
                Copy-Item -LiteralPath $src -Destination $dst
                if (Test-Path -LiteralPath "$src.wal") { Copy-Item -LiteralPath "$src.wal" -Destination "$dst.wal" }
            }
            $ok++
        }
        Log "DB staged $ok of $($dbs.Count) live databases"
        if ($ok -gt 0) { Snapshot-Gws $root 'dev-databases.tgz' @() }
    } finally {
        Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue
    }
}
Snapshot-Databases

# --- 2b. Manifest-driven DEV coverage ---
$B = $null
if ($Manifest -and $Manifest.destinations.baylor.root) {
    if ($Manifest.destinations.baylor.deprecated) {
        # Deprecated destination (access ending): OneDrive dehydrates files and
        # rsync fails with mmap deadlock errors, polluting every run with
        # snapshot failures for a target that is already scheduled to disappear.
        Log "TARGET baylor deprecated in manifest - snapshots to it SKIPPED"
    }
    else { $B = $Manifest.destinations.baylor.root }
}
$SsdRoot = $null
$SsdOnline = $false

if ($Manifest) {
    $SsdRoot = $Manifest.destinations.ssd.root
    $SsdOnline = Test-Path $SsdRoot
    if (-not $SsdOnline) {
        # Optional destination: warn loudly, never fail silently, never block the run.
        # optional:true in the manifest means an absent SSD is a warning, not an
        # error — otherwise every run ends ERROR until a drive is attached.
        if (-not $Manifest.destinations.ssd.optional) { $Errors.Add('backup-target-offline:SSD') }
        Log "TARGET SSD $SsdRoot NOT MOUNTED - orphan and working-tree capture SKIPPED this run"
    }

    # DEFAULT-DENY: a DEV directory absent from the manifest is an error, not a skip.
    $declared = @($Manifest.paths | Where-Object { $_.path -like 'DEV/*' } | ForEach-Object { $_.path -replace '^DEV/', '' })
    # Symlinks are not DEV projects. _DRIVE points at the Google Drive primary
    # storage drive, which is a backup DESTINATION, not a source - declaring it
    # in the manifest would rsync Drive into the SSD backup (and isRepo:false
    # snapshots unconditionally, ignoring destinations[]).
    $onDisk = @(Get-ChildItem $DevRoot -Directory | Where-Object { $_.Name -notmatch '^\.' -and -not $_.LinkType } | Select-Object -ExpandProperty Name)
    $unmanaged = @($onDisk | Where-Object { $declared -notcontains $_ })
    if ($unmanaged.Count -gt 0) {
        $Errors.Add("manifest-unmanaged:$($unmanaged -join '|')")
        Log "MANIFEST $($unmanaged.Count) unmanaged DEV dir(s): $($unmanaged -join ', ') - add to backup-manifest.json"
    }
    $missing = @($declared | Where-Object { $onDisk -notcontains $_ })
    if ($missing.Count -gt 0) { Log "MANIFEST $($missing.Count) declared dir(s) absent from disk: $($missing -join ', ')" }

    foreach ($entry in ($Manifest.paths | Where-Object { $_.path -like 'DEV/*' })) {
        $name = $entry.path -replace '^DEV/', ''
        $src = "$DevRoot/$name"
        if (-not (Test-Path $src)) { continue }

        if (-not $entry.isRepo) {
            if ($SsdOnline) {
                $ok = Snapshot-Additive $src (Join-Path $SsdRoot "DEV-nonrepo/$name") @('.playwright-mcp')
                if (-not $ok) { $Errors.Add("snapshot-ssd:$name") }
            }
            if ($entry.destinations -contains 'baylor' -and $B -and (Test-Path (Split-Path $B -Parent))) {
                Snapshot $src "$B/$name" @('.playwright-mcp')
            }
        }
        elseif ($SsdOnline -and ($entry.captureOrphans -or $entry.captureWorkingTree)) {
            $n = Capture-RepoData $src $name $SsdRoot
            if ($n -gt 0) { Log "CAPTURE $name : $n file(s) git does not carry" }
            $Results.Add(@{ kind = 'capture'; name = $name; status = 'OK' })
        }
    }

    # Non-DEV manifest paths (~/.claude subtrees, .codex, .gemini, SecondBrain) -> SSD.
    if ($SsdOnline) {
        foreach ($entry in ($Manifest.paths | Where-Object { $_.path -notlike 'DEV/*' -and $_.destinations -contains 'ssd' })) {
            $rel = $entry.path
            $src = Join-Path $U $rel
            if (-not (Test-Path $src)) { continue }
            $leaf = Split-Path $rel -Leaf
            $sub = switch -Wildcard ($entry.path) {
                '.claude/*'  { "claude/$leaf" }
                'Desktop/*'  { $leaf }
                default      { $leaf -replace '^\.', '' }
            }
            $extra = @()
            if ($entry.path -eq '.codex') { $extra = @('work') }
            if ($entry.path -eq '.gemini') { $extra = @('antigravity_browser_profile') }
            if ($entry.path -eq 'SecondBrain') { $extra = @('.git') }   # vault moved off Desktop 2026-08-14; github dest covers tracked files
            $ok = Snapshot-Additive $src (Join-Path $SsdRoot $sub) $extra
            if ($ok) { Log "STATE-SSD $($entry.path) -> $sub : OK" }
            else { $Errors.Add("snapshot-ssd:$($entry.path)"); Log "STATE-SSD $($entry.path) : FAILED" }
        }
    }

    # Receipts: prove each destination accepted a write in THIS run.
    if ($SsdRoot -and (Test-Path $SsdRoot)) {
        if ($DryRun) { Log "RECEIPT ssd : skipped (dry run wrote nothing to verify)" }
        elseif (Write-Receipt $SsdRoot $RunId) { Log "RECEIPT ssd : verified run=$RunId" }
        else { $Errors.Add("receipt-failed:ssd"); Log "RECEIPT ssd : FAILED - destination did not read back the sentinel" }
    }
    if ($DryRun) { Log "RECEIPT drive : skipped (dry run wrote nothing to verify)" }
    elseif (Write-DriveReceiptGws $RunId) { Log "RECEIPT drive : verified run=$RunId (via gws)" }
    else { $Errors.Add("receipt-failed:drive"); Log "RECEIPT drive : FAILED - gws did not confirm sentinel upload" }
}
else {
    $Errors.Add('manifest-missing')
    Log "MANIFEST not found at $ManifestFile - falling back to repo-detection (KNOWN TO UNDER-COVER by ~4 GB)"
    if ($B) {
        Get-ChildItem $DevRoot -Directory |
            Where-Object { -not (Test-Path (Join-Path $_.FullName '.git')) -and $_.Name -notmatch '^\.' } |
            ForEach-Object { Snapshot $_.FullName "$B/$($_.Name)" @('.playwright-mcp') }
    }
}

# --- 2c. Full memsearch reindex (no session-time cap) ---
$msExe = "$U/.local/bin/memsearch"
if (-not (Test-Path $msExe)) { $msExe = (Get-Command memsearch -ErrorAction SilentlyContinue).Source }
if ($msExe -and -not $DryRun) {
    $msFail = $false
    # Single source of truth: KeystoneOS data/memory-index-paths.json.
    $msPathsFallback = @(
        "$U/.claude/global-memory/transcripts",
        "$U/.claude/projects/C--Users-eric-rash/memory",
        "$U/.claude/claude-memory-compiler/daily",
        "$U/.claude/claude-memory-compiler/knowledge",
        "$U/SecondBrain/Knowledge",
        "$U/Desktop/SecondBrain/Knowledge"
    )
    $msConfig = "$DevRoot/KeystoneOS/data/memory-index-paths.json"
    $msPaths = $null
    if (Test-Path -LiteralPath $msConfig) {
        try {
            $declared = (Get-Content -Raw -LiteralPath $msConfig | ConvertFrom-Json).paths
            if ($declared -and $declared.Count -ge 1) {
                # {VAULT}: ~/SecondBrain on the Mac, ~/Desktop/SecondBrain on Windows (2026-09-30).
                $vaultRoot = @("$U/SecondBrain", "$U/Desktop/SecondBrain") | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
                if (-not $vaultRoot) { $vaultRoot = "$U/SecondBrain" }
                $msPaths = @($declared | ForEach-Object { (($_ -replace '\{HOME\}', $U) -replace '\{DEV\}', $DevRoot) -replace '\{VAULT\}', $vaultRoot })
                Log "INDEX path set: $($msPaths.Count) paths from memory-index-paths.json"
            }
        } catch { Log "INDEX config unreadable ($($_.Exception.Message)) - using built-in fallback list" }
    }
    if (-not $msPaths) {
        $msPaths = $msPathsFallback
        $Errors.Add('memsearch-index-config-missing')
        Log "INDEX path set: built-in fallback ($($msPaths.Count) paths) - memory-index-paths.json not usable"
    }
    # Shares the SessionEnd hook's lock. Reclaim only a dead owner.
    $indexLockFile = "$U/.claude/global-memory/transcripts/.memsearch-index.lock"
    $indexLockStaleMs = 5 * 60 * 1000
    $haveIndexLock = $false
    try {
        $lockStream = [System.IO.File]::Open($indexLockFile, [System.IO.FileMode]::CreateNew)
        $lockStream.Close()
        [System.IO.File]::WriteAllText($indexLockFile, [string]$PID)
        $haveIndexLock = $true
    }
    catch {
        $ownerAlive = $false
        try {
            $ownerPid = [int](Get-Content -Raw -LiteralPath $indexLockFile)
            $null = Get-Process -Id $ownerPid -ErrorAction Stop
            $ownerAlive = $true
        } catch {}
        if (-not $ownerAlive) {
            $lockStale = $false
            try { $lockStale = (((Get-Date) - (Get-Item -LiteralPath $indexLockFile).LastWriteTime).TotalMilliseconds -ge $indexLockStaleMs) }
            catch { $lockStale = $true }
            if ($lockStale) {
                try {
                    Remove-Item -LiteralPath $indexLockFile -Force -ErrorAction Stop
                    $lockStream = [System.IO.File]::Open($indexLockFile, [System.IO.FileMode]::CreateNew)
                    $lockStream.Close()
                    [System.IO.File]::WriteAllText($indexLockFile, [string]$PID)
                    $haveIndexLock = $true
                } catch {}
            }
        }
    }

    if (-not $haveIndexLock) {
        Log "INDEX skipped - another index run is active; next hook/nightly pass will catch up"
    }
    else {
        try {
            $existingPaths = @($msPaths | Where-Object { Test-Path $_ })
            if ($existingPaths.Count -gt 0) {
                $r = & $msExe index $existingPaths 2>&1 | Select-Object -Last 1
                Log "INDEX full set: $r"
                if ($LASTEXITCODE -ne 0) { $msFail = $true; $Errors.Add("memsearch-index:full-set") }
            }
        }
        finally {
            Remove-Item -LiteralPath $indexLockFile -Force -ErrorAction SilentlyContinue
        }
    }
    if (-not $msFail -and $haveIndexLock) {
        Remove-Item "$U/.claude/global-memory/transcripts/.memsearch-timeout-streak" -Force -ErrorAction SilentlyContinue
        Log "INDEX complete - hook timeout-streak counter reset"
    }
} elseif (-not $msExe) { $Errors.Add('memsearch-exe-missing'); Log "INDEX skipped: memsearch not found" }

# --- 2d. Mirror the recovery guide to the cloud backup root via gws ---
if ($GwsExe -and (Test-Path "$U/.claude/RESTORE.md") -and -not $DryRun) {
    Push-Location "$U/.claude"
    try {
        $upParams = @{ fileId = $DriveRestoreId; fields = 'id,name' } | ConvertTo-Json -Compress
        $resObj = Invoke-GwsJson @('drive', 'files', 'update', '--params', $upParams, '--upload', './RESTORE.md')
        if ($resObj -and $resObj.id) { Log "RESTORE.md mirrored to _MACHINE/Backups/ (via gws)" }
    } finally {
        Pop-Location
    }
}

# --- 3. State + escalation ---
$status = if ($Errors.Count -eq 0) { 'OK' } else { 'ERROR' }
@{
    lastRun  = (Get-Date -Format 'o')
    status   = $status
    errors   = @($Errors)
    okCount  = $Results.Count
    dryRun   = [bool]$DryRun
} | ConvertTo-Json | Set-Content -Path $StateFile

if ($Errors.Count -gt 0 -and -not $DryRun) {
    $line = "[{0}] daily-backup: {1} error(s): {2} - see ~/.claude/scripts/logs/daily-backup.log" -f (Get-Date -Format 'yyyy-MM-dd HH:mm'), $Errors.Count, ($Errors -join ', ')
    Add-Content -Path $ErrorsLog -Value $line
}

# Keep the log from growing unbounded.
if ((Get-Item $LogFile).Length -gt 2MB) {
    Get-Content $LogFile -Tail 2000 | Set-Content $LogFile
}

Log "===== daily-backup end: $status ($($Errors.Count) errors) ====="
if ($Errors.Count -gt 0) { exit 1 } else { exit 0 }
