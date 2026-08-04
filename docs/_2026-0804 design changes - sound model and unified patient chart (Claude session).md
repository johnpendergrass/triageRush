# Design Changes Agreed 2026-08-04 (Claude session, after Codex handoff)

**Status:** Agreed with John in conversation. These changes AMEND the numbered
docs 3-9 wherever they conflict. Recorded before Phase 1 implementation begins.

---

## Change 1: Boombox removed; new three-toggle sound model

The boombox metaphor on the HOME screen is **retired entirely**. Its artwork,
hotspots, and LED buttons will not be implemented. Sound options move to the
shift-settings blackboard as three on/off toggles:

| Toggle | Meaning |
|---|---|
| **GLOBAL** | Master switch. Off silences everything (game sounds and music). |
| **GAME SOUNDS** | Every synthesized sound: timer ticks, minute ticks, doinks, correct/close/wrong feedback, countdown numeral ticks, completion dong. More sounds may be added later. |
| **MUSIC** | The Classical KING-FM internet radio stream (for now the only music). |

Rules agreed:

- If GLOBAL is off, everything is silent regardless of the other two toggles.
- The **in-game mute button stays** in the GAME header, but it governs **game
  sounds only, never music**. If GLOBAL was off and the player unmutes from the
  game screen, game sounds start but music does not.
- **Music can only be started from the HOME screen.** The game screen can never
  turn music on. (John acknowledges this could confuse some players and accepts
  it.)
- **Implementation requirement:** track every game sound individually in one
  registry (tick, minuteTick, doink, correct, close, wrong, countdownDong, ...).
  The GAME SOUNDS toggle currently flips the whole family, but John expects to
  later request per-sound options (e.g. "disable timer ticks only"). Structure
  for that now; no extra UI yet.

Supersedes: the boombox sections of docs 6 and 7; the `rushTimingSounds` /
`globalMute` settings shape in doc 8 should be revisited to express
`{ globalSound, gameSounds, music }` plus the in-game mute. Exact settings-state
naming to be confirmed at the Phase-1 design review.

## Change 2: Unified patient chart — one component, two-layer wrappers

The patient evaluation panel (center of GAME) and the Coach chart are **no
longer two separate designs**. They become one shared component shown in two
settings. Rationale: consistency of look and feel; a single place in code maps
patient JSON to displayed content; the panel *is* the chart, tapping zooms it.

Agreed structure (John's two-layer wrapper formulation):

1. **Patient wrapper (inner)** — transparent; holds all the info cards: name,
   image, complaint, quote, vitals, triage note, answer, clinical. Built and
   maintained in exactly one place (one builder function in `ui.js`).
2. **Setting wrappers (outer)** — one per location:
   - **Patient panel wrapper** (GAME center): transparent so the hallway/room
     art shows through; narrow space; compact flow. Answer renders locked and
     clinical collapsed, e.g. as slim labeled strips.
   - **Clipboard wrapper** (Coach overlay): opaque paper clipboard with metal
     clamp, ruled lines, borders; wide space; generous flow.
   - (Third setting later: Patients Seen review, same clipboard wrapper with
     navigation chrome.)

Key properties:

- Content is written once; **CSS owns all per-setting flow, sizing, and
  background** via container-query scaling. Each view keeps its own tuned
  space budget — unifying content does NOT force the two views to look alike.
- The mini (panel) view keeps the portrait prominent; if the compact flow
  cannot preserve portrait prominence and vitals readability at ~225 CSS px
  wide, fallback is sharing only the content-mapping code with two layouts.
- **De-risk plan: build the mini-chart view early and get John's visual
  approval before building the rest of GAME around it.**
- Nice-to-have enabled by this design: tapping the locked ANSWER or collapsed
  CLINICAL strip in the panel could open the full-screen Coach directly.

Supersedes: doc 7's separate patient-panel card composition and doc 8's
`renderPatient` / Coach-chart split — they become one chart builder with
per-setting wrappers. The Coach behavior contract (lock rules, clinical shift
memory, tap-panel-to-open) is unchanged.

## Change 3: Vitals rendered from separate icons, not a composite panel image

The current vitals artwork exists as one whole panel image. For the game it
will be **separated into six individual icon images** (HR, BP, RR, SpO2, Temp,
Pain), transparent backgrounds.

- The vitals card is a CSS grid, 3 columns x 2 rows; each tile = icon + label
  text + live value text.
- Values and their colors come from the authored patient JSON
  (`patient.presentation.vitals.*.value` / `.color`) — never computed.
  Label text preserves meaning without color.
- Icons are sized in relative units so the whole card scales in both the
  narrow panel setting and the wide clipboard setting from the same markup.

**Asset to-do:** `triageRush/assets/icons/` is currently empty (only
`.gitkeep`). The six vital icons must be produced (extracted from the existing
panel art or newly generated) before the vitals card can be built.

## Open questions deferred (ask at or after Phase-1 design review)

- Exact settings-state field names for the three sound toggles and how the
  in-game mute is stored (e.g. does it *be* the GAME SOUNDS toggle or shadow it).
- Whether tapping the locked/collapsed strips opens Coach directly (proposed
  above, not yet decided).
- Source of the six vital icons (extract vs. regenerate).
