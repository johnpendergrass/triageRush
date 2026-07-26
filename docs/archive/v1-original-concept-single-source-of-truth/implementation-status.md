# triageRush — v1 Original Concept — Archived Implementation Status

> **ARCHIVED:** This status report describes the original v1 concept before
> the edu/game redesign discussion. It is not the current project status. See
> the [active Single Source of Truth](../../singleSourceOfTruth/README.md).

**Last verified:** 2026-07-25 15:24 PDT
**Status:** Archived v1 original-concept status
**Former owner:** v1 repository state, known gaps, and next work

## Current state

triageRush is in design and patient-data preparation. There is no playable game
in the rebuilt repository yet.

### Completed

- Fixed 360 × 640 mobile canvas contract.
- 22/56/22 play-area columns.
- Five equal waiting-room and door rows.
- Patient-panel background and four reusable overlay assets.
- Sixteen selected waiting-room backgrounds.
- Closed/open artwork for all five destinations.
- Current selected artwork collected under `SELECTED ARTWORK`.
- 160 patient JSON records and 160 corresponding patient images.
- Every patient has ESI 1–5.
- Deterministic ESI-to-room and alternate-room rules encoded in JSON.
- `esi2roomsNotes` present in all patient records.
- Patient schema/template established as the schema authority.
- `clinical.quote` migrated to `quoteLong`.
- `quoteShort` added and currently `null` in all records.
- `imageScale` added and currently `1.0` in all records.
- Canonical documentation consolidated under `docs/singleSourceOfTruth/`.

### Latest patient-data validation

- Patient JSON files: 160
- Parse errors: 0
- Current schema-field errors: 0
- ESI/room-routing errors: 0
- Non-null `esi2roomsNotes`: 29
- Psych-correct patients: 5
- Discharge-correct patients: 24

## Not implemented

- Root `index.html` is empty.
- No production HTML, CSS, or JavaScript game shell exists.
- No runtime asset manifest exists.
- No patient loader or game-data bundling step exists.
- No waiting-room state machine exists.
- No scoring implementation exists.
- No door-state feedback is wired.
- No expanded clipboard is implemented.
- No mobile-browser test harness exists.
- `patientsBrowser-app` is empty.

The HTML/CSS file under `docs/DESIGN/REFINING IMAGES/mockups/` is a structural
prototype only.

## Current authorities

| Subject | Authority |
|---|---|
| Documentation index | `docs/singleSourceOfTruth/README.md` |
| Patient schema | `patientsCRUD-app/patient-data/docs/patient-schema.json` |
| Patient records | `patientsCRUD-app/patient-data/patient-json/` |
| Patient images | `patientsCRUD-app/patient-data/patient-images/` |
| Selected artwork | `docs/DESIGN/REFINING IMAGES/SELECTED ARTWORK/` |

## Known gaps

1. All `quoteShort` values still need to be authored and reviewed.
2. All `imageScale` values remain at the default until a real layout preview
   exists.
3. The schema/template is not yet a formal JSON Schema.
4. Door images differ slightly in source dimensions.
5. Exact scoring values and round/pacing rules require reconfirmation.
6. Timer behavior while expanded information is open is undecided.
7. Runtime asset locations inside `triageRush-app` are not established.
8. The optional Psych waiting-room poster should be reviewed before shipping.

## Recommended next sequence

1. Author and review `quoteShort` for all patients.
2. Create the fixed 360 × 640 production shell.
3. Implement the 40/560/40 vertical grid and 22/56/22 play grid.
4. Implement the shared five-row waiting/door rails.
5. Establish a production asset structure and manifest using the selected art.
6. Layer the active-patient background, patient, overlays, and HTML text.
7. Add an image preview/tuning workflow for `imageScale`.
8. Implement patient selection and swap behavior.
9. Implement room placement using authored `answer` fields.
10. Add closed/open door feedback.
11. Implement the expanded clipboard.
12. Reconfirm scoring, timing, round, and spawn settings.
13. Test the required mobile viewport matrix.

## Status update rule

Update this document when repository state changes. Do not put new canonical
rules here; place them in the subject-owning document and link to them.
