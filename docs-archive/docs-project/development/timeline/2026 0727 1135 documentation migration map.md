# Documentation Migration Map

**Recorded:** 2026-07-27 11:35 PDT

## Purpose

This record explains how the former mixed `docs/` tree was classified under
the new ownership-first documentation structure. The old tree remained in
place while these copies were made.

## Project-wide documentation

| Former source | New owner |
|---|---|
| `docs/archive/v1-original-concept-single-source-of-truth/` | `docs-project/development/archive/original-five-room-concept/` |
| `docs/claude-john-docs/` | `docs-project/development/archive/collaboration-notes/` |
| Seven-room repository migration decision | `docs-project/development/timeline/` |
| Repository ownership and documentation conventions | `docs-project/technical/` |

## triageRush development documentation

| Former source | New owner |
|---|---|
| Dated notes and handoffs under `docs/DESIGN/` | `triageRush-app/docs/development/timeline/` |
| `docs/DESIGN/REFINING IMAGES/` | `triageRush-app/docs/development/artwork/iterations/` |
| `docs/DESIGN/SELECTED ARTWORK/` | `triageRush-app/docs/development/artwork/selected-reference/` |

Ambiguous dated filenames were clarified while retaining their date and time
prefixes. Artwork filenames were retained because their chronological suffixes
and descriptions already record the iteration sequence.

## triageRush technical documentation

The former `docs/singleSourceOfTruth/` set and the mobile viewport contract were
copied into:

`triageRush-app/docs/technical/transition-reference/`

They are deliberately labeled transition references. They contain useful
decisions but still include provisional rules, old paths, and transition-era
status. New focused production contracts must replace them after review.

## Material handled elsewhere

- The interactive prototype was preserved separately at `new/testApp/`; it was
  not duplicated inside documentation.
- Final patient JSON and images moved to `new/patient-data/`.
- Patient anchor images and the schema moved to
  `new/patient-CRUD-app (standalone)/`.
- Former documentation landing pages were replaced by new ownership indexes
  rather than copied as competing authorities.
