$dev = "$env:USERPROFILE\Desktop\DEV"
Write-Output "=== nothing moved? ==="
Write-Output ("DEV top-level dirs : {0}" -f (Get-ChildItem $dev -Directory -EA SilentlyContinue).Count)
Write-Output ("_archive exists    : {0}  (must be False)" -f (Test-Path "$dev\_archive"))
Write-Output ""
Write-Output "=== memory intact? ==="
$pj = "$env:USERPROFILE\.claude\projects"
$all = Get-ChildItem $pj -Directory -EA SilentlyContinue
$mem = $all | Where-Object { Test-Path (Join-Path $_.FullName 'memory') }
Write-Output ("project slug dirs      : {0}" -f $all.Count)
Write-Output ("with memory/ folder    : {0}  (was 26)" -f $mem.Count)
$gm = "$env:USERPROFILE\.claude\global-memory"
foreach ($f in 'USER.md','MEMORY.md') {
  $p = Join-Path $gm $f
  if (Test-Path $p) { Write-Output ("{0,-22}: {1} bytes" -f $f, (Get-Item $p).Length) }
  else { Write-Output ("{0,-22}: MISSING" -f $f) }
}
$dd = Join-Path $gm 'dev-docs'
if (Test-Path $dd) { Write-Output ("dev-docs repo folders  : {0}" -f (Get-ChildItem $dd -Directory -EA SilentlyContinue).Count) }
$el = Join-Path $gm 'transcripts\.errors.log'
if (Test-Path $el) { Write-Output ("errors.log             : {0} bytes (0 = clean)" -f (Get-Item -Force $el).Length) }
