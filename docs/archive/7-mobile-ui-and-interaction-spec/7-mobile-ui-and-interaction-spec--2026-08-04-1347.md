# Mobile UI and Interaction Specification

**Last modified:** 2026-08-04

**Latest change:** Defined terminal primary-view navigation: GAME can be quit
to HOME or stopped to SHIFT REVIEW, and SHIFT REVIEW returns only to HOME.

## Scope and authority

This document specifies the visible composition and interaction behavior. It
contains enough geometry and content hierarchy to recreate the intended mobile
application while allowing implementation details to remain maintainable.

All device classes use this same presentation. There is no alternate desktop
layout and no simultaneous multi-view arrangement.

## Application shell

### Aspect and fit

- Shell aspect ratio: exactly 9:16.
- Center the shell horizontally and vertically in the usable viewport.
- Fit by whichever constraint is smaller: available width or available height.
- On height-limited viewports, reserve 5% viewport height above and 5% below,
  approximately 10% combined.
- Hardware/browser safe-area insets replace the nominal padding when larger.
- Horizontal outer padding is at least 4 CSS pixels per side.
- The shell may shrink below 300 x 533 when required by a real safe viewport;
  content must remain usable through responsive type and internal geometry.
- The shell does not expand into a different composition on wide screens.
- The outer page never scrolls.
- Use `dvh` and, where available, `svh`/safe-area calculations so visible
  browser controls do not push the shell off screen.

Reference fit:

```css
usableHeight = viewportHeight - topInset - bottomInset
usableWidth  = viewportWidth  - leftInset - rightInset
shellHeight  = min(usableHeight, usableWidth * 16 / 9)
shellWidth   = shellHeight * 9 / 16
```

For height-limited large screens, nominal top and bottom insets are each
`5vh`; for width-limited phones, width determines shell size.

### Frame

- Dark navy/steel hospital visual system.
- Thin steel border, modest rounded corners, and deep outer shadow.
- Internal views occupy the entire shell; they do not sit side by side.
- All overlay stacking is relative to the shell, not the browser page.
- Base font stack: Arial Narrow or a compatible condensed sans serif, then
  Arial/sans-serif.
- Educational chart prose may use regular Arial; patient quotation may use
  Georgia/serif italics.

### Core colors

```text
navy-950   #031019
navy-900   #071c29
navy-800   #0b2d3e
steel      #91a1a8
cream      #efe6d6
orange     #ff9f1c
cyan       #12a8df
green      #27c978
amber      #f0a329
red        #ef4b3f
white      #ffffff
```

Correct uses green, Close uses amber/yellow, and Wrong uses red. Color is always
paired with text, symbol, shape, or sound.

## View model

Only one primary view is visible:

```text
HOME -- Start Shift --> GAME -- Stop Game --> SHIFT REVIEW
 ^                       |                         |
 |----- Quit Game -------+----- Return to Lobby --+
```

- HOME edits settings and starts a new shift.
- GAME owns live play.
- SHIFT REVIEW owns final scoring and Patients Seen.
- Quit Game confirms, discards the active shift, and opens HOME without review.
- Stop Game finalizes the active shift before opening SHIFT REVIEW.
- Return to Lobby is SHIFT REVIEW's only primary-view destination.
- No HOME or SHIFT REVIEW action returns to the previous GAME.

A blocking board, Coach chart, or confirmation appears as an overlay within its
own view and pauses live timing where required.

## GAME composition

### Vertical bands

```text
Header      7.2%
Play area  85.8%
Footer      7.0%
```

Each header/footer has a practical minimum height near 40 CSS pixels when the
shell permits.

### Play-area columns

```text
Waiting queue   22%
Patient panel   56%
Room rail       22%
```

The order never changes. Wide viewports do not move these columns or create
additional rails.

## GAME header

Use a four-part grid:

```text
mode brand | scorecard | timer | sound
```

Reference proportions are `1.02fr 1.48fr 0.72fr 24px`, with 4px gaps and
4-5px internal padding.

### Mode brand

- Triage: `TRIAGE!`
- RUSH: `TRIAGE` plus orange `RUSH!`
- Condensed heavy uppercase, responsive approximately 11-17px.

### Scorecard

