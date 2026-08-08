# triageRush — specifications (pointer file)

**Last modified:** 2026-08-07 (summary boards + REVIEW LAST SHIFT built)

## 2026-08-07 (third session): the SUMMARY boards are BUILT, and TODO 13 with them

The two sidewalk boards on the ER ENTRANCE now carry lettering (cache
`2026-0807-summary1h`), designed in
`_mockups/summary-boards-mockup.html` and built the same session. This
closes the last design piece of TODO 3 and, because the review buttons
live on one of them, all of TODO 13.

- **Same lettering as the detail boards**, inside the ribbed FACE of
  each board's art. The rects are measured off the 852x1515 canvas and
  are deliberately SMALLER than the old hotspots, so no lettering can
  ride onto the wooden frame.
- **Nothing marks either board as tappable** (John): a player will try
  the board and get the detail board. The GAME board therefore carries
  no title of its own - its first line is `GAME MODE`, the label for
  the brand words under it.
- **The GAME board mirrors all six values.** OFF prints red, the same
  meaning the detail board's red OFF radios carry, and GLOBAL SOUND off
  dims the two level rows because they are moot. The brand stays on ONE
  line in both modes (John) so nothing below it shifts.
- **Only the mode is enlarged on that board** (John, 2026-08-07):
  everything else, labels and values alike, runs at one size, because
  the values are white against dim labels and stand out on colour
  alone. "Triage!" is set to the player board's initials size; "Triage
  RUSH!" is left exactly as it was, since 12 characters already fill
  the face on one line. The mode row reserves the taller of the two.
- **iOS no longer zooms when you tap the odometer** - stepping a drum
  looked like a double-tap to the phone. Pinch zoom is untouched.
- **The PLAYER board is two halves that behave differently.** Above the
  rule, WELCOME! + the player's name, and that half IS the button that
  opens PLAYER NAME - **the edit target stops at the rule** (John).
  Below it, two buttons, each one hit box reading REVIEW over LAST
  SHIFT / PAST SHIFTS, centered with equal air above, between and below.
- **Both boards hang their lettering from the top frame** (John), which
  puts the rule at about 36% down the player board and hands the rest
  to the review buttons - 30px of tap on the smallest phone, 38px on
  John's.
- **REVIEW LAST SHIFT works** (TODO 13). A shift that reached SHIFT
  ENDED is snapshotted; quitting clears it; the button dims when there
  is nothing to open rather than disappearing. It reopens the REPORT,
  not the SHIFT ENDED beat, and shows the shift AS PLAYED - its mode,
  difficulty, length and provider - even after the player has changed
  settings. In memory only until Phase 9.
- **REVIEW PAST SHIFTS** (TODO 11) is on the board but inert until
  Phase 9 persistence gives it a list.
- Placement note: TODO 13 originally put this button on the sidewalk in
  the bottom-right of the art. It is on the player board instead.

Doc 7 carries the built spec. Sizes were set by the widest string each
line can hold, measured at 375px - re-measure there before enlarging
anything on these boards.

## 2026-08-07 (second session): the detail settings boards are BUILT

The PLAYER NAME and GAME OPTIONS letter boards are in the game (cache
`2026-0807-boards1a`), lifted from the locked mockups in lettering
variant A — John's pick. What this changed beyond appearance:

- **Sound model.** GLOBAL SOUND (off/on) is the master; GAME SOUNDS and
  KING-FM each carry their own level (off/lo/hi), so per-family on/off
  toggles are gone. Levels are real volume: one gain node for every game
  sound (off 0, lo 0.35, hi 1) and the same figure on the music
  element's volume.
- **The game screen's sound icon IS the GLOBAL SOUND setting** — one
  persisted value seen twice. Tapping it writes and saves the
  preference, and music follows it. The old per-shift
  `gameSoundsAudible` runtime flag is retired.
- **The player name is set on odometer drums, never typed** — chevrons
  or the platform picker. The initials alphabet is A-Z, "-", and seven
  emoji; "Hey you!" joined the titles.
- **A selected OFF fills red instead of green.** Still a native radio
  (accent-color), so it draws correctly in every state, iOS included.
