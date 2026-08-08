# triageRush — specifications (pointer file)

**Last modified:** 2026-08-08 (the ABOUT board is BUILT and APPROVED)

## 2026-08-08 (second session): the ABOUT board is BUILT and APPROVED

Cache `2026-0808-about1d`. John: **"lets call that about panel done and
approved."** The old About board was four paragraphs of placeholder prose
on the whiteboard; it is now a designed reading surface. Designed in
`_mockups/about-board-mockup.html` and built the same session, through
five rounds of John's edits.

- **The board, top to bottom:** the Triage RUSH! logo in the 3D brand
  lettering; John's opening paragraph naming the game as a hospital **ED**
  triage game/simulator; HOW TO PLAY, a blue marker heading over a
  full-width rule with eight dashed lines under it (four actions, the two
  modes, the two scoring difficulties); and a centered footer carrying the
  fictional-content line and `v 0.19.2 09/2026 jp/claude/chatty`.
- **ONLY THE LOGO IS 3D** (John). Every later mention of the brand is
  FLAT - same Arial Black face, same brand red, extrusion removed. At body
  size the stacked shadows read as fringing rather than depth, and they
  competed with the logo four lines above. The brand never breaks across
  two lines.
- **Variant A "ruled" won** the heading comparison; numbered discs and
  quiet single-ink caps were both rejected. The heading is BLUE, a second
  dry-erase marker, because red would sit too close to the brand's own
  red-orange right above it.
- **The WELCOME and CREDITS headings were cut** by John after seeing them:
  the intro needs no label when the logo introduces it, and the credits
  became the footer. HOW TO PLAY is the only headed section.
- **ONE SCREEN IS THE CONSTRAINT, and it was measured, never guessed** -
  in the real app at a 375px shell, at every wording change. The board
  ends with 33px between the last step and the footer (26px at a 320px
  window). If the copy ever outgrows the face the answer is to make it
  SCROLL like the patient chart, or to break the sections into buttons -
  **not** to shrink the type.
- **A blank line above the two mode lines was spent** to buy the two
  difficulty lines, with John's leave ("you can get rid of the space above
  the Triage lines if necessary"). It was necessary: keeping it left 7px
  of slack.
- **The whiteboard's face is NOT the blackboard's.** The shared
  `.popup-content` insets were tuned for the blackboard and sit outside the
  whiteboard's white area, so the About board now carries its own. This was
  a live bug: anything drawn to the full shared width rode onto the silver
  frame.
- This closes the About half of the old "Settings and About placeholder
  text" backlog item. **Settings placeholder text is still open.**
- Docs 3/6/7/9 carry the built spec; doc 7 has the layout rules and doc 6
  the two boards' differing face rects.

## 2026-08-08 (first session): two icons fixed, and five items closed

Cache `2026-0808-icon1c`. Two small builds — both about a GLYPH that could
not be read — plus a round of decisions.

- **THE MUTE ICON IS A DRAWN OVERLAY (TODO 6, BUILT).** The game-screen
  glyph is now ALWAYS the note ♪; muting dims it and lays a **red diagonal
  slash** over it from CSS (`.sound-button.is-muted::after` — a 2px bar at
  92% width, rotated 45°, cased 1px in the button's own background so it
  stays readable where it crosses the note). The old × glyph and the
  line-through are gone. Red because red already means OFF everywhere in
  this game — the settings radios, the summary-board values. The slash is
  drawn rather than typed because **no plain-text muted-note character
  exists**: the Unicode mute glyphs are colour emoji on iOS and would look
  nothing like the rest of the header.
