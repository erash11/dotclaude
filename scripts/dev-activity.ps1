# dev-activity.ps1 -- rank DEV repos by how much they are actually WORKED.
#
# Read-only. Touches no path, moves nothing, writes nothing. That is the point:
# an earlier plan to archive dormant repos into DEV/_archive/ was dropped because
# moving a folder would have broken three things at once --
#   1. harvest-dev-docs.ps1 walks `Get-ChildItem $dev -Directory` and reads
#      <dir>\docs\*.md without recursing, so an archived repo's docs land one level
#      too deep and drop out of the memsearch index silently;
#   2. KeystoneOS data files (projects.json, memory-sources.json,
#      memory-index-paths.json, discovery-roots.json) hold DEV paths;
#   3. Tier A project memory is keyed by a slug derived from the absolute path, so
#      moving a repo orphans its memory folder (26 exist on this machine).
# Ranking gives the same benefit -- knowing which repos matter -- with none of that.
#
# Signal is DISTINCT COMMIT DAYS, not recency and not commit count. Recency is
# fooled by a bulk migration: on 2026-09-09, 43 repos received a single commit each
# and every one of them looked "active in the last 60 days" afterwards. Days-worked
# is not fooled by that, because a migration touches a repo once.
#
# Usage: dev-activity.ps1 [-Days 90] [-Active 5]
param(
    [int]$Days = 90,     # window to look back over
    [int]$Active = 5     # distinct commit days at or above which a repo counts as active
)

$dev = if (Test-Path "$env:USERPROFILE\DEV\KeystoneOS") { "$env:USERPROFILE\DEV" } else { "$env:USERPROFILE\Desktop\DEV" }
$roots = @($dev, "$dev\Football", "$dev\SpecialRequests")

$rows = @()
foreach ($r in $roots) {
    if (-not (Test-Path $r)) { continue }
    Get-ChildItem $r -Directory -EA SilentlyContinue |
      Where-Object { $_.Name -notmatch '^(\.|_)' -and $_.Name -notmatch '_OLD_merged' } |
      ForEach-Object {
        $p = $_.FullName
        if (-not (Test-Path (Join-Path $p '.git'))) { return }
        # NOT $days: PowerShell variable names are case-insensitive, so $days and the
        # [int]$Days parameter are the same variable. Assigning the date list to it
        # clobbered the window with an array of date strings, every later
        # "$Days days ago" became garbage, and the script reported a 0-day window
        # and 0 active repos rather than failing outright.
        $dayList = git -C $p log --since="$Days days ago" --format=%ad --date=short 2>$null | Sort-Object -Unique
        $rows += [pscustomobject]@{
            Repo    = $_.Name
            Days    = ($dayList | Measure-Object).Count
            Commits = (git -C $p log --since="$Days days ago" --oneline 2>$null | Measure-Object).Count
            Last    = git -C $p log -1 --format=%ad --date=short 2>$null
            Path    = $p
        }
      }
}

$act = $rows | Where-Object { $_.Days -ge $Active } | Sort-Object Days -Descending

Write-Output "=== DEV activity: $($rows.Count) repos, $Days-day window, active = $Active+ commit days ==="
Write-Output ""
Write-Output "ACTIVE ($($act.Count)):"
foreach ($a in $act) {
    "  {0,-40} {1,3} days  {2,4} commits  last {3}" -f $a.Repo, $a.Days, $a.Commits, $a.Last
}
Write-Output ""
Write-Output "DORMANT: $(($rows | Where-Object { $_.Days -lt $Active }).Count) repos with fewer than $Active commit days."
Write-Output "  They stay exactly where they are and on GitHub. Nothing is archived or moved."
