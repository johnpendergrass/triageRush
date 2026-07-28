# Strict and forgiving scoring specification

**Established:** 2026-07-27 14:58 PDT  
**Status:** Current production gameplay contract  
**Applies to:** triageRush schema version 1.2 and later until superseded

## Purpose

The player chooses one of seven rooms for each patient:

- `esi-1`
- `esi-2`
- `esi-3`
- `esi-4`
- `esi-5`
- `psych`
- `discharge`

The player can configure scoring as **Strict** or **Forgiving**. The scoring
mode is application configuration, not patient data.

## Patient data used by scoring

The scoring algorithm reads:

- `answer.correctRoom`
- `patient.diagnosis.esi`

`answer.correctRoom` must be one of the seven room identifiers listed above.
`patient.diagnosis.esi` must be an integer from 1 through 5.

`answer.otherAcceptableRooms` remains present in schema version 1.2 but is
`null` for all current patients. The scoring algorithm must ignore it. It is
reserved for a possible future exceptional-patient override, whose structure
and behavior must be defined by a later schema version before use.

The patient-data contract and its version history are maintained in
[Patient schema notes](../../../patient-data/schema/patient-schema-notes.md).

## Full-credit rooms

### Ordinary ESI patient

When `answer.correctRoom` is `esi-1` through `esi-5`, that room is the only
full-credit room.

The data validator should require the numeric suffix of `answer.correctRoom`
to equal `patient.diagnosis.esi`.

### Psych or discharge patient

When `answer.correctRoom` is `psych` or `discharge`, two rooms receive full
credit:

1. The special room named by `answer.correctRoom`.
2. The ESI room derived from `patient.diagnosis.esi`.

This dual full-credit rule applies in both Strict and Forgiving modes.

## Strict mode

Strict mode awards:

- Full points for a full-credit room.
- Zero points for every other room.

“Strict” does not remove the dual full-credit rule for Psych and Discharge
patients. Their designated special room and assigned ESI room are both fully
correct.

## Forgiving mode

Forgiving mode awards:

- Full points for a full-credit room.
- Half points for an adjacent ESI room.
- Zero points for every other room.

Adjacency is numeric:

- ESI 1 is adjacent only to ESI 2.
- ESI 2 is adjacent to ESI 1 and ESI 3.
- ESI 3 is adjacent to ESI 2 and ESI 4.
- ESI 4 is adjacent to ESI 3 and ESI 5.
- ESI 5 is adjacent only to ESI 4.

Psych and Discharge are not adjacent to any room. For a Psych or Discharge
patient, the half-credit rooms are derived from the patient's assigned ESI
level, while the matching special room and assigned ESI room remain worth full
points.

If the full-point award is represented by `fullPoints`, the half-point award
is `fullPoints / 2`.

## Required scoring order

The implementation must evaluate a room selection in this order:

1. Build the full-credit set.
2. If the selected room is in that set, award full points.
3. Otherwise, if the mode is Forgiving and the selected room is an adjacent
   ESI room, award half points.
4. Otherwise, award zero points.

Checking full credit first prevents an assigned ESI room from being reduced to
half credit for a Psych or Discharge patient.

## Reference algorithm

```text
assignedEsiRoom = "esi-" + patient.diagnosis.esi
fullCreditRooms = { patient.answer.correctRoom }

if patient.answer.correctRoom is "psych" or "discharge":
    add assignedEsiRoom to fullCreditRooms

if selectedRoom is in fullCreditRooms:
    return FULL_CREDIT

if scoringMode is "forgiving"
   and selectedRoom is an ESI room
   and absolute(selected ESI - patient ESI) equals 1:
    return HALF_CREDIT

return NO_CREDIT
```

## Decision table

| Patient assignment | Selected room | Strict | Forgiving |
|---|---|---:|---:|
| Ordinary ESI 3 | `esi-3` | Full | Full |
| Ordinary ESI 3 | `esi-2` or `esi-4` | None | Half |
| Ordinary ESI 3 | `psych` or `discharge` | None | None |
| Psych, ESI 4 | `psych` | Full | Full |
| Psych, ESI 4 | `esi-4` | Full | Full |
| Psych, ESI 4 | `esi-3` or `esi-5` | None | Half |
| Psych, ESI 4 | `discharge` | None | None |
| Discharge, ESI 5 | `discharge` | Full | Full |
| Discharge, ESI 5 | `esi-5` | Full | Full |
| Discharge, ESI 5 | `esi-4` | None | Half |
| Discharge, ESI 5 | `psych` | None | None |

## Minimum implementation tests

Automated tests must cover:

- Exact ESI matches in both modes.
- Both adjacent rooms for ESI 2, 3, and 4.
- The one-sided boundaries at ESI 1 and ESI 5.
- A non-adjacent ESI selection.
- Psych at more than one ESI level.
- Discharge at more than one ESI level if such patient data exists.
- The special room and assigned ESI room receiving full credit in both modes.
- The opposite special room receiving zero credit.
- `otherAcceptableRooms: null` having no effect.
- Rejection or reporting of an unknown room identifier, invalid ESI value, or
  inconsistent ordinary `correctRoom`.

## Out of scope

This specification does not decide:

- The numeric value of a full-point award.
- Streaks, bonuses, penalties, timing adjustments, or score multipliers.
- How the scoring-mode control is presented in the interface.
- Any future semantics for non-null `otherAcceptableRooms`.

Those rules may be specified separately without changing the room-selection
logic above.
