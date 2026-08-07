# triageRush — TODO list

Standing list of approved future work, in John's own words, so nothing is
forgotten between sessions. Add new items at the bottom with the date; when
an item is built, move it to the DONE section at the end with the build date.

## 1. Per-game patient queue of 50 (added 2026-08-06)

Redo the patient loading so that a per-game patient queue of 50 patients is
created per game. That group is taken randomly from the 160-patient store.

If the patients run out during game play:

- the waiting room stays empty; and
- a message appears in the patient panel (presuming that panel is also
  blank): "No more patients available. Please review your shift."

The point: an APPROVED way of exiting the shift if patients run out.

The next game (from the ER ENTRANCE) draws a NEW set of 50, randomly drawn
from the 160 — unless there is an easy way to take the next group from the
unused patient store (open question).

Notes (Claude):

- This is NOT the abandoned finite-pool redesign of 2026-08-05: no win
  state, no score ceiling, no grade, no waiting-room fault. It is a loading
  policy plus a graceful exhaustion exit.
- Today the deck reshuffles when exhausted (doc 3 queue rules), so patients
  are effectively infinite; this item replaces that reshuffle with the
  exhaustion message.
- Synergy (John, 2026-08-06): this should mean we do NOT load all 160
  patient images up front — wait until they are actually called for. The
  per-shift portrait reserve (topUpPortraitReserve) already does exactly
  this pattern for upcoming draws, so the rework is mostly about removing
  the startup verification of all 160 JSONs + images and fetching only the
  game's 50 (seed portraits block READY as today; the rest trickle in
  during play). Treat this item and the asset-loading-strategy todo as ONE
  design conversation at Phase 10 planning.

## 3. Fix up the settings blackboards (added 2026-08-06) — BIG ITEM

Really need to fix up the settings blackboards when expanded — the text and
the operation of the settings.

Reclassified as a BIG item (John, 2026-08-06): this is a real UI-building
job — creating the UI for all the settings inputs, including rolling
odometer-style input and such. Expect a design conversation first, like
the other big items (1 and 11), not a quick fix. The chalk-board naming
and styling carve-outs from the branding work (item 2 in DONE) land here
too.

## 5. UI HINTS: a glow on clickable things (added 2026-08-06)

Figure out a way to have UI HINTS that make sense: hints for the player of
what is available to click, so they see the options. On/off in settings.
Rather than arrows that point, John is considering a 'glow' around the
clickable items that indicates clickability. Think about this.

Notes (Claude):

- `state.settings.hints` already exists as a boolean, so the toggle has a
  home waiting.
- iOS constraint applies: no hover on the iPhone, so the glow must be
  always-on (or gently pulsing) while hints are enabled — never
  hover-revealed.

## 6. Sound icon: musical note + stop overlay (added 2026-08-06)

Change the sound icon in the game screen: a note icon when sound is on, and
the note icon with the stop overlay when off.

## 7. Proper layered overlays for the triage room doors (added 2026-08-06)

The triage room doors still need proper overlays. Layering, back to front:
background color, then walls, then room background, then patient, then
door. (The reserved wall/interior PNGs from the room-art plan are for this.)

BUILT 2026-08-06 (cache 2026-0806-rooms1a) — open only for John's
fine-tuning pass on the patient figure:

- Each cell stacks wall art (fills the cell) → room interior (same box as
  the door art, 61%/91% bottom-aligned) → assigned patient (open room
  only) → door art. Stacking is DOM order; an open door's transparent
  doorway reveals the interior and patient. Recall, halo, and pulse all
  still work; console clean.
- The wall and interior PNGs joined the asset manifest and startup
  verification (+8 images — noted against the asset-loading-strategy
  todo).
- Patient first pass in styles.css `.room-patient`: bottom 3%, height
  62% of the cell, max-width 52%, object-fit contain. Fine-tune scale
  and position by adjusting those three numbers.

## 8. Waiting backgrounds need NOT travel with the patient (added 2026-08-06)

Not sure if we are still tracking this: it is NOT required that the waiting
room backgrounds travel with the patient — they are really never used
again. (Today the code and doc 3 make the background travel with its
patient through select/swap/assign; this permits simplifying that.)

## 9. BUG: sounds sometimes do not play (added 2026-08-06)

Sometimes the timer clicks and other sounds do not play, even though sound
is turned on. Figure this out.

Repro (John, 2026-08-06 afternoon): iPhone, refreshed page, both modes,
clicked patient — NO sounds at all (clicks, dongs, etc.). Settings
confirmed on, iPhone volume up. Desktop worked fine at the same time.

Hardening applied 2026-08-06 (cache 2026-0806-pacing1c), targeting three
documented iOS Web Audio behaviors:

- resume the context from ANY non-running state — iOS reports
  "interrupted" (after a phone call / Siri / app switch), and the old code
  only resumed "suspended";
- close the context on pagehide — iOS strands contexts across page
  REFRESHES (only a handful allowed per tab), which matches the
  "refreshed page → silent" repro; a stranded-context tab needs one
  force-close of the tab to recover;
- nudge the context on visibilitychange back to visible.

