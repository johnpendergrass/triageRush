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

## Running the game locally

Double-click **`start-triageRush.bat`** in this folder. It starts a small local
web server and opens the game in your browser at `http://localhost:8090/`.
Keep the black server window open while playing; close it to stop.

Do not open `index.html` directly from the file system: browsers block a local
page from fetching the patient data files, so the game cannot start that way.
(GitHub Pages serves everything over HTTP, so the published game needs no
server step.)

The window also prints an iPhone address for testing on a phone connected to
the same Wi-Fi network.

## Current direction

Every device uses the same centered, responsive 9:16 mobile presentation. HOME,
GAME, and SHIFT REVIEW are separate player-selected views. The current
documentation specifies replaceable recall scoring, active-patient Coach access,
five-/ten-minute Triage countdowns, RUSH pacing and two-patient bursts, accepted
door artwork, and complete implementation/acceptance guidance.

Start with [the current project map](docs/1-start-here-toc.md).
