# triageRush — To Be Continued (2026-08-08 10:52 PDT)

## State: a TRIAGE session, not a building one. Five TODO items closed,
## two small glyph fixes built, and the old music stream scrubbed out of
## the live documentation. THREE items remain open.

Cache version: **`2026-0808-icon1c`** (index.html x5 + assets.js — bump
BOTH on every change).

## Built this session

Both builds were the same kind of problem: **a glyph that could not be
read.** Neither is a feature.

### 1. The mute icon is DRAWN, not typed (TODO 6)

John asked "isn't there a simple 'muted' icon that can be used? if not,
then do the overlay." There is not — the Unicode mute glyphs (U+1F507 and
neighbours) carry EMOJI presentation, so iOS draws them in colour and
Apple ships no text fallback.

- `#gameSoundButton` now always renders **♪**. Muting dims it and
  `.sound-button.is-muted::after` lays a **red diagonal slash** over it:
  2px bar, 92% of the button's width, `rotate(45deg)` (the prohibition-sign
  direction), `box-shadow: 0 0 0 1px #102b38` so the slash and the note
  stay separable at 24x28.
- The old `×` glyph and the `text-decoration: line-through` are GONE.
- Red because **red already means OFF in this game** — the settings
  radios, the summary board's OFF values. Do not invent a second colour.

### 2. The music-unlock glyph changed TWICE, and is now ♫ (APPROVED)

- It began as 🎼 U+1F3BC MUSICAL SCORE. John: "that staff looks awful."
- It became 🎶 U+1F3B6, which drew **dark grey on the blackboard**. John:
  "emojis don't come in different colors do they? ... make it yellow?"
- **They do not.** A colour emoji carries its own palette inside the font
  and ignores CSS `color` entirely. That is the durable lesson here.
- It is now **♫ U+266B BEAMED EIGHTH NOTES** — a TEXT character, the only
  non-emoji in the initials alphabet, which is exactly why it can be
  coloured. Painted `var(--amber)` at 1.15em (a text note is a smaller
  mark than the emoji beside it). **APPROVED: "that amber eight note is
  perfect. it will work."**
- Colouring one character inside a name needs a wrapper, so **`ui.js
  writeInitials()`** now renders every initials string and wraps that one
  symbol in `<span class="initial-music">`. All three display sites go
  through it: the odometer drum cells, the sidewalk player board, and the
  Shift Report's provider line. The report reverts it to ordinary ink —
  amber has nothing to stand against on cream paper.
- **NO MIGRATION WAS WRITTEN, by John's explicit instruction**: there are
  no users, and a stored name with an old glyph simply fails validation
  and falls back to defaults on the next load. *"Do not make it more
  complicated than it needs to be."* Do not add migration code for this.

## Decided this session (no code)

- **TODO 3 (settings blackboards) FULLY CLOSED.** John's pass: the summary
  boards are "fine, on iPhone and on desktop", and the review lines are
  fine — so variant **A (plain lettering)** is final. All four boards done.
- **TODO 10 (loudness switch) CLOSED as already delivered.** DECLINED, not
  pending: the game-screen icon will NOT cycle levels. It stays a global
  toggle, because it is one persisted value seen twice.
- **MUSIC LOUDNESS SETTLED**: "it is fine where it is." `MUSIC_VOLUME`
  stays lo 0.02 / hi 0.06, game family 0.22 / 1. They were expected to
  want raising against the compressed tracks and did not. **Stop treating
  these as untuned.**
- **TODO 9 (iOS silent sounds) CLOSED** — no recurrence in four sessions.
  Reopen if it returns; the three iOS Web Audio fixes and what to observe
  are preserved in its DONE entry.
- **The game header keeps `Triage RUSH!` in RUSH mode** — "not a
  question." Shortening it to `RUSH!` is rejected, not deferred.
- **TODO 18 is HELD, deliberately.** Do not fix the board-art paint order
  yet; the loading rework decides what is decoded up front and may erase
  the symptom. Revisit it THERE.

## The stream is scrubbed from the live docs

John: "remove all the kingfm stuff - it is history." The station name is
gone from the code comments, docs 1/3/4/6/7/8, both claude-john-docs spec
files, and the GAME mockup's row label; item 20's pre-build decision
record was deleted outright, and `_mockups/ios-music-test.html` (the
stream diagnostic, tracked in git and recoverable) was removed.

**What was KEPT, stripped of the story, because it still binds every
future audio decision:** music must stay LOCAL. iOS ignores
`HTMLMediaElement.volume`; the gain node that carries the level needs CORS
for a remote source; iOS then refuses to play the routed element.

Frozen history was left alone on purpose: `docs/2-dev-history.md`,
`docs/archive/**`, and the older ToBeContinued files.

The last live trace of it was in `_testAppHomeScreen/`, which streamed the
station from its own index.html — and that folder is now gone; see below.