Same afternoon: a reload cleared it and sounds worked again. That RULES
OUT the ring/silent switch for this occurrence (a switch doesn't toggle
itself) and fits the stranded-context theory, which the pagehide-close fix
targets. Item stays open for observation: if silence recurs on
pacing1c or later, note whether a reload still clears it and whether the
tab had been refreshed several times beforehand. (For reference, Web
Audio DOES obey the ring/silent switch while volume buttons are separate —
if silence ever persists across reloads, check the switch; the "unmute"
hack — looping a silent HTML5 audio element — is the code fix for that.)

## 10. Loudness switch: high / medium / off (added 2026-08-06)

Think about some sort of loudness high/medium/off switch in settings —
maybe tied to that game-screen sound icon too (cycle through levels?).
Related to the existing "sound volume control" backlog item.

## 11. Shift history: a queue of completed shifts (added 2026-08-06)

When we get to persistence (Phase 9): store essentially all the shift data
as an item and build up a list of shifts for the player to review later —
in lieu of a 'best scores', have a queue of completed shifts. Only the TEXT
data from each shift is stored (info, list of patients seen and in what
order); when the player chooses to review it later the shift report is
already written, and patient info is drawn directly from the patient store.

- A "REVIEW PAST SHIFTS" item on the ER ENTRANCE page opens a scrolling
  list of past shifts: date, time, # patients seen, score, etc.
- The requester allows deleting ALL shifts, or individual ones.

Notes (Claude):

- This generalizes (and would supersede) the existing backlog item "review
  the last shift from ER ENTRANCE (lastCompletedShift snapshot)" — the
  last shift is just the newest entry in the queue.
- Per-shift storage is small: settings snapshot + shift metadata + the
  ledger (order + one record per patient, IDs only) ≈ 2–12 KB of JSON.
  Even 100 stored shifts ≈ 1 MB, well inside the ~5 MB localStorage quota.
  Cap the queue (e.g. newest 100, auto-prune oldest) and space is a
  non-issue.
- The Shift Report + Patients Seen screens render from state today; the
  work is a path that rebuilds that state from a stored record, plus the
  list UI. Not painful — the ledger design already keeps everything needed.
- Guard: a stored shift references patients by ID, so if the patient store
  is ever renumbered/edited, old records could point at missing IDs —
  handle that gracefully (skip or annotate, never crash).
- iPhone caveat (verified 2026-08-06): WebKit deletes a site's
  script-writable storage (localStorage included) after ~7 days of not
  visiting the site — and this applies to EVERY browser on the iPhone,
  Chrome included, because Apple requires them all to use the WebKit
  engine. Desktop Chrome has no such rule. Mitigation if it ever matters:
  "Add to Home Screen" effectively protects the storage (the web app's own
  use counts as visiting); an export button is the heavier fallback.

## 12. Vitals panel: icons + text + number values (added 2026-08-06)

A big item — the vitals panel. It is supposed to use the icons, text and
number values. It is still just text.

Notes (Claude):

- Related old backlog item: "six missing vital icons" — worth resolving
  what icon assets exist vs are missing when this is picked up.

## DONE

## 4. Make 'ABOUT' more prominent in the ER ENTRANCE art (RESOLVED 2026-08-06)

In the ER ENTRANCE background pic, enhance the word 'ABOUT' on the green
ground cover to make it more prominent. (Note: this one IS an edit to the
background image itself.)

Resolved 2026-08-06: a candidate with the embossed letters recolored to a
light green (140, 190, 150) was produced and reviewed, and John decided to
KEEP THE ORIGINAL image unchanged. Do not re-pitch brightening the ABOUT
letters. The exact pixel-selection recipe is preserved (memory:
about-cover-recolor-recipe) in case this is ever revisited.

## 2. Branding: match the ER ENTRANCE sign with fonts (BUILT 2026-08-06)

Anywhere TRIAGE or TriageRUSH appears, mimic as closely as possible — with
FONTS, not a bitmap image — the style and color of the sign in the ER
ENTRANCE background image: orange colors, exclamation point, shading, font,
etc. We'll just get as close as we can with fonts.

Built 2026-08-06 (cache 2026-0806-brand1e), mockup kept at
`_mockups/brand-font-mockups.html` (variant B chosen):

- The game's NAME is **"Triage RUSH!"** (sign spelling: space, mixed case,
  exclamation — supersedes "TriageRUSH") in ALL places and BOTH modes:
  game header, Shift Report masthead, shift-over transition, page title,
  ABOUT. The ! is part of the name and stays even in prose.
- **"Triage!"** alone appears in exactly TWO places, as the NAME OF THE
  MODE: the Shift Report's "MODE: Triage!, Forgiving, 5 minutes" line and
  the settings mode chooser (radios read "Triage!" / "Triage RUSH!").
- `.brand-sign` in styles.css carries the treatment: Arial Black stack,
  face #ec543d, four stacked #a03426 shadows for 3D depth + a soft warm
  cast shadow, all em-based so it scales. `.brand-rush` renders RUSH!
  1.18× larger, like the sign. Because the brand is the same in every
  mode, all three spots are static markup — ui.js writes none of them.
- Positioning (John): masthead is one centered unit ("Triage RUSH!" +
  gap + serif "Shift Report"); game-header brand centers between the left
  edge and the scorecard; on the shift-over screen the brand baseline
  sits at ~30% of the shell height and SHIFT ENDED's at ~50% (patients
  count + tap hint unchanged below).
- DELIBERATELY untouched (John): the chalk-board STYLING and the ER
  ENTRANCE shift-board summary — wait for item 3.
