# triageRush — technical notes (pointer file)

**Last modified:** 2026-08-07 (summary boards + REVIEW LAST SHIFT built)

## Sidewalk summary boards, as built (2026-08-07)

- **Two container layers, and the reason matters.** `.board-face` is the
  container (`container-type: inline-size`) and carries NO padding;
  `.face-inner` inside it carries the padding and everything else. An
  element's own cqw units resolve against its nearest ANCESTOR
  container, not itself - a `padding: 4cqw` on the face would silently
  measure the whole shell. That bug cost the first cut 36px of width.
- **The face rects are the ribbed area, not the board**, measured off
  the artwork: player face x 133-378 y 846-1246, game face x 431-684
  y 848-1247 of the 852x1515 canvas. They are smaller than the old
  `.board-hotspot` rects (which covered the frame and legs), so the
  frame and legs are no longer tap targets - accepted, because
  lettering that reaches the frame rides onto the wood, exactly the bug
  the detail board's GAME MODE row hit.
- **Every size is set by the widest string, measured at 375px** where
  the faces are 96 and 99px across, leaving ~15% headroom for iOS's own
  Arial Black metrics: PAST SHIFTS 86%, three emoji initials 87%,
  FORGIVING 86%, "Triage RUSH!" 87%. Re-measure AT THAT WIDTH before
  enlarging anything - the desktop has room the phone does not.
- The brand needs `text-transform: none` on the board face, same
  opt-out as the detail board; without it the sign reads "TRIAGE RUSH!".
- **The two modes are sized SEPARATELY** (`.sum-mode--triage` 17cqw,
  `.sum-mode--rush` 10cqw). One line is a hard constraint and "Triage
  RUSH!" already fills the face at 10cqw, so a shared size would cap
  both there; John wanted "Triage!" to stand out and RUSH left alone.
  17cqw of the game face is 16.9px against the player board's initials
  at 16.8px - matched by eye, then by measurement. The headline group
  carries `min-height: 29cqw`, above BOTH modes' line boxes, so the
  rows below cannot move when the mode changes. Re-check that reserve
  if either size changes: it is the only thing holding the two equal.
- Everything else on that board is 9cqw, labels and values alike
  (John): the values are white and the labels dim, so colour does the
  separating. That is what funded the mode's size and the sound rows'
  spacing.
- VERTICAL BUDGET IS THE TIGHT ONE on the game board, not width. At
  375px the content box is 150px and the content is ~145px. John's
  iPhone put the MUSIC row on the wooden frame at summary1f, when the
  mode was 20.5cqw and the clearance had gone to zero; at 17cqw it is
  9px and correct. Measure `.sum-row:last-of-type` against the face's
  bottom edge after ANY size change here.
- `formatShiftLengthLabel` abbreviates ("5 MIN"/"60 SEC") but keeps the
  MODE-dependent units the Settings radios and the Shift Report use.
  Not a plain minutes conversion: RUSH's 60 seconds must not read
  "1 MIN".
- The player board's welcome half is `flex: 0 0 auto` so it takes only
  what it needs; the review half takes the rest and distributes it with
  `justify-content: space-evenly`, which is what puts equal air above,
  between and below the two buttons. The buttons are content-sized
  (`flex: 0 1 auto`), not stretched - stretched, there would be no air
  left to distribute. Their PADDING is the tap target, and because the
  box is never drawn, trading air for padding costs nothing visually;
  the limit is that padding widens the gap between the two buttons
  faster than the gaps above and below them.
- The player board's rule carries its own margins: half the WELCOME!
  size above it (5.75cqw against WELCOME!'s 11.5cqw - John's number,
  2026-08-07) and NOTHING below, because the review half distributes
  that air with space-evenly and a margin there made the first gap read
  wider than the other two. The game board keeps the shared margins,
  which separate its sound rows.
