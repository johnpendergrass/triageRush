# Mobile UI and Interaction Specification

**Last modified:** 2026-08-07

**Latest change:** The two ER ENTRANCE summary boards are built - see "The two
sidewalk summary boards" under HOME - carrying the review buttons with them.
Earlier: the 2026-08-04/05 amendments (Chart naming, footer wording and sizing,
approved patient-panel layout, empty-state hints, flat green rail background,
Chart overlay composition, photo zoom lightbox).

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
  SHIFT REVIEW. Timer expiry does the same without a dialog. Both endings
  land on SHIFT REVIEW behind the shift-over acknowledgement overlay
  described below.
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

### Mode lettering (2026-08-06; names the MODE since 2026-08-07)

- The header names the MODE BEING PLAYED - `Triage!` or `Triage RUSH!` -
  NOT the game (John, 2026-08-07). Showing the brand in both modes read as
  branding and told the player nothing about which shift they were on.
- The sign treatment is unchanged: the ER ENTRANCE sign's spelling and
  colors (face #ec543d, stacked brick-red 3D extrusion shadows;
  `.brand-sign`, em-based so it scales). RUSH! renders 1.18x larger
  (`.brand-rush`), like the sign.
- BOTH spellings are STATIC markup inside one `<p>`, and ui.js unhides one -
  the same pattern the sidewalk summary board uses. Elsewhere the brand still
  never varies and ui.js writes none of it.
- **The two modes are SIZED SEPARATELY**, as on the summary board.
  `Triage RUSH!` is unchanged; `Triage!` is five characters shorter and takes
  the freed width at 1.4em (19px against 13.6px on a 371px shell).
- Centered between the shell's left edge and the scorecard.

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

### Sound (the GLOBAL SOUND setting)

- Compact semantic toggle, approximately 24 x 28 CSS pixels in the reference
  header but with an accessible hit target where possible.
- It IS the GLOBAL SOUND setting, not a per-shift mute (2026-08-07): tapping
  it writes and persists that value, so it silences music as well as game
  sounds, survives the shift, and the settings board shows the same state.
- Accessible name alternates between Mute sounds and Unmute sounds.
- Muted state is visible without relying only on color.

## Waiting queue

