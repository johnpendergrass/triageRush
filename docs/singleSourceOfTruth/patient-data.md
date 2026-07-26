# triageRush — Patient Data Transition Status

**Last reviewed:** 2026-07-26 11:13 PDT
**Status:** Existing patient library authoritative; revised answer contract pending

## Operational sources

The existing patient library remains the current source for patient content:

| Content | Location |
|---|---|
| Implemented schema/template | [patient-schema.json](../../patientsCRUD-app/patient-data/docs/patient-schema.json) |
| Patient records | `patientsCRUD-app/patient-data/patient-json/` |
| Patient images | `patientsCRUD-app/patient-data/patient-images/` |
| Anchor images | `patientsCRUD-app/patient-data/anchorImages/` |

There are currently 160 patient JSON records and 160 corresponding primary
patient images.

## Fields that remain useful

The exact `patient.diagnosis.esi` values from 1 through 5 remain important for
the revised concept. Patient identity, demographics, images, presentation
content, vitals, and diagnosis data also remain valuable unless later clinical
review identifies a problem.

All placement-critical evidence must continue to be available before the
player commits to a treatment choice.

## Legacy v1 answer fields

The implemented `answer.correctRoom` and `answer.otherAcceptableRooms` values
encode the archived five-room model:

- Resus
- Acute
- Fast Track
- Psych
- Discharge

These fields remain accurate records of the v1 concept, but they are not the
final answer contract for the revised seven-choice game.

Do not:

- Treat `Acute` as the final answer for both ESI 2 and ESI 3.
- Treat `Fast Track` as the final answer for both ESI 4 and ESI 5.
- Bulk-rewrite answers before the new Close/Wrong rules are confirmed.
- Infer Psych or Discharge behavior without patient-specific review.

## Existing distribution

The current authored dataset contains:

| Classification or v1 special route | Count |
|---|---:|
| ESI 1 | 12 |
| ESI 2 | 41 |
| ESI 3 | 34 |
| ESI 4 with ordinary v1 treatment routing | 33 |
| ESI 5 with ordinary v1 treatment routing | 11 |
| Psych | 5 |
| Discharge | 24 |
| **Total** | **160** |

This distribution may require weighted sampling, curated rounds, or additional
cases so that seven-choice play does not make some answers too rare.

## Anticipated but unapproved schema work

The revised design will probably need patient-specific data for:

- The correct seven-choice treatment answer.
- Close or near-miss choices.
- Over-triage versus under-triage classification.
- A concise Coach explanation.
- The decisive evidence supporting the answer.
- The underlying ESI for Psych and Discharge feedback.

Exact property names and defaults are not yet approved. Do not modify the
schema or patient records until the gameplay rules define these meanings.

## Required migration process

When the new answer contract is approved:

1. Update the schema/template first.
2. Define deterministic defaults only where they are clinically valid.
3. Preserve the v1 answer information or record its migration provenance.
4. Preflight all 160 records.
5. Apply mechanical changes only to fields that can be transformed safely.
6. Clinically review patient-specific exceptions and Coach rationales.
7. Parse and validate all records.
8. Confirm image references, IDs, field types, and allowed values.
9. Recalculate and document the final choice distribution.

The old data semantics remain available in the
[archived v1 patient-data contract](../archive/v1-original-concept-single-source-of-truth/patient-data.md).
