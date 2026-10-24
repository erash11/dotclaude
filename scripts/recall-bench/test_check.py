"""Checks check.py's drop rule and rank matching. Run: python3 -I ~/.claude/scripts/recall-bench/test_check.py"""
import importlib.util
import os

spec = importlib.util.spec_from_file_location("check", os.path.join(os.path.dirname(os.path.abspath(__file__)), "check.py"))
c = importlib.util.module_from_spec(spec)
spec.loader.exec_module(c)

base = {"eval_hit1": 21, "eval_hit5": 25, "bench_top1": 11}
assert c.drops({"eval_hit1": 20, "eval_hit5": 25, "bench_top1": 11}, base) == ["eval_hit1 20 < 21"]
assert c.drops({"eval_hit1": 21, "eval_hit5": 25, "bench_top1": 12}, base) == []  # more hits is fine
assert c.rank_of(["/a/x.md", "/b/Memory/Y.md"], ["memory/y.md"]) == 2  # case-insensitive fragment
assert c.rank_of(["/a/x.md"], ["z.md"]) is None
print("test_check: all checks passed")
