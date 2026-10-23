"""Remember: file one Tier A memory in plain code, no model call.

The writer (Eric, or an agent following the memory-write skill) supplies the words;
this does the filing the skill asks for: name rule, duplicate check, frontmatter,
the MEMORY.md index line, read-back check, and a recall.py index refresh.
Tier A only. Tier B (global-memory MEMORY.md / USER.md) has caps that need judgement.

Usage:
    python3 ~/.claude/scripts/remember.py --type project --name cloud-push-launchd-blocked \\
        --desc "one line: what the fact is" --hook "when to open it" \\
        --why "reason" --how "what to do" "The fact itself."
    echo "body" | python3 ~/.claude/scripts/remember.py ... -      # body from stdin
    ... --update      # replace an existing memory of the same name
    ... --force       # file it although a similar name exists
    ... --dir PATH    # memory folder (default: the slug of the current folder)

Exit 0 = PASS, 1 = FAIL (bad input or read-back failed), 2 = refused (it exists or looks like a duplicate).
"""
import argparse
import importlib.util
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("recall", os.path.join(HERE, "recall.py"))
recall = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(recall)

TYPES = ("user", "feedback", "project", "reference")
NAME = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
INDEX_LIMIT = 200  # the harness stops reading a memory index after about this many lines


def slug_dir(cwd):
    """The harness's project folder for cwd. On the Mac it keeps '_' (-Users-kristinarash-DEV-CLI_Dev);
    the skill's rule (every non-alphanumeric to '-') matches the Windows folders. Prefer whichever exists."""
    projects = os.path.join(recall.HOME, ".claude/projects")
    mac = os.path.join(projects, re.sub(r"[^A-Za-z0-9_-]", "-", cwd), "memory")
    strict = os.path.join(projects, re.sub(r"[^A-Za-z0-9]", "-", cwd), "memory")
    if not os.path.isdir(os.path.dirname(mac)) and os.path.isdir(os.path.dirname(strict)):
        return strict
    return mac


def name_words(stem):
    return set(re.split(r"[-_]", stem)) - set(TYPES) - {""}


def look_alikes(mem_dir, name):
    """Existing memories whose name shares at least half its words with the new name."""
    new = name_words(name)
    out = []
    for f in sorted(os.listdir(mem_dir)) if os.path.isdir(mem_dir) else []:
        if f.endswith(".md") and f != "MEMORY.md":
            old = name_words(f[:-3].split("_", 1)[-1])
            if new and old and len(new & old) * 2 >= max(len(new), len(old)):
                out.append(f)
    return out


def render(a, body):
    desc = a.desc.replace('"', "'")
    text = f'---\nname: {a.name}\ndescription: "{desc}"\nmetadata:\n  type: {a.type}\n---\n\n{body.strip()}\n'
    if a.why:
        text += f"\n**Why:** {a.why.strip()}\n"
    if a.how:
        text += f"\n**How to apply:** {a.how.strip()}\n"
    return text


def write_atomic(path, text):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        fh.write(text)
    os.replace(tmp, path)


def set_index_line(index, fname, line):
    """Add the pointer, or replace the one already pointing at fname. Returns the new index text."""
    text = open(index, encoding="utf-8").read() if os.path.exists(index) else "# Memory Index\n"
    lines = text.rstrip("\n").split("\n")
    hits = [i for i, l in enumerate(lines) if f"]({fname})" in l]
    if hits:
        lines[hits[0]] = line
        lines = [l for i, l in enumerate(lines) if i not in hits[1:]]
    else:
        lines.append(line)
    return "\n".join(lines) + "\n"


