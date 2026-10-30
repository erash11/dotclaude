---
name: m365-agent-access
description: "What Baylor's M365 tenant lets the agent do (Graph read yes, Teams send needs IT admin), and why the 10-03 Windows PowerShell Graph/COM route is retired; no Mac Graph/Teams route yet"
metadata:
  node_type: memory
  type: project
  originSessionId: 6a709501-394d-4811-8fbb-8fec24f5d7dd
  modified: 2026-10-30T22:39:19.024Z
---

**Superseded 2026-10-24: the Windows route below is retired.** The laptop has had no
terminal work or jobs since 2026-10-14 and runs desktop-app sessions only since 2026-10-21
([[work-laptop-hands-off]]). So no PowerShell, Graph module or COM from an agent there, and
the webhook NEXT step below is dropped (no record it was done). What still holds is the
tenant side: Graph delegated read was allowed, Teams send scopes need IT admin. On the Mac:
use the docx/pptx/xlsx skills for files. Office has no COM. PowerPoint can be driven through
osascript: Eric granted the Automation permission on 2026-10-24 (five-slides-generator Step 6).
The error 'Not authorized to send Apple events' means it was turned off. There is no record of a Graph
or Teams route on the Mac. Any secret for one (a webhook URL) goes in the Keychain.

**Mac Office export trap (2026-10-24 PowerPoint, 2026-10-29 Word).** Word and PowerPoint are sandboxed. When a script makes them save to a folder outside their container, they stall behind a hidden permission dialog. Word froze twice on 10-29 and needed a force-quit. Fix: export into the app's own folder, then move the file out with the shell:
`~/Library/Containers/com.microsoft.Word/Data/tmp/` or `~/Library/Containers/com.microsoft.Powerpoint/Data/tmp/` (five-slides-generator Step 6 uses the PowerPoint one).

Verified 2026-10-03 on the Baylor Windows laptop. Eric ran the tests himself; all passed.

- **Microsoft Graph (delegated) works.** `Install-Module Microsoft.Graph.Authentication -Scope CurrentUser`, then `Connect-MgGraph -Scopes "User.Read","Mail.Read","Calendars.Read","Chat.Read"`. Baylor allowed the consent (unlike the Box connector, see [[box-access-via-box-drive]]). `/me`, `/me/messages` and `/me/chats` returned data via `Invoke-MgGraphRequest`. Teams write scopes (ChatMessage.Send, ChannelMessage.Send) are BLOCKED: sign-in asks for Baylor IT admin approval (tested 2026-10-03). Mail.Send and Calendars.ReadWrite are untested.
- **Office COM works from PowerShell** (FullLanguage mode, no admin): Excel, Word, PowerPoint, and classic Outlook (`Outlook.Application`, inbox read without a security prompt).
- New Outlook and new Teams are installed too. Neither has COM: Teams goes through Graph, and so would new Outlook mail.
- Teams posting workaround: a Teams Workflows webhook on a channel (posts as a bot). Eric created a private Team by hand 2026-10-03. NEXT: add the Workflows webhook to its channel, save the URL as the `TEAMS_WEBHOOK_URL` user env var (never in chat or a repo), then write a posting script and send one test message.
- CLI-Anything (HKUDS) was reviewed and rejected for this: it targets open-source apps, and these are closed-source.

**Why:** Saves re-testing access each session; Graph sign-in is interactive (browser), so the agent can't silently re-verify it.
**How to apply:** For file edits use the docx/pptx/xlsx skills. The COM and PowerShell Graph steps above were Windows-only (historical, see the top). A Mac Graph or Teams route would need a fresh test; Graph sign-in is interactive, so Eric signs in in the browser. Ask before adding any send scope.
