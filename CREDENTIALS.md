# CREDENTIALS.md — key inventory for machine restore

**This file contains NO secret values and must never contain any.** It records *which*
keys each project needs and *where to reissue them*, so a restored machine can be made
functional without guesswork. Values live in your password manager and in the issuing
service's console — nowhere else, by design.

Generated 2026-08-03 by reading key names from `.env` / `.env.example` files. Tracked in
`dotclaude`; mirrored to the SSD.

> **Why this exists.** Every backup correctly excludes credentials. The consequence, found
> during the 2026-08-03 migration audit, is that a perfect restore produces code that
> cannot run and no record of what is missing. This is that record.

## Restore order

Do these in the order you need them, not all at once. Items 1–3 unblock the daily cadence;
the rest can wait until you next touch that project.

| # | Project | File to create | Keys | Reissue from |
|---|---|---|---|---|
| 1 | `morning-briefing` | `secrets/gmail_credentials.json` | OAuth client JSON (download whole file) | Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs |
| 2 | `morning-briefing` | `secrets/gmail_token.json` | generated, not copied | Run the reauth script; it writes this file. **Do not restore from backup** — tokens expire |
| 3 | `DataBase_GPS_Reporting/gps_report` | `.env` | `CATAPULT_TOKEN` | Catapult OpenField → account settings → API token |
| 4 | `ForcePlate_DecisionSystem` | `.env` | `VALD_CLIENT_ID`, `VALD_CLIENT_SECRET`, `VALD_REGION_URL`, `VALD_TEAM_ID` | VALD Hub → API access. Region URL is tenant-specific — copy exactly |
| 5 | `Football/PFF_Data_Project` | `.env` | `PFF_BASE_URL`, `PFF_API_KEY`, `BAYLOR_TEAM_ID` | PFF Ultimate account rep. **Institutional — tied to Baylor's contract** |
| 6 | `PlayerProfiles_FB_03-28-2026` | `.env` | `PERCH_API_TOKEN` | Perch dashboard → integrations |
| 7 | `reMarkale_extract` | `.env` | `GOOGLE_VISION_API_KEY`, `GOOGLE_CLOUD_PROJECT` | Google Cloud Console → Vision API |
| 8 | `Football/FaceComps/simulator` | `.env.local` | `DATABASE_URL`, `SITE_PASSWORD`, `COOKIE_SECRET`, `CATAPULT_TOKEN` | Supabase → project settings → database. `COOKIE_SECRET` is self-generated (`openssl rand -hex 32`) |
| 9 | `CFB_Victory_Model` | `.env` | `CFBD_API_KEY` | collegefootballdata.com → free API key |
| 10 | `KeystoneOS/zotero-photo-capture` | `.env` | `ZOTERO_API_KEY`, `ZOTERO_USER_ID`, `ANTHROPIC_API_KEY`, `CROSSREF_MAILTO` | Zotero → Settings → Feeds/API. `CROSSREF_MAILTO` is just your email |

## OAuth connectors — no files, re-auth in the app

These re-authenticate through a browser prompt on first use. Nothing to restore, but
expect to sign in to each once:

Fireflies · Google Drive · Gmail · Google Calendar · Microsoft 365 (Baylor) · Supabase ·
Vercel · Zotero · reMarkable · Anthropic (Claude Code) · OpenAI (Codex) · GitHub (`gh auth login`)

## Which of these survive leaving Baylor

| Survives | Does not |
|---|---|
| CFBD, Zotero, Anthropic, OpenAI, GitHub, Google (personal), reMarkable, Supabase, Vercel | PFF (Baylor contract), Catapult (Baylor tenant), VALD (Baylor tenant), Perch (Baylor tenant), Microsoft 365 |

Institutional keys stop working when the contract or your account does. That is expected
and correct — do not attempt to preserve them. The *code* that uses them is yours; the
*access* is Baylor's.

## Known live issue

**2026-08-03 — Outlook auth for `morning-briefing` is expired.** The 08:19 brief sent with
0 email threads. Reauthenticate rather than carrying this into the migration:

```powershell
& "$env:USERPROFILE\Desktop\DEV\morning-briefing\scripts\reauth.bat"
```

On macOS this script needs porting to `.sh` — see `MIGRATION-MACOS.md` Step 8.

## Rules

1. **Never** commit a value to this file or any repo. `.env` files stay gitignored.
2. When you add a project that needs a key, add a row here in the same session.
3. `gmail_token.json` and any other *generated* token is regenerated, never restored — a
   restored token is usually already expired and fails confusingly.
4. If a key leaks, rotate it at the issuing service first, then update your password
   manager. This file needs no change; it names keys, not values.
