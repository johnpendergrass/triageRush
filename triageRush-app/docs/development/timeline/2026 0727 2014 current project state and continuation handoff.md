# Current project state and continuation handoff

**Recorded:** 2026-07-27 20:14 PDT  
**Purpose:** Preserve the current architectural decisions, completed migrations,
patient-data work, artwork state, and next steps so work can resume without
reconstructing the discussion.

## Executive state

triageRush has moved away from the earlier game design and is now being built
as a seven-room Game/Edu application. The preserved `_testApp/` prototype
remains the visual and interaction reference, but it is not the production
application and should not be promoted into that role.

The production JavaScript and CSS have not yet been built. Current work has
focused on establishing the final repository structure, normalizing the patient
library, documenting scoring behavior, reviewing patient-facing text and
images, and preparing layered room-panel artwork.

## Approved repository ownership

- `index.html` is the GitHub Pages entry point for the published triageRush
  application.
- `triageRush-app/` owns the production Game/Edu application, its built-in
  read-only patient viewer, application-specific assets, tests, and docs.
- `patient-data/` is the authoritative shared patient library. It owns the
  published patient JSON, final patient images, patient index, and current
  schema documentation.
- `patient-CRUD-app (standalone)/` is reserved for a future local patient
  creation and CRUD pipeline. The parenthetical folder name is intentionally
  temporary. Its `anchor-images/` folder remains here because those anchors are
  part of the future image-generation workflow.
- `_testApp/` is a self-contained copy of the approved seven-room prototype and
  remains a temporary test platform.
- `docs-project/` owns project-wide planning, architecture, migration, status,
  and historical material.

There is no separate home app, shared app, or standalone patient-viewer app.
The public application is triageRush, and its patient viewer is read-only and
built into that application. The patient CRUD tool will be a separate local
pipeline developed later.

## Patient schema and data migration

The authoritative schema material now lives in `patient-data/schema/`:

- `patient-schema-template.json` is the representative patient template.
- `patient-schema-notes.md` is the specification and chronological schema
  version history.

The obsolete duplicate schema under `patient-CRUD-app (standalone)/schema/`
has been removed. Do not create a second authoritative copy.

Current patient schema version is **1.2**:

- Version 1.0 established the complete patient-record baseline.
- Version 1.1 removed obsolete `easterEgg` and `difficulty` fields and
  standardized `answer.correctRoom` as one of `esi-1` through `esi-5`,
  `psych`, or `discharge`.
- Version 1.2 made `answer.otherAcceptableRooms` a required but nullable
  reserved override. It is currently `null` for all patients because ordinary
  room alternatives are derived in application code.

All 160 patient JSON records were migrated to the current structure. Their
clinical facts, ESI assignments, and vital signs were not changed by the schema
migration.

## Scoring decision

The player will choose between **strict** and **forgiving** scoring:

- The patient's `answer.correctRoom` always receives full credit.
- In strict mode, ordinary ESI patients receive credit only for their assigned
  ESI room.
- In forgiving mode, the adjacent ESI room above or below the assigned level
  receives half credit when that adjacent room exists.
- Psych and discharge patients receive full credit for their special room or
  for their assigned ESI room.
- Forgiving mode also allows the ESI rooms immediately above and below a psych
  or discharge patient's assigned ESI level for half credit.
- These alternatives are calculated in code; they are not enumerated in
  patient JSON.

The authoritative behavior is documented in
`triageRush-app/docs/technical/2026 0727 1458 strict and forgiving scoring specification.md`,
with a player-oriented explanation in the corresponding guide.

## Patient text review

All 160 records were reviewed for patient-facing text that accidentally states
the diagnosis, urgency conclusion, or management answer before the player's
choice.

The 69 direct-conclusion cases were revised in two passes:

- First, the 40 highest-priority cases were rewritten.
- Then the remaining 29 direct-conclusion cases were rewritten using the same
  standard.

Quotes remain patient-centered descriptions of what happened and how the
patient feels. Presentations remain observations a triage nurse could
reasonably make. Established history and obvious nurse-level diagnostic
language may remain when natural—for example, a patient reporting that they
ran out of insulin. Unconfirmed acute diagnoses, answer-key interpretation,
and management instructions were removed from pre-choice text.

ESI values, vitals, diagnoses, routing, and answers were not changed during
this editorial work. The detailed review is in
`triageRush-app/docs/development/timeline/2026 0727 1628 patient text diagnosis-cue review.md`.

## Patient image review

The following patients have already been reviewed against their JSON
presentation and should be excluded from future random image-review samples
unless a deliberate re-review is requested:

`026`, `032`, `035`, `036`, `040`, `046`, `055`, `078`, `083`, and `100`.

