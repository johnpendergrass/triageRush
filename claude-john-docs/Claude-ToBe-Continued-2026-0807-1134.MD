# triageRush — To Be Continued (2026-08-07 11:34 PDT)

## State: first session of 2026-08-07. Two work streams, both done and
## approved: (1) the UI-hints system was REMOVED from the game (built,
## verified); (2) the settings blackboards redesign (TODO 3) reached
## LOCKED mockups for both boards — mockups only, NOTHING of it is in
## the game yet. Committed and pushed at the end of this session.

Cache version: **`2026-0807-hints1a`** (index.html x5 + assets.js — bump
BOTH on every change). Note: the commit also carries the previously
uncommitted player-titles change (LPN/PA removed, MR/MRS/M/MS added,
cache had been 2026-0806-titles1a).

## Work stream 1 — hints removal (BUILT, in the game)

TODO 5 resolved by John's decision: remove the hint system, finish the
game, play test with a couple of folk, and only design hints (the glow
idea) if testers actually get stuck. Done (cache 2026-0807-hints1a):

- REMOVED: "→"/"↔" queue badges, the "Show UI hints" checkbox + HELP
  fieldset, `state.settings.hints` everywhere (default, validation,
  applySettings), `.queue-hint` CSS.
- PERMANENT now: the patient-panel empty-state arrows (TAP A WAITING
  ROOM PATIENT / recall line) — no setting gates them.
- KEPT (never were hints): chart/patients-seen MORE ABOVE/BELOW scroll
  indicators, shift-over "tap to see your results".
- loadPreferences strips a stale `hints` key from old saves (friendly
  pattern, like the LPN/PA→Doctor title mapping).
- Verified: 11-check Node harness + browser smoke test; console clean
  (favicon 404 only). Live docs 3/4/7/8/9 swept same session (doc 4
  also got a missed row-owned-backgrounds line fixed).

## Work stream 2 — settings blackboards (TODO 3): LOCKED MOCKUPS

John supplied direction art (assets/lobby-page/
settings-blackboard-*-MOCKUP.png). Design iterated live in two
PHONE-TRUE mockups (faithful 9:16 shell + popup card + real board art;
view via bat server at http://<pc-ip>:8090/_mockups/...):

- `_mockups/settings-letterboard-mockup-PLAYER.html` — PLAYER NAME board
- `_mockups/settings-letterboard-mockup-GAME.html` — GAME OPTIONS board
- (`settings-letterboard-mockup.html` is a superseded pointer, deletable)

**BOTH LOOKS LOCKED (John, end of session).** The authoritative
decision record is TODO.md item 3 "Design state" — everything below is
summary. Letter-board white lettering; brand words the only orange;
green native radios. PLAYER NAME: Vegas-odometer drums, dual input
(chevrons or tap-value native select — no keyboard), initials A-Z + "-"
+ ⚕️ 🚑 💀 😷 ❤️ ➕ ⭐, titles + "Hey you!". GAME OPTIONS: two-line
setting-groups (left headers, centered wide-gap options), headline
groups GAME MODE (enlarged brand) + GLOBAL SOUND, sub-groups GAME
SOUNDS / KING-FM (music) as off/lo/hi (OFF replaces per-family
toggles — standard master-mute + per-category-level pattern), units
spelled out, inset divider. Sound icon decision: it IS GLOBAL SOUND —
one persisted value, two views (retires the gameSoundsAudible
per-shift override at build time).

## Also decided this session

- Sound TODOs 6 + 10 are deferred behind TODO 3 (they land in this
  redesign's build).
- No ambiance sound option until ambient assets exist; would fold into
  the Game sounds controls.

## Immediate next work

1. TODO 3 small opens: lettering variant A vs B (toggle on both
   mockups); KING-FM "(MUSIC)" parenthetical yes/no; John's iPhone
   pass on the locked mockups.
2. TODO 3 next design piece: the SUMMARY boards (small blackboards on
   ER ENTRANCE) — player summary first.
3. TODO 3 build phase (after summaries settle): popup markup/CSS/JS
   replacement, settings schema migration (gameLoudness/musicLoudness
   enums replace soundGame/soundMusic; emoji-aware initials
   validation; friendly strip/map for old saves), Web Audio gain +
   stream volume, sound icon = GLOBAL SOUND, PLAYER_TITLES change.
4. TODO 13 (REVIEW LAST SHIFT? button) — small build once placement is
   chosen (sidewalk vs erasing the Emergency sign).
5. TODO 9 (iOS silent sounds): observation only.

## Big items (design conversation first, John decides when)

- Phase 9 persistence + TODO 11 (shift history queue) — one design.
- Phase 10 asset loading + TODO 1 (50-patient per-game queue) — one
  design; startup strategy (160 JSON fetches blocking READY) is still
  the real work.

## Old backlog still standing (beyond TODO.md)

RUSH arrival pacing revision; ambient ER soundscape (gates the ambiance
sound option); music options; lo-fi filter; confirm-dialog button
redesign; countdown numerals over the Chart; scorecard hover
magnification (iOS no-hover constraint); Settings/About placeholder
text; favicon (the only console 404).

Do NOT re-propose: hints/glow work before play testing (TODO 5's DONE
entry has the details); full patient-limit redesign (TODO 1's narrow
slice IS approved); nav-arrow fade; review grade; brightening the ABOUT
letters; per-family sound on/off toggles (OFF lives in the loudness
rows now).
