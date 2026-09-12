$dev = "C:\Users\eric_rash\Desktop\DEV"
$roots = @($dev, "$dev\Football", "$dev\SpecialRequests")
$rows = @()
foreach ($r in $roots) {
  if (-not (Test-Path $r)) { continue }
  Get-ChildItem $r -Directory -EA SilentlyContinue | Where-Object {
    $_.Name -notmatch '^(\.|_)' -and $_.Name -notmatch '_OLD_merged'
  } | ForEach-Object {
    $p = $_.FullName
    if (-not (Test-Path "$p\.git")) { return }
    $last = git -C $p log -1 --format=%ct 2>$null
    if (-not $last) { return }
    $sp = "$p\docs\STATUS.md"
    $sdate = $null
    if (Test-Path $sp) { $sdate = git -C $p log -1 --format=%ct -- docs/STATUS.md 2>$null }
    $rows += [pscustomobject]@{
      Repo = $_.Name
      LastCommit = [int]$last
      StatusCommit = if ($sdate) { [int]$sdate } else { 0 }
    }
  }
}
$now = [int][double]::Parse((Get-Date -UFormat %s))
$day = 86400
$active = $rows | Where-Object { ($now - $_.LastCommit) -lt (60*$day) }
"Repos with a commit in last 60 days: $($active.Count) of $($rows.Count)"
""
"ACTIVE repos whose STATUS.md is 14+ days older than the last commit:"
$stale = $active | Where-Object { $_.StatusCommit -gt 0 -and ($_.LastCommit - $_.StatusCommit) -gt (14*$day) }
foreach ($s in ($stale | Sort-Object { $_.LastCommit - $_.StatusCommit } -Descending)) {
  $lag = [math]::Round(($s.LastCommit - $s.StatusCommit)/$day)
  $age = [math]::Round(($now - $s.LastCommit)/$day)
  "  {0,-38} STATUS lags code by {1,4} days (last commit {2} days ago)" -f $s.Repo, $lag, $age
}
if (-not $stale) { "  none" }
""
"ACTIVE repos with NO STATUS.md at all:"
$none = $active | Where-Object { $_.StatusCommit -eq 0 }
foreach ($s in $none) {
  $age = [math]::Round(($now - $s.LastCommit)/$day)
  "  {0,-38} last commit {1} days ago" -f $s.Repo, $age
}
if (-not $none) { "  none" }
