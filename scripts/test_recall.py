"""Checks recall.py's ladder on a temp tree: keywords, BM25 rank, index refresh, paragraph pick, pointer gate.
Run: python3 -I ~/.claude/scripts/test_recall.py  (reads nothing outside the temp tree)
"""
import importlib.util
import os
import tempfile

spec = importlib.util.spec_from_file_location(
    "recall", os.path.join(os.path.dirname(os.path.abspath(__file__)), "recall.py"))
r = importlib.util.module_from_spec(spec)
spec.loader.exec_module(r)


def write(root, rel, text):
    p = os.path.join(root, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w") as fh:
        fh.write(text)
    return p


# Keywords: filler dropped, suffixes meet their stems.
assert r.keywords("Why did the scanned pages fail, and how was it fixed?") == ["scan", "page", "fail", "fix"]

with tempfile.TemporaryDirectory() as root:
    filler = "\n\n".join(f"Filler paragraph {i} about unrelated weather and lunch." for i in range(120))
    write(root, "mem/project_push.md",
          "---\ndescription: \"cloud push note\"\n---\n\nIntro line.\n\n"
          "**Cause.** launchd cannot open Drive files that Terminal made.\n\n"
          + filler + "\n\n**Fix.** run the push inside Terminal.\n")
    write(root, "mem/project_decoy.md", "Drive backup timing and schedule.\n")
    db = r.open_index([os.path.join(root, "mem")], ":memory:")

    # Ranking: BM25 puts the file about the question ahead of the decoy.
    top = r.fts5_top(db, "why does the launchd push to Drive fail", 2)
    assert top[0].endswith("project_push.md"), top

    # Index refresh: a changed file is re-read, a deleted one drops out.
    disk = os.path.join(root, "disk.sqlite")
    r.open_index([os.path.join(root, "mem")], disk).close()
    os.remove(os.path.join(root, "mem/project_decoy.md"))
    db2 = r.open_index([os.path.join(root, "mem")], disk)
    assert not any(p.endswith("project_decoy.md") for p in r.fts5_top(db2, "backup schedule", 5))

    # Big file: only matching paragraphs come back, in document order, Cause before Fix.
    kws = r.keywords("launchd Drive cause and Terminal fix")
    chosen = r.best_paragraphs(os.path.join(root, "mem/project_push.md"), kws, r.idf_of(db, kws))
    texts = [c[4] for c in chosen]
    assert any("Cause" in t for t in texts) and any("Fix" in t for t in texts), texts
    assert texts.index(next(t for t in texts if "Cause" in t)) < texts.index(next(t for t in texts if "Fix" in t))
    assert not any("Filler" in t for t in texts)

    # Small file: returned whole.
    small = write(root, "mem/project_small.md", "One.\n\nTwo about tesseract.\n\nThree.\n")
    assert len(r.best_paragraphs(small, ["tesseract"], {})) == 3

    # Pointer gate: the target sits outside the index, so only the hop can reach it.
    target = write(root, "elsewhere/project_target.md", "Tesseract confuses the numbers five and nine.\n")
    write(root, "idx/project_src.md", f"Tesseract digits see `{target}`.\n")
    sdb = r.open_index([os.path.join(root, "idx")], ":memory:")
    _, _, ev = r.gather("tesseract digits", sdb)
    assert len(ev) == 1, ev  # closed: the file already covers the keywords
    _, _, ev = r.gather("tesseract confuses which numbers five nine", sdb)
    assert len(ev) == 2 and ev[1][0] == target, ev  # open: one hop

    # Tier A first: a memory file at #2 or #3 jumps a compiled article; the MEMORY.md index never does.
    kdir = os.path.join(root, "knowledge")
    mdir = os.path.join(root, ".claude/projects/-x/memory")
    write(kdir, "push-fix.md", "Drive push fix: grant Full Disk Access. Drive push fix. Drive push fix.\n")
    write(mdir, "project_push-fix.md", "Drive push fix: run it from Terminal.\n")
    write(mdir, "MEMORY.md", "- Drive push fix Drive push fix Drive push fix Drive push fix\n")
    tdb = r.open_index([kdir, mdir], ":memory:")
    assert not r.fts5_top(tdb, "drive push fix", 3)[0].endswith("project_push-fix.md")  # BM25 alone loses
    assert r.rank(tdb, "drive push fix", 3)[0].endswith("project_push-fix.md")
    assert r.rank(tdb, "drive push fix", 1) == [r.rank(tdb, "drive push fix", 3)[0]]
    # Name guard: a memory about something else stays below the article named for the question.
    write(kdir, "sleep-scheduler-project.md", "Sleep scheduler project. Sleep scheduler project.\n")
    write(mdir, "project_backup-sleepkill.md", "Backup task: sleep kill signature, scheduler project.\n")
    gdb = r.open_index([kdir, mdir], ":memory:")
    assert r.rank(gdb, "sleep scheduler project", 3)[0].endswith("sleep-scheduler-project.md")

    # Two machine slugs, same memory: only the newer copy is listed.
    wdir = os.path.join(root, ".claude/projects/-win/memory")
    newer = write(wdir, "project_push-fix.md", "Drive push fix: run it from Terminal (newer).\n")
    os.utime(newer, (2e9, 2e9))
    cdb = r.open_index([kdir, mdir, wdir], ":memory:")
    got = r.rank(cdb, "drive push fix", 3)
    assert got[0] == newer and sum(p.endswith("project_push-fix.md") for p in got) == 1, got

    # A memory whose name misses but whose description fits still jumps (bench Q3).
    write(kdir, "drive-hash-dedupe.md", "Copy file Drive mount folder skip. " * 3 + "\n")
    write(mdir, "project_fuse-hang.md",
          '---\ndescription: "Drive mount reads hang; copy a file with the API; every walk skips one folder"\n---\n'
          "Copy file Drive mount folder skip.\n")
    qdb = r.open_index([kdir, mdir], ":memory:")
    q3 = "how to copy a file off the Drive mount and which folder to skip"
    assert not r.fts5_top(qdb, q3, 3)[0].endswith("project_fuse-hang.md")
    assert r.rank(qdb, q3, 3)[0].endswith("project_fuse-hang.md")

    # Refresh writes each file once, even when it re-reads it.
    os.utime(os.path.join(kdir, "push-fix.md"))
    r.open_index([kdir, mdir], disk).close()
    ddb = r.open_index([kdir, mdir], disk)
    assert ddb.execute("SELECT count(*) - count(DISTINCT path) FROM d").fetchone()[0] == 0

print("test_recall: all checks passed")
