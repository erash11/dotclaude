---
name: project-practice-load-framework
description: Baylor football practice-load / "practice simulator" framework — color-coded day system + rep-count load model for fall camp
metadata:
  type: project
---

Baylor football **practice-load framework** (likely what Eric calls the **"practice simulator" project**) — a system to standardize and simulate practice load to manage athlete stress/injury and maintain availability into fall camp.

**Source meetings:** `PreSummer_Planning` (2026-05-22, with Dave Aranda + Vic Viloria) and `KSU_Planning_Brief_LYancy` (2026-05-26, K-State model via Lance Yancy).

**Core design:**
- Color-coded practice days: **blue / green / yellow / red** (red = max intensity, full pads, high physicality, ≤2 hrs). Eric + Vic Viloria define the template characteristics per color.
- **Rep-count progression** simulating game-week workload: start ~88 reps → ramp to ~180 over four days, then taper for games.
- **Speed-maintenance standard:** players must hit ~90% of top speed at least once every 10 min; Catapult-tracked (top speed + 14 mph efforts shared with players for accountability); failure → extra speed drills after practice.
- **Manual rep counting** by student staff post-practice → workload data within 20–30 min.
- **Lifting integration:** heavy lifts scheduled on high-volume (red/yellow) days to align stress, lighter days for recovery.
- Recovery-mandate options under consideration (staffed facility monitoring, scheduled access windows, or trainer-led sessions); Vic + Eric to decide which modalities (massage, cold tub, foam rolling, Normatec, soft tissue) are mandatory.

**Owners:** Eric Rash + Vic Viloria (templates, recovery); Dave Aranda (final sign-off / Baylor-specific adaptation of the K-State model); Lance Yancy + Coach Klenderman (K-State source / scripting guardrails).

**Status (updated from FaceComps repo activity through 2026-06-16):** framework finalized ahead of the "last week of June" deadline — the 2nd planning meeting recs converged into a **locked plan of record (6/15): 14-day install structure (3/3/4/4) at Moderate ramp**, plus locked mock-game rules and NCAA acclimatization constraints. See [[project-facecomps-practice-simulator]] for the full decision log. No FaceComps commits since 6/16 as of this check — next deliverable is the day-by-day color/quality templates; worth a status check-in before fall camp (Aug 5 start) if it's been quiet.

**Implementation:** this framework is built in the **FaceComps repo / load simulator** — see [[project-facecomps-practice-simulator]] (the meeting decisions above are the spec; the simulator + planning-layer grill is the build).

Related: [[project-ai-integration-initiative]] (Catapult/data tooling).
