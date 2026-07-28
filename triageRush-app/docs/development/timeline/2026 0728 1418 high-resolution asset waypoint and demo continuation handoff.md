# High-Resolution Asset Waypoint and Demo Continuation Handoff

Date: 2026-07-28

This document records the current project state after the high-resolution
artwork pass. It supersedes the 2026-07-27 continuation handoff for current
asset names and immediate next work. Earlier timeline entries remain useful
for design history and gameplay decisions.

## Current direction

triageRush is intended to use one shared high-resolution artwork set for both
mobile and desktop presentation. Separate mobile and desktop copies of the
same visual assets should not be maintained.

The next development phase is:

1. Recreate the demo mobile game using the new production assets.
2. Create a demo desktop game using the same production assets.

Both demos should express the same game and shared underlying behavior while
looking natural on their respective platforms. The desktop demo is not merely
a scaled-up mobile layout. Desktop may also offer the actual mobile
presentation for testing and debugging by serving the mobile implementation
directly; the exact mechanism remains to be discussed.

The existing `_testApp/` is still a reference/demo implementation. Its old
assets were deliberately excluded from this high-resolution replacement pass.

## Active production artwork

### Rooms panel

`triageRush-app/assets/rooms-panel/backgrounds/` contains eight opaque
production backgrounds:

- Five ESI room interiors
- One psych room interior
- One discharge-room background
- One shared wall background

The ESI and psych backgrounds are `1152 x 1792`. The wall and discharge
backgrounds are `1777 x 1792`.

`triageRush-app/assets/rooms-panel/doors/` contains 14 production door images:

- Closed and open signed doors for ESI 1 through ESI 5
- Closed and open signed psych doors
- Closed and open discharge doors

The ESI and psych door canvases are `1152 x 1792`, exactly matching their
room-interior canvases for layering. The discharge doors are `1777 x 1792`,
matching the full-cell wall and discharge background dimensions.

The discharge open and closed variants use the same larger glass-door frame
geometry. Superseded small doors, old prototypes, and old room interiors were
removed from the active tree.

Only signed high-resolution ESI and psych variants are currently active.
Whether unsigned variants are actually needed remains an open decision.

### Waiting-room panel

`triageRush-app/assets/waiting-room-panel/backgrounds/` contains 16 accepted
opaque waiting-room backgrounds:

- `waiting-room-background-1-hires.png` through
  `waiting-room-background-16-hires.png`

Every image is `1777 x 2509`, preserving the former waiting-room `17:24`
aspect ratio while matching the rooms-panel wall background width.

The artwork retains the waiting room's warm walls and varied green/teal trim.
The floor/wall junction was moved slightly upward, and furniture and signs
were arranged to leave useful central space for a separately layered patient.
The former small waiting-room images were removed from the active tree.

### Patient panel

`triageRush-app/assets/patient-panel/backgrounds/` contains five accepted
assets:

| Asset | Dimensions | Format |
|---|---:|---|
| `patient-panel-background-hires.png` | `906 x 2520` | Opaque RGB |
| `patient-panel-name-bubble-hires.png` | `368 x 92` | Transparent RGBA |
| `patient-panel-quote-bubble-hires.png` | `764 x 227` | Transparent RGBA |
| `patient-panel-vitals-bubble-hires.png` | `810 x 351` | Transparent RGBA |
| `patient-panel-clipboard-bubble-hires.png` | `809 x 375` | Transparent RGBA |

Patient names, quotations, vital values, and presentation text remain runtime
UI content and must not be baked into these images. The former small
patient-panel files were removed from the active tree.

### Patient images and data

`patient-data/patient-images/` contains 160 canonical patient images. All are
`1024 x 1024` transparent PNGs. The folder was cleaned and normalized, and the
approved replacements for patients 026, 055, and 100 now use their canonical
filenames rather than `-new` filenames.

The corresponding JSON records for patients 026, 055, and 100 were corrected
to reference the canonical image filenames. All patient JSON files currently
parse successfully.

## Local safety copy

Before the size-redesign work, the user copied the former active asset tree to
`triageRush-app/assets - before size redo/`. Treat this as a read-only local
safety copy. Do not restore its small artwork into the active asset tree unless
the user explicitly requests it.

## Other future artwork

The active `icons/`, `ui/`, and `sounds/` asset folders are still placeholders.
Potential later work includes:

- Expanded patient-information clipboard artwork
- HOME-screen emergency-entrance artwork and grooved sidewalk menu signs
- Final icons and audiovisual feedback assets
- Possible unsigned ESI and psych door variants, if a real use is identified

Do not design the HOME-screen artwork yet; its visual concept is noted but was
deliberately deferred.

## Future production considerations already recorded

See the separate future-considerations timeline entry for:

- Natural mobile and desktop presentations from shared product logic
- Possible explicit/stateful program organization
- Desktop-only patient editor/browser
- HOME-screen mode, tolerance, timer, player-name, title, start, help, about,
  and desktop/mobile-presentation choices
- Strict, normal, and lenient acceptable-door behavior

The scoring consequences of those tolerance modes still require discussion.

## Immediate continuation checklist

1. Inventory the current `_testApp/` behavior without treating its old artwork
   as production assets.
2. Define where the recreated mobile demo will live and whether `_testApp/`
   will be replaced, retained, or supplemented.
3. Wire the new waiting-room, patient-panel, room-background, and door layers
   into the mobile demo.
4. Verify all open-door layering with room interior, patient, foreground door,
   and UI feedback.
5. Create a desktop demo using the same asset files and shared game behavior,
   with a layout designed specifically for a normal HD desktop viewport.
6. Test the desktop option that presents the actual mobile implementation for
   debugging.
7. Keep the production implementation separate from the standalone patient
   CRUD application except for intentional shared patient data.

## Validation at this waypoint

- Active room backgrounds: 8 PNG files
- Active room doors: 14 PNG files
- Active waiting-room backgrounds: 16 PNG files
- Active patient-panel assets: 5 PNG files
- Canonical patient images: 160 PNG files, all `1024 x 1024`
- Patient JSON parse failures: 0

