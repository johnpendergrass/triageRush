# Look-and-Feel Reference: Findings from the Two Demos (2026-08-04)

## Context

This is Claude's first session on triageRush. The project was developed with Codex,
whose specs live in `docs/` (documents 3-9 plus the 2026-08-04 handoff). The
production app under `triageRush/` is an empty scaffold; the build has not started.

John asked Claude to examine `_testAppMobile` (full game demo) and
`_testAppHomeScreen` (lobby demo) because **those two demos define the approved
look and feel**, even though their code is not to be copied wholesale. This file
records the distilled findings so future sessions don't need to re-explore, and
states how the demos + docs will be used to build the production game.

## How the demos will be used

- **Docs 3-9 are the authority on behavior and rules.** Where a demo and the docs
  disagree (e.g. the demo's "Resume shift" button, "no timer" option, Coach footer
  button), the docs win — they already incorporate John's 2026-08-04 design changes.
- **The demos are the authority on visual identity**: layout math, colors, fonts,
  depth/shadow language, animations, audio character. The production CSS should
  reproduce these, cleaned up (CSS custom properties instead of scattered hex,
  no dead/duplicate rules).
- Demo code will still be consulted file-by-file during the build for exact values
  (keyframes, gradients, envelope timings) rather than re-derived from memory.

## The 9:16 shell (most important pattern to preserve)

- Letterboxed aspect-locked shell centered on a dark navy radial-gradient stage:
  `radial-gradient(circle at 50% 20%, #244454, #0d2532 40%, #02090e 100%)`.
- The ~10% desktop breathing room is `body` padding: `max(5dvh, safe-area)` top and
  bottom, 4px side gutters. `html, body { overflow: hidden }`, body is a centering grid.
- Shell sizing is `min()` math, not `aspect-ratio`:
  `width: min(calc(100vw - 8px), calc(90dvh * 0.5625))` /
  `height: min(90dvh, calc((100vw - 8px) * 1.7778))`, with a
  `@supports (height: 100svh)` override using svh/svw minus safe-area insets.
  (Home demo locks to the background's exact ratio 852/1515 = 0.56238 instead of
  nominal 9/16 — that precision keeps overlay art registered; keep it for HOME.)
- **`container-type: inline-size` on the shell; every font size is
  `clamp(minPx, N cqw, maxPx)`.** This is why the demo looks identical at 300px and
  500px wide. Region heights are % of shell; only touch targets and hairlines are fixed px.
- GAME vertical stack: header 7.2% / play area 85.8% / footer 7%.
  Play area columns: waiting 22% / patient panel 56% / rooms 22%.
- Rounded corners only on large viewports; phones get edge-to-edge.

## Palette and typography

- Doc-7 semantic palette (promote to CSS custom properties):
  navy-950 `#031019`, navy-900 `#071c29`, navy-800 `#0b2d3e`, steel `#91a1a8`,
  cream `#efe6d6`, orange `#ff9f1c`, cyan `#12a8df`, green `#27c978`,
  amber `#f0a329`, red `#ef4b3f`.
- Boombox LED colors are a deliberate separate set (iOS-flavored `#ff3b30` red,
  `#35e67a` green with scanline overlays) — keep both sets distinct.
- Play-area "linoleum" `#d6c8b4`; paper/cream card family `#f2e8d8`-`#f7f3e9`;
  clipboard browns `#8a4c16`/`#b07a2c`; score colors correct `#42df8b`,
  close `#ffd052`, wrong `#ff6158`.
- Fonts (no webfonts): base `"Arial Narrow", "Roboto Condensed", Arial, sans-serif`;
  Georgia italic for patient quotes and coach headings; `"Arial Black", Impact` 900
  for RUSH countdown numerals; plain Arial for chart prose. Heavy weights (800/900),
  tight brand tracking, wide kicker tracking.
- Depth language: every raised surface = light 1-3px border + `inset 0 0 0 1px`
  highlight + dark drop shadow; radii 5-12px by scale; pills 999px.

## Distinctive elements to reproduce

1. **Clipboard motif** (strongest identity element): metal clamp + ruled-paper +
   red-margin-rule gradients, used at two scales (triage-note card, Coach chart).
2. **RUSH countdown numerals**: last 10s, huge white numeral (~half patient-panel
   width) at patient center, `rush-countdown-pop` 520ms scale/fade animation.
3. **Door pulse glows** on the chosen door only (inset ring + outer bloom, 900ms x2,
   color per outcome) — never reveal the correct door.