- Nested buttons are invalid, so the player board is a DIV with three
  buttons inside it, not one button. The game board is still a single
  button - and note its divider is a `<span>`, not an `<hr>`: a button
  may only contain phrasing content.

## iOS double-tap zoom on the odometer (2026-08-07)

Stepping an initials drum meant two chevron taps inside ~300ms, which
is iOS's double-tap-to-zoom gesture: the board blew up and John had to
pinch it back down. The cure is `touch-action: manipulation`, applied to
`button, label, input, select, .wheel, .wheel-window` - every control,
not just the wheels, because the waiting rows and room doors get tapped
just as fast in RUSH.

This does NOT disable zooming. Pinch still works everywhere, which is
the gesture that matters for reading a chart, and the viewport meta
stays free of `user-scalable=no`. Only the double-tap shortcut (and the
legacy 300ms click delay) goes away.

The related iOS behaviour is the text-selection LOUPE on a long press,
which is why `.wheel-drum` also carries `user-select: none` - a drum is
a machine part, not text. The focus-zoom trap was already handled: the
invisible `<select>` is 16px, below which iOS zooms the page to meet a
form control.

## Reviewing a past shift (TODO 13, 2026-08-07)

`state.lastShift` is a deep, independent copy taken in `stopShift`
(shift + ledger + settings + player). Reaching `stopShift` IS the
availability test - it is the only path to the SHIFT ENDED screen - so
no separate flag is needed. `quitShift` nulls it.

`reviewLastShift` restores the SHIFT-SCOPED slots (ledger, shift)
straight into state, which is safe because HOME owns none of them and
`resetToLobby` wipes them anyway. The PLAYER-SCOPED ones are not written
over what the player has since chosen: `state.review.playedWith` holds
the snapshot's settings and player, and `reviewPlayedWith(state)` hands
the review either those or the live ones. Four reads in `renderReview`
use it, plus one invariant - "Close outcome under Strict" has to judge a
ledger by the settings it was BUILT under, or re-reading a Forgiving
shift after switching to Strict warns falsely.

Scoring needed no equivalent: `selectScoreTotals` sums the ledger, and
every point was banked as it was earned.

Two deliberate behaviours: the restore lands on the report, NOT the
SHIFT ENDED acknowledgement, and it does not consume the snapshot - the
same shift can be reopened any number of times.

## Settings letter boards, as built (2026-08-07)

The mockups' conventions carried over verbatim; what is worth knowing
about the real build:

- `container-type: inline-size` now sits on `.popup-card`, so every cqw
  inside a popup tracks the CARD, not the shell — that is what makes the
  board sizes phone-true. The card is ~93.8% of the shell's width, so
  the About board's own cqw numbers were raised ~6.5% to keep rendering
  as before.
- **The board art was CROPPED to its own edges** (2026-08-07): both
  PNGs sat on a 941x1672 canvas carrying ~20% transparent margin, so
  the visible board was only 74.7% of the shell's width while the card
  was 93.5%. Cropping both with ONE common box (93,142)-(845,1529) ->
  752x1387 keeps a single card geometry serving the blackboard and the
  About whiteboard, and makes the same 93.75% card height show a board
  ~20% larger. Everything derived from the crop box: card
  `aspect-ratio: 752 / 1387`, `.popup-content` insets 3.9/3.5/6.6/7.8%,
  and the corner buttons at top/bottom 0 and right 0.4% (they hug the
  art's corners, which is where they always were). Uncropped originals:
  `assets/lobby-page/archived/*-uncropped-941x1672.png`.
- **The letter boards size themselves in cqw of the FACE**, not the
  card (`container-type: inline-size` on `.popup-content--board`), so a
  future re-crop or inset change needs no type re-tuning. The About
  board and the two corner buttons stay on the card's basis. When the
  crop happened, card-basis values were scaled x1.25133 (941/752) and
  face-basis values x1.35135 - one uniform factor each, so every
  proportion the mockups locked survived exactly.
- **The content box is WIDER than the board's ribbed area.**
  `.popup-content` is inset 13% each side of the card, but the art puts
  the ribbed face at 15.9%-83.5% of the card's width - so a row that
  uses the full content width rides onto the wooden frame. Every row is
  narrower than that except GAME MODE, which is why only that row showed
  the problem (John's iPhone, 2026-08-07; fixed by dropping the brand
  words to the regular 2.9cqw option size, which puts that row's frame
  clearance in line with SHIFT LENGTH, the next widest). If a future row
  needs the full width, tighten the insets to ~16.5%/17% rather than
  shrinking type - but that narrows BOTH boards, so re-measure every row
  first.
- The GAME board's face fits EXACTLY (scrollHeight 597 = clientHeight at
  every size). Two gotchas that cost that fit: the hidden music status
  note silently takes `:last-child` from the final setting group (hence
  the explicit `.setting-group--last` class), and the note itself is
  absolutely positioned over the board's bottom so showing it can never
  reflow the locked layout.
