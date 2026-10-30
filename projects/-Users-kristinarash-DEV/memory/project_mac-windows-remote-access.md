---
name: mac-windows-remote-access
description: "How Eric remotes between the Mac and the Baylor Windows laptop: Windows App (RDP over Tailscale) one way, Chrome Remote Desktop the other; Mac kept awake on AC"
metadata:
  type: project
---

Tailscale tailnet (erash11): Mac kristinas-macbook 100.72.40.38; Baylor Windows laptop bu-1979fj4 100.105.192.65 (link goes via DERP relay dfw, not direct). Mac CLI: /usr/local/bin/tailscale (app wrapper script). Mac->Windows uses Windows App RDP to 100.105.192.65; Remote Desktop was turned on in Windows Settings (port 3389 open). Windows->Mac uses Chrome Remote Desktop, browser-only on Windows; Mac host at /Library/PrivilegedHelperTools/ChromeRemoteDesktopHost.app needs Accessibility + Screen Recording. Mac Screen Sharing (VNC 5900) is off and unused. Mac kept awake on power: pmset -c sleep 0 (the Battery > Options 'prevent automatic sleeping' switch did not persist). Lid must stay open. See [[work-laptop-hands-off]], [[path-shadowing-and-cleanup]].

**Why:** Set up 2026-10-30. RealVNC Viewer is no longer free (account + trial), and installing a CRD host on the Baylor laptop needs admin rights IT may block; RDP is built into Windows.

**How to apply:** Mac->Windows: Windows App (brew cask windows-app 11.4.4; the App Store Install button did not show) -> PC 100.105.192.65, Baylor login. Windows->Mac: remotedesktop.google.com/access in a browser, Mac host signed in as eric.rash11@gmail.com, PIN. If the Mac cannot be reached, check pmset -g custom shows AC sleep 0. Undo: sudo pmset -c sleep 1. Sudo from a session: osascript 'do shell script ... with administrator privileges' shows a GUI password box; a bare sudo the user was told to run did not take.
