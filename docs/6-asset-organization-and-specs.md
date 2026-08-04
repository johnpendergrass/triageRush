# Asset Organization and Specifications

**Last modified:** 2026-08-04

**Latest change:** Made the corrected 14-door set the accepted baseline, verified
byte-for-byte parity between production and the mobile test app, and removed
superseded asset references from the current specification.

## Ownership

- `triageRush/assets/` owns production game and HOME artwork.
- `patient-data/patient-images/` owns production patient portraits.
- `_testAppMobile/assets/` is an intentional self-contained test mirror.
- Runtime code never loads artwork from `docs/` or `docs/archive/`.
- Only assets named in this document or the current runtime manifest are part of
  the forward specification.

## Production tree

```text
triageRush/assets/
|-- game-page/
|   |-- patient-panel/
|   |-- triage-rooms-panel/
|   `-- waiting-room-panel/
|-- lobby-page/
|-- audio/
|-- icons/
|-- patient-chart-popup/
`-- review-page/
```

Empty component directories are reserved ownership locations, not permission to
invent unnecessary image variants.

## Runtime manifest contract

Centralize every path in one manifest with these domains:

```text
patientData
waitingRooms
patientPanel
roomsPanel
lobby
audio
icons
review
```

Code consumes named manifest entries. Do not construct room filenames throughout
event handlers or CSS. Manifest validation runs before Start Shift becomes
available and reports the missing logical key and path.

## Game-page assets

### Waiting room

`game-page/waiting-room-panel/` contains:

```text
background-1.png through background-16.png
```

Each image is 1777 x 2509. A background is assigned when a patient enters the
queue and travels with that patient through compaction or swapping. Avoid a
visible duplicate while an unused alternative exists.

Empty RUSH slots may use deterministic backgrounds from the same set. Empty
slot decoration is not attached to a patient until insertion.

### Patient panel

`game-page/patient-panel/` contains:

```text
patient-panel-background-hires.png
patient-panel-name-bubble-hires.png
patient-panel-quote-bubble-hires.png
patient-panel-vitals-bubble-hires.png
patient-panel-clipboard-bubble-hires.png
```

These layers define the visual system for the center panel and detailed-chart
motif. Patient portraits remain in `patient-data/patient-images/`.

Portrait rendering must honor schema image orientation and scale metadata,
remain bottom-aligned, and not be forced to the background's magnification.

### Triage rooms

`game-page/triage-rooms-panel/` contains:

- `background-wall-for-all-rooms.png`;
- seven `background-*-room.png` interiors; and
- fourteen accepted `door-*-open.png` / `door-*-closed.png` images.

Room keys are:

```text
esi-1, esi-2, esi-3, esi-4, esi-5, psych, discharge
```

#### Accepted door baseline

As verified on 2026-08-04:

- Production contains exactly 14 `door-*.png` files.
- `_testAppMobile/assets/game-page/triage-rooms-panel/` contains the same 14.
- Every matching production/test file has the same SHA-256 hash.
- ESI 1-5 and Psych open/closed files are 1152 x 1792 RGBA.
- Discharge open/closed files are 1777 x 1792 RGBA.
- Sign backgrounds and lettering are accepted and readable.
- Open-door and outer-frame transparency is intentional and required.

These are the only current door assets. Do not restore, document, or load an
older door set.

#### Door regression rules

Any later door edit must:

- preserve the exact filename, dimensions, geometry, and placement;
- preserve alpha exactly unless John explicitly approves a transparency change;
- preserve unrelated pixels when the change is sign/lettering-only;
- keep ESI, Psych, and Discharge wording readable in all seven rows at the
  smallest supported shell;
- keep dark lettering on the accepted lighter sign backgrounds where used;
- verify both open and closed state;
- copy the approved result to both active asset trees;
- prove pairwise hashes match; and
- refresh the asset cache key only after visual approval.

The implementation displays the door art at approximately 61% of its room-cell
width and 91% of its height, centered horizontally and bottom-aligned. Acceptance
must be judged in that rendered context, not only at native resolution.

## HOME assets

### Lobby composition

`lobby-page/` contains the permanent lobby background and registered shift
overlays:

```text
background-w-open-glass-doors.png       852 x 1515
glass-door-overlay-start-shift.png      514 x 232
glass-door-overlay-resume-shift.png     473 x 267
```

Place either shift overlay at source coordinate X 319, Y 447 on the 852 x 1515
canvas. Scale the completed HOME composition uniformly. Do not nudge or scale an
overlay independently after registration.

### Settings and About

```text
settings-blackboard.png    941 x 1672
about-whiteboard.png       941 x 1672
```

The blackboard supports Player and Shift Settings; application text and controls
distinguish them. Center a board in the HOME frame at 93.75% of frame height
while preserving aspect ratio. Use a close target of at least 44 CSS pixels near
the board's established top-right close position.

### Boombox

`boombox.png` is a 2298 x 1415 transparent PNG.

Placement on the 852 x 1515 HOME source canvas:

```text
anchor: top-left
X: 357
Y: 1256
reference displayed width: 480 source pixels
```

Interactive centers relative to the asset:

| Control | X | Y | Active color |
|---|---:|---:|---|
| Power | 18.0% | 16.4% | Red |
| Music | 46.9% | 21.3% | Green |
| UI | 77.3% | 28.7% | Green |

Targets are at least 44 x 44 CSS pixels. Speakers, cassette, lower controls, and
the 98.1 FM display are decorative.

The optional music endpoint is:

```text
https://classicalking.streamguys1.com/KING-FM-128KAAC
```

Never autoplay. A stream error must clear false active state and leave gameplay
usable.

## Responsive artwork rules

- Compose every view inside the one 9:16 shell.
- Preserve source-coordinate registration for HOME layers.
- Scale complete components rather than generating ad hoc bitmap sizes.
- Preserve transparency, stacking order, and pointer behavior.
- Backgrounds may crop only where the UI specification permits.
- Keep portraits prominent and bottom-aligned.
- Do not stretch portraits to match background scaling.
- Provide useful text alternatives or semantic labels where an asset conveys
  function.
- Verify at the smallest supported phone layout and height-limited desktop layout.

## Naming rules

- Group assets by the component that owns them.
- Use descriptive lowercase hyphenated names.
- Include role and state: `background`, `overlay`, `door`, `open`,
  `closed`, `start-shift`, or `resume-shift`.
- Preserve current accepted names even when they contain `hires`.
- Do not add dimensions to new names unless variants are intentionally supported.
- Do not create an unowned catch-all folder.

## Test-app mirroring

The mobile test app remains independently runnable and may mirror the production
game-page hierarchy. A mirror is valid only when:

- filenames and logical manifest keys match production;
- all expected files exist;
- the content hash matches the approved production asset;
- cache keys identify the current approved revision; and
- production code never imports from the mirror.

Patient-data mirroring follows document `5`; it is not asset ownership.

## Asset acceptance checklist

- Every manifest path returns successfully through the preview server.
- All 16 waiting backgrounds render.
- All 14 accepted doors render in open and closed states with readable signs.
- Pairwise production/test door hashes match.
- Door dimensions and alpha pass automated comparison.
- Patient panel layers align without clipping or text obstruction.
- HOME Start, Resume, and active states register to the lobby background.
- The boombox artwork and hit targets align.
- All assets survive shell scaling, safe areas, and reduced motion settings.
- No current runtime path names a discarded or historical asset.