- Odometer drums are built by `ui.js buildWheel`, which returns
  `{ value() }`; `buildPlayerWheels` stores `{title, initials[3]}` in a
  module-level `playerWheels` that `readSettingsControls` reads. The
  drums are rebuilt on every open, so nothing needs resetting on cancel.
- `initialsSymbols` in game.js splits by code point AND re-attaches a
  U+FE0F variation selector to the symbol before it — without that,
  ⚕️ and ❤️ each count as two symbols and a three-emoji name fails
  validation.
- Sound levels: `gameSoundOutput(audio)` lazily creates ONE gain node
  per context (recreated when the context is, including the iOS
  pagehide close) and every sound recipe connects through it instead of
  `audio.destination`. Music uses the element's own `volume`.
- A selected OFF radio is red via `accent-color` on
  `input[type="radio"][value="off"]` — deliberately NOT hand-drawn: an
  earlier `appearance: none` version had to imitate the native unchecked
  disc (#363636 flat, no rim) and was abandoned when John asked whether
  plain red was more standard. It is.

## Hints removal mechanics (2026-08-07, built)

`state.settings.hints` no longer exists: removed from the defaults,
isValidSettingsShape, and applySettings. loadPreferences DELETES a
stale `hints` key from stored envelopes before the validate-and-spread
(the spread would otherwise reimport it). The empty-state arrows render
unconditionally (renderEmptyStateHint; the span's `hidden` attr is gone
from index.html). `.queue-hint` CSS and the settingHints element-id
entry in ui.js are deleted — restoring any hint UI means re-adding the
id to ui.js's REQUIRED_ELEMENT list or lookups fail at boot.

## Settings blackboard mockups (2026-08-07) — NOW BUILT

`_mockups/settings-letterboard-mockup-{PLAYER,GAME}.html` are
PHONE-TRUE: they copy the shell + popup-card rules from styles.css
verbatim, and put `container-type: inline-size` on .popup-card so ALL
sizes are in cqw of the card — open them at any size and the board is
exactly game-scale. Conventions that matter for the build:

- `.setting-group` / `--headline` two-line pattern (left header,
  centered options row) is the vocabulary the real build should use.
- CSS gotcha found live: `.setting-group { margin: 0 0 X; }` beats an
  earlier single-class `--headline` margin (same specificity, later
  order) — the mockups use a doubled-class selector to win.
- Odometer drums: 3 stacked cells (prev/current/next), rebuilt per
  step; cylinder look = one ::after gradient overlay + scaleY(0.62)
  dimmed peek cells; roll = 150ms translateY animation restarted via
  the anim-none/offsetWidth/anim-"" trick. The tap-value picker is an
  invisible <select> (opacity 0, inset 0, font-size 16px — that size
  stops iOS's focus zoom) kept in sync with the chevrons.
- Initials symbols MUST be stored as an array of whole strings — some
  emoji are two JS code units; never .split("") an emoji alphabet.
  BUILT: normalizeInitials/isValidPlayerShape check symbol-list
  membership and count SYMBOLS via initialsSymbols, not string length.
- The build-time plan that used to sit here (loudness schema, the sound
  icon becoming a writer of soundGlobal, retiring gameSoundsAudible) is
  DONE — the sections below describe what actually shipped rather than
  what was intended.

## Sound levels and auditioning (2026-08-07)

Game sounds run through ONE gain node (`gameSoundOutput`) created with -
and discarded with - the AudioContext, so a level is a single multiplier
rather than a number threaded through ten recipes. It is refreshed from
state on every play, which is why a level change needs no rebuild.

Music does NOT share that scale: `MUSIC_VOLUME` is lo 0.02 / hi 0.06
against the game family's 0.22 / 1, because a broadcast stream is
mastered far hotter than synthesized blips and KING-FM is background
audio. These are amplitudes and loudness is roughly logarithmic, so 0.06
is about 24dB down. All four numbers were set BY EAR, and twice: the
first cut (music 0.08/0.25, game lo 0.35) was still far too loud. They
are the only knobs - do not compensate anywhere else.

**iOS ignores `HTMLMediaElement.volume`** - Apple reserves media volume
for the hardware buttons, so setting `.volume` is a silent no-op there.
That is why every KING-FM level sounded identical on John's iPhone while
working perfectly in desktop Chrome (2026-08-07). The stream is
therefore routed through Web Audio - `createMediaElementSource` into a
GainNode - because a GainNode IS honored on iOS, and the gain now
carries the level; `.volume` is left at 1 and only used as a fallback if
routing ever fails. Three things this depends on:

- `crossOrigin = "anonymous"` MUST be set before `src`. Routing a
  cross-origin stream through Web Audio yields SILENCE (no error) unless
  CORS allows it. The KING-FM stream reflects whatever Origin it is
  sent, so CORS itself is fine in dev and in production.
- **iOS refuses the routed element anyway** (John's iPhone, 2026-08-07 -
  and note every iOS browser is WebKit, so "Chrome on the iPhone" is
  Safari here). With crossOrigin set, `play()` rejects and the player
  gets the "stream could not start" note. The stream's OPTIONS preflight
  was briefly suspected (one response omitted `Range` from
  Access-Control-Allow-Headers, which would fail Safari's ranged media
  request) but it allowed Range on 8/8 retries, so that is NOT
  established; WebKit's long-standing weakness with
  `createMediaElementSource` on live streams is the likelier cause.
  Rather than guess, the code DEGRADES: the first refusal drops to a
  plain element (no CORS, no routing) and retries once, silently. Verified
  both paths - a simulated refusal falls back and plays with no note
  shown, and the desktop path routes exactly once and keeps its gain.
- **The consequence is that iOS has no music level control**: the
  fallback element is governed by `.volume`, which iOS ignores, so lo
  and hi sound identical there. Desktop keeps real control. Restoring it
  on iOS needs a stream whose live playback survives Web Audio routing
  on WebKit - a different endpoint or provider, not a code change.
- An element can be routed ONCE, into ONE context. The node is created
  lazily and never rebuilt; a second attempt (a replaced context) throws
  and falls back to `.volume`.
- Music now flows through the AudioContext, so a suspended or
  interrupted context silences music as well as game sounds. The
  resume-from-any-state handling already covers this (TODO 9).

Verified by tapping the gain node with an AnalyserNode during real
playback: RMS 0.006 / peak 0.028 behind a 0.06 gain. A CORS-tainted
stream would have measured exactly zero.

The pagehide handler pauses the music element as well as closing the
audio context: a page on its way out, or frozen into the back/forward
cache, must not keep the stream running, because the next page gets its
own element and cannot reach the old one.

Auditioning: `applyMusicPlayback(soundGlobal, musicLoudness, isAudition)`
takes explicit values rather than reading state, because a preview is by
definition not what state says yet. `syncMusicPlayback()` is the saved
view of it, and is what apply, the sound icon, and cancel all call.
Game sounds preview through `auditionGameLoudness`, a module-level
override that `gameSoundOutput` prefers when set - safe as a plain
variable because a sound reads the gain synchronously as it is built, so
the override is cleared before anything else can run. Pending selections
come from `UI.pendingSoundSelections()`, which reads the radios, never
state. Every cancel path funnels through `cancelPopup()`; adding a new
one without it would leave an audition playing.

## Brand lettering (2026-08-06)

`.brand-sign` (styles.css) is the one treatment: Arial Black stack,
weight 900, face `var(--brand-face)` #ec543d, four stacked #a03426
text-shadows + soft cast — offsets in EM so it scales from 48px to 17px.
`.brand-sign .brand-rush` is 1.18em. Because the brand is identical in
every mode, all three brand spots are STATIC markup in index.html and
ui.js writes none of them — do not reintroduce JS rendering. The report
masthead `.review-title` is a baseline-aligned flex row (gap 1.3em,
justify-content center, nowrap) at 4.8cqw/23px — that size is what
guarantees the unit fits one line at every width; don't raise it without
re-measuring. Shift-over baselines use cqw-only math (container-type is
inline-size; height% × 16/9 = cqw): brand absolute at top 45cqw
(baseline ≈30% height), headline via 79.5cqw padding-top (≈50%), using
~0.85em top-of-line-to-baseline for the Arial family.

## Layered room cells (2026-08-06)

renderRooms(state, portraitUrlFor) builds per cell: img.room-wall (inset
0, fill) → img.room-interior (same 61%/91% bottom box as .door-art) →
img.room-patient (open room only; left 45% / bottom 9% / height 80% /
max-width 66%, contain, bottom-center — JOHN-APPROVED FINAL) →
img.door-art.
Stacking is DOM order, no z-index. The art was authored at matching
aspects (wall ≈ cell ≈ 1.0; interiors = door art ≈ 0.643 aspect;
discharge pair is ≈0.99 and stretches like its door always has), so
object-fit: fill is distortion-free. All 38 door/interior/wall/waiting
PNGs were resized 2026-08-06 for delivery (170 MB → 5.5 MB; doors
257x400, interiors 288x448, wall 317x320, waiting 317x448 — discharge
pair wider). Hi-res originals: assets/HIRES-ORIGINAL-ART/. Script:
assets/_asset-audit-and-resize/resize_game_art.py. The resize also cured
the bare-doorway flash on assignment (open door now decodes instantly). assets.js gained game.roomsWall +
game.roomInteriors[roomKey] and the loader verifies them (+8 startup
images — counted against the asset-loading debt). Portraits are square
1024 RGBA cut-outs, which is why the doorway figure works.

Full technical contracts: `docs/4`, `docs/8`. This file records only
practical build knowledge that lives nowhere else.

## Row-owned waiting backgrounds (2026-08-06)

`waitingBackgroundKey` lives ONLY on waiting entries now. game.js
chooseWaitingBackgroundKey checks just the visible rows; the swap branch
gives the returning patient a fresh key; active is `{patientId,
recalledFromRoomKey?}` and assigned is `{patientId, roomKey}`. Nothing
outside the waiting rows renders a background, so nothing else needs the
key. Node harness pattern for this lives in doc 9's conventions (rebuild
in scratchpad as needed).

## Vitals SVG icons (2026-08-06)

Six `<g id="vital-icon-<key>">` defs in a hidden SVG at the top of
index.html (keys = the VITAL_DISPLAY_ORDER keys: hr, bp, rr, spo2, temp,
pain). buildPatientChart stamps each tile with an SVG `<use>` — one defs
block serves the panel, clipboard, and review because they share the
document. Tile is variant A: `.vital-tile` is a flex ROW of `.vital-icon`
(clamp 12-18px, sized to stay inside the stack height) + `.vital-stack`
(label over value). Gradient/clipPath ids are prefixed (vitalThermoGradient,
vitalBpClip) to stay unique in the page. Icon shapes were tuned in
`_mockups/vitals-icons-mockup.html` — edit there first, then copy into
index.html.

## Vitals column widths (2026-08-07)

`.chart-vitals` is `0.75fr 1.5fr 0.75fr`, not three equal columns: the
middle column holds both long readings (BP, and TEMP once it shows
`41.2 / 106.2`) while the outer columns hold two- and three-character
numbers. This depends on VITAL_DISPLAY_ORDER keeping BP and TEMP in the
middle of each row - reorder the vitals and the ratios must be
re-derived. The binding case is the PANEL on a small phone, where the
value font has hit its clamp floor while the tile keeps shrinking:
there the tightest tile leaves about 6px of slack.

The icons were enlarged in the same pass (`clamp(15px, 4.6cqw, 23px)`,
up from 12/3.6/18): an icon has vertical room until it reaches the
label-over-value stack beside it - 25px in the panel, 31px in the
clipboard - so WIDTH is the only limit, and widening the middle column
paid for the growth. Net effect on a small phone: icons 14px -> 18px
AND the temperature tile gained slack (5px -> 8px), with no tile
changing height. At desktop the icons cap at 23px against a 28-34px
stack. Measure there
first, not on the desktop clipboard, before widening anything in a
vitals tile.

## One structural fact worth keeping

`state.ledger.byPatientId` is keyed by PATIENT ID, with `ledger.order`
holding IDs and `assignmentCount` tracking reassignment. That is correct for
the game as it stands — a patient can appear at most once per shift, and a
recalled case stays one record. It would NOT survive any future feature that
let one patient be seen twice in a shift; the second encounter would
overwrite the first rather than create a new record. Nothing today does that.

## Running and cache

- Serve from repo root; entry `index.html`. John: `start-triageRush.bat`
  (port 8090). Claude test servers: any other port, kill after use.
  file:// does not work (fetch).
- Cache busting: one version string in TWO places — index.html query
  params (5 refs) and `TRIAGE_RUSH_CACHE_VERSION` in assets.js. Bump BOTH
  on every asset/CSS/JS change (currently "2026-0807-summary1h"; the
  trailing letter increments per tweak).

## Architecture in one breath

Plain globals, no modules: assets.js (`TRIAGE_RUSH_ASSETS`, all paths) →
game.js (`TRIAGE_RUSH_GAME`, pure state+rules, no DOM/audio/timers) →
ui.js (`TRIAGE_RUSH_UI`, render-only, no state writes/sounds/timers) →
app.js (bootstrap, events, one-time effects, Web Audio registry).
Canonical patient records live OUTSIDE the state tree in
`window.TRIAGE_RUSH_PATIENTS_BY_ID` (schema 2.2 preserved verbatim;
queue/ledger reference by ID only).

## Unified patient chart

One builder `ui.js buildPatientChart(record, context, portraitUrl)`;
`context.setting` = "panel" (transparent, presentation only) or "clipboard"
(Chart overlay; + locked ANSWER + CLINICAL sections). A future
"review" setting reuses it for Patients Seen. Chart root gets class
`chart--<setting>`; overlay-specific CSS scopes under `.chart-overlay-mount`.
The Coach→Chart rename (2026-08-05) covered code too: overlay value "chart",
pause reason "chart", `state.chart`, openChart/closeChart/
setChartClinicalExpanded, renderChartOverlay/renderChartPortraitZoom,
`chart*` element IDs, `.chart-*` CSS classes.

## Scheduler (Phase 7, built)

One 250ms `setInterval` per shift in app.js; game.js `advanceShiftTime`
is pure and quantizes to 250ms logical quarters (`shift.lastLogicalQuarter`
dedups late callbacks). The anchor is created by the FIRST waiting-patient
tap of the shift (`startShiftClockIfNeeded`, 2026-08-06; this replaced the
2-second acclimation delay) — before that tap the clock sits frozen at full
time with no ticks and no arrivals, and handleStartShift defensively stops
any scheduler a previous shift left running. Pause = app.js
drags the anchor while `schedulerCanRun` is false. Pause reasons are ONLY
"confirmation" and "document-hidden" — the Chart deliberately does not
pause. RUSH arrivals/bursts run inside the same quarter loop; the staged
burst second-member time is LOGICAL elapsed ms, so pauses freeze it. The
RUSH empty-room courtesy refill (2026-08-06) also lives in that loop:
`assignActivePatientToRoom` books `rush.emptyRefillAtMs` (elapsed + 1000ms)
when the room empties, the loop inserts one-or-two (coin flip) patients at
the beat, and the scheduled-arrival countdown is never touched (doc 3 has
the full rules, doc 9 the acceptance table).
Effects flow back as the advance result (soundCues, countdownNumeral,
doinks, queueChanged, blockedShake); app.js plays/renders them.

## Review screens (Phase 8, built)

One builder still: `buildPatientChart` gained a `"review"` setting that also
takes `context.ledgerRecord` (the builder never reads game state). Both
scrolling wrappers use the `.chart-overlay-mount` class, so CSS written
there hits the Chart overlay AND the Patients Seen browser - that is how the
pinned nameplate reached both at once. The pinned nameplate needs a solid
paper-colored shadow above it to paint over the scroll container's top
padding, which content would otherwise show through.

The Patients Seen browser reuses `.chart-overlay`/`.chart-clipboard`
wholesale. Its nav arrows are children of the clipboard, NOT of
`.chart-scroll`, which is what makes them fixed while the paper scrolls;
they sit in the blank margin the 74%-wide scene leaves beside the photo, so
they cost no layout width. Scroll position carries between patients by
measuring the scrolled fraction before the rebuild and reapplying after
(reading `scrollHeight` forces the layout first).

`answer.otherAcceptableRooms` is null for all 160 patients and is read by
nothing; the full-credit set is derived by `game.js fullCreditRoomKeys`.
Anything displaying or scoring that set must call the function.

## Ephemeral vs state-tree UI

In the state tree: overlay value, `state.chart.clinicalExpanded`,
pauseReasons. Deliberately DOM-only (reset on rebuild): photo-zoom
open/closed, scroll position, shake animation classes, countdown
numeral pops. Section toggles update BOTH (direct DOM toggle + state
write) to preserve scroll.

## Sounds

Web Audio only, no files. `SOUND_REGISTRY` in app.js: doink, correct
(C5-E5-G5), recall (C5-E5), close, wrong, tick (1200Hz blip),
minuteTick (1600Hz), countdownTick (2000Hz), endDong (220Hz+octave,
~1.4s ring), minuteDong (330Hz+octave, ~0.7s ring — Triage's
completed-minute bell, 2026-08-06) — each `{enabled, play}` so per-sound
preferences are a flag away. Triage now uses the RUSH-style three-beat at
EVERY ten-second boundary, with minuteDong as the minute's boundary beat. Cue schedule computed in game.js (clockCueForQuarter), one
cue max per quarter. There is NO runtime mute flag any more (2026-08-07):
audibility is `soundGlobal && gameLoudness !== "off"`, read live via
game.js `gameSoundsAudible(state)`, and the game screen's icon writes
`soundGlobal` itself. Music starts only from a user gesture; see the
sound-levels section above for the gain routing and the iOS limits.

iOS audio hardening (2026-08-06, TODO 9): `ensureAudioContext` resumes
from ANY non-running state (iOS reports "interrupted" after a call/Siri/
app switch, which the old suspended-only check missed), a `pagehide`
listener closes the context so page refreshes cannot strand iOS's small
per-tab context pool (the likely cause of John's refreshed-page silence),
visibilitychange nudges a non-running context on return, and a "closed"
context is discarded and rebuilt. Web Audio obeys the iPhone ring/silent
switch (volume buttons are separate) — if silence ever persists across
reloads, check the switch before the code.

## Testing conventions

- game.js runs under Node with a small shim (global window +
  TRIAGE_RUSH_ASSETS stub + performance); harnesses live in the session
  scratchpad (ephemeral — rebuild from doc 9's acceptance tables).
- Browser verification via chrome-devtools MCP: take_snapshot for
  structure, evaluate_script for behavior sequences; John does the visual
  approval himself on desktop + iPhone.
- Glyph gotcha: triangle characters need U+FE0E variation selectors or
  iPhones render boxed emoji (empty-state arrows, door recall arrow,
  MORE ABOVE/BELOW). U+25BE (chart chevron) is safe as-is.
- CONFIRMED ON IPHONE (John, 2026-08-05): check U+2713 and triangle U+25B3
  with U+FE0E render as plain characters, not emoji. The third outcome
  glyph changed 2026-08-06: wrong is now MINUS U+2212 (which has no emoji
  form at all, so it needed no retesting) - the old cross U+2715 was too
  easily confused with the red close box once the review photo became a
  tap target. U+2715 remains in use as the close-box glyph only. Reuse
  this exact set (U+2713 / U+25B3+FE0E / U+2212) for any new outcome
  marking rather than picking fresh glyphs that would need retesting.
  All three uses draw from ui.js OUTCOME_MARK_GLYPHS plus the toast's
  OUTCOME_FEEDBACK_TEXT.

## Hover is not available on John's main device

iOS has no hover at all, so any player-facing affordance that only appears on
hover is INVISIBLE on the phone. The review's direction counters (built
2026-08-06) handle this by being real buttons whose own text swaps to the
explanation (label kept as its first line), in place: the hover swap is
CSS scoped under `@media (hover: hover)`, and tap pins the same swap via an
`is-active` class set in app.js. The media scoping matters: iOS "sticks"
`:hover` after a tap until the next tap elsewhere, which kept the
explanation visible after the timeout had already released the pin — on
touch devices the class must be the only driver. A pin releases on re-tap,
on pinning the other counter, or via a 5-second setTimeout in app.js
(`DIRECTION_PIN_TIMEOUT_MS`). The buttons' min-height is reserved space
sized to label + wrapped explanation, so the swap never shifts the layout
(the FINAL SCORE clamp gave up a step to fund it). The class is DOM-only
ephemera; renderReview resets it, and the timer firing after a reset is
harmless. The same constraint applies to the backlogged
scorecard-magnification idea.

## Mockups

`_mockups/shift-review-mockups.html` is a standalone comparison harness for
the Shift Review's appearance. Variant B ("LEGIBLE") was lifted into
styles.css section 9 on 2026-08-06, renamed from `clean-*` to `review-*`
classes; the mockup remains as the before/after record. It COPIES (never
links) the palette and shell rules, has no fetch, and opens from disk.

Two legibility findings from it, worth applying to any cream-paper surface:
the old secondary ink `#6d7b81` is too light on the cream stock (use
`#4b585e`), and **0.22em letter-spacing on small-caps labels hurt
readability more than the font size did** — around 0.10em reads far better.

## Known technical debt

- Asset loading strategy (IMPORTANT, John 2026-08-05): stage 2 blocks
  READY on 160 JSON fetches + full decode of every manifest image.
  Rework what blocks READY vs lazy-loads; revisit with Phase 10.
- Invariant checks run after every action (assertStateInvariants) —
  console.warn means a transition bug, never patch state directly.
