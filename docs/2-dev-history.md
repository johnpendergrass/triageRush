# Development History

**Last modified:** 2026-08-07

**Latest change:** Recorded the sidewalk summary boards, which brought the
review destinations onto the ER ENTRANCE with them.

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
  in the game screen. (Superseded 2026-08-06: the clock now waits for the
  first patient selection instead.)
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

### 2026-08-06 Pacing revision: the player sets the pace

- The shift clock now starts on the FIRST patient selection, replacing the
  2-second acclimation delay: the player may study the waiting room for as
  long as they like, and nothing — ticks, arrivals, elapsed time — runs
  until they commit to a patient.
- RUSH gained the empty-room courtesy refill: an assignment that empties
  the waiting room brings one or two patients (a coin flip) through the
  door one second later, doinks included, WITHOUT disturbing the scheduled
  arrival curve. The player is never left with nobody to see.
- Triage's clock found its voice: every ten-second boundary now carries the
  RUSH-style "dink dink donk" three-beat, and each completed minute lands a
  new minuteDong bell ("dink dink dooooonk") — endDong's family, higher and
  much shorter, so a minute is unmistakable without sounding like the end.

### 2026-08-06 Brand, room layers, art diet, and vitals icons

- The game's NAME became "Triage RUSH!" everywhere, in both modes — the ER
  ENTRANCE sign's spelling recreated with fonts alone (mockup variant B:
  flat #ec543d face, stacked brick-red 3D extrusion). "Triage!" alone names
  the mode in exactly two places (Shift Report MODE: line, settings radios).
- The layered room composition was built and approved: wall art → room
  interior → assigned patient → door art in every cell, the open doorway
  doing the reveal. The patient figure was tuned live with John (center
  45%, bottom 9%, height 80%).
- All 38 room/waiting art files were resized for delivery — 170 MB became
  5.5 MB — with the hi-res originals kept in assets/HIRES-ORIGINAL-ART/.
  The resize also cured the quarter-second bare-doorway flash on
  assignment, so no preload code was ever written.
- Waiting backgrounds became ROW-owned (a fresh scene whenever a patient
  enters the queue): the traveling-background rule and its bookkeeping on
  active/assigned records were removed.
- The vitals tiles gained their icons: six hand-authored inline SVGs
  recreating the vitals-bubble artwork (no icon assets ever needed),
  variant A layout — icon left, label over value, tile height unchanged.

### 2026-08-07 Hints removed, and the settings boards built

- The UI-hints system was REMOVED rather than redesigned: finish the game,
  play test it, and only build hints from where testers actually get stuck.
  The patient panel's empty-state arrows became permanent.
- Both detail settings boards were designed as phone-true mockups, locked,
  and then BUILT: PLAYER NAME (odometer drums for title and three initials,
  chevrons or the platform picker, never a keyboard, alphabet A-Z + "-" +
  seven emoji) and GAME OPTIONS / SOUND OPTIONS (two-line setting groups,
  headline GAME MODE and GLOBAL SOUND). Lettering variant A.
- The sound model was rewritten with them: GLOBAL SOUND plus a level per
  family (off/lo/hi) replaced the three on/off toggles, levels became real
  volumes through one gain node, and the game screen's sound icon BECAME the
  GLOBAL SOUND setting - retiring the per-shift runtime mute entirely.
- Levels audition as they are tapped, since the boards live on HOME where a
  player would otherwise be choosing a volume they cannot hear. Cancelling
  the board discards an audition exactly as it discards an edit.
- Both board images were cropped to their own edges (they carried ~20%
  transparent margin), which made the same card show a board about 20%
  larger - John's "more finger room" - and cut their decode cost.
- The vitals tiles gained unequal columns so temperature could show both
  scales (`37.0 / 98.6`), and their icons grew with the space that freed.
- KING-FM MET ITS LIMIT: iOS ignores `HTMLMediaElement.volume`, and the Web
  Audio gain node that would fix it requires CORS, which the routed element
  then refused to play on the iPhone. Two rounds of ear-tuning and a routing
  rewrite could not give the stream a working volume control on the primary
  device. The decision was to retire the stream for LOCAL MUSIC FILES, which
  are same-origin and therefore controllable everywhere. Not yet built.

### The ER ENTRANCE speaks (2026-08-07, third session)

- The two sidewalk boards, blank since the entrance art was accepted, got
  their lettering - the same press-in letter-board look as the settings
  boards they open, so a board and its close-up read as one object.
- The GAME board became a read-only mirror of all six settings. Only the
  mode is enlarged: everything else runs at one size, because the values are
  white against dim labels and stand out on colour alone.
- Nothing announces that either board is tappable. That was a deliberate
  ruling: a player will try the board, and the detail board is what they get.
- The PLAYER board took on a second job and split in half - a welcome above
  the rule, and below it the review destinations. This is where REVIEW LAST
  SHIFT finally landed, having been imagined as a sidewalk button.
- With it came the first piece of shift MEMORY: a shift that reaches SHIFT
  ENDED is snapshotted, and the report can be reopened from the entrance,
  showing the mode, difficulty, length and provider it was PLAYED with rather
  than whatever is set now. Quitting clears it. It lives in memory until
  Phase 9 persistence, which is also what will turn it into the queue of
  past shifts.
- A phone finding worth keeping: stepping the odometer drums zoomed the page,
  because two chevron taps inside 300ms IS iOS's double-tap gesture. Every
  control now opts out of double-tap zoom while pinch zoom stays untouched.

### The radio becomes a record player (2026-08-07, fourth session)

- KING-FM was RETIRED and music became five LOCAL files. Same-origin was the
  whole point: the gain node the iPhone honors finally works, so lo/hi are
  real there. Every scrap of CORS and fallback machinery - it existed only to
  fight that one problem - came out with the stream.
- The sound was chosen before the code. A seven-way listening test compared
  bitrates and filters at the game's real 6% volume, and John picked the
  most extreme: an AM radio, 400 Hz to 3.2 kHz, hard-compressed, 24 kbps
  mono. 37 MB became 2.5 MB.
- The lesson from that test is worth keeping: **filtering first is what buys
  the small file.** Low bitrates wreck the treble first, and the lowpass had
  already thrown that treble away, so the encoder had nothing left to ruin.
  The same 24 kbps on unfiltered music sounds underwater.
- Anonymity turned out to be half the job. The files are copyrighted songs in
  a public repository, and their ID3 tags named the song, artist, album,
  label and catalog number - so renaming them alone would have accomplished
  nothing. They ship as `track-NN.mp3` with all metadata stripped; the
  originals, the name mapping, and the listening test are gitignored.
- MUSIC IS UNLOCKED BY THE PLAYER'S NAME. A 🎼 symbol joined the initials
  alphabet, and putting it in the MIDDLE reveals the music row on both
  boards; without it nothing is shown and no audio file is requested. John
  first proposed a hidden title, then chose this: a short title list cannot
  hide anything, but three drums of 35 symbols can. An easter egg, not a
  lock - stated plainly at the time and accepted as such.
- The GAME HEADER now names the MODE, not the game. `Triage RUSH!` in both
  modes had read as branding and told the player nothing about which shift
  they were on. A measuring surprise came with it: the header cell is
  content-sized, so the mode name cannot clip - past a point it squeezes the
  scorecard instead.

## Historical lookup

Use [the archive index](archive/README.md) only when older rationale is needed.
Historical files explain their era; they do not override current numbered docs.
