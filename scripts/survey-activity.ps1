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
    # distinct days with a commit in the last 90 days
    $days = git -C $p log --since='90 days ago' --format=%ad --date=short 2>$null | Sort-Object -Unique
    $n = ($days | Measure-Object).Count
    $commits = (git -C $p log --since='90 days ago' --oneline 2>$null | Measure-Object).Count
    $last = git -C $p log -1 --format=%ad --date=short 2>$null
    $rows += [pscustomobject]@{ Repo=$_.Name; Days=$n; Commits=$commits; Last=$last }
  }
}
"=== commit-day histogram, last 90 days ==="
"distinct days with commits -> how many repos"
$rows | Group-Object Days | Sort-Object { [int]$_.Name } | ForEach-Object {
  "  {0,3} day(s) : {1,4} repos" -f $_.Name, $_.Count
}
""
"=== repos with 5+ distinct commit days (genuinely worked, not migrated) ==="
$rows | Where-Object { $_.Days -ge 5 } | Sort-Object Days -Descending | ForEach-Object {
  "  {0,-40} {1,3} days  {2,4} commits  last {3}" -f $_.Repo, $_.Days, $_.Commits, $_.Last
}
""
"=== repos with exactly 1 commit day in 90d (migration-only signature) ==="
$one = $rows | Where-Object { $_.Days -eq 1 }
"count: $($one.Count)"
$one | Group-Object Last | Sort-Object Count -Descending | Select-Object -First 6 | ForEach-Object {
  "  {0} : {1} repos share this single commit date" -f $_.Name, $_.Count
}
""
"=== repos with ZERO commits in 90 days ==="
$z = $rows | Where-Object { $_.Commits -eq 0 }
"count: $($z.Count)"
($z | ForEach-Object { $_.Repo }) -join ', '