Patients `032`, `035`, `036`, `046`, `078`, and `083` were strong matches.
Patient `040` was broadly compatible. Patients `026`, `055`, and `100` had
partial or significant mismatches and received new draft images:

- `patient-026-new.png` has finer, clinically plausible petechiae and retains
  the photophobic, visibly ill child.
- `patient-055-new.png` shows the injured arm away from the torso with a
  squared-off shoulder contour rather than an elbow/upper-arm pain pose.
- `patient-100-new.png` shows unilateral cheek erythema and swelling extending
  toward a mildly puffy lower eyelid.

The three drafts have true transparency and exactly match their respective
original dimensions. Their patient JSON `aiImageGeneration` sections contain
the new anchors, prompts, output paths, and dimensions. The active
`patient.image.imageFilename` values still point to the original images; the
`-new` images are review candidates and have not silently replaced them.

## Approved room-cell layering

Each open room cell will be rendered from back to front:

1. `cellBackground-wall.png`
2. The room-specific `inside-*.png`
3. A scaled patient image assigned to that room
4. A transparent open-door foreground image
5. UI elements such as the circular arrow, border, label, highlight, and
   scoring feedback

The room interior must therefore not be baked into the open-door image. The
open doorway is transparent so the interior and patient layers remain visible
behind the door leaf and frame.

## Layer-2 room backgrounds

Seven new opaque room backgrounds are in
`triageRush-app/assets/rooms-panel/doors/`:

- `inside-ESI-1.png`: equipment-rich resuscitation bay
- `inside-ESI-2.png`: monitored high-acuity treatment room
- `inside-ESI-3.png`: standard ED examination/treatment room
- `inside-ESI-4.png`: lower-acuity fast-track examination room
- `inside-ESI-5.png`: simple consultation room with physician workstation
- `inside-psych.png`: calm, safe, hospital-based psychiatric assessment room
- `inside-discharge.png`: exterior sidewalk/drop-off scene matching the
  existing discharge-door setting

ESI 1–5 and psych backgrounds are exactly `144 × 224`. The discharge
background is exactly `1055 × 1491`, matching
`DoorClosed-discharge-glass.png`. All backgrounds reserve useful central space
for the separate patient layer.

## ESI door signage and open-door prototypes

The approved signage system uses:

- A warm light-gray plaque immediately to the right of the window.
- Black `ESI` above a much larger black room number.
- A white/silver embossed room name centered above the window.
- Bold, condensed, slightly angular room-name lettering designed for
  readability at the actual `144 × 224` sprite size.

Current room names:

| ESI | Door color | Room name | Layout |
|---|---|---|---|
| 1 | Red | `RESUS` | Single line |
| 2 | Orange | `EMERGENT` | Single line |
| 3 | Amber | `URGENT` | Single line |
| 4 | Violet | `LESS` / `URGENT` | Two lines |
| 5 | Blue | `NON-` / `URGENT` | Two lines |

The approved ESI-5 closed candidate is
`doorClosed-ESI-5-blue-signs-prototype-v3.png`; earlier ESI-5 prototypes remain
only for visual comparison. ESI-1 through ESI-4 use corresponding
`doorClosed-...-signs-prototype.png` files.

All five signed open-door prototypes are also present. They:

- are exactly `144 × 224`;
- use right-side hinges and an outward swing of roughly 60 percent;
- retain the window-left/plaque-right door-face layout;
- foreshorten the room name, window, plaque, and kick plate with the door;
- use a slightly downward-tilted handle;
- have RGBA alpha transparency through and around the doorway; and
- have no remaining visible chroma-key pixels.

The older unsigned door files remain untouched. The signed files are still
named as prototypes so they can be reviewed before replacing or renaming the
production assets.

## Important continuation notes

- Do not repeat image sampling for the ten patients already listed as reviewed.
- Do not replace the three original patient images until the `-new` candidates
  are explicitly approved.
- Do not restore a second patient schema under the CRUD application.
- Treat `_testApp/` as a reference/test platform, not as the production app.
- Preserve the five-level ESI plus psych and discharge seven-room design.
- Keep open-door foregrounds transparent and free of room interiors.
- Psych and discharge door redesigns are deliberately still pending.
- The production triageRush JavaScript/CSS implementation remains future work.

## Recommended next work

1. Review and approve the current signed ESI closed/open door prototypes.
2. Design the closed and transparent open psych doors.
3. Redesign discharge layers while preserving alignment with the approved
   exterior background and glass-door scene.
4. Decide which prototype filenames become the final production filenames and
   retain or archive superseded visual candidates accordingly.
5. Continue patient-image review without duplicating the ten completed cases.
6. Begin production room-panel implementation using the approved five-layer
   composition, with `_testApp/` as the interaction and visual reference.

