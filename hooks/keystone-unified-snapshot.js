#!/usr/bin/env node
// SessionStart hook: inject KeystoneOS's cross-harness unified snapshot
// (recent Claude/Codex/meeting activity) silently alongside the memory
// compiler's own snapshot. Fails closed: any error means no additionalContext,
// never a thrown error that could block session start.

const fs = require('fs');
const path = require('path');
const os = require('os');

const SNAPSHOT_PATH = path.join(
  os.homedir(), 'Desktop', 'DEV', 'KeystoneOS', 'outputs', 'dashboard', 'unified-snapshot.md'
);

function emit(context) {
  const output = {
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
    },
  };
  if (context) output.hookSpecificOutput.additionalContext = context;
  process.stdout.write(JSON.stringify(output));
}

try {
  const content = fs.readFileSync(SNAPSHOT_PATH, 'utf8');
  emit(content);
}
catch (_) {
  emit(null);
}
