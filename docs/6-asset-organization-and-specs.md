# Asset Organization and Specifications

**Last modified:** 2026-08-02

**Changes from the previous version:** Replaced the proposed asset TODO and old
screen-specific paths with the adopted production tree, current filenames, and
placement contracts.

## Ownership

- `triageRush/assets/` owns production game and lobby artwork.
- `patient-data/patient-images/` owns final patient portraits.
- Demo asset copies are temporary and do not become production ownership.
- Historical iterations and rejected concepts remain under `docs/archive/`.
- Runtime code must never load artwork from documentation folders.

## Current production tree

```text
triageRush/assets/
|-- game-page/
|   |-- patient-panel/
|   |-- triage-rooms-panel/
|   `-- waiting-room-panel/
|-- lobby-page/
|   `-- archived/
|-- audio/
|-- icons/
|-- patient-chart-popup/
`-- review-page/
```

`audio/`, `icons/`, `patient-chart-popup/`, and `review-page/` are currently
placeholders. Add files only when the production application has a real need.

## Game-page inventory

### Waiting room

`game-page/waiting-room-panel/` contains 16 backgrounds:

```text
background-1.png through background-16.png
```

Each is `1777 x 2509`. Queue backgrounds travel with patients while they remain
queued. Avoid visible duplication while unused alternatives remain.

### Patient panel

`game-page/patient-panel/` contains:

```text
patient-panel-background-hires.png
patient-panel-name-bubble-hires.png
patient-panel-quote-bubble-hires.png
patient-panel-vitals-bubble-hires.png
patient-panel-clipboard-bubble-hires.png
```

The clipboard's removal of the small three-dot decoration is cosmetic only and
does not change its use or placement.

### Triage rooms

`game-page/triage-rooms-panel/` contains:

- shared `background-wall-for-all-rooms.png`;
- seven `background-*-room.png` interiors;
- seven `door-*-closed.png` images; and
- seven `door-*-open.png` images.

Room keys are `esi-1` through `esi-5`, `psych`, and `discharge`. Centralize
these paths in the production asset manifest rather than constructing ambiguous
filenames throughout the UI.

## Lobby-page inventory

### Permanent background and shift overlays

```text
background-w-open-glass-doors.png       852 x 1515
glass-door-overlay-start-shift.png      514 x 232
glass-door-overlay-resume-shift.png     473 x 267
```

The permanent background represents an active shift with the lobby visible.
For Start Shift or Resume Shift, place the corresponding rectangular overlay at
source coordinate `X 319, Y 447`.

The overlays are registered RGB patches. Position them in source coordinates,
then scale the complete HOME composition uniformly. Do not independently nudge
or rescale an overlay after fitting the composition.

Full-background Start and Resume references remain under
`lobby-page/archived/` and are not runtime backgrounds.

### Settings and About

```text
settings-blackboard.png    941 x 1672
about-whiteboard.png       941 x 1672
```

The same blackboard supports Player Settings and Shift Settings; application
text and controls distinguish the two uses.

Center popups in the HOME frame at 93.75% of frame height, preserving aspect
ratio. The prototype close box is `36 x 36` CSS pixels at `top: 8.5%` and
`right: 10.5%` relative to the popup asset container.

### Boombox

`boombox.png` is a `2298 x 1415` transparent PNG.

Placement on the `852 x 1515` HOME source canvas:

```text
anchor: top-left
X: 357
Y: 1256
reference displayed width: 480 source pixels
```

Interactive control centers relative to the asset are:

| Control | X | Y | Active color |
|---|---:|---:|---|
| Power | 18.0% | 16.4% | Red |
| Music | 46.9% | 21.3% | Green |
| UI | 77.3% | 28.7% | Green |

Use at least `44 x 44` CSS-pixel targets. Lower controls, speakers, cassette,
and the `98.1 FM` display are decorative.

The music endpoint is:

```text
https://classicalking.streamguys1.com/KING-FM-128KAAC
```

Never autoplay. Handle stream failure without crashing or leaving a false
powered-on state.

## Responsive artwork rules

- Preserve source-coordinate registration for composed lobby layers.
- Backgrounds may crop or reveal more area when the screen contract permits.
- Do not force patient portraits to match background magnification.
- Keep patient artwork prominent and normally bottom-aligned.
- Preserve transparency, stacking order, and pointer behavior.
- Use production dimensions as references; let CSS scale the complete component
  rather than producing ad hoc bitmap variants.
- Verify accepted compositions on physical mobile devices.

## Naming rules

- Group by real screen or component ownership.
- Use descriptive lowercase hyphenated filenames.
- Use `background`, `overlay`, `popup`, `door`, or another accurate role.
- Include state such as `open`, `closed`, `start-shift`, or `resume-shift`.
- Avoid `hires` in new canonical names unless retained for compatibility with an
  already accepted asset.
- Do not embed dimensions unless they distinguish intentionally supported
  variants.
- Do not create an `other` folder.

## Demo synchronization

- `_testAppHomeScreen/` directly references production lobby assets and must be
  updated to `../triageRush/assets/lobby-page/`.
- `_testAppMobile/` serves itself as the web root and must remain independently
  runnable. Mirror the `game-page/` hierarchy and filenames inside its private
  `assets/` folder.
- Preserve intentional future-facing manifest entries for patient overlays and
  room interiors even if the current demo does not render them.
- Remove superseded demo copies only after every new URL and visual state is
  verified.
- Leave `_testAppMobile/assets-legacy/` untouched unless its removal is approved
  separately.

## Asset verification

- Confirm every manifest path exists and loads through the relevant preview
  server.
- Exercise all 16 waiting backgrounds and all 14 door states.
- Compare the patient panel, room rail, and HOME registration at mobile and
  desktop sizes.
- Check transparency, cropping, z-index, and hit targets.
- Check Start Shift, Resume Shift, and active open-lobby states.
- Keep metadata text files beside the assets they describe.
