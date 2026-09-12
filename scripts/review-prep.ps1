foreach ($r in @("$env:USERPROFILE\.claude\skills", "$env:USERPROFILE\.claude")) {
  Write-Output "=========== $r ==========="
  Write-Output "--- commits today (2026-09-12) ---"
  git -C $r log --since='2026-09-12 00:00' --format='%h %ad %s' --date=short 2>$null
  Write-Output "--- first-parent candidate fixed points ---"
  git -C $r log --since='2026-09-11 00:00' --until='2026-09-12 00:00' --format='%h %ad %s' --date=short 2>$null | Select-Object -First 3
  Write-Output "--- standards / issue-tracker docs present? ---"
  foreach ($f in 'CONTRIBUTING.md','CODING_STANDARDS.md','AGENTS.md','CLAUDE.md','docs\agents\issue-tracker.md') {
    $p = Join-Path $r $f
    Write-Output ("  {0,-32} {1}" -f $f, $(if (Test-Path $p) { 'present' } else { '-' }))
  }
  Write-Output ""
}
