# memsearch-drain.ps1 -- one-off foreground catch-up of the memsearch backlog.
#
# Why (2026-09-28, Windows laptop): ~10,100 chunks were never indexed. The
# SessionEnd hook caps each run at 600s and this CPU embeds ~5 s/chunk with
# bge-m3, so every run was killed after ~110 chunks and the next session end
# restarted it -- 2.5-3 GB of RAM all day. This runs the same incremental
# index with no cap, once, then gets out of the way.
#
# Coordination: holds ~/.claude/global-memory/transcripts/.memsearch-index.lock
# with THIS process's PID for the whole run (the hook skips while the owner is
# alive), and refreshes .memsearch-last-run so the hook's 30-min cooldown is in
# force when it finishes. Runs BelowNormal so interactive work keeps the CPU.
# batch_size comes from ~/.memsearch/config.toml (8 since 2026-09-28).

$ErrorActionPreference = 'Stop'
$T       = Join-Path $env:USERPROFILE '.claude\global-memory\transcripts'
$lock    = Join-Path $T '.memsearch-index.lock'
$lastRun = Join-Path $T '.memsearch-last-run'
$streak  = Join-Path $T '.memsearch-timeout-streak'
$log     = Join-Path $env:USERPROFILE '.claude\scripts\logs\memsearch-drain.log'
$exe     = Join-Path $env:APPDATA 'Python\Python314\Scripts\memsearch.exe'
New-Item -ItemType Directory -Force (Split-Path $log) | Out-Null
function Log($m) { Add-Content -LiteralPath $log -Value "[$((Get-Date).ToString('s'))] $m" }

# Same path source as memsearch-sync.js.
$dev  = Join-Path $env:USERPROFILE 'Desktop\DEV'
$vault = Join-Path $env:USERPROFILE 'Desktop\SecondBrain'   # {VAULT}; this script is Windows-only
$cfg  = Get-Content -Raw (Join-Path $dev 'KeystoneOS\data\memory-index-paths.json') | ConvertFrom-Json
$paths = @($cfg.paths | ForEach-Object {
    ($_ -replace '\{HOME\}', $env:USERPROFILE -replace '\{DEV\}', $dev -replace '\{VAULT\}', $vault) -replace '/', '\'
} | Where-Object { Test-Path -LiteralPath $_ })

# Take the lock atomically; wait up to 20 min for a live hook run to finish.
$deadline = (Get-Date).AddMinutes(20)
while ($true) {
    try {
        $fs = [IO.File]::Open($lock, [IO.FileMode]::CreateNew); $fs.Close()
        [IO.File]::WriteAllText($lock, [string]$PID); break
    } catch {
        $owner = 0; try { $owner = [int](Get-Content -Raw -LiteralPath $lock) } catch {}
        if ($owner -gt 0 -and (Get-Process -Id $owner -ErrorAction SilentlyContinue)) {
            if ((Get-Date) -gt $deadline) { Log "gave up: lock held by live pid $owner"; exit 1 }
            Start-Sleep -Seconds 30; continue
        }
        Remove-Item -LiteralPath $lock -Force -ErrorAction SilentlyContinue
    }
}

try {
    Set-Content -LiteralPath $lastRun -Value "$((Get-Date).ToString('o')) drain pid=$PID"
    (Get-Process -Id $PID).PriorityClass = 'BelowNormal'   # children inherit
    $env:PYTHONIOENCODING = 'utf-8'; $env:PYTHONUTF8 = '1'
    $out = Join-Path $env:TEMP 'memsearch-drain.out'; $err = Join-Path $env:TEMP 'memsearch-drain.err'
    Log "start: $($paths.Count) paths"
    $sw = [Diagnostics.Stopwatch]::StartNew()
    $p = Start-Process -FilePath $exe -ArgumentList (@('index') + $paths) -NoNewWindow -PassThru `
         -RedirectStandardOutput $out -RedirectStandardError $err
    $null = $p.Handle
    $p.WaitForExit()
    $tail = ((Get-Content -LiteralPath $out, $err -ErrorAction SilentlyContinue) | Select-Object -Last 5) -join ' | '
    Log ("exit={0} elapsed={1:N0} min :: {2}" -f $p.ExitCode, $sw.Elapsed.TotalMinutes, $tail)
    if ($p.ExitCode -eq 0) { Remove-Item -Path "$streak*" -ErrorAction SilentlyContinue }   # every per-class streak (memsearch-sync.js)
}
finally {
    Set-Content -LiteralPath $lastRun -Value "$((Get-Date).ToString('o')) drain finished pid=$PID"
    try { if ((Get-Content -Raw -LiteralPath $lock).Trim() -eq [string]$PID) { Remove-Item -LiteralPath $lock -Force } } catch {}
}
