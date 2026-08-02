# Three-Mode Scoring Specification

**Established:** 2026-07-29 16:22 PDT

**Status:** Current production gameplay contract

**Supersedes:** `2026 0727 1458 strict and forgiving scoring specification.md`

**Applies to:** triageRush schema versions 1.2 and 2.0 until superseded

## Purpose

The player chooses one of seven rooms for each patient:

- `esi-1`
- `esi-2`
- `esi-3`
- `esi-4`
- `esi-5`
- `psych`
- `discharge`

The player configures one of three scoring modes:

- **Strict**
- **Tolerant** (working name)
- **Forgiving**

Scoring mode is application configuration, not patient data.

## Patient data used by scoring

The scoring algorithm reads:

- The version-appropriate correct-room field:
  - `answer.correctRoom` in schema version 1.2
  - `patient.answer.correctRoom` in schema version 2.1 and later
- The patient's underlying ESI:
  - `patient.diagnosis.esi` in schema version 1.2
  - `patient.answer.correctEsi` in schema version 2.1 and later

The version-appropriate `correctRoom` must be one of the seven room identifiers above.
The version-appropriate underlying ESI must be an integer from 1 through 5.

`otherAcceptableRooms` remains present at `answer.otherAcceptableRooms` in
schema 1.2 and `patient.answer.otherAcceptableRooms` in schema 2.1 and later,
but is `null` for all current patients. The scoring algorithm must ignore it.
It is reserved for a possible future exceptional-patient override whose schema
and behavior must be defined before use.

The patient-data contract and its version history are maintained in
[Patient schema notes](../patient-data/schema/patient-schema-notes.md).

## Full-credit rooms

### Ordinary ESI patient

When the version-appropriate `correctRoom` is `esi-1` through `esi-5`, that room is the only
full-credit room.

The data validator should require the numeric suffix of `correctRoom`
to equal the version-appropriate underlying ESI.

### Psych or Discharge patient

When `correctRoom` is `psych` or `discharge`, two rooms receive full
credit:

1. The special room named by `correctRoom`.
2. The ESI room derived from the version-appropriate underlying ESI.

This dual full-credit rule applies in all three scoring modes.

## Over-triage and under-triage

For scoring purposes:

- **Over-triage** means selecting a numerically lower, more acute ESI level.
- **Under-triage** means selecting a numerically higher, less acute ESI level.

For an ESI 3 patient:

- ESI 2 is one level of over-triage.
- ESI 4 is one level of under-triage.

Psych and Discharge are special destinations and are not adjacent to any room.
Any partial-credit ESI choice for a Psych or Discharge patient is calculated
from that patient's underlying ESI.

## Strict mode

Strict mode awards:

- Full credit for a full-credit room.
- No credit for every other room.

Strict mode does not remove the dual full-credit rule for Psych and Discharge.

## Tolerant mode

Tolerant is a working name and may be renamed without changing its rules.

Tolerant mode awards:

- Full credit for a full-credit room.
- Half credit for exactly one ESI level of over-triage.
- No credit for any under-triage.
- No credit for every other room.

This mode tolerates a single conservative error but never awards points for
placing a patient at a less acute level than intended.

Examples:

- ESI 3 patient placed in ESI 3: full credit.
- ESI 3 patient placed in ESI 2: half credit.
- ESI 3 patient placed in ESI 4: no credit.
- ESI 1 patient has no possible over-triage room.

## Forgiving mode

Forgiving mode awards:

- Full credit for a full-credit room.
- Half credit for an adjacent ESI room in either direction.
- No credit for every other room.

Adjacency is numeric:

- ESI 1 is adjacent only to ESI 2.
- ESI 2 is adjacent to ESI 1 and ESI 3.
- ESI 3 is adjacent to ESI 2 and ESI 4.
- ESI 4 is adjacent to ESI 3 and ESI 5.
- ESI 5 is adjacent only to ESI 4.

For a Psych or Discharge patient, partial-credit rooms are derived from the
underlying ESI level. The matching special room and assigned ESI room remain
worth full credit.

If the full-credit award is represented by `fullPoints`, half credit is
`fullPoints / 2`.

## Required scoring order

The implementation must evaluate a room selection in this order:

