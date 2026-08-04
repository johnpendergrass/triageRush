# triageRush Documentation

**Last modified:** 2026-08-04

**Latest change:** Expanded the canonical set into a build-complete product
specification and made the single responsive mobile presentation authoritative
on every device.

## Purpose

This folder is the current product and implementation specification for
triageRush. A capable developer or AI helper should be able to rebuild the
intended mobile application from the numbered documents, canonical patient
library, and owned production artwork.

The numbered files are authoritative. Material under `archive/` is historical
and cannot override them. The current specification describes only the product,
code, data, and assets intended to continue forward.

## Current documents

```text
0-README.md
1-start-here-toc.md
2-dev-history.md
3-gameplay-rules-and-specs.md
4-coding-contracts-and-specs.md
5-patient-data-info.md
6-asset-organization-and-specs.md
7-mobile-ui-and-interaction-spec.md
8-implementation-blueprint.md
9-implementation-plan-and-acceptance.md
99-ai-handoff--YYYY-MM-DD-HHMM.md
```

- `0` explains authority, terminology, and maintenance.
- `1` is the entry point, project map, and implementation direction.
- `2` records durable milestones and approved direction changes.
- `3` is the normative player-facing gameplay specification.
- `4` defines engineering contracts and implementation boundaries.
- `5` owns patient-library integration and clinical safeguards.
- `6` owns production artwork, placement, and acceptance.
- `7` specifies the one responsive mobile presentation and interactions.
- `8` provides state shapes, action semantics, algorithms, and code hints.
- `9` is the ordered implementation and acceptance-test plan.
- `99` is the tactical continuation note for the next assisted session.

## Requirement language

- **Must**, **shall**, and **required** identify approved behavior.
- **Should** identifies implementation guidance that may change only if the
  documented outcome remains intact.
- If runtime behavior disagrees with a newer current requirement, the current
  requirement wins and the runtime enters the implementation backlog.
- No current requirement remains provisional unless it is explicitly labeled
  an open decision or TODO.

## Authority order

When current sources disagree, use this order:

1. Approved behavior in `3-gameplay-rules-and-specs.md`.
2. UI and engineering contracts in documents `4`, `7`, and `8`.
3. Patient and asset ownership in documents `5` and `6`.
4. The implementation and acceptance sequence in document `9`.
5. Current implementation behavior where the numbered documents are silent.
6. Historical files only for rationale, never as present requirements.

## Maintenance rules

- Keep filenames `0` through `6` stable. Add numbered references only when
  they remove material ambiguity rather than duplicate existing prose.
- Put a last-modified date and short latest-change summary at the top of every
  current numbered document.
- Before materially revising a numbered document, preserve the outgoing version
  in its matching archive folder with a timestamped name.
- State each rule once in its natural owner and link to it elsewhere.
- Do not list superseded application folders, discarded assets, or obsolete
  runtime behavior in live specifications.
- Once accepted behavior is implemented and verified, update both runtime and
  documentation together for every later design change.

## Sources of truth outside this folder

- `patient-data/schema/patient-schema-notes.md` is the complete patient schema.
- `patient-data/schema/patient-schema-template.json` is its structural example.
- `patient-data/schema/schema-support-files/` owns validators and vital bands.
- `patient-data/patient-json/` and `patient-data/patient-images/` own patients.
- `triageRush/assets/` owns production artwork.
- `_testAppMobile/` is the near-term implementation and verification target;
  it must be revised to conform before production transfer.
