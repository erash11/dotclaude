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
    summarize: true,      // one line per failure kind, not one per occurrence
  },
  {
    // Points, does not paste: ~6k chars of recent activity that most sessions
    // never need. Recorded decision — see project memory
    // `memory-compiler-pipeline`: "SessionStart now points, not pastes".
    // Flip `pointOnly` to false to inline it again.
    label: 'Cross-harness activity (KeystoneOS unified snapshot)',
    // Mac: ~/DEV. Windows: ~/Desktop/DEV. First path that exists wins.
    file: [path.join(HOME, 'DEV'), path.join(HOME, 'Desktop', 'DEV')]
      .map((d) => path.join(d, 'KeystoneOS', 'outputs', 'dashboard', 'unified-snapshot.md'))
      .find((f) => fs.existsSync(f)) || path.join(HOME, 'DEV', 'KeystoneOS', 'outputs', 'dashboard', 'unified-snapshot.md'),
    required: false,
    pointOnly: true,
  },
];

// .errors.log lines look like `[ISO-time] kind: message`. A stuck job writes
// the same kind every few minutes, so the raw log can reach 100+ near-identical
// lines injected into every session. Collapse to one line per kind: count,
// first and last time, and the latest message (which carries the running count).
function summarizeErrors(body) {
  const groups = new Map();
  const other = [];
  for (const line of body.split(/\r?\n/)) {
    const m = line.match(/^\[([^\]]+)\]\s*([\w.-]+):\s*(.*)$/);
    if (!m) { if (line.trim()) other.push(line.trim()); continue; }
    const [, ts, kind, msg] = m;
    const g = groups.get(kind) || { n: 0, first: ts, last: ts, msg };
    // Both machines append, so lines are not in time order: track min/max.
    g.n += 1;
    if (ts < g.first) g.first = ts;
    if (ts >= g.last) { g.last = ts; g.msg = msg; }
    groups.set(kind, g);
  }
  const t = (s) => s.slice(0, 16).replace('T', ' ');
  const cap = (s) => (s.length > 300 ? s.slice(0, 300) + '…' : s);
  const lines = [...groups].map(([kind, g]) =>
    `- **${kind}** ×${g.n} (${t(g.first)} → ${t(g.last)} UTC): ${cap(g.msg)}`);
  if (other.length) lines.push(`- ${other.length} unparsed line(s); see the file.`);
  return lines.join('\n') +
    `\n\nFull log: \`~/.claude/global-memory/transcripts/.errors.log\`. ` +
    'Surface this once; clear the file after the user has seen it and the cause is handled.';
}

function emit(context) {
  if (process.argv.includes('--agy')) {
    const out = context
      ? { injectSteps: [{ systemMessage: { systemMessage: context } }] }
      : {};
    process.stdout.write(JSON.stringify(out));
    return;
  }
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
    parts.push(`## ${src.label}\n\n${src.summarize ? summarizeErrors(body) : body.trim()}`);
  }

  // Dead-man check: the weekly stack doctor reports failures through .errors.log,
  // so a run that never happens reports nothing (missed 10-26 unseen). Mac only:
  // the laptop has no weekly run. 8 days = one missed Monday.
  if (process.platform === 'darwin') {
    const weekly = process.env.STACKDOCTOR_WEEKLY_LOG ||
      path.join(HOME, '.claude', 'skills', 'claude-stack-doctor', 'scripts', 'last-weekly-run.log');
    let ageD = Infinity;
    try { ageD = (Date.now() - fs.statSync(weekly).mtimeMs) / 86400000; } catch (_) {}
    if (ageD > 8) {
      parts.unshift(
        '## Weekly stack doctor is overdue\n\n' +
        `\`${weekly}\` is ${ageD === Infinity ? 'missing or unreadable' : Math.floor(ageD) + ' days old'}; ` +
        'the Monday launchd job `com.keystone.stackdoctor` did not run. Tell the user on the first ' +
        'response and run `/claude-stack-doctor`.'
      );
    }
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
