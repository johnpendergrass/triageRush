# triageRush — To Be Continued (2026-08-08 12:35 PDT)

## State: the ABOUT board was rebuilt from scratch and APPROVED. It is
## the only build of this session. One new TODO was raised at the end.

Cache version: **`2026-0808-about1d`** (index.html x5 + assets.js — bump
BOTH on every change).

## Built this session: the ABOUT board (TODO 23, DONE)

John: *"lets work on the ABOUT page ... It should have the Triage RUSH!
logo at top, in a nice 3D look ... All need to fit on the one screen."*
Closed the same day: **"lets call that about panel done and approved."**

The old board was four paragraphs of placeholder prose on the whiteboard.
It is now a designed reading surface, top to bottom:

- the **Triage RUSH! logo** in the 3D brand lettering;
- **John's opening paragraph** naming the game a hospital **ED** triage
  game/simulator;
- **HOW TO PLAY** — a blue marker heading over a full-width rule, then
  eight dashed lines: four actions, the two modes, the two difficulties;
- a **centered footer**: the fictional-content line, then
  `v 0.19.2 09/2026 jp/claude/chatty`.

### The rulings, so they are not relitigated

- **ONLY THE LOGO IS 3D.** Every later brand mention is `.brand-flat` —
  same Arial Black, same brand red, extrusion removed, nowrap. At 15px
  the four stacked shadows read as fringing and compete with the logo
  above. Do not use `.brand-sign` in body copy on this board.
- **Variant A "ruled" won.** Numbered discs (John's own "1. 2. 3." made
  literal) and quiet single-ink caps were both seen and rejected.
- **The WELCOME and CREDITS headings were CUT by John after seeing
  them.** The logo introduces the paragraph, so it needs no label; the
  credits became the footer. HOW TO PLAY is the only headed section.
- **The heading is BLUE** (`--marker-blue #1f4e79`), a second dry-erase
  marker — red would sit too close to the brand's red-orange above it.
- **ONE SCREEN is the constraint.** If the copy ever outgrows the face,
  make it SCROLL like the patient chart or split the sections into
  buttons. **Do not shrink the type to squeeze more in.**

### The two findings worth keeping

- **The whiteboard's face is NOT the blackboard's, and the shared insets
  were wrong for it.** `.popup-content`'s 3.9/3.5/6.6/7.8 were tuned for
  the blackboard, whose ribbed face is 15.9%–83.5% of the card. The
  whiteboard's white area is x 7.4%–93.5%, y 3.8%–97.2% (measured on the
  art at x 56–703, y 52–1348 of 752×1387), so the shared insets sit
  OUTSIDE it — anything full-width rode onto the silver frame. This was a
  live bug, not just a design choice. `.popup-content--marker` now
  carries its own 10/10/7.5/6.
- **A bottom-parked footer defeats the obvious fit measurement.** With
  `margin-top: auto`, content height reads as exactly 100% of the face
  right up until it overflows. The number that means anything is the
  SLACK ABOVE THE FOOTER. The mockup's first readout measured
  `scrollHeight` and cheerfully reported a half-empty board as full.

### Numbers — do not re-derive blind

- Shipped at **5.8cqw** body/steps with **33px of slack** at a 375px
  shell (26px at a 320px window, no overflow at either).
- **The binding line is the INTRO paragraph, not any step**: at 6.2cqw it
  takes a sixth line and the slack collapses.
- With the final copy: 6cqw + the old blank line = 7px; 6cqw without it =
  24px; 5.8cqw without it = 33px. The last shipped.
- The logo is `.brand-sign` at **11cqw** = ~87% of the face. "Triage
  RUSH!" runs about **7.6× its font size wide** — the ratio to re-derive
  from before enlarging it anywhere.
- The blank line above the mode lines was `.step-gap { margin-top:
  1.36em }` — a margin, never an empty `<li>` (a spacer list item is
  announced as a real empty item by a screen reader and draws its own
  dash). Spent on the two difficulty lines with John's leave; restoring
  it costs ~22px.
- `.popup-heading` and `.popup-fine-print` were DELETED — their only user
  was the old About board.

Every size was measured **in the real app at a 375px shell**, re-measured
after each of John's five wording passes. Console clean; both settings
boards re-checked and unaffected by the new insets.

## New TODO raised at the end of the session

