<#
.SYNOPSIS
  Fixes the intermittent Git Bash crash:
    bash.exe: *** fatal error - add_item ("\??\C:\Program Files\Git", "/", ...) failed, errno 1

.DESCRIPTION
  ROOT CAUSE
  ----------
  MSYS2 (which Git Bash runs on) builds a shared-memory mount table exactly once,
  guarded by a spinlock in shared.cc. That spinlock has a hard 15-second timeout.
  If the process holding the lock takes longer than 15s, the spinlock gives up and
  lets waiting processes into the critical section anyway -> mountinfo.init() runs a
  SECOND time -> add_item("/") fails with EPERM -> api_fatal -> bash dies (0xC0000005)
  before running anything.

  On this machine the stall comes from Active Directory. nsswitch.conf ships as
  "passwd: files db" and there is no /etc/passwd, so EVERY Git Bash launch falls
  through to "db" and resolves the user over LDAP against baylor.edu. When the DC is
  slow (VPN, roaming, DC load) that lookup blows past 15s and any bash processes
  launched concurrently -- e.g. Claude Code firing 3-4 Stop hooks at once -- crash.

  THE FIX
  -------
  Generate static /etc/passwd and /etc/group, then tell nsswitch to use files only.
  MSYS then never touches the network to resolve identity, the critical section stays
  fast, and the 15s spinlock never expires.

  Identity is preserved exactly: mkpasswd emits the same uid/gid the AD lookup
  produces (verified: uid=1553867 gid=1049089 home=/c/Users/eric_rash).

.NOTES
  MUST be run elevated -- C:\Program Files\Git\etc is not user-writable.
  Verifies afterward and rolls back automatically if identity changes.
  Re-runnable. Use -Rollback to undo.
#>

[CmdletBinding()]
param(
    [string]$GitRoot = "C:\Program Files\Git",
    [switch]$Rollback
)

$ErrorActionPreference = "Stop"

$etc   = Join-Path $GitRoot "etc"
$ns    = Join-Path $etc "nsswitch.conf"
$pw    = Join-Path $etc "passwd"
$gr    = Join-Path $etc "group"
$bash  = Join-Path $GitRoot "usr\bin\bash.exe"

