# triageRush — Single Source of Truth

**Last reviewed:** 2026-07-26 11:13 PDT
**Status:** Canonical transition-state documentation

## Current project state

`triageRush` is changing from its original five-room routing concept toward a
hybrid game/education design. The new direction is the official path forward
on `main`, but its detailed gameplay, data, layout, scoring, and feedback
contracts are still being designed.

The original concept remains permanently preserved by the Git tag `v1`. Its
former canonical documents are archived together at:

[v1 Original Concept — Archived Single Source of Truth](../archive/v1-original-concept-single-source-of-truth/README.md)

Do not use the archived v1 rules as implementation requirements for the
revised app.

## Active canonical documents

| Subject | Current owner |
|---|---|
| Confirmed direction, working gameplay model, and unresolved rules | [gameplay-rules.md](gameplay-rules.md) |
| Current patient assets, legacy routing fields, and migration status | [patient-data.md](patient-data.md) |
| Interface assumptions that remain valid and areas awaiting redesign | [interface-and-layout.md](interface-and-layout.md) |
| Repository state and the next design/implementation sequence | [implementation-status.md](implementation-status.md) |
| Exact currently implemented patient record shape | [patient-schema.json](../../patientsCRUD-app/patient-data/docs/patient-schema.json) |

During this transition, a document may explicitly say that a decision is open.
That statement is authoritative: older notes must not be used to fill the gap.

## Direction accepted for continued design

The following direction has been accepted as the basis for the revised app:

- The product is primarily a game with serious, realistic medical content.
- The ESI 2–3 and ESI 4–5 gameplay consolidations will be removed.
- The working model offers seven treatment choices: ESI 1, ESI 2, ESI 3,
  ESI 4, ESI 5, Psych, and Discharge.
- The “rooms” are a gameplay metaphor for classification and treatment, not a
  claim that ESI levels are literal physical rooms.
- Every committed choice receives immediate audiovisual feedback.
- Educational coaching is available only after the player commits to a
  decision.
- The revised app has a timed, numerically scored Game mode and an untimed Edu
  mode with Correct/Close/Wrong outcome tallies instead of points.

These statements establish direction, not a complete implementation contract.
Open details are recorded in the subject-owning documents.

## Operational sources

These existing locations remain the operational sources until a reviewed
migration changes them:

| Content | Location |
|---|---|
| Patient schema/template | `patientsCRUD-app/patient-data/docs/patient-schema.json` |
| Patient JSON records | `patientsCRUD-app/patient-data/patient-json/` |
| Patient images | `patientsCRUD-app/patient-data/patient-images/` |
| Existing selected v1 artwork | `docs/DESIGN/REFINING IMAGES/SELECTED ARTWORK/` |

The patient records and images remain valuable inputs. Their v1 room-answer
fields and the selected v1 door artwork are not automatically valid for the
revised design.

## Supporting design discussion

The detailed discussion that initiated this transition is recorded in:

[2026 0726 1058 potential gamestyle change to edu, game.md](../DESIGN/2026%200726%201058%20potential%20gamestyle%20change%20to%20edu,%20game.md)

That note preserves the discussion and alternatives. This folder owns the
current status of any decision.

## Precedence

When information conflicts, use this order:

1. The user's latest explicit decision.
2. The active subject-owning document in this folder.
3. The currently implemented operational source, but only for facts that the
   active document has not marked legacy or pending migration.
4. Supporting design notes.
5. The archived v1 documents and other historical material.

If a required rule is marked undecided, stop and resolve it rather than
silently restoring the v1 behavior.

## Maintenance rule

When a proposed rule becomes confirmed:

1. Update its active subject-owning document.
2. Update the schema, patient records, or artwork only after the rule is
   documented.
3. Validate any data migration.
4. Update [implementation-status.md](implementation-status.md).
5. Preserve archived documents as history rather than rewriting them.
