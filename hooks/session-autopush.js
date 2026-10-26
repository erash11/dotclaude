#!/usr/bin/env node
// SessionEnd hook: commit and push the repo this session worked in, so new and
// changed files reach GitHub without waiting for /closeout. Added 2026-10-19.
//
// Why: Eric works on the Mac and the Windows laptop. Anything left uncommitted
// on one machine is invisible on the other. This makes "push at the end" the
// default instead of a habit to remember.
//
// What it does, in order. Any check that fails stops the hook, writes one line
// to .errors.log (surfaced by keystone-unified-snapshot.js at the next session
// start), and leaves the working tree exactly as it was.
//   1. Skip headless/SDK sessions, cloud sessions, and AUTOPUSH_DISABLE=1.
//   2. Find the git repo for the session's cwd. Not a repo: do nothing.
//   3. Skip ~/.claude and everything under it (daily-backup owns those repos,
//      and dotclaude carries GBs of transcripts), the DEV router's ignored
//      subfolders, and any repo with a `.no-autopush` file at its root.
//   4. Skip if a merge or rebase is in progress, HEAD is detached, there are
//      unmerged files, or the branch has no upstream.
//   5. Refuse to commit if any file about to be added looks like a secret,
//      a database, health data, or is over 50 MB. Nothing is committed.
//      .gitignore is respected: ignored files are never looked at.
//   6. `git add -A`, commit "auto: session end (<host>)".
//   7. Fetch. If the remote moved ahead, rebase onto it; on conflict, abort the
//      rebase (the local commit stays) and report.
//   8. Push. A failure is reported; the local commit stays for next time.
//
// Runs synchronously. Every git call is capped by one overall 55s deadline,
// inside the 60s timeout registered in settings.json; if too little time is
// left before the rebase or push, it stops and reports "push by hand".
// A lock file (<git-dir>/autopush.lock) stops two copies running on the same
// repo at once; a second copy quits quietly. A lock older than 120s is stale.

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const NAME = 'session-autopush';
const HOME = os.homedir();
const ERR_LOG = path.join(HOME, '.claude', 'global-memory', 'transcripts', '.errors.log');
const OK_LOG = path.join(HOME, '.claude', 'global-memory', 'transcripts', 'autopush.log');
const MAX_BYTES = 50 * 1024 * 1024;
const DEADLINE = Date.now() + 55000;
const LOCK_STALE_MS = 120000;

// Files that must never be pushed by an unattended commit, even if a
// .gitignore forgot them. Matched against the repo-relative path.
const BLOCKED = [
  /(^|\/)\.env(\..*)?$/i,
  /\.(pem|key|p12|pfx)$/i,
  /(^|\/)id_(rsa|ed25519|ecdsa)(\.pub)?$/i,
  /credential/i,
  /secret/i,
  /token.*\.json$/i,
  /\.(duckdb|db|sqlite|sqlite3|rds|rdata)$/i,
  /dexa/i,
];

function log(file, msg) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, `[${new Date().toISOString()}] ${NAME}: ${msg}\n`);
  } catch (_) {}
}
const fail = (msg) => { log(ERR_LOG, msg); process.exit(0); };
const quit = () => process.exit(0);

function git(cwd, args, timeoutSec = 15) {
  const r = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    timeout: Math.max(1, Math.min(timeoutSec, Math.floor((DEADLINE - Date.now()) / 1000) - 2)) * 1000,
    windowsHide: true,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  });
  return { ok: r.status === 0 && !r.error, signal: r.signal, out: (r.stdout || '').trim(), err: ((r.stderr || '') + (r.error ? ` ${r.error.message}` : '')).trim() };
}

// Hold <git-dir>/autopush.lock for the life of this process. Another live copy
// holds it: quit quietly. fail() and quit() call process.exit, so release runs
// from an 'exit' handler rather than a finally block.
function takeLock(lockPath) {
  const stamp = `${process.pid} ${Date.now()}`;
  try {
    const fd = fs.openSync(lockPath, 'wx');
    fs.writeSync(fd, stamp);
    fs.closeSync(fd);
  } catch (e) {
    if (e.code !== 'EEXIST') return; // cannot lock (read-only?): carry on unlocked
    let ts = 0;
    try { ts = parseInt(fs.readFileSync(lockPath, 'utf8').split(' ')[1], 10) || fs.statSync(lockPath).mtimeMs; } catch (_) {}
    if (Date.now() - ts < LOCK_STALE_MS) quit();
    try { fs.writeFileSync(lockPath, stamp); } catch (_) { quit(); }
  }
  process.on('exit', () => { try { fs.unlinkSync(lockPath); } catch (_) {} });
}

