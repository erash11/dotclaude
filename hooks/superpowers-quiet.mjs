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
// A second copy arrives from claude.ai account sync under
// plugins/synced/<account>/<plugin-id>/ (folder names are ids, so it is found by
// its plugin.json name). A re-sync may restore it for one session.
//
// A third copy is the desktop app's own, under
// ~/Library/Application Support/Claude/local-agent-mode-sessions/<a>/<b>/rpm/plugin_<id>/
// (found 2026-10-23: the only copy whose SessionStart was still live). The other
// fix for both is turning the synced superpowers off on claude.ai.
//
// Undo: remove this hook from settings.json, then reinstall the plugin
// (or restore hooks.json.orig beside each patched hooks.json).
import { existsSync, readdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

function patch(f) {
  if (!existsSync(f)) return;
  const cfg = JSON.parse(readFileSync(f, "utf8"));
  if (!cfg.hooks || !cfg.hooks.SessionStart) return;
  if (!existsSync(f + ".orig")) copyFileSync(f, f + ".orig");
  delete cfg.hooks.SessionStart;
  writeFileSync(f, JSON.stringify(cfg, null, 2) + "\n");
}

try {
  const root = join(homedir(), ".claude", "plugins", "cache", "claude-plugins-official", "superpowers");
  if (existsSync(root)) {
    for (const ver of readdirSync(root)) {
      try { patch(join(root, ver, "hooks", "hooks.json")); } catch {}
    }
  }
} catch {}

try {
  const synced = join(homedir(), ".claude", "plugins", "synced");
  if (existsSync(synced)) {
    for (const acct of readdirSync(synced)) {
      let plugins;
      try { plugins = readdirSync(join(synced, acct)); } catch { continue; }
      for (const p of plugins) {
        try {
          const dir = join(synced, acct, p);
          const manifest = join(dir, ".claude-plugin", "plugin.json");
          if (!existsSync(manifest)) continue;
          if (JSON.parse(readFileSync(manifest, "utf8")).name !== "superpowers") continue;
          patch(join(dir, "hooks", "hooks.json"));
        } catch {}
      }
    }
  }
} catch {}

try {
  const lams = join(homedir(), "Library", "Application Support", "Claude", "local-agent-mode-sessions");
  if (existsSync(lams)) {
    for (const a of readdirSync(lams)) {
      let bs;
      try { bs = readdirSync(join(lams, a)); } catch { continue; }
      for (const b of bs) {
        let plugins;
        try { plugins = readdirSync(join(lams, a, b, "rpm")); } catch { continue; }
        for (const p of plugins) {
          try {
            const dir = join(lams, a, b, "rpm", p);
            const manifest = join(dir, ".claude-plugin", "plugin.json");
            if (!existsSync(manifest)) continue;
            if (JSON.parse(readFileSync(manifest, "utf8")).name !== "superpowers") continue;
            patch(join(dir, "hooks", "hooks.json"));
          } catch {}
        }
      }
    }
  }
} catch {}
process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart" } }));
