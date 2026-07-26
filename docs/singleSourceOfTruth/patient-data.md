# triageRush — Patient Data

**Last reviewed:** 2026-07-25 15:24 PDT  
**Owner:** Patient-data locations, field semantics, authoring, and validation

## Authoritative locations

| Content | Location |
|---|---|
| Exact schema/template | [patient-schema.json](../../patientsCRUD-app/patient-data/docs/patient-schema.json) |
| Patient records | `patientsCRUD-app/patient-data/patient-json/` |
| Patient images | `patientsCRUD-app/patient-data/patient-images/` |
| Anchor images | `patientsCRUD-app/patient-data/anchorImages/` |

During development, the 160 files in `patient-json/` and 160 images in
`patient-images/` are the patient-data source. Do not create a second edited
copy inside the game application.

The schema/template is the source of truth for all future patient-schema
changes. Update it first, then migrate and validate the individual records.

## Schema status

`patient-schema.json` is a human-readable worked template, not yet a formal JSON
Schema. Patient information appears first. Its final top-level
`_documentMetadata` object records the modification time and change summary.

The implemented high-level record shape is:

```text
id, number, easterEgg, difficulty, johnsComments
patient
├── personal
├── image
├── clinical
├── vitals
└── diagnosis
answer
aiImageGeneration
```

Consult the schema file for the exact property order and worked values instead
of reproducing the full JSON structure here.

## Image fields

```json
"image": {
  "imageFilename": "patient-001.png",
  "imageFlipped": false,
  "imageScale": 1.0
}
```

- `imageFilename` must identify the matching file in `patient-images/`.
- `imageFlipped` is a Boolean, not a string.
- `imageScale` is a numeric uniform scale multiplier.
- `1.0` means normal size, `1.1` means 10% larger, and `0.9` means 10% smaller.
- The interface should scale from a bottom-center transform origin so the
  patient remains grounded.
- All patients currently use `imageScale: 1.0`; values will be tuned after the
  real layout can be previewed.
- Add separate positioning fields only if actual layout testing shows that
  scaling alone is insufficient.

## Clinical text fields

```json
"clinical": {
  "chiefComplaint": "...",
  "quoteShort": null,
  "quoteLong": "...",
  "presentationShort": "...",
  "presentationLong": "..."
}
```

- `quoteShort` is the concise default-card quote.
- `quoteLong` is the expanded patient voice.
- `presentationShort` is the concise default clinical summary.
- `presentationLong` is the expanded clinical handoff.
- Every placement-critical clue must appear in the short/default view.
- Long fields provide optional context and must not be required for fairness.

Migration status:

- All 160 legacy `quote` values were preserved verbatim in `quoteLong`.
- All 160 `quoteShort` values are currently `null`.
- Short quotes must be authored and reviewed; do not create them with a blind
  truncation.
- No legacy `clinical.quote` fields remain.

Previous working text limits were 20 words for a short quote, 40 for a long
quote, 30 for `presentationShort`, and 60 for `presentationLong`. These limits
are provisional until the coded 360 × 640 interface establishes actual fit.

## Diagnosis and routing fields

`patient.diagnosis.esi` is always an integer from 1 through 5.

`patient.diagnosis.esi2roomsNotes`:

- Is present in all 160 records.
- Defaults to `null`.
- Explains an authored exception such as a Psych or Discharge destination.
- Is review metadata, not a runtime routing instruction.

The current records contain:

- 24 non-null Discharge explanations.
- 5 non-null Psych explanations.
- 131 routine records with `null`.

The complete ESI and exception rules live in
[gameplay-rules.md](gameplay-rules.md).

## Answer fields

```json
"answer": {
  "correctRoom": "Fast Track",
  "otherAcceptableRooms": ["Acute"]
}
```

- These fields directly drive scoring.
- `otherAcceptableRooms` is always an array.
- It must not contain `correctRoom`.
- It must not contain duplicates.
- Do not infer or add case-specific alternates at runtime.

## Current verified distribution

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

## Validation requirements

After every bulk migration:

1. Parse all 160 JSON files.
2. Confirm required fields and types against `patient-schema.json`.
3. Confirm patient IDs, filenames, and matching patient images.
4. Confirm ESI is 1–5.
5. Confirm room and alternate strings against `gameplay-rules.md`.
6. Confirm Psych appears only for ESI 4–5 with Fast Track acceptable.
7. Confirm Discharge appears only for ESI 5 with Fast Track acceptable.
8. Confirm Psych and Discharge records have meaningful `esi2roomsNotes`.
9. Confirm no unintended fields or values changed.

Latest validation:

- Files parsed: 160
- Schema-field errors: 0
- Routing errors: 0
- All `imageScale` values: numeric `1.0`
- All `quoteShort` values: `null`
- All original quotes retained in `quoteLong`

## Change procedure

For a schema modification:

1. Edit `patient-schema.json`.
2. Update its `_documentMetadata`.
3. Decide an explicit default or migration rule.
4. Preflight every patient record.
5. Transform all records mechanically where possible.
6. Re-parse and validate all records.
7. Update this document only when field meaning or workflow changes.
8. Update `implementation-status.md` when repository state changes.

