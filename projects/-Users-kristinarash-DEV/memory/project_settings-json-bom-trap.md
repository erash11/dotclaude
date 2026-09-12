---
name: settings-json-bom-trap
description: "A bad Windows write to ~/.claude config files does TWO things at once — adds a UTF-8 BOM (dcg then reports the hook as missing) and CP1252-double-encodes every non-ASCII character (statusline bars turn to junk). Check settings.json, CLAUDE.md and AGENTS.md, and check for both faults."
metadata: 
  node_type: memory
  type: project
  originSessionId: 7741462f-dac7-4551-8692-76574bbfd202
  modified: 2026-09-12T03:37:42.609Z
---

One bad write from the Windows machine damages `~/.claude` config files in
**two independent ways**. They arrive together and are fixed together, but they
surface at completely different times, so finding one does not mean you found
both. On 2026-09-10 only the BOM was caught; the mojibake sat undetected for two
more days until the statusline was looked at directly on 2026-09-11.

## Fault 1 — the UTF-8 BOM (loud, misleading)

`~/.claude/settings.json` acquires a **UTF-8 BOM** — the 3 invisible bytes
`EF BB BF` at the start. Claude Code parses the file anyway, so nothing in
Claude Code looks broken. `dcg` (Destructive Command Guard) does not, so it
prints at every session start:

```
[dcg] Hook missing from ~/.claude/settings.json — run: dcg install
```

**The message is wrong, and its suggested fix is the wrong fix.** The hook was
present and correct all along. Running `dcg install` would have added a second
hook to a file the tool cannot read.

**Diagnose, don't trust the banner.** `dcg doctor` names the real fault:

```
Checking hook wiring... ERROR
  Invalid JSON: expected value at line 1 column 1
```

"Line 1 column 1" on a file that is visibly valid JSON means a BOM.

## Fault 2 — CP1252 double-encoding (silent, cosmetic-looking)

The same write reads the file's UTF-8 bytes as **CP1252**, then saves them back
as UTF-8. Every non-ASCII character becomes 2–3 junk characters. Nothing errors.
Nothing warns. JSON stays valid. You only notice by *looking at rendered output*.

The statusline is where it shows, because it is the only config that draws
box characters:

| Intended | Becomes | Where |
|---|---|---|
| `░` U+2591 | `â–‘` | statusline meter bar (empty) |
| `▓` U+2593 | `â–“` | statusline meter bar (filled) |
| `↑ ↓ →` | `â†‘ â†“ â†’` | git ahead/behind, cache arrow |
| `—` em-dash | `â€”` | CLAUDE.md, AGENTS.md prose |
| `…` `’` `·` | `â€¦` `â€™` `Â·` | CLAUDE.md, AGENTS.md prose |

The `â` prefix is the tell — it is `0xE2`, the first byte of most UTF-8 symbols,
read as Latin-1.

## It is not only settings.json

The 2026-09-11 sweep found the damage in **three** files. Two of them also
carried BOMs that the 9/10 fix never looked at:

- `~/.claude/settings.json` — 113 mangled chars (no BOM by then, already fixed)
- `~/.claude/CLAUDE.md` — 8 mangled chars **+ BOM**
- `~/.claude/AGENTS.md` — 25 mangled chars **+ BOM**

Always sweep the whole tree, never just the file that complained.

## Fix — strip BOM, then reverse the encoding, then verify rendering

```python
import json
p = "/Users/kristinarash/.claude/settings.json"
s = open(p, encoding="utf-8").read().lstrip("﻿")
fixed = s.encode("cp1252").decode("utf-8")   # exact inverse
json.loads(fixed)                             # must still parse
open(p, "w", encoding="utf-8", newline="\n").write(fixed)
```

`.encode("cp1252")` raising means the file is only *partly* mangled, or a BOM is
still present — strip the BOM first, and never force the round-trip on a file
where it fails. Sweep for survivors by scanning for these patterns:

```python
pats = ['â–‘','â–“','â†‘','â†“','â†’','â€”','â€™','â€¦','Â·']
```

**Verify the statusline by rendering it**, not by reading the JSON — pipe a
sample payload into the `statusLine.command` and look at the bars.

Writing the repaired file needs the Write tool, not a shell heredoc: `dcg`
blocks any truncating `>` redirect into `~` (`core.filesystem:redirect-truncate-root-home`).

## The generalisation

Two tolerant readers hid this for two days. Claude Code tolerates the BOM, so
the statusline kept running; the terminal tolerates mojibake, so it kept drawing
*something*. **The strict reader complains about the wrong thing (`dcg`), and the
cosmetic damage never complains at all.** When a config file has been touched by
the other machine, check the first bytes *and* grep for `â` — one fault does not
imply the other has been handled.

Related: [[dcg-guard-blocks]], [[hook-two-copies-trap]], [[github-consolidation]],
[[path-shadowing-and-cleanup]]
