# backup-dev-to-drive.ps1 -- weekly: copy Desktop\DEV to Google Drive as the non-GitHub
# backup. Covers what GitHub cannot: gitignored data, non-repo folders, and uncommitted
# working-tree edits. ~15 GB as of 2026-09-12.
#
# Supersedes DEV\_INBOX\backup_dev.ps1 (kept, unmodified). Two changes from it:
#
#  1. /E, NOT /MIR. A mirror deletes anything at the destination that is missing at the
#     source, so the first run after an accidental delete propagates that delete to the
#     only other copy. The Mac's backup-manifest states the rule learned the hard way:
#     "Additive, never mirrored. A mirror replicates the deletion you are recovering
#     from." The cost is that the backup grows and needs occasional pruning by hand.
#     That is the correct trade for a copy of last resort.
#
#  2. It writes backup-state.json. The existing health checks read that file to judge
#     backup freshness; without it a backup that silently stops looks identical to one
#     that never existed. Every other silent failure found on 2026-09-12 had this shape.

$src   = "$env:USERPROFILE\Desktop\DEV"
$dst   = "G:\My Drive\00_Primary_Storage_Drive\05_SYSTEMS\DEV_Backup\$env:COMPUTERNAME"
$log   = "$dst\_backup_log.txt"
$state = "$env:USERPROFILE\.claude\scripts\logs\backup-dev-state.json"

New-Item -ItemType Directory -Force $dst | Out-Null
New-Item -ItemType Directory -Force (Split-Path $state) | Out-Null

$started = Get-Date
"$($started.ToString('yyyy-MM-dd HH:mm')) start" | Add-Content $log

if (-not (Test-Path "G:\My Drive")) {
    # Google Drive not mounted. Record the failure rather than exiting quietly, or a
    # month of skipped runs reads as a month of successful ones.
    @{ lastRun = $started.ToString('o'); status = 'ERROR'; errors = @('drive-not-mounted') } |
        ConvertTo-Json | Set-Content $state
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm') ABORT: G:\My Drive not mounted" | Add-Content $log
    exit 1
}

robocopy $src $dst /E /COPY:DT /R:1 /W:2 /NP /NFL /NDL /NJH /XJ `
    /XD node_modules .venv venv __pycache__ .next dist build .pytest_cache .ruff_cache _to_delete `
    /LOG+:"$dst\_robocopy_last.txt" | Out-Null
$rc = $LASTEXITCODE

# Robocopy exit codes are a bitmask, not a status: 0-7 are success (1=copied, 2=extra,
# 4=mismatched), 8 and above mean at least one file genuinely failed. Treating any
# non-zero as failure would mark every successful run with copies as an error.
$ok = $rc -lt 8

@{
    lastRun  = $started.ToString('o')
    finished = (Get-Date).ToString('o')
    status   = $(if ($ok) { 'OK' } else { 'ERROR' })
    errors   = $(if ($ok) { @() } else { @("robocopy-rc:$rc") })
    rc       = $rc
    mode     = 'additive (/E)'
} | ConvertTo-Json | Set-Content $state

"$(Get-Date -Format 'yyyy-MM-dd HH:mm') done rc=$rc ok=$ok" | Add-Content $log
exit $(if ($ok) { 0 } else { 1 })
