# triageRush HOME Screen Test App

This is a standalone visual prototype of the HOME screen. It uses
`HOME-open-doors 852x1515.png` as its permanent background and overlays the
production `triageRush/assets/home-screen/backgrounds/boombox.png` graphic.

The top controller moves the boombox one source pixel at a time and reports its
top-left `x, y` coordinate and current scale percentage. Keyboard arrow keys do
the same; hold Shift for ten-pixel steps.

The minus/plus scale gadget changes size in one-percent steps while keeping the
top-left corner anchored. Keyboard minus/plus also works; hold Shift for
ten-percent steps.

The red POWER button starts/stops the live Classical KING 98.1 FM stream. MUSIC
enables or pauses that stream while power is on. UI remains a visual-only
placeholder. The bottom-row stereo controls are decorative, and the fixed tuner
reads 98.1 FM.

The stream uses Classical KING's secure 128 kbps AAC Icecast mount:

```text
https://classicalking.streamguys1.com/KING-FM-128KAAC
```

Mobile browsers require playback to begin from a user gesture, so the radio
starts only after POWER is tapped. Device controls set the volume.

## Run locally

Double-click:

```text
start-home-preview.bat
```

Then open:

```text
http://localhost:8082/_testAppHomeScreen/
```

To view it on an iPhone connected to the same Wi-Fi network, use the computer's
local network address with port `8082` and the same path.

The authoritative production behavior and coordinates are documented in
`docs/home-screen-specification--2026-07-30-1933.md`.
