# triageRush — To Be Continued (2026-08-07 21:15 PDT)

## State: fourth session of 2026-08-07. KING-FM IS GONE — music is five
## local files, unlocked by the player's name. The game header now names
## the MODE. TODO 20 is DONE; TODO 22 was added and finished same session.

Cache version: **`2026-0807-music1b`** (index.html x5 + assets.js — bump
BOTH on every change).

## Built this session

### 1. Local music (TODO 20, DONE)

The stream lost on a technicality that no amount of tuning could fix: iOS
ignores `HTMLMediaElement.volume`, the Web Audio gain node that would fix
it needs CORS, and the routed element then refused to play on the iPhone.
Local files are same-origin, so the gain node works and **lo/hi are finally
real on the phone**.

- Five tracks in `ASSETS.music.tracks`, played in **manifest order** and
  looped forever. John's order: source `1, 2, 15, 3, 14`.
- Plays **everywhere** — entrance, shift, report — and a new shift never
  interrupts or restarts it. Off-then-on restarts at track one; a level
  change mid-track does not.
- After a reload the **first tap anywhere** starts the playlist (browsers
  refuse to resume audio unattended). This was my default, not John's
  instruction — easy to change to "stay silent until asked".
- **Everything stream-shaped is deleted**: `crossOrigin`, the CORS/no-CORS
  fallback, `abandonMusicRouting`, the failure path that wrote preferences,
  `UI.setPendingMusicLoudness`. The gain node, pagehide release,
  audition-on-tap and cancel-reverts-to-saved all survived unchanged.

### 2. The audio itself — chosen by ear, baked into the files

John picked variant **"G, heavy AM"** from a seven-way listening test
auditioned at the game's real 6% volume:

```text
highpass 400 Hz + lowpass 3.2 kHz + acompressor 6:1 @ -16 dB
24 kbps, mono, 22.05 kHz, no art, no tags        37 MB -> 2.5 MB
```

**Filtering first is what buys the small file.** Low bitrates wreck the
treble first, and the lowpass already threw that treble away, so the
encoder has nothing left to ruin — the same 24 kbps on unfiltered music
sounds underwater. The filter is BAKED IN; the game filters nothing.

Anonymity turned out to be half the job: the sources' ID3 tags named the
song, artist, album, label and catalog number, so renaming alone would
have accomplished nothing. Ships as `track-NN.mp3`, metadata stripped.
Originals + name mapping + the listening test are **gitignored**.

Recipe and play-order table: `assets/_audio-transcode/transcode-music.sh`.

### 3. The unlock (John's design, revised twice)

🎼 (U+1F3BC, an emoji — **not** U+1D11E, which tofus on phones) joined the
initials alphabet as the 35th symbol. **Middle initial = 🎼 unlocks music.**

- `J🎼P` unlocks. `JMP`, `🎼JP`, `JP🎼`, and one- or two-symbol names do not.
- Locked: the MUSIC row is **absent** — not disabled — from BOTH the
  settings board and the summary board, and **no audio file is requested**.
- Renaming away stops music and hides the rows but leaves the chosen level
  saved, so re-unlocking restores it.
- John considered a hidden title (`SCRUBBER`) first; a 15-item title drum
  cannot hide anything, three drums of 35 can. He knows and accepts it is
  an easter egg rather than protection — 2-5 people will ever play this.
  **Do not re-litigate this.**

### 4. The game header names the MODE (TODO 22, DONE)

After a playthrough John found a constant `Triage RUSH!` confusing. The
header now shows `Triage!` or `Triage RUSH!` — the mode being played —
with `Triage!` a step larger (1.4em) and centered in the same space. Both
spellings are static markup in one `<p>`; ui.js unhides one, exactly like
the summary board.

## Numbers and findings — do not re-derive blind

- **`MUSIC_VOLUME` is UNTUNED**: still `lo 0.02 / hi 0.06`, set by ear
  against the loud unfiltered stream. Against compressed, band-limited
  files those numbers mean little and will probably want raising. Two
  numbers in app.js, marked as the only knobs. John's ear decides.
