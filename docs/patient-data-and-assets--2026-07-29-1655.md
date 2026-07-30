# triageRush Patient Data and Assets

**Current version:** 2026-07-29 16:55 PDT

## Ownership

- `patient-data/` owns authoritative patient JSON and final patient images.
- `triageRush/` consumes that published data but does not own it.
- `patient-CRUD (standalone)/` will eventually create, validate, and edit
  patient data without depending on the game.

## Patient store

The repository currently contains 160 authoritative patient JSON records and
their corresponding final patient images.

Production must load reviewed records from `patient-data/`; demo patient
objects embedded in JavaScript are not production data.

## Schema

The authoritative operational schema remains beside the data:

```text
patient-data/schema/
├── patient-schema-template.json
└── patient-schema-notes.md
```

Important game fields include:

- Patient identifier
- Display identity and demographics
- Complaint and quote
- Triage presentation
- Six vital signs
- `diagnosis.esi`
- `answer.correctRoom`
- `answer.otherAcceptableRooms`
- Image metadata and provenance

`answer.correctRoom` uses one of:

```text
esi-1, esi-2, esi-3, esi-4, esi-5, psych, discharge
```

`answer.otherAcceptableRooms` is currently required but `null`. The active
three-mode scoring rules derive credit from `answer.correctRoom` and
`diagnosis.esi`.

## Patient validation

Production checks should verify:

- Every JSON record parses.
- Every identifier is unique.
- Every final patient image exists.
- ESI is an integer from 1 through 5.
- Ordinary ESI room identifiers agree with diagnosis ESI.
- Psych and Discharge retain a valid underlying ESI.
- Unknown room identifiers are rejected or reported.
- Schema-version changes are deliberate.

## Patient sequencing

The game stores a randomized list of patient identifiers and traverses it
instead of repeatedly choosing a random patient. The list and current position
may be stored locally for cross-session continuation.

This play-order state belongs to the game, not to authoritative patient JSON.

## Production artwork

The game owns approved runtime artwork under:

```text
triageRush/assets/
├── patient-panel/
├── rooms-panel/
└── waiting-room-panel/
```

Current approved inventory:

- 16 high-resolution waiting-room backgrounds
- Patient-panel background
- Patient name overlay
- Patient quote overlay
- Vital-signs overlay
- Triage clipboard overlay
- Shared room-wall background
- ESI 1–5 room interiors
- Psych room interior
- Discharge room interior
- Closed and open doors for all seven destinations

Runtime asset paths should be centralized in a manifest or similarly obvious
mapping.

## Responsive artwork rules

- Backgrounds may crop, reveal more area, or scale independently.
- Patient artwork should not be forced to match background magnification.
- Patient artwork remains prominent and normally bottom-aligned.
- Queue backgrounds travel with patients while they remain queued.
- Transparent layers must preserve correct stacking and click behavior.

## Anchor images

`patient-CRUD (standalone)/anchor-images/` contains visual references for
patient creation. Anchor images communicate desired illustration style,
framing, pose, demographic character, and visual quality.

They are not:

- Production patient images
- Runtime game dependencies
- Application screenshots
- A dependency on the triageRush game

Some patient provenance fields reference a particular anchor image. Those
paths must remain valid when the temporary CRUD folder name changes.

## Patient CRUD relationship

The future CRUD application:

- Is a standalone local tool
- Does not require triageRush code
- Reads and writes the shared `patient-data` store
- Uses anchor images while creating or reviewing patient artwork
- Publishes approved JSON and final images into `patient-data`

## Historical artwork

Artwork iterations, rejected concepts, and selected-reference snapshots are
stored in the root `docs-archive/`. Production code must use
`triageRush/assets/`, not documentation artwork.

## Change history

- **2026-07-29 16:55 PDT:** Consolidated patient ownership, schema essentials,
  production assets, anchor-image meaning, and application boundaries.
