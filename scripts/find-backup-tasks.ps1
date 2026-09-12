Get-ScheduledTask -TaskName 'Backup AI Sessions to Drive','Backup DEV to Drive' -EA SilentlyContinue |
  Select-Object TaskName, TaskPath, State |
  Format-List | Out-String
