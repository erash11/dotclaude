"""Checks recall.py's ladder on a temp tree: keywords, BM25 rank, index refresh, paragraph pick, pointer gate.
Run: python3 -I ~/.claude/scripts/test_recall.py  (reads nothing outside the temp tree)
"""
import importlib.util
import json
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
    assert texts[0] == "Intro line."  # the short opening paragraph always comes along (bench Q11: the URL)

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
    write(kdir, "drive-hash-dedupe.md", "Copy file Drive mount folder skip. " * 6 + "\n")
    write(mdir, "project_fuse-hang.md",
          '---\ndescription: "Drive mount reads hang; copy a file with the API; every walk skips one folder"\n---\n'
          "Copy file Drive mount folder skip.\n")
    qdb = r.open_index([kdir, mdir], ":memory:")
    q3 = "how to copy a file off the Drive mount and which folder to skip"
    assert not r.fts5_top(qdb, q3, 3)[0].endswith("project_fuse-hang.md")
    assert r.rank(qdb, q3, 3)[0].endswith("project_fuse-hang.md")

    # A handoff and its .windows.md twin take one slot, so a memory at #4 gets back into the top 3.
    k2, h2 = os.path.join(root, "k2"), os.path.join(root, "h2")
    m2 = os.path.join(root, ".claude/projects/-y/memory")
    write(k2, "push-fix.md", "Drive push fix. Drive push fix. Drive push fix.\n")
    write(h2, "push.md", "Drive push fix. Drive push fix. Drive push fix. Drive push fix.\n")
    twin = write(h2, "push.windows.md", "Drive push fix. Drive push fix. Drive push fix. Drive push fix.\n")
    write(m2, "project_push-fix.md", "Drive push fix: run it from Terminal.\n")
    hdb = r.open_index([k2, h2, m2], ":memory:")
    assert r.fts5_top(hdb, "drive push fix", 4)[3].endswith("project_push-fix.md")  # BM25 alone: #4
    got = r.rank(hdb, "drive push fix", 3)
    assert twin not in got and got[0].endswith("project_push-fix.md"), got

    # Refresh writes each file once, even when it re-reads it.
    os.utime(os.path.join(kdir, "push-fix.md"))
    r.open_index([kdir, mdir], disk).close()
    ddb = r.open_index([kdir, mdir], disk)
    assert ddb.execute("SELECT count(*) - count(DISTINCT path) FROM d").fetchone()[0] == 0

    # An index from before the name column is rebuilt, not crashed on.
    import sqlite3
    old = os.path.join(root, "old.sqlite")
    odb = sqlite3.connect(old)
    odb.execute("CREATE VIRTUAL TABLE d USING fts5(path UNINDEXED, body, tokenize='porter unicode61')")
    odb.execute("CREATE TABLE seen(path TEXT PRIMARY KEY, mtime REAL)")
    odb.execute("INSERT INTO seen VALUES (?, ?)", (os.path.join(kdir, "push-fix.md"), 0))
    odb.commit(); odb.close()
    ndb = r.open_index([kdir, mdir], old)
    assert "name" in [c[1] for c in ndb.execute("PRAGMA table_info(d)")]
    assert r.rank(ndb, "drive push fix", 3)[0].endswith("project_push-fix.md")

    # Two memories in the top 3: the one that is about the question wins, even from #2.
    m3 = os.path.join(root, ".claude/projects/-z/memory")
    write(m3, "project_memsearch-setup.md", '---\ndescription: "old setup notes"\n---\n'
          + "Memsearch hook timeout. " * 8 + "\n")
    write(m3, "project_hook-timeout-cap.md", '---\ndescription: "hook timeout cap fix"\n---\nHook timeout cap.\n')
    pdb = r.open_index([m3], ":memory:")
    q4 = "fix for memsearch hook timeout"
    assert r.fts5_top(pdb, q4, 2)[0].endswith("project_memsearch-setup.md")  # BM25 alone
    assert r.rank(pdb, q4, 2)[0].endswith("project_hook-timeout-cap.md")

    # An opened file that holds under half the question words says so and names memsearch.
    import contextlib, io
    def ask(question, rts, *flags):
        buf = io.StringIO()
        old_open, r.open_index = r.open_index, lambda _rts: old_open(rts, ":memory:")
        old_ms, r.memsearch_hits = r.memsearch_hits, lambda q: "MEMSEARCH-STUB"
        try:
            with contextlib.redirect_stdout(buf):
                r.main([question, *flags])
        finally:
            r.open_index, r.memsearch_hits = old_open, old_ms
        return buf.getvalue()
    weak = ask("drive zebra quartz walrus", [kdir, mdir])  # 1 of 4 words
    assert "WEAK MATCH" in weak and "MEMSEARCH-STUB" in weak  # runs memsearch by itself
    strong = ask("drive push fix", [kdir, mdir])
    assert "WEAK MATCH" not in strong and "MEMSEARCH-STUB" not in strong
    assert "MEMSEARCH-STUB" not in ask("drive zebra quartz walrus", [kdir, mdir], "--quick")
    assert "MEMSEARCH-STUB" in ask("drive push fix", [kdir, mdir], "--deep")
    assert "MEMSEARCH-STUB" in ask("zebra quartz walrus", [kdir, mdir])  # no match at all

    # A failed memsearch (exit 0, empty stdout) must say it did not run, not print an empty section.
    import subprocess
    old_run = r.subprocess.run
    try:
        lock = "milvus_lite.exceptions.DataDirLockedError: another process holds the lock on 'milvus.db'"
        r.subprocess.run = lambda *a, **k: subprocess.CompletedProcess(a, 0, "", lock)
        assert "DID NOT RUN" in r.memsearch_hits("q") and "lock" in r.memsearch_hits("q")
        r.subprocess.run = lambda *a, **k: subprocess.CompletedProcess(a, 0, "", "boom\nValueError: bad")
        assert r.memsearch_hits("q") == "memsearch DID NOT RUN: ValueError: bad"
        r.subprocess.run = lambda *a, **k: subprocess.CompletedProcess(a, 0, "hit 1\n", "")
        assert r.memsearch_hits("q") == "hit 1\n"  # not JSON: memsearch's own text passes through

        # Memory files first: one chunk per file, Mac copy over its Windows twin, _archive not promoted.
        P = "/Users/x/.claude/projects/"
        def hit(src, h): return {"source": src, "chunk_hash": h, "content": "c" + h, "start_line": "1", "end_line": "2"}
        hits = [hit("/Users/x/.claude/global-memory/handoffs/a.md", "1"),
                hit("/Users/x/.claude/global-memory/handoffs/a.md", "2"),
                hit(P + "C--Users-eric-rash-Desktop-DEV/memory/project_x.md", "3"),
                hit(P + "-Users-x/memory/_archive/project_old.md", "4"),
                hit("/Users/x/SecondBrain/Notes/n.md", "5"),
                hit(P + "-Users-x-DEV/memory/project_x.md", "6"),
                hit(P + "C--Users-eric-rash/memory/project_only_win.md", "7")]
        assert [h["chunk_hash"] for h in r.memory_first(hits)] == ["6", "7", "1", "4", "5"]
        r.subprocess.run = lambda *a, **k: subprocess.CompletedProcess(a, 0, json.dumps(hits), "")
        out = r.memsearch_hits("q")
        assert out.index("project_x.md") < out.index("handoffs/a.md") and "C--Users-eric-rash-Desktop-DEV" not in out
        r.subprocess.run = lambda *a, **k: subprocess.CompletedProcess(a, 0, "[]", "")
        assert r.memsearch_hits("q") == "memsearch: no hits.\n"
    finally:
        r.subprocess.run = old_run

print("test_recall: all checks passed")
