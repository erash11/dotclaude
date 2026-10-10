#!/usr/bin/env python3
# Pull the SpecialRequests subfolders from the laptop copy on Drive via gws.
# Only adds files that are missing or the wrong size locally. Never overwrites.
import json, os, subprocess, sys

DEST = os.path.expanduser("~/DEV/SpecialRequests")
ROOTS = {  # Drive folder id -> local folder name
    "15LL1-hrGPKIpRW6q-hw-poHHq3RaUu98": "TOS_ES",
    "1ZEES6zrjBF_J-54_TLOM8p0ixxWlGoku": "Wilhelm_Brody_RTP",
    "1DPTObecnVTphyoAvv-JyZQG54YeFJV2U": "Zinnecker_Skylar",
}
FOLDER = "application/vnd.google-apps.folder"
# Google-native files have no bytes to download. Export them to an Office/PDF format.
EXPORT = {
    "application/vnd.google-apps.document": ("application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"),
    "application/vnd.google-apps.spreadsheet": ("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ".xlsx"),
    "application/vnd.google-apps.presentation": ("application/vnd.openxmlformats-officedocument.presentationml.presentation", ".pptx"),
    "application/vnd.google-apps.drawing": ("application/pdf", ".pdf"),
}


def gws(*args):
    r = subprocess.run(["gws", *args], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip() or r.stdout.strip())
    return r.stdout


def children(folder_id):
    token, out = None, []
    while True:
        params = {"q": f"'{folder_id}' in parents and trashed = false",
                  "fields": "nextPageToken,files(id,name,mimeType,size)",
                  "pageSize": 1000}
        if token:
            params["pageToken"] = token
        text = gws("drive", "files", "list", "--params", json.dumps(params), "--format", "json")
        data = json.loads(text[text.index("{"):])
        out += data.get("files", [])
        token = data.get("nextPageToken")
        if not token:
            return out


def walk(folder_id, rel, acc):
    for f in children(folder_id):
        path = os.path.join(rel, f["name"])
        if f["name"] == ".git":  # skip nested git internals; the code lives on GitHub
            continue
        if f["mimeType"] == FOLDER:
            walk(f["id"], path, acc)
        else:
            acc.append((path, f))


plan = []
for fid, name in ROOTS.items():
    acc = []
    walk(fid, name, acc)
    plan += acc
print(f"PLAN files={len(plan)}", flush=True)
# gws only writes --output inside the current folder, so work from DEST with relative paths.
os.chdir(DEST)

ok = skipped = native = failed = 0
for path, f in plan:
    local = path  # relative to DEST (cwd)
    if f["mimeType"].startswith("application/vnd.google-apps"):
        if f["mimeType"] not in EXPORT:
            native += 1
            print(f"NATIVE-SKIP {path} ({f['mimeType']})", flush=True)
            continue
        mime, ext = EXPORT[f["mimeType"]]
        local = local + ext
        if os.path.isfile(local) and os.path.getsize(local) > 0:
            skipped += 1
            continue
        os.makedirs(os.path.dirname(local), exist_ok=True)
        try:
            gws("drive", "files", "export", "--params",
                json.dumps({"fileId": f["id"], "mimeType": mime}), "--output", local)
            if os.path.getsize(local) == 0:
                raise RuntimeError("exported file is empty")
            ok += 1
            print(f"EXPORTED {path}{ext}", flush=True)
        except Exception as e:
            failed += 1
            print(f"FAIL {path} :: {e}", flush=True)
        continue
    want = int(f.get("size", -1))
    if os.path.exists(local):  # never overwrite: an existing Mac file is kept
        skipped += 1
        continue
    os.makedirs(os.path.dirname(local), exist_ok=True)
    try:
        gws("drive", "files", "get", "--params",
            json.dumps({"fileId": f["id"], "alt": "media"}), "--output", local)
        if os.path.getsize(local) != want:
            raise RuntimeError(f"size {os.path.getsize(local)} != {want}")
        ok += 1
        print(f"OK {path}", flush=True)
    except Exception as e:
        failed += 1
        print(f"FAIL {path} :: {e}", flush=True)

print(f"DONE copied={ok} already_ok={skipped} google_native_skipped={native} failed={failed}", flush=True)
