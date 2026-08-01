# Patient Data

This folder holds the authoritative published patient library.

- `patient-json/` contains the individual patient records.
- `patient-images/` contains the corresponding final patient images.
- `patient-index.json` will provide the production patient manifest.

The public triageRush Game, Edu, and patient-viewer features will read this
library. The future standalone CRUD pipeline will create and maintain it.

Schema version 2.1 was established on 2026-07-31. The template and
specification are current, while the 160 production patient records remain at
version 1.2 until each is deliberately reviewed and migrated. The corresponding
160 images remain preserved. Manifest generation and patient-data revision are
separate steps.

`patient-json-v21-review/` contains the first ten reviewed migration candidates.
They do not replace the production records until the review is accepted.
