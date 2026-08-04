# triageRush Documentation

**Last modified:** 2026-08-02

**Changes from the previous version:** Replaced the timestamped, overlapping
specification system with a small numbered set organized around production
development.

## Purpose

This folder contains the current documentation for triageRush. The project is
small, and most intended behavior has already been demonstrated in the mobile
and HOME prototypes. These documents preserve the accepted behavior and the
contracts needed to build the real application without turning the repository
into a documentation project.

The numbered files are authoritative. Material under `archive/` is historical
and cannot override them.

## Current documents

```text
0-README.md
1-start-here-toc.md
2-dev-history.md
3-gameplay-rules-and-specs.md
4-coding-contracts-and-specs.md
5-patient-data-info.md
6-asset-organization-and-specs.md
99-ai-handoff--YYYY-MM-DD-HHMM.md
```

- `0` explains the documentation system.
- `1` is the entry point and current-project map.
- `2` records durable milestones and direction changes.
- `3` defines what the player experiences and how the game behaves.
- `4` defines how the production application should be built and verified.
- `5` summarizes the patient library and links to its canonical schema.
- `6` defines production asset ownership, layout, and placement information.
- `99` is the tactical continuation note for the next AI-assisted session.

## Maintenance rules

- Keep current filenames stable. Put the last-modified date and a short summary
  of the latest revision at the top of each file.
- Rewrite documents around their purpose; do not append session transcripts or
  copy the same rule into several files.
- Link to the authoritative owner when another document needs the same fact.
- Before materially revising a current document, preserve the outgoing version
  in the matching numbered folder under `archive/` with a timestamped name.
- Development history is curated and durable. AI handoffs are tactical and
  replaceable. Do not use one as a substitute for the other.
- Preserve historical documents rather than silently rewriting them. Use the
  archive index to explain their context.
- Once accepted prototype behavior is reproduced and verified in the production
  application, the production implementation becomes authoritative.

## Sources of truth outside this folder

- `patient-data/schema/patient-schema-notes.md` is the complete patient schema
  contract.
- `patient-data/schema/patient-schema-template.json` is its structural example.
- `patient-data/schema/schema-support-files/` owns patient validators and vital
  color bands.
- `triageRush/assets/` owns runtime game artwork.
- `patient-data/patient-images/` owns final patient portraits.