- **The sidewalk summary boards were blank at this point** (John): they
  opened the detail boards and nothing more. Superseded the same day —
  see the third-session entry above, where they were designed and built.
- **The boards are ~20% bigger**, and it cost no layout work: both
  board PNGs carried about 20% transparent margin, so cropping them to
  their own edges made the same card show a much larger board. The
  visible board went from 74.7% to 90% of the shell's width. Two things
  surfaced while measuring it - the GAME MODE row had been spilling onto
  the board's wooden frame on the iPhone (the brand words are now at the
  regular option size), and the board face had been uppercasing the
  brand, which now keeps its "Triage RUSH!" sign spelling.
- **KING-FM IS BEING RETIRED; music goes LOCAL** (John, 2026-08-07). iOS
  ignores `HTMLMediaElement.volume`, and the only mechanism it honors - a
  Web Audio gain node - needs CORS, which the routed stream element then
  refused to play on the iPhone. So the stream had no level control at all
  on the primary device, at full volume against the game sounds. NOTHING
  WAS CHANGED IN THE APP at John's instruction: the stream still plays.
  Local files are same-origin, so the gain node will work and lo/hi will
  finally be real on the phone. TODO.md item 20 has the plan and lists
  what carries over (everything but the source URL and the CORS
  fallback).
