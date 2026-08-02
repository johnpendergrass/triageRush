> **Historical session snapshot — not authoritative.** Start with the current
> [Single Source of Truth](../singleSourceOfTruth/README.md).

# triageRush — Session Summary and Restart Guide

**Session date:** 2026-07-24  
**Purpose:** Durable handoff for the next Codex session. Read this document
before resuming design or implementation work.

## Table of contents

1. [Project understanding](#1-project-understanding)
2. [Current repository structure](#2-current-repository-structure)
3. [Authoritative mobile viewport contract](#3-authoritative-mobile-viewport-contract)
4. [Main gameplay layout](#4-main-gameplay-layout)
5. [Mockup sequence and naming convention](#5-mockup-sequence-and-naming-convention)
6. [Patient-panel background and overlay assets](#6-patient-panel-background-and-overlay-assets)
7. [Waiting-room background system](#7-waiting-room-background-system)
8. [Room-door layout](#8-room-door-layout)
9. [Expanded information clipboard](#9-expanded-information-clipboard)
10. [Patient text and JSON direction](#10-patient-text-and-json-direction)
11. [Clinical audit and patient-content context](#11-clinical-audit-and-patient-content-context)
12. [Work completed during this session](#12-work-completed-during-this-session)
13. [Important specifications and documents](#13-important-specifications-and-documents)
14. [Known limitations and cautions](#14-known-limitations-and-cautions)
15. [Recommended next steps](#15-recommended-next-steps)
16. [Fast restart checklist](#16-fast-restart-checklist)

---

## 1. Project understanding

triageRush is a portrait browser game about emergency-department triage. The
player receives a rapid, deliberately limited view of each patient and assigns
the patient to an appropriate destination.

The player-visible evidence is intended to be:

1. Patient image.
2. Basic demographics: name, age, sex, and race.
3. Patient quote.
4. Short clinical presentation.
5. Six vital-sign values.

The game must be medically relevant and defensible, but it should not punish
reasonable close calls. A slightly more serious room should generally be
accepted unless the correct placement is a true slam dunk. Placing a serious
patient in a lower-acuity room requires much stricter review.

The project is now intentionally separated into three application surfaces:

- **triageRush-app:** the playable game, its UI, assets, tools, and game docs.
- **patientsCRUD-app:** creation, validation, maintenance, and final source of
  truth for patient JSON and patient images.
- **patientsBrowser-app:** eventual standalone patient-data browser/editor.

The current root is:

`D:\Dev\Projects\triageRush`

The previous project was largely discarded. Do not assume old scaffold paths or
old `chatGPT-dev-stuff` paths still exist.

---

## 2. Current repository structure

```text
triageRush/
├── index.html                         # currently empty
├── README.md                          # currently empty
├── docs/
│   └── DESIGN/
│       ├── governing design notes
│       └── REFINING IMAGES/
├── triageRush-app/
│   ├── assets/
│   │   ├── audio/
│   │   ├── config/
│   │   ├── patient-data/
│   │   ├── patient-images/
│   │   └── ui/
│   │       ├── backgrounds/
│   │       ├── other/
│   │       └── panels/
│   ├── css/
│   ├── docs/
│   ├── html/
│   ├── js/
│   └── tools/
├── patientsCRUD-app/
│   └── patient-data/
│       ├── anchorImages/              # 15 PNG files
│       ├── docs/
│       ├── patient-images/            # 160 PNG files
│       └── patient-json/              # 160 JSON files
└── patientsBrowser-app/
```

The `triageRush-app/docs/game-design.md` and `player-help.md` files currently
exist but are empty.

The root `index.html` must eventually support GitHub Pages. The user understands
that the root entry point may load application code and assets from subfolders.

---

## 3. Authoritative mobile viewport contract

The game targets the playable browser area on modern mobile phones while Safari
or Chrome browser controls remain visible. It is not designed around the
advertised full-screen phone resolution.

### Fixed design baseline

- Logical game canvas: **360 × 640 CSS pixels**
- High-resolution design canvas: **1080 × 1920 raster pixels**
- Raster scale: **3×**
- Aspect ratio: **9:16**
- No internal scrolling.
- No alternate expanded mobile state.
- No reflow when browser chrome retracts.
- Extra visible space is letterboxed.
- The complete game canvas scales uniformly as one unit.

The implementation should use the stable small viewport (`100svh`) rather than
letting `100dvh` resize the game as browser controls move.

Read the full governing contract:

- [Mobile viewport contract](2026%200724%20codex%20mobile-viewport-contract.md)

Required test sizes:

- 360 × 640
- 375 × 667
- 390 × 700
- 393 × 720
- 402 × 780
- 412 × 732
- 430 × 800

Until a separate desktop layout is designed, desktop may center and letterbox
the mobile game.

---

## 4. Main gameplay layout

### Horizontal structure

The approved target is:

- Waiting room: **22%**
- Active patient: **56%**
- Room destinations: **22%**

Use:

```css
grid-template-columns: 22% 56% 22%;
```

At the 1080-pixel raster baseline, ideal widths are:

- 237.6 / 604.8 / 237.6 pixels

Practical integer rounding is:

- 238 / 604 / 238 pixels

At the 360-pixel CSS baseline, ideal widths are:

- 79.2 / 201.6 / 79.2 CSS pixels

The image generator does not reliably preserve exact column boundaries.
**HTML/CSS must enforce the ratios mathematically.**

### Vertical structure

Working contract:

- Header: 40 CSS px / 120 raster px / 6.25%
- Play area: 560 CSS px / 1680 raster px / 87.5%
- Footer: 40 CSS px / 120 raster px / 6.25%

### Side-row structure

The waiting-room rail and destination rail share one grid:

```css
grid-template-rows: repeat(5, minmax(0, 1fr));
```

Each logical side row is:

- 112 CSS pixels high
- 336 raster pixels high

There are five waiting patients and five destination buttons. Corresponding
rows must share the same boundaries.

The generated `g` image contains visibly unequal row heights. That is an
artifact of image generation and must not be copied into production CSS.

### Working HTML/CSS reference

- [g HTML layout](REFINING%20IMAGES/mockups/2026%200724g%20triageRush%20symmetric%20layout%20doors%20match%20waiting%20panels.html)
- [g CSS layout](REFINING%20IMAGES/mockups/2026%200724g%20triageRush%20symmetric%20layout%20doors%20match%20waiting%20panels.css)

These files are a structural prototype, not production game code.

---

## 5. Mockup sequence and naming convention

The user renamed the July 24 design sequence with alphabetical suffixes so files
sort in creation order.

Examples:

- `2026 0724a ...`
- `2026 0724b ...`
- through `z`
- then `za`, `zb`, `zc`, and so on

Continue this convention for future design artifacts.

Important sequence milestones:

- **a–c:** early short-text and clipboard experiments.
- **d:** symmetric-centered 1080 × 1920 base.
- **e:** 22/56/22 symmetric-layout target and clipboard variant.
- **f:** first five-door experiment.
- **g:** doors aligned to waiting-room panel rows; companion HTML/CSS reference.
- **h:** reconstructed empty active-patient background.
- **i–l:** isolated patient-panel overlay art.
- **m:** combined patient-overlay positioning and implementation spec.
- **n–o:** waiting-room floor-depth experiments.
- **p onward:** approved 22% floor waiting-room background family.

The most important full-screen raster reference is currently:

- [g symmetric layout](REFINING%20IMAGES/2026%200724g%20%26%26%26%20triageRush%20symmetric%20layout%20doors%20match%20waiting%20panels.png)

Its material treatment and composition are useful, but exact geometry must come
from CSS and the specs.

---

## 6. Patient-panel background and overlay assets

### Empty patient-panel background

Asset:

- [h patient-panel background PNG](REFINING%20IMAGES/2026%200724h%20%26%20triageRush%20patient%20panel%20background.png)
- [h background specification](REFINING%20IMAGES/2026%200724h%20%26%20triageRush%20patient%20panel%20background.txt)

Dimensions:

- 604 × 1680 raster pixels
- approximately 201.33 × 560 CSS pixels at 3×

The asset contains:

- Metallic center-panel frame.
- Empty hospital corridor.
- Ceiling, side doors, rear double doors.
- `ROOMS →` environmental sign.
- Checkerboard corridor floor continued to the bottom.

Removed from the background:

- Patient and chair.
- Patient-name plaque.
- Quote bubble.
- Vitals panel.
- Presentation clipboard.
- Runtime text and icons.

Important accuracy note: areas hidden behind the patient and UI in the source
mockup could not be literally recovered. They were reconstructed to continue
the corridor and floor. The size is exact; hidden background pixels are
generated production-candidate art.

### Patient-panel overlay assets

All four overlays are transparent 32-bit PNGs:

1. [i empty patient-name plaque](REFINING%20IMAGES/2026%200724i%20triageRush%20empty%20patient%20name%20plaque.png)
   - 245 × 61 raster px
2. [j empty quote bubble](REFINING%20IMAGES/2026%200724j%20triageRush%20empty%20patient%20quote%20bubble.png)
   - 509 × 151 raster px
3. [k vitals panel, labels but no values](REFINING%20IMAGES/2026%200724k%20triageRush%20vitals%20panel%20labels%20no%20values.png)
   - 540 × 234 raster px
4. [l empty presentation clipboard](REFINING%20IMAGES/2026%200724l%20triageRush%20empty%20presentation%20clipboard.png)
   - 539 × 250 raster px

The vitals asset retains:

- Icons.
- HR, BP, RR, SpO₂, Temp, and Pain labels.

It removes:

- 108
- 108/70
- 20
- 95%
- 37.0°C
- 5/10

Runtime values must be HTML text layered over the art.

The presentation clipboard retains its metal clip, empty paper region, border,
and visual three-dot button. A semantic HTML button must be placed over the
three-dot artwork.

The authoritative positioning and sample HTML/CSS are in:

- [m patient-panel overlay asset specification](REFINING%20IMAGES/2026%200724m%20triageRush%20patient%20panel%20overlay%20asset%20specs.txt)

Key percentage positions within the 604 × 1680 panel:

| Overlay | Left | Top | Width | Height |
|---|---:|---:|---:|---:|
| Name plaque | 28.6424% | 1.25% | 40.5629% | 3.6310% |
| Quote bubble | 6.6225% | 61.3690% | 84.2715% | 8.9881% |
| Vitals panel | 3.9735% | 70.2976% | 89.4040% | 13.9286% |
| Presentation | 4.1391% | 84.1667% | 89.2384% | 14.8810% |

These positions are starting points taken from the mockup. Final text padding,
font sizes, and line heights still require browser-based visual testing.

### Recommended layer order

```text
z-index 0:  patient-panel corridor background
z-index 10: transparent current-patient image
z-index 20: name/quote/vitals/presentation art
z-index 30: runtime text and interactive HTML controls
```

---

## 7. Waiting-room background system

### Cell geometry

The production target for every waiting-room cell background is:

- **238 × 336 raster pixels**
- approximately **79.33 × 112 CSS pixels**
- aspect ratio **17:24**

The patient overlay tested successfully at:

- Raster: left 0, top 98, width 238, height 238
- CSS at 3×: left 0, top 32.67, width 79.33, height 79.33

### Floor-depth experiments

- `n` tested a deep floor around 40%; it made the wall feel too far away.
- `o` tested a 30% floor; it was better.
- `p` tested a 22% floor; the user approved it.

Approved shared depth:

- Wall: 262 raster pixels / 77.98%
- Floor: 74 raster pixels / 22.02%
- Wall/floor junction: raster y = 262

The floor must be:

- Smooth, bare, seamless hospital-grade sheet vinyl.
- Slightly darker/cooler than the warm cream wall.
- No tiles, grout, seams, boards, squares, or checker pattern.
- Only faint grounding shadows and restrained diffuse reflections.

Furniture, plants, tables, posters, and equipment remain around the edges
because the transparent patient and chair cover most of the cell.

### Current background family

The family now contains 16 backgrounds:

1. `p` — plant left, chairs right
2. `q` — chair left, magazines and plant right
3. `r` — chairs at both edges, framed landscape
4. `s` — magazine table left, plant right
5. `t` — plant left, chairs and art right
6. `u` — fictional Harborlight Advantage advertisement
7. `v` — vaccination reminder poster
8. `w` — face-mask dispenser and sanitizer stand
9. `x` — water cooler and cups
10. `y` — clock, chairs, magazines, and plant
11. `z` — humorous `GOT VACCINATED?` flexed-arm poster
12. `za` — surgery: `WE'RE A CUT ABOVE!`
13. `zb` — optional psych wordplay poster
14. `zc` — radiology: `WE CAN SEE RIGHT THROUGH YOU!`
15. `zd` — cardiology: `WE'VE GOT A LOT OF HEART!`
16. `ze` — laboratory: `WE'VE GOT GOOD CHEMISTRY!`

Read the complete list, geometry, CSS, and random-assignment rules:

- [p–ze waiting-room background specification](REFINING%20IMAGES/2026%200724p-ze%20triageRush%20waiting%20room%20background%20asset%20specs.txt)

### Random-assignment behavior

- Assign one background when a patient enters a waiting-room slot.
- Store the chosen background ID with that waiting-room appearance.
- Do not choose a new background on every render.
- Release/reassign it when that patient leaves.
- Repetition is acceptable, but unused backgrounds may be preferred when
  several are available.
- The entire waiting cell is the touch target.

### Poster and mascot direction

The later department posters form a cohesive fictional in-world campaign:

- Similar frames and typography.
- Teal/blue/cream palette with warm-orange accents.
- Cheerful anthropomorphic medical-object mascots.
- No real hospital, insurer, government, vaccine, or campaign branding.
- No graphic medical imagery.

The `zb` psych poster contains deliberately corny wordplay:

> YOU'D HAVE TO BE CRAZY TO NOT VISIT OUR PSYCH DEPARTMENT!

The user explicitly stated that no stigma was intended and that the poster will
not be used without careful review. Treat it as an optional candidate, not an
approved production asset.

The pediatric-decor discussion concluded that original recurring triageRush
mascots are safer and more valuable than imitating SpongeBob, Dora, Bluey, Paw
Patrol, or other protected characters. Useful original themes include ocean,
dinosaurs, space, safari, storybook forest, toy clinic, and search-and-find
posters.

---

## 8. Room-door layout

There are five destination buttons:

1. RESUS — ESI 1
2. ACUTE — ESI 2–3
3. FAST TRACK — ESI 4–5
4. PSYCH — Behavioral Health
5. DISCHARGE

The discharge destination uses the glass-panel hospital door motif from:

- `2026 0722 triageRush 4th cut (chatGPT).png`

In production:

- All five room cells use the same shared row grid as waiting-room cells.
- The full cell is the interactive button.
- Door art is an asset inside the button and does not determine button size.
- The five actual illustrated doors do not yet have perfectly consistent
  internal artwork sizes. This is acceptable for the current mockup because
  HTML/CSS and final door assets will establish production geometry later.

Relevant files:

- [g layout image](REFINING%20IMAGES/2026%200724g%20%26%26%26%20triageRush%20symmetric%20layout%20doors%20match%20waiting%20panels.png)
- [g layout specification](REFINING%20IMAGES/2026%200724g%20%26%26%26%20triageRush%20symmetric%20layout%20doors%20match%20waiting%20panels.txt)

---

## 9. Expanded information clipboard

The default patient card shows:

- Patient image.
- `quoteShort`.
- Six vital values.
- `presentationShort`.
- One shared `…` information control.

Activating `…` opens one medical-clipboard overlay containing:

- `quoteLong`
- `presentationLong`
- Large `RETURN TO PATIENT ↩` control

There are not separate quote and presentation expansion buttons.

### Overlay behavior

- Patient image remains fixed; it never shifts.
- Waiting-room patients remain fixed; they never shift.
- Clipboard moves over the left waiting-room rail and left portion of the
  patient image.
- Clipboard may cover the normal quote.
- Clipboard must never cover vitals or `presentationShort`.
- Surrounding rails, header, footer, and doors become grayscale.
- Central patient panel remains in color beneath the overlay.
- No other control is active while the clipboard is open.
- No small close `×`; use the obvious return button.
- Whether the timer pauses remains unresolved. Do not penalize players for
  reading optional clinical detail without an explicit design decision.

Image mockups illustrate the concept, but clipboard geometry must be
deterministic HTML/CSS.

---

## 10. Patient text and JSON direction

The intended clinical fields are:

- `quoteShort`
- `quoteLong`
- `presentationShort`
- `presentationLong`

Default card:

- `quoteShort`
- `presentationShort`

Expanded clipboard:

- `quoteLong`
- `presentationLong`

Working authoring limits from the earlier design pass:

| Field | Working maximum |
|---|---:|
| `quoteShort` | 20 words |
| `quoteLong` | 40 words |
| `presentationShort` | 30 words |
| `presentationLong` | 60 words |

These are not final until rendered in the coded 360 × 640 interface. Actual
line wrapping and visual fit are authoritative.

Every placement-critical clue must be present in the short fields. The expanded
information panel may provide richer context, but it must not be required to
make a fair triage decision.

Planned `_comment` under `clinical`:

```json
"_comment": "Maximum word counts: quoteShort = 20, quoteLong = 40, presentationShort = 30, presentationLong = 60. All placement-critical clues must appear in the short fields. Long fields provide optional detail and must fit the expanded panel without scrolling."
```

Do not migrate all 160 JSON files until the real coded layout establishes the
rendered text limits.

---

## 11. Clinical audit and patient-content context

Earlier in this long working thread:

- Patient images and revisions were cleaned.
- Image concerns were identified for patients 002, 122, and 149.
- Skin-spot severity was reviewed for 006, 083, 144, and 145.
- Stroke depiction was reviewed for 035.
- New patient concepts were planned for:
  - nocturnal micturition syncope;
  - post-hospital severe diarrhea with eventual C. difficile diagnosis;
  - drug-seeking behavior;
  - travel-related infectious disease cases.
- A disposition/ESI/room audit methodology was established.
- The audit was based on player-visible evidence rather than hidden diagnosis.

The older design note records:

- 160-patient audit completed in the former workspace.
- 126 passed without material concern.
- 8 needed ESI or primary-room review.
- 10 needed a more forgiving alternate room.
- 18 presentations contained answer-revealing diagnostic wording.

It also records approved pilot changes for:

- 003
- 017
- 055
- 072
- 129
- 145
- 160

However, the audit output paths listed in the older note reference the discarded
project structure. Verify which changes and audit artifacts were actually
migrated before relying on those paths.

Current retained source counts:

- 160 patient JSON files
- 160 patient PNG images
- 15 anchor images

---

## 12. Work completed during this session

### Layout and documentation

- Confirmed 1080 × 1920 / 9:16 as the high-resolution mockup standard.
- Rejected older 2:3 mockups as dimension authorities.
- Changed side/center proportions to 22/56/22 to maximize patient-panel space.
- Created and documented the symmetric-layout mockup.
- Established five matching waiting-room and destination rows.
- Created a working local HTML/CSS structural reference.
- Adopted alphabetical chronological suffixes for design artifacts.

### Patient panel

- Extracted and reconstructed an empty 604 × 1680 corridor background.
- Removed patient, chair, plaque, quote, vitals, and presentation UI from the
  background.
- Created transparent reusable overlay art for:
  - patient-name plaque;
  - quote bubble;
  - vitals panel;
  - presentation clipboard.
- Removed only runtime values from the vitals art.
- Documented positions, percentages, HTML structure, CSS, and z-index order.

### Waiting-room cells

- Determined production cell dimensions: 238 × 336 raster / about 79.33 × 112
  CSS.
- Tested patient composites with a child and adult patient.
- Compared deeper floor variants.
- Approved 22% floor depth.
- Created 16 coordinated waiting-room backgrounds.
- Created decorative and humorous fictional hospital posters.
- Established random-assignment behavior.
- Documented cell geometry and patient positioning.

### File hygiene

- Intermediate generated files were not left as production assets.
- Final selected assets were copied into the project.
- Temporary overlay-extraction material was removed.
- Temporary composite test images may remain under `triageRush/tmp`; these are
  not production assets and may be removed later.

---

## 13. Important specifications and documents

### Governing design documents

1. [2026 0724 codex triageRush design notes.md](2026%200724%20codex%20triageRush%20design%20notes.md)  
   Earlier consolidated UI, clipboard, patient-text, and clinical-audit context.

2. [2026 0724 codex mobile-viewport-contract.md](2026%200724%20codex%20mobile-viewport-contract.md)  
   Authoritative 360 × 640 mobile-browser contract and test matrix.

3. **This file:** `2026 0724 Session summary and thoughts.md`  
   Current-session restart guide and project map.

### Layout specifications

4. [e 22/56/22 ratio specification](REFINING%20IMAGES/2026%200724e%20triageRush%20symmetric%20layout%20w%20correct%20ratios.txt)  
   Canvas, CSS pixels, raster pixels, and column ratios.

5. [g full layout specification](REFINING%20IMAGES/2026%200724g%20%26%26%26%20triageRush%20symmetric%20layout%20doors%20match%20waiting%20panels.txt)  
   Header/play/footer, column grid, shared five-row grid, and implementation
   contract.

6. [g HTML prototype](REFINING%20IMAGES/mockups/2026%200724g%20triageRush%20symmetric%20layout%20doors%20match%20waiting%20panels.html)

7. [g CSS prototype](REFINING%20IMAGES/mockups/2026%200724g%20triageRush%20symmetric%20layout%20doors%20match%20waiting%20panels.css)

### Patient-panel specifications

8. [h patient-panel background specification](REFINING%20IMAGES/2026%200724h%20%26%20triageRush%20patient%20panel%20background.txt)

9. [m patient-panel overlays specification](REFINING%20IMAGES/2026%200724m%20triageRush%20patient%20panel%20overlay%20asset%20specs.txt)

### Waiting-room specifications

10. [p–ze waiting-room background specification](REFINING%20IMAGES/2026%200724p-ze%20triageRush%20waiting%20room%20background%20asset%20specs.txt)  
    Complete list of all 16 assets, dimensions, CSS, floor depth, patient
    placement, random-assignment behavior, and poster notes.

### Earlier references

11. [2026 0722 codex thoughts on design.md](2026%200722%20codex%20thoughts%20on%20design.md)

12. [2026 0719 room Levels ESI 1-5, etc.txt](2026%200719%20room%20Levels%20ESI%201-5,%20etc.txt)

---

## 14. Known limitations and cautions

1. **Generated mockups are not geometry authorities.**  
   CSS must enforce ratios, row heights, and overlay positions.

2. **The `g` raster has uneven side rows.**  
   Production uses five equal 112-CSS-pixel rows.

3. **Door interiors are not yet normalized.**  
   Cells/buttons are equal, but illustrated doors vary internally. Final door
   assets remain future work.

4. **The patient-panel background is reconstructed.**  
   Hidden corridor areas were generated, not recovered.

5. **Overlay positions are starting points.**  
   Typography and text bounds require browser visual testing.

6. **Waiting-room background posters are tiny in gameplay.**  
   Their wording may be readable only as flavor, especially on small phones.
   Do not depend on poster text for gameplay.

7. **Psych poster requires review.**  
   The `zb` asset is optional and may be excluded to avoid stigmatizing
   behavioral-health patients.

8. **Fictional Medicare Advantage poster is not official.**  
   `Harborlight Advantage` is invented and must remain clearly fictional.

9. **Do not imitate licensed children’s characters.**  
   Use original recurring triageRush mascots instead.

10. **Old paths in earlier notes may be stale.**  
    The project was rebuilt at `D:\Dev\Projects\triageRush`.

11. **Root GitHub Pages entry is empty.**  
    No playable build exists yet in the new project.

12. **The HTML/CSS mockup is a reference, not the game scaffold.**

---

## 15. Recommended next steps

### Immediate design/implementation sequence

1. Move approved production-candidate UI assets from the design area into a
   clearly named `triageRush-app/assets/ui/` structure while retaining design
   masters in `docs/DESIGN/REFINING IMAGES`.
2. Build the real fixed 360 × 640 game shell.
3. Implement the 22/56/22 grid.
4. Implement the shared five-row side grid.
5. Load the 604 × 1680 patient background and the four patient overlays.
6. Add real HTML text layers for:
   - patient name;
   - quoteShort;
   - six vital values;
   - presentationShort.
7. Add the transparent patient layer and validate its crop/placement across
   multiple patient images.
8. Add random waiting-room backgrounds, storing the assigned background ID.
9. Build semantic five-cell room buttons.
10. Implement the expanded clipboard overlay and modal input blocking.
11. Apply grayscale only to inactive surrounding regions.
12. Test the required mobile viewport matrix.
13. Establish actual rendered text limits.
14. Only then migrate all patient JSON to short/long quote fields.

### Additional visual work

- Create production door assets with equal internal sizes.
- Decide whether waiting-room number badges are separate HTML overlays.
- Create original pediatric triageRush mascot backgrounds.
- Review poster legibility and decide which humorous posters ship.
- Test multiple patients against all waiting-room backgrounds for collisions.
- Consider whether the corridor background needs a flatter/less distracting
  lower region behind quote/vitals/presentation overlays.

### Data and clinical work

- Verify which prior audit changes survived migration.
- Re-run disposition audit against the retained 160 JSON files if uncertain.
- Keep diagnoses out of player-visible presentation text unless obvious from
  rapid examination.
- Ensure alternate-room acceptance remains generous upward in acuity.

---

## 16. Fast restart checklist

At the beginning of the next session:

1. Read this document completely.
2. Read the [mobile viewport contract](2026%200724%20codex%20mobile-viewport-contract.md).
3. Inspect the [g layout image](REFINING%20IMAGES/2026%200724g%20%26%26%26%20triageRush%20symmetric%20layout%20doors%20match%20waiting%20panels.png).
4. Read the [g layout spec](REFINING%20IMAGES/2026%200724g%20%26%26%26%20triageRush%20symmetric%20layout%20doors%20match%20waiting%20panels.txt).
5. Read the [m overlay spec](REFINING%20IMAGES/2026%200724m%20triageRush%20patient%20panel%20overlay%20asset%20specs.txt).
6. Read the [p–ze waiting-room spec](REFINING%20IMAGES/2026%200724p-ze%20triageRush%20waiting%20room%20background%20asset%20specs.txt).
7. Confirm the user’s next priority before undertaking another large design or
   implementation pass.

The strongest current design decisions are:

- fixed 360 × 640 canvas;
- 9:16 letterboxed mobile game;
- 22/56/22 columns;
- five shared equal side rows;
- layered patient-panel artwork and HTML text;
- one expanded clipboard;
- 22% waiting-room floor depth;
- original recurring hospital mascots rather than licensed characters.
