# triageRush UI and Responsive Specification

**Current version:** 2026-07-29 16:55 PDT

## Purpose

This is the current production UI contract. It replaces separate mobile and
desktop designs with one responsive application.

## Application composition

The game frame always preserves the mobile-derived arrangement:

1. Header
2. Three gameplay panels
3. Footer

The gameplay panels remain:

1. One-column waiting-room queue
2. Central patient presentation
3. One-column seven-room treatment rail

Desktop layouts must not rearrange the queue or rooms into multiple columns.

## Responsive frame

- The game is always horizontally centered.
- The frame primarily follows available browser height.
- Frame width remains within a controlled mobile-like range.
- The frame may grow taller than a strict 9:16 ratio to make narrative content
  more readable.
- The iPhone 16 Pro is the primary mobile design target.
- Most current phone sizes must remain attractive and usable.
- If a viewport becomes too short or narrow, the complete frame scales down.
- The main game screen does not page-scroll.
- Browser safe areas and visible mobile browser controls are respected.
- Wide-screen surround remains symmetrical.

Exact dimensions and breakpoints will be selected through production testing.

## Responsive typography

Text categories scale independently within bounded ranges.

Additional space is allocated in this order:

1. Maintain legibility and touch-target size.
2. Reveal more quote and triage-note text.
3. Increase font size and line spacing.
4. Increase decorative padding.

Clinical narrative text grows cautiously so taller screens provide both more
text and larger text. Major labels and controls may grow more quickly.

## Wide-screen auxiliary panels

HOME is conceptually left of the centered game and STATS is conceptually
right.

- Side regions appear only when both symmetrical regions fit without moving or
  shrinking the game.
- HOME and STATS may be independently open or closed.
- Both may be open at the same time.
- Opening only one panel does not recenter the visible group.
- Gameplay continues while panels are open unless a confirmed settings change
  requires restarting.

At compact sizes, HOME, GAME, and STATS become separate full-frame views.

## Header

The header contains:

- `TRIAGE RUSH!`
- Current GAME/EDU mode indicator
- Compact session status
- Simple sound on/off control

GAME/EDU is selected in HOME, not changed directly in the header.

The compact status may show abbreviated values such as Patients Seen, Correct,
Close, and Missed. Exact formatting remains to be designed.

Separate music and sound-effect controls may appear in HOME.

## Footer

```text
<-- HOME        COACH        STATS -->
```

- HOME opens the left destination.
- COACH remains centered and is associated with a completed decision.
- STATS opens the right destination.
- Patient selection and switching happen through the waiting queue.
- RESET belongs in HOME or round-management controls, not the main footer.

## HOME presentation

- On first launch or deliberate restart, HOME offers `START NEW GAME`.
- When opened during active play, HOME offers `RETURN TO GAME`.
- Non-gameplay settings apply without interrupting play.
- Gameplay-affecting settings require explicit confirmation and restart.
- Several pending gameplay changes may be applied together with
  `APPLY & RESTART`.

The complete HOME hierarchy remains to be designed.

## STATS presentation

- STATS is information-only.
- It updates in real time from the shared application state.
- It continues accumulating information while closed.
- Opening it shows the complete current session immediately.
- Updates do not steal focus or force unexpected scrolling.
- Exact retained statistics will be decided when the screen is designed.

## Patient panel

The center panel presents:

- Patient identity and demographics
- Patient image
- Chief complaint
- Patient quote
- Six vital signs
- Triage note

Vital-sign text is layered over the approved vital-sign artwork. Added vertical
space primarily benefits quote and triage-note readability.

The patient image is clickable/tappable and opens a near-full-frame image
modal. The modal closes through an upper-right `X` or backdrop activation.
Gameplay freezes while it is open.

The triage note opens an expanded patient-summary modal containing all
available patient information, including longer text when present.

## Scrollable panels and modals

Expanded triage information, Coach, and Stats may scroll inside bounded
panels. They use the demonstrated mobile pattern:

- Close control anchored at the upper right
- `MORE BELOW` indicator at the bottom while unseen content remains
- No page-level scrolling of the game

## Treatment rail and room education

Seven rooms remain visible in one column:

1. ESI 1 — RESUS
2. ESI 2 — EMERGENT
3. ESI 3 — URGENT
4. ESI 4 — LESS URGENT
5. ESI 5 — NON-URGENT
6. PSYCH
7. DISCHARGE

Room education must not reveal the current answer. Mouse hover is acceptable.
The touch method remains undecided: the prototype hold gesture may be replaced
by Help content or another explicit information affordance.

## Input and modal behavior

- Required placement play uses ordinary pointer activation.
- Mouse, touch, stylus, and trackpad use the same controls.
- Keyboard interaction is not required.
- No essential action depends only on hover.
- Controls retain touch-appropriate target sizes.
- Open modals freeze the underlying game.
- Modals close predictably without changing game state.

## Visual style

The application is a stylized, inviting emergency department:

- Deep navy structural surfaces
- Blue-gray steel borders
- Cream paper and warm hospital-wall tones
- Orange brand and directional accents
- Cyan active accents
- Green, cyan, amber, and red feedback
- Dimensional but readable controls
- High-resolution illustrated waiting rooms, patients, and doors

Reference colors:

| Purpose | Reference |
|---|---|
| Deep shell | `#031019` |
| Structural navy | `#071c29`, `#0b2d3e` |
| Steel | `#91a1a8` |
| Cream | `#efe6d6` |
| Orange | `#ff9f1c` |
| Cyan | `#12a8df` |
| Correct green | `#27c978` |
| Correct-room reveal | `#8fe3a8` |
| Close amber | `#f0a329` |
| Wrong red | `#ef4b3f` |

Reference typography:

- Condensed bold sans serif for interface labels
- General sans serif for explanations
- Serif italic for patient quotes
- Bounded fluid sizing rather than uniform whole-frame scaling

## Practical accessibility scope

The application is small and not currently intended for broad public release.
Formal accessibility certification is not planned, but inexpensive good
practices remain required:

- Semantic buttons and useful labels
- Non-color feedback
- Touch-sized controls
- Reduced-motion handling
- Predictable modal closing
- Reasonable contrast and text scaling
- Physical phone and tablet testing

## Change history

- **2026-07-29 16:55 PDT:** Consolidated the accepted mobile-derived,
  height-responsive, centered-game direction and reviewed UI decisions.