- Black inset capsule with steel border and about 6px radius.
- Visible content is numbers and separators only.
- Forgiving: `correct / close / wrong = score`.
- Strict: `correct / wrong = score`, with no blank Close gap.
- Correct is green, Close yellow, Wrong red, total white.
- Each number has a semantic accessible label.

### Timer

- Label `TIME`.
- Large unboxed white `m:ss`.
- Always counts down in both modes.
- No elapsed-time presentation.

### Sound

- Compact semantic toggle, approximately 24 x 28 CSS pixels in the reference
  header but with an accessible hit target where possible.
- Accessible name alternates between Mute sounds and Unmute sounds.
- Muted state is visible without relying only on color.

## Waiting queue

- Wall artwork behind the queue rail.
- 3px internal padding and approximately 3px row gaps.
- Minimum five equal-height rows; RUSH expands to at most ten.
- Each occupied row is a button containing:
  - waiting-room background;
  - patient portrait, bottom aligned;
  - metal/clinical frame;
  - short chief complaint; and
  - optional arrow/swap hint.
- The complaint remains legible and truncates rather than overflowing.
- Empty RUSH rows retain background/frame art with reduced emphasis.
- When the center is empty, queue rows may pulse subtly to suggest selection.
- With an active unassigned patient, queue rows indicate swap rather than select.
- Compaction is immediate and stable; backgrounds move with their patients.
- A successful insert may animate lightly but must not shift focus.
- Full-capacity RUSH shake is brief, horizontal, and disabled/reduced for
  `prefers-reduced-motion`.

## Patient panel

The center panel is the main evidence surface and the Coach trigger.

### Occupied vertical composition

Within the panel:

```text
Patient scene       about 43%
Patient quote       about 12.5%
Vitals card         about 18%
Triage-note card    about 23.5%
Spacing/padding     remainder
```

#### Patient scene

- Framed clinical background with portrait bottom-aligned.
- Nameplate centered near top, about 86% panel width.
- Name is uppercase; age/sex appears beside it.
- Chief complaint is a light readable chip across the lower scene.
- Portrait uses contain behavior, never stretches, and honors image metadata.

#### Quote

- Cream rounded card.
- Centered bold italic serif text.
- Auto-fit only down to a documented legible minimum; never clip silently.

#### Vitals

- Two rows by three columns.
- Order: HR, BP, RR, SpO2, TEMP, PAIN.
- Labels small and strong; values larger.
- Authored red/yellow status colors apply to values.
- Cell borders remain light and consistent.

#### Triage note

- Clipboard-style cream card with clip, `TRIAGE NOTE` kicker, and bold body.
- Text may auto-fit to prevent clipping, with a legibility floor.
- A visible expand/chart affordance may appear, but the entire occupied panel is
  the actual hit target.

### Coach hit target

- The entire occupied patient panel is one transparent semantic button layer.
- Pointer/touch/click/keyboard activation opens Coach.
- The hit layer receives a clear focus ring.
- It must not cover or intercept room buttons or queue buttons.
- When empty, the hit target is absent/disabled and Coach cannot open.
- There is no footer Coach button.

### Empty state

- Hide occupied content from sight and accessibility.
- Show `READY / SELECT A PATIENT`.
- When UI Hints are on, point toward the waiting queue.
- Do not offer Coach from the empty state.

### Result toast and countdown

- Assignment result appears transiently over the center panel:
  `✓ CORRECT`, `△ CLOSE`, or `✕ WRONG`.
- The result includes matching color but remains readable in monochrome.
- RUSH final numerals 10 through 1 are white, heavy, and centered over the
  patient image about one-third down.
- Each numeral pops quickly and fades in place over about half a second.
- Countdown visuals never create an opaque full-screen layer or intercept input.

## Seven-room rail

Rows, top to bottom:

1. ESI 1 RESUS
2. ESI 2 EMERGENT
3. ESI 3 URGENT
4. ESI 4 LESS URGENT
5. ESI 5 NON-URGENT
6. PSYCH
7. DISCHARGE

Each row is an equal-height semantic button using the accepted door asset.

- Door image: about 61% row width and 91% row height.
- Center horizontally; bottom-align at about 1%.
- Closed state is default.
- Assignment opens only the selected door.
- Open door remains until recall/finalization/view completion.
- When recall is legal, show a leftward orange recall arrow into the center.
- Assignment feedback pulses only the selected row.
- Do not reveal the correct row after a Close or Wrong result.
- Accepted door wording must remain readable at smallest supported size.

