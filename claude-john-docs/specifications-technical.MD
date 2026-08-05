# triageRush — technical notes (pointer file)

**Last modified:** 2026-08-05 (Phase 7 complete)

Full technical contracts: `docs/4`, `docs/8`. This file records only
practical build knowledge that lives nowhere else.

## Running and cache

- Serve from repo root; entry `index.html`. John: `start-triageRush.bat`
  (port 8090). Claude test servers: any other port, kill after use.
  file:// does not work (fetch).
- Cache busting: one version string in TWO places — index.html query
  params (5 refs) and `TRIAGE_RUSH_CACHE_VERSION` in assets.js. Bump BOTH
  on every asset/CSS/JS change (currently "2026-0805-phase7i"; the
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

## Known technical debt

- Asset loading strategy (IMPORTANT, John 2026-08-05): stage 2 blocks
  READY on 160 JSON fetches + full decode of every manifest image.
  Rework what blocks READY vs lazy-loads; revisit with Phase 10.
- Invariant checks run after every action (assertStateInvariants) —
  console.warn means a transition bug, never patch state directly.
