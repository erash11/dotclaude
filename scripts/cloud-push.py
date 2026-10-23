#!/usr/bin/env python3
"""Copy all of ~/DEV to the Google Drive _MACHINE/Cloud_Copy folder (one-way, never deletes).

Runs daily from launchd (com.keystone.clouddrivepush, 07:00 and 17:30) through cloud-push.command,
which opens it in Terminal: launchd alone cannot list Drive folders (see that file). Can be run by hand.
Builds the file list fresh each run, so new and changed files are picked up.

Approved scope (Eric, 2026-10-12): all project files, including athlete data, on personal Google Drive.
Kept local on purpose:
  - database files (DuckDB/SQLite): sync can lock or corrupt them.
    daily-backup.ps1 uploads consistent copies as dev-databases.tgz via gws instead.
  - password and key files (.env, *.pem, *.key, id_rsa, credentials*, secrets*)
  - regenerable folders (node_modules, .venv, venv, __pycache__, .next)
  - any folder whose CLAUDE.md heading says "local only" (STORAGE.md rule; e.g. SpecialRequests/TOS_ES)
  - browser profiles (a folder holding "Local State"): saved logins and cookies
Log: ~/.claude/scripts/logs/cloud-push.log. Failures also go to global-memory/transcripts/.errors.log,
so they show at the next session start.
"""
import datetime
import os
import subprocess
import sys

DEV = os.path.expanduser("~/DEV")
DEST = os.path.expanduser(
    "~/Library/CloudStorage/GoogleDrive-eric.rash11@gmail.com/My Drive/_MACHINE/Cloud_Copy/DEV")  # moved out of Primary 2026-10-14
LOG = os.path.expanduser("~/.claude/scripts/logs/cloud-push.log")
LIST = os.path.expanduser("~/.claude/scripts/logs/cloud-push-files0.bin")
DB_EXT = (".duckdb", ".db", ".sqlite", ".sqlite3", ".db-wal", ".db-shm")
SECRET_PREFIX = (".env",)
SECRET_PARTS = ("credentials", "secrets", "id_rsa", ".pem", ".key")
REGEN_DIRS = {".git", "node_modules", ".venv", "venv", "__pycache__", ".next", ".build", "printing-press-library"}
JUNK = {".DS_Store"}
ERRORS = os.path.expanduser("~/.claude/global-memory/transcripts/.errors.log")


def log(msg):
    os.makedirs(os.path.dirname(LOG), exist_ok=True)
    line = f"{datetime.datetime.now().isoformat(timespec='seconds')} {msg}"
    with open(LOG, "a", encoding="utf-8") as fh:
        fh.write(line + "\n")
    print(line)
    if msg.startswith("ERROR"):
        stamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
        with open(ERRORS, "a", encoding="utf-8") as fh:
            fh.write(f"[{stamp}] cloud-push: {msg[:300]}\n")


def private_dir(dp, fn):
    """True for a folder that must not leave this Mac: local-only CLAUDE.md, or a browser profile."""
    if "Local State" in fn:
        return True
    if "CLAUDE.md" in fn:
        with open(os.path.join(dp, "CLAUDE.md"), encoding="utf-8", errors="replace") as fh:
            return "local only" in fh.readline().lower()
    return False


def keep(name):
    low = name.lower()
    if low in JUNK:
        return False
    if low.endswith(DB_EXT):
        return False
    if low.startswith(SECRET_PREFIX) or any(p in low for p in SECRET_PARTS):
        return False
    return True


def build_list():
    files = []
    for dp, dn, fn in os.walk(DEV):
        if private_dir(dp, fn):
            dn[:] = []
            continue
        base = os.path.basename(dp)
        dn[:] = [
            d for d in dn
            if d not in REGEN_DIRS and not (base == "graphify-out" and d == "cache")
        ]
        for f in fn:
            if not keep(f):
                continue
            p = os.path.join(dp, f)
            if os.path.islink(p) or not os.path.isfile(p):
                continue
            files.append(os.path.relpath(p, DEV))
    return files


def main():
    if not os.path.isdir(DEST.rsplit("/Cloud_Copy", 1)[0]):
        log("ERROR Drive not mounted; nothing copied")
        return 1
    os.makedirs(DEST, exist_ok=True)
    files = build_list()
    os.makedirs(os.path.dirname(LIST), exist_ok=True)
    with open(LIST, "wb") as fh:
        fh.write(b"\0".join(f.encode("utf-8") for f in files) + b"\0")
    log(f"START {len(files)} files listed")
    # No --delete flag: rsync never removes files on the Drive side, so this stays one-way.
    cmd = ["/usr/bin/rsync", "-a", "--modify-window=5", "--from0",
           f"--files-from={LIST}", DEV + "/", DEST + "/"]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        log(f"ERROR rsync exit {res.returncode}: {res.stderr.strip()[-300:]}")
        return res.returncode
    log(f"OK rsync finished ({len(files)} files checked; only changed files were copied)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
