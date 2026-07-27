# Seven-Room Direction and Repository Migration Plan

**Recorded:** 2026-07-27 09:26 PDT

**Status:** Approved direction; migration planning has begun, but the target
production structure has not yet been implemented.

## Approved product direction

The seven-room panel is approved as the development direction for triageRush.
The interactive browser prototype under `docs/design/testApp/` is essentially
how the game should look and develop, subject to production implementation,
clinical review, accessibility work, testing, and later refinements.

The active game design will use these seven choices:

1. ESI 1 — Resuscitation
2. ESI 2 — Emergent
3. ESI 3 — Urgent
4. ESI 4 — Less Urgent
5. ESI 5 — Non-Urgent
6. Psych
7. Discharge

References to the earlier consolidated-room game design and its rules should
be removed from active project documentation and implementation. Design and
development-history documents may retain concise references to that work when
it is clearly described as an abandoned path.

## Target repository structure

The planned top-level organization is:

```text
triageRush/
├── index.html
├── triageRush-app/
├── patient-editor-app/
├── patient-data/
└── docs/
```

### `triageRush-app/`

This folder will contain the actual seven-room Game/Edu application. Its code
and game-specific assets will be self-contained, including backgrounds, icons,
sounds, specifications, and other assets that belong specifically to the game.

The root `index.html` will make the game accessible to GitHub Pages. The exact
relationship between that entry point and the application implementation will
be established during the production-app setup.

### `patient-editor-app/`

This is the approved canonical folder name for the patient tooling. The app
will be enhanced to provide:

- A patient creation pipeline.
- A patient viewer.
- Patient editing.
- Patient deletion.

### `patient-data/`

The main patient assets will live in a separate root-level folder shared by
both applications. It will contain the patient images, JSON records, schema or
supporting patient information, and other patient-owned resources.

This establishes a clear ownership boundary:

- `triageRush-app/` owns game behavior and game-specific resources.
- `patient-editor-app/` owns patient creation and management workflows.
- `patient-data/` is the shared patient-content source used by both apps.

## Prototype disposition

The standalone prototype at `docs/design/testApp/` will remain where it is for
now. It is intentionally retained as a reference and testing platform.

It will **not** be moved, renamed, or promoted into the production
`triageRush-app/`. The production game will be a new creation in the proper
folder. Approved appearance and behavior may be reproduced from the prototype,
but prototype-only constants, scoring, patient answers, and Coach wording do
not automatically become production rules.

## Migration boundary

This document records the agreed direction before the structural migration.
Some folders have already been renamed in the working tree, but those interim
names do not supersede the target names above. A later migration step will
inventory the repository, map current paths to the approved structure, update
references, and verify both applications and the retained prototype.

No bulk patient-schema or clinical-answer migration is approved merely by this
structural decision. Those changes still require their own reviewed contract
and migration plan.
