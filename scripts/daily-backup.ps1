# daily-backup.ps1 — KeystoneOS Phase 2 durability automation (2026-07-23)
# Runs daily at 06:15 via scheduled task "KeystoneOS-DailyBackup".
#
# Two jobs:
#   1. Git-sync the memory repos (auto-commit + push). Git history is the review
#      trail — an accidental deletion is recoverable from any prior commit.
#   2. Robocopy-snapshot non-git stores to OneDrive.
#      Personal context (Claude transcripts, Codex/Gemini state) -> personal OneDrive.
#      Baylor work folders (non-repo DEV dirs)                   -> Baylor OneDrive.
#
# Failures append ONE line to global-memory\transcripts\.errors.log, which every
# Claude session surfaces at startup. Full detail: scripts\logs\daily-backup.log.

param([switch]$DryRun)

$ErrorActionPreference = 'Continue'
$U = $env:USERPROFILE
$LogDir = "$U\.claude\scripts\logs"
$LogFile = "$LogDir\daily-backup.log"
$StateFile = "$LogDir\backup-state.json"
$ErrorsLog = "$U\.claude\global-memory\transcripts\.errors.log"
$Errors = [System.Collections.Generic.List[string]]::new()
$Results = [System.Collections.Generic.List[object]]::new()

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Log($msg) {
    $line = "{0} {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $msg
    Add-Content -Path $LogFile -Value $line
    Write-Output $line
}

function Sync-Repo($path, $branch) {
    $name = Split-Path $path -Leaf
    if ($path -eq "$U\.claude") { $name = 'dotclaude' }
    if (-not (Test-Path (Join-Path $path '.git'))) { $Errors.Add("repo-missing:$name"); return }
    Push-Location $path
    try {
        git fetch origin 2>&1 | Out-Null
        $counts = git rev-list --left-right --count "origin/$branch...HEAD" 2>$null
        $behind = 0; $ahead = 0
        if ($counts) { $p = $counts -split '\s+'; $behind = [int]$p[0]; $ahead = [int]$p[1] }
        $dirty = (git status --porcelain | Measure-Object).Count

        if ($behind -gt 0 -and ($ahead -gt 0 -or $dirty -gt 0)) {
            # Diverged with local changes: never merge blindly from automation.
            $Errors.Add("repo-diverged:$name")
            Log "REPO $name : DIVERGED (behind=$behind ahead=$ahead dirty=$dirty) - manual reconcile needed"
            return
        }
        if ($behind -gt 0) {
            if (-not $DryRun) { git pull --ff-only origin $branch 2>&1 | Out-Null }
            Log "REPO $name : fast-forwarded $behind commit(s)"
        }
        if ($dirty -gt 0) {
            if (-not $DryRun) {
                git add -A 2>&1 | Out-Null
                git commit -m ("chore: daily backup sync {0} [auto]" -f (Get-Date -Format 'yyyy-MM-dd')) 2>&1 | Out-Null
            }
            Log "REPO $name : committed $dirty change(s)"
        }
        $counts = git rev-list --left-right --count "origin/$branch...HEAD" 2>$null
        $ahead = if ($counts) { [int](($counts -split '\s+')[1]) } else { 0 }
        if ($DryRun -and $dirty -gt 0) { $ahead = 1 }
        if ($ahead -gt 0) {
            if (-not $DryRun) {
                git push origin $branch 2>&1 | Out-Null
                if ($LASTEXITCODE -ne 0) { $Errors.Add("repo-push:$name"); Log "REPO $name : PUSH FAILED"; return }
            }
            Log "REPO $name : pushed"
        }
        $Results.Add(@{ kind='repo'; name=$name; status='OK' })
    } finally { Pop-Location }
}

function Snapshot($src, $dst, [string[]]$extraXD) {
    if (-not (Test-Path $src)) { Log "SNAP skip (missing): $src"; return }
    $xd = @('node_modules', '.venv', '__pycache__', '.git', 'cache', 'tmp') + $extraXD
    $args = @($src, $dst, '/MIR', '/R:2', '/W:5', '/NFL', '/NDL', '/NP', '/NJH') + ($xd | ForEach-Object { @('/XD', $_) })
    if ($DryRun) { $args += '/L' }
    robocopy @args | Select-Object -Last 6 | Add-Content -Path $LogFile
    if ($LASTEXITCODE -ge 8) {
        $Errors.Add("snapshot:$([IO.Path]::GetFileName($dst))")
        Log "SNAP $src -> $dst : FAILED (robocopy exit $LASTEXITCODE)"
    } else {
        Log "SNAP $src -> $dst : OK (exit $LASTEXITCODE)"
        $Results.Add(@{ kind='snapshot'; name=$dst; status='OK' })
    }
}

Log "===== daily-backup start (DryRun=$DryRun) ====="

# --- 1. Git memory repos ---
Sync-Repo "$U\Desktop\SecondBrain"      'main'
Sync-Repo "$U\.claude\global-memory"    'main'
Sync-Repo "$U\.claude"                  'main'
Sync-Repo "$U\.claude\skills"           'main'

