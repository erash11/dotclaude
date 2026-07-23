import sys
import json
import time

# Ensure block characters render correctly on Windows terminals
sys.stdout.reconfigure(encoding="utf-8")

d = json.load(sys.stdin)

model = (d.get("model") or {}).get("display_name", "N/A")
effort = (d.get("effort") or {}).get("level")
cwd = (d.get("workspace") or {}).get("current_dir") or d.get("cwd")
ctx = (d.get("context_window") or {}).get("remaining_percentage")
rl = d.get("rate_limits") or {}
five = rl.get("five_hour") or {}
week = rl.get("seven_day") or {}

# Model name, with effort level appended (e.g. "Opus 4.8 (xhigh)")
model_str = f"{model} ({effort})" if effort else model
parts = [model_str]

# Working directory (full path)
if cwd:
    parts.append(f"dir: {cwd}")

# Context window
if ctx is not None:
    parts.append(f"ctx: {ctx:.0f}% left")
else:
    parts.append("ctx: --")

# 5-hour session usage bar
# More filled (█) = more remaining. used_percentage 30 -> remaining 70 -> 7 filled cells.
BAR_WIDTH = 10
five_used = five.get("used_percentage")
if five_used is not None:
    remaining_pct = max(0.0, min(100.0, 100.0 - five_used))
    filled = round(remaining_pct / 100 * BAR_WIDTH)
    bar = "█" * filled + "░" * (BAR_WIDTH - filled)
    resets_at = five.get("resets_at")
    if resets_at:
        mins_left = max(0, (resets_at - time.time()) / 60)
        hrs = int(mins_left // 60)
        mins = int(mins_left % 60)
        label = f"{hrs}h{mins:02d}m" if hrs > 0 else f"{mins}m"
        parts.append(f"session [{bar}] {remaining_pct:.0f}% left, resets {label}")
    else:
        parts.append(f"session [{bar}] {remaining_pct:.0f}% left")
else:
    parts.append("session [----------] --")

# 7-day rate limit
week_used = week.get("used_percentage")
if week_used is not None:
    parts.append(f"7d: {week_used:.0f}%")

print(" | ".join(parts))
