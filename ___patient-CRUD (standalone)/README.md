# Patient CRUD (Standalone)

This folder is reserved for a future local patient creation, review, and CRUD
tool. It is still conceptual; no application has been implemented.

## Purpose

The tool will:

- Create and edit patient records
- Validate patient data
- Support patient-image creation and review
- Read and write the shared `../patient-data/` store
- Publish approved patient JSON and final patient images into `patient-data`

It will not require, import, or run the triageRush game. The game and CRUD tool
are independent consumers or producers of the shared patient-data contract.

No persistent server is required by the current concept.

## Anchor images

`anchor-images/` contains visual references used when creating patient
artwork. They communicate desired illustration style, framing, pose,
demographic character, and visual quality.

Anchor images are not:

- Final production patient images
- Runtime triageRush assets
- Application screenshots
- Evidence that the CRUD tool depends on the game

Some patient provenance records identify the anchor image used during artwork
creation. Final approved patient images belong in `../patient-data/`.

The parenthetical `(standalone)` suffix is a temporary visual reminder of the
tool's independence. It may be removed when development begins.
