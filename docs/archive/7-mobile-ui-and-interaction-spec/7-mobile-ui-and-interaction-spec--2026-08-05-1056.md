# Mobile UI and Interaction Specification

**Last modified:** 2026-08-05

**Latest change:** Swept in the 2026-08-04/05 amendments: Chart naming, footer
wording and sizing, approved patient-panel layout, empty-state hints, flat
green rail background, Chart overlay composition, and the photo zoom lightbox.

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

Reference presentations for artwork inspection:

| Environment | Approximate shell | Artwork demand |
|---|---:|---:|
| Full HD, 1920 x 1080 at 100% | 547 x 972 CSS px | 547 x 972 device px |
| Normal 4K, 3840 x 2160 at 100% | 1094 x 1944 CSS px | 1094 x 1944 device px |
| iPhone 16 Pro Max, 440 x 956 CSS px at 3x | 432 x 768 CSS px | 1296 x 2304 device px |

The phone can therefore require more source pixels for a full-shell image than
the 4K desktop even though its CSS box is smaller. These are audit references,
not separate layouts; all three retain the same composition.

### Frame

- Dark navy/steel hospital visual system.
- Thin steel border, modest rounded corners, and deep outer shadow.
- Internal views occupy the entire shell; they do not sit side by side.
- All overlay stacking is relative to the shell, not the browser page.
- CSS defines the box, crop, fit, and alignment of every bitmap layer. Replacing
  an image with a smaller optimized file at the same logical path must not alter
  layout, controls, or game behavior.
- Do not branch on an image's intrinsic or decoded dimensions. Preserve the
  documented `object-fit`, aspect-ratio, and anchor behavior instead.
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
HOME -- Start Shift --> GAME -- End Shift Early --> SHIFT REVIEW
 ^                        |                              |
 |--- Quit This Shift ----+---- Return to ER Entrance --+
