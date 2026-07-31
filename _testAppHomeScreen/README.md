# triageRush HOME Screen Test App

This is a standalone visual prototype of the HOME screen. It uses
`background-w-open-glass-doors 852x1515.png` as its permanent background and overlays the
production `triageRush/assets/home-screen/backgrounds/boombox.png` graphic.

Three buttons at the top preview the Player Settings, Shift Settings, and ABOUT
popup artwork. Each popup can be closed with its red close box, by tapping the
darkened area outside the board, or by pressing Escape.

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
`docs/home-screen-specification--2026-07-31-1113.md`.
