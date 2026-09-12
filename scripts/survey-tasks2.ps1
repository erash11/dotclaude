foreach ($n in @('Backup AI Sessions to Drive','Backup DEV to Drive')) {
  Write-Output "=== $n ==="
  $t = Get-ScheduledTask -TaskName $n -EA SilentlyContinue
  if (-not $t) { Write-Output "  not found"; continue }
  $i = Get-ScheduledTaskInfo -TaskName $n -EA SilentlyContinue
  Write-Output ("  state      : {0}" -f $t.State)
  Write-Output ("  last run   : {0}" -f $i.LastRunTime)
  Write-Output ("  last result: {0}  (0 = success)" -f $i.LastTaskResult)
  Write-Output ("  next run   : {0}" -f $i.NextRunTime)
  foreach ($a in $t.Actions) {
    Write-Output ("  action     : {0} {1}" -f $a.Execute, $a.Arguments)
  }
}
