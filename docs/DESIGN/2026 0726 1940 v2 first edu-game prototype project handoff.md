# triageRush v2 — First Edu-Game Prototype Project Handoff

**Recorded:** 2026-07-26 19:40 PDT

**Repository branch:** `main`

**Version snapshot:** `v2` — First try at the game/edu app

**Status:** Revised concept is the main development path; interactive design
prototype exists; production implementation and clinical rule migration have
not begun.

## Why this document exists

This is the comprehensive state-of-project handoff for the first revised
triageRush edu-game prototype. It records:

- What changed after the original concept.
- Which design and gameplay decisions are current.
- What the interactive prototype demonstrates.
- Which parts are provisional or deliberately incomplete.
- Where the authoritative files and artwork live.
- What a future developer or design session needs to know before continuing.

The canonical rules are still the subject-owning documents under
`docs/singleSourceOfTruth/`. This note provides the narrative and technical
context tying those documents, the selected artwork, and the prototype
together.

## Version history and repository direction

- `main` is the official path forward for the revised triageRush concept.
- Git tag `v1` preserves the original five-room concept.
- The original canonical documents are archived under
  `docs/archive/v1-original-concept-single-source-of-truth/`.
- Git tag `v2` marks the first substantial seven-choice Game/Edu design
  snapshot and the first interactive throwaway prototype.
- A second repository or fork is not currently planned. The old concept remains
  recoverable through `v1`, while continued work proceeds on `main`.

The repository still contains three application areas:

- `patientsCRUD-app/`
- `patientsBrowser-app/`
- `triageRush-app/`

Only the patient CRUD/data area currently contains substantial operational
source data. The revised playable application has not yet been implemented in
`triageRush-app/`. The current interactive work is intentionally isolated in
`docs/DESIGN/testApp/`.

## Change in product direction

triageRush is primarily a game with serious and realistic medical content. The
new direction is a hybrid edu-game that preserves quick decisions and pressure
while more directly teaching the distinctions among all five ESI levels.

The archived v1 interface consolidated:

- ESI 2 and ESI 3 into one Acute room.
- ESI 4 and ESI 5 into one Fast Track room.

Those consolidations are no longer the target. The revised design uses seven
selectable treatment classifications:

1. ESI 1 — Resuscitation (`RESUS`)
2. ESI 2 — Emergent
3. ESI 3 — Urgent
4. ESI 4 — Less Urgent
5. ESI 5 — Non-Urgent
6. Psych
7. Discharge

The project continues to call these choices “rooms” or “doors” because that is
an appealing and useful game metaphor. ESI levels are not being represented as
literal hospital destinations; the doors represent how the patient should be
classified and treated. Psych and Discharge remain special pathways and are not
ESI levels 6 and 7.

## Current decision and feedback loop

The working interaction is:

1. The player selects a patient from the triage queue.
2. The player reviews the image, complaint, quote, vitals, and triage comment.
3. The player taps one of seven treatment doors.
4. The choice is committed and immediately evaluated.
5. The selected door opens and receives audiovisual result feedback.
6. Coach becomes available only after the choice.
7. The patient panel clears.
8. The player may select a new queue patient or recall the assigned patient by
   tapping the still-open room.

Immediate feedback currently uses four outcomes:

| Outcome | Selected door | Intended door | Sound |
|---|---|---|---|
| Correct | Green pulse | Same door | Quick ding |
| Acceptable | Cyan positive pulse | Light-green pulse | Positive two-tone |
| Close | Orange pulse | Light-green pulse | Dong |
| Wrong | Red pulse | Light-green pulse | Buzz |

Text and symbols accompany the colors and sounds so the result does not depend
on color or audio alone.

## Current Psych and Discharge evaluation

The final patient-specific evaluation table has not been authored. The
prototype uses this temporary rule:

- Choosing Psych for an intended Psych patient is Correct.
- Choosing Discharge for an intended Discharge patient is Correct.
- For either special-pathway patient, choosing the patient's underlying ESI
  level or an adjacent ESI level is Acceptable.
- Other selections are Wrong.

