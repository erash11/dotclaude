"""Checks remember.py on a temp memory folder: save, refuse, update, look-alike guard, bad input.
Run: python3 -I ~/.claude/scripts/test_remember.py  (writes only inside a temp folder)
"""
import contextlib
import importlib.util
import io
import os
import tempfile

spec = importlib.util.spec_from_file_location(
    "remember", os.path.join(os.path.dirname(os.path.abspath(__file__)), "remember.py"))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


def run(*args):
    out = io.StringIO()
    with contextlib.redirect_stdout(out):
        code = m.main(list(args))
    return code, out.getvalue()


# Slug rule from the skill.
assert m.slug_dir("/Users/kristinarash/DEV").endswith("/.claude/projects/-Users-kristinarash-DEV/memory")
assert m.slug_dir("/Users/kristinarash/DEV/CLI_Dev").endswith("/-Users-kristinarash-DEV-CLI_Dev/memory")  # Mac keeps '_'
assert m.slug_dir("/Users/kristinarash/.claude/skills").endswith("/-Users-kristinarash--claude-skills/memory")

with tempfile.TemporaryDirectory() as d:
    base = ["--dir", d, "--type", "project", "--desc", 'Drive "push" fix', "--hook", "cloud-push fails"]

    # Save: file with frontmatter, Why/How, one index line.
    code, out = run(*base, "--name", "push-fix", "--why", "launchd lacks access", "--how", "run in Terminal",
                    "Run cloud-push from Terminal.")
    assert code == 0 and "PASS" in out, out
    text = open(os.path.join(d, "project_push-fix.md")).read()
    assert text.startswith("---\nname: push-fix\ndescription: \"Drive 'push' fix\"\nmetadata:\n  type: project\n---\n")
    assert "**Why:** launchd lacks access" in text and "**How to apply:** run in Terminal" in text
    idx = open(os.path.join(d, "MEMORY.md")).read()
    assert idx.count("](project_push-fix.md)") == 1 and "- [Push fix](project_push-fix.md) — cloud-push fails" in idx

    # Same name again: refused, file untouched.
    code, out = run(*base, "--name", "push-fix", "Something else.")
    assert code == 2 and "REFUSED" in out and "Terminal" in open(os.path.join(d, "project_push-fix.md")).read()

    # Update: body replaced, still one index line.
    code, out = run(*base, "--name", "push-fix", "--update", "--hook", "push to Drive fails", "Run it via cloud-push-launch.sh.")
    assert code == 0, out
    assert "cloud-push-launch.sh" in open(os.path.join(d, "project_push-fix.md")).read()
    idx = open(os.path.join(d, "MEMORY.md")).read()
    assert idx.count("](project_push-fix.md)") == 1 and "push to Drive fails" in idx

    # Look-alike name: refused unless --force.
    code, out = run(*base, "--name", "push-fix-drive", "A near twin.")
    assert code == 2 and "project_push-fix.md" in out, out
    code, out = run(*base, "--name", "push-fix-drive", "--force", "A near twin.")
    assert code == 0, out

    # Bad input: not a slug, type repeated in the name, two-line hook, empty fact.
    assert run(*base, "--name", "Push_Fix", "x")[0] == 1
    assert run(*base, "--name", "project-thing", "x")[0] == 1
    assert run("--dir", d, "--type", "user", "--name", "a-b", "--desc", "d", "--hook", "a\nb", "x")[0] == 1
    assert run(*base, "--name", "empty-one", "   ")[0] == 1

print("test_remember: all checks passed")
