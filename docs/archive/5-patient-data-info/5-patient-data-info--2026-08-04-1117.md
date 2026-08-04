# Patient Data Information

**Last modified:** 2026-08-02

**Changes from the previous version:** Separated patient-data ownership and
application integration from asset documentation and aligned the summary with
the reviewed schema 2.2 production library.

## Ownership and current status

`patient-data/` is the authoritative published patient library.

```text
patient-data/
|-- patient-json/       160 patient records
|-- patient-images/     160 matched portraits
|-- patient-index.json  future production manifest
`-- schema/             schema, template, bands, and validators
```

All 160 current production records use schema 2.2 and have matched images. On
2026-08-02 the schema validator, vital-band audit, and structural/writing sweep
all passed with zero findings.

The detailed clinical review record is retained beside the library as
`patient-data/2026 0801 claude code review of patients 1-160 after revisions.md`.

## Canonical schema sources

Do not duplicate the full schema in application documentation. Use:

- `patient-data/schema/patient-schema-notes.md` for the complete contract and
  version history;
- `patient-data/schema/patient-schema-template.json` for structure;
- `patient-data/schema/schema-support-files/vitals-bands.md` for human-readable
  vital thresholds;
- `vitals-bands.json` for the machine-readable mirror; and
- the validator scripts in the same support folder.

## Information boundary

Schema 2.2 divides displayable content into:

- `patient.presentation`: immutable evidence available for triage;
- `patient.clinical`: faithful interpretation that may help reasoning but may
  not explicitly name the answer; and
- `patient.answer`: correct ESI, destination, and explicit rationale.

Application state controls locked, collapsed, and expanded presentation. Those
view states never belong in patient JSON.

## Presentation contract

Presentation contains identity, image metadata, chief complaint, quote, triage
note, and six vitals.

- `quote` is limited to 225 Unicode code points.
- `triageNote` is limited to 325 Unicode code points.
- Every fact required for a fair placement must be present in Presentation.
- Temperature is stored in Celsius; the application derives Fahrenheit.
- Stored vital colors come from the fixed age-banded thresholds and are
  displayed as authored. The application must not recompute them.

## Answer and scoring fields

The application reads:

```text
patient.answer.correctEsi
patient.answer.correctRoom
patient.answer.otherAcceptableRooms
patient.answer.destinationReason
```

`correctEsi` is 1 through 5. `correctRoom` is `esi-1` through `esi-5`, `psych`,
or `discharge`. Ordinary room suffixes agree with `correctEsi`; Psych and
Discharge retain a clinically valid underlying ESI.

`otherAcceptableRooms` is required but remains `null`. Current scoring derives
all credit from `correctRoom`, `correctEsi`, and the active Strict/Forgiving
setting.

## Clinical contract

Clinical may explain stability, risk, immediate needs, expected resources, key
findings, red flags, teaching points, possible diagnoses, and possible
disposition.

- It cannot explicitly identify an ESI level or correct destination.
- Every patient-specific assertion must be presented or reasonably inferable.
- Possible outcomes are conditional education, not confirmed diagnoses.
- Lower-risk possibilities use the exact `(maybe)` prefix after serious
  possibilities.
- Explicit destination rationale belongs only in Answer.

## Clinical fidelity

Do not rewrite patients from the latest derivative text alone. Material patient
revisions require the designated source, image, authoritative answer, source
notes, evidence ledger, and a three-way source/ledger/proposed comparison.

Reject:

- hidden placement-critical facts;
- weakened or exaggerated source facts without a documented clinical decision;
- later events used to justify the original choice; and
- answer language creeping into Clinical.

Clinical wording changes require John's review. Mechanical validation and
fixed-band color updates may be scripted when they preserve clinical meaning.

## Detailed chart contexts

One component renders three independent in-memory profiles:

```text
PATIENT ASSIGNMENT
  presentation: unlocked, expanded
  answer:       locked, collapsed
  clinical:     unlocked, collapsed

PATIENT-ROOM
  presentation: unlocked, expanded
  answer:       unlocked, collapsed
  clinical:     unlocked, collapsed

PATIENT-REVIEW
  presentation: unlocked, expanded
  answer:       unlocked, expanded
  clinical:     unlocked, expanded
```

Locked always implies collapsed. A locked header remains visible and reports
`This section is locked` when activated. Expansion choices persist only in
memory within the same context and reset on reload or application restart.

## Runtime integration

- Production loads records from `patient-data/`.
- Patient portraits remain in `patient-data/patient-images/`, not the game asset
  tree.
- The player's assignment and first-choice history are session data and never
  modify a patient record.
- Patient order and waiting-room backgrounds belong to application state.
- `patient-index.json` needs deliberate manifest generation before production
  depends on it.
- The future CRUD tool reads and writes the shared library but remains
  independent from game code.

## Validation commands

From the repository root:

```text
node patient-data/schema/schema-support-files/validate-schema-v22.mjs patient-data/patient-json
node patient-data/schema/schema-support-files/sweep-check-1-2.mjs patient-data
node patient-data/schema/schema-support-files/audit-vitals-bands.mjs patient-data/patient-json
```

Automated validation does not replace clinical review, fairness review, or
visual fit testing.
