"""Checks where-was-i.py --sweep flags on throwaway repos. Run: python3 ~/.claude/scripts/test_where_was_i_sweep.py"""
import importlib.util
import os
import subprocess
import tempfile

spec = importlib.util.spec_from_file_location(
    "wwi", os.path.join(os.path.dirname(os.path.abspath(__file__)), "where-was-i.py"))
w = importlib.util.module_from_spec(spec)
spec.loader.exec_module(w)

os.environ.update(GIT_AUTHOR_NAME="t", GIT_AUTHOR_EMAIL="t@t", GIT_COMMITTER_NAME="t", GIT_COMMITTER_EMAIL="t@t")


def sh(cwd, *args):
    subprocess.run(["git", "-C", cwd, *args], check=True, capture_output=True)


def write(path, text="x"):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w").write(text)


with tempfile.TemporaryDirectory() as tmp:
    tmp = os.path.realpath(tmp)
    remote, repo = os.path.join(tmp, "remote.git"), os.path.join(tmp, "repo")
    subprocess.run(["git", "init", "-q", "--bare", "-b", "main", remote], check=True)
    subprocess.run(["git", "clone", "-q", remote, repo], check=True, capture_output=True)
    write(os.path.join(repo, "a.txt")); sh(repo, "add", "."); sh(repo, "commit", "-qm", "a"); sh(repo, "push", "-q", "-u", "origin", "HEAD")
    assert w.sweep_repo(repo) == ([], []), w.sweep_repo(repo)

    write(os.path.join(repo, "a.txt"), "changed")
    assert w.sweep_repo(repo)[0] == ["DIRTY"]
    sh(repo, "stash", "-q")
    assert w.sweep_repo(repo) == ([], ["STASH:1"])
    sh(repo, "stash", "drop", "-q")

    write(os.path.join(repo, "b.txt")); sh(repo, "add", "."); sh(repo, "commit", "-qm", "b")
    assert w.sweep_repo(repo)[0] == ["UNPUSHED"]
    sh(repo, "push", "-q")

    sh(repo, "branch", "merged")  # no upstream, already in HEAD: a post-merge leftover, not work
    sh(repo, "checkout", "-qb", "feature"); write(os.path.join(repo, "c.txt")); sh(repo, "add", "."); sh(repo, "commit", "-qm", "c")
    sh(repo, "checkout", "-q", "main")
    assert w.sweep_repo(repo)[0] == ["BRANCH-UNPUSHED:feature"], w.sweep_repo(repo)
    sh(repo, "push", "-q", "-u", "origin", "feature")
    sh(repo, "checkout", "-q", "feature"); write(os.path.join(repo, "d.txt")); sh(repo, "add", "."); sh(repo, "commit", "-qm", "d")
    sh(repo, "checkout", "-q", "main")
    assert w.sweep_repo(repo)[0] == ["BRANCH-AHEAD:feature"]
    sh(repo, "push", "-q", "origin", "feature")

    wt = os.path.join(tmp, "wt"); sh(repo, "worktree", "add", "-q", wt, "feature")
    assert w.sweep_repo(repo) == ([], [])
    write(os.path.join(wt, "e.txt"))
    assert w.sweep_repo(repo)[0] == ["WORKTREE-DIRTY:../wt"], w.sweep_repo(repo)

    sh(repo, "checkout", "-q", "--detach")
    assert "DETACHED" in w.sweep_repo(repo)[1]

    local = os.path.join(tmp, "local"); subprocess.run(["git", "init", "-q", local], check=True)
    write(os.path.join(local, "f.txt")); sh(local, "add", "."); sh(local, "commit", "-qm", "f")
    assert w.sweep_repo(local) == ([], ["NO-REMOTE"]), w.sweep_repo(local)

    broken = os.path.join(local, "child"); os.makedirs(os.path.join(broken, ".git", "objects"))
    assert w.sweep_repo(broken) == (["NOT-A-REPO"], [])

    w.LIVE[local] = ("transcripts/",)  # hook-written files alone are LIVE, anything else is DIRTY
    write(os.path.join(local, "transcripts", "today.md")); sh(local, "add", "."); sh(local, "commit", "-qm", "t")
    write(os.path.join(local, "transcripts", "today.md"), "turn 2")
    assert w.sweep_repo(local) == ([], ["NO-REMOTE", "LIVE"]) or w.sweep_repo(local) == ([], ["LIVE", "NO-REMOTE"]), w.sweep_repo(local)
    write(os.path.join(local, "notes.md"), "real work")
    assert "DIRTY" in w.sweep_repo(local)[0]

print("test_where_was_i_sweep: all checks passed")