def verify(path, index, a, body):
    """The skill's verification gate, in code. Returns a list of failed checks."""
    fails = []
    text = open(path, encoding="utf-8").read()
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    if not m:
        fails.append("frontmatter missing")
    else:
        fm = m.group(1)
        for want in (f"name: {a.name}", "description: ", f"  type: {a.type}"):
            if want not in fm:
                fails.append(f"frontmatter lacks '{want.strip()}'")
    if text.count(body.strip()) != 1:
        fails.append("fact not in the file exactly once")
    fname = os.path.basename(path)
    n = open(index, encoding="utf-8").read().count(f"]({fname})")
    if n != 1:
        fails.append(f"index points at {fname} {n} times, want 1")
    return fails


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("body", help="the fact; '-' reads it from stdin")
    ap.add_argument("--type", required=True, choices=TYPES)
    ap.add_argument("--name", required=True, help="bare kebab slug, e.g. cloud-push-launchd-blocked")
    ap.add_argument("--desc", required=True, help="one line; used to decide relevance during recall")
    ap.add_argument("--hook", required=True, help="index hook: when to open this memory")
    ap.add_argument("--title", help="index title (default: from the name)")
    ap.add_argument("--why")
    ap.add_argument("--how")
    ap.add_argument("--dir", help="memory folder (default: slug of the current folder)")
    ap.add_argument("--update", action="store_true", help="replace an existing memory of this name")
    ap.add_argument("--force", action="store_true", help="file it although a similar name exists")
    a = ap.parse_args(argv)

    body = sys.stdin.read() if a.body == "-" else a.body
    errs = []
    if not body.strip():
        errs.append("the fact is empty")
    if not NAME.match(a.name):
        errs.append(f"--name '{a.name}' is not a bare kebab slug (a-z, 0-9, single dashes)")
    elif a.name.split("-")[0] == a.type:
        errs.append(f"--name repeats the type: use '{a.name.split('-', 1)[-1]}' (only if the memory is not about '{a.type}')")
    for flag in ("desc", "hook", "title"):
        if "\n" in (getattr(a, flag) or ""):
            errs.append(f"--{flag} must be one line")
    if errs:
        print("FAIL: " + "; ".join(errs))
        return 1

    mem_dir = os.path.abspath(os.path.expanduser(a.dir)) if a.dir else slug_dir(os.getcwd())
    fname = f"{a.type}_{a.name}.md"
    path = os.path.join(mem_dir, fname)
    index = os.path.join(mem_dir, "MEMORY.md")

    if os.path.exists(path) and not a.update:
        print(f"REFUSED: {path} exists. Read it; to replace it, add --update.")
        return 2
    if not os.path.exists(path):
        twins = [f for f in look_alikes(mem_dir, a.name) if f != fname]
        if twins and not a.force:
            print(f"REFUSED: similar memory names in {mem_dir}: {', '.join(twins)}")
            print("Read them first. Update one (--name <its name> --update), or add --force if this is a new fact.")
            return 2

    os.makedirs(mem_dir, exist_ok=True)
    title = a.title or a.name.replace("-", " ").capitalize()
    write_atomic(path, render(a, body))
    write_atomic(index, set_index_line(index, fname, f"- [{title}]({fname}) — {a.hook.strip()}"))

    fails = verify(path, index, a, body)
    if fails:
        print(f"FAIL: {path}: " + "; ".join(fails))
        return 1

    notes = []
    if not os.path.basename(os.path.dirname(mem_dir)).startswith("-Users-") and not a.dir:
        notes.append("this is not a Mac slug; it will not be auto-injected on this machine")
    lines = open(index, encoding="utf-8").read().count("\n")
    if lines > INDEX_LIMIT:
        notes.append(f"index is {lines} lines; the harness reads about {INDEX_LIMIT}")
    rts = recall.roots()
    if any(os.path.abspath(mem_dir).startswith(os.path.abspath(r)) for r in rts):
        recall.open_index(rts).close()  # findable by recall.py right away
    else:
        notes.append("folder is outside the recall/memsearch roots (KeystoneOS/data/memory-index-paths.json); search will not find it")

    print(f"PASS: {'updated' if a.update else 'saved'} {path.replace(recall.HOME, '~')}")
    for n in notes:
        print(f"note: {n}")
    print("Active from the next session.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
