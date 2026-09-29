#!/usr/bin/env node
// SessionStart: keep the superpowers plugin's skills, drop its session-start
// context injection (the all-caps "1% chance -> MUST invoke" using-superpowers
// text). Eric's rule is "skills are tools, not a gate" (~/.claude/CLAUDE.md);
// countering an emphatic injection with more CLAUDE.md text just makes two
// instructions fight every turn, so the injection itself is removed.
//
// The plugin cache is overwritten on every plugin update, so a one-off edit
// would silently revert. This hook re-applies the edit each session to every
// cached version. A freshly updated version injects once, then is quiet from
// the next session on. Idempotent. Fails silent: worst case the injection
// comes back, never a blocked session.
//
// Undo: remove this hook from settings.json, then reinstall the plugin
// (or restore hooks.json.orig beside each patched hooks.json).
import { existsSync, readdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

try {
  const root = join(homedir(), ".claude", "plugins", "cache", "claude-plugins-official", "superpowers");
  if (existsSync(root)) {
    for (const ver of readdirSync(root)) {
      const f = join(root, ver, "hooks", "hooks.json");
      if (!existsSync(f)) continue;
      const cfg = JSON.parse(readFileSync(f, "utf8"));
      if (!cfg.hooks || !cfg.hooks.SessionStart) continue;
      if (!existsSync(f + ".orig")) copyFileSync(f, f + ".orig");
      delete cfg.hooks.SessionStart;
      writeFileSync(f, JSON.stringify(cfg, null, 2) + "\n");
    }
  }
} catch {}
process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart" } }));