4. **Full-queue shake** (200ms translateX jitter on the waiting panel).
5. **Queue attract state**: glow ring + 1.25s brightness-breathing animation.
6. **Locked ANSWER hazard stripes** (diagonal grey stripes on the section header).
7. **Empty-state arrows drawn in pure CSS**; whole patient panel is one tap target.
8. **Boombox on HOME**: photoreal art + three 44x44 invisible buttons rendering CSS
   LED lenses (gradient + glow + scanline). Streams Classical KING 98.1 FM
   (`https://classicalking.streamguys1.com/KING-FM-128KAAC`), `preload="none"`,
   gesture-gated, failure clears POWER state and rewrites the aria-label.
9. **Home screen art carries the brand**: title/signage/sidewalk boards baked into
   the 852x1515 background; glass-door START SHIFT overlay is a 514x232 RGB patch
   at source X319,Y447 (hard swap approved; slide animation optional).
   Hotspot primitive: fixed-px transparent button centered on a % coordinate via
   `translate(-50%,-50%)`.
10. **Synthesized audio** (Web Audio oscillators, no files): correct sine 520-760Hz,
    close triangle 390-260Hz, wrong sawtooth 125-90Hz, RUSH tick square 1050-720Hz
    (three-beat pattern), arrival ding dual-sine 1046+2093Hz, end dong an octave
    below. Docs add: doink on arrivals, triage-mode minute tick-tick-tick.

## Interaction patterns confirmed in the demo

- Queue tap: move-in when panel empty; swap when occupied-unassigned; ignored when
  assigned. Hint badges `→`/`↔` when hints on.
- Assignment: immediate evaluation, door opens, pulse + toast (1600ms) + tone.
- Recall: tap the same open door; orange `←` badge marks it.
- Long-press (520ms) room guide popover on touch, hover-instant on desktop.
- Clock/arrivals pause while any overlay is open.
- `fitTextToBox()` shrinks quote/note text in 0.25px steps to a 6.5px floor.
- Escape/backdrop dismissal with focus restore; `prefers-reduced-motion` kill-switch.

## Known demo defects — do NOT carry forward

- `_testAppHomeScreen` image paths are dead (assets moved to
  `triageRush/assets/lobby-page/`, two settings boards merged into one
  `settings-blackboard.png`). The demo currently 404s all art.
- `styles.css` has a duplicate Coach block (lines ~1203-1531 are dead; the
  "Schema 2.0 Coach chart" block wins).
- `renderStatus()` dead code overwrites its own richer label.
- Unused assets: room `interior` images in the manifest, 4 patient-panel bubble
  PNGs, `assets-legacy/`, empty `assets/sounds/`.
- Demo behaviors superseded by docs: Resume Shift (removed), "no timer" option
  (now 5/10 min countdown), Coach footer button (now tap-patient-panel),
  elapsed-time display (always countdown), missing `Intern` title, no RUSH
  two-patient bursts, no 10-second boundary ticks.

## AMENDMENT 2026-08-04 (later same session)

After the Phase-1 design review was presented, John agreed three design changes
that amend docs 3-9 and parts of this file. See
`docs/_2026-0804 design changes - sound model and unified patient chart (Claude session).md`
for full detail. In brief:

1. **Boombox removed** from HOME entirely. Sound options move to the
   shift-settings blackboard: GLOBAL / GAME SOUNDS / MUSIC (KING-FM) toggles.
   In-game mute button remains but controls game sounds only, never music.
   Track each game sound individually in code for future per-sound options.
2. **Unified patient chart**: the patient eval panel and Coach chart become one
   shared component (inner transparent "patient wrapper" holding the info
   cards) shown inside per-location outer wrappers (transparent panel setting
   vs. opaque clipboard setting). CSS owns per-setting flow via container
   queries. Build the mini view early for John's visual approval.
3. **Vitals from six separate icons** (HR, BP, RR, SpO2, Temp, Pain) in a 3x2
   grid tile layout (icon + label + authored value/color). Icons don't exist
   yet — `assets/icons/` is empty; they must be produced first.

## Next step (unchanged from the Codex handoff)

Phase 1 design review with John: present the compact file responsibilities
(`index.html`, `styles.css`, `assets.js`, `game.js`, `ui.js`/`app.js`), the initial
state-tree shape, manifest keys, and patient lookup/queue schemas for his approval
before substantial coding. Build with current high-res art; optimize only after
final CSS is visually approved (Phase 10).
