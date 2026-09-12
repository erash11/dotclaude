Write-Output "=== harvest-dev-docs: how does it walk DEV? ==="
$h = "$HOME\.claude\scripts\harvest-dev-docs.ps1"
if (Test-Path $h) {
  Select-String -Path $h -Pattern 'DEV|Get-ChildItem|Directory|skip|exclude|-notmatch' |
    Select-Object -First 12 | ForEach-Object { "  " + $_.Line.Trim() }
} else { Write-Output "  NOT FOUND" }

Write-Output ""
Write-Output "=== backup-manifest: DEV paths listed ==="
$m = "$HOME\.claude\scripts\backup-manifest.json"
if (Test-Path $m) {
  $j = Get-Content $m -Raw | ConvertFrom-Json
  if ($j.paths) {
    $n = ($j.paths.PSObject.Properties.Name).Count
    Write-Output "  path entries: $n"
    Write-Output "  (default-deny: a DEV dir absent from this manifest raises an error)"
    ($j.paths.PSObject.Properties.Name) | Select-Object -First 15 | ForEach-Object { "    $_" }
  }
} else { Write-Output "  NOT FOUND" }

Write-Output ""
Write-Output "=== KeystoneOS data files referencing DEV paths ==="
$kd = "$HOME\Desktop\DEV\KeystoneOS\data"
if (Test-Path $kd) {
  Get-ChildItem $kd -Filter '*.json' -EA SilentlyContinue | ForEach-Object {
    $hits = (Select-String -Path $_.FullName -Pattern 'DEV' -AllMatches -EA SilentlyContinue | Measure-Object).Count
    if ($hits -gt 0) { "  {0,-28} {1} line(s) mention DEV" -f $_.Name, $hits }
  }
} else { Write-Output "  no KeystoneOS/data" }

Write-Output ""
Write-Output "=== Tier A project memory slugs present on this machine ==="
$pj = "$HOME\.claude\projects"
if (Test-Path $pj) {
  $all = Get-ChildItem $pj -Directory -EA SilentlyContinue
  Write-Output "  total project dirs: $($all.Count)"
  $withMem = $all | Where-Object { Test-Path (Join-Path $_.FullName 'memory') }
  Write-Output "  with a memory/ folder: $($withMem.Count)"
  $all | Select-Object -First 5 | ForEach-Object { "    e.g. " + $_.Name }
} else { Write-Output "  no projects dir" }