# --- 2a. Personal-context snapshots -> personal Google Drive (gmail) ---
# NOT OneDrive: the personal OneDrive account is not signed in on this machine
# (discovered 2026-07-23 — that folder is a dead local dir), and Google is the
# durable personal identity that survives any institutional change.
$P = 'G:\My Drive\Backups\Machine'
if (-not (Test-Path 'G:\My Drive')) {
    $Errors.Add('backup-target-offline:GoogleDrive')
    Log "TARGET G:\My Drive NOT MOUNTED - is Google Drive for Desktop running? Skipping personal snapshots."
}
Snapshot "$U\.claude\projects"  "$P\claude-projects"  @('worktrees')
Snapshot "$U\.codex\memories"   "$P\codex\memories"   @()
Snapshot "$U\.codex\sessions"   "$P\codex\sessions"   @()
Snapshot "$U\.codex\agents"     "$P\codex\agents"     @()
Snapshot "$U\.codex\sqlite"     "$P\codex\sqlite"     @()
Snapshot "$U\.gemini"           "$P\gemini"           @('antigravity_browser_profile')

# --- 2b. Non-repo DEV folders -> Baylor OneDrive ---
$B = "$U\OneDrive - Baylor University\Backups\DEV-NonRepo"
Get-ChildItem "$U\Desktop\DEV" -Directory |
    Where-Object { -not (Test-Path (Join-Path $_.FullName '.git')) -and $_.Name -notmatch '^\.' } |
    ForEach-Object { Snapshot $_.FullName "$B\$($_.Name)" @('.playwright-mcp') }

# --- 2c. Full memsearch reindex (no session-time cap) ---
# The SessionEnd hook indexes incrementally under a 45s cap - enough for normal
# session deltas, never for heavy days (a 41-chunk backlog on 7/24 needed >10 min
# at ONNX embedding speed). This nightly pass absorbs any backlog and resets the
# hook's consecutive-timeout alarm so mornings start clean.
$msExe = "$U\AppData\Roaming\Python\Python314\Scripts\memsearch.exe"
if (-not (Test-Path $msExe)) { $msExe = (Get-Command memsearch -ErrorAction SilentlyContinue).Source }
if ($msExe -and -not $DryRun) {
    $msFail = $false
    # Single source of truth: KeystoneOS declares the index set in
    # data\memory-index-paths.json (AGENTS.md routes "Memory index path templates"
    # there). This list used to be hardcoded here and had silently diverged from
    # that file - three declared paths (KeystoneOS project memory, Inbox\meetings,
    # .codex\memories) were never actually indexed by this nightly pass, so the
    # registry described an index that did not exist. Read it instead.
    $msPathsFallback = @(
        "$U\.claude\global-memory\transcripts",
        "$U\.claude\projects\C--Users-eric-rash\memory",
        "$U\.claude\claude-memory-compiler\daily",
        "$U\.claude\claude-memory-compiler\knowledge",
        "$U\Desktop\SecondBrain\Knowledge"
    )
    $msConfig = "$U\Desktop\DEV\KeystoneOS\data\memory-index-paths.json"
    $msPaths = $null
    if (Test-Path -LiteralPath $msConfig) {
        try {
            $declared = (Get-Content -Raw -LiteralPath $msConfig | ConvertFrom-Json).paths
            if ($declared -and $declared.Count -ge 1) {
                $msPaths = @($declared | ForEach-Object { ($_ -replace '\{HOME\}', $U) -replace '/', '\' })
                Log "INDEX path set: $($msPaths.Count) paths from memory-index-paths.json"
            }
        } catch { Log "INDEX config unreadable ($($_.Exception.Message)) - using built-in fallback list" }
    }
    if (-not $msPaths) {
        $msPaths = $msPathsFallback
        $Errors.Add('memsearch-index-config-missing')
        Log "INDEX path set: built-in fallback ($($msPaths.Count) paths) - memory-index-paths.json not usable"
    }
    foreach ($mp in $msPaths) {
        if (-not (Test-Path $mp)) { continue }
        $r = & $msExe index $mp 2>&1 | Select-Object -Last 1
        Log "INDEX $(Split-Path $mp -Leaf): $r"
        if ($LASTEXITCODE -ne 0) { $msFail = $true; $Errors.Add("memsearch-index:$(Split-Path $mp -Leaf)") }
    }
    if (-not $msFail) {
        Remove-Item "$U\.claude\global-memory\transcripts\.memsearch-timeout-streak" -Force -ErrorAction SilentlyContinue
        Log "INDEX complete - hook timeout-streak counter reset"
    }
} elseif (-not $msExe) { $Errors.Add('memsearch-exe-missing'); Log "INDEX skipped: memsearch.exe not found" }

# --- 2d. Mirror the recovery guide to the cloud backup root ---
if ((Test-Path 'G:\My Drive') -and (Test-Path "$U\.claude\RESTORE.md") -and -not $DryRun) {
    New-Item -ItemType Directory -Force -Path 'G:\My Drive\Backups' | Out-Null
    Copy-Item "$U\.claude\RESTORE.md" 'G:\My Drive\Backups\RESTORE.md' -Force
    Log "RESTORE.md mirrored to G:\My Drive\Backups\"
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
    $line = "[{0}] daily-backup: {1} error(s): {2} - see ~\.claude\scripts\logs\daily-backup.log" -f (Get-Date -Format 'yyyy-MM-dd HH:mm'), $Errors.Count, ($Errors -join ', ')
    Add-Content -Path $ErrorsLog -Value $line
}

# Keep the log from growing unbounded.
if ((Get-Item $LogFile).Length -gt 2MB) {
    Get-Content $LogFile -Tail 2000 | Set-Content $LogFile
}

Log "===== daily-backup end: $status ($($Errors.Count) errors) ====="
if ($Errors.Count -gt 0) { exit 1 } else { exit 0 }
