# Patient Data Information

**Last modified:** 2026-08-05

**Latest change:** Aligned the chart contexts with the built unified chart
(Chart naming, always-visible presentation cards, shake-on-locked-Answer,
"None identified." red-flags card).

## Ownership and status

`patient-data/` is the authoritative patient library.

```text
patient-data/
|-- patient-json/       160 schema 2.2 records
|-- patient-images/     160 matched portraits
|-- patient-index.json  production manifest location
`-- schema/             schema, template, vital bands, and validators
```

All 160 current records have matched images. The 2026-08-01 schema, vital-band,
structural, writing, and clinical-fidelity review passed with zero remaining
validator findings.

## Canonical schema sources

Do not duplicate the complete schema in application code or game documentation.

- `patient-data/schema/patient-schema-notes.md`: complete contract and history.
- `patient-data/schema/patient-schema-template.json`: structural example.
- `patient-data/schema/schema-support-files/vitals-bands.md`: readable bands.
- `vitals-bands.json`: machine-readable bands.
- Validator scripts in the same support folder: release gates.

## Information boundary

Schema 2.2 divides content into:

- `patient.presentation`: immutable evidence available before assignment;
- `patient.clinical`: faithful interpretation that may support reasoning but
  may not explicitly name the answer; and
- `patient.answer`: correct ESI, destination, and explicit rationale.

Application state controls locked/collapsed/expanded presentation. UI state,
queue placement, assignments, and scores never belong in patient JSON.

## Presentation contract

Presentation supplies personal demographics, image metadata, chief complaint,
quote, triage note, and six vitals.

- `quote` is at most 225 Unicode code points.
- `triageNote` is at most 325 Unicode code points.
- Every fact required for a fair placement must be available before assignment.
- Temperature is stored in Celsius; Fahrenheit may be derived for display.
- Vital colors come from fixed age-banded thresholds and must be displayed as
  authored rather than recomputed by the game.
- `imageFilename`, `imageFlipped`, and `imageScale` control portrait lookup
  and composition; applications must honor them where specified.

## Answer and evaluation fields

The application reads:

```text
patient.answer.correctEsi
patient.answer.correctRoom
patient.answer.destinationReason
```

`correctEsi` is 1 through 5. `correctRoom` is `esi-1` through `esi-5`,
`psych`, or `discharge`. Ordinary room suffixes match `correctEsi`; Psych
and Discharge retain a clinically valid underlying ESI.

### AUTHORING RULE: when Psych or Discharge may be the correct room

Recovered from `docs/archive/` and promoted here on 2026-08-05 because it had
never reached the numbered set, which caused it to be misremembered twice.
The original decisions were "Psych appears only for ESI 4-5"
(`archive/2-dev-history/triageRush-timeline/2026 0725 1434 session summary and
restart guide.md`) and "Dangerous psychiatric emergencies are medical 1-2
(Resus), NOT [psych]"
(`archive/0-documentation-system/.../collaboration-notes/specifications.MD`).

- **A psychiatric presentation that is dangerous is NEVER a Psych patient.**
  Active suicidal or homicidal ideation, acute agitation with risk, or any
  need for immediate intervention is ESI 1-2 and belongs in a MEDICAL room.
  The medical acuity always takes precedence over the behavioural label.
- **Psych is correct only for medically stable behavioural-health
  presentations at ESI 4-5** — in practice ESI 4, because a psychiatric
  evaluation IS one resource, and ESI 5 means no resources are needed at all.
  An ESI-5 Psych patient is very nearly self-contradictory.
- **Discharge is correct only at ESI 5** (no resources required).
- ESI 3 is excluded from both for a different reason than danger: it means
  multiple resources, i.e. a real medical workup, which must happen before a
  psych disposition.

Why the ESI number alone cannot express "danger": ESI 1-2 are DANGER levels
(immediate life-saving intervention; high-risk situation), while ESI 3-4-5 are
RESOURCE-COUNT levels (many / one / none). They share one numeric scale but
measure different things, which is what makes "ESI 4 and above is dangerous"
an easy and wrong intuition.

Current data agrees with this rule: all 24 Discharge patients are ESI 5, and
all 5 Psych patients are ESI 4, each with a `destinationReason` citing "one
specialty evaluation resource". (Historical note: `patient-105` was once
authored as an ESI-5 Psych patient; it is ESI 4 today and the change is not
recorded in the 2026-08-01 revision review.)

Two things in the archive that DO NOT apply today: it calls Psych "room 6"
from the six-room era, and offers "Fast Track acceptable" as an alternate
destination. Today's equivalent of that alternate is the dual credit for the
underlying `esi-N` described below.

`otherAcceptableRooms` is required by the schema but is `null` for all 160
patients, and NO application code reads it. It is an authoring hook held in
reserve. The full-credit set is DERIVED at runtime by
`game.js fullCreditRoomKeys`: `correctRoom`, plus `esi-<correctEsi>` when
`correctRoom` is `psych` or `discharge`. Anything that needs to display or
score the full-credit set must call that function rather than the field, so
the review chart and the scoring can never disagree (2026-08-05).

Patient records never carry point values. The latest room assigned during the
shift is session data. Reassignment replaces the same patient's session-ledger
result without changing the patient source.

## Clinical contract

Clinical may explain stability, risk, immediate needs, expected resources, key
findings, red flags, teaching points, possible diagnoses, and disposition.

- It cannot explicitly identify an ESI level or destination.
- Every patient-specific assertion must be presented or reasonably inferable.
- Possible outcomes are conditional education, not confirmed diagnoses.
- Lower-risk possibilities use the exact `(maybe)` prefix after serious ones.
- Explicit destination rationale belongs only in Answer.

## Clinical fidelity safeguards

Material patient changes require comparison with the designated source, portrait,
authoritative answer, source notes, evidence ledger, and proposed revision.

Reject:

- hidden placement-critical facts;
- weakened or exaggerated source facts without a documented clinical decision;
- later events used to justify the original choice;
- answer language leaking into Clinical; and
- portrait, demographics, and text that contradict one another.

Clinical wording changes require John's review. Mechanical validation and fixed
vital-band updates may be scripted only when clinical meaning is preserved.

## Detailed-chart contexts

One chart builder renders the same content in per-setting wrappers. The
Presentation cards are always visible in every setting (no PRESENTATION
header):

```text
PANEL (GAME center)
  presentation cards only; Answer and Clinical absent