```

- HOME (player-facing: ER ENTRANCE) edits settings and starts a new shift.
- GAME owns live play.
- SHIFT REVIEW owns final scoring and Patients Seen.
- Quit This Shift confirms, discards the active shift, and opens HOME without
  review.
- End Shift Early confirms, then finalizes the active shift before opening
  SHIFT REVIEW.
- Return to ER Entrance is SHIFT REVIEW's only primary-view destination.
- No HOME or SHIFT REVIEW action returns to the previous GAME.

A blocking board, the Chart overlay, or a confirmation appears as an overlay
within its own view and pauses live timing where required.

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

### Sound (in-game mute)

- Compact semantic toggle, approximately 24 x 28 CSS pixels in the reference
  header but with an accessible hit target where possible.
- Governs game sounds only; it never starts or stops music (document `3`
  sound model).
- Accessible name alternates between Mute game sounds and Unmute game sounds.
- Muted state is visible without relying only on color.

## Waiting queue

- The queue rail sits on a flat dark green (#0f3d2f, tunable), not wall
  artwork. The wall and room-interior PNGs are reserved for future layered
  room rendering (wall → interior → patient → door), never rail backgrounds.
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

The center panel is the main evidence surface and the Chart trigger: it shows
the panel setting of the unified patient chart (see document `8`), transparent
so the corridor art shows through. This layout was iterated live with John and
is final; future text overflow is handled by auto-fit shrinking, never by
layout changes.

### Occupied vertical composition (approved height shares)

```text
Patient scene   43
Patient quote   17
Vitals card     18
Triage-note     19
```

Quote is enlarged relative to note because quotes run longer than notes.

#### Patient scene

- Transparent scene with the portrait bottom-aligned; NO tint or scrim over
  the corridor art.
- Nameplate on its own centered plate near the top, about 86% panel width,
  with a small gap above.
- Name is uppercase and truncates with an ellipsis when long; age/sex renders
  as a cream wristband chip beside it (`age 45 · M`) that never shrinks.
- The chief-complaint plate sits BELOW the portrait and must never cover the
  image. Complaint is the largest text item on the panel.
- Portrait uses contain behavior, never stretches, and honors image metadata.

#### Quote

- Cream rounded card with a `PATIENT QUOTE` kicker.
- Centered bold Georgia/serif italic text.
- Auto-fit only down to a documented legible minimum; never clip silently.

#### Vitals

- Two rows by three columns.
- Order: HR, BP, RR, SpO2, TEMP, PAIN.
- Labels small and strong; values larger.
- Authored red/yellow status colors apply to values.
- Cell borders remain light and consistent.

#### Triage note

- Cream card with a `TRIAGE NOTE` kicker and bold body; NO clip hardware (the
  clipboard motif belongs to the Chart overlay wrapper only).
- Quote and note bodies share one font size; the note uses regular Arial (not
  the condensed app face) so the two read as the same visual size.
- Text may auto-fit to prevent clipping, with a legibility floor.

Answer and Clinical are hidden entirely in the panel setting; they appear only
in the Chart overlay and review settings of the same chart builder.

### Chart hit target

- The entire occupied patient panel is one transparent semantic button layer.
- Pointer/touch/click/keyboard activation opens the Chart overlay.
- The hit layer receives a clear focus ring.
- It must not cover or intercept room buttons or queue buttons.
- When empty, the hit target is absent/disabled and the Chart cannot open.
- There is no footer Chart button.

### Empty state

- Hide occupied content from sight and accessibility.
- Show `READY / SELECT A PATIENT` in a 9:16 aspect box (matching the shell),
  width preserved, vertically centered in the panel.
- Hint lines below: `TAP A WAITING ROOM PATIENT` always; plus `or` and
  `TAP THE TRIAGE ROOM DOOR TO RECALL THAT PATIENT` when recall is legal.
- Directional arrows are white fused text arrows (◀︎━━ / ━━▶︎) carrying U+FE0E
  variation selectors so phones do not render boxed emoji.
- Do not offer the Chart from the empty state.

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
- Assignment feedback pulses three times on an outcome-colored ring (green,
  amber, or red) around the selected row; the ring then persists as a halo on
  the open door until the room closes via recall or finalization.
- When recall is legal, show a leftward orange recall arrow into the center
  (text arrow with a U+FE0E variation selector).
- Do not reveal the correct row after a Close or Wrong result; the halo shows
  only the room the player chose.
- Accepted door wording must remain readable at smallest supported size.

Supplemental room definitions may appear on mouse hover or a roughly 520ms touch
hold. This help must not contain patient-specific hints. Ordinary tap/click still
assigns or recalls.

## GAME footer

Two wide buttons with a thin decorative middle strip; columns
`1.6fr 0.08fr 1.6fr`. Arrows are edge-pinned and sized to the button box.

- Left: green `◀ QUIT THIS SHIFT` with a small `RETURN TO ER ENTRANCE`
  subtitle.
- Center: no button and no hidden gameplay action; a neutral decorative strip.
- Right: red/orange `END SHIFT EARLY ▶` with a small `REVIEW THIS SHIFT`
  subtitle.
- Both actions confirm. Wording: "Quit this shift?" with `Yes, quit this
  shift`, and "End this shift early?" with `Yes, end shift early`; the cancel
  choice on both is `Whoops! I want to keep playing!`. Canceling returns to
  the unchanged GAME.
- Do not render a disabled Chart button.

Approved mobile-safe sizing: button padding `clamp(20px, 8.4cqw, 44px)`,
label text `clamp(9px, 3cqw, 15px)`, subtitle `clamp(5px, 1.6cqw, 9px)` with
`margin-top clamp(1px, 0.5cqw, 4px)`.

## Chart overlay

- Covers the shell with a dark translucent scrim and slight blur.
- The clipboard occupies most of the shell with roughly 8% outer padding. It is
  entirely CSS-drawn (no clipboard artwork): board gradient, metal clamp, and
  ruled cream paper.
- Chart content scrolls internally; body/page does not.
- The Presentation cards render directly with NO section header: always
  visible, never collapsible.
- `ANSWER` is a locked striped header with a `LOCKED` pill; activating it
  shakes the header briefly and never opens it.
- `CLINICAL` is a real toggle button with a chevron and `aria-expanded`,
  starting from the shift-level remembered preference.
- The red ✕ close box is pinned to the board's top-right corner.
- Conditional `MORE ABOVE` and `MORE BELOW` pills appear only when hidden
  content exists in that direction (with a small ~8px slack) and smooth-scroll
  roughly 70% of the visible chart per tap.
- Close paths: the red ✕, a scrim click (clicks inside the clipboard never
  close), and Escape on keyboard-capable devices.
- Opening focuses the close box; closing returns focus to the panel hit
  target.

### Photo zoom lightbox

- The chart's portrait carries a magnifier (🔍) badge top-right; the hit box
  is the whole photo, inset about 4%.
- Opening covers the ENTIRE clipboard with a dark blurred scrim — including
  the chart's red ✕, so only one close box is visible — and centers a 3:5
  photo card (paper mat, overflow hidden) showing the portrait at scale(1.3).
- The 30% zoom crops sides only, never heads; the 3:5 height absorbs it. If
  the zoom ever exceeds about 55%, switch to top-anchored `object-fit: cover`.
- Mirrored patients keep their flip.
- Close: the red box on the card, a scrim tap, or Escape. Escape peels the
  lightbox first, then the Chart.
- The lightbox is ephemeral (not in the state tree) and starts closed on every
  Chart open.

## HOME view (ER ENTRANCE)

Use the accepted 852 x 1515 entrance composition and registered overlays
described in document `6`. The player-facing name is ER ENTRANCE; internal
code and asset keys keep `home`/`lobby`.

HOME has one gameplay state: pre-shift setup with a Start Shift overlay/action.
There is no Resume Shift, active-entrance, or Return to Game presentation.

The settings board contains:

- title and initials (player board);
- Triage/RUSH mode;
- Strict/Forgiving;
- mode-specific length;
- the three sound toggles: GLOBAL, GAME SOUNDS, MUSIC;
- UI Hints.

Title choices include `Intern`. Settings controls use real labels, radios,
checkboxes, and selects over the board artwork. About uses the accepted About
board. There is no boombox: the boombox metaphor is retired, and music
(KING-FM) starts only from HOME gestures and never autoplays.

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
- one `RETURN TO ER ENTRANCE` primary-view action.

Formula rows use a compact two-column grid and color accent on outcome rows.
Do not show reassignment attempts as separate patients.
SHIFT REVIEW has no Return to Game or direct New Shift action. Return to ER
Entrance opens HOME, where settings may be changed and Start Shift creates a
new game.

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
