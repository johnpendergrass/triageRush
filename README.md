# triageRush

This repository is the development home for the responsive triageRush
Triage/TriageRUSH application, its shared patient library, temporary
design-reference apps, and a future standalone Patient CRUD tool.

## Current structure

```text
triageRush/
|-- docs/
|   `-- archive/
|-- triageRush/
|-- patient-data/
|-- ___patient-CRUD (standalone)/
|-- _testAppMobile/
|-- _testAppDesktop/
|-- _testAppHomeScreen/
`-- index.html
```

## Ownership

- Root `index.html` is the GitHub Pages entry point.
- `docs/` contains the small numbered set of current project documentation.
- `docs/archive/` preserves superseded specifications, development history,
  prototype references, and artwork development.
- `triageRush/` owns the responsive production application and game assets.
- `patient-data/` owns authoritative patient JSON and final patient images.
- `___patient-CRUD (standalone)/` is reserved for the future independent local
  patient creation and editing tool.
- `_testAppMobile/` and `_testAppDesktop/` are temporary self-contained design
  references. Remove them only after accepted behavior has been verified in
  production.
- `_testAppHomeScreen/` is the temporary HOME composition and live-sound
  reference.

Start with [the current project map](docs/1-start-here-toc.md).

## Current milestone

The demo-design phase is substantially complete. Production development begins
under `triageRush/` with one centered responsive application whose compact form
preserves the established mobile composition. The HOME artwork, registered
state overlays, patient library, and sound-control prototype are ready for
integration.
