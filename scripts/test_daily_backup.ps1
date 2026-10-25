# test_daily_backup.ps1 - offline test for daily-backup.ps1 (no network, no real backup, no real index).
# Same method as the 2026-10-23 harness (jobs/802ea68a/tmp/bk): load single functions and statements
# out of the script by AST and run them against a fixture home with fake gws, uv and memsearch.
# Every path the loaded code touches is built from $U / $LogDir / $DevRoot, which point into a temp dir.
# Run: pwsh -NoProfile -File ~/.claude/scripts/test_daily_backup.ps1     (exit 0 = all checks pass)
$ErrorActionPreference = 'Continue'
$Script = "$HOME/.claude/scripts/daily-backup.ps1"
$ScriptText = Get-Content -Raw -LiteralPath $Script
$tok = $null; $perr = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile($Script, [ref]$tok, [ref]$perr)
$script:fails = 0
function Check($name, $cond) { if ($cond) { "PASS $name" } else { "FAIL $name"; $script:fails++ } }
Check "parse: $($perr.Count) errors" ($perr.Count -eq 0)
if ($perr.Count) { $perr | ForEach-Object { "  line $($_.Extent.StartLineNumber): $($_.Message)" }; exit 1 }

$T = Join-Path ([IO.Path]::GetTempPath()) "dbtest-$([guid]::NewGuid().ToString('N'))"
New-Item -ItemType Directory -Force -Path "$T/bin", "$T/out" | Out-Null
$env:FAKE_DIR = "$T/bin"; $env:FAKE_OUT = "$T/out"
try {
    # Script-scope variables the loaded code reads. None of them points at the real home.
    $U = "$T/home"; $LogDir = "$U/.claude/scripts/logs"; $LogFile = "$LogDir/daily-backup.log"; $DevRoot = "$U/DEV"
    $DryRun = $false
    $Errors = [System.Collections.Generic.List[string]]::new()
    $Results = [System.Collections.Generic.List[object]]::new()
    $LogLines = [System.Collections.Generic.List[string]]::new()
    function Log($msg) { $LogLines.Add("$msg"); "  LOG $msg" | Out-Host }
    function Reset { $Errors.Clear(); $LogLines.Clear() }
    New-Item -ItemType Directory -Force -Path $LogDir, "$U/.claude/global-memory/transcripts" | Out-Null

    $want = 'Invoke-GwsJson', 'Snapshot-Gws', 'Snapshot-CodexConfig', 'Snapshot-ShellDotfiles', 'Get-IndexIncompleteRun', 'Invoke-UvPrune',
            'Invoke-LogTrim', 'Remove-OldFiles', 'Invoke-Rsync', 'Snapshot-Additive'
    $fns = @($ast.FindAll({ $args[0] -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $want -contains $args[0].Name }, $true))
    $fns | ForEach-Object { . ([scriptblock]::Create($_.Extent.Text)) }
    Check "loaded $($fns.Count) of $($want.Count) functions" ($fns.Count -eq $want.Count)
    foreach ($s in $ast.EndBlock.Statements) {
        if ($s.Extent.Text -match '^\$(CredDenyDirs|CredDenyFiles|CredDenyRe|RsyncTimeoutSec)\s*=') { . ([scriptblock]::Create($s.Extent.Text)) }
    }

    # ---- fakes ----
    Set-Content -LiteralPath "$T/bin/gws" -Value @'
#!/bin/bash
# Fake gws: copy any uploaded archive to $FAKE_OUT, answer like the API.
for a in "$@"; do case "$a" in ./*.tgz) cp "$a" "$FAKE_OUT/";; esac; done
case "$*" in *"files list"*) echo '{"files":[]}';; *) echo '{"id":"fake-id","name":"x"}';; esac
'@
    Set-Content -LiteralPath "$T/bin/memsearch" -Value @'
#!/bin/bash
echo "$@" > "$FAKE_DIR/ms-called"
case "$FAKE_MS_MODE" in
  zero) echo "Indexed 0 chunks.";;
  some) echo "scanning"; echo "Indexed 5 chunks.";;
  garbage) echo "Traceback (most recent call last):";;
  fail) echo "Error: milvus down" >&2; exit 1;;
esac
'@
    Set-Content -LiteralPath "$T/bin/uv" -Value @'
#!/bin/bash
echo "${UV_LOCK_TIMEOUT:-unset}" > "$FAKE_DIR/uv-timeout"
echo "$*" >> "$FAKE_DIR/uv-calls"
case "$*" in
  *"cache size"*) echo "warning: experimental" >&2; if [ -f "$FAKE_DIR/pruned" ]; then echo "0.5GiB"; else echo "1.0GiB"; fi;;
  *"cache prune"*)
    case "$FAKE_UV_MODE" in
      ok) echo "Pruning cache at: /x" >&2; echo "Removed 12 files (500MiB)" >&2; touch "$FAKE_DIR/pruned";;
      lock) echo 'error: Timeout (10s) when waiting for lock on `/x/.lock` at `/x`, is another uv process running? You can set `UV_LOCK_TIMEOUT` to increase the timeout.' >&2; exit 2;;
      *) echo "error: Permission denied (os error 13)" >&2; exit 2;;
    esac;;
esac
'@
    & /bin/chmod +x "$T/bin/gws" "$T/bin/memsearch" "$T/bin/uv"
    $GwsExe = "$T/bin/gws"; $DriveMachineId = 'fake-parent'

    # ---- R23: codex-config.tgz ----
    "--- R23 codex-config snapshot"
    $cx = "$U/.codex"
    New-Item -ItemType Directory -Force -Path "$cx/rules", "$cx/packages/p", "$cx/plugins/q", "$cx/.tmp/r", "$cx/cache/s",
        "$cx/computer-use/t", "$cx/visualizations/v", "$cx/sessions/2026/cache", "$cx/work/w" | Out-Null
    'model = "x"' | Set-Content "$cx/config.toml"
    '{"hooks":[]}' | Set-Content "$cx/hooks.json"
    'prefix_rule()' | Set-Content "$cx/rules/default.rules"
    '{"t":1}' | Set-Content "$cx/history.jsonl"
    '{"secret":"never"}' | Set-Content "$cx/auth.json"
    foreach ($d in 'packages/p', 'plugins/q', '.tmp/r', 'cache/s', 'computer-use/t', 'visualizations/v', 'work/w') { 'x' | Set-Content "$cx/$d/f.txt" }
    'keep' | Set-Content "$cx/sessions/2026/cache/keep.txt"
    & /usr/bin/sqlite3 "$cx/memories_1.sqlite" 'PRAGMA journal_mode=WAL; create table m(x); insert into m values(1);' | Out-Null
    & /usr/bin/sqlite3 "$cx/state_5.sqlite" "create table t(x); insert into t values('kept');" | Out-Null
    # session_index.jsonl left out on purpose: a missing item is a logged skip, not an error.
    Reset
    Snapshot-CodexConfig
    $list = @(& /usr/bin/tar -tzf "$T/out/codex-config.tgz" 2>$null)
    Check 'codex-config.tgz uploaded through gws' ($list.Count -gt 0)
    foreach ($n in 'config.toml', 'hooks.json', 'rules/default.rules', 'memories_1.sqlite', 'state_5.sqlite', 'history.jsonl') {
        Check "archive holds $n" ($list -contains "codex-config/$n")
    }
    Check 'archive never holds auth.json' (-not ($list -match 'auth\.json'))
    Check 'archive holds only the allowlist (no packages, sessions, work)' (-not ($list -match '/(packages|sessions|work|plugins)/'))
    Check 'missing session_index.jsonl logged as skip' (@($LogLines -match 'CODEX skip \(missing\).*session_index\.jsonl').Count -eq 1)
    Check 'no errors' ($Errors.Count -eq 0)
    New-Item -ItemType Directory -Force -Path "$T/x" | Out-Null
    & /usr/bin/tar -xzf "$T/out/codex-config.tgz" -C "$T/x"
    Check 'state_5.sqlite copy passes quick_check' ((& /usr/bin/sqlite3 "$T/x/codex-config/state_5.sqlite" 'PRAGMA quick_check;') -eq 'ok')
    Check 'state_5.sqlite copy holds the row' ((& /usr/bin/sqlite3 "$T/x/codex-config/state_5.sqlite" 'select x from t;') -eq 'kept')
    Check 'old codex-memories/codex-agents snapshot lines are gone' (-not ($ScriptText -match "Snapshot-Gws .*'codex-(memories|agents)\.tgz'"))

    "--- shell-dotfiles snapshot"
    'export FIREFLIES_API_KEY="$(security find-generic-password -s FIREFLIES_API_KEY -a "$USER" -w 2>/dev/null)"' | Set-Content "$U/.zshrc"
    'eval "$(/opt/homebrew/bin/brew shellenv)"' | Set-Content "$U/.zprofile"
    'export GITHUB_TOKEN="ghp_abcdefghijklmnopqrstuvwxyz0123456789"' | Set-Content "$U/.zshenv"   # planted fake secret
    # .gitconfig left out on purpose: a missing file is a logged skip.
    Reset
    Snapshot-ShellDotfiles
    $list = @(& /usr/bin/tar -tzf "$T/out/shell-dotfiles.tgz" 2>$null)
    Check 'shell-dotfiles.tgz holds .zshrc and .zprofile' (($list -contains 'shell-dotfiles/.zshrc') -and ($list -contains 'shell-dotfiles/.zprofile'))
    Check 'a Keychain lookup line is not mistaken for a secret' (-not (@($Errors) -contains 'shell-dotfiles:.zshrc'))
    Check 'file with a secret value refused, not archived' ((@($Errors) -contains 'shell-dotfiles:.zshenv') -and -not ($list -match '\.zshenv'))
    Check 'missing .gitconfig logged as skip' (@($LogLines -match 'SHELL skip \(missing\).*\.gitconfig').Count -eq 1)

    "--- R23 .codex SSD excludes (real rsync, fixture paths)"
    $m = [regex]::Match($ScriptText, "if \(\`$entry\.path -eq '\.codex'\) \{ \`$extra = (@\([^)]*\)) \}")
    Check 'found the .codex exclude line' $m.Success
    $extra = & ([scriptblock]::Create($m.Groups[1].Value))
    Reset
    $ok = Snapshot-Additive $cx "$T/ssd/codex" $extra
    Check 'Snapshot-Additive ok' ($ok -eq $true)
    foreach ($d in 'packages', 'plugins', '.tmp', 'cache', 'computer-use', 'visualizations', 'work') { Check "SSD copy skips top-level $d" (-not (Test-Path "$T/ssd/codex/$d")) }
    Check 'SSD copy keeps a nested cache folder (anchored exclude)' (Test-Path "$T/ssd/codex/sessions/2026/cache/keep.txt")
    Check 'SSD copy keeps config.toml' (Test-Path "$T/ssd/codex/config.toml")
    Check 'auth.json never reaches the SSD copy (credential deny-list)' (-not (Test-Path "$T/ssd/codex/auth.json"))

    # ---- HARNESS #4: previous-run check ----
    "--- HARNESS #4 previous-run check"
    $died = @('2026-10-20 00:00:01 ===== daily-backup start (DryRun=False) run=20261020-000001 =====',
              '2026-10-20 00:05:30 RECEIPT drive : verified run=20261020-000001 (via gws)',
              '2026-10-20 00:05:30 INDEX path set: 13 paths from memory-index-paths.json')
    $okRun = @('2026-10-21 08:00:00 ===== daily-backup start (DryRun=False) run=20261021-080000 =====',
               '2026-10-21 08:14:06 INDEX path set: 13 paths from memory-index-paths.json',
               '2026-10-21 09:26:33 INDEX full set: Indexed 150 chunks.',
               '2026-10-21 09:26:34 ===== daily-backup end: OK (0 errors) =====')
    $skipRun = @('2026-10-22 08:00:00 ===== daily-backup start (DryRun=False) run=20261022-080000 =====',
                 '2026-10-22 08:10:00 INDEX path set: 13 paths from memory-index-paths.json',
                 '2026-10-22 08:10:00 INDEX skipped - another index run is active; next hook/nightly pass will catch up')
    $dry = @('2026-10-23 08:00:00 ===== daily-backup start (DryRun=True) run=20261023-080000 =====',
             '2026-10-23 08:01:00 ===== daily-backup end: OK (0 errors) =====')
    Check 'died block -> its run id' ((Get-IndexIncompleteRun $died) -eq '20261020-000001')
    Check 'complete block -> nothing' ($null -eq (Get-IndexIncompleteRun ($died + $okRun)))
    Check 'INDEX skipped block -> nothing' ($null -eq (Get-IndexIncompleteRun $skipRun))
    Check 'died block then a dry run -> still found' ((Get-IndexIncompleteRun ($died + $dry)) -eq '20261020-000001')
    Check 'empty log -> nothing' ($null -eq (Get-IndexIncompleteRun @()))
    $real = @(Get-Content -LiteralPath "$HOME/.claude/scripts/logs/daily-backup.log" -Tail 3000)
    "  INFO real log's last real run -> '$(Get-IndexIncompleteRun $real)' (the run going on now shows here; the live-pwsh guard stops a false error)"
    $pat = [regex]::Match($ScriptText, "pgrep -f '([^']+)'").Groups[1].Value
    $hits = @(& /usr/bin/pgrep -f $pat 2>$null)
    $names = @($hits | ForEach-Object { (& /bin/ps -o comm= -p $_ 2>$null) })
    "  INFO guard pattern '$pat' matches pids: $($hits -join ',') ($($names -join ','))"
    Check 'guard pattern never matches caffeinate' (-not ($names -match 'caffeinate'))

    # ---- HARNESS #3 + #4 in-run: the real index statement, fake memsearch ----
    "--- HARNESS #3 index logging (real statement, fake memsearch)"
    $idx = $ast.EndBlock.Statements | Where-Object { $_.Extent.Text -like 'if ($msExe -and -not $DryRun)*' } | Select-Object -First 1
    Check 'found the index statement' ($null -ne $idx)
    New-Item -ItemType Directory -Force -Path "$U/notes/sub", "$U/empty", "$DevRoot/KeystoneOS/data" | Out-Null
    'a' | Set-Content "$U/notes/a.md"; 'b' | Set-Content "$U/notes/b.md"; 'c' | Set-Content "$U/notes/sub/c.md"; 'x' | Set-Content "$U/empty/x.txt"
    $cfg = "$DevRoot/KeystoneOS/data/memory-index-paths.json"
    '{"paths":["{HOME}/notes","{HOME}/notes/sub","{HOME}/missing"]}' | Set-Content $cfg
    $lock = "$U/.claude/global-memory/transcripts/.memsearch-index.lock"
    function RunIndex($mode, $exe = "$T/bin/memsearch") {
        Reset; Remove-Item "$T/bin/ms-called" -ErrorAction SilentlyContinue
        $env:FAKE_MS_MODE = $mode; $script:msExe = $exe
        . ([scriptblock]::Create($idx.Extent.Text))
    }
    RunIndex 'zero'
    Check 'zero: logs counts, overlap counted once, quiet-day note' (@($LogLines -match '^INDEX full set: Indexed 0 chunks\. \(2/3 paths exist, 3 \.md files scanned; no new content since last index, exit 0\)$').Count -eq 1)
    Check 'zero: no errors' ($Errors.Count -eq 0)
    Check 'zero: lock released' (-not (Test-Path $lock))
    RunIndex 'some'
    Check 'some: no note, no errors' ((@($LogLines -match '^INDEX full set: Indexed 5 chunks\. \(2/3 paths exist, 3 \.md files scanned, exit 0\)$').Count -eq 1) -and $Errors.Count -eq 0)
    RunIndex 'garbage'
    Check 'garbage output -> memsearch-index:unexpected-output' (@($Errors) -contains 'memsearch-index:unexpected-output')
    RunIndex 'fail'
    Check 'exit 1 -> memsearch-index:full-set' (@($Errors) -contains 'memsearch-index:full-set')
    '{"paths":["{HOME}/empty","{HOME}/missing"]}' | Set-Content $cfg
    RunIndex 'zero'
    Check 'no .md input -> memsearch-index:no-input, memsearch not called' ((@($Errors) -contains 'memsearch-index:no-input') -and -not (Test-Path "$T/bin/ms-called"))
    Check 'no input -> NOT RUN line' (@($LogLines -match '^INDEX full set: NOT RUN - nothing to index \(1/2 paths exist, 0 \.md files scanned\)$').Count -eq 1)
    '{"paths":["{HOME}/notes"]}' | Set-Content $cfg
    RunIndex 'zero' "$T/bin/no-such-memsearch"
    Check 'index step throws -> memsearch-index:no-result (in-run #4)' ((@($Errors) -contains 'memsearch-index:no-result') -and (@($LogLines -match 'NO RESULT').Count -eq 1))
    Check 'index step throws -> lock still released' (-not (Test-Path $lock))

    # ---- uv cache prune ----
    "--- uv cache prune (fake uv)"
    $stamp = "$LogDir/uv-prune.stamp"
    $env:FAKE_UV_MODE = 'lock'; Reset
    Invoke-UvPrune "$T/bin/uv" $stamp
    Check 'lock: skipped line, no error, no stamp' ((@($LogLines) -contains 'uv-prune: skipped (locked by a live uvx server; normal, retries next run)') -and $Errors.Count -eq 0 -and -not (Test-Path $stamp))
    Check 'UV_LOCK_TIMEOUT=10 reached uv' ((Get-Content "$T/bin/uv-timeout") -eq '10')
    $env:FAKE_UV_MODE = 'boom'; Reset
    Invoke-UvPrune "$T/bin/uv" $stamp
    Check 'other failure -> uv-prune error, no stamp' ((@($Errors) -contains 'uv-prune') -and -not (Test-Path $stamp))
    $env:FAKE_UV_MODE = 'ok'; Reset
    Invoke-UvPrune "$T/bin/uv" $stamp
    Check 'ok: "uv-prune: ok 1.0GiB->0.5GiB" and stamp written' ((@($LogLines) -contains 'uv-prune: ok 1.0GiB->0.5GiB') -and (Test-Path $stamp) -and $Errors.Count -eq 0)
    $calls = @(Get-Content "$T/bin/uv-calls").Count; Reset
    Invoke-UvPrune "$T/bin/uv" $stamp
    Check 'second call the same day does nothing' ((@(Get-Content "$T/bin/uv-calls").Count -eq $calls) -and $LogLines.Count -eq 0)
    (Get-Item $stamp).LastWriteTime = (Get-Date).AddDays(-1); Remove-Item "$T/bin/pruned"; Reset
    Invoke-UvPrune "$T/bin/uv" $stamp
    Check 'stamp from yesterday -> runs again' (@($LogLines -match '^uv-prune: ok ').Count -eq 1)
    Remove-Item $stamp; $DryRun = $true; $calls = @(Get-Content "$T/bin/uv-calls").Count; Reset
    Invoke-UvPrune "$T/bin/uv" $stamp
    Check 'dry run: logs only, uv not called' ((@($LogLines -match 'dry-run').Count -eq 1) -and (@(Get-Content "$T/bin/uv-calls").Count -eq $calls))
    $DryRun = $false
    Check 'call site uses ~/.local/bin/uv and a stamp in $LogDir' ($ScriptText -match 'Invoke-UvPrune "\$U/\.local/bin/uv" "\$LogDir/uv-prune\.stamp"')

    # ---- R22 log trims ----
    "--- R22 log trims"
    $big = "$T/logs/big.log"; $jl = "$T/logs/shadow.jsonl"; $small = "$T/logs/small.log"
    New-Item -ItemType Directory -Force -Path "$T/logs" | Out-Null
    Set-Content -LiteralPath $big -Value (1..30000 | ForEach-Object { "2026-10-24 00:00:00 line $_ padding padding padding padding padding" })
    Set-Content -LiteralPath $jl -Value (1..30000 | ForEach-Object { '{"n":' + $_ + ',"tool":"Bash","pad":"................................","shape":"git status \"x\" é"}' })
    Set-Content -LiteralPath $small -Value (1..100 | ForEach-Object { "s $_" })
    $inode = (& /usr/bin/stat -f %i $big); $smallBefore = Get-FileHash $small
    "  INFO big.log $((Get-Item $big).Length) bytes, shadow.jsonl $((Get-Item $jl).Length) bytes"
    $DryRun = $true; Reset
    Invoke-LogTrim @($big)
    Check 'dry run: big.log untouched, logged' ((@(Get-Content $big).Count -eq 30000) -and (@($LogLines -match 'TRIM \[dry-run\]').Count -eq 1))
    $DryRun = $false; Reset
    Invoke-LogTrim @($big, $jl, $small, "$T/logs/missing.log")
    $b = @(Get-Content $big)
    Check 'big.log kept its last 2000 lines' ($b.Count -eq 2000 -and $b[0] -match 'line 28001 ' -and $b[-1] -match 'line 30000 ')
    Check 'big.log same inode (live O_APPEND writers keep writing to it)' ((& /usr/bin/stat -f %i $big) -eq $inode)
    $j = @(Get-Content $jl)
    Check 'jsonl: 2000 lines, each still valid JSON, unicode intact' ($j.Count -eq 2000 -and (($j | ForEach-Object { try { $null = $_ | ConvertFrom-Json; 1 } catch { 0 } } | Measure-Object -Sum).Sum -eq 2000) -and $j[-1] -match 'é')
    Check 'small.log (under 2 MB) unchanged' ((Get-FileHash $small).Hash -eq $smallBefore.Hash)
    Check 'two TRIM lines, no failures' ((@($LogLines -match '^TRIM .* : kept the last 2000 lines$').Count -eq 2) -and -not ($LogLines -match 'FAILED'))
    $tl = $ast.EndBlock.Statements | Where-Object { $_.Extent.Text -like '$TrimLogs = @(*' } | Select-Object -First 1
    . ([scriptblock]::Create($tl.Extent.Text))
    Check "call-site list: 9 paths, all built from `$U/`$LogDir/`$DevRoot" ($TrimLogs.Count -eq 9 -and -not ($TrimLogs | Where-Object { -not $_.StartsWith($U) }))
    Check 'call-site list never trims permission-gate/shadow.jsonl (Jev review evidence)' (-not ($TrimLogs | Where-Object { $_.EndsWith('shadow.jsonl') }))
    foreach ($n in 'daily-backup.log', 'daily-backup.out', 'Library/Logs/everythingd.log', 'scripts/flush.log',
                   'scripts/compile.log', 'scripts/adjudicate.log', 'outputs/morning/cadence.log', 'skill-router/skill_router.log', '.claude/skill_router.log') {
        Check "call-site list has $n" (@($TrimLogs | Where-Object { $_.EndsWith($n) }).Count -ge 1)
    }

    # ---- R22 60-day prune ----
    "--- R22 60-day prune"
    $inv = "$DevRoot/KeystoneOS/outputs/inventory"; $jobs = "$DevRoot/KeystoneOS/outputs/jobs"
    New-Item -ItemType Directory -Force -Path "$inv/sub", $jobs | Out-Null
    'o' | Set-Content "$inv/2026-07-01-workspace.json"; 'n' | Set-Content "$inv/2026-08-30-workspace.json"; 'o' | Set-Content "$inv/sub/2026-07-01-nested.json"
    'o' | Set-Content "$jobs/morning-cadence-2026-07-01.out.log"; 'r' | Set-Content "$inv/README.md"
    foreach ($f in "$inv/2026-07-01-workspace.json", "$inv/sub/2026-07-01-nested.json", "$jobs/morning-cadence-2026-07-01.out.log", "$inv/README.md") { (Get-Item $f).LastWriteTime = (Get-Date).AddDays(-70) }
    (Get-Item "$inv/2026-08-30-workspace.json").LastWriteTime = (Get-Date).AddDays(-59)
    $DryRun = $true; Reset
    Remove-OldFiles @($inv, $jobs) 60
    Check 'dry run: nothing deleted, 2 lines logged' ((Test-Path "$inv/2026-07-01-workspace.json") -and (Test-Path "$jobs/morning-cadence-2026-07-01.out.log") -and @($LogLines -match 'PRUNE \[dry-run\]').Count -eq 2)
    $DryRun = $false; Reset
    $ro = $ast.EndBlock.Statements | Where-Object { $_.Extent.Text -like 'Remove-OldFiles @(*' } | Select-Object -First 1
    . ([scriptblock]::Create($ro.Extent.Text))
    Check 'call site: old dated files deleted in both folders' (-not (Test-Path "$inv/2026-07-01-workspace.json") -and -not (Test-Path "$jobs/morning-cadence-2026-07-01.out.log"))
    Check '59-day file kept' (Test-Path "$inv/2026-08-30-workspace.json")
    Check 'old undated file (README.md) kept' (Test-Path "$inv/README.md")
    Check 'files in subfolders kept (top level only)' (Test-Path "$inv/sub/2026-07-01-nested.json")
    Check 'one PRUNE line per folder' (@($LogLines -match '^PRUNE .* : deleted 1 file\(s\) older than 60 days$').Count -eq 2)
}
finally {
    Remove-Item -LiteralPath $T -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item Env:FAKE_DIR, Env:FAKE_OUT, Env:FAKE_MS_MODE, Env:FAKE_UV_MODE -ErrorAction SilentlyContinue
}
""
if ($script:fails -eq 0) { "ALL PASS" } else { "$($script:fails) FAILED" }
exit $script:fails
