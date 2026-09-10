# harvest-dev-docs.ps1 -- copy every DEV repo's docs/*.md (STATUS, context, handoffs) into
# ~/.claude/global-memory/dev-docs/<repo>/ so memsearch indexes what Cowork, Codex and Claude Code write into repos.
# Windows twin of harvest-dev-docs.sh. Run by /closeout and the daily backup task.
$dev = if (Test-Path "$env:USERPROFILE\DEV\KeystoneOS") { "$env:USERPROFILE\DEV" } else { "$env:USERPROFILE\Desktop\DEV" }
$out = "$env:USERPROFILE\.claude\global-memory\dev-docs"
New-Item -ItemType Directory -Force $out | Out-Null
$n = 0
$roots = @(Get-ChildItem $dev -Directory) + @(Get-ChildItem "$dev\Football" -Directory -ErrorAction SilentlyContinue) + @(Get-ChildItem "$dev\SpecialRequests" -Directory -ErrorAction SilentlyContinue)
foreach ($r in $roots) {
  if ($r.Name -in @('_DRIVE','_tools','.claude','graphify-out')) { continue }
  $docs = Join-Path $r.FullName 'docs'
  if (-not (Test-Path $docs)) { continue }
  $dst = Join-Path $out $r.Name
  robocopy $docs $dst *.md /E /COPY:DT /R:1 /W:1 /NP /NFL /NDL /NJH /NJS /XJ /XD node_modules .venv | Out-Null
  $n++
}
"harvested docs from $n repos into $out"
