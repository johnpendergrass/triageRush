# Repository Ownership and Documentation Structure

**Recorded:** 2026-07-27 11:35 PDT

## Current repository structure

```text
triageRush/
├── index.html
├── triageRush-app/
│   ├── app.js
│   ├── styles.css
│   ├── assets/
│   └── docs/
├── patient-data/
├── patient-CRUD-app (standalone)/
├── _testApp/
└── docs-project/
```

## Ownership

- Root `index.html` is the public GitHub Pages entry point.
- `triageRush-app/` owns the public Game, Edu, and read-only patient-viewer
  implementation and game-specific assets.
- `patient-data/` owns published patient JSON and final patient images.
- `patient-CRUD-app (standalone)/` is a future local administrative pipeline
  and is not part of the public application.
- `_testApp/` is the self-contained seven-room prototype and temporary testing
  reference.
- `docs-project/` owns project-wide development and technical documentation.

## Documentation rule

First identify the owner, then the document purpose:

1. `development/` records decisions, experiments, progress, handoffs, and
   history.
2. `technical/` defines architecture, contracts, dimensions, attributes, and
   implementation requirements.
3. `guides/` explains how to play or operate an application.

Most dated records retain a `YYYY MMDD HHMM` filename prefix so they remain
easy to browse chronologically.
