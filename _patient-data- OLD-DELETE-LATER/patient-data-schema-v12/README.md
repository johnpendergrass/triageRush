# Patient Data

This folder holds the authoritative published patient library.

- `patient-json/` contains the individual patient records.
- `patient-images/` contains the corresponding final patient images.
- `patient-index.json` will provide the production patient manifest.

The public triageRush Game, Edu, and patient-viewer features will read this
library. The future standalone CRUD pipeline will create and maintain it.

The 160 existing JSON records and 160 corresponding images have been preserved
here without a clinical-answer or schema migration. Manifest generation and
patient-data revision will occur after the repository restructuring is
complete.
