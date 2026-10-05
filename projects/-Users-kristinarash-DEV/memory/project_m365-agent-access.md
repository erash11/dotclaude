---
name: m365-agent-access
description: "How the agent reaches Teams, Outlook, Excel, Word and PowerPoint on the Baylor Windows laptop (Graph + Office COM, both verified, no admin)"
metadata:
  node_type: memory
  type: project
  originSessionId: 6a709501-394d-4811-8fbb-8fec24f5d7dd
  modified: 2026-10-03T14:25:35.786Z
---

Verified 2026-10-03 on the Baylor Windows laptop. Eric ran the tests himself; all passed.

- **Microsoft Graph (delegated) works.** `Install-Module Microsoft.Graph.Authentication -Scope CurrentUser`, then `Connect-MgGraph -Scopes "User.Read","Mail.Read","Calendars.Read","Chat.Read"`. Baylor allowed the consent (unlike the Box connector, see [[box-access-via-box-drive]]). `/me`, `/me/messages` and `/me/chats` returned data via `Invoke-MgGraphRequest`. Teams write scopes (ChatMessage.Send, ChannelMessage.Send) are BLOCKED: sign-in asks for Baylor IT admin approval (tested 2026-10-03). Mail.Send and Calendars.ReadWrite are untested.
- **Office COM works from PowerShell** (FullLanguage mode, no admin): Excel, Word, PowerPoint, and classic Outlook (`Outlook.Application`, inbox read without a security prompt).
- New Outlook and new Teams are installed too. Neither has COM: Teams goes through Graph, and so would new Outlook mail.
- Teams posting workaround: a Teams Workflows webhook on a channel (posts as a bot). Eric created a private Team by hand 2026-10-03. NEXT: add the Workflows webhook to its channel, save the URL as the `TEAMS_WEBHOOK_URL` user env var (never in chat or a repo), then write a posting script and send one test message.
- CLI-Anything (HKUDS) was reviewed and rejected for this: it targets open-source apps, and these are closed-source.

**Why:** Saves re-testing access each session; Graph sign-in is interactive (browser), so the agent can't silently re-verify it.
**How to apply:** For file edits use the docx/pptx/xlsx skills; for app actions (recalc, PDF export, mail, calendar) use COM; for Teams use Graph. Graph needs Eric to sign in in the browser at the start of a session; ask before adding any send scope.
