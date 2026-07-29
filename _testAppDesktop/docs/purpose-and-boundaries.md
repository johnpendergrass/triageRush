# Purpose and Boundaries

## Purpose

`_testAppDesktop` is the independent desktop pre-production test app for
triageRush. John will lead the product design by describing:

- The desktop screen composition
- Look, feel, and visual hierarchy
- Player controls and available actions
- How information is arranged
- How desktop behavior differs from mobile

Codex will translate those decisions into a working demo, explain unfamiliar
program structure, and keep the implementation understandable enough to
evaluate and revise.

The completed desktop and mobile demos will be final design tests. Their
purpose is to settle each presentation before production application coding
begins.

## Isolation from the mobile demo

The desktop and mobile demos are intentionally independent during this phase.

The desktop demo owns:

- Its own `index.html`
- Its own `styles.css`
- Its own `app.js`
- Its own `assets.js`
- Its own copied runtime artwork
- Its own copied patient JSON and images
- Its own server launcher

It must not import runtime code or files from `_testAppMobile`,
`triageRush-app`, or the repository-level `patient-data`.

Duplication is deliberate. It allows the desktop interface to develop
naturally without forcing it into the mobile layout or prematurely extracting
shared production code.

## Server

Run:

```text
start-desktop-preview.bat
```

Then open:

```text
http://localhost:8081
```

The mobile test server uses port `8080`, so both test apps can run
simultaneously.

## Current status

The desktop app is still a placeholder screen. No waiting-room, patient-panel,
room, door, scoring, or Coach interface has been built yet. This is
intentional: the desktop design will be developed from John's specifications
rather than copied from the mobile implementation.