## The two prototype apps are DELETED (John, 2026-08-08)

"they are gone gone gone." `_testAppHomeScreen/` and `_testAppMobile/` are
removed — 490 tracked files, ~583 MB. They are in git history if ever
needed, but they are not coming back.

**The leakage check John asked for, done by CONTENT (md5), not filename:**

- **Nothing in the live app pointed INTO them.** The only mentions were
  four prose `.txt` notes beside the artwork, now corrected.
- **`_testAppHomeScreen` was NOT self-contained** — it loaded its
  backgrounds from `../triageRush/assets/home-screen/`, a folder that no
  longer exists (it became `lobby-page/`). That prototype had therefore
  been BROKEN for some time. Nothing was lost by deleting it.
- **Of 311 media files across both folders, 73 held content found nowhere
  in the live tree (~92 MB)** - and every one is superseded working
  material: boombox chroma/cutout experiments (metaphor retired
  2026-08-04), the whole `assets-legacy/` generation, ten old patient
  portraits, and 14 hi-res "with-sign" door PNGs. Those doors are the only
  group worth naming, and they are an EARLIER generation: the live
  `HIRES-ORIGINAL-ART/` carries its own complete set of all 14 (7 rooms x
  open/closed), authored 2026-08-04 against the prototype's 2026-07-28.
- Everything else in them was a byte-for-byte duplicate of live art.

Docs were swept for references: README.md rewritten (the map now lists
`_mockups/` instead, with a note recording the deletion), and the artwork
notes fixed. `docs/archive/**` and the older ToBeContinued files still
mention the prototypes and were deliberately LEFT ALONE - they are the
frozen record of how the game got here.

## Numbers and findings — do not re-derive blind

- **A colour emoji cannot be recoloured.** COLR/CBDT fonts paint their own
  baked-in palette and ignore `color`. The same emoji is dark grey in
  Chrome on Windows and purple on iOS — appearance is a platform fact, not
  a design choice. Reach for a TEXT glyph whenever a symbol must be
  coloured or must match surrounding ink.
- **U+266A and U+266B need no U+FE0E** — neither has emoji presentation.
  (U+25B3 and the other text-default-but-emoji-capable characters DO; that
  distinction is already in the technical notes.)
- The initials alphabet is still **35 symbols**; `initialsSymbols` counts
  SYMBOLS, re-attaching U+FE0F so ⚕️ and ❤️ stay one drum value each.
- Verified this session: a 15-check Node harness over the unlock rules
  (middle-only, symbol counting, emoji neighbours, old glyph now rejected)
  and two browser passes — the mute slash measured in both states, and the
  drum/board/unlock-row checked with the real app. Console clean apart
  from the known favicon 404.

## Immediate next work

There is **nothing small left**. The remaining three items are all real
work, and two of them want a design conversation first.

1. **Play test.** The boards are finished and signed off; this is the
   natural moment. It also feeds the parked hints question — the glow idea
   waits on watching testers get stuck.
2. **TODO 1 + the asset-loading debt — ONE design conversation.** Per-game
   queue of 50 drawn from the 160, graceful exhaustion message, and the
   startup rework that stops blocking READY on 160 JSON fetches plus every
   manifest image. TODO 18 rides along with it.
3. **TODO 11 + Phase 9 persistence — ONE design.** The shift-history queue
   has a customer already waiting: `state.lastShift` and the inert PAST
   SHIFTS button.
4. Answer the `_testAppHomeScreen` question above (rip the stream out, or
   leave the prototype frozen).

## Old backlog still standing

RUSH arrival pacing revision; ambient ER soundscape (still gates any
ambiance option); confirm-dialog button redesign; countdown numerals over
the Chart; scorecard hover magnification (iOS has no hover); Settings and
About placeholder text; favicon (still the only console 404); and the
3.3 dB loudness spread across the five music tracks — a `loudnorm` re-run
of `transcode-music.sh` fixes it at no size cost, but nobody has judged it
by ear and it is not urgent.

## Do NOT re-propose

Hints/glow work before play testing; the full patient-limit redesign (TODO
1's narrow slice IS approved); nav-arrow fade; review grade; brightening
the ABOUT letters; per-family sound on/off toggles; a hand-drawn X for the
OFF radios; **any return to a streamed music source, or the station name
in live docs**; a title on the GAME summary board, or any marker
announcing the boards are tappable; enlarging "Triage RUSH!" anywhere;
`RUSH!` alone in the game header; REVIEW LAST SHIFT as a sidewalk button;
the observation that the music unlock is not real security; **the
game-screen icon cycling sound levels**; **migration code for the old
unlock glyphs**; and **the amber ♫ itself — glyph and colour are signed
off.**

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
- game.js runs under Node with a small shim (global window +
  TRIAGE_RUSH_ASSETS stub + performance). Harnesses live in the session
  scratchpad and are ephemeral — rebuild from doc 9's acceptance tables.
