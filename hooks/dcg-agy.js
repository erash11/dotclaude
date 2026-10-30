#!/usr/bin/env node
// PreToolUse hook adapter for Antigravity CLI (`agy`) -> ~/.local/bin/dcg.
// Antigravity sends `{"toolCall":{"name":"run_command","args":{"CommandLine":"..."}}}`
// and expects `{"decision":"allow"}` or `{"decision":"deny","reason":"..."}` on stdout.
// dcg natively parses `toolCall.args.CommandLine` and emits `{"decision":"block","reason":...}`
// when blocked, or empty stdout when allowed.
// shortcut: synchronous spawnSync (~10 ms), upgrade only if dcg adds native agy stdout mode.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const DCG = path.join(os.homedir(), '.local', 'bin', 'dcg');

function allow() {
  process.stdout.write(JSON.stringify({ decision: 'allow' }) + '\n');
}

try {
  const input = fs.readFileSync(0, 'utf8');
  if (!fs.existsSync(DCG)) {
    allow();
    process.exit(0);
  }
  const res = spawnSync(DCG, [], {
    input,
    encoding: 'utf8',
    timeout: 5000,
  });
  const out = (res.stdout || '').trim();
  if (!out) {
    allow();
    process.exit(0);
  }
  const parsed = JSON.parse(out);
  const dec = parsed.decision || parsed?.hookSpecificOutput?.permissionDecision;
  if (dec === 'block' || dec === 'deny') {
    const reason =
      parsed.reason ||
      parsed?.hookSpecificOutput?.permissionDecisionReason ||
      'Blocked by dcg (Destructive Command Guard)';
    process.stdout.write(JSON.stringify({ decision: 'deny', reason }) + '\n');
  } else {
    allow();
  }
} catch (_) {
  allow();
}
