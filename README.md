# triageRush

triageRush is a responsive emergency-department triage teaching game with
Triage and TriageRUSH modes, a shared 160-patient library, and a future
standalone patient editor.

## Forward project structure

```text
triageRush/
|-- index.html                    site entry point
|-- docs/                         current product and implementation specification
|-- triageRush/                   production application and runtime artwork
|-- patient-data/                 authoritative patient JSON and portraits
|-- _testAppMobile/               mobile implementation and verification target
`-- ___patient-CRUD (standalone)/ future independent patient editor
```

## Ownership

- Root `index.html` is the published entry point.
- `docs/` defines current behavior, UI, engineering contracts, algorithms, and
  acceptance tests.
- `triageRush/` owns production code and runtime artwork.
- `patient-data/` owns authoritative patient JSON, portraits, schema, vital
  bands, and validators.
- `_testAppMobile/` is the self-contained implementation target used to prove
  the documented behavior before production transfer.
- `___patient-CRUD (standalone)/` is reserved for an independent local patient
  creation and editing tool.

## Current direction

Every device uses the same centered, responsive 9:16 mobile presentation. HOME,
GAME, and SHIFT REVIEW are separate player-selected views. The current
documentation specifies replaceable recall scoring, active-patient Coach access,
five-/ten-minute Triage countdowns, RUSH pacing and two-patient bursts, accepted
door artwork, and complete implementation/acceptance guidance.

Start with [the current project map](docs/1-start-here-toc.md).
