# Scheduled-task wrapper for recall-eval.py (\Eric\memsearch-drain-*, action 2).
# Task Scheduler discards a direct python action's output, so a failure left no trace
# (2026-10-01: died in ~7 s, ran fine by hand). This keeps stdout+stderr, the exit code,
# and the interpreter context in logs/<date>-<label>.log, and writes logs/last-<label>.txt
# so after-run.ps1 can quote the failure.
param([string]$Label = 'weekly', [string]$Backends = 'memsearch,fts5,rg,jev')

$ErrorActionPreference = 'Continue'
$here = $PSScriptRoot
$logDir = Join-Path $here 'logs'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir "$(Get-Date -Format yyyy-MM-dd_HHmm)-$Label.log"
$py = Join-Path $env:LOCALAPPDATA 'Python\bin\python.exe'

function Log([string]$s) { Add-Content -LiteralPath $log -Encoding utf8 -Value $s }

Log "[$(Get-Date -Format o)] start label=$Label backends=$Backends user=$env:USERNAME host=$env:COMPUTERNAME"
Log "python=$py exists=$(Test-Path $py) cwd=$here"
Log "PYTHONIOENCODING=$env:PYTHONIOENCODING PATH=$env:PATH"
try { Log ("python -VV: " + ((& $py -VV 2>&1) -join ' ')) } catch { Log "python -VV threw: $_" }

$env:PYTHONIOENCODING = 'utf-8'
$env:PYTHONUNBUFFERED = '1'
$sw = [Diagnostics.Stopwatch]::StartNew()
try {
    Push-Location $here
    & $py (Join-Path $here 'recall-eval.py') --backends $Backends --label $Label *>&1 |
        ForEach-Object { Log "$_" }
    $code = $LASTEXITCODE
} catch {
    Log "launch threw: $_"
    $code = -1
} finally { Pop-Location }
$sw.Stop()
Log "[$(Get-Date -Format o)] exit=$code elapsed=$([int]$sw.Elapsed.TotalSeconds)s"

$tail = (Get-Content -LiteralPath $log -Tail 4) -join ' / '
"exit=$code log=$log :: $tail" | Set-Content -LiteralPath (Join-Path $logDir "last-$Label.txt") -Encoding utf8

# Keep the newest 20 logs.
Get-ChildItem $logDir -Filter '*.log' | Sort-Object LastWriteTime -Descending |
    Select-Object -Skip 20 | Remove-Item -Force -ErrorAction SilentlyContinue
exit $code
