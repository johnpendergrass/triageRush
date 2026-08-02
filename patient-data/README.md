# Patient Data

This folder holds the authoritative published patient library.

- `patient-json/` contains the individual patient records.
- `patient-images/` contains the corresponding final patient images.
- `patient-index.json` will provide the production patient manifest.

The public triageRush Triage, TriageRUSH, and patient-review features will read
this library. The future standalone CRUD pipeline will create and maintain it.

Schema version 2.2 was established on 2026-08-01. All 160 production records
and matching images are now present under the authoritative folders. The
schema validator, vital-band audit, and structural/writing sweep pass all 160
records. The 2026-08-01 clinical review report is retained in this folder.

`patient-index.json` manifest generation remains a separate production step.
Material future patient revisions remain subject to the schema 2.2 evidence
ledger and clinical-fidelity rules.
