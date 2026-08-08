# Asset Organization and Specifications

**Last modified:** 2026-08-07

**Latest change:** The Music section is rewritten for LOCAL AUDIO FILES - five
anonymous, AM-filtered tracks plus the transcode pipeline that makes them
(2026-08-07). Earlier: the 2026-08-04/05 amendments - boombox retired, bubble
layers superseded by CSS-drawn chart cards, wall/interior art reserved for
future layered room rendering, and ER ENTRANCE naming.

## Ownership

- `triageRush/assets/` owns production game and HOME artwork.
- `patient-data/patient-images/` owns production patient portraits.
- Runtime code never loads artwork from `docs/` or `docs/archive/`.
- `triageRush/assets/_asset-audit-and-resize/` owns audit code, reports, trial
  outputs, and planning notes; nothing under it is a runtime asset.
- Only assets named in this document or the current runtime manifest are part of
  the forward specification.

## Production tree

```text
triageRush/assets/
|-- game-page/
|   |-- patient-panel/
|   |-- triage-rooms-panel/
|   `-- waiting-room-panel/
|-- lobby-page/
|-- audio/
|-- icons/                      empty; RESOLVED 2026-08-06: the six vital
|                               icons are inline SVG defs in index.html
|                               (no image assets needed, ever)
|-- HIRES-ORIGINAL-ART/         John's full backup of the pre-resize
|                               hi-res artwork (2026-08-06); NOT runtime
|-- patient-chart-popup/        empty: the Chart clipboard is CSS-drawn
|-- review-page/
`-- _asset-audit-and-resize/    non-runtime audit and trial workspace
```

Empty component directories are reserved ownership locations, not permission to
invent unnecessary image variants.

## Runtime manifest contract

Centralize every path in one manifest with these domains:

```text
patientData
waitingRooms
patientPanel
roomsPanel
lobby
audio
icons
review
```

Code consumes named manifest entries. Do not construct room filenames throughout
event handlers or CSS. Manifest validation runs before Start Shift becomes
available and reports the missing logical key and path.

## Game-page assets

### Waiting room

`game-page/waiting-room-panel/` contains:

```text
background-1.png through background-16.png
```

Each image is 317 x 448 (resized 2026-08-06 from the 1777 x 2509 hi-res
originals, which live in `HIRES-ORIGINAL-ART/`). A fresh background is
chosen whenever a patient enters the waiting room; it belongs to the ROW,
not the patient (2026-08-06 — it does NOT travel through swaps). Avoid a
visible duplicate while an unused alternative exists.

Empty RUSH slots may use deterministic backgrounds from the same set. Empty
slot decoration is not attached to a patient until insertion.

### Patient panel

`game-page/patient-panel/` contains:

```text
patient-panel-background-hires.png      (runtime: the corridor scene art)
patient-panel-name-bubble-hires.png     (unused, see below)
patient-panel-quote-bubble-hires.png    (unused, see below)
patient-panel-vitals-bubble-hires.png   (unused at runtime; reference
                                         artwork for the vitals SVG icons)
patient-panel-clipboard-bubble-hires.png (unused, see below)
```

Only the corridor background is in the runtime manifest. The four bubble
layers were superseded by the unified chart's CSS-drawn cards; they stay on
disk pending John's decision on archiving unused art. Patient portraits remain
in `patient-data/patient-images/`.

Portrait rendering must honor schema image orientation and scale metadata,
remain bottom-aligned, and not be forced to the background's magnification.

### Triage rooms

`game-page/triage-rooms-panel/` contains:

- `background-wall-for-all-rooms.png`;
- seven `background-*-room.png` interiors; and
- fourteen accepted `door-*-open.png` / `door-*-closed.png` images.

The wall and the seven interiors ARE runtime manifest assets (built
2026-08-06): each room cell layers, back to front, the rail's flat dark
green (#0f3d2f) → wall art → room interior → assigned patient (open room
only) → door art, whose transparent open doorway does the reveal. The
waiting rail still renders on the flat green with no wall art.

Room keys are:

```text
esi-1, esi-2, esi-3, esi-4, esi-5, psych, discharge
```

#### Accepted door baseline

The accepted door SET is unchanged from the 2026-08-04 verification; on
2026-08-06 every file was resized for delivery (originals in
`HIRES-ORIGINAL-ART/`; ~170 MB of room/waiting art became ~5.5 MB):

