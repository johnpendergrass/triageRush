# triageRush Production-Start Handoff

**Current version:** 2026-07-29 18:24 PDT

**Repository milestone:** `v4` — `triageRush game start actual development`

**Milestone commit:** `ffa73b9 Start actual triageRush development`

## Where the project stands

The demo-design phase is complete. `_testAppMobile/` and `_testAppDesktop/`
remain temporary, self-contained visual and behavioral references. Production
development now belongs in `triageRush/`.

The repository has been simplified:

```text
triageRush/
├── docs/
├── docs-archive/
├── triageRush/
├── patient-data/
├── patient-CRUD (standalone)/
├── _testAppMobile/
├── _testAppDesktop/
└── index.html
```

The current documentation under `docs/` is authoritative. Material under
`docs-archive/` is historical and must not override current specifications.

## Start here

Read in this order:

1. [UI and responsive specification](ui-specification--2026-07-29-1655.md)
2. [Gameplay specification](gameplay-specification--2026-07-29-1655.md)
3. [Scoring specification](scoring-specification--2026-07-29-1655.md)
4. [Patient data and assets](patient-data-and-assets--2026-07-29-1655.md)
5. [Implementation reference](implementation-reference--2026-07-29-1655.md)

Use [the documentation TOC](readme-TOC.md) for descriptions and archive
navigation.

## Settled product direction

- Build one responsive game, not separate mobile and desktop products.
- Preserve the mobile-derived game composition at every size:
  one-column queue, central patient panel, and one-column seven-room rail.
- Keep the game horizontally centered and primarily responsive to browser
  height.
- Use symmetrical optional HOME and STATS regions on sufficiently wide
  screens without shifting the game.
- At compact sizes, HOME, GAME, and STATS are separate full-frame views.
- Use `<-- HOME`, `COACH`, and `STATS -->` as the game footer.
- Use pointer-first interaction for mouse, touch, pen, and trackpad.
- Use local persistence only; no server or network leaderboard is required.
- Use Strict, Tolerant, and Forgiving scoring.

## Authoritative data and assets

- `patient-data/` contains 160 patient JSON records and 160 final images.
- Production must load patient data rather than embed demo patient objects.
- The operational schema remains under `patient-data/schema/`.
- `triageRush/assets/` contains 50 production asset files.
- `patient-CRUD (standalone)/anchor-images/` contains 15 artwork references.
- Patient CRUD remains conceptual and independent of the game.

## Recommended first implementation slice

Do not begin by copying an entire demo into production. Establish the
production foundation deliberately:

1. Audit the placeholder `triageRush/app.js` and `styles.css`.
2. Define a small application-state object and storage version.
3. Add centralized patient and artwork manifests.
4. Load and validate the patient store.
5. Implement stored randomized patient traversal.
6. Build the centered, height-responsive game shell.
7. Render the empty queue, patient, and room regions using production assets.
8. Verify the shell on the iPhone 16 Pro reference viewport and representative
   phone, tablet, laptop, and desktop sizes.

Only after that foundation is stable should queue interactions, assignment,
scoring, recall, Coach, HOME, and STATS be added.

## Suggested state domains

One lightweight state should cover:

- Active compact screen
- Wide HOME/STATS panel visibility
- Settings and pending restart changes
- Randomized patient order and current position
- Five-patient waiting queue
- Current patient
- Open room and recallable assignment
- Score and outcome totals
- Minimal session data needed by Stats
- Timer
- Coach and modal visibility
- Storage version

Start with direct actions and render functions. Do not introduce a state
machine framework unless demonstrated complexity requires one.

## Important interaction requirements

- Queue cells select and swap patients; there is no SWITCH footer button.
- The patient image opens a larger modal.
- The triage note opens a full patient-summary modal.
- Coach and expanded content may scroll internally.
- Scrollable panels anchor their close control and show `MORE BELOW` when
  needed.
- An assigned room stays open while the center panel is empty.
- The open room may recall its assigned patient.
- Selecting another patient closes the previously open room.
- Stats updates immediately from shared state while open and continues
  accumulating while closed.
- Gameplay-affecting settings require explicit `APPLY & RESTART`.

## Unresolved decisions

Do not silently invent permanent answers for:

- Final name for Tolerant scoring
- Exact responsive dimensions and breakpoints
- Complete HOME hierarchy
- Exact Stats contents
- GAME/EDU differences
- Timer and round-end behavior
- Rush mode
- Recall/reassignment scoring and statistics
- Touch access to room education
- Numeric points and bonuses
- Final clinical Coach language

Make a reasonable prototype when needed, label the decision provisional, and
update the appropriate current specification when John approves it.

## Documentation workflow

Current specifications use purpose-first timestamped filenames. When one
changes:

1. Move the outgoing version to `docs-archive/`.
2. Save the revised current version in `docs/` with a new timestamp.
3. Preserve its purpose prefix.
4. Update its change history.

Update `docs/README.md` only when document purposes or workflow change.
Update `docs/readme-TOC.md` when the current file set changes.

## Last verified baseline

At the `v4` milestone:

- Working tree was clean.
- `main` and tag `v4` were pushed.
- All 160 patient JSON records parsed.
- All 160 patient images existed.
- All renamed anchor-image references resolved.
- Current Markdown links resolved.
- Old live folder references were removed.
- Root `index.html`, `triageRush/styles.css`, and `triageRush/app.js` returned
  successfully from a loopback-only local preview.

## Immediate next action

Begin with a read-only audit of the production placeholder and define the
smallest first production implementation slice. Keep the test apps unchanged
as references until production behavior has been compared and accepted.

## Change history

- **2026-07-29 18:24 PDT:** Recorded the production-start handoff immediately
  after the `v4` restructuring milestone.
