# Claude-ToBe-Continued — 2026-08-04 15:16 (first Claude session on triageRush)

This is the FIRST ToBeContinued file for this project (historical baseline —
never delete). Project was previously developed with Codex; Claude Code took
over this session.

## Where the real specs live

**The authoritative specs are in `docs/` (Codex's numbered documents 3-9),
NOT here.** John wants actual specifications kept in `docs/`. This folder
(`claude-john-docs/`) holds only session-continuity notes and plan files.

Read in this order at session start:

1. `docs/1-start-here-toc.md` — project map and reading order.
2. `docs/99-ai-handoff--2026-08-04-1357.md` — Codex's handoff (approved plan).
3. `docs/_2026-0804 design changes - sound model and unified patient chart
   (Claude session).md` — **this session's agreed changes; AMENDS docs 3-9
   wherever they conflict.**
4. `claude-john-docs/claudePlans/i-would-like-you-zippy-turing.md` — Claude's
   distilled look-and-feel reference from both demos (colors, shell math,
   animations, audio recipes) plus the same design-change summary.

## Project state (end of this session)

- **No production code exists yet.** `triageRush/app.js` and `styles.css` are
  1-line placeholders; root `index.html` is a stub. Nothing built this session
  — this was an orientation + design-review session by John's choice.
- Assets exist: 160 schema-2.2 patient JSONs + portraits in `patient-data/`,
  production UI art in `triageRush/assets/` (high-res; do NOT resize until
  Phase 10 per the approved plan).
- Two demos define look and feel (code NOT to be copied): `_testAppMobile`
  (full game) and `_testAppHomeScreen` (lobby). Rule agreed with John:
  **docs are the authority on behavior; demos are the authority on visual
  identity.** The lobby demo's image paths are dead (art moved to
  `triageRush/assets/lobby-page/`) — expected, don't "fix" the demo.

## Work done this session

1. Read Codex handoff and docs; explored both demos thoroughly; wrote the
   look-and-feel reference (plan file above).
2. Presented the Phase-1 programming-design review to John: compact file set
   (`index.html`, `styles.css`, `assets.js`, `game.js`, `ui.js`, `app.js` —
   ui/app kept separate), simplified state tree, proposed asset-manifest key
   scheme. John then supplied design changes rather than approving as-is.
3. Agreed and documented three design changes (see the docs/ file above):
   - **Boombox removed from HOME.** Sound options become GLOBAL / GAME SOUNDS /
     MUSIC (KING-FM stream) toggles on the shift-settings blackboard. In-game
     mute button stays but controls game sounds only — music starts only from
     HOME. Every game sound must be individually tracked in code for future
     per-sound options.
   - **Unified patient chart.** Patient eval panel and Coach chart are one
     shared component: inner transparent "patient wrapper" (all info cards,
     built once) inside per-location outer wrappers (transparent panel setting
     vs. opaque clipboard setting). CSS/container queries own per-setting flow.
     Mini view must be built early for John's visual approval.
   - **Vitals from six separate icons** (HR, BP, RR, SpO2, Temp, Pain), 3x2
     grid of icon + label + authored value/color tiles. Icons do not exist yet
     (`assets/icons/` is empty) and must be produced first.
4. Committed and pushed everything to GitHub (John's request).
5. Fixed git access: `.git` was owned by Codex's sandbox user; added
   `safe.directory` exception for this repo to John's global git config.

## Immediate ToDos (next session)

1. John said "we'll see about moving on" — **await/confirm his go-ahead**, then
   possibly finish the design review loop (he was mid-review of the Phase-1
   design when changes started; the review may need a short re-confirmation
   pass reflecting the three changes).
2. Open design questions deferred (listed at the end of the design-changes
   doc): sound-settings state field names; whether tapping locked ANSWER /
   collapsed CLINICAL strips in the panel opens Coach directly; extract vs.
   regenerate the six vital icons.
3. Then Phase 1 build (per doc 9 order): 9:16 shell + HOME (lobby background,
   START SHIFT door overlay, settings blackboards with Intern title and
   5/10-min timers and the new three sound toggles, About board) + loading
   pipeline. High-res art untouched.
4. Produce the six vital icon assets before building the vitals card.

## Long-term ToDos

- Phases 2+ per `docs/9-implementation-plan-and-acceptance.md`: GAME view,
  unified patient chart (mini view early for visual approval), queue/rooms,
  scoring ledger with replacement scoring, RUSH mode with bursts and cue
  boundaries, Coach, Shift Review, persistence/recovery, acceptance matrix.
- Phase 10 ONLY: asset audit against final CSS, John-approved resize trials,
  optimized runtime replacements with cache-version bump.
- John's open question (docs/_2026 0804 John's new thoughts, item 4): whether
  to add Indigenous patients — not yet decided, revisit with John.
- Door-text readability (his item 5) — docs say all 14 current doors accepted,
  but verify visually during build.

## Working-style reminders (John)

- Incremental development; wait for John's explicit go-ahead before each build
  step. Readability over performance. Plain HTML/CSS/JS, no frameworks.
- John uses GitHub Desktop/website, minimal terminal git.
