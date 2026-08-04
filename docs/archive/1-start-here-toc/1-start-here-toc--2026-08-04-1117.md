# Start Here: Current Project Map

**Last modified:** 2026-08-03

**Changes from the previous version:** Marked the self-contained mobile game as
the verified behavioral reference and updated production priorities after the
accepted timing, scoring, sound, header, countdown, and review refinements.

## Current milestone

The demo-design phase is substantially complete. `_testAppMobile/` is now a
self-contained and verified game reference using all 160 schema 2.2 patients
and the current game-page artwork. Its accepted behavior is specified in
[Gameplay rules and specifications](3-gameplay-rules-and-specs.md).

The next major phase is to build the actual responsive application under
`triageRush/`. Production must load canonical assets and patient data from their
owned locations; it must not depend on the mobile demo's private copies.

## Read in this order

1. [Gameplay rules and specifications](3-gameplay-rules-and-specs.md) defines
   the two modes, scoring, queue behavior, Coach, Shift Review, and HOME
   settings.
2. [Coding contracts and specifications](4-coding-contracts-and-specs.md)
   defines state, responsive structure, data loading, persistence, and
   verification.
3. [Patient data information](5-patient-data-info.md) explains the schema 2.2
   library and links to its authoritative contract and validators.
4. [Asset organization and specifications](6-asset-organization-and-specs.md)
   inventories the production artwork and records placement rules.
5. [Development history](2-dev-history.md) explains how the present direction
   was reached.
6. The current
   [AI handoff](99-ai-handoff--2026-08-03-1119.md) records tactical
   continuation details.

## Repository map

```text
triageRush/
|-- triageRush/                  production application and runtime assets
|-- patient-data/                authoritative patient JSON and portraits
|-- _testAppMobile/              temporary mobile gameplay reference
|-- _testAppDesktop/             temporary desktop reference
|-- _testAppHomeScreen/          temporary HOME and sound reference
|-- ___patient-CRUD (standalone)/ future independent patient editor
|-- docs/                        current numbered documentation
`-- docs/archive/                historical material
```

## Immediate priorities

1. Preserve the accepted `_testAppMobile/` checkpoint as the behavioral
   reference while production is built.
2. Establish the production application shell and centralized asset and patient
   manifests.
3. Implement one lightweight application state shared by all responsive views.
4. Transfer the accepted Triage loop, scoring, detailed charts, and first-choice
   accounting from the mobile reference.
5. Transfer Shift Review, scoring formulas, and the Patients Seen chart wrapper.
6. Transfer the synchronized RUSH arrival curves, live waiting penalty, sounds,
   full-queue shake, and final countdown behavior.
7. Integrate the HOME lobby, settings boards, registered door overlays, and
   streaming-audio controls.
8. Repair `_testAppHomeScreen/` only if the standalone HOME reference is still
   needed; otherwise use its accepted visuals directly during production work.

## Important current cautions

- Triage and TriageRUSH replace the older GAME and EDU terminology.
- Strict and Forgiving replace the older three-mode scoring design. Tolerant is
  historical.
- Use `shift`, not `round`, in current player-facing language.
- Do not reveal the correct room after a wrong or close choice; retain feedback
  on the selected room only.
- The complete patient schema contract remains beside the data and should not
  be duplicated into application documentation.
- Demo folders are references, not production ownership. Remove them only after
  accepted behavior has been transferred and verified.
