# Phase 1 verification — SHA-256 compare of the irreplaceable payload against source.
# Scope: DEV-repo-data (no other copy anywhere), DEV-nonrepo (Baylor OneDrive only),
# DEV-working-tree (uncommitted edits GitHub does not hold).
# repos/ and claude/projects are excluded: independently verifiable vs GitHub / Drive.
#
# VERDICT semantics:
#   MISMATCH   = the SSD copy differs from a source that still exists. Real corruption
#                risk. Fails the run.
#   SOURCE-GONE = on the SSD, absent from source. EXPECTED and not a failure: the SSD
#                is an additive store by design, so it retains files deleted upstream.
#                That is the point — a mirror would have deleted them too.

$ErrorActionPreference = 'Continue'
$dest = 'D:\AssistantBackup'
$dev  = 'C:\Users\eric_rash\Desktop\DEV'
$man  = Join-Path $dest 'MANIFEST'
$log  = Join-Path $man 'verify.log'

New-Item -ItemType Directory -Force -Path $man | Out-Null
Set-Content -LiteralPath $log -Value '' -Encoding UTF8   # fresh log; the verdict must describe THIS run
function Log($m){ $l="{0} {1}" -f (Get-Date -Format 'HH:mm:ss'),$m; $l; Add-Content $log $l }

Log "===== phase1-verify start ====="
$rows = New-Object System.Collections.Generic.List[object]
$match=0; $mismatch=0; $gone=0; $bytes=0
$mismatchList = New-Object System.Collections.Generic.List[string]

foreach($tier in @(
  @{ root="$dest\DEV-repo-data";    label='repo-orphan'  },
  @{ root="$dest\DEV-nonrepo";      label='non-repo'     },
  @{ root="$dest\DEV-working-tree"; label='working-tree' }
)){
  if(-not (Test-Path $tier.root)){ Log "SKIP $($tier.label) (absent)"; continue }
  Log "TIER $($tier.label)"
  $files = Get-ChildItem $tier.root -Recurse -File -EA SilentlyContinue
  Log "  $($files.Count) files to verify"
  foreach($f in $files){
    $rel = $f.FullName.Substring($tier.root.Length+1)
    $src = Join-Path $dev $rel
    if(-not (Test-Path -LiteralPath $src -PathType Leaf)){
      $gone++
      $rows.Add([PSCustomObject]@{ rel=$rel; tier=$tier.label; status='SOURCE-GONE'; sha256=''; bytes=$f.Length })
      continue
    }
    try{
      $hd = (Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash
      $hs = (Get-FileHash -LiteralPath $src        -Algorithm SHA256).Hash
      if($hd -eq $hs){ $match++; $st='OK' }
      else { $mismatch++; $st='MISMATCH'; $mismatchList.Add($rel); Log "  MISMATCH $rel" }
      $bytes += $f.Length
      $rows.Add([PSCustomObject]@{ rel=$rel; tier=$tier.label; status=$st; sha256=$hd; bytes=$f.Length })
    } catch {
      $mismatch++; $mismatchList.Add("$rel (error)")
      Log "  ERR $rel : $($_.Exception.Message)"
      $rows.Add([PSCustomObject]@{ rel=$rel; tier=$tier.label; status='ERROR'; sha256=''; bytes=$f.Length })
    }
  }
}

$rows | Export-Csv (Join-Path $man 'sha256-manifest.csv') -NoTypeInformation -Encoding UTF8
Log "RESULT verified=$match mismatched=$mismatch source-gone=$gone"
Log "RESULT bytes verified: $([math]::Round($bytes/1GB,2)) GB"
Log "MANIFEST sha256-manifest.csv written ($($rows.Count) rows)"
if($gone -gt 0){ Log "NOTE $gone file(s) retained on SSD after upstream deletion - expected for an additive store, not a failure" }

if($mismatch -eq 0){
  Log "VERDICT: PASS - every rescued file matches its source by SHA-256"
} else {
  Log "VERDICT: FAIL - $mismatch file(s) differ: $($mismatchList -join '; ')"
}
Log "===== phase1-verify end ====="