- The queue rail sits on a flat dark green (#0f3d2f, tunable), not wall
  artwork.
- Each triage-room cell is a LAYERED composition (built 2026-08-06), back
  to front: the rail's flat green → shared wall art filling the cell →
  per-room interior scene (in the door-art box, 61%/91% bottom-aligned) →
  assigned patient standing in the doorway (open room only; center at 45%
  of cell width, bottom 9%, height 80%, max-width 66%) → door art, whose
  transparent open doorway does the reveal. Stacking is DOM order.
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

- Two rows by three columns, and the columns are NOT equal: the middle one
  is wider (0.75fr / 1.5fr / 0.75fr) because it carries both long readings,
  BP and TEMP. The outer columns hold two- and three-character numbers and
  give the width up (2026-08-07).
- Order: HR, BP, RR, SpO2, TEMP, PAIN. This order is what puts BP and TEMP
  in the middle column; reordering means re-deriving the column widths.
- TEMP shows both scales, Celsius first: `37.0 / 98.6`, under a `TEMP C/F`
  label. Records are authored in Celsius and stay that way - the
  conversion happens at display time in the chart builder, so the panel,
  the Chart clipboard, and Patients Seen always agree.
- Each tile (variant A, 2026-08-06): vital icon on the left, label-over-
  value stack on the right. The icons are hand-authored inline SVG defs in
  index.html stamped per tile with <use> (mockup:
  _mockups/vitals-icons-mockup.html); no icon image assets exist or are
  needed.
- Labels small and strong; values larger. The icon is sized against the
  label-over-value stack beside it, never larger, so it never drives the
  tile's height.
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
  `TAP THE TRIAGE ROOM DOOR TO RECALL YOUR MOST RECENT PATIENT` when recall
  is legal (wording set by John, 2026-08-07).
- Directional arrows are white fused text arrows (◀︎━━ / ━━▶︎) carrying U+FE0E
  variation selectors so phones do not render boxed emoji.
- Do not offer the Chart from the empty state.

### Result toast and countdown

- Assignment result appears transiently over the center panel:
  `✓ CORRECT`, `△ CLOSE`, or `− WRONG` (minus, not a cross — 2026-08-06).
- The result includes matching color but remains readable in monochrome.
- RUSH final numerals 10 through 1 are white, heavy, and centered on the
  middle of the patient image.
- Each numeral pops in quickly, then expands and dissolves (fading and
  softening as it grows) over about half a second.
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
  entirely CSS-drawn (no clipboard artwork): board gradient, a header row, and
  ruled cream paper.
- The board's header row (2026-08-05; replaced the metal clamp): `PATIENT
  CHART` left-justified with a decent margin in subdued pressed-into-the-board
  lettering, then the LIVE shift clock (TIME over value, board tones), then
  the red ✕ at the right edge. The clock mirrors the game header's value every
  second — the shift clock keeps running while the chart is open, so it must
  stay readable here. (The retired clamp CSS is kept commented in styles.css.)
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

The settings boards (letter-board look, built 2026-08-07 from the locked
mockups) contain:

- PLAYER NAME board: title and three initials, each on a Vegas-odometer drum.
  Two ways to change one and neither raises a keyboard - chevrons step with
  wrap-around, and tapping the value opens the platform picker. The initials
  alphabet is A-Z, "-", and seven emoji.
- GAME OPTIONS board: Triage/RUSH mode, Strict/Forgiving, mode-specific
  length, then a SOUND OPTIONS section - GLOBAL SOUND off/on as the headline,
  with GAME SOUNDS and MUSIC each off/lo/hi below it. There are no
  per-family on/off toggles: OFF lives inside each level. A selected OFF fills
  red rather than green. **The MUSIC row is ABSENT** - not disabled - until
  the player's middle initial is 🎼 (2026-08-07); a greyed-out control
  advertises itself, a missing one does not. The Music line on the sidewalk
  summary board hides with it, so a locked player sees no trace of music on
  either board.

Every setting is a two-line group: a left-justified header over a centered
options row with wide tap gaps. The section-opening groups (GAME MODE, GLOBAL
SOUND) run a step larger. The brand words are the only orange on the board.

The game screen's sound icon IS the GLOBAL SOUND setting - one persisted value
seen in two places, not a per-shift mute.

Sound levels audition as they are tapped, because the board lives on HOME
where a player would otherwise be choosing a volume they cannot hear: music
starts or stops immediately at the chosen volume, and a GAME SOUNDS tap plays
one representative sound. An audition follows what the board currently shows,
GLOBAL SOUND included, and saves nothing - cancelling puts music back to the
saved setting, exactly as the red X does for every other edit.

### The two sidewalk summary boards (built 2026-08-07)

Both boards now carry lettering, in the same press-in white letter-board type
as the detail boards, inside the ribbed FACE of each board's art - never over
its wooden frame. Nothing marks either board as tappable: a player tries the
board and gets the detail board.

The GAME board is a read-only mirror of all six GAME OPTIONS values, hung from
the top frame: `GAME MODE` labelling the brand words, then SCORING and LENGTH
as label-over-value pairs, a rule, and SOUND / GAME / MUSIC as compact rows.
An OFF value prints red, the same meaning the detail board's red OFF radios
carry, and with GLOBAL SOUND off the two level rows dim, because they are
moot. Lengths abbreviate what the detail board spells out - `5 MIN`,
`60 SEC` - keeping the detail board's mode-dependent units.

Only the MODE is enlarged. Every other label and value on that board runs at
one size: the values are bright white against dim grey labels, so they stand
out on colour alone (John, 2026-08-07), and holding them level is what gives
the mode its prominence and the sound section its air. The brand words stay
on ONE line in both modes, and the mode row RESERVES the taller of the two so
that switching modes moves nothing below it.

The PLAYER board is two halves, and they behave differently:

- Above the rule, `WELCOME!` over the player's title and initials. This half
  is ONE button and it opens PLAYER NAME. **The edit target stops at the
  rule** (John, 2026-08-07).
- Below it, two buttons, each a single hit box carrying its own two lines -
  `REVIEW` over `LAST SHIFT` (TODO 13), and `REVIEW` over `PAST SHIFTS`
  (TODO 11, inert until Phase 9 persistence). They are centered in the space
  with equal air above, between and below. Each is dimmed and inert when
  there is nothing to open, rather than disappearing, so the board never
  changes shape and the player learns the feature exists.

The welcome half takes only the height its three lines need, which puts the
rule at about 36% down the board and gives the two review buttons the rest -
that is deliberate, since they are the only tap targets on the board that are
not the whole board.

REVIEW LAST SHIFT reopens the stored report directly; it does NOT replay the
SHIFT ENDED acknowledgement, which belongs to finishing a shift. The report it
shows is the shift as PLAYED - its mode, difficulty, length and provider -
even if the player has changed settings since.

There is no UI Hints control (setting removed 2026-08-07); the patient
panel's empty-state arrows are permanent.

Title choices include `Intern`. Settings controls are the letter-board groups
described above - radios over the board artwork, and odometer drums for the
player name; there are no text inputs or selects on the boards, and no
keyboard ever appears. About uses the accepted About board. There is no
boombox: the boombox metaphor is retired, and music starts only from a user
gesture and never autoplays.

Music is five LOCAL files played in order and looped (2026-08-07), replacing
the KING-FM stream, which could not be volume-controlled on iOS. It plays
everywhere - entrance, shift and report - and a new shift never interrupts it;
turning it off and on again restarts at the first track. Because a reload
cannot resume audio unattended, the first tap anywhere restarts the playlist
if the settings want it. The board row, its levels, and its auditioning are
unchanged, except that the row is hidden until the name unlocks it.

## SHIFT REVIEW view

The review is its own full-frame view: a printed summary on warm paper stock
within the 9:16 shell. The look is variant B "LEGIBLE" from the 2026-08-05
mockups, built 2026-08-06 — the supervisor-evaluation motif (FORM ED-7) was
explored and NOT adopted.

Show:

- the title — ONE centered unit, identical in both modes (2026-08-06): the
  `Triage RUSH!` brand lettering (sign treatment, `.brand-sign`) plus a
  1.3em gap plus "Shift Report" in serif small-caps (Georgia stack), like
  a printed report masthead. Sized (4.8cqw/23px) so the unit always fits
  one line; NEVER apply `text-transform: uppercase` to the brand — the
  mixed case and the ! are part of the name;
- the mode line beneath, deliberately prominent (2026-08-06): a blank-line
  gap under the title and a font size above the meta text. It reads
  `MODE: <Mode>, <Difficulty>, <configured length>`, e.g.
  `MODE: Triage RUSH!, Strict, 60 seconds` or `MODE: Triage!, Forgiving,
  5 minutes` — this line and the settings radios are the only two places
  where "Triage!" alone names the mode. The length is the CONFIGURED
  shift length, worded exactly as its Settings radio (RUSH in seconds,
  Triage in minutes) — labels use words, running time uses m:ss;
- meta as a 2 x 2 grid of left-ruled cells, key over value: PROVIDER,
  DURATION, PATIENTS SEEN, DATE. The columns are deliberately uneven
  (~0.82fr / 1.18fr): the right column starts about three characters left
  of center so DATE fits on one line (2026-08-06);
- prominent final score;
- the scoring table — ALWAYS three rows, CORRECT / CLOSE / WRONG, so the
  table never changes shape. Under Strict the CLOSE row reads NA with empty
  count/multiplier cells. LEFT WAITING appears nowhere on the review;
- the two direction counters as boxed buttons (below);
- `Review the Patients Seen (n)` action (mixed case as written);
- one `RETURN TO ER ENTRANCE` primary-view action.

The table uses a four-column grid (label, count, multiplier, subtotal).
Each label opens with its outcome glyph in the outcome's accent color —
✓ CORRECT, △ CLOSE, − WRONG, the same marks as the toast and photo badge
(2026-08-06) — while the word stays in label ink; the subtotal carries the
row's other color accent. Under Strict the NA CLOSE row recedes whole,
glyph included. DURATION is time actually run, so a shift
ended early at 3:12 of 5:00 reads 3:12 — and because the mode line prints the
configured length just above, a shift the player stopped early carries an
inline note on the value line: `0:42 * ended shift early` (plain `*`; anything
fancier needs the U+FE0E treatment). Timer expiry needs no note; a quit shift
never reaches the review. The whole summary fits one screen with no
scrolling.
Do not show reassignment attempts as separate patients.
SHIFT REVIEW has no Return to Game or direct New Shift action. Return to ER
Entrance opens HOME, where settings may be changed and Start Shift creates a
new game.

Legibility rules this variant exists for (apply to any cream-paper surface):
secondary ink is `#4b585e`, never the too-light `#6d7b81`; no clamp minimum
below 10px; letter-spacing on small-caps labels near 0.06em, never 0.22em.

### Direction counters explain themselves

One boxed section (2026-08-06): the UNDER-TRIAGED and OVER-TRIAGED counters
as real `<button>` elements, with the scoring disclaimer always visible
inside the same box beneath them. Hovering or tapping a counter swaps that
counter's OWN content for its explanation, in place — the explanation KEEPS
the counter's label as its first line, so the reader never loses which box
they are in; there is no separate help line. The buttons' min-height is
RESERVED space sized to fit label plus wrapped explanation, so the swap
never shifts the page under the user's finger, and it stays at or above the
44px touch floor. (The FINAL SCORE number gave up one size step to fund
this height.)

Hover explains on desktop; tap pins on touch, because iOS has no hover. A
pin releases three ways: tapping the pinned counter again, pinning the
other counter, or a 5-second timeout — so a phone reader is returned to the
numbers without a second tap. The hover swap is scoped under
`@media (hover: hover)`: iOS "sticks" `:hover` after a tap until the next
tap elsewhere, which kept the explanation up after the timeout had released
the pin, so on touch devices the pin class is the ONLY driver (2026-08-06).

Wording (says "misses" — the counters move on CLOSE calls too, in every
mode and difficulty; the safer/more-dangerous guidance was cut 2026-08-06):

- disclaimer (always visible; MUST fit one line — measure the text against
  the NOTE BOX's width, not the viewport, and leave ~30% headroom because
  iOS system fonts run wider than Windows fonts at the same size):
  "* not used in scoring. These count which way you missed."
- under: "UNDER-TRIAGED / Sent to a room less urgent than the patient
  needed."
- over: "OVER-TRIAGED / Sent to a room more urgent than the patient
  needed."

The review makes NO claim about performance "for level of training" and
carries no grade — we are not qualified to set that bar, and with no score
ceiling a percentage grade has nothing to rest on. It never faults the
player for patients left waiting.

### Shift-over acknowledgement

An overlay, not a fourth view, so the three-view model above is untouched.
It covers the finished summary until dismissed: a near-opaque scrim with a
blur, the headline (`TIME'S UP` or `SHIFT ENDED`), the patients-seen count,
and a prompt. The whole frame is one button, so a tap anywhere works on
touch while Enter and Space serve keyboard players. It takes focus when it
appears and hands focus to the summary's first enabled action when
dismissed.

### Patients Seen browser

Opening Patients Seen displays the same detailed chart inside a review
wrapper built from the Chart's clipboard, so a reviewed patient looks like
that patient did during play.

- The header slot that carries the live shift clock during play carries
  `index / total` here; a finished shift has no clock to show.
- No name banner: the chart's own nameplate sits directly below the header
  and already gives the name and age, so a banner would only repeat it.
- Previous and next are large arrowheads in the blank paper margin either
  side of the patient photo, clear of the image. They are fixed to the
  clipboard rather than the scrolling paper, so they stay reachable at any
  scroll position, and they claim no layout width.
- Dedicated close box. It sits one z-index step ABOVE the sticky
  nameplate: the X dips a few pixels into the paper region, and at an
  equal z-index the nameplate's paper-colored shadow slab painted over
  the X's corner (fixed 2026-08-06).
- The patient photo zooms (2026-08-06): the Chart overlay's lightbox
  treatment, identical specs - magnifier badge, dark scrim, 3:5 card,
  close box / scrim tap / Escape to dismiss - and deliberately WITHOUT
  the outcome badge on the zoomed photo.
- Navigation wraps when at least two patients exist; with one patient it
  safely lands back on that patient.
- Patient change carries the reading position as a proportion of scrollable
  height (see document 3); opening starts at the top.
- The nameplate is pinned to the top of the scrolling area.
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