Acceptable is distinct from Close. It communicates that the numbered ESI
placement can be reasonable even though the named special pathway remains the
intended answer.

A future configurable Loose/Strict evaluation option is under consideration.
No such setting exists in the prototype.

## Game and Edu modes

### Game mode

The prototype has:

- A continuously running 60-second timer.
- Numeric scoring.
- Correct: provisional `+100`.
- Acceptable: provisional `+35`.
- Close: provisional `+35`.
- Wrong: provisional `-50`.
- Immediate feedback and post-decision Coach access.

These values are experiments, not approved production scoring.

### Edu mode

The prototype has:

- No active countdown pressure.
- No numeric point score.
- Correct / Acceptable / Close / Wrong tallies.
- Immediate feedback.
- Post-decision Coach access.
- Player-controlled pacing and the same recall/retry mechanic.

Session history, end-of-session review, final round structure, and arrival
pressure remain open design work.

## First-assignment scoring and patient recall

After any assignment, the selected room remains open and the patient panel is
empty. A compact left arrow straddles the room/patient-panel boundary to hint
that the patient can be recalled.

Tapping the still-open assigned room:

- Closes the room.
- Restores that patient and all evidence to the center panel.
- Locks Coach until another assignment is made.
- Allows the player to try another room.

The active patient has a `previouslyAssigned` Boolean:

- It begins `false` when a patient is selected from the queue.
- The first assignment records Game points or an Edu tally and sets it `true`.
- Recall and reassignment do not reset it.
- Later attempts still receive full feedback and Coach access but do not
  change the score or tallies.
- Selecting a queue patient resets it for the newly active patient.

This prevents an ordinary retry from being scored repeatedly. A deliberately
discovered sequence of queue swaps can eventually return a prior patient as a
newly selected queue patient and make that patient scoreable again. This
emergent “cheat trick” was discussed and is currently acceptable as a
player-integrity/easter-egg behavior rather than something to prevent.

## Triage queue behavior and current UI

The queue currently contains five equal slots. Browser refresh and Reset Round
start with:

- Five occupied queue cells.
- An empty patient panel.

When the patient panel is empty:

- Each queue cell shows a static right arrow.
- Selecting a patient moves that patient to the panel.
- Patients below the selected slot compact upward.
- A new random patient enters the bottom slot, slot 5.

When the patient panel contains an unassigned patient:

- Each queue cell shows a static double-ended arrow.
- Selecting a queue patient performs a true in-place swap.
- The active patient takes the exact selected queue position.
- The rest of the queue is not reordered.

The earlier queue numbers and `WAITING` plaque were removed.

### Queue artwork layering

Each occupied queue cell is rendered back to front:

1. One of 16 selected waiting-room background images.
2. The queued patient's transparent PNG.
3. The institutional frame, complaint label, and transfer-arrow overlays.

The random waiting-room background is stored with the queue entry, not chosen
again during rendering. It therefore remains with that patient through:

- Redraws.
- Queue compaction.
- Movement into the patient panel.
- In-place queue/patient swaps.

New arrivals receive a new random background. The current code avoids duplicate
visible backgrounds when alternatives are available.

The queue panel uses the same wall texture as the door rail. Its cell borders
use the same subdued blue-gray as the horizontal wall runners while retaining
the approved inset highlights and dimensional shading.

Several queue-patient scaling experiments were tried. Smaller contained images
showed more of the feet but made patients look too small or as if they floated
above the floor. The current `v2` state intentionally restores the original
larger queue-patient crop and positioning. This may be revisited later with
per-image framing or artwork-aware placement.

## Patient panel state

The center panel currently shows:

- Patient name and demographic.
- Full transparent patient image.
- Complaint strip.
- Patient quote.
- Six vital signs.
- Triage presentation/comment.

The current patient positioning has been restored to its earlier prototype
state. In some cases the complaint strip may overlap the patient's feet. An
attempt to constrain the image above the strip made the composition worse and
was rolled back. Treat this as a known visual TODO, not an accidental
regression.

The player can choose or swap a queue patient even while a patient is already
in the panel.

## Coach card

Coach is locked until the player makes an actual room choice. It then presents
a compact case review containing:

