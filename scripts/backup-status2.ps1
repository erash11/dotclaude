foreach ($n in @('Backup AI Sessions to Drive','Backup DEV to Drive')) {
  $i = Get-ScheduledTaskInfo -TaskName $n -TaskPath '\Eric\' -EA SilentlyContinue
  $t = Get-ScheduledTask -TaskName $n -TaskPath '\Eric\' -EA SilentlyContinue
  $code = $i.LastTaskResult
  $meaning = switch ($code) {
    267009     { 'RUNNING' }
    267011     { 'has not run yet' }
    0          { 'completed OK' }
    3221225786 { 'KILLED (0xC000013A - shutdown/ctrl-c)' }
    default    { "code $code" }
  }
  Write-Output ("{0}" -f $n)
  Write-Output ("   state   : {0}" -f $t.State)
  Write-Output ("   last run: {0}  -> {1}" -f $i.LastRunTime, $meaning)
  Write-Output ("   next run: {0}" -f $i.NextRunTime)
}
Write-Output ""
foreach ($s in @('backup-ai-sessions-state.json','backup-dev-state.json')) {
  $p = Join-Path "$env:USERPROFILE\.claude\scripts\logs" $s
  if (Test-Path $p) {
    Write-Output "--- $s (modified $((Get-Item $p).LastWriteTime)) ---"
    Get-Content $p -Raw
  } else { Write-Output "--- $s : not written ---" }
}
