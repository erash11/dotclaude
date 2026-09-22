Write-Output "=== everything pushed? ==="
foreach ($r in @("$env:USERPROFILE\.claude", "$env:USERPROFILE\.claude\skills", "$env:USERPROFILE\.claude\global-memory")) {
  $n = Split-Path $r -Leaf
  $c = git -C $r rev-list --left-right --count "origin/main...HEAD" 2>$null
  if ($c) {
    $p = $c -split '\s+'
    Write-Output ("  {0,-16} behind={1} ahead={2}" -f $n, $p[0], $p[1])
  }
  $d = (git -C $r status --porcelain 2>$null | Measure-Object).Count
  Write-Output ("  {0,-16} uncommitted={1}" -f $n, $d)
}

Write-Output ""
Write-Output "=== does each changed artifact have both-platform coverage? ==="
$pairs = @(
  @{ n='dev-activity';    win="$env:USERPROFILE\.claude\scripts\dev-activity.ps1";  mac="$env:USERPROFILE\.claude\scripts\dev-activity.sh" },
  @{ n='sync-to-codex';   win="$env:USERPROFILE\.claude\skills\sync-to-codex.ps1";  mac="$env:USERPROFILE\.claude\skills\sync-to-codex.sh" },
  @{ n='harvest-dev-docs';win="$env:USERPROFILE\.claude\scripts\harvest-dev-docs.ps1"; mac="$env:USERPROFILE\.claude\scripts\harvest-dev-docs.sh" }
)
foreach ($p in $pairs) {
  Write-Output ("  {0,-18} win={1,-7} mac={2}" -f $p.n, (Test-Path $p.win), (Test-Path $p.mac))
}

Write-Output ""
Write-Output "=== skills changed this session: present and synced to codex? ==="
foreach ($s in 'startup','dev-sync','closeout','claude-stack-doctor') {
  $src = Test-Path "$env:USERPROFILE\.claude\skills\$s\SKILL.md"
  $cdx = Test-Path "$env:USERPROFILE\.codex\skills\$s\SKILL.md"
  Write-Output ("  {0,-22} claude={1,-7} codex={2}" -f $s, $src, $cdx)
}

Write-Output ""
Write-Output "=== known-outstanding ==="
$el = "$env:USERPROFILE\.claude\global-memory\transcripts\.errors.log"
Write-Output ("  errors.log bytes        : {0} (0 = clean)" -f $(if (Test-Path $el) { (Get-Item -Force $el).Length } else { 'missing' }))
$mm = "$env:USERPROFILE\.claude\global-memory\MEMORY.md"
Write-Output ("  MEMORY.md bytes         : {0} / 2500 cap" -f (Get-Item $mm).Length)
$t = Get-ScheduledTask -EA SilentlyContinue | Where-Object { $_.TaskName -match 'Keystone' -and $_.State -eq 'Disabled' }
Write-Output ("  KeystoneOS tasks disabled: {0}" -f ($t | Measure-Object).Count)
foreach ($n in 'Backup AI Sessions to Drive') {   # 'Backup DEV to Drive' retired 2026-09-22
  $i = Get-ScheduledTaskInfo -TaskName $n -EA SilentlyContinue
  Write-Output ("  {0,-26} lastRun={1}" -f $n, $(if ($i.LastRunTime) { $i.LastRunTime } else { 'NEVER' }))
}
