---
name: github-identity
description: Eric has two GitHub accounts; eric.rash11@gmail.com is the verified email on erash11 (which owns FaceComps and matches Vercel)
type: user
originSessionId: 2780ff32-7bee-4e10-a90c-d6239c3c4e1e
---
Eric uses **`erash11`** as his primary GitHub account — it owns `github.com/erash11/FaceComps` and is the identity linked to his Vercel account (also named `erash11`).

There is a secondary account, **`111ragnarok111`**, that previously had `eric.rash11@gmail.com` as a verified email. As of 2026-05-08, the email was moved off `111ragnarok111` and onto `erash11`, so commits authored with `eric.rash11@gmail.com` now correctly resolve to `erash11`.

**Why this matters:** Vercel's Hobby plan blocks deploys when the GitHub commit author isn't a recognized project contributor. Before the email move, every push from this machine got blocked because GitHub attributed commits to `111ragnarok111`. Diagnosing this consumed a session. If a future Vercel deploy block reappears with "commit author did not have contributing access," check first whether the email mapping has slipped back, before assuming a Vercel bug.

**How to apply:** Local git config is `Eric Rash <eric.rash11@gmail.com>` and that should resolve to `erash11` on GitHub. If the user mentions a "ragnarok" account, that's the old/secondary one — don't confuse it with the primary.
