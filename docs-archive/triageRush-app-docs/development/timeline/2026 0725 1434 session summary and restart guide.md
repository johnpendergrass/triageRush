> **Historical session snapshot — not authoritative.** Start with the current
> [Single Source of Truth](../singleSourceOfTruth/README.md).

# triageRush — Session Summary and Restart Guide

**Session timestamp:** 2026-07-25 14:34 (America/Los_Angeles)  
**Repository:** `D:\Dev\Projects\triageRush`  
**Purpose:** Durable handoff for the user, Codex, or another AI before design or
implementation resumes.

This document supersedes the July 24 session summary where the two conflict.
The older documents remain useful for design history, but the rules, patient
counts, and artwork selection recorded here reflect the repository as verified
on July 25.

## Table of contents

1. [Current project state](#1-current-project-state)
2. [Product and gameplay intent](#2-product-and-gameplay-intent)
3. [Repository map and important files](#3-repository-map-and-important-files)
4. [Authoritative viewport and layout dimensions](#4-authoritative-viewport-and-layout-dimensions)
5. [Patient-panel and waiting-room asset dimensions](#5-patient-panel-and-waiting-room-asset-dimensions)
6. [Selected artwork](#6-selected-artwork)
7. [Current patient JSON design](#7-current-patient-json-design)
8. [ESI-to-room rules](#8-esi-to-room-rules)
9. [Psych and Discharge exceptions](#9-psych-and-discharge-exceptions)
10. [Verified patient-data distribution](#10-verified-patient-data-distribution)
11. [Scoring and validation contract](#11-scoring-and-validation-contract)
12. [Door-art state contract](#12-door-art-state-contract)
13. [Expanded patient information](#13-expanded-patient-information)
14. [Known gaps and cautions](#14-known-gaps-and-cautions)
15. [Recommended next work](#15-recommended-next-work)
16. [Fast restart checklist](#16-fast-restart-checklist)

---

## 1. Current project state

triageRush is still in design/data preparation. The visual direction and the
patient-room mapping have become substantially clearer, but the playable game
has not yet been implemented in this rebuilt repository.

Verified implementation state:

- Root `index.html`: empty.
- Root `README.md`: empty.
- `triageRush-app/docs/game-design.md`: empty.
- `triageRush-app/docs/player-help.md`: empty.
- `triageRush-app` otherwise contains no game code or copied production assets.
- `patientsBrowser-app` contains no files.
- A structural HTML/CSS layout prototype exists under the design mockups
  folder, but it is not production game code.
- `patientsCRUD-app/patient-data` contains 160 patient JSON files, 160 patient
  PNG files, and 15 anchor images.
- All 160 patient JSON files parse and conform to the room-routing rules in this
  document.

Artwork work is paused for now. The current artwork that should be referenced
and used is in:

`docs/design/REFINING IMAGES/SELECTED ARTWORK/`

That folder is authoritative **for now**, but the user may change the selection
later. Older images outside that folder are working history and should not be
chosen over the selected versions without asking.

---

## 2. Product and gameplay intent

triageRush is a fast portrait browser game about emergency-department triage.
The player sees a deliberately limited but fair patient presentation and sends
the patient through one of five destination doors:

1. RESUS
2. ACUTE
3. FAST TRACK
4. PSYCH / BEHAVIORAL HEALTH
5. DISCHARGE

The visible decision evidence is intended to include:

- Patient image.
- Name and basic demographics.
- Patient quote.
- Short presentation.
- Six vital values: HR, BP, RR, SpO₂, temperature, and pain.

The game should remain medically relevant while avoiding frustrating
hair-splitting. The exact ESI value is more specific than the door assignment:
several ESI levels can map to one physical room. Reasonable movement to the
next-higher acuity class is accepted only where the rules below explicitly
encode it.

The game must not decide special cases dynamically. Clinical judgments such as
“this ESI 5 needs only a conversation and can be discharged” are made during
patient authoring and stored in that patient's JSON.

---

## 3. Repository map and important files

### Top-level structure

```text
triageRush/
├── index.html                              # empty
├── README.md                               # empty
├── docs/
│   └── design/
│       ├── design notes and session summaries
│       └── REFINING IMAGES/
│           ├── SELECTED ARTWORK/           # current art authority
│           └── mockups/                    # structural HTML/CSS prototype
├── triageRush-app/
│   └── docs/                               # empty game-design/player-help docs
├── patientsCRUD-app/
│   ├── patient-data/
│   │   ├── anchorImages/                   # 15 PNGs
│   │   ├── docs/
│   │   │   └── patient-schema.json         # stale illustrative example
│   │   ├── patient-images/                 # 160 PNGs
│   │   └── patient-json/                   # 160 authoritative JSON files
│   └── tools/
│       ├── evaluating/
│       └── validation/
└── patientsBrowser-app/                    # empty
```

### Governing design documents

| Purpose | File |
|---|---|
| Current handoff | `docs/design/2026 0725 1434 session summary and thoughts.md` |
| Previous handoff and design history | `docs/design/2026 0724 Session summary and thoughts.md` |
| Mobile viewport contract | `docs/design/2026 0724 codex mobile-viewport-contract.md` |
| Consolidated earlier design notes | `docs/design/2026 0724 codex triageRush design notes.md` |
| Earlier design discussion | `docs/design/2026 0722 codex thoughts on design.md` |
| Obsolete historical room mapping | `docs/design/2026 0719 room Levels ESI 1-5, etc.txt` |

The July 19 room document is historical and must **not** override the rules in
this summary or the current patient JSON.

### Layout and visual specifications

| Purpose | File or folder |
|---|---|
| Current artwork authority | `docs/design/REFINING IMAGES/SELECTED ARTWORK/` |
| Full layout spec | `docs/design/REFINING IMAGES/2026 0724g &&& triageRush symmetric layout doors match waiting panels.txt` |
| Layout HTML prototype | `docs/design/REFINING IMAGES/mockups/2026 0724g triageRush symmetric layout doors match waiting panels.html` |
| Layout CSS prototype | `docs/design/REFINING IMAGES/mockups/2026 0724g triageRush symmetric layout doors match waiting panels.css` |
| Patient-panel background spec | `docs/design/REFINING IMAGES/2026 0724h & triageRush patient panel background.txt` |
| Patient overlay spec | `docs/design/REFINING IMAGES/2026 0724m triageRush patient panel overlay asset specs.txt` |
| Waiting-room background spec | `docs/design/REFINING IMAGES/2026 0724p-ze triageRush waiting room background asset specs.txt` |

The selected-artwork folder contains renamed copies of the most important specs
alongside the selected images. Use the specs for geometry and the selected PNGs
for current art.

### Patient data

| Purpose | Path |
|---|---|
| Authoritative patient records | `patientsCRUD-app/patient-data/patient-json/` |
| Patient images | `patientsCRUD-app/patient-data/patient-images/` |
| Style/anchor images | `patientsCRUD-app/patient-data/anchorImages/` |
| Illustrative schema/example | `patientsCRUD-app/patient-data/docs/patient-schema.json` |
| Existing validator area | `patientsCRUD-app/tools/validation/` |
| Existing evaluator area | `patientsCRUD-app/tools/evaluating/` |

Important: `patient-schema.json` is currently an old example record, not a
formal JSON Schema and not the current source of truth. It does not yet show
`esi2roomsNotes`, and its sample alternate-room answer is stale. The 160 files
in `patient-json/` are current.

---

## 4. Authoritative viewport and layout dimensions

The game is a fixed portrait mobile-browser experience designed for the visible
browser area while browser controls remain present.

### Canvas

- Logical game canvas: **360 × 640 CSS pixels**
- High-resolution design canvas: **1080 × 1920 raster pixels**
- Raster scale: **3×**
- Aspect ratio: **9:16**
- No internal scrolling.
- No responsive reflow inside the game canvas.
- Scale the complete canvas uniformly to fit `100vw × 100svh`.
- Letterbox unused space.
- Do not use retracting browser chrome to reveal or rearrange content.

The governing viewport details and test matrix are in:

`docs/design/2026 0724 codex mobile-viewport-contract.md`

Required viewport tests:

- 360 × 640
- 375 × 667
- 390 × 700
- 393 × 720
- 402 × 780
- 412 × 732
- 430 × 800

### Vertical layout

| Region | CSS pixels | Raster pixels | Percentage |
|---|---:|---:|---:|
| Header | 40 | 120 | 6.25% |
| Play area | 560 | 1680 | 87.5% |
| Footer | 40 | 120 | 6.25% |

### Play-area columns

```css
grid-template-columns: 22% 56% 22%;
```

| Column | Percentage | CSS width | Raster target |
|---|---:|---:|---:|
| Waiting room | 22% | 79.2 px | 237.6 px |
| Active patient | 56% | 201.6 px | 604.8 px |
| Room doors | 22% | 79.2 px | 237.6 px |

Practical 1080-pixel rounding is **238 / 604 / 238**.

### Shared five-row side grid

The waiting-room rail and door rail share the same five equal rows:

```css
grid-template-rows: repeat(5, minmax(0, 1fr));
```

- Each logical row: **112 CSS pixels**
- Each raster row: **336 raster pixels**
- Each waiting patient aligns vertically with one room door.
- The entire waiting cell and entire room cell are touch targets.
- Generated full-screen mockups have imperfect row heights; production CSS,
  not the raster mockup, is the geometry authority.

---

## 5. Patient-panel and waiting-room asset dimensions

### Patient panel

Selected background:

`2026 0724h & triageRush patient panel background.png`

- Size: **604 × 1680 raster pixels**
- Approximate CSS size at 3×: **201.33 × 560**

Selected overlay assets:

| Asset | Raster size | Approximate CSS size |
|---|---:|---:|
| Patient name plaque | 245 × 61 | 81.67 × 20.33 |
| Quote bubble | 509 × 151 | 169.67 × 50.33 |
| Vitals panel | 540 × 234 | 180 × 78 |
| Presentation clipboard | 539 × 250 | 179.67 × 83.33 |

Recommended layer order:

```text
0   patient-panel corridor background
10  transparent current-patient image
20  plaque, quote, vitals, and presentation art
30  runtime text and semantic HTML controls
```

Runtime patient text and vital values must remain HTML, not baked into images.
The positioning percentages and sample markup are in the patient overlay spec.

### Waiting-room cells

All 16 selected waiting-room backgrounds are:

- **238 × 336 raster pixels**
- Approximately **79.33 × 112 CSS pixels**
- Aspect ratio **17:24**

The approved wall/floor split is:

- Wall: 262 raster pixels / 77.98%
- Floor: 74 raster pixels / 22.02%
- Wall/floor junction: raster `y = 262`

Tested patient placement:

- Raster: `left 0`, `top 98`, `width 238`, `height 238`
- CSS: `left 0`, `top 32.67`, `width 79.33`, `height 79.33`

Assign one background when a patient enters a waiting slot and retain that
background while the patient remains there. Do not randomize on every render.

---

## 6. Selected artwork

The current authority is:

`docs/design/REFINING IMAGES/SELECTED ARTWORK/`

There are **35 files** in the folder:

- 1 full-layout example PNG.
- 3 companion specification TXT files.
- 1 patient-panel background PNG.
- 4 patient-panel overlay PNGs.
- 16 waiting-room background PNGs.
- 10 door PNGs: one closed and one open state for each destination.

### Selected door pairs

| Door | Closed state | Open state |
|---|---|---|
| RESUS — ESI 1 | `2026 0725s ... RESUS closed handle left light off.png` | `2026 0725d ... RESUS door inward open monitor disconnected.png` |
| ACUTE — ESI 2–3 | `2026 0725t ... ACUTE closed handle left light off.png` | `2026 0725f ... ACUTE door inward open treatment room.png` |
| FAST TRACK — ESI 4–5 | `2026 0725u ... FAST TRACK closed handle left light off.png` | `2026 0725j ... FAST TRACK door inward open simple exam room.png` |
| PSYCH | `2026 0725v ... PSYCH ... closed handle left light off.png` | `2026 0725r ... PSYCH ... door inward open office light on.png` |
| DISCHARGE | `2026 0725w ... DISCHARGE closed doors hospital accessibility sign right.png` | `2026 0725x ... DISCHARGE open doors hospital accessibility sign right.png` |

The single-door images are approximately **1055 × 1491** pixels. Two selected
images are **1054 × 1492**. They are close to the target 17:24 ratio but have
not been normalized to one identical pixel size. Production should either
normalize them later or place them through a consistent crop/`object-fit`
contract inside the 238 × 336 room cell.

Do not use earlier closed versions with a middle seam, centered handle, or
illuminated closed-state light. Do not use the earlier Discharge versions with
the oversized red EMERGENCY sign.

---

## 7. Current patient JSON design

The authoritative files are:

`patientsCRUD-app/patient-data/patient-json/patient-001.json` through
`patient-160.json`.

### Current implemented shape

```text
id
number
easterEgg
difficulty
johnsComments

patient
├── _comment
├── personal
│   ├── name
│   ├── age
│   ├── sex
│   └── race
├── image
│   ├── imageFilename
│   └── imageFlipped
├── clinical
│   ├── chiefComplaint
│   ├── quote
│   ├── presentationShort
│   └── presentationLong
├── vitals
│   ├── hr    { value, color }
│   ├── bp    { value, color }
│   ├── rr    { value, color }
│   ├── spo2  { value, color }
│   ├── temp  { value, color }
│   └── pain  { value, color }
└── diagnosis
    ├── primary
    ├── esi
    ├── esi2roomsNotes
    ├── disposition
    ├── why
    └── redFlag

answer
├── _comment
├── correctRoom
└── otherAcceptableRooms

aiImageGeneration
├── _comment
├── who
├── pose
├── expression
├── signs
├── lookSeverity
├── anchor_image
├── size
├── outputFolder
├── outputFile
└── prompt
```

### New field: `esi2roomsNotes`

Location:

```json
"patient": {
  "diagnosis": {
    "primary": "...",
    "esi": 4,
    "esi2roomsNotes": null,
    "disposition": "..."
  }
}
```

Rules:

- Present in all 160 patient JSON files.
- Default value is `null`.
- Use a short sentence only when the room assignment needs an authoring-level
  explanation, especially a Psych or Discharge special case.
- It is not a substitute for `why`; it explains the ESI-to-room exception.
- It is review metadata and may be shown on a future patient-review card.
- It must not trigger runtime clinical inference.

Current non-null count: **29**

- 24 Discharge explanations.
- 5 Psych explanations.
- All 131 routine room mappings retain `null`.

### Important schema status

The current patient files still use one `clinical.quote` field. The previously
discussed `quoteShort` and `quoteLong` split has **not** been migrated.
`presentationShort` and `presentationLong` do exist.

The old `patient-schema.json` example must eventually be updated to:

- Add `esi2roomsNotes`.
- Show current alternate-room rules.
- Use boolean `imageFlipped`, as the current patient files do.
- Clearly identify itself as a schema/example or be replaced by a formal JSON
  Schema.

Do not bulk-change patient text fields until the real 360 × 640 coded layout
establishes rendered text limits.

---

## 8. ESI-to-room rules

ESI remains a **1–5 clinical acuity/resource label**. Room assignment is a
coarser gameplay grouping.

### Deterministic base mapping

| ESI | Correct room | Other acceptable room | Reason |
|---:|---|---|---|
| 1 | Resus | none | Immediate life-saving/resuscitation level. |
| 2 | Acute | Resus | One higher-acuity destination is accepted. |
| 3 | Acute | none | ESI 2 and 3 share Acute, so moving one ESI level higher does not produce another door. |
| 4 | Fast Track | Acute | One higher-acuity destination is accepted. |
| 5 | Fast Track | none | ESI 4 and 5 share Fast Track, so moving one ESI level higher does not produce another door. |

This is the central distinction:

```text
ESI 1       → RESUS
ESI 2–3     → ACUTE
ESI 4–5     → FAST TRACK
```

The acceptable-room policy is not “every room that is safer.” It is a narrow
gameplay tolerance for one higher ESI class. When the neighboring ESI class
maps to the same physical door, no additional alternate door is added.

Exact JSON room strings:

- `"Resus"`
- `"Acute"`
- `"Fast Track"`
- `"Psych"`
- `"Discharge"`

The artwork may use uppercase labels, but data and code comparisons should use
the exact title-case strings above.

---

## 9. Psych and Discharge exceptions

Psych and Discharge are gameplay destinations, not additional ESI values.
Every patient, including Psych and Discharge patients, must retain an ESI 1–5.

### Psych

Current rule:

- Psych can be the correct room only for medically stable, low-risk behavioral
  patients at ESI 4 or ESI 5.
- Fast Track is acceptable for those patients.
- ESI 1–3 behavioral presentations use the ordinary medical room mapping and
  are not sent to the Psych door.
- There are no current ESI 1, 2, or 3 Psych-correct patients.

Encoded patterns:

```text
ESI 4 + stable behavioral case → Psych correct; Fast Track acceptable
ESI 5 + stable behavioral case → Psych correct; Fast Track acceptable
```

Current Psych patients:

- ESI 4: `patient-015`, `patient-043`, `patient-098`
- ESI 5: `patient-105`, `patient-108`

Each has a non-null `esi2roomsNotes` sentence explaining the exception.

### Discharge

Current rule:

- Discharge can be correct only for an explicitly reviewed ESI 5 patient.
- The case requires no ED treatment-area resources beyond brief evaluation,
  counseling, reassurance, or similar conversation-level care.
- Fast Track is acceptable.
- The game never decides “possible discharge” on the fly.
- A general ESI 5 who still belongs in a treatment area remains Fast Track with
  no alternate.

Standard note used for the 24 current Discharge patients:

> ESI 5: no ED treatment-area resources are expected; brief evaluation,
> counseling, and discharge are appropriate.

Current Discharge patient IDs:

`013, 016, 022, 049, 051, 062, 091, 093, 094, 095, 096, 104, 114, 117, 118,
130, 131, 138, 139, 140, 141, 142, 143, 155`

---

## 10. Verified patient-data distribution

The 160 patient JSON files were parsed and checked against the rules above on
2026-07-25.

| ESI | Correct room | Alternate | Count |
|---:|---|---|---:|
| 1 | Resus | none | 12 |
| 2 | Acute | Resus | 41 |
| 3 | Acute | none | 34 |
| 4 | Fast Track | Acute | 33 |
| 4 | Psych | Fast Track | 3 |
| 5 | Fast Track | none | 11 |
| 5 | Psych | Fast Track | 2 |
| 5 | Discharge | Fast Track | 24 |
|  |  | **Total** | **160** |

Validation result:

- JSON parse errors: **0**
- Missing `esi2roomsNotes` fields: **0**
- ESI/room/alternate rule violations: **0**
- Non-null `esi2roomsNotes`: **29**

These are repository facts, not estimated counts from conversation.

---

## 11. Scoring and validation contract

At runtime, scoring should read the authored answer:

```json
"answer": {
  "correctRoom": "Acute",
  "otherAcceptableRooms": ["Resus"]
}
```

Recommended scoring categories:

- Selected `correctRoom`: fully correct.
- Selected a member of `otherAcceptableRooms`: accepted as a reasonable close
  call; exact score/message can be designed later.
- Selected any other room: incorrect.

Do not derive the answer from diagnosis prose during gameplay. The ESI mapping
is an authoring and validation rule; `answer.correctRoom` and
`answer.otherAcceptableRooms` are the direct scoring data.

A future validator should independently confirm:

1. ESI is an integer from 1 through 5.
2. `correctRoom` uses one of the five exact room strings.
3. `otherAcceptableRooms` is an array with no duplicate and does not include
   the correct room.
4. Routine ESI mappings follow the deterministic table.
5. Psych appears only for ESI 4–5 and has Fast Track as alternate.
6. Discharge appears only for ESI 5 and has Fast Track as alternate.
7. Psych and Discharge cases have a meaningful `esi2roomsNotes`.
8. Routine cases normally have `esi2roomsNotes: null`.

---

## 12. Door-art state contract

### RESUS, ACUTE, FAST TRACK, and PSYCH

Closed:

- Single seamless door slab; no vertical middle seam.
- Handle on the left/free edge, not near the center.
- Handle horizontal.
- “In use” indicator fixture remains present but is off/dark.

Open:

- Door opens inward approximately halfway.
- Hinge is on the right.
- Handle is depressed downward approximately 45 degrees.
- Door label remains on the physical slab and is perspective/foreshortening
  adjusted.
- “In use” indicator is illuminated.

Interior distinctions:

- RESUS: resuscitation treatment bay; disconnected/idle monitor shows flat
  traces and dashes rather than patient values.
- ACUTE: acute treatment room with different equipment from RESUS.
- FAST TRACK: simpler exam setting with chairs, exam table, rolling BP monitor,
  and physician rolling stool.
- PSYCH: normal calm office/behavioral-health furniture and equipment.

### DISCHARGE

- Large paired glass doors with surrounding glass.
- Exterior resembles a covered emergency-department drop-off on a crowded
  medical campus.
- No people.
- Partially visible ambulance at the left and two distant cars remain
  consistent between the closed and open images.
- Small secondary blue wayfinding sign contains a hospital `H`, wheelchair
  accessibility icon, and arrow pointing right.
- Do not restore the oversized red EMERGENCY sign.
- Open state has both doors pushing outward, one roughly 75% open and the other
  roughly 50% open.

The open images are feedback when the player clicks a door. The exact animation
or dwell time has not been designed.

---

## 13. Expanded patient information

The default patient card is intended to show:

- Patient image.
- Short quote/current `quote` content as adapted for the final layout.
- Six vital values.
- `presentationShort`.
- One shared `…` information control on the presentation clipboard.

The expanded state is one medical-clipboard overlay, not separate quote and
presentation dialogs. It should contain richer patient information and a large
`RETURN TO PATIENT ↩` control.

Behavioral contract:

- Patient image and waiting-room patients do not shift.
- Clipboard overlays the left waiting rail and part of the patient area.
- It may cover the normal quote.
- It must not cover vitals or `presentationShort`.
- Surrounding rails, header, footer, and doors become grayscale.
- Central patient panel remains in color.
- Only the return control is active while the clipboard is open.
- Timer behavior while reading remains unresolved.

Previous working authoring maxima were:

| Field concept | Working maximum |
|---|---:|
| Short quote | 20 words |
| Long quote | 40 words |
| `presentationShort` | 30 words |
| `presentationLong` | 60 words |

These are provisional. Rendered fit in the coded 360 × 640 game is
authoritative.

---

## 14. Known gaps and cautions

1. **No playable application exists yet.**  
   The rebuilt repository contains design/data assets but no game scaffold.

2. **`patient-schema.json` is stale.**  
   It lacks `esi2roomsNotes` and does not show current alternate-room behavior.

3. **Quote short/long migration is not implemented.**  
   Current JSON uses `clinical.quote`, `presentationShort`, and
   `presentationLong`.

4. **Selected artwork is provisional authority.**  
   Use it now, but the user may revise the selection later.

5. **Door source dimensions differ by one or two pixels.**  
   Normalize later or enforce consistent in-cell rendering.

6. **Generated mockups are not geometry authorities.**  
   CSS must enforce 360 × 640, 22/56/22, and five equal side rows.

7. **The patient-panel background includes reconstructed pixels.**  
   Areas hidden by the original patient/UI were generated to continue the
   corridor.

8. **Overlay positions still require browser visual testing.**

9. **Waiting-room poster 13 requires judgment.**  
   The Psych wordplay background is selected for possible use, but the prior
   notes flag it for review because humor should not stigmatize patients.

10. **Existing validator/evaluator reports are empty or not current evidence.**  
    The validation counts in this summary came from directly parsing all 160
    JSON files.

11. **Older room-mapping notes are obsolete.**  
    Do not restore the old Resus ESI 1–2 / Acute ESI 3 model.

12. **Avoid hidden runtime exceptions.**  
    All special routing decisions must be explicit in patient JSON.

---

## 15. Recommended next work

Suggested sequence when the user is ready:

1. Update or replace `patient-data/docs/patient-schema.json` so it documents the
   implemented `esi2roomsNotes` and current routing rules.
2. Add a reusable patient-data validator that enforces the rules in section 11.
3. Create the real fixed 360 × 640 game shell in `triageRush-app`.
4. Implement the 40/560/40 vertical layout and 22/56/22 play-area grid.
5. Implement one shared five-row contract for waiting patients and room
   buttons.
6. Copy or reference the current selected art into a deliberate production
   asset structure while retaining the design masters.
7. Layer the patient-panel background, patient image, four overlay images, and
   HTML text.
8. Implement stable random waiting-background assignment.
9. Implement semantic room buttons and closed-to-open click feedback.
10. Score directly from `correctRoom` and `otherAcceptableRooms`.
11. Implement the expanded clipboard and modal input blocking.
12. Test the required mobile viewport matrix.
13. Establish real rendered text limits before changing all patient quote
    fields.

Do not begin a broad patient-text migration or another artwork pass unless the
user chooses it as the next priority.

---

## 16. Fast restart checklist

Before resuming:

1. Read this document completely.
2. Read `2026 0724 codex mobile-viewport-contract.md`.
3. Inspect `REFINING IMAGES/SELECTED ARTWORK/`; treat it as the current visual
   authority.
4. Read the selected `g`, `h`, and `m` specification files.
5. Inspect representative patient JSON files:
   - routine ESI 4: `patient-001.json`
   - ESI 2 with Resus alternate: `patient-003.json`
   - ESI 4 Psych: `patient-015.json`
   - ESI 5 Psych: `patient-105.json`
   - ESI 5 Discharge: `patient-131.json`
6. Remember the definitive mapping:

```text
ESI 1   → Resus
ESI 2–3 → Acute
ESI 4–5 → Fast Track
```

7. Remember the special authored branches:

```text
stable low-risk ESI 4–5 behavioral case → Psych; Fast Track acceptable
reviewed no-treatment ESI 5 case        → Discharge; Fast Track acceptable
```

8. Confirm the user's next priority before starting a major implementation or
   content pass.

The strongest current decisions are:

- Fixed 360 × 640 / 9:16 mobile canvas.
- 22/56/22 columns and five equal side rows.
- Layered patient UI with HTML runtime text.
- Every patient has an ESI 1–5.
- Room routing is deterministic and pre-authored.
- `esi2roomsNotes` explains only exceptional room decisions.
- The `SELECTED ARTWORK` folder is the current art authority.