function readStdin() {
  try { return JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch (_) { return {}; }
}

function main() {
  // 1. Who is running.
  const entry = process.env.CLAUDE_CODE_ENTRYPOINT || '';
  if (process.env.CLAUDE_INVOKED_BY || entry.startsWith('sdk')) quit();
  if (process.env.CLAUDE_CODE_REMOTE === 'true') quit();
  if (process.env.AUTOPUSH_DISABLE === '1') quit();

  // 2. Which repo.
  const input = readStdin();
  const cwd = input.cwd || process.cwd();
  const top = git(cwd, ['rev-parse', '--show-toplevel']);
  if (!top.ok || !top.out) quit();
  const root = path.resolve(top.out);
  const label = path.basename(root);

  // 3. Repos this hook must not touch.
  const claudeDir = path.resolve(HOME, '.claude');
  const rel = path.relative(claudeDir, root);
  if (rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))) quit();
  if (fs.existsSync(path.join(root, '.no-autopush'))) quit();

  // 4. Repo state.
  const gitDir = git(root, ['rev-parse', '--absolute-git-dir']).out;
  if (!gitDir) quit();
  takeLock(path.join(gitDir, 'autopush.lock'));
  for (const m of ['MERGE_HEAD', 'rebase-merge', 'rebase-apply', 'CHERRY_PICK_HEAD']) {
    if (fs.existsSync(path.join(gitDir, m))) fail(`${label}: skipped, a merge or rebase is in progress. Finish it, then push by hand.`);
  }
  const branch = git(root, ['symbolic-ref', '--quiet', '--short', 'HEAD']);
  if (!branch.ok) fail(`${label}: skipped, HEAD is detached.`);
  const upstream = git(root, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  if (!upstream.ok) fail(`${label}: skipped, branch '${branch.out}' has no upstream. Push it once by hand with -u.`);

  const status = git(root, ['status', '--porcelain=v1', '-z', '--untracked-files=all']);
  if (!status.ok) fail(`${label}: git status failed: ${status.err}`);
  const entries = status.out.split('\0').filter(Boolean);
  if (entries.some(e => /^(DD|AU|UD|UA|DU|AA|UU) /.test(e))) fail(`${label}: skipped, unmerged files present.`);

  // 5. Screen what would be added. Renames list the new path first in -z mode.
  const toAdd = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const code = e.slice(0, 2);
    const p = e.slice(3);
    if (code[0] === 'R' || code[0] === 'C') i++; // skip the "from" path
    if (code.includes('D') && !code.includes('?')) continue; // deletions add nothing
    toAdd.push(p);
  }
  const blocked = [];
  for (const p of toAdd) {
    const norm = p.replace(/\\/g, '/');
    if (BLOCKED.some(re => re.test(norm))) { blocked.push(norm); continue; }
    try {
      const st = fs.statSync(path.join(root, p));
      if (st.isFile() && st.size > MAX_BYTES) blocked.push(`${norm} (${Math.round(st.size / 1048576)} MB)`);
    } catch (_) {}
  }
  if (blocked.length) {
    const shown = blocked.slice(0, 5).join(', ') + (blocked.length > 5 ? `, +${blocked.length - 5} more` : '');
    fail(`${label}: NOT committed. Would have added files that look private or too large: ${shown}. Add them to .gitignore (or commit by hand), then push.`);
  }

  // 6. Commit.
  let committed = false;
  if (entries.length) {
    const add = git(root, ['add', '-A'], 30);
    if (!add.ok) fail(`${label}: git add failed: ${add.err}`);
    const host = os.hostname().split('.')[0];
    const commit = git(root, ['commit', '-m', `auto: session end (${host})`], 60);
    if (!commit.ok) fail(`${label}: commit failed (a pre-commit hook may have refused it): ${commit.err.slice(0, 300)}`);
    committed = true;
  }

  // 7. Catch up with the remote.
  const fetch = git(root, ['fetch', '--quiet'], 20);
  if (!fetch.ok && (fetch.signal || /signal \d+/.test(fetch.err))) quit(); // killed, not offline
  if (!fetch.ok) fail(`${label}: ${committed ? 'committed locally, ' : ''}not pushed, fetch failed (offline?): ${fetch.err.slice(0, 200)}`);
  const ahead = parseInt(git(root, ['rev-list', '--count', '@{u}..HEAD']).out || '0', 10);
  const behind = parseInt(git(root, ['rev-list', '--count', 'HEAD..@{u}']).out || '0', 10);
  if (ahead === 0) quit(); // nothing of ours to push
  if (behind > 0) {
    if (DEADLINE - Date.now() < 35000) fail(`${label}: committed locally, not pushed, out of time; push by hand.`);
    const rb = git(root, ['rebase', '@{u}'], 30);
    if (!rb.ok) {
      git(root, ['rebase', '--abort']);
      fail(`${label}: committed locally, NOT pushed. The other machine pushed changes that conflict. Run 'git pull --rebase' in ${root} and resolve.`);
    }
  }

  // 8. Push.
  if (DEADLINE - Date.now() < 10000) fail(`${label}: committed locally, not pushed, out of time; push by hand.`);
  const push = git(root, ['push', '--quiet'], 45);
  if (!push.ok) fail(`${label}: committed locally, NOT pushed: ${push.err.slice(0, 300)}`);
  log(OK_LOG, `${label}: pushed ${branch.out} (${ahead} commit${ahead === 1 ? '' : 's'})`);
}

try { main(); } catch (e) { fail(`unexpected error: ${e && e.message}`); }
