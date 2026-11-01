---
name: catapult-not-health-data
description: "Catapult GPS/tracking data is not health data; only medical/injury records (AMS injury attachments, Dexa) are"
metadata:
  type: feedback
---

Catapult GPS and tracking data (exports, session reports, OpenField files, vendor white papers) is performance data, not health data. The health-data rules apply to medical and injury records, not to a file because it came from Catapult. Related: [[jev-health-data-it-approval]].

**Why:** Eric, 2026-10-31: 'catapult data is not health data', after I excluded 05_SYSTEMS/Catapult_GPS/From_Desktop_CATAPULT from a Drive rename as a health flag.

**How to apply:** Handle Catapult GPS exports, reports and white papers like any other performance data. Health rules (DexaProject, Jev gating, local-only) stay for medical and injury records, e.g. the AMS injury attachments moved 10-31 to 10_ARCHIVE/Health_and_Wellness/From_Desktop_Catapult_AMS_Baylor with Eric's yes.
