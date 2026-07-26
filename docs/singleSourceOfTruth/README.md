# triageRush — Single Source of Truth

**Last reviewed:** 2026-07-25 15:24 PDT  
**Status:** Canonical project documentation

Start here before changing game behavior, patient data, interface geometry, or
production artwork.

## Canonical documents

| Subject | Canonical owner |
|---|---|
| Gameplay behavior, destinations, scoring interpretation, and room rules | [gameplay-rules.md](gameplay-rules.md) |
| Patient-data locations, field meanings, authoring, and validation | [patient-data.md](patient-data.md) |
| Mobile viewport, layout geometry, visual layers, and artwork use | [interface-and-layout.md](interface-and-layout.md) |
| What exists now, known gaps, and the next implementation work | [implementation-status.md](implementation-status.md) |
| Exact patient JSON structure | [patient-schema.json](../../patientsCRUD-app/patient-data/docs/patient-schema.json) |

Each fact should have one owner. Other documents should link to that owner
instead of copying and independently maintaining the same rule.

## Operational sources outside this folder

These files stay near the applications that consume or maintain them:

| Content | Authoritative location |
|---|---|
| Patient schema/template | `patientsCRUD-app/patient-data/docs/patient-schema.json` |
| Patient JSON records | `patientsCRUD-app/patient-data/patient-json/` |
| Patient images | `patientsCRUD-app/patient-data/patient-images/` |
| Current selected artwork | `docs/DESIGN/REFINING IMAGES/SELECTED ARTWORK/` |

The `SELECTED ARTWORK` folder is the current visual authority, but the user may
change that selection later.

## Precedence when information conflicts

Use this order:

1. The user's latest explicit decision.
2. The exact operational source for the subject:
   `patient-schema.json`, an individual patient JSON record, or a selected
   artwork file.
3. The subject-owning document in this folder.
4. Older design notes, session summaries, prototypes, and specifications.

If an operational source and its canonical explanatory document disagree, stop
and reconcile them rather than silently choosing one.

## Historical and working material

The following areas are useful history but are not current implementation
authority:

- `docs/DESIGN/`
- `docs/claude-john-docs/`
- Timestamped session summaries
- Earlier layout mockups outside `SELECTED ARTWORK`
- The July 19 ESI/room note

In particular, ignore older models that treat Psych and Discharge as ESI 6 and
7, or map both ESI 1 and 2 to Resus. The current room contract is owned by
[gameplay-rules.md](gameplay-rules.md).

## Documentation maintenance rule

When a decision changes:

1. Update the operational source when the change affects data or assets.
2. Update the one canonical document that owns the rule.
3. Update `implementation-status.md` if the repository state changed.
4. Change the relevant `Last reviewed` timestamp.
5. Do not rewrite historical notes merely to make them appear current.

