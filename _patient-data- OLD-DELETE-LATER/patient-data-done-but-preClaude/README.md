# Patient Data

This folder holds the authoritative published patient library.

- `patient-json/` contains the individual patient records.
- `patient-images/` contains the corresponding final patient images.
- `patient-index.json` will provide the production patient manifest.

The public triageRush Game, Edu, and patient-viewer features will read this
library. The future standalone CRUD pipeline will create and maintain it.

Schema version 2.2 was established on 2026-08-01. The canonical template and
specification are current, while the 160 production patient records remain at
version 1.2 until a new source-based migration is deliberately planned and
performed. The corresponding 160 images remain preserved. Manifest generation
and patient-data revision are separate steps.

The next migration will start from the preserved version 1.2 source records and
matching images. Experimental 2.1b records and prior review candidates are not
authoritative migration sources. Each migrated patient requires an external
evidence ledger and three-way clinical-fidelity review under the 2.2 rules.
