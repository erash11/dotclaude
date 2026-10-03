# mods-sync.ps1 (Windows): load every mod in ~/.claude/mods, nothing hand-listed.
#
# The folder is the list. A mod loads when it has .claude-plugin/plugin.json, has no
# .disabled file, and passes `claude plugin validate`. The result goes into the user env
# var CLAUDE_CODE_PLUGIN_DIRS (Claude Code on Windows starts without a shell profile, so
# it has to be the user variable). Mac twin: mods-sync.sh. Run by dev-sync and closeout.
#
#   powershell -ExecutionPolicy Bypass -File $HOME\.claude\mods\mods-sync.ps1
#   ... -NoValidate      skip validation (fast; trusts every folder)
param([switch]$NoValidate)

$root = Join-Path $HOME '.claude\mods'
$loaded = @(); $disabled = @(); $invalid = @()
foreach ($dir in Get-ChildItem -LiteralPath $root -Directory | Sort-Object Name) {
    if (-not (Test-Path (Join-Path $dir.FullName '.claude-plugin\plugin.json'))) { continue }
    if (Test-Path (Join-Path $dir.FullName '.disabled')) { $disabled += $dir.Name; continue }
    if (-not $NoValidate) {
        $null = & claude plugin validate $dir.FullName 2>&1
        if ($LASTEXITCODE -ne 0) { $invalid += $dir.Name; continue }
    }
    $loaded += $dir.FullName
}

$value = $loaded -join ';'
$before = [Environment]::GetEnvironmentVariable('CLAUDE_CODE_PLUGIN_DIRS', 'User')
if ($before -ne $value) { [Environment]::SetEnvironmentVariable('CLAUDE_CODE_PLUGIN_DIRS', $value, 'User') }

$line = "mods: $($loaded.Count) loaded, $($disabled.Count) disabled, $($invalid.Count) invalid"
if ($disabled) { $line += " | disabled: $($disabled -join ', ')" }
if ($invalid)  { $line += " | INVALID (not loaded; run claude plugin validate): $($invalid -join ', ')" }
if ($before -ne $value) { $line += ' | changed: restart Claude Code to pick it up' }
$line
