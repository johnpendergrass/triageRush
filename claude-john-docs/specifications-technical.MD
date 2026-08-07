# triageRush — technical notes (pointer file)

**Last modified:** 2026-08-07 (hints removal mechanics; blackboard
mockup conventions + build-phase plan)

## Hints removal mechanics (2026-08-07, built)

`state.settings.hints` no longer exists: removed from the defaults,
isValidSettingsShape, and applySettings. loadPreferences DELETES a
stale `hints` key from stored envelopes before the validate-and-spread
(the spread would otherwise reimport it). The empty-state arrows render
unconditionally (renderEmptyStateHint; the span's `hidden` attr is gone
from index.html). `.queue-hint` CSS and the settingHints element-id
entry in ui.js are deleted — restoring any hint UI means re-adding the
id to ui.js's REQUIRED_ELEMENT list or lookups fail at boot.

## Settings blackboard mockups (2026-08-07, design locked, NOT built)

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
  Build-time: normalizeInitials/isValidPlayerShape move from
  /^[A-Z]{1,3}$/ to symbol-list membership, counting symbols.
- Build-time sound schema: soundGlobal stays boolean; soundGame /
  soundMusic become gameLoudness / musicLoudness ("off"/"lo"/"hi") —
  migrate old saves with the friendly strip/map pattern. Loudness maps
  to a gain multiplier in app.js's Web Audio registry and .volume on
  the KING-FM stream element. The sound icon becomes a WRITER of
  soundGlobal (persisted via savePreferences), retiring the
  gameSoundsAudible per-shift override (game.js 112/933/1064,
  app.js 361, ui.js renderSoundButton).

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
  on every asset/CSS/JS change (currently "2026-0806-vit1a"; the
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
cue max per quarter. `state.gameSoundsAudible` = runtime mute
(re-derived each shift start from soundGlobal && soundGame); music
(KING-FM stream) starts from HOME gestures only.

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
