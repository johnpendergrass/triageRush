# Start Here: Current Project Map

**Last modified:** 2026-08-02

**Changes from the previous version:** Replaced the old specification table of
contents with a production-development entry point and current priority list.

## Current milestone

The demo-design phase is substantially complete. The next major phase is to
build the actual responsive application under `triageRush/`, using the mobile,
desktop, and HOME demos as behavioral and visual references.

The production asset tree has been reorganized around `game-page/` and
`lobby-page/`. The demos still need their asset references reconciled before or
alongside production work.

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
   [AI handoff](99-ai-handoff--2026-08-02-1457.md) records tactical
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

1. Reconcile `_testAppMobile/` and `_testAppHomeScreen/` with the reorganized
   production asset names and folders.
2. Establish the production application shell and centralized asset and patient
   manifests.
3. Implement one lightweight application state shared by all responsive views.
4. Transfer the accepted Triage-mode loop from the mobile demo.
5. Integrate the HOME lobby, settings boards, registered door overlays, and
   sound controls.
6. Implement Shift Review and the reusable detailed-patient chart contexts.
7. Implement and tune TriageRUSH only after its provisional pacing and numeric
   scoring values are confirmed.

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