- **Sound levels audition as you tap them** (2026-08-07): KING-FM plays
  or stops immediately, a GAME SOUNDS tap plays one sample sound, and
  both follow the board's pending selections. Cancelling the board puts
  music back to the saved setting - the red X discards an audition just
  as it discards an edit. Music also got its own, much quieter scale
  (lo 0.08 / hi 0.25 against the game family's 0.35 / 1): it is
  background audio, and a broadcast stream is mastered far hotter than
  the game's synthesized sounds.
- **Temperature shows both scales** as "36.8 / 98.2" under a TEMP C/F
  label (TODO 19). The records are Celsius and stay that way; the
  conversion is display-time only, in the one chart builder, so the
  panel, Chart, and Patients Seen all agree.
- The recall hint now reads TAP THE TRIAGE ROOM DOOR TO RECALL YOUR MOST
  RECENT PATIENT (TODO 17).

Docs 4/6/7/8/9 were swept the same session; TODO.md item 3 carries the
build record and what remains.

## 2026-08-07: hints removed + blackboard redesign locked

- **UI hints REMOVED from the game** (TODO 5 resolved, cache
  2026-0807-hints1a): queue badges and the Show UI hints setting are
  gone; the patient-panel empty-state arrows are PERMANENT. Rationale:
  finish the game, play test, and only design hints (the glow idea)
  from where testers actually get stuck. Scroll indicators and the
  shift-over tap line are navigation affordances, not hints — kept.
  Docs 3/4/7/8/9 already swept.
- **Settings blackboards (TODO 3): both boards' looks LOCKED as
  phone-true mockups** — nothing in the game yet. Authoritative record:
  TODO.md item 3 "Design state". Boards: **PLAYER NAME** (Vegas-odometer
  drums for title + initials; dual input, chevrons or native picker, no
  keyboard; initials A-Z + "-" + 7 emoji; titles gain "Hey you!") and
  **GAME OPTIONS / SOUND OPTIONS** (two-line setting-groups, headline
  GAME MODE with enlarged brand words + headline GLOBAL SOUND;
  GAME SOUNDS and KING-FM are off/lo/hi rows — OFF replaces per-family
  toggles). The game-screen sound icon will BE the global sound setting
  (one persisted value). No ambiance option until ambient assets exist.
  Mockups: `_mockups/settings-letterboard-mockup-{PLAYER,GAME}.html`.
- Player titles change (built earlier, committed with this session):
  LPN + PA removed, MR/MRS/M/MS added; stored LPN/PA maps to Doctor.

## Fourth session (2026-08-06 evening): BUILT + docs swept

- **Art diet:** all 38 room/waiting PNGs (doors, interiors, wall, waiting
  backgrounds) resized for delivery — 170 MB → 5.5 MB — sized for the
  iPhone 3x shell with headroom. Hi-res originals in
  `assets/HIRES-ORIGINAL-ART/`; script in `assets/_asset-audit-and-resize/`.
  This also fixed the quarter-second bare-doorway flash on assignment
  (TODO 14) with no preload code.
- **Row-owned waiting backgrounds (TODO 8):** a fresh background is chosen
  whenever a patient enters the waiting room; it never travels. active/
  assigned records carry no background key anymore.
- **Vitals icons (TODO 12):** six hand-authored inline SVGs (defs in
  index.html, `<use>` per tile) recreating the vitals-bubble artwork;
  variant A tile layout (icon left, label over value). Resolves the old
  "six missing vital icons" item — no icon assets needed, ever. Mockup:
  `_mockups/vitals-icons-mockup.html`.
- **Room patient APPROVED** (TODO 7 closed): center 45%, bottom 9%,
  height 80%, max-width 66%.
- **Docs sweep DONE:** docs 1/3/6/7/8/9 now carry the current brand, the
  layered rooms, the row-owned backgrounds, the resized asset dims, and
  the vitals icons; doc 2 gained the 2026-08-06 dev-history entries.
  TODO 13 (REVIEW LAST SHIFT? button on ER ENTRANCE) was added this
  session; placement TBD (sidewalk vs erasing the Emergency sign).

## Branding + naming policy (2026-08-06, third session): BUILT

The game's NAME is **"Triage RUSH!"** — the ER ENTRANCE sign's spelling
(space, mixed case, exclamation) — in ALL places and BOTH modes: game
header, Shift Report masthead, shift-over screen, page title, ABOUT.
**"Triage!"** alone names the MODE in exactly two places: the report's
"MODE: Triage!, Forgiving, 5 minutes" line and the settings mode-chooser
radios. The ! is part of the name even mid-sentence. This supersedes
"TriageRUSH" (2026-08-05).

The lettering mimics the sign with fonts only (mockup variant B,
`_mockups/brand-font-mockups.html`): red-orange face #ec543d sampled from
the art, stacked brick-red 3D extrusion, Arial Black stack, RUSH! a step
larger. Layout rulings: the report masthead is one centered unit (brand +
gap + serif "Shift Report"); the game-header brand centers between left
edge and scorecard; on the shift-over screen the brand baseline sits at
~30% of the shell height, SHIFT ENDED's at ~50%, and the tap hint is
white/bold/count-sized with rules above and below. Chalk boards were
deliberately left unstyled for TODO 3.

TODO item 4 (ABOUT letters in the entrance art) was RESOLVED by John
choosing to keep the original image — do not re-pitch.

## Layered room composition (2026-08-06, third session): BUILT

Each triage-room cell stacks, back to front: flat green rail color →
shared wall art → per-room interior scene (in the door-art box) →
assigned patient standing in the doorway (open room only) → door art,
whose transparent open doorway does the reveal. The reserved
wall/interior PNGs are live manifest assets. The patient figure was
fine-tuned and APPROVED (fourth session): center at 45% of cell width,
bottom 9%, height 80%, max-width 66%. Docs are current as of the
fourth-session sweep.

## Pacing + sound revision (2026-08-06, second session): BUILT

Timing changes, folded into docs 2/3/8/9: the shift clock starts on the
player's FIRST patient selection (replacing the 2-second acclimation delay —
until that tap nothing runs and the player may study the board freely, both
modes), and RUSH gained an empty-room courtesy refill (an assignment that
empties the waiting room brings in one or two patients — a coin flip — one
second later, doinks included, without disturbing the scheduled arrival
curve). This retires the "RUSH must never leave an empty waiting room"
backlog item.

Sound changes, same session: Triage's clock now plays the RUSH-style
three-beat ("dink dink donk") at EVERY ten-second boundary, and each
completed minute lands the new minuteDong bell ("dink dink dooooonk") —
John approved the sound by ear. The iOS silent-sounds glitch was hardened
against (interrupted-state resume, pagehide context close, visibility
nudge); TODO.md item 9 stays open for observation.

