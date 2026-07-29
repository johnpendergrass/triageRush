# triageRush Responsive Test App

This folder contains a complete, self-contained responsive triageRush demo.
It uses one gameplay implementation and two fluid presentation modes:

- A wide layout for desktop, laptop, and landscape-tablet viewports
- The established compact mobile layout when the viewport can no longer
  support three comfortably sized panels

No runtime file is loaded from `_testAppMobile`, `triageRush-app`, or the
repository-level patient-data folder.

## Run the demo

Run:

```text
start-desktop-preview.bat
```

Then open:

```text
http://localhost:8081
```

The demo supports mouse, touch, stylus, and trackpad pointer interaction. No
keyboard interaction is required.

## Responsive behavior

At wide viewport sizes, the same top/middle/bottom hierarchy is retained:

1. Header with branding, mode switch, score/timer, and sound
2. Waiting room, patient presentation, and treatment-room panels
3. Selection, Coach, and reset controls

The wide presentation gives the patient stage and clinical information more
room, presents the waiting queue as a two-column scene, and arranges the seven
treatment destinations in a more spacious room grid.

When the viewport is narrower than the safe wide-layout threshold, or is too
portrait-oriented, the game returns to the compact 9:16 composition. This is
a layout change only; gameplay state, data, controls, and interaction rules are
the same.

This README is operational documentation for the temporary demo. The
authoritative production decisions are stored under `triageRush-app/docs/` so
they survive removal of the test apps.
