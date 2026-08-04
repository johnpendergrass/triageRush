triageRush self-contained mobile game
=====================================

This folder is an independently runnable HTML/CSS/JavaScript implementation of
the current triageRush game loop. It does not load files from the production
application, the Desktop demo, the HOME demo, or the repository-level patient
library at runtime.

Run it
------

Double-click start-mobile-preview.bat and open the address printed in the
window. The local-computer address is normally:

    http://localhost:8080

For an iPhone, use the printed network address while the phone and computer are
on the same Wi-Fi network. Keep the server window open. Stop it with Ctrl+C.
The preview server disables browser and proxy caching, so reloading the page
requests the current HTML, CSS, JavaScript, JSON, and image files.

Current game behavior
---------------------

- Loads private copies of all 160 schema 2.2 patient records and portraits.
- Uses private copies of the current game-page patient panel, 16 waiting-room
  backgrounds, room wall, and all 14 open/closed door images.
- Supports Triage and TriageRUSH shifts.
- Supports Strict and Forgiving evaluation.
- The game header shows color-coded Correct / Close / Wrong counts followed by
  the live score; Strict hides Close.
- Triage starts and remains at five queued patients and can run for five
  minutes or without a timer.
- Triage uses Correct +100, Close +50, and Wrong -50 without accelerated
  arrivals or a penalty for patients left waiting.
- TriageRUSH starts with two queued patients. The 60-second curve begins at
  10 seconds; the 120-second curve begins at 14.5 seconds. Both accelerate by
  one second per arrival to a one-second floor and stop adding patients when
  ten patients are waiting.
- RUSH can run for 60 or 120 seconds and uses the current provisional values:
  Correct +100, Close +50, Wrong -50, and each patient left waiting -10.
- The live RUSH score continuously includes the -10 penalty for every patient
  currently waiting, so a shift begins at -20 with its first two patients.
- Optional RUSH sounds provide a clock tick at shift start and every elapsed
  second, plus a bright chime at each scheduled arrival. Arrival alerts and
  interval acceleration continue even while the ten-patient queue is full.
- During the final five seconds, the clock plays a three-beat pattern on the
  second, quarter second, and half second, rests on the three-quarter second,
  and ends at zero with a low chime complementary to the patient-arrival ding.
- During the final ten seconds, large white countdown numbers pop into the
  upper third of the patient image and quickly fade in place.
- At ten waiting patients, the waiting-room panel gives a brief shake whenever
  a scheduled arrival would otherwise add another patient.
- Ordinary patients receive full credit only for their matching ESI room.
- Psych and Discharge patients receive full credit for the special destination
  or the underlying ESI room.
- Forgiving mode gives Close for an adjacent ESI room. Strict mode does not.
- Wrong and Close feedback marks only the selected door; the correct door is
  not revealed.
- A queued patient can move into an empty center panel or swap with an active,
  unassigned patient.
- The first assignment alone affects the shift totals and RUSH score.
- The open assigned room can recall the patient for another attempt.
- Selecting a new queued patient finalizes the previously assigned case.
- Presentation is available before assignment, while Answer remains locked.
- Coach unlocks after assignment and shows the complete patient explanation.
- Patient charts pause the timer and provide anchored Close plus conditional
  MORE ABOVE and MORE BELOW controls.
- Shift Review reports patients seen, assignment direction, patients waiting,
  and RUSH score. Every seen patient can be reopened in Patient Review.
- Shift Review expands each scoring category into count, point value, and
  subtotal, with under-triage and over-triage counts in a separate section.
- The Patients Seen link opens the existing full patient chart inside a review
  browser with previous, next, and close controls beneath the clipboard clamp.
- HOME opens shift settings. Applying gameplay changes to an active shift asks
  for restart confirmation.
- The sound button controls all synthesized sounds. RUSH sounds can be enabled
  before starting and begin from the Start Shift interaction.

The no-timer End Shift control is the SHIFT REVIEW button. The RUSH arrival
curve and numeric values remain intentionally provisional, as specified in the
current gameplay document.

Self-contained copies
---------------------

Runtime artwork is under assets/game-page/. Patient records and portraits are
under patient-data/. To resynchronize the demo after canonical content changes,
copy from:

    triageRush/assets/game-page/
    patient-data/patient-json/
    patient-data/patient-images/

The older assets/ subfolders and assets-legacy/ remain historical compatibility
copies. The current manifest does not load them.
