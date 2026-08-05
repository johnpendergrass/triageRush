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

## Open questions — RESOLVED at design review (2026-08-04, later same day)

- **Sound settings shape (decided):** persisted `settings.soundGlobal`,
  `settings.soundGame`, `settings.soundMusic` edited on the blackboard.
  Music plays iff `soundGlobal && soundMusic`, decided at HOME only. Runtime
  flag `gameSoundsAudible` initialized at shift start to
  `soundGlobal && soundGame`; the in-game mute button flips only that flag and
  never rewrites the persisted preferences. Sound registry gives every sound a
  named entry with its own enabled flag (all true for now).
- **Panel tap behavior (John decided): uniform tap.** The whole patient panel
  is one tap target with one behavior — open Coach in its remembered state.
  Tapping the CLINICAL strip gets no special shortcut; Clinical is expanded
  from inside Coach.
- **Vital icons (John decided): generate new icons.** Six fresh transparent
  icons in a matching style, rather than extracting from
  `patient-panel-vitals-bubble-hires.png`.

## Still pending (housekeeping, needs John's OK before acting)

- Move now-unused art into `archived/` subfolders: `lobby-page/boombox.png`
  (+ boombox.txt), the four `game-page/patient-panel/*-bubble-hires.png`
  files, and the seven `triage-rooms-panel/background-*-room.png` interiors
  (open-door art already shows the interior; demo never used them).

## Addendum 2: Phase-5-session decisions (approved 2026-08-04, evening)

All agreed with John live on the built game; these AMEND docs 3, 7, 8:

- **Recall plays a sound** (amends "recall is silent"): the first two notes
  of the Correct arpeggio (C5, E5). Registry entry `recall`.
- **Occupied-door halo**: the open door retains its outcome-colored ring
  (green/amber/red) until the room closes via recall or finalization. The
  evaluation flash pulses three times on the same ring. This deliberately
  keeps the outcome visible; it never marks the correct room.
- **Naming**: the opening screen is **ER ENTRANCE** (player-facing).
  "Lobby" and "Check-In" were considered and rejected. Internal code and
  asset names keep `home`/`lobby`.
- **Footer wording**: `◀ LEAVE SHIFT` (return to ER Entrance) and
  `STOP SHIFT EARLY ▶` (review this shift); wide buttons with a thin
  decorative middle strip; edge-pinned arrows sized to the button box.
- **Stop Shift Early confirms too** (new overlay `confirm-stop`), wording
  on both dialogs: "Whoops! I want to keep playing!" vs "Yes, leave shift"
  / "Yes, stop shift".
- **Empty patient panel**: the SELECT A PATIENT box uses a 9:16 aspect
  (matching the shell), width preserved, vertically centered. Hint lines:
  "TAP A WAITING ROOM PATIENT" always; plus "or" +
  "TAP THE TRIAGE ROOM DOOR TO RECALL THAT PATIENT" when recall is legal.
  Arrows are white fused text arrows (◀︎━━ / ━━▶︎) with U+FE0E variation
  selectors so phones do not render boxed emoji.
- **Nameplate**: age/sex renders as a cream chip `age 45 · M` beside the
  name; long names truncate with an ellipsis, the chip never shrinks.
- **No wall art behind the rails**: the waiting and rooms rails sit on a
  flat dark green (#0f3d2f, tunable). `background-wall-for-all-rooms.png`
  is NOT screen background — it is the base layer of the triage-room
  composition (wall → room interior → patient → door), reserved with the
  `background-*-room.png` interiors for future layered room rendering.
  Neither is an archive candidate (supersedes the earlier proposal above
  for the seven room interiors).

## Addendum: patient-panel layout decisions (approved 2026-08-04, later session)

Iterated live with John on the built game; these are final for the panel
setting of the unified chart (implementation in triageRush/ui.js
buildPatientChart + styles.css):

- Card stack: nameplate (own centered plate, 86% width, small gap above),
  transparent scene with portrait (NO tint/scrim over the corridor art),
  complaint plate BELOW the portrait (must never cover the image), quote
  card with PATIENT QUOTE kicker, 3x2 vitals, triage note with TRIAGE NOTE
  kicker and NO clip hardware (the Coach clipboard wrapper supplies the
  clipboard motif).
- ANSWER/CLINICAL are hidden in the panel setting entirely; they appear only
  in Coach/review settings of the same chart builder.
- Quote and note bodies share one font size; quote stays Georgia italic,
  note uses regular Arial (not the condensed app face) so the two look the
  same visual size. Complaint is the largest text item.
- Height shares: scene 43 / quote 17 / vitals 18 / note 19 (quote enlarged,
  note reduced, because quotes run longer than notes).
- Fonts tuned down until mobile stopped clipping; John approved and closed
  the iteration. Future overflow is handled by auto-fit shrinking, not by
  layout changes.
