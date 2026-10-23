#!/usr/bin/env node
// Stop hook: append a short summary of the last assistant turn to
// ~/.claude/global-memory/transcripts/YYYY-MM-DD.md.
//
// Schema (Claude Code Stop hook input):
//   { hook_event_name, session_id, transcript_path, stop_hook_active, cwd, ... }
// No `response` field — the assistant text must be read from transcript_path (JSONL).
//
// Failures are swallowed but logged to .errors.log so silent breakage is debuggable.

const fs = require('fs');
const path = require('path');
const os = require('os');

const OUT_DIR = path.join(os.homedir(), '.claude', 'global-memory', 'transcripts');
const ERR_LOG = path.join(OUT_DIR, '.errors.log');
const SNIPPET_CHARS = 500;

function logErr(msg) {
  try {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.appendFileSync(ERR_LOG, `[${new Date().toISOString()}] ${msg}\n`);
  } catch (_) { /* swallow */ }
}

function extractText(content) {
  // content can be a string or an array of {type, text} blocks
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map(b => (typeof b === 'string' ? b : b && b.type === 'text' ? b.text || '' : ''))
      .filter(Boolean)
      .join('\n');
  }
  return '';
}

function lastAssistantText(transcriptPath) {
  // JSONL — one record per line. Walk from the end to find the last assistant message.
  const raw = fs.readFileSync(transcriptPath, 'utf8');
  const lines = raw.split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line) continue;
    let rec;
    try { rec = JSON.parse(line); } catch { continue; }
    // Claude Code transcript records vary; check common shapes
    const role = rec.role || (rec.message && rec.message.role) || rec.type;
    if (role !== 'assistant') continue;
    const content = (rec.message && rec.message.content) || rec.content;
    const text = extractText(content).trim();
    if (text) return text;
  }
  return '';
}

(function main() {
  let input;
  try {
    input = JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch (e) {
    logErr('failed to parse stdin: ' + e.message);
    return;
  }

  // Loop guard: if our hook (or another) is what stopped the model, don't recurse.
  if (input.stop_hook_active) return;

  // Recursion guard, same as the memory compiler's session-end.py: flush.py and compile.py
  // run Agent SDK sessions marked CLAUDE_INVOKED_BY that never write a transcript, so every
  // one of them logged "transcript_path does not exist" (13 on 2026-10-23).
  if (process.env.CLAUDE_INVOKED_BY) return;

  const transcriptPath = input.transcript_path;

  // A null/absent transcript_path is not breakage — some harnesses that share
  // these hooks (Codex `gpt-5.6*` sessions, verified 2026-09-07) never supply
  // one. There is nothing to capture, so exit quietly. Logging it refilled
  // .errors.log every run and buried the entries that do mean something.
  if (!transcriptPath) return;

  // A path that WAS supplied but is not on disk is real breakage. Keep logging it.
  if (!fs.existsSync(transcriptPath)) {
    logErr('transcript_path does not exist: ' + JSON.stringify(input).slice(0, 200));
    return;
  }

  let text;
  try {
    text = lastAssistantText(transcriptPath);
  } catch (e) {
    logErr('read transcript failed: ' + e.message);
    return;
  }
  if (!text) return; // nothing assistant said this turn (e.g. pure tool-use turn)

  // Local date/time — toISOString() is always UTC, which makes file names jump
  // to "tomorrow" in the evening for any timezone west of GMT.
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const outFile = path.join(OUT_DIR, `${today}.md`);
  const snippet = text.slice(0, SNIPPET_CHARS).replace(/\n{3,}/g, '\n\n');
  const session = input.session_id ? ` [${String(input.session_id).slice(0, 8)}]` : '';
  const cwd = input.cwd ? ` (${input.cwd})` : '';
  const entry = `\n## ${time}${session}${cwd}\n${snippet}\n`;

  try {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.appendFileSync(outFile, entry);
  } catch (e) {
    logErr('append failed: ' + e.message);
  }
})();
