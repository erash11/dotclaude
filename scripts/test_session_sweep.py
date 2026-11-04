"""Checks session-sweep.py's transcript check on a throwaway repo. Run: python3 ~/.claude/scripts/test_session_sweep.py"""
import importlib.util
import os
import subprocess
import tempfile

spec = importlib.util.spec_from_file_location(
    "sweep", os.path.join(os.path.dirname(os.path.abspath(__file__)), "session-sweep.py"))
s = importlib.util.module_from_spec(spec)
spec.loader.exec_module(s)


def sh(cwd, *args):
    subprocess.run(args, cwd=cwd, check=True, capture_output=True)


tmp = tempfile.mkdtemp()
origin, root = os.path.join(tmp, "origin.git"), os.path.join(tmp, "dotclaude")
sh(tmp, "git", "init", "-q", "--bare", "-b", "main", origin)
sh(tmp, "git", "clone", "-q", origin, root)
for k, v in (("user.name", "t"), ("user.email", "t@t"), ("commit.gpgsign", "false")):
    sh(root, "git", "config", k, v)
proj = os.path.join(root, "projects", "-Users-x-DEV")
os.makedirs(os.path.join(proj, "abcd1234-full", "subagents"))
jsonl = os.path.join(proj, "abcd1234-full.jsonl")
sub = os.path.join(proj, "abcd1234-full", "subagents", "agent-1.jsonl")
open(jsonl, "w").write("{}\n")
sh(root, "git", "add", jsonl)
sh(root, "git", "commit", "-q", "-m", "first")
sh(root, "git", "push", "-q", "-u", "origin", "main")
u = s.transcript_unsaved

assert u("abcd1234", root) == "", u("abcd1234", root)
assert u("ffff0000", root) == "no transcript found"
open(sub, "w").write("{}\n")  # untracked subagent file blocks deletion
assert u("abcd1234", root) == "transcript has uncommitted changes", u("abcd1234", root)
sh(root, "git", "add", "-A")
sh(root, "git", "commit", "-q", "-m", "sub")
assert u("abcd1234", root) == "transcript commit not pushed", u("abcd1234", root)
sh(root, "git", "push", "-q")
assert u("abcd1234", root) == ""
open(jsonl, "a").write("{}\n")  # session kept writing after the commit
assert u("abcd1234", root) == "transcript has uncommitted changes"
os.makedirs(os.path.join(proj, "new"), exist_ok=True)
open(os.path.join(proj, "beef5678-full.jsonl"), "w").write("{}\n")
assert u("beef5678", root) == "transcript not committed"
sh(root, "git", "checkout", "-q", jsonl)
sh(root, "git", "branch", "--unset-upstream")
assert u("abcd1234", root) == "~/.claude has no upstream"
print("test_session_sweep: all checks passed")

# --delete: rm each SAFE id, skip one that went active, report failures
class R:
    def __init__(self, code, out=""):
        self.returncode, self.stdout, self.stderr = code, out, ""
calls = []
def fake_run(cmd, **kw):
    calls.append(cmd)
    if cmd[2] == "gone":
        raise FileNotFoundError("claude not found")
    return R(1, "has unpushed work") if cmd[2] == "bad" else R(0)
rows = [("2026-11-01", "good", "a", []), ("2026-11-02", "bad", "b", []),
        ("2026-11-03", "busy", "c", []), ("2026-11-04", "gone", "d", [])]
out = s.delete_safe(rows, run=fake_run, idle=lambda d: d != "busy")
assert calls == [["claude", "rm", "good"], ["claude", "rm", "bad"], ["claude", "rm", "gone"]], calls
assert out == (["good"], ["bad", "gone"], ["busy"]), out
jobs = os.path.join(tmp, "jobs")
os.makedirs(os.path.join(jobs, "w"))
open(os.path.join(jobs, "w", "state.json"), "w").write('{"state": "working"}')
assert s.still_idle("w", jobs) is False
assert s.still_idle("missing", jobs) is False
for bad in ("null", "[]", "{}", '{"state": 3}', "not json"):
    open(os.path.join(jobs, "w", "state.json"), "w").write(bad)
    assert s.still_idle("w", jobs) is False, bad
open(os.path.join(jobs, "w", "state.json"), "w").write('{"state": "done"}')
assert s.still_idle("w", jobs) is True
print("test_session_sweep: delete checks passed")
