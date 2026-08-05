# Development History

**Last modified:** 2026-08-05

**Latest change:** Recorded the production build of Phases 1-6 and the
2026-08-04/05 design decisions (sound model, unified chart, Chart rename,
ER Entrance, footer wording).

## Purpose

This is a concise record of durable milestones and direction changes. It does
not inventory superseded code or assets. Historical detail remains in
`archive/`.

## Milestones

### Initial concept and seven destinations

- triageRush began as an emergency-department triage teaching game.
- The educational loop is to present patient evidence, ask the player to choose
  a destination, and provide explanation after the decision.
- The destination model became ESI 1 through ESI 5, Psych, and Discharge.
- Psych and Discharge retain an underlying ESI, allowing the special destination
  and clinically matching ESI room to receive full credit.
- The waiting queue, center patient panel, and treatment-room rail became the
  stable three-column composition.

### HOME and mobile composition

- HOME established the emergency-department lobby, Start Shift and Resume Shift
  states, settings boards, About, and sound controls.
- The game established queue selection and swapping, assignment, immediate
  feedback, room opening, recall, detailed charts, and Shift Review.
- The mobile-derived 9:16 frame became the enduring visual design.

### Patient library evolution

- The library grew to 160 matched schema 2.2 JSON records and portraits.
- Schema 2.2 separates Presentation, Clinical, and Answer; protects the
  pre-answer information boundary; and defines detailed-chart content.
- A full 2026-08-01 schema, writing, vital-color, and clinical-fidelity review
  passed the current validators.

### Mode, scoring, and review direction

- Triage and TriageRUSH became the two modes.
- Strict and Forgiving became the two evaluation choices.
- `Shift` replaced `round` in player-facing language.
- Both modes adopted +100 Correct, +50 Close, and -50 Wrong.
- RUSH added a live -10 penalty for each patient currently waiting.
- Shift Review adopted explicit formulas, a separate direction summary, and a
  Patients Seen browser using the complete detailed chart.

### Timing and responsive-shell refinement

- RUSH adopted 60- and 120-second arrival curves, a five-slot visual minimum,
  two starting patients, a ten-patient maximum, timing sounds, a full-queue
  shake, and a final countdown.
- The header adopted a numbers-only scorecard and enlarged timer.
- The shell retained an exact 9:16 ratio and began using roughly 5% of viewport
  height above and below on height-limited larger displays.

### 2026-08-04 product-specification revision

- Every device now uses the same responsive mobile composition. HOME, GAME, and
  Shift Review are separate player-selected views.
- Recall changed to one replaceable result per patient. Reassignment removes the
  earlier result and applies the new one without adding another patient seen.
- Coach (since renamed the Chart) moved to the occupied patient panel. It is
  available for new and recalled patients, keeps Answer locked, and remembers
  Clinical expansion during a shift.
- Triage changed to five- or ten-minute countdowns, defaulting to five minutes,
  with ten-second ticks, minute emphasis, and the RUSH final sequence.
- RUSH gained an approved three-beat emphasis at each ten-second boundary before
  its final-ten countdown.
- Every successful runtime patient insertion gained a `doink`; recall does not.
- RUSH scheduled arrivals gained a 20% chance of a two-patient burst, capped at
  ten waiting patients.
- `Intern` joined the player-title choices.
- All 14 current open/closed room-door images in both active asset trees were
  corrected, accepted, and made the only door assets documented going forward.
- The documentation expanded with UI, state/algorithm, and acceptance references
  so a new helper can rebuild the intended application from the current set.
- Active-shift navigation was simplified. GAME no longer permits a temporary
  visit to HOME or a later Resume Shift. Quit Game discards the active shift and
  returns to HOME; Stop Game finalizes it and opens SHIFT REVIEW; review returns
  only to HOME for settings and a new Start Shift.
- The implementation direction became deliberately compact: plain HTML, CSS,
  and approximately three to four meaningfully organized JavaScript files,
  expanded only when a demonstrated concern cannot remain readable in that
  structure.
- Naming became meaning-oriented and comments became intent-oriented so John
  can understand and participate in decisions about state, data structures,
  and module boundaries.
- Runtime patient access was specified to preserve the authoritative schema
  structure. Game queues and ledgers add their own small reference records
  instead of flattening or renaming patient data loaded from disk.
- Startup loading was divided into a light HOME preparation stage and a
  Start Shift gate labeled `PATIENTS ARE ARRIVING`, followed by a measured
  rolling portrait-preload reserve during play.
- Asset optimization moved to a post-implementation release phase. The game is
  first built and approved with the current high-resolution production assets;
  final CSS then supplies the real size targets for representative trials and
  a controlled runtime-asset replacement.

### 2026-08-04/05 production build of Phases 1 through 6

- Implementation began directly under `triageRush/` with the compact file set
  (`assets.js`, `game.js`, `ui.js`, `app.js`) and one serializable state tree.
- The boombox metaphor was retired. Sound became three persisted toggles
  (GLOBAL, GAME SOUNDS, MUSIC) on the shift-settings blackboard, an in-game
  mute for game sounds only, and a per-sound Web Audio registry.
- The patient panel and the evaluation chart unified into one chart builder
  (`buildPatientChart`) with per-setting wrappers: transparent panel,
  CSS-drawn clipboard overlay, and a future review setting.
- The evaluation overlay, called Coach through the early builds, was renamed
  the **Chart** (2026-08-05): the panel is the patient's chart and tapping it
  zooms in. Code identifiers renamed to match.
- The opening screen's player-facing name became **ER ENTRANCE** (Lobby and
  Check-In were considered and rejected); internal keys keep `home`/`lobby`.
- Footer actions settled as `QUIT THIS SHIFT` and `END SHIFT EARLY`, both with
  confirmation dialogs.
- Recall gained its own sound (C5, E5), the open door kept a persistent
  outcome halo, the rails moved to a flat dark green, and the room wall and
  interior art was reserved for future layered room rendering.
- The Chart overlay gained a photo zoom lightbox; the presentation cards lost
  their section header (always visible).
- Phases 1 through 6 of document `9` were implemented and visually approved on
  desktop and iPhone.

### 2026-08-05 Phase 7: the clock comes alive

- One 250ms logical scheduler landed: live countdown, pause via reasons, and
  the timer-zero ending. Pause reasons settled as `confirmation` and
  `document-hidden` only — the Chart deliberately does NOT pause (reading a
  patient costs shift time), reversing the earlier chart-pause plan.
- The clock starts after a 2-second acclimation delay so the player can take
  in the game screen.
- Four clock sounds joined the Web Audio registry (tick, minuteTick,
  countdownTick, endDong), with the doc 3 cue schedule verified quarter by
  quarter under Node. John tuned the ending: the last TWO seconds beat on
  every quarter as a run-in to the dong.
- RUSH gained its white pop-and-dissolve countdown numerals (10..1, centered
  on the middle of the patient image) and the full arrival engine: intervals
  walking down 10,9,8...1s (14.5s start for 120s), 20% double bursts with the
  second member exactly 250ms behind, and a silent queue shake when a full
  waiting room refuses an arrival.
- The clipboard lost its metal clamp: the header row is now PATIENT CHART
  (left), the LIVE shift clock, and the red X. The clamp CSS is kept
  commented in styles.css in case the look returns.

## Historical lookup

Use [the archive index](archive/README.md) only when older rationale is needed.
Historical files explain their era; they do not override current numbered docs.