- Production contains exactly 14 `door-*.png` files.
- ESI 1-5 and Psych open/closed files are 257 x 400 RGBA (were 1152 x 1792).
- Discharge open/closed files are 397 x 400 RGBA (were 1777 x 1792).
- Interiors are 288 x 448 (discharge 444 x 448); the shared wall is
  317 x 320; targets sized for the iPhone 3x shell with headroom
  (script: `_asset-audit-and-resize/resize_game_art.py`).
- Sign backgrounds and lettering are accepted and readable.
- Open-door and outer-frame transparency is intentional and required.

These are the only current door assets. Do not restore, document, or load an
older door set.

#### Door regression rules

Any later door edit must:

- preserve the logical filename, visible geometry, aspect ratio, and placement;
- preserve alpha exactly unless John explicitly approves a transparency change;
- preserve unrelated pixels when the change is sign/lettering-only;
- keep ESI, Psych, and Discharge wording readable in all seven rows at the
  smallest supported shell;
- keep dark lettering on the accepted lighter sign backgrounds where used;
- verify both open and closed state;
- refresh the asset cache key only after visual approval.

An approved optimization pass may reduce pixel dimensions or change encoding
without being treated as a design edit, provided the rendered appearance and
alpha edges pass the regression checks below. High-resolution masters retain
the original dimensions outside the runtime manifest.

The implementation displays the door art at approximately 61% of its room-cell
width and 91% of its height, centered horizontally and bottom-aligned. Acceptance
must be judged in that rendered context, not only at native resolution.

## HOME assets

### ER Entrance composition

The HOME screen's player-facing name is ER ENTRANCE; the asset folder keeps
its internal `lobby-page/` name. It contains the permanent entrance background
and registered Start Shift overlay required by the forward application:

```text
background-w-open-glass-doors.png       852 x 1515
glass-door-overlay-start-shift.png      514 x 232
```

Place the Start Shift overlay at source coordinate X 319, Y 447 on the
852 x 1515 canvas. Scale the completed HOME composition uniformly. Do not nudge
or scale the overlay independently after registration.

### Settings and About

```text
settings-blackboard.png    752 x 1387
about-whiteboard.png       752 x 1387
```

The blackboard supports the PLAYER NAME and GAME OPTIONS boards; application
text and controls distinguish them. Both boards were cropped to their own
edges on 2026-08-07 (from a 941x1672 canvas that carried ~20% transparent
margin, using one common box so a single card geometry still serves both).
The uncropped originals are in `lobby-page/archived/`. Because the canvas is
now pure artwork, the card's percentage geometry describes the board itself:
re-cropping means re-deriving the card aspect ratio, the content insets, and
the two corner buttons' positions.

**The two boards' usable faces are DIFFERENT rects, and the difference
matters** (measured 2026-08-08). The blackboard's ribbed face runs
15.9%-83.5% of the card's width. The whiteboard's white dry-erase area,
inside its thin silver frame, runs x 7.4%-93.5% and y 3.8%-97.2% - measured
on the art at x 56-703, y 52-1348 of 752x1387. The shared content insets
were tuned for the blackboard and sit OUTSIDE the whiteboard's face, so the
About board carries its own; anything drawn to the shared insets on the
whiteboard rides onto the silver frame.

Center a board in the HOME frame at 93.75% of frame height
while preserving aspect ratio. Use a close target of at least 44 CSS pixels near
the board's established top-right close position.

### Music (boombox retired; local files since 2026-08-07)

The boombox metaphor is retired (2026-08-04): its artwork, hotspots, and LED
buttons are not implemented. `lobby-page/boombox.png` (and boombox.txt) stay
on disk, unused and out of the runtime manifest, pending John's decision on
archiving unused art. Sound options are GLOBAL SOUND plus a level for each of
GAME SOUNDS and MUSIC on the GAME OPTIONS board.

**The music assets are LOCAL FILES, and must stay local.** A remote source
cannot be volume-controlled on iOS: Apple ignores `HTMLMediaElement.volume`,
and routing through a Web Audio gain node - the one mechanism iOS honors -
requires CORS, which the routed element then refuses to play on the iPhone.
Local files are same-origin, so the gain node works everywhere.

#### The audio assets

```text
triageRush/assets/audio/track-01.mp3 .. track-05.mp3      2.5 MB total
```

Five tracks, in `ASSETS.music.tracks`. **Array order is play order** - the
filenames carry no other meaning, so reordering the playlist means reordering
the array (and re-running the transcode script if the numbering should match).

Three rules these files must keep:

