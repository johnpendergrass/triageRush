# triageRush — To Be Continued (2026-08-07 13:22 PDT)

## State: second session of 2026-08-07. THE SETTINGS BOARDS ARE BUILT —
## both detail boards are in the game, approved by John on desktop and
## iPhone. Also built: the vitals fix, temperature in both scales, and
## the sound model rewrite. One decision landed and was deliberately NOT
## built: KING-FM is being retired for local music.

Cache version: **`2026-0807-musicgain1b`** (index.html x5 + assets.js —
bump BOTH on every change).

## Built this session

### 1. The two DETAIL settings boards (TODO 3) — the big one

Lifted from the locked mockups in lettering variant A:

- **PLAYER NAME**: one title drum + three initials drums, Vegas-odometer
  style. Two ways to change a value and neither raises a keyboard —
  chevrons step with wrap-around, or tap the value for the platform
  picker. Alphabet is A-Z, "-", and seven emoji; "Hey you!" joined the
  titles.
- **GAME OPTIONS / SOUND OPTIONS**: two-line setting groups, headline
  GAME MODE and GLOBAL SOUND, GAME SOUNDS and KING-FM as off/lo/hi.
- A selected OFF fills RED, via `accent-color` — John asked whether the
  green was built-in, and it was, so the red is the same native
  mechanism rather than a hand-drawn X (an X version was built first and
  dropped). Do not re-pitch hand-drawing these radios.
- The sidewalk SUMMARY boards are deliberately BLANK: they open the
  detail boards, and their own lettering waits on the summary design.

### 2. The boards were then made ~20% bigger

John asked for more finger room. The card was already 93.5% of the
shell — the problem was that both board PNGs carried ~20% transparent
margin, so the *visible* board was only 74.7%. Both were cropped to
their own edges (941x1672 -> 752x1387, one common box so a single
geometry still serves the blackboard AND the About whiteboard;
uncropped originals in `assets/lobby-page/archived/`). Everything else
derives from that box. The letter boards now size themselves in cqw of
the FACE, so a future re-crop needs no type re-tuning.

Two bugs surfaced while measuring: GAME MODE was overflowing the wooden
frame on the iPhone (brand words dropped to the regular option size),
and the board face was uppercasing the brand, which now keeps its
"Triage RUSH!" sign spelling.

### 3. Sound model rewritten

- `soundGlobal` (boolean) + `gameLoudness` / `musicLoudness` enums
  replaced the old per-family booleans; old saves migrate (an ON family
  becomes "hi").
- Levels are REAL volumes: one gain node for all game sounds
  (`lo` 0.22 / `hi` 1), music on its own much quieter scale
  (`lo` 0.02 / `hi` 0.06).
- **The game screen's sound icon IS the GLOBAL SOUND setting** — it
  writes and persists that value. `state.gameSoundsAudible` is gone.
- **Levels audition as they are tapped** (the boards live on HOME, so
  otherwise you are choosing a volume you cannot hear). Auditions follow
  the PENDING selections and persist nothing; cancel returns music to
  the saved setting; a failed audition flips the board to off without
  writing preferences.

### 4. Vitals panel

- Temperature shows BOTH scales, Celsius first: `37.0 / 98.6` under a
  `TEMP C/F` label. Records stay Celsius; conversion is display-time in
  the one chart builder, so panel/Chart/Patients Seen all agree.
- It wrapped to two lines and broke once Fahrenheit passed 100, so the
  vitals grid became unequal — `0.75fr 1.5fr 0.75fr`. The middle column
  carries both long readings (BP and TEMP); the outer ones hold two- and
  three-character numbers.
- The icons then grew into the freed space: `clamp(15px, 4.6cqw, 23px)`,
  up from 12/3.6/18. On a small phone that is 14px -> 18px of icon while
  the temperature tile still GAINED slack.

### 5. Smaller items

- Recall hint now reads TAP THE TRIAGE ROOM DOOR TO RECALL YOUR MOST
  RECENT PATIENT (TODO 17).
- `pagehide` now pauses the music element as well as closing the audio
  context.

## The one thing decided but NOT built: KING-FM retires

John's decision, after the volume work failed on his phone: **eliminate
the KING-FM option; music becomes LOCAL FILES.** He explicitly asked for
NO code change yet — the game still streams KING-FM exactly as before.

Why the stream lost: iOS ignores `HTMLMediaElement.volume` (Apple gives
media volume to the hardware buttons), and the only mechanism iOS does
honor — a Web Audio gain node — requires routing through
`createMediaElementSource`, which needs CORS, and with CORS the iPhone
refused to play the element at all. The shipped code therefore falls
back to a plain element on refusal: music plays everywhere, with real
level control on desktop and NONE on iOS.

Why local files will win: they are SAME-ORIGIN, so no CORS and no
refusal — the gain node works and lo/hi become real on the phone.

**TODO.md item 20 is the plan.** Everything carries over except the
source URL and the CORS/fallback machinery: the board row, the levels,
the persistence and migration, the audition, the cancel contract.
`_mockups/ios-music-test.html` is the diagnostic harness, relevant only
if a stream is ever revisited.

## Immediate next work

1. **The SUMMARY boards** (small blackboards on ER ENTRANCE) — the last
   design piece of TODO 3, and John wants the player summary first. The
   blank lines and their ids are already in index.html, and ui.js
   `renderHomeBoardSummaries` has each value commented in place.
2. **TODO 20** — local music, whenever John has files.
3. **TODO 18** — the board art still paints after the settings text. The
   crop cut its pixels by 37% but the paint ORDER is unchanged; the fix
   is `popupBoardArt.decode()` before unhiding, or setting the src once
   at boot and toggling two stacked images.
4. **TODO 13** (REVIEW LAST SHIFT? button) — small build once placement
   is chosen.
5. **TODO 9** (iOS silent sounds) — observation only.

## Big items (design conversation first, John decides when)

- Phase 9 persistence + TODO 11 (shift history queue) — one design.
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
hand-drawn X for the OFF radios; **any further attempt to make the
KING-FM stream volume-controllable on iOS** — that ground is closed,
and local files are the answer.

## Testing note for whoever comes next

Verification through chrome-devtools MCP must stub
`HTMLMediaElement.prototype.play/pause`, or leave the test origin with
music OFF and close the tab. A stray test tab streaming KING-FM cost
John a round trip this session: each page owns its audio element, so a
hidden tab's music is unreachable from the tab he is looking at and
reads exactly like "sound ignores my settings".
