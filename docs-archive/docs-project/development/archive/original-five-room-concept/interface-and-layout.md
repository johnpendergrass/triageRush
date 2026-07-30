# triageRush — v1 Original Concept — Archived Interface and Layout

> **ARCHIVED:** This interface contract belongs to the original v1 concept.
> It is not the current specification. See the
> [active Single Source of Truth](../../singleSourceOfTruth/README.md).

**Last reviewed:** 2026-07-25 15:24 PDT
**Status:** Archived v1 original-concept contract
**Former owner:** v1 viewport, geometry, visual layers, and artwork use

## Viewport contract

triageRush is a fixed portrait, non-scrolling mobile-browser game.

- Logical canvas: **360 × 640 CSS pixels**
- High-resolution design canvas: **1080 × 1920 raster pixels**
- Raster scale: **3×**
- Aspect ratio: **9:16**
- Scale the complete game canvas uniformly.
- Fit against `100vw × 100svh`.
- Letterbox surplus width or height.
- Do not reflow when mobile browser controls retract.
- Keep the document and game shell `overflow: hidden`.
- Respect safe-area insets.

Required viewport checks:

- 360 × 640
- 375 × 667
- 390 × 700
- 393 × 720
- 402 × 780
- 412 × 732
- 430 × 800

The earlier detailed viewport analysis remains available as historical support:
[mobile viewport contract](../../DESIGN/2026%200724%20codex%20mobile-viewport-contract.md).
This document owns the current implementation contract.

## Primary layout

### Vertical regions

| Region | CSS pixels | Raster pixels | Canvas share |
|---|---:|---:|---:|
| Header | 40 | 120 | 6.25% |
| Play area | 560 | 1680 | 87.5% |
| Footer | 40 | 120 | 6.25% |

### Play-area columns

```css
grid-template-columns: 22% 56% 22%;
```

| Column | Share | CSS target | Raster target |
|---|---:|---:|---:|
| Waiting room | 22% | 79.2 px | 237.6 px |
| Active patient | 56% | 201.6 px | 604.8 px |
| Destination doors | 22% | 79.2 px | 237.6 px |

Practical 1080-pixel rounding is **238 / 604 / 238**.

### Side rows

Waiting patients and destination doors share five equal rows:

```css
grid-template-rows: repeat(5, minmax(0, 1fr));
```

- Play-area height: 560 CSS pixels.
- Each row: 112 CSS pixels / 336 raster pixels.
- A waiting cell and the corresponding destination cell share boundaries.
- Generated full-layout artwork is not a geometry authority.
- The complete cell is the touch target; artwork sits inside it.

## Artwork authority

Current selected artwork:

[SELECTED ARTWORK](../../DESIGN/REFINING%20IMAGES/SELECTED%20ARTWORK/)

The folder currently contains 35 files:

- Full-layout example and companion specifications.
- Patient-panel background and four overlays.
- Sixteen waiting-room backgrounds.
- Ten door images: closed and open state for each destination.

Use selected files over similarly named earlier renders. The user may revise
the selection later.

## Active-patient panel

Selected background:

- **604 × 1680 raster pixels**
- Approximately **201.33 × 560 CSS pixels**

Selected overlays:

| Overlay | Raster dimensions |
|---|---:|
| Name plaque | 245 × 61 |
| Quote bubble | 509 × 151 |
| Vitals panel | 540 × 234 |
| Presentation clipboard | 539 × 250 |

Layer order:

```text
0   corridor/patient-panel background
10  current patient image
20  plaque, quote, vitals, and presentation artwork
30  runtime HTML text and semantic controls
```

- Do not bake patient-specific text or vital values into the artwork.
- Apply `imageScale` uniformly to the patient layer from bottom center.
- Apply `imageFlipped` without changing the layout box.
- The visual three-dot control needs a semantic HTML button overlay.
- Final font sizes, padding, and text bounds require browser testing.

## Waiting-room cells

All selected waiting-room backgrounds are:

- **238 × 336 raster pixels**
- Approximately **79.33 × 112 CSS pixels**
- Aspect ratio **17:24**

Approved background geometry:

- Wall: 262 raster pixels / 77.98%.
- Floor: 74 raster pixels / 22.02%.
- Wall/floor junction: raster `y = 262`.

Tested patient overlay:

- Raster: `left 0`, `top 98`, `width 238`, `height 238`.
- CSS: `left 0`, `top 32.67`, `width 79.33`, `height 79.33`.

Choose one background when a patient enters a waiting slot and retain it for
that appearance. Do not choose a new background on every render.

## Door cells and states

Door labels and clinical routing are owned by
[gameplay-rules.md](gameplay-rules.md).

### RESUS, ACUTE, FAST TRACK, and PSYCH

Closed state:

- One seamless door slab with no middle seam.
- Handle at the left/free edge.
- Handle horizontal.
- Indicator housing present with light off.

Open state:

- Right-hinged door opens inward approximately halfway.
- Handle is depressed approximately 45 degrees.
- Door lettering stays on the slab and follows perspective.
- Indicator is on.
- Interior environment matches the destination.

Interior distinctions:

- RESUS: resuscitation bay; idle/disconnected monitor uses flat traces and
  dashes, not patient values.
- ACUTE: acute treatment equipment distinct from RESUS.
- FAST TRACK: simpler exam table, chairs, rolling BP monitor, and clinician
  stool.
- PSYCH: calm office/behavioral-health furniture.

### DISCHARGE

- Large paired glass doors with surrounding glass.
- Closed and open views share the same exterior campus.
- No people.
- Same partially visible ambulance and two distant cars in both states.
- Small blue sign shows hospital `H`, wheelchair icon, and right arrow.
- Do not use the earlier oversized red EMERGENCY sign.
- Both doors push outward; one is approximately 75% open and the other 50%.

### Source-size caution

Most selected doors are 1055 × 1491 pixels; two are 1054 × 1492. Normalize
them later or enforce one consistent crop/`object-fit` rule inside the
238 × 336 destination cells.

## Expanded clipboard

- One expanded clipboard, not separate quote and presentation dialogs.
- It shows `quoteLong` and `presentationLong`.
- The patient and waiting-room layers do not shift.
- It may cover the default quote.
- It must not cover the vitals or `presentationShort`.
- Surrounding inactive regions may become grayscale.
- Only the return control remains active.

## Accessibility and implementation checks

- Use semantic buttons for patient choices, doors, and clipboard controls.
- Preserve visible keyboard focus.
- Ensure touch targets are the full cells.
- Keep required content inside safe-area padding.
- Opening the clipboard must not cause layout shift or scrolling.
- Door-state feedback must not be the only indicator of scoring outcome.
- Test initial browser chrome, chrome retraction, and restoration.
