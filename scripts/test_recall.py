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

print("test_recall: all checks passed")
