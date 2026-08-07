# triageRush — To Be Continued (2026-08-06 17:12 PDT)

## State: branding (TODO 2), ABOUT decision (TODO 4), and layered room
## composition (TODO 7) all landed today. NOT yet committed when this file
## was written — the commit+push is the next action this session.

Cache version: **`2026-0806-rooms1a`** (index.html x5 + assets.js — bump
BOTH on every change).

## ⚠ FIRST THING NEXT SESSION

**John still needs to verify the patient placement and scale inside the
triage rooms** (desktop + iPhone). The first-pass values live in
styles.css `.room-patient`: `bottom: 3%`, `height: 62%`, `max-width: 52%`
— fine-tune by adjusting those three numbers only. TODO item 7 stays open
until he approves.

## What this session did

### 1. Branding: the ER ENTRANCE sign lettering (TODO item 2 — DONE)

- Colors sampled from the sign in the entrance art (face #ec543d, brick
  #a03426); mockup `_mockups/brand-font-mockups.html` compared variants;
  John chose **variant B** (flat face + stacked 3D extrusion shadows).
- `.brand-sign` in styles.css is the treatment (Arial Black stack, weight
  900, em-based shadow stack so it scales); `.brand-rush` renders RUSH!
  1.18x larger like the sign. No webfont — system fonts only.
- **Naming policy (final, after one same-day revision):** the game's NAME
  is "Triage RUSH!" (space, mixed case, !) in ALL places and BOTH modes.
  "Triage!" alone names the MODE in exactly two places: the Shift Report
  MODE: line and the settings mode-chooser radios. The ! is part of the
  name, even mid-sentence. Because the brand never varies, all three
  brand spots (game header, report masthead, shift-over screen) are
  STATIC markup in index.html — ui.js writes none of them
  (renderBrandLettering was added and then deleted the same day).
- Positioning (all John-specified): report masthead is ONE centered unit
  ("Triage RUSH!" + 1.3em gap + serif "Shift Report", font dropped
  5.6→4.8cqw so the unit always fits one line); game-header brand centers
  between the left edge and scorecard; shift-over screen puts the brand
  BASELINE at ~30% of shell height and SHIFT ENDED's at ~50% (cqw math:
  height% × 16/9; brand is position:absolute, headline via padding-top).
- Shift-over hint "tap to see your results": white, bold, count-sized,
  framed by rules above/below, ~two line-heights lower.
- Chalk boards deliberately NOT restyled (settings radios got new label
  TEXT only); they wait for TODO 3.

### 2. ABOUT cover (TODO item 4 — RESOLVED, original kept)

A candidate with the embossed letters recolored light green was produced
and reviewed; John KEPT THE ORIGINAL image. Candidate deleted. Do not
re-pitch. Mask recipe preserved in memory (about-cover-recolor-recipe).

### 3. Layered room composition (TODO item 7 — BUILT, verify pending)

- Each room cell stacks, back to front: flat green (CSS) → shared wall
  art `background-wall-for-all-rooms.png` filling the cell → per-room
  interior `background-<roomKey>-room.png` in the door-art box
  (61%/91%, bottom-aligned) → assigned patient portrait (open room only)
  → door art. Stacking is DOM order; the open door's transparent doorway
  does the reveal. The art was drawn to the right aspects, so plain
  `object-fit: fill` lines everything up — John predicted this.
- renderRooms now takes `portraitUrlFor` (4 call sites in app.js).
- Wall + 7 interiors joined assets.js manifest and startup verification
  (+8 images — logged against the asset-loading-strategy todo).
- Verified in Chrome: assign shows interior+patient through the doorway,
  recall restores, halo/pulse/arrow intact, console clean (favicon 404
  only). Bonus: discharge's glass double doors show the outdoor scene
  through their panes even closed.

### 4. TODO.md bookkeeping

Item 2 → DONE; item 4 → DONE (resolved, original kept); item 3
reclassified a BIG item (odometer-style settings inputs — design
conversation first); item 12 added (vitals panel: icons + text + number
values; ties to the six-missing-vital-icons backlog); item 7 annotated
BUILT-pending-verify.

## Docs state

- Docs 3/7/8 still describe the OLD brand ("TRIAGE + orange RUSH!",
  "TriageRUSH") and the pre-layer door rail — fold in on the next docs
  pass. Both claude-john-docs pointer files updated today (2026-08-06).
- Memory files updated: brand-sign-spelling (final naming policy),
  about-cover-recolor-recipe (closed), MEMORY.md index.

## Immediate next work

1. **John verifies room patient scale/placement** (see top of file);
   fine-tune `.room-patient` numbers.
2. Observe the iOS sound glitch (TODO 9) on current cache.
3. More small TODO items (6 sound icon, 8 waiting-background
   simplification, 12 vitals panel, 5 hints glow, 10 loudness).
4. Big items when ready: Phase 9 persistence + TODO 11 (one design);
   Phase 10 asset loading + TODO 1 (one design); TODO 3 settings boards.

## Longer-term ToDo

`claude-john-docs/TODO.md` is the standing list. Old backlog beyond it:
RUSH arrival pacing revision; ambient ER soundscape; music options; lo-fi
filter; confirm-dialog button redesign; countdown numerals over the
Chart; scorecard hover magnification (iOS no-hover); Settings/About
placeholder text; favicon (the only console 404); docs pass for
brand + room-layer changes.

Do NOT re-propose: full patient-limit redesign (TODO 1's narrow slice IS
approved); nav-arrow fade; review grade; brightening the ABOUT letters.
