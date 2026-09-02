#!/usr/bin/env node
// SessionStart hook: inject the Tier B global memory snapshot (USER.md,
// MEMORY.md, and .errors.log when non-empty) plus KeystoneOS's cross-harness
// unified snapshot, alongside the memory compiler's own snapshot.
//
// This replaces the prose instruction in ~/.claude/CLAUDE.md that told the
// agent to read those three files by hand at session start — a rule nothing
// enforced, which therefore silently did not happen in some sessions.
//
// Fails closed: any error means less context, never a thrown error that could
// block session start. But a MISSING SOURCE IS REPORTED, not swallowed — the
// old version pointed at the retired ~/Desktop/DEV path and injected nothing
// at all for weeks without a single visible symptom (see project memory
// `memsearch-index-path-drift`: make fallbacks loud).

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir();

const SOURCES = [
  {
    label: 'User profile (global-memory/USER.md)',
    file: path.join(HOME, '.claude', 'global-memory', 'USER.md'),
    required: true,
  },
  {
    label: 'Working memory (global-memory/MEMORY.md)',
    file: path.join(HOME, '.claude', 'global-memory', 'MEMORY.md'),
    required: true,
  },
  {
    label: 'HOOK FAILURES — surface these to the user on the first response',
    file: path.join(HOME, '.claude', 'global-memory', 'transcripts', '.errors.log'),
    required: false,      // absent is fine
    skipIfEmpty: true,    // normally empty; only inject when it is not
  },
  {
    // Points, does not paste: ~6k chars of recent activity that most sessions
    // never need. Recorded decision — see project memory
    // `memory-compiler-pipeline`: "SessionStart now points, not pastes".
    // Flip `pointOnly` to false to inline it again.
    label: 'Cross-harness activity (KeystoneOS unified snapshot)',
    file: path.join(HOME, 'DEV', 'KeystoneOS', 'outputs', 'dashboard', 'unified-snapshot.md'),
    required: false,
    pointOnly: true,
  },
];

function emit(context) {
  const output = { hookSpecificOutput: { hookEventName: 'SessionStart' } };
  if (context) output.hookSpecificOutput.additionalContext = context;
  process.stdout.write(JSON.stringify(output));
}

function main() {
  const parts = [];
  const problems = [];

  for (const src of SOURCES) {
    let body;
    try {
      body = fs.readFileSync(src.file, 'utf8');
    } catch (err) {
      if (src.required) {
        problems.push(`${src.label}: unreadable at ${src.file} (${err.code || 'ERR'})`);
      }
      continue;
    }
    if (src.skipIfEmpty && body.trim() === '') continue;
    if (src.pointOnly) {
      const stamp = fs.statSync(src.file).mtime.toISOString().slice(0, 16).replace('T', ' ');
      parts.push(
        `## ${src.label}\n\nNot loaded here — read it only if a question needs it.\n` +
        `Path: \`${src.file}\` (${body.length} chars, updated ${stamp})`
      );
      continue;
    }
    parts.push(`## ${src.label}\n\n${body.trim()}`);
  }

  if (problems.length) {
    parts.unshift(
      '## SessionStart hook could not read a required memory file\n\n' +
      problems.map((p) => `- ${p}`).join('\n') +
      '\n\nTell the user on the first response. Do not work around it silently.'
    );
  }

  emit(parts.length ? parts.join('\n\n---\n\n') : null);
}

try {
  main();
} catch (_) {
  emit(null);
}
