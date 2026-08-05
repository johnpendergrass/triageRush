# triageRush — specifications (pointer file)

**Last modified:** 2026-08-05

## Where the real specifications live

This project keeps its full design/gameplay specification in the numbered
`docs/` set — do NOT duplicate it here:

- `docs/3-gameplay-rules-and-specs.md` — rules, scoring, evaluation order
- `docs/7-mobile-ui-and-interaction-spec.md` — 9:16 shell, screens, input
- `docs/4-coding-contracts-and-specs.md` — architecture contracts
- `docs/8-implementation-blueprint.md` — state shape, actions, algorithms
- `docs/9-implementation-plan-and-acceptance.md` — phase order + tests
- `docs/_2026-0804 design changes...md` — amendments layer over docs 3-9

Read `docs/1-start-here-toc.md` first; historical files never override
the numbered set.

## Design decisions made after the last doc revision (not yet swept in)

The authoritative sweep list lives in the current
`Claude-ToBe-Continued-*.MD` ("Doc sweep list"). Headlines:

- The evaluation/Coach overlay is being renamed **Chart** (player concept:
  the panel IS the patient's chart; tapping zooms it).
- Footer actions: **QUIT THIS SHIFT** (discard → ER Entrance) and
  **END SHIFT EARLY** (finalize → review); both confirm.
- Chart overlay: no PRESENTATION header (cards always visible); ANSWER
  locked with shake; CLINICAL remembered per shift; CSS-drawn clipboard.
- Photo zoom lightbox in the chart overlay: full-photo hit box with 🔍
  badge, dark scrim over the whole clipboard, 3:5 photo card, 30% zoom,
  crops sides only.
- Opening screen is **ER ENTRANCE**; recall plays C5+E5; flat green
  behind the rails; room wall/interior PNGs reserved for future layered
  room rendering (wall → interior → patient → door).
