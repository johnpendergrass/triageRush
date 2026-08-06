# triageRush — technical notes (pointer file)

**Last modified:** 2026-08-05 (Phase 8 complete; doc 10 designed, not built)

Full technical contracts: `docs/4`, `docs/8`. This file records only
practical build knowledge that lives nowhere else.

## Before writing gameplay code, read docs/10

`docs/10-finite-patient-pool-design.md` is approved and unbuilt. Three
technical traps it identifies, all easy to get wrong:

- **The pool must decrement on ACTUAL INSERTION, never on a scheduled or
  blocked arrival.** `insertWaitingPatient` already returns early on
  `reason: "full"` BEFORE calling `drawUniquePatientId`, so the deck is not
  consumed today. Preserve that ordering when the pool counter lands beside
  it, or a shift can end with patients who were never shown.
- **The end condition is a CONJUNCTION**: waiting empty AND pool empty AND
  `state.active === null`. "Waiting room empty" alone is not it — a quick
  player legitimately empties a RUSH room seconds in.
- **`state.ledger.byPatientId` cannot survive a reshuffled deck.** A patient
  seen twice OVERWRITES the first record instead of creating a second, so the
  Patients Seen browser undercounts and the score counts one encounter where
  there were two. Only sandbox can reach this (every other profile deals at
  most 30 of 160 patients), so capping sandbox is a real alternative to
  making the ledger encounter-keyed.

## Running and cache

- Serve from repo root; entry `index.html`. John: `start-triageRush.bat`
  (port 8090). Claude test servers: any other port, kill after use.
  file:// does not work (fetch).
- Cache busting: one version string in TWO places — index.html query
  params (5 refs) and `TRIAGE_RUSH_CACHE_VERSION` in assets.js. Bump BOTH
  on every asset/CSS/JS change (currently "2026-0805-phase8h"; the
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
dedups late callbacks). The anchor starts 2 seconds AFTER activation
(acclimation delay; quitting during it cancels cleanly). Pause = app.js
drags the anchor while `schedulerCanRun` is false. Pause reasons are ONLY
"confirmation" and "document-hidden" — the Chart deliberately does not
pause. RUSH arrivals/bursts run inside the same quarter loop; the staged
burst second-member time is LOGICAL elapsed ms, so pauses freeze it.
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
~1.4s ring) — each `{enabled, play}` so per-sound preferences are a
flag away. Cue schedule computed in game.js (clockCueForQuarter), one
cue max per quarter. `state.gameSoundsAudible` = runtime mute
(re-derived each shift start from soundGlobal && soundGame); music
(KING-FM stream) starts from HOME gestures only.

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
- CONFIRMED ON IPHONE (John, 2026-08-05): the three outcome glyphs used by
  the result toast, the review Answer mark, and the photo badge - check
  U+2713, triangle U+25B3 with U+FE0E, cross U+2715 - all render as plain
  characters, not emoji. Reuse this exact set for any new outcome marking
  rather than picking fresh glyphs that would need retesting.

## Mockups

`_mockups/shift-review-mockups.html` is a standalone comparison harness for
the Shift Review's appearance. It COPIES (never links) the palette and the
9:16 shell rules from styles.css so each variant's CSS stays self-contained
and can be lifted into styles.css section 9 wholesale. It has no fetch, so it
opens from disk as well as over the server. Deleting `_mockups/` reverts
everything — no game file was touched to build it.

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
