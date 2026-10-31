"""Asserts for claude-files-digest.py parsing helpers. Run: python3 test_claude_files_digest.py"""
import datetime as dt
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location("fd", Path(__file__).with_name("claude-files-digest.py"))
fd = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fd)

# GitHub remote forms
assert fd.github_base("git@github.com:erash11/CFB_Victory_Model.git\n") == "https://github.com/erash11/CFB_Victory_Model"
assert fd.github_base("https://github.com/erash11/AppliedPerformance-Site") == "https://github.com/erash11/AppliedPerformance-Site"
assert fd.github_base("https://gitlab.com/x/y.git") is None
assert fd.github_base("") is None

# git log parsing: only Claude co-authored commits, SKIP applied, first commit wins per path
log = ("\x1eabc\x1fAdd audit\x1fClaude Opus <noreply@anthropic.com>\n\ndocs/AUDIT.md\ndata/roster_2026.csv\n"
       "\x1edef\x1fHuman commit\x1f\n\nnotes.md\n"
       "\x1eghi\x1fAgain\x1fClaude <x>\n\ndocs/AUDIT.md\nrun.py\n")
assert fd.parse_log(log) == [("docs/AUDIT.md", "abc", "Add audit"), ("run.py", "ghi", "Again")], fd.parse_log(log)

# doc rule and empty-day log matching
assert fd.is_doc("x/REPORT.MD") and not fd.is_doc("a.csv") and not fd.is_doc("codex-review.txt")
subject, body = fd.build(dt.date(2026, 10, 30), {}, None, {})
assert "Drive lookup failed" in body

print("ok")