1. Small patient image.
2. Name and demographic.
3. Complaint.
4. Quote.
5. Vitals.
6. Triage comment.
7. Player choice and intended choice.
8. Correct / Acceptable / Close / Wrong result.
9. Current suggestion or explanation.

The Coach overlay:

- Is fixed inside the viewport.
- Uses approximately 82 percent of the available overlay height.
- Scrolls only its internal case-review content.
- Keeps Close fixed at the upper-right.
- Shows a bouncing `MORE BELOW` arrow when more content is available.
- Hides that indicator when the bottom is reached.
- Allows the indicator itself to advance the scroll.

Some Coach explanation text is prototype-authored JavaScript data. It is not a
clinically reviewed production rationale. Final Coach content should be stored
with reviewed patient data rather than improvised at runtime.

## Room hover / mobile hold education

“Hover” is used as a cross-device project term:

- Desktop: mouse pointer hover.
- Keyboard: focus.
- Mobile: press and hold for about 500 milliseconds.

Hover displays a short, general definition of the room and ESI level. It does
not evaluate the active patient or reveal the correct answer. A completed
mobile hold suppresses the placement tap so reading a definition cannot
accidentally assign the patient.

## Seven-door artwork progress

The door rail uses seven equal cells. The current visual direction was refined
through the timestamped `2026 0726a` through `2026 0726zm` images in
`docs/DESIGN/REFINING IMAGES/`.

Important current artwork decisions:

- Seven equal outer door cells.
- ESI 1–5 doors use continuous slabs without a vertical seam.
- No `IN USE` lights.
- Clean base doors contain no baked-in ESI or treatment labels.
- ESI 4 uses a subdued violet/purple door rather than green, avoiding a
  misleading “safe/okay” association.
- Psych uses a warmer, more inviting walnut professional-office door.
- Discharge remains the glass double-door exception leading outside.
- Door-cell walls use warm institutional plaster with subdued blue-gray
  runners and a darker base separator.
- Closed and corresponding halfway-open door states exist for all seven
  choices.

Selected, forward-looking artwork is stored in:

`docs/DESIGN/SELECTED ARTWORK/`

The folder was moved from under `REFINING IMAGES` so selected work is clearly
separated from the broader iteration history.

### Open-room patient composite limitation

The prototype does not show an assigned patient standing inside the opened
room. The present open-door PNGs combine:

- Room interior.
- Medical equipment.
- Open door and frame.

Because those are one bitmap, a patient cannot be correctly composited between
the equipment and foreground door. Future artwork must separate:

1. Wall background.
2. Room interior and equipment.
3. Transparent patient.
4. Door/frame/foreground.
5. Labels and feedback overlays.

That feature remains documented as a TODO and was intentionally removed from
the prototype.

## Mobile viewport work

The demo is designed around a 9:16 game shell and has been tested informally on
an iPhone 16 Pro.

A reversible mobile safe-viewport experiment:

- Uses `100svh` where supported.
- Accounts for safe-area insets.
- Keeps the complete app above expanded Safari/browser controls.
- May make the shell slightly smaller while browser chrome is expanded.

This approach was judged substantially better during mobile review and remains
enabled. The original sizing declarations remain directly above the labeled
experimental CSS block so it can be removed cleanly if another approach is
later preferred.

## How to run the prototype

The prototype is a self-contained static HTML/CSS/JavaScript demo:

`docs/DESIGN/testApp/`

Desktop:

1. Double-click `docs/DESIGN/testApp/start-iphone-preview.bat`.
2. Open `http://localhost:8080`.

iPhone:

1. Put the computer and iPhone on the same Wi-Fi network.
2. Run `start-iphone-preview.bat`.
3. Keep the server window open.
4. Open the printed local-network address in Safari.

No external API key is required. The previously discussed API key no longer
exists and the prototype does not depend on it.

## Patient data status

The operational patient library remains under:

- Schema: `patientsCRUD-app/patient-data/docs/patient-schema.json`
- JSON: `patientsCRUD-app/patient-data/patient-json/`
- Images: `patientsCRUD-app/patient-data/patient-images/`
- Anchor images: `patientsCRUD-app/patient-data/anchorImages/`