function Assert-Admin {
    $isAdmin = ([Security.Principal.WindowsPrincipal] `
        [Security.Principal.WindowsIdentity]::GetCurrent()
    ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if (-not $isAdmin) {
        Write-Host "ERROR: must run elevated (Program Files is not user-writable)." -ForegroundColor Red
        Write-Host "Right-click PowerShell -> Run as administrator, then re-run:" -ForegroundColor Yellow
        Write-Host "  & '$PSCommandPath'" -ForegroundColor Yellow
        exit 1
    }
}

# Returns "uid=...(name) gid=..." from a login shell, or $null if bash failed.
# Retries: bash itself crashes intermittently (that is the bug being fixed), and a
# transient crash during verification must not be mistaken for a broken config.
function Get-BashIdentity {
    param([int]$Attempts = 6)
    foreach ($i in 1..$Attempts) {
        try {
            $out = & $bash -lc "id" 2>&1
            if ($LASTEXITCODE -eq 0 -and "$out" -match 'uid=\d+') { return ("$out").Trim() }
        } catch { }
        Start-Sleep -Milliseconds 400
    }
    return $null
}

# Identity comparison must use uid + PRIMARY gid only.
# Adding /etc/group legitimately makes `id` richer: group NAMES start resolving and
# the full supplementary group list appears where before only bare numbers showed.
# That is an improvement, not a regression -- comparing the raw string would
# false-positive on it.
function Get-UidGid {
    param([string]$IdLine)
    if ($IdLine -match 'uid=(\d+).*?gid=(\d+)') {
        return [pscustomobject]@{ Uid = $Matches[1]; Gid = $Matches[2] }
    }
    return $null
}

function Measure-BashStartup {
    param([int]$N = 10)
    $times = @()
    foreach ($i in 1..$N) {
        $t = Measure-Command { & $bash -lc "id -un" 2>&1 | Out-Null }
        $times += $t.TotalMilliseconds
    }
    [pscustomobject]@{
        Median = [math]::Round(($times | Sort-Object)[[int]($times.Count/2)], 0)
        Max    = [math]::Round(($times | Measure-Object -Maximum).Maximum, 0)
    }
}

# Undo everything this run changed. Restores a prior passwd/group if one existed
# (a re-run backs the old copies up as *.bak-<stamp>), otherwise removes what we wrote.
function Invoke-Rollback {
    param([string]$Stamp)
    Copy-Item "$ns.bak-$Stamp" $ns -Force
    foreach ($f in @($pw, $gr)) {
        $prior = "$f.bak-$Stamp"
        if (Test-Path $prior)      { Copy-Item $prior $f -Force }
        elseif (Test-Path $f)      { Remove-Item $f -Force }
    }
}

Assert-Admin

if (-not (Test-Path $bash)) { throw "bash.exe not found at $bash" }

# ---------------------------------------------------------------- rollback ----
if ($Rollback) {
    $bak = Get-ChildItem $etc -Filter "nsswitch.conf.bak-*" -ErrorAction SilentlyContinue |
           Sort-Object LastWriteTime | Select-Object -Last 1
    if (-not $bak) { throw "No nsswitch.conf backup found in $etc" }
    Copy-Item $bak.FullName $ns -Force
    foreach ($f in @($pw, $gr)) {
        if (Test-Path $f) { Rename-Item $f "$f.disabled-$(Get-Date -Format yyyyMMdd-HHmmss)" }
    }
    Write-Host "Rolled back nsswitch.conf from $($bak.Name); passwd/group set aside." -ForegroundColor Green
    Write-Host "id now: $(Get-BashIdentity)"
    exit 0
}

# ------------------------------------------------------------- baseline ------
$before = Get-BashIdentity
if (-not $before) { throw "bash is currently failing; re-run when it starts cleanly (identity baseline required)." }
Write-Host "Baseline identity : $before" -ForegroundColor Cyan
$perfBefore = Measure-BashStartup
Write-Host "Baseline startup  : median $($perfBefore.Median) ms / max $($perfBefore.Max) ms" -ForegroundColor Cyan
Write-Host ""

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"

# ------------------------------------------- 1. static passwd + group --------
Write-Host "[1/3] Generating static /etc/passwd and /etc/group ..." -ForegroundColor Cyan

# -l = local accounts (incl. SYSTEM, used by scheduled tasks); -c = current (domain) user.
# Deliberately NOT using -d : that enumerates the whole domain and is pathologically slow.
$passwdText = (& $bash -lc "mkpasswd -l -c") -join "`n"
$groupText  = (& $bash -lc "mkgroup  -l -c") -join "`n"

if ($passwdText -notmatch [regex]::Escape($env:USERNAME)) {
    throw "mkpasswd output does not contain $($env:USERNAME); aborting without changes."
}
if ([string]::IsNullOrWhiteSpace($groupText)) {
    throw "mkgroup produced no output; aborting without changes."
}

foreach ($pair in @(@{P=$pw; T=$passwdText}, @{P=$gr; T=$groupText})) {
    if (Test-Path $pair.P) { Copy-Item $pair.P "$($pair.P).bak-$stamp" -Force }
    # LF endings, no BOM -- MSYS will not parse CRLF/BOM correctly.
    [IO.File]::WriteAllText($pair.P, ($pair.T -replace "`r`n", "`n") + "`n",
        (New-Object Text.UTF8Encoding $false))
    Write-Host "      wrote $($pair.P)"
}

# ------------------------------------------------ 2. patch nsswitch ----------
Write-Host "[2/3] Pointing nsswitch.conf at files (no AD/LDAP) ..." -ForegroundColor Cyan
Copy-Item $ns "$ns.bak-$stamp" -Force
Write-Host "      backup: $ns.bak-$stamp"

$lines = Get-Content $ns
$patched = $lines |
    ForEach-Object {
        if ($_ -match '^\s*passwd\s*:')   { 'passwd: files' }
        elseif ($_ -match '^\s*group\s*:'){ 'group: files' }
        elseif ($_ -match '^\s*db_enum\s*:') { 'db_enum: builtin' }
        else { $_ }
    }
# NB: on an array, "-notmatch" returns the non-matching ELEMENTS (almost always
# truthy), so it must not be used as a containment test. Negate "-match" instead.
if (-not ($patched -match '^passwd: files')) { $patched += 'passwd: files' }
if (-not ($patched -match '^group: files'))  { $patched += 'group: files' }

[IO.File]::WriteAllText($ns, (($patched -join "`n") + "`n"),
    (New-Object Text.UTF8Encoding $false))

# ------------------------------------------------------- 3. verify -----------
Write-Host "[3/3] Verifying identity is unchanged ..." -ForegroundColor Cyan
$after = Get-BashIdentity

if (-not $after) {
    Write-Host "bash FAILED after change -- rolling back automatically." -ForegroundColor Red
    Invoke-Rollback -Stamp $stamp
    throw "Rolled back. No changes remain."
}

$idBefore = Get-UidGid $before
$idAfter  = Get-UidGid $after

if (-not $idAfter -or $idBefore.Uid -ne $idAfter.Uid -or $idBefore.Gid -ne $idAfter.Gid) {
    Write-Host "uid/gid CHANGED -- rolling back automatically." -ForegroundColor Red
    Write-Host "  before: $before"
    Write-Host "  after : $after"
    Invoke-Rollback -Stamp $stamp
    throw "Rolled back. No changes remain."
}

if ($after -ne $before) {
    Write-Host "  uid/gid identical (uid=$($idAfter.Uid) gid=$($idAfter.Gid)) -- OK." -ForegroundColor Green
    Write-Host "  Group resolution improved (expected, /etc/group now present):" -ForegroundColor DarkGray
    Write-Host "    before: $before" -ForegroundColor DarkGray
    Write-Host "    after : $after"  -ForegroundColor DarkGray
}

$perfAfter = Measure-BashStartup

Write-Host ""
Write-Host "SUCCESS" -ForegroundColor Green
Write-Host "  identity unchanged : $after"
Write-Host "  startup before     : median $($perfBefore.Median) ms / max $($perfBefore.Max) ms"
Write-Host "  startup after      : median $($perfAfter.Median) ms / max $($perfAfter.Max) ms"
Write-Host ""
Write-Host "Git Bash no longer queries Active Directory to resolve identity, so the"
Write-Host "15-second spinlock that caused the add_item crash can no longer be reached."
Write-Host ""
Write-Host "To undo:  & '$PSCommandPath' -Rollback" -ForegroundColor Yellow
