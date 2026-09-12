Write-Output "=== backup manifest ==="
$paths = @("$HOME\.claude\scripts", "$HOME\Desktop\DEV\KeystoneOS\data", "$HOME\Desktop\DEV\KeystoneOS")
$man = $null
foreach ($p in $paths) {
  if (Test-Path $p) {
    $f = Get-ChildItem $p -Filter 'backup-manifest.json' -Recurse -Depth 2 -EA SilentlyContinue | Select-Object -First 1
    if ($f) { $man = $f; break }
  }
}
if ($man) {
  Write-Output $man.FullName
  $j = Get-Content $man.FullName -Raw | ConvertFrom-Json
  Write-Output "top-level keys: $(($j.PSObject.Properties.Name) -join ', ')"
  if ($j.destinations) {
    Write-Output "destinations:"
    foreach ($d in $j.destinations.PSObject.Properties) {
      $opt = if ($d.Value.optional) { ' (optional)' } else { '' }
      Write-Output ("  {0}{1} -> {2}" -f $d.Name, $opt, $d.Value.root)
    }
  }
  if ($j.sources) { Write-Output "source entries: $(($j.sources.PSObject.Properties.Name).Count)" }
} else { Write-Output "NOT FOUND on this machine" }

Write-Output ""
Write-Output "=== windows scheduled tasks ==="
$t = Get-ScheduledTask -EA SilentlyContinue | Where-Object { $_.TaskName -match 'Keystone|Backup|Claude|Morning|Ritual|Adjudicate' }
if ($t) { $t | Select-Object TaskName, State | Format-Table -AutoSize | Out-String } else { Write-Output "none found" }

Write-Output "=== backup state on this machine ==="
$bs = "$HOME\.claude\scripts\logs\backup-state.json"
if (Test-Path $bs) { Get-Content $bs -Raw } else { Write-Output "no backup-state.json -> daily-backup has never run on Windows" }

Write-Output ""
Write-Output "=== external drives present ==="
Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{n='FreeGB';e={[math]::Round($_.Free/1GB,1)}}, @{n='UsedGB';e={[math]::Round($_.Used/1GB,1)}} | Format-Table -AutoSize | Out-String

Write-Output "=== gitignored bulk data in DEV (top 12 by size) ==="
$dev = "$HOME\Desktop\DEV"
$sizes = @()
Get-ChildItem $dev -Directory -EA SilentlyContinue | Where-Object { $_.Name -notmatch '^(\.|_)' } | ForEach-Object {
  $s = (Get-ChildItem $_.FullName -Recurse -File -Force -EA SilentlyContinue | Measure-Object Length -Sum).Sum
  if ($s) { $sizes += [pscustomobject]@{ Repo=$_.Name; GB=[math]::Round($s/1GB,2) } }
}
$sizes | Sort-Object GB -Descending | Select-Object -First 12 | Format-Table -AutoSize | Out-String
Write-Output ("DEV total: {0} GB" -f [math]::Round((($sizes | Measure-Object GB -Sum).Sum),1))