The library contains 160 patient records and 160 primary patient images.

The existing exact ESI 1–5 values, patient evidence, demographics, and images
remain valuable. The old `answer.correctRoom` and
`answer.otherAcceptableRooms` fields encode the archived five-room model and
are not yet the final seven-choice answer contract.

Do not bulk-migrate the patient records until the project approves:

- Exact Correct/Acceptable/Close/Wrong rules.
- Dangerous under-triage handling.
- Patient-specific Psych and Discharge alternatives.
- Final Coach rationale structure.
- Revised answer schema and migration process.

The prototype uses a small hand-authored subset of patients in `app.js`; it is
not reading or mutating the operational 160-record library.

## Prototype versus production

The current demo proves interaction and visual ideas. It is not the production
application.

Current prototype files:

- `docs/DESIGN/testApp/index.html`
- `docs/DESIGN/testApp/styles.css`
- `docs/DESIGN/testApp/app.js`
- `docs/DESIGN/testApp/assets/`
- `docs/DESIGN/testApp/README.txt`

Production status:

- Root `index.html` remains empty.
- `triageRush-app/` has not been rebuilt for the revised concept.
- There is no production build pipeline or deployment.
- No final clinical evaluation table exists.
- No approved revised patient schema exists.
- No production analytics, persistence, accessibility audit, automated test
  suite, or release process exists.

Do not promote prototype constants, Coach wording, scoring, or patient answers
to production simply because they are executable.

## Authoritative documentation map

Start here:

- `docs/singleSourceOfTruth/README.md`

Subject owners:

- Gameplay: `docs/singleSourceOfTruth/gameplay-rules.md`
- Interface: `docs/singleSourceOfTruth/interface-and-layout.md`
- Patient data: `docs/singleSourceOfTruth/patient-data.md`
- Implementation status: `docs/singleSourceOfTruth/implementation-status.md`

Historical v1 rules:

- `docs/archive/v1-original-concept-single-source-of-truth/`

Design discussion and iterations:

- `docs/DESIGN/`

Selected artwork:

- `docs/DESIGN/SELECTED ARTWORK/`

Interactive throwaway demo:

- `docs/DESIGN/testApp/`

## Important unresolved decisions

Before production data migration or scoring implementation, resolve:

1. Whether all one-level ESI differences are Close.
2. Whether dangerous under-triage is Wrong even when only one level away.
3. Whether the player-facing term remains Close or becomes Near Miss.
4. The reviewed Psych/Discharge Acceptable table.
5. Loose versus Strict evaluation, if offered.
6. Final Game scoring and penalties.
7. Round duration, arrival pressure, queue length changes, and pacing.
8. Whether Coach pauses the Game timer.
9. Whether Coach use marks a run as assisted.
10. End-of-round and case-review behavior.
11. Production patient schema and Coach rationale fields.
12. Final patient-panel and queue-image framing.
13. Separated open-room artwork for patient compositing.

## Recommended continuation sequence

1. Treat this `v2` snapshot as the visual/interaction reference, not the final
   production contract.
2. Review and approve the exact outcome/evaluation table.
3. Decide final Game scoring, timing, and round rules.
4. Define the revised patient answer and Coach schema.
5. Clinically review and migrate the 160-patient library.
6. Decide whether to retain or rebuild the static prototype structure inside
   `triageRush-app/`.
7. Separate open-room artwork into compositing layers if the in-room patient
   effect remains desired.
8. Resolve the known patient-panel complaint/feet overlap and artwork-aware
   queue framing.
9. Add production accessibility, automated behavioral tests, and mobile
   viewport testing.
10. Build the revised application in the production app folder.

## v2 snapshot meaning

`v2` should be understood as:

> First try at the seven-choice triageRush Game/Edu app: revised gameplay
> direction, selected seven-door artwork, mobile-oriented interactive demo,
> queue/recall/Coach mechanics, and transition documentation.

It is a meaningful design and prototype milestone, not a claim of a completed
or clinically validated second production release.
