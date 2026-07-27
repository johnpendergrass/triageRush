# triageRush — Implementation Status

**Last verified:** 2026-07-26 19:40 PDT

**Status:** Revised seven-choice edu-game direction documented; interactive
design prototype implemented; production implementation not started

## Repository direction

- `main` is the official path for the revised triageRush concept.
- Git tag `v1` preserves the original five-room concept.
- Git tag `v2` preserves the first seven-choice Game/Edu prototype milestone.
- The v1 canonical documents are archived under
  `docs/archive/v1-original-concept-single-source-of-truth/`.
- The comprehensive v2 handoff is
  `docs/DESIGN/2026 0726 1940 v2 first edu-game prototype project handoff.md`.
- No second repository or fork is planned.

## Implemented operational assets and data

- 160 patient JSON records.
- 160 primary patient images.
- Existing exact ESI values from 1 through 5.
- Existing v1 Psych and Discharge exceptions.
- Existing patient schema/template.
- Archived v1 rules and artwork history.
- Selected artwork moved to `docs/DESIGN/SELECTED ARTWORK/`.
- Git/GitHub repository with `main` and version snapshots.

## Implemented interactive design prototype

The disposable prototype under `docs/DESIGN/testApp/` currently demonstrates:

- A mobile-oriented 9:16 game shell.
- Seven equal treatment choices: ESI 1–5, Psych, and Discharge.
- Closed and open artwork for all seven doors.
- Game and Edu mode controls.
- Provisional Game timer and scoring.
- Edu Correct/Acceptable/Close/Wrong tallies.
- Green/cyan/orange/red door feedback and light-green answer reveal.
- Distinct prototype sounds and textual result feedback.
- Coach locked until after a decision.
- Scrollable Coach case review with persistent Close and `MORE BELOW` cue.
- Desktop hover, keyboard focus, and mobile press-and-hold room definitions.
- Five-slot triage queue starting with an empty patient panel.
- Queue compaction and bottom-slot refill.
- True in-place queue/patient swaps.
- Room recall and first-assignment-only scoring.
- Sixteen stable patient-attached waiting-room backgrounds.
- Room-wall-matched queue framing.
- Reversible safe-viewport and safe-area mobile sizing.

The prototype uses a small hand-authored patient subset and does not modify or
load the complete operational patient library.

## Known prototype limitations

- Prototype constants and scoring are not approved production rules.
- Current Psych and Discharge Acceptable handling is an interim
  same-or-adjacent-ESI rule.
- Coach explanations are not clinically reviewed production rationales.
- Patient images cannot be composited inside open rooms because the current
  room-interior and foreground-door layers are combined.
- Some patient-panel images may overlap the complaint strip at the feet. An
  attempted layout adjustment was rolled back for later design work.
- Queue-patient scaling is restored to the original larger crop after smaller
  versions appeared undersized or disconnected from the background floor.
- Informal iPhone review has occurred, but there is no formal device matrix or
  automated browser test suite.

## Not implemented in production

- Root `index.html` remains empty.
- `triageRush-app/` does not yet contain the revised playable application.
- No production build, deployment, persistence, or release pipeline exists.
- No final scoring, round, arrival-pressure, or pacing contract exists.
- No final patient-specific evaluation table exists.
- No approved revised patient-answer/Coach schema exists.
- The 160 patient records have not been migrated to seven-choice answers.
- No production accessibility audit or clinical content review is complete.

## Transition constraints

- Do not build the archived five-door routing model as the new target.
- Do not migrate patient answers until the detailed Close/Wrong and
  Psych/Discharge Acceptable tables are confirmed.
- Do not treat prototype score values or Coach copy as approved requirements.
- Do not reveal Coach information before the player commits to a decision.
- Do not fill undecided rules by copying archived v1 specifications.
- Keep the prototype isolated until the production architecture is selected.

## Next development sequence

1. Resolve exact Correct/Acceptable/Close/Wrong evaluation rules.
2. Replace the interim Psych and Discharge rule with a reviewed
   patient-specific evaluation table.
3. Resolve dangerous under-triage handling, especially for ESI 1.
4. Confirm Game scoring, timer, rounds, arrivals, and pacing.
5. Approve the revised patient-answer and Coach schema.
6. Clinically review and migrate the patient library.
7. Decide the production architecture under `triageRush-app/`.
8. Separate room interior and door foreground artwork if in-room patient
   compositing remains desired.
9. Resolve patient-panel complaint overlap and final queue-patient framing.
10. Add accessibility, automated interaction tests, and representative mobile
    viewport checks.
11. Begin production implementation.

## Documentation rule during redesign

Design discussion may continue in timestamped notes. Once the user confirms a
rule, update the relevant active document in this folder before implementing
it. Archived v1 files must remain unchanged.

The previous original-concept status report is available in the
[archived v1 implementation document](../archive/v1-original-concept-single-source-of-truth/implementation-status.md).
