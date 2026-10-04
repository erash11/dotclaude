# The one action of \Eric\memsearch-drain-weekly: drain -> recall eval -> after-run.
# Replaces the task's three separate actions (2026-10-04). On 10-01 and 10-04 the second
# action died at 02:10 with 0xC0000142 (STATUS_DLL_INIT_FAILED): the process never got far
# enough to run a line, whether it was python.exe or pwsh. It runs fine by hand and in a
# probe task while logged in, so it is a start-up failure in the overnight session, not the
# script. Running the steps from here lets a step that fails to start be retried.
param([string]$Label = 'weekly', [string]$Backends = 'memsearch,fts5,rg,jev')

$ErrorActionPreference = 'Continue'
$here = $PSScriptRoot
$pwsh = 'C:\Program Files\PowerShell\7\pwsh.exe'
$log = Join-Path $here 'logs\weekly-chain.log'
New-Item -ItemType Directory -Force (Split-Path $log) | Out-Null
function Log([string]$s) { Add-Content -LiteralPath $log -Encoding utf8 -Value "[$(Get-Date -Format s)] $s" }

$DLL_INIT_FAILED = -1073741502   # 0xC0000142 as a signed exit code

function Step([string]$name, [string[]]$argv) {
    for ($try = 1; $try -le 4; $try++) {
        & $pwsh -NoProfile -NonInteractive -File @argv
        $code = $LASTEXITCODE
        Log "$name try=$try exit=$code"
        if ($code -ne $DLL_INIT_FAILED) { return $code }
        [Threading.Thread]::Sleep(30000)
    }
    return $code
}

Log "start label=$Label"
Step 'drain' @((Join-Path $HOME '.claude\scripts\memsearch-drain.ps1')) | Out-Null
Step 'eval' @((Join-Path $here 'run-eval.ps1'), '-Label', $Label, '-Backends', $Backends) | Out-Null
# after-run checks the drain log and the ledger itself, so it always runs.
Step 'after-run' @((Join-Path $here 'after-run.ps1'), '-Label', $Label) | Out-Null
Log 'end'
