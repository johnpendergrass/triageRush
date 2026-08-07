# Start Here: Current Project Map

**Last modified:** 2026-08-05

**Latest change:** Phase 8 folded in (2026-08-05): Shift Review, the
shift-over acknowledgement, and the Patients Seen browser. The numbered docs
describe the game as designed and built, with no separate amendment layer.

**A finite-patient-pool redesign was explored and ABANDONED on 2026-08-05.**
John chose to continue with the game as originally conceived — no patient
limits. Nothing was built and these documents were never in question. The
explored design and its decision log are in `archive/design-notes/` marked
ABANDONED, kept only so the idea is not rediscovered and re-pitched.

## Current milestone

The production application is being built under `triageRush/`. Phases 1
through 8 of document `9` are implemented: shell, HOME (ER Entrance) with
settings, queue and patient presentation, evaluation with recall and ledger
replacement, the Chart overlay, the 250ms scheduler (clock, timing sounds,
RUSH arrivals), and Shift Review with Patients Seen. Phases 1-6 are
visually approved; Phase 7 awaits John's play-through. Persistence (9) and
asset optimization (10) remain.

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
9. [Approved changes of 2026-08-05](10-approved-pending-changes.md) — ALL
   BUILT 2026-08-06 and folded into docs 3, 7, 8 and 9. Kept as the decision
   record (the "why" behind the Shift Review scoring and presentation).
10. The current `99-ai-handoff--*.md` records tactical continuation details.

## Forward repository map

```text
triageRush/
|-- index.html                    site entry point
|-- triageRush/                   production application and runtime artwork
|-- patient-data/                 authoritative patient JSON and portraits
|-- ___patient-CRUD (standalone)/ future independent patient editor
|-- docs/                         current numbered documentation
`-- docs/archive/                 historical documentation only
```

## Approved direction (2026-08-04/05)

- One patient contributes one replaceable scoring result. If recalled and
  reassigned, the new room replaces the earlier room, points, outcome, and
  triage direction.
- The panel is the patient's chart; tapping anywhere on the occupied panel
  zooms it into the Chart overlay. The Chart is available exactly while a
  patient occupies the patient panel, and there is no Chart footer button.
- The Chart keeps Answer locked during active evaluation and remembers the
  Clinical section's expanded/collapsed state for the rest of the shift.
- Triage offers five- and ten-minute countdowns, defaulting to five minutes.
- Successful runtime patient additions play the arrival `doink`; recall plays
  its own C5/E5 recall sound, never a doink.
- Sound is three settings toggles (GLOBAL, GAME SOUNDS, MUSIC) plus an in-game
  mute that governs game sounds only; the boombox is retired.
- `Intern` is a player-title option.
- Each scheduled RUSH arrival has a 20% chance to add a two-patient burst,
  subject to the ten-patient maximum.
- RUSH adds a three-beat emphasis at every ten-second boundary before the final
  ten seconds.
- All 14 current door images in both active asset trees are accepted and readable.
- Every device uses one responsive 9:16 mobile presentation. HOME, GAME, and
  Shift Review are separate views selected by the player.
- Once a shift starts, GAME has only two exits: QUIT THIS SHIFT discards the
  shift and returns to HOME (ER ENTRANCE); END SHIFT EARLY finalizes it and
  opens SHIFT REVIEW. Both confirm first.
- SHIFT REVIEW returns only to HOME. HOME never resumes an active shift; it
  edits settings and starts a new shift.
- Production code will use a small, plain HTML/CSS/JavaScript file set with
  meaning-oriented names and comments that explain intent and invariants.
- Loaded patient records retain the authoritative schema 2.2 structure.
  Queue and game state reference patients by ID instead of reshaping or
  duplicating the canonical records.
- Current high-resolution production assets remain in use during game
  implementation. Final resizing and compression happen only after CSS layout
  and maximum rendered sizes are known and approved.
- CSS owns every image's rendered geometry. Game and layout behavior must not
  depend on source-image pixel dimensions.

## Immediate priorities

1. Phases 7 and 8 PASSED John's play-through (2026-08-05): "acceptable".
2. Build the six approved items in doc `10` — the Shift Review's presentation
   (variant B) plus the scoring and direction changes decided with it.
3. Then Phase 9 (persistence and recovery).
4. At Phase 10 planning, also rework the asset-loading strategy: stage-2
   startup currently blocks READY on 160 JSON fetches plus decoding every
   manifest image; decide what blocks READY versus loads lazily.
5. After visual approval, rerun the asset audit against final CSS, approve
   representative optimized samples, then replace only the runtime copies.

## Current cautions

- "Triage!" and "Triage RUSH!" are the only mode names (2026-08-06 sign
  spelling; docs use the shorthand RUSH for the latter). The GAME's name is
  always "Triage RUSH!", in both modes.
- Strict and Forgiving are the only evaluation choices.
- Use `shift`, not `round`, in player-facing language.
- Never reveal the correct room through immediate Wrong or Close feedback.
- A recalled case remains one patient-seen record.
- All views preserve the same mobile composition; wide layouts do not expose
  multiple pages simultaneously.
- HOME and SHIFT REVIEW are terminal destinations during navigation: neither
  returns to the prior GAME.
- Historical files cannot override this numbered set.
