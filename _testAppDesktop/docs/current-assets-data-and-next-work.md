# Current Assets, Data, and Next Work

## High-resolution artwork

The desktop `assets/` folder is an independent, byte-for-byte copy of
`triageRush-app/assets/` at the time of the migration.

It contains:

- 16 waiting-room backgrounds
- Five patient-panel assets
- Five ESI room backgrounds
- Psych room background
- Discharge room background
- Shared rooms-panel wall background
- Closed and open doors for ESI 1 through ESI 5
- Closed and open psych doors
- Closed and open discharge doors
- Placeholder icon, UI, and sound folders

The desktop app must use its local copies. It must not reference the production
asset folder at runtime.

## Asset manifest

`assets.js` keeps the runtime paths in one place. It currently catalogs:

- Patient JSON and image locations
- All waiting-room backgrounds
- Patient-panel background and overlay images
- Shared room-wall background
- Closed door, open door, and interior for all seven destinations

This does not share assets with mobile. `_testAppDesktop/assets.js` and
`_testAppMobile/assets.js` are independent files.

The purpose of the manifest is modest: if an asset is renamed or moved, its
path can be corrected in one obvious place instead of being scattered
throughout rendering code.

## Test patient data

The desktop demo contains its own:

```text
patient-data/
├── json/
└── images/
```

The active demo rotation uses ten self-contained historical draft records,
`patient-001.json` through `patient-010.json`. Their former repository-level
experimental source folder was removed when schema 2.2 became canonical. The
desktop fixtures remain local to this disposable demo, and the original
production patient records remain unchanged.

Every active JSON file has its corresponding local image. Additional older
snapshot files remain in the folder but are not loaded by the current demo.

The demo must not fetch patient data from the repository-level
`patient-data/` folder at runtime.

## Current code files

| File | Current purpose |
|---|---|
| `index.html` | Responsive game structure and hospital-chart Coach markup |
| `styles.css` | Responsive game and Coach-chart styling |
| `app.js` | Demo gameplay, draft-schema loading, and Coach rendering |
| `assets.js` | Local asset-path manifest |
| `start-desktop-preview.bat` | Independent port-8081 preview server |

## Next work

John will specify the desktop game presentation and behavior. The recommended
working sequence is:

1. Define the normal desktop game-screen geometry.
2. Define what is visible before a patient is selected.
3. Build the main semantic HTML regions.
4. Establish the initial named phase and render it.
5. Add waiting-room patient selection.
6. Add the patient panel and its layered high-resolution artwork.
7. Prototype one treatment room with full interior/patient/door layering.
8. Apply the proven room structure to the remaining destinations.
9. Refine the Coach chart and reuse its structure for future patient review.
10. Use the completed demo to settle the desktop design before production
    coding begins.

The Coach chart's current design, behavior, data mapping, and Patient Review
reuse rules are recorded in `coach-and-patient-review-panel.md`. The design is
accepted as the working pattern except for final vital-value alignment.

Do not copy the mobile layout or mobile source code into the desktop app. The
approved artwork may be the same, but its desktop composition should be
designed intentionally.

