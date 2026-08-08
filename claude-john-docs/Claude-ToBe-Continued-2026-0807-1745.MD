# triageRush — To Be Continued (2026-08-07 17:45 PDT)

## State: third session of 2026-08-07. THE ER ENTRANCE IS FINISHED —
## both sidewalk boards carry lettering, and REVIEW LAST SHIFT works.
## TODO 3 is closed end to end; TODO 13 is done and moved to DONE.

Cache version: **`2026-0807-summary1h`** (index.html x5 + assets.js —
bump BOTH on every change).

## Built this session

### 1. The two SUMMARY boards (TODO 3, the last piece)

Designed in `_mockups/summary-boards-mockup.html` (phone-true, on the
real entrance art) and built the same session. Both letter the ribbed
FACE of their board art — rects measured off the 852x1515 canvas, and
deliberately smaller than the old hotspots, so no lettering can ride
onto the wooden frame. The frame and legs are no longer tap targets.

**Nothing announces that either board is tappable** (John's ruling): a
player tries the board and gets the detail board. That is also why the
GAME board has no title — its first line is `GAME MODE`, the label for
the brand words under it.

- **GAME board** mirrors all six values: mode, SCORING, LENGTH, then
  SOUND / GAME / MUSIC under a rule. An OFF value prints red, the same
  meaning the detail board's red OFF radios carry, and GLOBAL SOUND off
  dims the two level rows because they are moot. Lengths abbreviate
  (`5 MIN`, `60 SEC`) but keep their mode's units — RUSH's 60 must never
  read "1 MIN".
- **Only the mode is enlarged.** Everything else, labels and values
  alike, runs at 9cqw: the values are white against dim grey labels and
  stand out on colour alone (John). That freed the width and the air.
- **PLAYER board** is two halves that behave differently. Above the
  rule, `WELCOME!` + title + initials, and that half IS the button that
  opens PLAYER NAME — **the edit target stops at the rule** (John).
  Below it, two buttons, each one hit box reading `REVIEW` over
  `LAST SHIFT` / `PAST SHIFTS`, centered with equal air above, between
  and below.
- Both boards hang their lettering from the top frame, which puts the
  rule at ~36% and hands the rest to the review buttons.

### 2. REVIEW LAST SHIFT (TODO 13) — placement changed

Not a sidewalk button after all: it is the `LAST SHIFT` line on the
player board. `PAST SHIFTS` sits beside it, inert until Phase 9.

- `stopShift` snapshots the shift (deep copy of shift + ledger +
  settings + player). Reaching `stopShift` IS the availability test —
  it is the only path to the SHIFT ENDED screen — so no flag was needed.
- **Quitting clears the snapshot**: after a quit, "the last shift" is
  the one that produced nothing.
- The restore lands on the REPORT, not the SHIFT ENDED beat, and does
  not consume the snapshot — reopen it as often as you like.
- **The report shows the shift AS PLAYED** — mode, difficulty, length,
  provider — even after the player changes settings.
  `reviewPlayedWith(state)` is the resolver; it also feeds the "Close
  outcome under Strict" invariant, which must judge a ledger by the
  settings it was BUILT under.
- IN MEMORY ONLY. A reload correctly dims the button. Phase 9 is what
  makes it survive, and what turns it into TODO 11's queue.

### 3. iPhone zoom on the odometer (TODO 21, new + done)

Stepping a drum meant two chevron taps inside ~300ms — iOS's
double-tap-to-zoom gesture. `touch-action: manipulation` now sits on
every control, not just the wheels, because the waiting rows and room
doors get tapped just as fast in RUSH. `.wheel-drum` also got
`user-select: none`, which stops the long-press selection loupe.
**Pinch zoom is untouched** and the viewport meta still has no
`user-scalable=no`.

## Numbers that were hard-won — do not re-tune blind

- Every size on these boards was set by the WIDEST string it can hold,
  measured at 375px where the faces are only 96 and 99px across, with
  ~15% headroom for iOS's own Arial Black metrics. Re-measure AT THAT
  WIDTH before enlarging anything.
- **The two modes are sized separately**: `.sum-mode--triage` 17cqw,
  `.sum-mode--rush` 10cqw. One line is a hard constraint and "Triage
  RUSH!" already fills the face at 10cqw, so a shared size would cap
  both there. 17cqw matches the player board's initials, John's own
  reference. A first cut at 20.5cqw was too large AND pushed the MUSIC
  row onto the frame on his iPhone.
- The mode row carries `min-height: 29cqw`, above BOTH modes' line
  boxes, so switching modes moves nothing below it. **Re-check that
  reserve if either mode size changes** — it is the only thing holding
  the two equal.
- VERTICAL is the tight budget on the game board, not width: ~145px of
  content in a 150px box at 375px, leaving 9px of clearance under the
  MUSIC row. Measure that clearance after any size change here.
- A container-unit trap worth remembering: an element's OWN cqw units
  resolve against its nearest ANCESTOR container, not itself — which is
  why `.board-face` carries no padding and `.face-inner` carries it all.

## Immediate next work

1. **John's own pass** on the built boards, desktop and iPhone. Two
   open looks: whether the review buttons should stay plain lettering or
   get the pressed-in plate treatment (variant B is still in the
   mockup), and whether anything on the game board wants re-spacing.
2. **TODO 20 — local music.** Five Scrubs MP3s appeared in
   `triageRush/assets/audio/` this session (untracked, nothing wired).
   That is the item's precondition met: swap the source, drop the
   crossOrigin/fallback machinery, rename the board's KING-FM row,
   decide looping and whether music restarts each shift, and retune
   MUSIC_VOLUME by ear — the current 0.02/0.06 mean nothing on a file.
3. **TODO 18** — the board art still paints after the settings text.
   `popupBoardArt.decode()` before unhiding, or two stacked images.
4. **TODO 9** (iOS silent sounds) — observation only.
5. **TODO 6 and 10 are UNBLOCKED** now that TODO 3 closed, and 10 is
   largely answered already (levels exist); what remains is whether the
   game-screen icon should cycle levels rather than toggle. John's call
   to schedule.

## Big items (design conversation first, John decides when)

- Phase 9 persistence + TODO 11 (shift history queue) — one design, and
  it now has a concrete first customer: `state.lastShift` and the inert
  `PAST SHIFTS` button are both waiting for it.
- Phase 10 asset loading + TODO 1 (50-patient per-game queue) — one
  design; the 160-JSON startup block is still the real work.

## Old backlog still standing

RUSH arrival pacing revision; ambient ER soundscape (still gates any
ambiance option); lo-fi filter; confirm-dialog button redesign;
countdown numerals over the Chart; scorecard hover magnification (iOS
has no hover); Settings/About placeholder text; favicon (the only
console 404).

## Do NOT re-propose

Hints/glow work before play testing; the full patient-limit redesign
(TODO 1's narrow slice IS approved); nav-arrow fade; review grade;
brightening the ABOUT letters; per-family sound on/off toggles; a
hand-drawn X for the OFF radios; any further attempt to make the KING-FM
stream volume-controllable on iOS; **a title on the GAME summary board,
or any marker announcing that the boards are tappable**; **enlarging
"Triage RUSH!" on the summary board** — 12 characters already fill the
face on one line; **REVIEW LAST SHIFT as a sidewalk button** — it lives
on the player board now.

## Testing notes for whoever comes next

- Verification through chrome-devtools MCP must stub
  `HTMLMediaElement.prototype.play/pause`, or leave the test origin with
  music OFF and close the tab. A stray tab streaming music reads exactly
  like "sound ignores my settings".
- When probing the mode spans by toggling `hidden`, RESTORE the pair
  from state afterwards — a probe left the board reading "Triage!" over
  "120 SEC" in a screenshot this session.
- Chrome serves a cached stylesheet across `location.reload()` when the
  `?v=` is unchanged. Two measurements this session were read off stale
  CSS and reported a layout that was not on screen. Bump the cache
  version (or add a throwaway query) before trusting a measurement.
- Harnesses live in the session scratchpad and are ephemeral. This
  session's was 35 checks over the snapshot/restore rules, rebuilt from
  doc 9's acceptance tables.