CLIPBOARD (Chart overlay, active patient)
  presentation: always visible
  answer:       locked, collapsed
  clinical:     toggling, current shift preference
                (collapsed when the shift starts)

REVIEW (Patients Seen, future)
  presentation: always visible
  answer:       unlocked, expanded
  clinical:     unlocked, expanded
```

Locked always implies collapsed. Activating locked Answer shakes the striped
LOCKED header briefly and never opens it.

The active-patient Clinical state is one in-memory preference shared across
patients and recalls for the current shift. It resets to collapsed when a new
shift starts. Review expansion is separate and does not alter that preference.

## Chart content mapping

### Presentation

- portrait from `presentation.image.imageFilename`;
- name, age, and sex from `presentation.personal`;
- chief complaint, quote, triage note, and six vitals.

### Answer

- player's latest selected room from the shift ledger;
- correct room and correct ESI from `answer`;
- latest result from evaluation;
- destination explanation from `answer.destinationReason`.

### Clinical

Eight cards, in order: SUMMARY, WHY THIS ACUITY, KEY FINDINGS, EXPECTED
RESOURCES, RED FLAGS, TEACHING POINTS, POSSIBLE DIAGNOSES, and LIKELY
DISPOSITION.

The application must tolerate an empty red-flags array by rendering the RED
FLAGS card with "None identified.", not by treating the record as invalid.

## Runtime integration

- Production loads JSON from `patient-data/patient-json/`.
- Production loads portraits from `patient-data/patient-images/`.
- A deliberate explicit manifest lists the 160 IDs.
- After validation, retain each loaded JSON record with the same property names,
  casing, nesting, and values found on disk. Do not flatten it into a second
  patient schema or rename fields for runtime convenience.
- Store canonical records once in an index such as `patientsById`. Selectors and
  renderers read paths such as `patientRecord.patient.presentation` directly.
- Waiting and active entries store only the patient ID plus game-owned data such
  as `waitingBackgroundKey`. Ledger records store the patient ID and assignment
  result. They never copy the complete canonical patient record.
- Derived display values and shift/session fields remain separate from the
  canonical record so they cannot accidentally be written back as patient data.
- The shuffled deck, queue backgrounds, active patient, ledger, and Chart state
  belong to application state.
- Patients Seen order is the ledger's stable first-seen order.
- A recalled/reassigned patient is still one Patients Seen record.
- The future CRUD tool may read/write this library but remains independent from
  game runtime code.

Portrait files do not all need to decode before HOME appears. Patient JSON and
the manifest can load while the player reviews settings. Start Shift then waits
behind `PATIENTS ARE ARRIVING` until the initial queue portraits and a measured
reserve are fetched and decoded. Gameplay maintains a rolling reserve ahead of
the deck cursor. The reserve size is finalized through network testing against
the fastest supported RUSH sequence rather than by preloading all 160 portraits.

## Load-time validation

Before enabling Start Shift, verify:

- exactly the intended patient IDs are present in the manifest;
- every JSON fetch succeeds and parses;
- schema version is `2.2`;
- every required Presentation, Answer, and Clinical field exists;
- every image filename resolves;
- room and ESI values are legal; and
- errors identify the patient/path and prevent a partial shift.

## Validation commands

From the repository root:

```text
node patient-data/schema/schema-support-files/validate-schema-v22.mjs patient-data/patient-json
node patient-data/schema/schema-support-files/sweep-check-1-2.mjs patient-data
node patient-data/schema/schema-support-files/audit-vitals-bands.mjs patient-data/patient-json
```

Automated validation does not replace clinical review, fairness review, or
visual fit testing.
