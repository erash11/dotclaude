$dev = "C:\Users\eric_rash\Desktop\DEV"
$roots = @($dev, "$dev\Football", "$dev\SpecialRequests")
$repos = @()
foreach ($r in $roots) {
  if (-not (Test-Path $r)) { continue }
  Get-ChildItem $r -Directory -EA SilentlyContinue | Where-Object {
    $_.Name -notmatch '^(\.|_|token-dashboard)' -and $_.Name -notmatch '_OLD_merged'
  } | ForEach-Object {
    if (Test-Path "$($_.FullName)\.git") { $repos += $_.FullName }
  }
}
$noStatus = @(); $noAgents = @(); $dirty = @(); $unpushed = @(); $noRemote = @()
foreach ($p in $repos) {
  if (-not (Test-Path "$p\docs\STATUS.md")) { $noStatus += (Split-Path $p -Leaf) }
  if (-not (Test-Path "$p\AGENTS.md")) { $noAgents += (Split-Path $p -Leaf) }
  $st = git -C $p status --porcelain 2>$null
  if ($st) { $dirty += "$(Split-Path $p -Leaf) ($(($st | Measure-Object).Count))" }
  $rem = git -C $p remote 2>$null
  if (-not $rem) { $noRemote += (Split-Path $p -Leaf); continue }
  $ahead = git -C $p rev-list --count "@{u}..HEAD" 2>$null
  if ($ahead -and $ahead -ne '0') { $unpushed += "$(Split-Path $p -Leaf) ($ahead)" }
}
"REPOS TOTAL: $($repos.Count)"
"NO docs/STATUS.md: $($noStatus.Count)"
$noStatus -join ', '
""
"NO AGENTS.md: $($noAgents.Count)"
$noAgents -join ', '
""
"UNCOMMITTED: $($dirty.Count)"
$dirty -join ', '
""
"UNPUSHED: $($unpushed.Count)"
$unpushed -join ', '
""
"NO REMOTE: $($noRemote.Count)"
$noRemote -join ', '
