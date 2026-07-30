# triageRush

This repository is the development home for the responsive triageRush
Game/Edu application, its shared patient library, temporary design-reference
apps, and a future standalone Patient CRUD tool.

## Current structure

```text
triageRush/
├── docs/
├── docs-archive/
├── triageRush/
├── patient-data/
├── patient-CRUD (standalone)/
├── _testAppMobile/
├── _testAppDesktop/
└── index.html
```

## Ownership

- Root `index.html` is the GitHub Pages entry point.
- `docs/` contains the small authoritative set of current project
  specifications.
- `docs-archive/` preserves superseded specifications, development history,
  prototype references, and artwork development.
- `triageRush/` owns the responsive Game/Edu application and production game
  assets.
- `patient-data/` owns authoritative patient JSON and final patient images.
- `patient-CRUD (standalone)/` is reserved for the future independent local
  patient creation and editing tool.
- `_testAppMobile/` and `_testAppDesktop/` are temporary self-contained design
  references. They will be removed after production development is complete
  and their accepted behavior has been verified in `triageRush/`.

Start with [the current documentation index](docs/README.md).

## Current milestone

The demo-design phase is complete. Production development begins under
`triageRush/` with one centered responsive game whose compact form preserves
the established mobile composition.