**Item 24: ER ENTRANCE should be ED ENTRANCE everywhere.** John, on the
Shift Report's footer: *"the shift report says 'return to er entrance' —
we really should see about making sure that references are to the ED
ENTRANCE, since that is what they are officially called."* The About
board triggered it — John's own "whoops - ED, not ER" — so the two now
disagree on screen. It is a player-facing string sweep like the earlier
lobby→ER ENTRANCE and Coach→Chart renames; internal `home`/`lobby` keys
stay. **Check the artwork before declaring it done** — the entrance sign
reads EMERGENCY, so the art may need nothing.

## Docs swept this session

- **docs/3** — the About section now describes the built board.
- **docs/6** — records that the two boards' usable faces are DIFFERENT
  rects, with both measured.
- **docs/7** — a new "The ABOUT whiteboard" section carrying the layout
  and the rules above.
- **docs/9** — the About line in the phase list now describes what was
  built.
- **claude-john-docs/** — both spec files gained 2026-08-08 entries;
  TODO.md gained item 23 (DONE) and item 24 (open).
- `_mockups/about-board-mockup.html` is kept IN SYNC with what shipped
  and carries the rejected variants so they are not re-pitched.

## Immediate next work

1. **Play test.** Still the natural next move: every board is finished
   and signed off. It also feeds the parked hints question.
2. **TODO 24** — the ED ENTRANCE sweep. Small, well-defined, and the
   inconsistency is visible on screen right now.
3. **TODO 1 + the asset-loading debt — ONE design conversation.** The
   50-patient per-game queue, graceful exhaustion, and the startup rework
   that stops blocking READY on 160 JSON fetches plus every manifest
   image. TODO 18 rides along with it.
4. **TODO 11 + Phase 9 persistence — ONE design.** `state.lastShift` and
   the inert PAST SHIFTS button are already waiting on it.

## Old backlog still standing

**SETTINGS placeholder text** (the About half of that item is now
closed); RUSH arrival pacing revision; ambient ER soundscape (still gates
any ambiance option); confirm-dialog button redesign; countdown numerals
over the Chart; scorecard hover magnification (iOS has no hover);
favicon (still the only console 404); and the 3.3 dB loudness spread
across the five music tracks — a `loudnorm` re-run of
`transcode-music.sh` fixes it at no size cost, but nobody has judged it
by ear and it is not urgent.

## Do NOT re-propose

The WELCOME or CREDITS headings on the About board; 3D brand lettering in
its body copy; shrinking the About type to fit more copy; hints/glow work
before play testing; the full patient-limit redesign (TODO 1's narrow
slice IS approved); nav-arrow fade; review grade; brightening the ABOUT
letters in the entrance art; per-family sound on/off toggles; a
hand-drawn X for the OFF radios; any return to a streamed music source,
or the station name in live docs; a title on the GAME summary board, or
any marker announcing the boards are tappable; enlarging "Triage RUSH!"
in the header or on the summary boards; `RUSH!` alone in the game header;
REVIEW LAST SHIFT as a sidewalk button; the observation that the music
unlock is not real security; the game-screen icon cycling sound levels;
migration code for the old unlock glyphs; and the amber ♫ — glyph and
colour are signed off.

## Testing notes for whoever comes next

- **Stub `HTMLMediaElement.prototype.play/pause` before anything else**
  when driving the app through chrome-devtools, close the tab afterwards,
  and clear the test origin's localStorage. Music can be saved ON, so a
  reload plus one stray click is enough to leave a tab playing.
- Run Claude's test server on a port that is NOT 8090 (John's own) and
  kill it after: `python no-cache-server.py --port 8099`. Note the flag —
  it is `--port`, not a positional argument.
- Bump the cache version before trusting any measurement; Chrome serves a
  cached stylesheet across `location.reload()` when `?v=` is unchanged.
  `location.reload(true)` from the console is what actually re-fetched
  edited CSS during this session.
- **Measure board fit in the APP, not only in the mockup.** This
  session's copy changes moved the fit by 50px+ and the mockup and the
  game disagreed once, because the wording had moved on.
- game.js runs under Node with a small shim (global window +
  TRIAGE_RUSH_ASSETS stub + performance). Harnesses live in the session
  scratchpad and are ephemeral — rebuild from doc 9's acceptance tables.
