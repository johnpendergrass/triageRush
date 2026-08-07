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

## 3. Fix up the settings blackboards (added 2026-08-06) — BIG ITEM, IN PROGRESS

Really need to fix up the settings blackboards when expanded — the text and
the operation of the settings.

Reclassified as a BIG item (John, 2026-08-06): this is a real UI-building
job — creating the UI for all the settings inputs, including rolling
odometer-style input and such. Expect a design conversation first, like
the other big items (1 and 11), not a quick fix. The chalk-board naming
and styling carve-outs from the branding work (item 2 in DONE) land here
too.

### Design state (2026-08-07 session — mockups, nothing in the game yet)

**BOTH BOARDS' LOOKS ARE LOCKED (John, 2026-08-07):** the PLAYER NAME
board (odometer drums) and the GAME OPTIONS board (two-line setting
groups, headline GAME MODE + GLOBAL SOUND, GAME OPTIONS / SOUND
OPTIONS sections). Iterate only on the small opens listed at the end;
do not redesign the locked layouts.

Reference art John supplied (NOT final, direction only):
`assets/lobby-page/settings-blackboard-*-MOCKUP.png`. Working mockups:
`_mockups/settings-letterboard-mockup-PLAYER.html` and `-GAME.html`,
both rendered inside a faithful copy of the 9:16 shell + popup card so
they are phone-true. (The old combined `settings-letterboard-mockup.html`
is a superseded pointer page, safe to delete.)

Decisions LOCKED for both boards:

- Letter-board look (press-in white plastic lettering on the ribbed
  board art), uppercase; the ONLY orange is the brand words
  "Triage RUSH!" / "Triage!" in the .brand-sign treatment.
- Radios/checkboxes keep the current native green accent-color style.
- Sound model (revised same day to the one-line form): three rows, no
  checkboxes — `GLOBAL SOUND off/on` (the master mute, extra breathing
  room), `GAME SOUNDS off/lo/hi`, `KING-FM off/lo/hi`. OFF lives inside
  each loudness selector, so per-family on/off toggles are gone — this
  is the standard games pattern (master mute + a level per category)
  and John confirmed it after asking how most programs handle it. NO
  ambiance option — deferred until ambient sound assets exist; if ever
  added it probably folds into the Game sounds controls (John).
  Build-time schema: soundGame/soundMusic booleans fold into
  gameLoudness/musicLoudness enums; soundGlobal stays a boolean.
- Layout (revised again same day): GLOBAL SOUND off/on is the HEADLINE
  control — larger lettering + radios, centered under SOUND SETTINGS —
  and GAME SOUNDS / KING-FM (MUSIC) sit below it as quieter two-line
  sub-groups (dim label line, indented off/lo/hi row, smaller radios).
- The game-screen sound icon = GLOBAL SOUND, period (John,
  2026-08-07): the icon and this setting are two views of ONE persisted
  value. Flipping the icon mid-game writes soundGlobal (and the board
  shows it); no more per-shift-only mute. Build note: this retires the
  gameSoundsAudible runtime-override pattern, and the icon toggle must
  persist via savePreferences; global off silences music too. This
  also fixes the semantics for TODO 6's note/stop icon art.
- Final board naming (John, 2026-08-07, after trying GAME/SOUND
  SETTINGS): sections are **GAME OPTIONS** and **SOUND OPTIONS**; the
  player board is **PLAYER NAME** (it's where you build your name for
  the shift report). Title font stepped down a notch from the first cut.
- Whole-board layout LOCKED direction: every setting is a two-line
  `setting-group` — left-justified header (nudged in from the left
  edge), CENTERED options row with wide tap gaps. Each section opens
  with a `--headline` group (GAME MODE with enlarged brand words /
  GLOBAL SOUND): bigger brighter header, larger radios, breathing room
  around. Shift-length units stay spelled out (60/120 SECONDS,
  5/10 MINUTES — room verified; secs/mins rejected as unneeded). The
  divider rule is inset from the frame on both sides.

PLAYER NAME detail board (renamed from Player Settings):
**LOOK LOCKED (John, 2026-08-07)**