- **A 3.3 dB loudness spread** across the five tracks (-17.5 to -20.8
  LUFS). On a fixed order, Overkill sits back from Superman every cycle.
  One re-run of the transcode script with `loudnorm` fixes it at no size
  cost — better judged after lo/hi are settled.
- **An audio element can be routed into only ONE AudioContext, ever.** A
  second `createMediaElementSource` on the same element throws, which is
  why a rebuilt context falls back to element volume rather than re-routing.
- **The header brand cell is CONTENT-sized** — `fr` column, `nowrap` text,
  so the column floor is the text itself. The mode name cannot clip; past
  ~2.07em it squeezes the scorecard instead. Measured on a 371px shell.
- **Resizing devtools does NOT give a 375px shell**: the shell is
  height-constrained at 9:16, so a 375x667 page yields a 339px shell.
  375x732 lands at 371px. Two measurements were nearly reported off the
  wrong width.

## Immediate next work

1. **Tune `MUSIC_VOLUME` by ear** — the one thing genuinely waiting. Play
   a shift with music on and adjust the two numbers.
2. **Decide the loudness-evening pass** (3.3 dB spread) and whether track
   05 — a 29-second end-credit sting — belongs in the rotation at all.
3. **TODO 18** — the settings board art still paints after the board's
   text. `popupBoardArt.decode()` before unhiding, or two stacked images.
4. **TODO 9** (iOS silent sounds) — observation only.
5. **TODO 6 and 10** — both unblocked; 10 is largely answered (levels
   exist). What remains is whether the game-screen icon should cycle
   levels rather than toggle. John's call to schedule.
6. Open question John raised but did not decide: in RUSH mode the header
   still reads `Triage RUSH!`, because that IS the mode's name. Changing it
   to just `RUSH!` would sharpen the distinction but is a branding change
   with three other sites to keep honest.

## Big items (design conversation first, John decides when)

- Phase 9 persistence + TODO 11 (shift history queue) — one design, with a
  concrete first customer already waiting: `state.lastShift` and the inert
  `PAST SHIFTS` button.
- Phase 10 asset loading + TODO 1 (50-patient per-game queue) — one design;
  the 160-JSON startup block is still the real work.

## Old backlog still standing

RUSH arrival pacing revision; ambient ER soundscape (still gates any
ambiance option); **the lo-fi filter item is now effectively answered** —
the music is AM-filtered in the files, so any remaining lo-fi idea would be
about GAME sounds, not music; confirm-dialog button redesign; countdown
numerals over the Chart; scorecard hover magnification (iOS has no hover);
Settings/About placeholder text; favicon (the only console 404).

## Do NOT re-propose

Hints/glow work before play testing; the full patient-limit redesign (TODO
1's narrow slice IS approved); nav-arrow fade; review grade; brightening
the ABOUT letters; per-family sound on/off toggles; a hand-drawn X for the
OFF radios; **any return to a streamed music source**; **a title on the
GAME summary board, or any marker announcing the boards are tappable**;
**enlarging "Triage RUSH!" anywhere**; **REVIEW LAST SHIFT as a sidewalk
button**; **the observation that the music unlock is not real security** —
John has heard it, considered it, and decided.

## Testing notes for whoever comes next

- **Stub `HTMLMediaElement.prototype.play/pause` before anything else**
  when verifying through chrome-devtools, and close the tab afterwards. A
  stray tab playing music reads exactly like "sound ignores my settings".
  With music now saved-on-able, a reload plus one stray click is enough.
- Prefer driving state through `localStorage` + reload over poking the DOM:
  the header check this session was only trustworthy because the app chose
  the span itself. When you DO poke spans, restore them from state after.
- Bump the cache version (or add a throwaway query) before trusting any
  measurement — Chrome serves a cached stylesheet across `location.reload()`
  when `?v=` is unchanged.
- Harnesses live in the session scratchpad and are ephemeral. This
  session's was 53 checks over the unlock rules, `musicAudible`
  combinations, the manifest, old-save migration, and a grep proving no
  stream URL / `crossOrigin` / `kingFm` identifier survives anywhere.
