# backup-ai-sessions.ps1 -- daily: copy raw Codex and Claude Code session logs to Google
# Drive, and harvest repo docs into memsearch's dev-docs folder.
#
# Supersedes DEV\_INBOX\backup_ai_sessions.ps1 (kept, unmodified). That script was
# already additive (/E), which is correct, so the copy logic is unchanged. The only
# addition is backup-state.json, for the same reason as the DEV backup: a job that
# silently stops must not look like a job that is working.

$dst   = "G:\My Drive\00_Primary_Storage_Drive\05_SYSTEMS\AI_Sessions_Backup\$env:COMPUTERNAME"
$log   = "$dst\_backup_log.txt"
$state = "$env:USERPROFILE\.claude\scripts\logs\backup-ai-sessions-state.json"
$started = Get-Date

New-Item -ItemType Directory -Force (Split-Path $state) | Out-Null

if (-not (Test-Path "G:\My Drive")) {
    @{ lastRun = $started.ToString('o'); status = 'ERROR'; errors = @('drive-not-mounted') } |
        ConvertTo-Json | Set-Content $state
    exit 1
}

New-Item -ItemType Directory -Force "$dst\codex","$dst\claude-code","$dst\codex-memories" | Out-Null
"$($started.ToString('yyyy-MM-dd HH:mm')) start" | Add-Content $log

$errors = @()
$jobs = @(
    @{ from = "$env:USERPROFILE\.codex\sessions";  to = "$dst\codex" },
    @{ from = "$env:USERPROFILE\.codex\memories";  to = "$dst\codex-memories" },
    @{ from = "$env:USERPROFILE\.claude\projects"; to = "$dst\claude-code" }
)
foreach ($j in $jobs) {
    if (-not (Test-Path $j.from)) { continue }   # .codex/memories may not exist yet
    robocopy $j.from $j.to /E /COPY:DT /R:1 /W:2 /NP /NFL /NDL /NJH /NJS /XJ | Out-Null
    # Robocopy codes below 8 are success (see retired\backup-dev-to-drive.ps1).
    if ($LASTEXITCODE -ge 8) { $errors += "robocopy-rc:$($LASTEXITCODE):$(Split-Path $j.from -Leaf)" }
}

foreach ($f in @('history.jsonl','session_index.jsonl')) {
    Copy-Item "$env:USERPROFILE\.codex\$f" "$dst\codex\" -Force -ErrorAction SilentlyContinue
}

# Harvest repo docs so Cowork/Codex work written into repos is searchable from Claude Code.
& "$env:USERPROFILE\.claude\scripts\harvest-dev-docs.ps1" | Add-Content $log

@{
    lastRun  = $started.ToString('o')
    finished = (Get-Date).ToString('o')
    status   = $(if ($errors.Count -eq 0) { 'OK' } else { 'ERROR' })
    errors   = $errors
} | ConvertTo-Json | Set-Content $state

"$(Get-Date -Format 'yyyy-MM-dd HH:mm') done errors=$($errors.Count)" | Add-Content $log
exit $(if ($errors.Count -eq 0) { 0 } else { 1 })