- No TITLE/INITIALS section headers — the machines are self-evident.
- Vegas/automobile odometer drums: brushed-metal bezel, dark drum
  window, previous/next values peeking squashed+dim above/below the
  centered current value, separator ridges, cylinder shading, 150ms
  roll animation. One title drum + three initials drums, all values the
  same size.
- Dual input, no typing ever: big chevron buttons step with wrap-around
  AND tapping the value opens the native picker (invisible <select>
  over the window; iOS shows its wheel; 16px font so iOS doesn't zoom).
- Title list adds "Hey you!" (build-time change to PLAYER_TITLES).
- Initials alphabet: A-Z, "-", then emoji ⚕️ 🚑 💀 😷 ❤️ ➕ ⭐.
  Emoji store like letters (strings); build-time change: initials
  validation/normalization moves from /^[A-Z]{1,3}$/ to membership in
  the symbol list, counting SYMBOLS not JS code units.

Still OPEN on this item:

- Lettering variant A (Arial Black, compact) vs B (Arial bold, airier)
  — toggle is on the mockups, John has not picked.
- Whether the music header keeps the parenthetical: "KING-FM (MUSIC)"
  vs plain "KING-FM".
- The SUMMARY boards (small blackboards on the ER ENTRANCE screen)
  — John wants to look at the player summary after the detail panels.
- Build phase after mockups: settings schema migration (loudness
  fields + emoji-aware initials validation; friendly strip/map
  pattern), Web Audio gain + stream volume wiring, the sound-icon =
  GLOBAL SOUND change (retires gameSoundsAudible), popup markup/CSS/JS
  replacement, PLAYER_TITLES += "Hey you!".

## 6. Sound icon: musical note + stop overlay (added 2026-08-06)

Change the sound icon in the game screen: a note icon when sound is on, and
the note icon with the stop overlay when off.

DEFERRED (John, 2026-08-07): do not work on the sound items (this one,
item 10, and related sound options) until the settings blackboard
redesign (item 3) is settled — the sound stuff is likely to live there.

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

DEFERRED (John, 2026-08-07): waits for the settings blackboard redesign
(item 3) — see the note on item 6.

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

- This generalizes the existing backlog item "review the last shift from
  ER ENTRANCE (lastCompletedShift snapshot)" — the last shift is just the
  newest entry in the queue. (Revised 2026-08-06: it does NOT supersede
  it — item 13's 'REVIEW LAST SHIFT?' button coexists with 'REVIEW PAST
  SHIFTS', both in the sidewalk area of the ER ENTRANCE art.)
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

## 13. ER ENTRANCE: "REVIEW LAST SHIFT?" button (added 2026-08-06)

When the player returns to the ER ENTRANCE screen, having completed or
stopped short of a shift, they are given the opportunity to return to the
Shift Review screen. Why? John accidentally tapped 'Return to ER ENTRANCE'
instead of 'Review the Patients Seen' and was sent back to the ER
ENTRANCE, and then could not review his shift. So, in the bottom right
corner of the ER ENTRANCE screen, IF the last shift is still available,
make it available for a review by a 'REVIEW LAST SHIFT?' button. If it
was the first game, or a player quit the shift, then it is not available.

Availability rule (John, clarified same day): the test is whether the
SHIFT ENDED transition screen appeared. If it did — shift ran to
completion OR was ended early — a shift occurred and the button appears.
If it did not (the player QUIT the shift), no button. First game ever:
no button (no shift exists yet).

Placement (John): bottom right portion of the ER ENTRANCE image,
superimposed on the sidewalk. The 'REVIEW LAST SHIFT?' button appears
regardless of the availability of the 'REVIEW PAST SHIFTS' option (item
11); when both exist, BOTH buttons appear together in that sidewalk
area, with the last shift also showing as the newest entry in the
past-shifts list. OR maybe erase the Emergency sign from the art and put
those options there instead — TBD, decide at build time.

Notes (Claude):

- This makes the old backlog item "review the last shift from ER
  ENTRANCE (lastCompletedShift snapshot)" concrete, and revises item
  11's supersede note: the two coexist as separate buttons rather than
  one absorbing the other.
- If this lands before Phase 9, an in-memory lastCompletedShift snapshot
  is enough — the button only has to survive within the session until
  persistence exists.

## DONE

## 5. UI HINTS: a glow on clickable things (RESOLVED 2026-08-07)

Figure out a way to have UI HINTS that make sense: hints for the player of
what is available to click, so they see the options. On/off in settings.
Rather than arrows that point, John is considering a 'glow' around the
clickable items that indicates clickability. Think about this.

RESOLVED 2026-08-07 (cache 2026-0807-hints1a) by John's decision to go
the other way: remove the hint system, complete the game, and have a
couple of folk play test it — no hints work on the wrong stuff, and no
building what turns out to be unnecessary. If play testing shows hints
are needed, a redesign (the glow idea is the parked candidate) happens
then, informed by where testers actually got stuck.

What was done:

- REMOVED: the "→"/"↔" queue badges on waiting rows, the "Show UI
  hints" settings checkbox (its whole HELP fieldset), and
  `state.settings.hints` (default, validation, applySettings copy).
- KEPT AND MADE PERMANENT: the empty-state arrows in the patient panel
  ("◀━━ TAP A WAITING ROOM PATIENT" / "or TAP THE TRIAGE ROOM DOOR TO
  RECALL THAT PATIENT") — always shown now, no setting gates them.
- KEPT (were never part of the hint system): the Chart / Patients Seen
  MORE ABOVE/BELOW scroll indicators and the shift-over "tap to see
  your results" line — those are navigation affordances.
- Preferences guard: loadPreferences strips a stale `hints` key from
  older saved envelopes (same friendly pattern as the LPN/PA title
  mapping), so nobody's settings get reset.
- Verified: 11-check Node harness (defaults, applySettings, old + new
  envelope round-trips) plus browser smoke test (settings board clean,
  arrows permanent, zero badges, chart opens; console clean save the
  known favicon 404).
- iOS glow constraint (no hover — glow must be always-on or pulsing)
  is preserved in the notes here for any future redesign.

## 16. Player titles: remove LPN + PA, add MR/MRS/M/MS (DONE 2026-08-06)

In the title of the character, remove LPN, PA, and add MR, MRS, M, and MS.

Notes (Claude):

- The list is `PLAYER_TITLES` in game.js (currently: Doctor, Nurse, RN,
  LPN, RES, Intern, EMS, PA, MS1, MS2, MS3, MS4). After the change:
  Doctor, Nurse, RN, RES, Intern, EMS, MS1-MS4, plus MR, MRS, M, MS.
- Confirm at build time: is "M" intended as-is (e.g. the French M.), or
  short for something like MX? Recorded verbatim from John.
- Persistence guard: a stored preference with title "LPN" or "PA" will
  fail isValidPlayerShape after the change and the whole preferences
  envelope is rejected (settings reset to defaults). Acceptable, or map
  removed titles to "Doctor" when loading — decide at build time.

## 12. Vitals panel: icons + text + number values (DONE 2026-08-06)

A big item — the vitals panel. It is supposed to use the icons, text and
number values. It is still just text.

Built 2026-08-06 (cache 2026-0806-vit1a), APPROVED by John same day:

- The vitals-bubble artwork's icons were identified as AI-drawn flat art
  matching standard medical glyphs (no icon font to find) and recreated
  as six hand-authored inline SVGs, colors sampled from the artwork.
  Mockup: `_mockups/vitals-icons-mockup.html`; John chose layout
  variant A (icon left, label-over-value stack — no tile height change).
- Icons are `<g id="vital-icon-*">` defs in index.html, stamped per tile
  with `<use>` by buildPatientChart, so they appear in the panel, Chart
  clipboard, and Patients Seen alike. New CSS: `.vital-icon`,
  `.vital-stack`; `.vital-tile` became a row.
- This RESOLVES the old "six missing vital icons" backlog item: no icon
  image assets are needed, ever — the SVGs are the icons.
- Verified in Chrome (panel + clipboard, console clean); Node harness
  not applicable (pure presentation).

## 8. Waiting backgrounds need NOT travel with the patient (DONE 2026-08-06)

Not sure if we are still tracking this: it is NOT required that the waiting
room backgrounds travel with the patient — they are really never used
again. (The code and doc 3 made the background travel with its patient
through select/swap/assign; this permitted simplifying that.)

Built 2026-08-06 (cache 2026-0806-bg1a) under John's new rule: a
background belongs to the waiting ROW, not the patient — a fresh random
one is chosen whenever a patient enters the waiting room, and rows are
the only place backgrounds appear.

- `state.active` and `state.assigned` no longer carry
  waitingBackgroundKey (they are just {patientId} / {patientId,
  roomKey}); only waiting entries keep it. Seven copy-around spots in
  game.js removed; chooseWaitingBackgroundKey now checks only visible
  rows for duplicates.
- Visible behavior change (accepted): swapping the center patient back
  into a row shows a fresh background, not the one it left with.
- Verified: 15-check Node harness (select/swap/assign/recall paths, no
  stray keys, invariants clean) plus browser smoke test. Docs 3/8 still
  state the old traveling rule — fold into the next docs pass.

## 14. Preload the open-door art (RESOLVED 2026-08-06)

We need to preload those open doors: there is a noticeable delay between
assigning the patient to the room — the patient appears immediately, but
the door is GONE for 1/4 second or so before the open-door art appears.

Resolved 2026-08-06 by item 15 (the art resize), same day it was added:
with the open-door PNGs down from ~1.4 MB to ~90 KB, the src-swap
decodes fast enough that John confirmed the bare-doorway gap is gone. No
preloading code was written. If the gap ever returns (e.g. future art
changes), the candidate fixes were: stack BOTH door states as two imgs
and toggle visibility instead of swapping src, or pre-decode open
variants via img.decode() at shift start.

## 15. Resize the room/waiting art down from hi-res (DONE 2026-08-06)

Raised and built the same day, so it never got a numbered slot while open.
The waiting-room backgrounds, walls, room interiors, and open/closed doors
were all hi-res multi-MB PNGs but render tiny; they were batch-resized for
the worst display case (iPhone 3x shell ≈ 1296×2304 physical, which beats
a 4K desktop window) with ~15% headroom:

- doors ×14 → height 400; interiors ×7 → height 448; shared wall → height
  320; waiting backgrounds ×16 → height 448. Aspect preserved, LANCZOS,
  still PNG (doors keep their alpha doorway). Same paths/filenames, so
  assets.js needed no path edits — cache bumped to 2026-0806-art1a.
- **169.7 MB → 5.5 MB.** Patient portraits deliberately untouched (they
  magnify; they stay hi-res).
- Hi-res originals: John's manual full-assets copy at
  `assets/HIRES-ORIGINAL-ART/` (not used by the game; restore from there
  if any art ever looks soft).
- Script kept at `assets/_asset-audit-and-resize/resize_game_art.py`;
  targets follow that folder's 2026-08-04 audit, now validated against
  the final CSS.
- Smoke-tested in Chrome: READY reached, assignment shows patient +
  interior through the open door, console clean (favicon 404 only).
  John's desktop + iPhone visual pass still pending.
- CONFIRMED by John same day: this fixed item 14 (the ¼-second
  door-swap gap) outright — no preload code needed. John also visually
  approved the resized art in the game.

## 7. Proper layered overlays for the triage room doors (DONE 2026-08-06)

The triage room doors still need proper overlays. Layering, back to front:
background color, then walls, then room background, then patient, then
door. (The reserved wall/interior PNGs from the room-art plan are for this.)

Built 2026-08-06 (cache 2026-0806-rooms1a), patient figure fine-tuned and
APPROVED by John same day (cache 2026-0806-rooms1h):

- Each cell stacks wall art (fills the cell) → room interior (same box as
  the door art, 61%/91% bottom-aligned) → assigned patient (open room
  only) → door art. Stacking is DOM order; an open door's transparent
  doorway reveals the interior and patient. Recall, halo, and pulse all
  still work; console clean.
- The wall and interior PNGs joined the asset manifest and startup
  verification (+8 images — noted against the asset-loading-strategy
  todo).
- FINAL patient numbers in styles.css `.room-patient`: left 45% (image
  center at 45% of cell width), bottom 9%, height 80%, max-width 66%,
  object-fit contain. Adjust only these four numbers if it ever needs
  re-tuning.
- Follow-up spun off as item 14: the open-door art paints ~1/4s late on
  assignment.

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
