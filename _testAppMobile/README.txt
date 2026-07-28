triageRush mobile interactive design mockup
===========================================

This is a disposable, self-contained HTML/CSS/JavaScript mockup. It does not
change or depend on the production triageRush application, shared patient
library, or standalone CRUD pipeline.

This folder is exclusively for the mobile pre-production test app. Do not
share code or runtime assets directly with _testAppDesktop. Each test app must
remain independently runnable and self-contained.

Quick desktop preview
---------------------

Double-click start-mobile-preview.bat, then open:

    http://localhost:8080

iPhone preview
--------------

1. Connect the iPhone and this computer to the same Wi-Fi network.
2. Double-click start-mobile-preview.bat.
3. Keep the black server window open.
4. The window prints an iPhone address such as:

       http://192.168.1.25:8080

5. Enter that exact address in Safari on the iPhone.
6. If Windows Firewall asks, allow Python on Private networks only.

Stop the server by closing its window or pressing Ctrl+C.

The current reversible sizing experiment uses the smallest mobile-browser
viewport and safe-area insets so the complete 9:16 game remains above visible
browser controls. It may render slightly smaller while those controls are
expanded. To restore the earlier sizing for comparison, remove only the clearly
marked "REVERSIBLE MOBILE SAFE-VIEWPORT EXPERIMENT" block in styles.css.

What is interactive
-------------------

- Tap a waiting-room portrait to make that person the active patient.
- Browser refresh and Reset Round start with an empty patient panel and five
  patients in the five compact queue slots.
- Each queued patient receives one of the 16 selected waiting-room backgrounds.
  The background is stored with that queued patient and survives redraws,
  compaction, and patient-panel swaps.
- Queue numbering and the WAITING plaque are intentionally omitted.
- A small static translucent `→` marker means the patient can move into an
  empty patient panel. A static `↔` marker means selecting that patient swaps
  them with the active patient in that exact queue cell.
- Selecting a queue patient while the panel is empty removes that patient,
  shifts every lower queue patient upward, and appends a fresh patient from the
  patient store to the fifth slot.
- Tap a treatment door to commit the choice and open the door.
- On a computer, hover over a room to see its simple definition.
- On a phone, press and hold a room for about half a second to see the same
  definition; releasing closes it and does not commit the room choice.
- Keyboard focus also displays the room definition.
- After assigning a room, tap that still-open room to recall the same patient
  into the patient panel. The door closes and the patient can be assigned
  again.
- While recall is available, a matching compact static left arrow straddles
  the assigned room/patient-panel boundary at the center of that room row.
- Correct, Acceptable, Close, and Wrong choices produce labeled feedback with
  distinct pulses and sounds.
- The intended room also pulses light green after an Acceptable, Close, or
  Wrong choice.
- In either mode, assigning a room removes the patient from the center panel
  and displays the brief result.
- Only the patient's first assignment affects Game points or Edu tallies.
  Recalled attempts still receive normal feedback and Coach access.
- The triage queue remains selectable while a patient is in the center. That
  action swaps the current unassigned patient back into the selected queue
  position.
- Selecting a queued patient after an assignment finalizes the assigned case;
  that patient is not returned to the queue.
- Coach remains locked until a door choice has been made. Once unlocked, its
  case-review card includes the patient image and identity, complaint, quote,
  vitals, triage comment, placement comparison, result, and explanation.
- When the Coach card has more content below the visible area, a bouncing
  MORE BELOW arrow appears at its lower edge. It disappears at the bottom and
  can also be tapped to scroll forward.
- The Coach window uses 82 percent of the overlay's available height. It grows
  upward while retaining its established lower edge for a more balanced mobile
  composition. Close remains fixed at the upper-right while only the case
  content scrolls.
- Game mode shows a timer and numeric prototype score.
- Edu mode shows Correct / Acceptable / Close / Wrong tallies.
- The disabled footer control reminds you to select or switch patients from
  the left triage queue.
- Reset Round clears the score and selects a new random patient.
- The music-note button mutes or unmutes feedback sounds.

Prototype limitations
---------------------

For Psych and Discharge patients, the named special destination is Correct. A
numbered ESI assignment matching the patient's underlying ESI or differing by
one level is Acceptable. The demo temporarily scores Acceptable the same as
Close. Exact scoring values, the detailed evaluation table, Coach wording, and
room labels remain provisional and require clinical and design review.

Showing the assigned patient inside an open room is intentionally not included.
The current open-room PNG files combine the medical equipment and open door in
one bitmap. That feature requires separate interior and foreground-door assets
before the patient can be composited at the correct depth.