- **THE MUSIC-UNLOCK GLYPH IS NOW ♫, AND IT IS APPROVED** (John: "that
  amber eight note is perfect. it will work."). It went 🎼 → 🎶 → ♫ in one
  sitting, both changes on appearance: the staff was clutter at drum size,
  and the notes emoji drew DARK GREY on the blackboard. **A colour emoji
  carries its own palette inside the font and ignores CSS `color`** — that
  is the durable lesson. U+266B is a TEXT character, so it takes
  `var(--amber)` and reads clearly. `ui.js writeInitials()` wraps that one
  symbol wherever initials are drawn; the report's cream paper reverts it
  to ink. No migration was written, by John's instruction — there are no
  users, so old saved names simply fall back to defaults once.
- **TODO 3 (settings blackboards) is FULLY CLOSED** — John's pass on the
  summary boards, "fine, on iPhone and on desktop", and the review lines
  confirmed as variant A (plain lettering).
- **TODO 10 (loudness switch) is CLOSED as already delivered** by the
  settings boards: GLOBAL SOUND plus off/lo/hi for GAME SOUNDS and MUSIC.
  DECLINED, not pending: the game-screen icon will NOT cycle levels — it
  stays a global toggle, because one persisted value should not mean two
  different things.
- **MUSIC LOUDNESS IS SETTLED** (John: "it is fine where it is").
  `MUSIC_VOLUME` stays lo 0.02 / hi 0.06; the game family stays 0.22 / 1.
  They were expected to want raising against the compressed tracks and did
  not. Only the 3.3 dB spread BETWEEN tracks is still unjudged, and it is
  not urgent.
- **TODO 9 (iOS silent sounds) is CLOSED** — "not a problem in some time";
  no recurrence in four sessions since the 2026-08-06 hardening. Reopen if
  it returns; the three iOS Web Audio fixes and what to observe are kept in
  the DONE entry.
- **TODO 18 (board art paints after the text) stays OPEN and HELD.** Do not
  fix it yet: the loading rework (TODO 1 + the asset-loading debt at Phase
  10) decides what is decoded up front and may change or erase the symptom.
- **The game header keeps `Triage RUSH!` in RUSH mode** (John: "not a
  question"). Shortening it to `RUSH!` is rejected, not deferred.
- **THE FORMER MUSIC STREAM IS SCRUBBED FROM THE LIVE DOCS** (John: "remove
  all the kingfm stuff - it is history"). The station name is gone from the
  code comments, docs 1/3/4/6/7/8, and these two files; item 20's pre-build
  decision record was deleted outright. What was KEPT, because it still
  binds every future audio decision, is the constraint without the story:
  **music must stay LOCAL**, since iOS ignores `HTMLMediaElement.volume`
  and the gain node that carries the level needs CORS for a remote source,
  which iOS then refuses to play. Frozen history — `docs/2-dev-history.md`,
  `docs/archive/**`, and past ToBeContinued files — was left alone.

Open work is now THREE items: 1 (50-patient queue), 11 (shift history),
and 18 (held for the loading rework). Items 3, 6, 9 and 10 all closed
today.

## 2026-08-07 (fourth session): music became LOCAL FILES

TODO 20 is DONE (cache `2026-0807-music1b`). The stream lost because iOS
ignores `HTMLMediaElement.volume` and the Web Audio gain node that would fix
it needs CORS, which the routed element then refused to play on the iPhone -
so on John's primary device music had no level control at all. Local files
are SAME-ORIGIN, so the gain node works and lo/hi are finally real there.

- **Five tracks, played in manifest order and looped forever.** Music plays
  everywhere - entrance, shift, report - and a new shift never interrupts or
  restarts it. Turning it off and on again restarts at the first track; a
  level change mid-track does not. After a reload the first tap anywhere
  starts the playlist, because browsers refuse to resume audio unattended.
- **The sound was chosen before the code was written.** A seven-way
  listening test at the game's real 6% volume; John picked the most extreme
  option: an AM radio, 400 Hz - 3.2 kHz, hard-compressed, 24 kbps mono.
  37 MB became 2.5 MB. **Filtering first is what buys the small file** - the
  lowpass throws away exactly the treble a low bitrate would wreck. The
  filter is BAKED INTO THE FILES; nothing in the game filters audio.
- **The files are anonymous by design.** They are copyrighted songs in a
  public repo, and their ID3 tags named song, artist, album, label and
  catalog number - so renaming alone would have achieved nothing. They ship
  as `track-NN.mp3` with metadata stripped; originals, the name mapping, and
  the listening test are gitignored.
- **MUSIC IS UNLOCKED BY THE PLAYER'S NAME** (John). ♫ joined the initials
  alphabet; if it is the MIDDLE of three initials, the MUSIC row appears on
  both the settings board and the summary board and playback is possible.
  Otherwise the row is ABSENT - not disabled - and no audio file is fetched
  at all. Renaming away locks it again but keeps the chosen level saved.
  John's own framing: an easter egg, not protection; 2-5 people will ever
  play this.
- **All the stream machinery is gone**: crossOrigin, the CORS fallback,
  `abandonMusicRouting`, the failure path that wrote preferences, and
  `UI.setPendingMusicLoudness`. What survived is what earned it - the gain
  node, the pagehide release, audition-on-tap, cancel-reverts-to-saved.
- **`MUSIC_VOLUME` (lo 0.02 / hi 0.06) was expected to want raising** —
  the numbers were set against the loud, unfiltered stream. SUPERSEDED
  2026-08-08: John listened and settled them exactly where they were. Only
  the 3.3 dB spread between the five tracks is still open.

## 2026-08-07 (fourth session): the game header names the MODE

The header showed `Triage RUSH!` in both modes. After a playthrough John
found that confusing - it read as branding and said nothing about which
shift was being played - so it now shows the MODE: `Triage!` or
`Triage RUSH!`, with `Triage!` a step larger (1.4em) and centered in the
same space. Both spellings are static markup in one `<p>`; ui.js unhides
one, exactly as the sidewalk summary board does. The two modes are sized
separately, the same rule that board follows.

A measurement worth remembering: the header cell is CONTENT-sized (the grid
column is `fr`, but the brand is `nowrap`, so the column's floor is the
text). The mode name therefore cannot clip - past ~2.07em it would squeeze
the scorecard instead. In RUSH mode the header is unchanged, because
`Triage RUSH!` IS that mode's name.

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
  MUSIC each carry their own level (off/lo/hi), so per-family on/off
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
- **THE STREAMED MUSIC SOURCE WAS DROPPED; music goes LOCAL** (John,
  2026-08-07). iOS ignores `HTMLMediaElement.volume`, and the only
  mechanism it honors - a Web Audio gain node - needs CORS for a remote
  source, which the routed element then refused to play on the iPhone. So
  the stream had no level control at all on the primary device, at full
  volume against the game sounds. Local files are same-origin, so the gain
  node works and lo/hi are real on the phone. Built later the same day;
  see the fourth-session entry above.
- **Sound levels audition as you tap them** (2026-08-07): music plays
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
  GAME SOUNDS and MUSIC are off/lo/hi rows — OFF replaces per-family
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