A standing TODO list now lives in `claude-john-docs/TODO.md` (11 items,
John's words + Claude notes). Item 1 (50-patient per-game queue) and item
11 (shift history queue) are the big ones; item 1 legitimately revives a
NARROW slice of the abandoned patient-limit redesign — loading policy and
graceful exhaustion only, still no win state / ceiling / grade.

## Doc 10 is BUILT (2026-08-06)

All seven approved changes in `docs/10-approved-pending-changes.md` were
built together on 2026-08-06: the left-waiting penalty is gone from every
mode (and from the display); the review table always shows CLOSE (NA under
Strict); the new header (`TRIAGE Shift Report` / `TriageRUSH Shift Report`
with "Shift Report" in serif small-caps, and a prominent `MODE:` line with
the configured length — RUSH in seconds, Triage in minutes); one acuity
ladder for direction (psych=6, discharge=7) so every miss moves a counter;
the review is variant B "LEGIBLE"; the direction counters sit in one boxed
section with the disclaimer and swap their own text for an explanation on
hover or tap; and a stopped-early shift marks its DURATION
`0:42 * ended shift early`. Docs 3, 7, 8 and 9 are authoritative again; doc 10
remains as the decision record. Next work: Phase 9 (persistence/recovery).

Doc 5 also gained an AUTHORING RULE for when Psych or Discharge may be the
correct room — recovered from the archive, where it had been sitting
unreferenced since July and had been misremembered twice as a result.

## A redesign was explored and ABANDONED (2026-08-05)

A finite patient pool per shift — patient limits, a win state, a score
ceiling — was designed in full and then abandoned the same day. John chose to
continue with the game as originally conceived, WITHOUT patient limits: the
game as it now stands. Nothing was built; docs 1-9 were never in question.

Both files are in `docs/archive/design-notes/` marked ABANDONED. They are
kept only so the idea is not rediscovered and re-pitched. Do not build from
them.

## Where the real specifications live

This project keeps its full design/gameplay specification in the numbered
`docs/` set — do NOT duplicate it here:

- `docs/3-gameplay-rules-and-specs.md` — rules, scoring, evaluation order
- `docs/7-mobile-ui-and-interaction-spec.md` — 9:16 shell, screens, input
- `docs/4-coding-contracts-and-specs.md` — architecture contracts
- `docs/8-implementation-blueprint.md` — state shape, actions, algorithms
- `docs/9-implementation-plan-and-acceptance.md` — phase order + tests

Read `docs/1-start-here-toc.md` first; historical files never override
the numbered set.

## Sweep status

The 2026-08-05 documentation sweep is DONE: all 2026-08-04/05 amendments
(Chart rename incl. code identifiers, ER Entrance, QUIT THIS SHIFT / END
SHIFT EARLY, three-toggle sound model, recall sound, door halo, flat green
rails, no PRESENTATION header, photo zoom lightbox, empty-state hints,
nameplate chip) are folded into docs 1-9. The loose amendment notes moved to
`docs/archive/design-notes/`. There is no pending amendment layer.

Phase 7 (2026-08-05 afternoon) folded its decisions into docs 3/4/7/8/9 as
they were made: Chart does not pause, 2-second acclimation delay, last-two-
seconds countdown run-in, numerals centered on the patient image with an
expand-dissolve exit, and the clipboard header row (PATIENT CHART + live
clock + red X, metal clamp retired but kept commented in styles.css).

Phase 8 (2026-08-05 evening) is folded into docs 1/3/5/7/8/9: the shift-over
acknowledgement (TIME'S UP / SHIFT ENDED, waits for a tap), the Patients Seen
browser (position in the header slot, no name banner, fixed arrows beside the
photo, scrolled fraction carried between patients, pinned nameplate, outcome
mark plus photo badge, no photo zoom - zoom later ADDED 2026-08-06), and
the correction that
`answer.otherAcceptableRooms` is dead data - full credit is derived by
`fullCreditRoomKeys`.

The Shift Review's look is now FINAL (2026-08-06): variant B "LEGIBLE" from
`_mockups/shift-review-mockups.html`, lifted into styles.css section 9. The
supervisor-evaluation motif (FORM ED-7) was explored across four variants and
NOT adopted. Two rulings from that exploration are permanent: the review must
make NO claim about performance "for level of training" (we are not medically
qualified to set that bar), and it must NEVER fault the player for patients
left in the waiting room. The review carries no grade at all — with the pool
redesign abandoned the score has NO ceiling, so a percentage-based grade has
nothing to rest on; do not reintroduce one without solving that first.
