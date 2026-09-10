---
name: settings-json-bom-trap
description: "A UTF-8 BOM in ~/.claude/settings.json makes dcg report the hook as missing — the fix is stripping the BOM, never `dcg install`"
metadata:
  node_type: memory
  type: project
---

`~/.claude/settings.json` acquired a **UTF-8 BOM** — the 3 invisible bytes
`EF BB BF` at the start of the file. Claude Code parses the file anyway, so
nothing in Claude Code looked broken. `dcg` (Destructive Command Guard) does
not, so it printed at every session start:

```
[dcg] Hook missing from ~/.claude/settings.json — run: dcg install
```

**The message is wrong, and its suggested fix is the wrong fix.** The hook was
present and correct all along, at line 318. Running `dcg install` would have
added a second hook to a file the tool cannot read.

**Diagnose, don't trust the banner.** `dcg doctor` names the real fault:

```
Checking Claude Code settings... OK
Checking hook wiring... ERROR
  Invalid JSON: expected value at line 1 column 1
```

"Line 1 column 1" on a file that is visibly valid JSON means a BOM. Confirm it:

```bash
python3 -c "import json;json.load(open('/Users/kristinarash/.claude/settings.json'))"
# JSONDecodeError: Unexpected UTF-8 BOM (decode using utf-8-sig)
```

**Fix** — back up, strip 3 bytes, re-run `dcg doctor` (fixed 2026-09-10):

```python
p = "/Users/kristinarash/.claude/settings.json"
b = open(p, "rb").read()
if b.startswith(b"\xef\xbb\xbf"):
    open(p, "wb").write(b[3:])
```

**The generalisation.** A BOM is already a known trap on this machine's data
files (the PFF season CSVs need `encoding='utf-8-sig'`). This is the same trap
on a *config* file, and it is nastier there: the tolerant reader is the one you
look at, and the strict reader is the one that complains — about the wrong
thing. Whenever a tool claims a config entry is missing and you can see the
entry, check the file's first bytes before editing anything.

Related: [[dcg-guard-blocks]], [[hook-two-copies-trap]], [[path-shadowing-and-cleanup]]
