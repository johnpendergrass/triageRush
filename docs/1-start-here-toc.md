# Start Here: Current Project Map

**Last modified:** 2026-08-04

**Latest change:** Incorporated the approved recall, Coach, timing, sound,
title, RUSH-arrival, door-art, and single-presentation decisions and added
rebuild-level UI, algorithm, and acceptance documents.

## Current milestone

The current documentation defines the intended application in enough detail to
rebuild the mobile experience without reverse-engineering an older design.
`_testAppMobile/` is the next implementation target, but it must not be
changed until John accepts the revised documentation.

After the mobile implementation conforms and passes the acceptance matrix, the
same behavior can be transferred to production under `triageRush/`.

## Read in this order

1. [Gameplay rules and specifications](3-gameplay-rules-and-specs.md) defines
   the complete player experience and approved game rules.
2. [Mobile UI and interaction specification](7-mobile-ui-and-interaction-spec.md)
   defines the single 9:16 presentation, screen composition, and input behavior.
3. [Coding contracts and specifications](4-coding-contracts-and-specs.md)
   defines architecture, state ownership, timing, persistence, and accessibility.
4. [Implementation blueprint](8-implementation-blueprint.md) translates the
   requirements into concrete state, actions, algorithms, modules, and effects.
5. [Implementation plan and acceptance](9-implementation-plan-and-acceptance.md)
   gives the build order, parity gates, and complete test matrix.
6. [Patient data information](5-patient-data-info.md) explains schema 2.2 and
   its application boundary.
7. [Asset organization and specifications](6-asset-organization-and-specs.md)
   inventories accepted production artwork and placement rules.
8. [Development history](2-dev-history.md) explains the present direction.
9. The current `99-ai-handoff--*.md` records tactical continuation details.

## Forward repository map

```text
triageRush/
|-- index.html                    site entry point
|-- triageRush/                   production application and runtime artwork
|-- patient-data/                 authoritative patient JSON and portraits
|-- _testAppMobile/               mobile implementation and verification target
|-- ___patient-CRUD (standalone)/ future independent patient editor
|-- docs/                         current numbered documentation
`-- docs/archive/                 historical documentation only
```

## Approved 2026-08-04 direction

- One patient contributes one replaceable scoring result. If recalled and
  reassigned, the new room replaces the earlier room, points, outcome, and
  triage direction.
- Coach is available exactly while a patient occupies the patient panel.
- Tapping anywhere on the occupied patient panel opens Coach. There is no
  separate Coach footer button.
- Coach keeps Answer locked during active evaluation and remembers the Clinical
  section's expanded/collapsed state for the rest of the shift.
- Triage offers five- and ten-minute countdowns, defaulting to five minutes.
- Successful runtime patient additions play the arrival `doink`; recalls do not.
- `Intern` is a player-title option.
- Each scheduled RUSH arrival has a 20% chance to add a two-patient burst,
  subject to the ten-patient maximum.
- RUSH adds a three-beat emphasis at every ten-second boundary before the final
  ten seconds.
- All 14 current door images in both active asset trees are accepted and readable.
- Every device uses one responsive 9:16 mobile presentation. HOME, GAME, and
  Shift Review are separate views selected by the player.

## Immediate priorities

1. Review and approve this documentation baseline.
2. Revise `_testAppMobile/` to conform to documents `3`, `7`, and `8`.
3. Run the automated and browser acceptance matrix in document `9`.
4. Transfer or align the accepted implementation under `triageRush/`, using
   canonical patients and production artwork rather than copied runtime data.

## Current cautions

- Triage and TriageRUSH are the only mode names.
- Strict and Forgiving are the only evaluation choices.
- Use `shift`, not `round`, in player-facing language.
- Never reveal the correct room through immediate Wrong or Close feedback.
- A recalled case remains one patient-seen record.
- All views preserve the same mobile composition; wide layouts do not expose
  multiple pages simultaneously.
- Historical files cannot override this numbered set.
