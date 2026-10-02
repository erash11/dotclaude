# Unattended follow-up to a scheduled reindex + recall eval (Task Scheduler, \Eric\memsearch-drain-*).
# Runs as the last action of the task, after memsearch-drain.ps1 and recall-eval.py:
#   1. checks the index finished (memsearch-drain.log ends in exit=0),
#   2. checks recall-eval wrote ledger rows in the last 24 h,
#   3. commits + pushes the ledger and results in ~/.claude (nothing else on Windows does),
#   4. writes LATEST.md here with the rows,
#   5. ONLY on a problem, appends one line to .errors.log, which every session surfaces
#      at startup (same pattern as claude-stack-doctor/weekly-check.ps1).
param([string]$Label = '', [switch]$Test)   # -Test: no git, no .errors.log

$ErrorActionPreference = 'Continue'
$here = $PSScriptRoot
$claude = Join-Path $HOME '.claude'
$errLog = Join-Path $claude 'global-memory\transcripts\.errors.log'
$problems = [System.Collections.Generic.List[string]]::new()

$drainLog = Join-Path $claude 'scripts\logs\memsearch-drain.log'
$drainLast = if (Test-Path $drainLog) { Get-Content $drainLog -Tail 1 } else { '' }
$indexOk = $drainLast -match 'exit=0'
if (-not $indexOk) { $problems.Add("index did not finish cleanly (last drain line: '$drainLast')") }

$ledger = Join-Path $here 'ledger.md'
$since = (Get-Date).AddHours(-24).ToString('yyyy-MM-dd')
$rows = @()
if (Test-Path $ledger) {
    $rows = @(Get-Content $ledger | Where-Object { $_ -match '^\| (\d{4}-\d\d-\d\d) ' -and $Matches[1] -ge $since -and (-not $Label -or $_ -match [regex]::Escape("| $Label"))})
}
if ($rows.Count -eq 0) {
    $last = Join-Path $here "logs\last-$Label.txt"   # written by run-eval.ps1
    $why = if (Test-Path $last) { " [$((Get-Content -LiteralPath $last -Raw).Trim())]" } else { '' }
    $problems.Add("recall-eval wrote no ledger rows$(if ($Label) { " labelled '$Label'" }) in the last 24 h$why")
}

$git = 'C:\Program Files\Git\cmd\git.exe'
$pushed = $false
if ($rows.Count -gt 0 -and -not $Test) {
    & $git -C $claude add -- audits/recall-eval/ledger.md audits/recall-eval/results 2>&1 | Out-Null
    & $git -C $claude diff --cached --quiet -- audits/recall-eval
    if ($LASTEXITCODE -ne 0) {
        & $git -C $claude commit -q -m "recall-eval: scheduled run $(Get-Date -Format yyyy-MM-dd) $Label" -- audits/recall-eval/ledger.md audits/recall-eval/results 2>&1 | Out-Null
        & $git -C $claude pull -q --no-rebase --no-edit 2>&1 | Out-Null
        & $git -C $claude push -q 2>&1 | Out-Null
        $pushed = $LASTEXITCODE -eq 0
        if (-not $pushed) { $problems.Add('commit made but git push failed (run git pull/push in ~/.claude)') }
    } else { $pushed = $true }
}

$status = if ($problems.Count) { 'PROBLEM: ' + ($problems -join '; ') } else { 'OK' }
@(
    "# Latest scheduled recall eval"
    ""
    "Run finished $(Get-Date -Format 'yyyy-MM-dd HH:mm') on $env:COMPUTERNAME. Status: $status"
    "Index: $drainLast"
    ""
    "| date | machine | label | backend | n | hit@1 | hit@5 | MRR | p50 ms | p95 ms | fail% | coverage% | by layer (hit@5) |"
    "|---|---|---|---|---|---|---|---|---|---|---|---|---|"
) + $rows | Set-Content -LiteralPath (Join-Path $here 'LATEST.md') -Encoding utf8

if ($problems.Count -and -not $Test) {
    Add-Content -LiteralPath $errLog -Encoding utf8 -Value "[$(Get-Date -Format o)] recall-eval scheduled run: $($problems -join '; ') - see ~/.claude/audits/recall-eval/LATEST.md"
}
exit 0