- **NEUTRAL NAMES AND NO METADATA.** They are copyrighted recordings in a
  public repository. The sources' ID3 tags named the song, artist, album,
  label and catalog number, so renaming alone would have accomplished nothing;
  `-map_metadata -1` strips all of it. Adding a track means keeping both
  halves.
- **NOT PRELOADED, NOT IN THE LOADING GATE.** A shift must never wait on
  music, and a player who has not unlocked it must never fetch a byte.
  `listAllImageAssetPaths()` does not and must not include them.
- **THE AM-RADIO SOUND IS BAKED IN**, not applied at runtime. Nothing in the
  game filters audio.

#### The transcode pipeline

`assets/_audio-transcode/transcode-music.sh` turns full-quality sources into
the shipped files, and carries the recipe and the play-order table. John chose
it by ear from a seven-way listening test (`_mockups/audio-bitrate-test.html`,
variant "G, heavy AM"):

```text
highpass 400 Hz + lowpass 3.2 kHz + acompressor 6:1 @ -16 dB
24 kbps, mono, 22.05 kHz, no cover art, no tags        37 MB -> 2.5 MB
```

**24 kbps is not a mistake.** Low bitrates wreck the treble first, and the
lowpass has already thrown that treble away, so the encoder has nothing left
to ruin - the same 24 kbps applied to UNFILTERED music sounds swirly and
underwater. Filtering first is what buys the small file.

The full-quality originals and the `track-NN` → real-song mapping live in
`assets/audio/_originals-untreated/`, which is **gitignored**, as is the
listening test. To add or re-treat tracks: drop sources in there, add a line
to the script's `PLAYLIST` table, re-run, add the file to `assets.js`.

Never autoplay; playback starts only from a user gesture. A source error must
clear false active state and leave gameplay usable - a missing track reports
once and stops, and the shift is unaffected.

## Responsive artwork rules

- Compose every view inside the one 9:16 shell.
- Preserve source-coordinate registration for HOME layers.
- Scale complete components rather than generating ad hoc bitmap sizes.
- Preserve transparency, stacking order, and pointer behavior.
- Backgrounds may crop only where the UI specification permits.
- Keep portraits prominent and bottom-aligned.
- Do not stretch portraits to match background scaling.
- Provide useful text alternatives or semantic labels where an asset conveys
  function.
- Verify at the smallest supported phone layout and height-limited desktop layout.
- CSS containers own displayed width, height, crop, and fit. Runtime layout and
  game logic must never depend on source pixels, `naturalWidth`, or
  `naturalHeight`.

## Approved source-to-runtime lifecycle

1. Build and visually approve the complete game with the current
   high-resolution assets in their existing production locations.
2. Keep all layout geometry in CSS so a later pixel-size reduction cannot alter
   composition, hit targets, or game behavior.
3. After final CSS, rerun the audit for iPhone 16 Pro Max at 3x, Full HD, and a
   normal 3840 x 2160 desktop at 100% browser scale.
4. Create representative resize/compression trials under
   `_asset-audit-and-resize/resized-assets/`; compare doors, transparent edges,
   text, backgrounds, and portraits before approving a batch.
5. Preserve high-resolution masters in an archival source location outside the
   runtime manifest and preferably outside the deployed web root.
6. Replace optimized runtime assets at the same logical paths and filenames
   when practical. If encoding or path changes, update the centralized manifest
   only.
7. Change the production cache version, validate every manifest entry, and run
   visual, alpha-edge, lettering, and loading-performance checks.

This optimization is a release phase after functional and visual implementation,
not a prerequisite for starting the game. Never upscale a source merely to
match an audit target; keep it if it already looks good at its largest approved
presentation.

## Naming rules

- Group assets by the component that owns them.
- Use descriptive lowercase hyphenated names.
- Include role and state: `background`, `overlay`, `door`, `open`,
  `closed`, or `start-shift`.
- Preserve current accepted names even when they contain `hires`.
- Do not add dimensions to new names unless variants are intentionally supported.
- Do not create an unowned catch-all folder.

## Asset acceptance checklist

- Every manifest path returns successfully through the preview server.
- All 16 waiting backgrounds render.
- All 14 accepted doors render in open and closed states with readable signs.
- Door counts, manifest paths, decoding, alpha, and rendered geometry pass.
- Patient panel corridor art aligns without clipping or text obstruction.
- HOME Start Shift state registers to the entrance background.
- All assets survive shell scaling, safe areas, and reduced motion settings.
- No current runtime path names a discarded or historical asset.
- Audit scripts, reports, trials, and archived masters are absent from the
  runtime manifest and deployment payload.