1. Build the full-credit set.
2. If the selected room is in that set, award full credit.
3. If the selected room is not an ESI room, award no credit.
4. Calculate `selected ESI - patient ESI`.
5. In Tolerant mode, award half credit only when that difference is `-1`.
6. In Forgiving mode, award half credit when the absolute difference is `1`.
7. Otherwise, award no credit.

Checking full credit first prevents the assigned ESI room for a Psych or
Discharge patient from being reduced to partial credit.

## Reference algorithm

```text
if patient schema is 2.1:
    patientEsi = patient.answer.correctEsi
    correctRoom = patient.answer.correctRoom
else if patient schema is 1.2:
    patientEsi = patient.diagnosis.esi
    correctRoom = answer.correctRoom

assignedEsiRoom = "esi-" + patientEsi
fullCreditRooms = { correctRoom }

if correctRoom is "psych" or "discharge":
    add assignedEsiRoom to fullCreditRooms

if selectedRoom is in fullCreditRooms:
    return FULL_CREDIT

if selectedRoom is not an ESI room:
    return NO_CREDIT

esiDifference = selected ESI - patient ESI

if scoringMode is "tolerant" and esiDifference equals -1:
    return HALF_CREDIT

if scoringMode is "forgiving" and absolute(esiDifference) equals 1:
    return HALF_CREDIT

return NO_CREDIT
```

## Decision table

| Patient assignment | Selected room | Strict | Tolerant | Forgiving |
|---|---|---:|---:|---:|
| Ordinary ESI 3 | `esi-3` | Full | Full | Full |
| Ordinary ESI 3 | `esi-2` | None | Half | Half |
| Ordinary ESI 3 | `esi-4` | None | None | Half |
| Ordinary ESI 3 | `psych` or `discharge` | None | None | None |
| Psych, ESI 4 | `psych` | Full | Full | Full |
| Psych, ESI 4 | `esi-4` | Full | Full | Full |
| Psych, ESI 4 | `esi-3` | None | Half | Half |
| Psych, ESI 4 | `esi-5` | None | None | Half |
| Psych, ESI 4 | `discharge` | None | None | None |
| Discharge, ESI 5 | `discharge` | Full | Full | Full |
| Discharge, ESI 5 | `esi-5` | Full | Full | Full |
| Discharge, ESI 5 | `esi-4` | None | Half | Half |
| Discharge, ESI 5 | `psych` | None | None | None |
| Ordinary ESI 1 | `esi-2` | None | None | Half |
| Ordinary ESI 5 | `esi-4` | None | Half | Half |

## Minimum implementation tests

Automated tests must cover:

- Exact ESI matches in all three modes.
- One-level over-triage for ESI 2 through ESI 5 in all modes.
- One-level under-triage for ESI 1 through ESI 4 in all modes.
- The one-sided boundaries at ESI 1 and ESI 5.
- A non-adjacent ESI selection.
- Psych at more than one underlying ESI level.
- Discharge at more than one underlying ESI level if such data exists.
- The special room and assigned ESI room receiving full credit in every mode.
- Tolerant partial credit being asymmetric.
- Forgiving partial credit working in both directions.
- The opposite special room receiving no credit.
- `otherAcceptableRooms: null` having no effect.
- Rejection or reporting of an unknown room identifier, invalid ESI value, or
  inconsistent ordinary `correctRoom`.

## Outcome terminology

The visible feedback vocabulary may vary by scoring mode:

- Strict requires only full-credit and no-credit outcomes.
- Tolerant requires full-credit, half-credit over-triage, and no-credit
  outcomes.
- Forgiving requires full-credit, adjacent half-credit, and no-credit
  outcomes.

The interface specification will determine the final player-facing words,
colors, and answer-reveal behavior. Scoring logic should return semantic credit
results rather than hard-code presentation labels.

## Out of scope

This specification does not decide:

- The final player-facing name for Tolerant mode.
- The numeric value of a full-credit award.
- Streaks, bonuses, penalties, timing adjustments, or score multipliers.
- How the scoring-mode control is presented.
- Mode-specific Coach availability or answer reveals.
- Any future semantics for non-null `otherAcceptableRooms`.

Those rules may be specified separately without changing the room-selection
logic above.