Supplemental room definitions may appear on mouse hover or a roughly 520ms touch
hold. This help must not contain patient-specific hints. Ordinary tap/click still
assigns or recalls.

## GAME footer

Retain the three-column visual band so future approved controls can be added
without changing the game frame.

- Left: green `QUIT GAME` with a small `RETURN TO LOBBY` caption.
- Center: no button and no hidden gameplay action; use neutral footer background.
- Right: red/orange `STOP GAME` with a small `REVIEW SHIFT` caption.
- Selecting Quit Game opens a destructive confirmation. Confirming discards
  the shift and opens HOME; canceling returns to the unchanged GAME.
- Selecting Review Shift finalizes the shift and immediately opens review.
- Do not render a disabled Coach button.

## Coach overlay

- Covers the shell with a dark translucent scrim and slight blur.
- The chart frame occupies most of the shell with roughly 8% outer padding.
- Chart content scrolls internally; body/page does not.
- Presentation, Answer, and Clinical use real section buttons with
  `aria-expanded`.
- Answer visibly reports `LOCKED` in active-patient context.
- Presentation starts expanded.
- Clinical starts from the shift-level remembered preference.
- A prominent close control stays reachable.
- Conditional `MORE ABOVE` and `MORE BELOW` controls appear only when more
  scroll content exists and scroll roughly 70% of the viewport.
- Escape closes on keyboard-capable devices.
- Clicking the scrim may close, but clicks inside the chart never do.

## HOME view

Use the accepted 852 x 1515 lobby composition and registered overlays described
in document `6`.

HOME has one gameplay state: pre-shift setup with a Start Shift overlay/action.
There is no Resume Shift, active-lobby, or Return to Game presentation.

The settings board contains:

- title and initials;
- Triage/RUSH mode;
- Strict/Forgiving;
- mode-specific length;
- UI Hints;
- RUSH timing/arrival sounds.

Title choices include `Intern`. Settings controls use real labels, radios,
checkboxes, and selects over the board artwork. About uses the accepted About
board. Boombox hit targets align with the accepted art and never autoplay music.

## SHIFT REVIEW view

The review is its own full-frame view, visually based on a light clipboard or
clinical summary within the 9:16 shell.

Show:

- `Triage shift complete` or `TriageRUSH complete`;
- title, initials, difficulty, actual duration, and date/time;
- prominent final score;
- Patients Seen;
- formula rows for Correct, optional Close, Wrong, and Left Waiting;
- separate Under-triaged and Over-triaged counts;
- `PATIENTS SEEN (n)` action;
- one `RETURN TO LOBBY` primary-view action.

Formula rows use a compact two-column grid and color accent on outcome rows.
Do not show reassignment attempts as separate patients.
SHIFT REVIEW has no Return to Game or direct New Shift action. Return to Lobby
opens HOME, where settings may be changed and Start Shift creates a new game.

### Patients Seen browser

Opening Patients Seen displays the same detailed chart inside a review wrapper.

- Fixed banner below the chart clamp.
- Previous and next circular buttons.
- `index / total · patient name`.
- Dedicated close box.
- Navigation wraps when at least two patients exist.
- Patient change returns chart scroll to top.
- Close restores focus to the Patients Seen action.

## Responsive typography and overflow

- Use container-relative clamps rather than fixed desktop breakpoints.
- Never solve overflow by hiding content.
- Quote and triage note may reduce in 0.25px steps to a documented floor near
  6.5px only at the smallest shell.
- Score formulas and labels may wrap where needed.
- Queue complaints use ellipsis.
- Setup/review/chart overlays scroll internally on short screens.
- No main GAME element may force page scrolling.

## Interaction and accessibility checklist

- All functional images have semantic controls/names; decorative images use
  empty alt text.
- Pointer events support mouse, touch, pen, and trackpad.
- Keyboard order follows header, waiting, patient, rooms, footer, then overlays.
- Focus is trapped inside blocking overlays and restored on close.
- Every status change uses an appropriate live region without excessive chatter.
- Correct/Close/Wrong is not color-only.
- Sound is optional and never the only feedback.
- Reduced motion shortens or removes pulse, shake, and pop animations.
- Text remains readable at 200% browser zoom even if viewport-relative fitting
  keeps the outer shell physically similar.
- Test with visible mobile browser controls and safe-area insets.
