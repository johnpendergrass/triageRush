# Claude-ToBe-Continued — 2026-08-05 10:24

Read this first, then: `docs/1-start-here-toc.md`, the current
`docs/99-ai-handoff--*.md`, and `docs/_2026-0804 design changes - sound
model and unified patient chart (Claude session).md` (AMENDS docs 3-9
where they conflict). Persistent memory notes exist (ER Entrance naming,
room art layering, Coach→Chart rename, asset-loading todo) and load
automatically. NOTE: the docs 3-9 sweep is now overdue — see John's
six-step plan below; steps 4-5 are exactly that sweep.

## Build state

Working game at repo root `index.html` + `triageRush/{assets.js, game.js,
ui.js, app.js, styles.css}`. Run with `start-triageRush.bat` (port 8090);
NEVER open index.html by double-click (fetch fails on file://).
Cache version strings are "2026-0805-phase6n" (index.html + assets.js);
bumped a letter per CSS/JS tweak all session — keep doing that.

## John's agreed continuation plan (2026-08-05, follow in order)

1. Write ToBeContinued + doc files — THIS FILE (done).
2. Commit and push as "phase six done".
3. Reset the context (John runs /compact or /clear).
4. Clean up docs 3-9 + 1/7/8: sweep ALL accumulated amendments (list
   below) so the numbered set is fully current again.
5. Commit and push the doc cleanup.
6. Move on to Phase 7 (scheduler).

## Phase 6 COMPLETE (verified by John on sight this session)

- **Chart overlay** (a.k.a. Coach in the docs — rename pending, see below):
  whole-occupied-panel transparent hit button (`patientPanelHitButton`,
  hidden when panel empty or patient assigned); NO footer button.
- **Clipboard is CSS-drawn** (assets/patient-chart-popup/ is empty): board
  gradient + metal clamp + ruled cream paper (`.coach-clipboard`,
  `.coach-clamp`, `.coach-scroll`). Red ✕ pinned to board top-right.
- **Same buildPatientChart builder**, `{ setting: "coach" }`: presentation
  cards render directly with NO PRESENTATION header (John removed it —
  always visible/expanded, header wasted space; amends doc 7's "three
  section buttons"). Then ANSWER header (locked, striped, LOCKED pill,
  shake-on-tap via .is-denied) and CLINICAL header (chevron, aria-expanded).
- **Clinical body**: 8 cards from schema 2.2 clinical — SUMMARY, WHY THIS
  ACUITY, KEY FINDINGS, EXPECTED RESOURCES, RED FLAGS (or "None
  identified."), TEACHING POINTS, POSSIBLE DIAGNOSES, LIKELY DISPOSITION.
- **Clinical shift memory** in `state.coach.clinicalExpanded`; toggled via
  delegation in app.js (direct DOM toggle + state update, preserves
  scroll); resets at startShift. Presentation toggle concept dropped.
- **Pause plumbing**: `openCoach`/`closeCoach` in game.js add/remove pause
  reason "coach"; invariants check coach-overlay⇔active-patient and
  reason⇔overlay consistency. Clock freeze itself is Phase 7's scheduler
  (the one doc-9 Phase-6 acceptance row that waits for Phase 7).
- **Scroll hints**: MORE ABOVE/BELOW pills only when content hidden that
  direction (8px slack), tap scrolls ±70% smooth.
- **Close paths**: red ✕, scrim click (clicks inside clipboard never
  close), Escape. Focus: open→✕, close→panel hit button.
- **Photo zoom lightbox** (John's addition, beyond doc-9 spec): the photo
  in the chart overlay carries a 🔍 badge top-right; hit box = whole photo
  inset 4%. Opens a dark blurred scrim over the ENTIRE clipboard (hides
  the chart's red ✕ — only one close box visible) with a centered 3:5
  photo card (paper mat, overflow hidden) showing the portrait at
  scale(1.3) — 30% zoom; crops sides only, never heads (3:5 height
  absorbs it; if zoom ever exceeds ~55% switch to object-fit cover,
  top-anchored). Mirrored patients keep their flip. Close: red box on
  card, scrim tap, Escape (Escape peels zoom first, then chart).
  Ephemeral — NOT in the state tree; resets closed on every chart open.
- **Testing**: 24-case Node harness (scratchpad, ephemeral — rebuild from
  doc 9 if needed) for open/close legality, clinical memory, recall
  gating, serialization; full chrome-devtools click-throughs. Only
  console noise: the harmless favicon 404.

## Player-facing renames this session (in build, NOT yet in docs)

- Footer left: `◀ QUIT THIS SHIFT / RETURN TO ER ENTRANCE` (was LEAVE
  SHIFT; John briefly chose END SHIFT then corrected to QUIT THIS SHIFT).
- Footer right: `END SHIFT EARLY ▶ / REVIEW THIS SHIFT` (was STOP SHIFT
  EARLY).
- Dialogs: "Quit this shift?"/"Yes, quit this shift" and "End this shift
  early?"/"Yes, end shift early"; cancel stays "Whoops! I want to keep
  playing!".
- Footer sizing after mobile-overflow iteration: columns 1.6fr 0.08fr
  1.6fr; button padding clamp(20px, 8.4cqw, 44px); label
  clamp(9px, 3cqw, 15px); subtitle clamp(5px, 1.6cqw, 9px) with
  margin-top clamp(1px, 0.5cqw, 4px).

## Doc sweep list for step 4 (everything docs 3-9 still get wrong)

1. Coach → **Chart** everywhere (John: "leaning into the idea that it is
   the patient's chart"). Code identifiers too: overlay value "coach",
   state.coach, openCoach/closeCoach/renderCoach/renderCoachPortraitZoom,
   coach* element IDs, .coach-* CSS classes, pause reason "coach".
2. lobby → ER Entrance (player-facing; internal `lobby` keys stay).
3. Footer wording: QUIT THIS SHIFT / END SHIFT EARLY (docs say Quit
   Game / Stop Game).
4. Recall is NOT silent — plays C5,E5 (registry `recall`).
5. No wall art behind rails — flat #0f3d2f; wall + room interiors are
   reserved layers for future room composition (wall → interior →
   patient → door), NOT archive candidates.
6. No PRESENTATION section header in the chart overlay.
7. Photo zoom lightbox exists (not in any doc yet).
8. Persistent outcome halo on occupied door until room closes.
9. Empty-state 9:16 box + hint lines + fused text arrows (U+FE0E).
10. Nameplate wristband chip (age NN · X).

## Immediate ToDo (after doc sweep + commit)

- **Phase 7** (doc 9): one 250ms scheduler; countdown; tick/minuteTick/
  countdownTick/endDong sounds (registry slots already commented in
  app.js SOUND_REGISTRY); pause honors state.pauseReasons (coach reason
  already flows); RUSH arrivals + 20% double bursts (state.rush fields
  exist); confirm dialogs should also add pause reasons when the
  scheduler lands ("confirmation" per doc 8), plus "document-hidden".
- Then Phases 8-9 (review scorecard, patients-seen browser using the same
  chart builder in a third setting, persistence/recovery).

## Long-term ToDo (do not lose)

- **IMPORTANT (John, 2026-08-05): better asset loading strategy.**
  Stage-2 startup fetches 160 patient JSONs AND decodes every manifest
  image (~187 MiB hi-res art) before READY — too slow, testing-only.
  Distinct from Phase 10 resizing: also rethink what blocks READY vs
  loads lazily. Raise at Phase 10 planning. (Also in memory.)
- Layered room rendering (wall → interior → patient → door) — the visual
  interlude John wants between now and/or around Phase 7; he'll say when.
- Six vital icons: GENERATE NEW art; assets/icons/ still empty; vitals
  tiles have no icons yet.
- Settings/about popup text is placeholder; fix before release.
- fitTextToBox auto-shrink (the sanctioned fix for text overflow; never
  rework the approved panel layout).
- Long-press/hover room-guide popover (doc 7 supplemental).
- Archiving unused art (boombox, bubble PNGs) still awaiting John's OK.
- Favicon 404 — harmless; add a favicon someday.

## Session workflow notes (unchanged and still true)

- John reviews visually in HIS browser (desktop + iPhone) after each
  change; use text snapshots/evaluate_script for verification.
- One small change at a time; wait for his verdict.
- Claude's test servers: any port but 8090 (John's .bat); KILL them when
  done (check `netstat -ano | grep 8111` — one orphaned this session).
- Bump the cache version letter on every asset/CSS/JS change.
- John commits via GitHub Desktop normally, but this session he asked
  Claude to commit+push directly (steps 2 and 5 of his plan).
