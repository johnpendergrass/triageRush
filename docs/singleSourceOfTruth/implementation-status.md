# triageRush — Implementation Status

**Last verified:** 2026-07-26 11:13 PDT
**Status:** Revised edu/game concept in design; implementation not started

## Repository direction

- `main` is the official path for the revised triageRush concept.
- Git tag `v1` preserves the original concept.
- The v1 canonical documents are archived under
  `docs/archive/v1-original-concept-single-source-of-truth/`.
- The detailed 2026-07-26 design discussion is retained under `docs/DESIGN/`.
- No second repository or fork is planned.

## Implemented assets and data

- 160 patient JSON records.
- 160 primary patient images.
- Existing exact ESI values from 1 through 5.
- Existing v1 Psych and Discharge exceptions.
- Existing patient schema/template.
- Existing v1 interface and selected artwork exploration.
- Git/GitHub repository with `main` and the preserved `v1` tag.

## Not implemented

- No playable production game exists.
- Root `index.html` remains empty.
- No revised seven-choice game shell exists.
- No Game/Edu mode selection exists.
- No revised scoring or outcome evaluation exists.
- No immediate pulse/audio feedback exists.
- No Coach card exists.
- No revised patient-answer schema exists.
- No patient rationales have been authored for Coach.
- No seven-choice production artwork or validated layout exists.

## Transition constraints

- Do not build the archived five-door routing model as the new target.
- Do not migrate patient answers until Close/Wrong and Psych/Discharge rules
  are confirmed.
- Do not treat v1 selected door artwork as final for seven-choice play.
- Do not reveal Coach information before the player commits to a decision.
- Do not fill undecided rules by copying older specifications.

## Next design sequence

1. Resolve exact Correct/Close/Wrong evaluation rules.
2. Resolve Psych and Discharge evaluation behavior.
3. Resolve ESI 1 under-triage handling.
4. Define Coach content and Game-mode timer behavior.
5. Define Game scoring, Edu tallies, rounds, and pacing.
6. Produce and test low-fidelity seven-choice interface alternatives.
7. Approve the revised patient-answer and Coach schema.
8. Migrate and validate the patient library.
9. Establish the revised asset plan.
10. Begin production implementation.

## Documentation rule during redesign

Design discussion may continue in timestamped notes. Once the user confirms a
rule, update the relevant active document in this folder before implementing
it. Archived v1 files must remain unchanged.

The previous status report is available in the
[archived v1 implementation document](../archive/v1-original-concept-single-source-of-truth/implementation-status.md).
