# triageRush HOME Screen Specification

**Current version:** 2026-07-31 11:13 PDT

## Purpose and visual direction

The HOME panel is the player's entry point into a triageRush session. It uses
one permanent open-lobby background plus small state overlays and interactive
controls, avoiding a separate full-screen transfer for every HOME state.

The approved direction is a crisp, detailed, sweeping oblique view of an urban
emergency-department entrance. Preserve the roadway continuing off the left
edge, crosswalk aligned with the doors, gritty visible lobby and nurses'
station, enlarged sidewalk boards, and green ABOUT utility cover. Do not
replace this composition with a front-facing architectural view.

## Coordinate system

All production placements use the background's source coordinates:

- Canvas: `852×1515` (approximately `9:16`)
- Origin: top-left
- X increases rightward; Y increases downward.
- Overlay coordinates identify the overlay's top-left corner.
- Scale the complete composition uniformly with the responsive game frame.

Do not independently reposition an overlay after fitting the complete
composition to the viewport.

## Production artwork

Production files are in:

```text
triageRush/assets/home-screen/backgrounds/
```

### Permanent background

`background-w-open-glass-doors 852x1515.png` is the permanent `852×1515` RGB background. It
represents a shift in progress, with open doors and the lobby visible. The
sidewalk boards and ABOUT cover are baked into it.

### Closed-door overlays

| State | File | Native size | Top-left |
|---|---|---:|---:|
| New shift | `glass-door-inset-start-shift.png` | `514×232` | `319,447` |
| Resumable shift | `glass-door-inset-resume-shift.png` | `473×267` | `319,447` |
| Shift in progress | No inset | — | — |

The authoritative position for both is `X 319, Y 447`. The companion file
`glass-door-inset-positioning-info.txt` preserves the placement details beside
the artwork.

These are registered rectangular RGB patches, not alpha sprites. Draw the
selected patch over the permanent background at the exact position. Door
states may pop immediately; a sliding animation is optional.

The full-background START and RESUME references are retained under
`backgrounds/archived/` and are not runtime backgrounds.

## HOME states and interaction

1. No resumable session: permanent background plus START SHIFT inset.
2. Saved resumable session: permanent background plus RESUME SHIFT inset.
3. Active shift: permanent background without a door inset.

The visible doorway call-to-action must have a comfortable mobile hit target.

The two sidewalk boards are summary displays and large tap targets:

- Left: player title and initials.
- Right: game mode, scoring strictness, and time.

Tapping a board opens a full-size, non-scrolling, face-on board modal similar
to the triage-notes panel. A red X cancels; a green checkmark applies changes,
closes the modal, and refreshes the small board summary. Small-board text
should match the board's perspective and lighting.

The green utility cover is the ABOUT control. Its embossed label is baked into
the background. Place a mobile-sized transparent hit target over the complete
cap to open the ABOUT panel.

## Popup backgrounds

The approved HOME popup backgrounds are:

- `popup-settings-player-board.png`
- `popup-settings-shift-settings-board.png`
- `popup-about-whiteboard.png`

All three are `941×1672` RGBA assets with transparent surrounds. The two
settings panels use closely spaced black letter-board slats and dark frames.
The ABOUT panel uses a brushed-aluminum hospital whiteboard with a subtle dot
grid and faint erased medical-chart residue.

Center each popup in the HOME frame, preserve its aspect ratio, and display it
at `93.75%` of the frame height. Position the `36×36` CSS-pixel close box inside
the visible upper-right frame at `top: 8.5%` and `right: 10.5%` relative to the
popup asset container. The companion file `popup-positioning-info.txt`
preserves these measurements beside the artwork.

## Boombox

### Artwork and placement

`boombox.png` is a `2298×1415` RGBA cutout.

- Anchor: top-left
- Position: `X 357, Y 1256`
- Scale: `100%`
- Reference display width at 100%: `480` background pixels
- Preserve aspect ratio.

Interactive centers relative to the boombox asset:

| Control | X | Y | Active appearance |
|---|---:|---:|---|
| POWER | 18.0% | 16.4% | Red rectangular LED glow |
| MUSIC | 46.9% | 21.3% | Green rectangular LED glow |
| UI | 77.3% | 28.7% | Green rectangular LED glow |

Use at least a `44×44` CSS-pixel tap target centered over each control. The
lower buttons, knobs, equalizer, speakers, cassette deck, and fixed `98.1 FM`
display are decorative.

### Sound behavior

- No in-app volume control; use device/browser volume.
- POWER starts or stops the radio subsystem.
- MUSIC enables or pauses Classical KING while powered.
- UI is reserved for app effects and is visual-only in the current demo.
- Initial state: POWER off; MUSIC preference on.
- Persist preferences when production persistence is implemented.
- Never autoplay; mobile browsers require a user gesture.

Use Classical KING's secure 128 kbps AAC Icecast mount:

```text
https://classicalking.streamguys1.com/KING-FM-128KAAC
```

Recommended markup:

```html
<audio
  id="kingStream"
  preload="none"
  src="https://classicalking.streamguys1.com/KING-FM-128KAAC"
></audio>
```

Call `play()` directly from the POWER or MUSIC tap handler and handle its
promise. Call `pause()` whenever POWER or MUSIC becomes inactive. On stream
error, extinguish POWER and provide an accessible retry label. A station outage
must not crash the app.

Keep the endpoint centralized and revalidate it before production release.
Streaming consumes network data until paused, powered off, suspended, or
terminated by the browser.

Official references:

- Listening page: `https://classicalking.org/listen`
- Icecast status: `https://classicalking.streamguys1.com/status.xsl`

## Prototype

The standalone reference is `_testAppHomeScreen/`. Run
`start-home-preview.bat`, then open:

```text
http://localhost:8082/_testAppHomeScreen/
```

It renders the production background and boombox and provides top preview
buttons for the Player Settings, Shift Settings, and ABOUT popup backgrounds.
Each popup closes through its red close box, the shaded exterior, or Escape.
It streams Classical KING through POWER, pauses/resumes through MUSIC, and
treats UI as a visual placeholder.

## Accessibility and mobile requirements

- Use accessible names and accurate `aria-pressed` states.
- Do not rely on glow alone; preserve pressed-state semantics.
- Maintain at least `44×44` CSS-pixel targets and respect iPhone safe areas.
- Preserve keyboard activation on desktop.
- Use the game frame's aspect ratio with no unintended side letterboxing.

## Change history

- **2026-07-31 11:13 PDT:** Recorded the finalized HOME asset organization,
  popup artwork, approved popup scale and close-box placement, and revised
  prototype behavior.
- **2026-07-30 19:33 PDT:** Established the approved HOME composition,
  registered START/RESUME overlays, sidewalk-board modal and ABOUT behavior,
  boombox placement, Classical KING streaming, and the standalone prototype.
