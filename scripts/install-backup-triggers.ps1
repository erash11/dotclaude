# install-backup-triggers.ps1 -- give the two Windows backup tasks an action pointing at
# the fixed scripts, and a trigger so they actually fire.
#
# Both tasks existed already and reported state "Ready", which reads as healthy. Neither
# had ever run: registered with no trigger, so "Ready" meant "waiting for a start signal
# that will never come". Found 2026-09-12.
#
# StartWhenAvailable matters on a laptop: without it, a run missed because the machine
# was asleep or shut at the scheduled minute is skipped entirely rather than caught up.

$scripts = "$env:USERPROFILE\.claude\scripts"

# Both tasks live under \Eric\, not the root. Get-ScheduledTask finds them by name alone,
# but Set-ScheduledTask does not: without -TaskPath it fails with "The system cannot find
# the file specified", which reads as a missing SCRIPT rather than a missing task.
$taskPath = '\Eric\'

$plan = @(
    @{
        Name    = 'Backup AI Sessions to Drive'
        Script  = "$scripts\backup-ai-sessions.ps1"
        Trigger = (New-ScheduledTaskTrigger -Daily -At 12:30am)
        Why     = 'daily 00:30 -- session logs churn every day and the copy takes seconds'
    }
    # 'Backup DEV to Drive' retired 2026-09-22: Drive for Desktop already mirrors
    # Desktop\DEV as a synced root, and the ~15 GB weekly robocopy never finished a run.
    # Task XML and script are in scripts\retired\.
)

foreach ($p in $plan) {
    $t = Get-ScheduledTask -TaskName $p.Name -EA SilentlyContinue
    if (-not $t) { Write-Output "  $($p.Name): NOT FOUND, skipped"; continue }
    if (-not (Test-Path $p.Script)) { Write-Output "  $($p.Name): script missing, skipped"; continue }

    $action = New-ScheduledTaskAction -Execute 'powershell.exe' `
        -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$($p.Script)`""
    $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable `
        -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries `
        -ExecutionTimeLimit (New-TimeSpan -Hours 6)

    Set-ScheduledTask -TaskName $p.Name -TaskPath $taskPath -Action $action -Trigger $p.Trigger -Settings $settings | Out-Null

    $i = Get-ScheduledTaskInfo -TaskName $p.Name -TaskPath $taskPath
    Write-Output ("  {0,-28} next={1}" -f $p.Name, $i.NextRunTime)
    Write-Output ("  {0,-28} {1}" -f '', $p.Why)
}
