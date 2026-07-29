# triageRush

This repository is the development home for the triageRush Game/Edu
application, its shared patient library, isolated mobile and desktop test apps,
and a future standalone patient CRUD pipeline.

## Ownership

- `index.html` is the public GitHub Pages entry point for triageRush.
- `triageRush-app/` owns the Game, Edu, and read-only patient-viewer code,
  styles, assets, tests, and application-specific documentation.
- `patient-data/` owns the authoritative published patient JSON and final
  patient images consumed by triageRush.
- `patient-CRUD-app (standalone)/` is reserved for the future local patient
  creation and CRUD pipeline. Its temporary descriptive folder name will be
  reconsidered when work on that pipeline resumes.
- `_testAppMobile/` is the preserved, self-contained mobile prototype.
- `_testAppDesktop/` is the self-contained responsive-layout experiment.
- The two test apps have independent code, runtime assets, and preview servers.
  Neither is the production application; both are now design references for
  one responsive production game.
- `docs-project/` owns project-wide architecture, planning, status, migration,
  and historical documentation.

The production triageRush JavaScript and CSS have not yet been built. The
current files under `triageRush-app/` are placeholders for that work; selected
room-panel artwork has been collected under its `assets/` folder.
