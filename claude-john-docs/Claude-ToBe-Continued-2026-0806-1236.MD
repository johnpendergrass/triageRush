# triageRush — To Be Continued (2026-08-06 12:36 PDT)

## State: pacing + Triage sounds + iOS audio hardening BUILT and verified.
## Committed + pushed this session. A standing TODO.md now exists.

Cache version: **`2026-0806-pacing1c`** (index.html x5 + assets.js — bump
BOTH on every change).

## What this session did

### 1. Timer starts on the FIRST patient selection (both modes)

- Replaced the 2-second acclimation delay entirely. After activation the
  clock sits frozen at full time — no ticks, no arrivals, no elapsed time —
  until the first waiting-patient tap (`startShiftClockIfNeeded`, app.js).
  RUSH's opening tick plays at that tap.
- `handleStartShift` defensively stops any scheduler a previous shift left
  running (the old delayed-start code had that guard; keep it).

### 2. RUSH empty-room courtesy refill

- Assignment that empties the RUSH waiting room books
  `state.rush.emptyRefillAtMs` = elapsed + 1000ms (LOGICAL time; pauses
  freeze it). The quarter loop inserts ONE patient, or (coin flip,
  `EMPTY_REFILL_DOUBLE_PROBABILITY` 0.50) TWO one 250ms beat apart via
  `emptyRefillSecondAtMs` — the burst rhythm, one doink each.
- NEVER touches `arrivalRemainingMs` / `nextBaseIntervalMs`; fires even if
  a scheduled arrival landed during the beat; full room skips silently (no
  shake — a refill is a gift); only the FIRST emptying books one
  (recall-and-reassign does not push the beat back). Triage is untouched.
- Retires the "RUSH must never leave an empty waiting room" backlog item.
- Verified: 24-check Node harness (rebuild from doc 9's new acceptance
  table) + live browser playthroughs (refill landed ~1022ms, both sizes
  observed, console clean).

### 3. Triage clock found its voice (John approved by ear)

- EVERY ten-second boundary: RUSH-style three-beat — minuteTick lead-ins at
  B-0.50/B-0.25, then the boundary beat.
- Completed minutes land the new **minuteDong** (330Hz+octave, ~0.7s ring —
  endDong's family, higher and much shorter). Ordinary boundaries keep the
  plain tick.
- Lead-ins whose boundary falls inside the final-ten countdown are
  suppressed (mirror of RUSH's transition-to-10 rule).
- Verified: 27-check Node harness over a full 300s Triage shift + RUSH
  regression spot-checks.

### 4. iOS audio hardening (the "no sounds" glitch, TODO item 9)

John hit total silence on the iPhone after a page refresh (both modes,
settings on, volume up, desktop fine); a later reload cleared it — which
rules out the ring/silent switch for that occurrence and fits the
stranded-context theory. Hardening in app.js:

- resume from ANY non-running state (iOS reports **"interrupted"** after a
  call/Siri/app switch; the old code only resumed "suspended");
- **pagehide closes the context** (iOS strands contexts across refreshes —
  small per-tab pool — the likely root cause);
- visibilitychange nudges a non-running context on return;
- a "closed" context is discarded and rebuilt.

Item 9 stays OPEN for observation. If silence recurs: does a reload clear
it? If it ever PERSISTS across reloads, check the iPhone ring/silent
switch (Web Audio obeys it; volume buttons are separate).

### 5. Standing TODO list created: `claude-john-docs/TODO.md`

Eleven items in John's words + Claude notes. Highlights:

- **Item 1**: 50-patient per-game queue + graceful "No more patients
  available" exit. Deliberately revives a NARROW slice of the abandoned
  patient-limit redesign (loading policy only — still no win state, no
  ceiling, no grade; memory updated so future sessions don't resist it).
  Treat as ONE design conversation with the asset-loading blocker at
  Phase 10 (John: don't load all 160 images up front; the per-shift
  portrait reserve already proves the lazy pattern).
- **Item 11**: shift history — queue of completed shifts stored in
  localStorage (text only, ~2-12KB each, cap ~100), "REVIEW PAST SHIFTS"
  list on ER ENTRANCE, delete all/individual. Supersedes the old
  "review the last shift" backlog item. iPhone caveat verified: WebKit
  wipes site storage after ~7 days unvisited, and that applies to Chrome
  on iOS too (all iOS browsers are WebKit); "Add to Home Screen"
  effectively protects it.
- Others: ER-ENTRANCE-style font branding, settings blackboards rework,
  ABOUT art enhancement, clickability glow hints (`settings.hints` bool
  already exists; no hover on iOS — glow must be always-on/pulsing), note
  sound icon, layered room-door art, waiting backgrounds need NOT travel
  with patients, loudness high/medium/off.

## Docs state

- Docs 2/3/8/9 updated in place this session (pacing, refill rules +
  acceptance table, Triage cue boundaries, sound registry). Docs 1, 3, 7,
  8, 9 authoritative; doc 10 remains a decision record.
- Both pointer files in claude-john-docs updated same-day.

## Hard-won lessons (do not re-learn)

- iOS AudioContext has an "interrupted" state that a suspended-only resume
  misses; refreshes strand contexts (close on pagehide); ring/silent
  switch mutes Web Audio independently of volume.
- The clock display uses Math.ceil — a reading of 0:59 means elapsed is
  only just past 1s, not 2s; don't chase phantom timing bugs.
- Chrome on iOS is WebKit underneath: every iOS browser shares Safari's
  storage eviction and audio quirks.

## Immediate next work

1. Observe the sound glitch on pacing1c (TODO 9).
2. Phase 9: persistence and recovery — design WITH TODO item 11 (shift
   history) since both share the localStorage envelope.
3. Phase 10 planning: asset loading + TODO item 1 as one conversation.

## Longer-term ToDo

See `claude-john-docs/TODO.md` (the standing list, 11 items) plus the
remaining old backlog: RUSH arrival pacing revision; sound volume control
(= TODO 10); ambient ER soundscape; music options; lo-fi filter;
confirm-dialog button redesign; countdown numerals over the Chart;
scorecard hover magnification (iOS no-hover constraint); six missing vital
icons; Settings/About placeholder text (= TODO 2 in part); favicon (the
only console 404).

Do NOT re-propose: the FULL patient-limit redesign (win state/ceiling/
grade — but TODO item 1's narrow slice IS approved), the nav-arrow fade,
a review grade.
