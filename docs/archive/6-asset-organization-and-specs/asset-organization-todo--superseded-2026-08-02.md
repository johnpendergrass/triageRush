# TODO: Finalize production asset organization

**Status:** Proposed for review before production development

## Decision to revisit

The production game has a deliberately limited scope, substantially represented
by the existing demo applications. Prefer a small, flat asset structure over a
deep screen-and-component hierarchy.

Proposed high-level folders:

```text
triageRush/assets/
├── backgrounds/
├── overlays/
├── popups/
├── icons/
└── audio/
```

Add another category only when a real production asset requires it. Do not use
an `other` folder.

## Proposed filename convention

Use descriptive filenames in this order:

```text
<context>-<component>-<state-or-variant>.<extension>
```

Examples:

```text
backgrounds/home-panel-background.png
backgrounds/game-patient-panel-background.png
backgrounds/game-room-esi-1-background.png
backgrounds/game-waiting-room-01-background.png

overlays/home-panel-start-shift-overlay.png
overlays/game-patient-name-overlay.png
overlays/game-room-esi-1-door-closed-overlay.png
overlays/game-room-esi-1-door-open-overlay.png

popups/home-about-popup.png
popups/home-player-settings-popup.png
popups/home-shift-settings-popup.png
```

## Working rules

- Use `home`, `game`, `review`, or `shared` in filenames when ownership is not
  otherwise obvious.
- Use zero-padded numbered variants such as `waiting-room-01` through
  `waiting-room-16`.
- Treat the selected production asset as canonical; omit `hires` from its name.
- Do not embed dimensions in filenames unless dimensions distinguish two
  intentionally supported variants.
- Use `background` for a base canvas and `overlay` for a registered or
  transparent layer placed over it.
- Keep `popup` as a useful game-specific category even though a popup may
  technically be composited as an overlay.
- Keep patient portraits in `patient-data/patient-images/`.
- Keep obsolete and exploratory artwork outside the production asset tree.
- Preserve the demo applications while production development is underway;
  update their references only as part of an agreed asset migration.

## Before applying the reorganization

1. Review the proposed categories and filenames with John.
2. Map every current asset to its proposed destination and name.
3. Resolve the duplicate HOME settings-board assets.
4. Confirm whether the differing closed-door alpha behavior is intentional.
5. Rename and move the production files in one controlled change.
6. Update all affected demo, documentation, and production references.
7. Verify each demo and screen after the migration.

