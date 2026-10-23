"""Checks cloud-push.py's file list keeps private folders off the Drive mirror.
Run: python3 -I ~/.claude/scripts/test_cloud_push.py  (builds a temp tree; copies nothing)
"""
import importlib.util
import os
import tempfile

spec = importlib.util.spec_from_file_location(
    "cloud_push", os.path.join(os.path.dirname(os.path.abspath(__file__)), "cloud-push.py"))
cp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cp)


def touch(root, rel, text="x"):
    p = os.path.join(root, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w") as fh:
        fh.write(text)


with tempfile.TemporaryDirectory() as dev:
    touch(dev, "CLAUDE.md", "# ~/DEV — map\nA folder whose CLAUDE.md says local only stays local.\n")
    touch(dev, "Proj/notes.md")
    touch(dev, "Proj/.env")
    touch(dev, "Private/CLAUDE.md", "# Private — local only\n")
    touch(dev, "Private/case.csv")
    touch(dev, "Proj/out/edge-profile/Local State")
    touch(dev, "Proj/out/edge-profile/Default/Login Data")
    cp.DEV = dev
    got = set(cp.build_list())
    assert got == {"CLAUDE.md", "Proj/notes.md"}, got
print("ok")
