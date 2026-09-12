$i = Get-ScheduledTaskInfo -TaskName 'Backup DEV to Drive' -TaskPath '\Eric\'
$code = $i.LastTaskResult
$meaning = switch ($code) {
  267009  { 'RUNNING' }
  267011  { 'has not run yet' }
  0       { 'completed OK' }
  default { "finished with code $code" }
}
Write-Output ("task        : {0}" -f $meaning)
Write-Output ("last run    : {0}" -f $i.LastRunTime)
$s = "$env:USERPROFILE\.claude\scripts\logs\backup-dev-state.json"
if (Test-Path $s) { Write-Output "state file  :"; Get-Content $s -Raw }
else { Write-Output "state file  : not written yet (still copying)" }
