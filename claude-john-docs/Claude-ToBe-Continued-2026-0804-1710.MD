# Claude-ToBe-Continued — 2026-08-04 17:10 (second session, same day)

Read this first, then: `docs/1-start-here-toc.md`, the current
`docs/99-ai-handoff--*.md`, and
`docs/_2026-0804 design changes - sound model and unified patient chart
(Claude session).md` (AMENDS docs 3-9 where they conflict). The specs live in
`docs/`; this folder is session continuity only.

## Build state (all committed and pushed after this file was written)

Working production game at repo root `index.html` + `triageRush/{assets.js,
game.js, ui.js, app.js, styles.css}`. Run it with `start-triageRush.bat` at
the repo root (serves http://localhost:8090/, auto-opens browser; also prints
an iPhone LAN address). NEVER open index.html by double-click — fetch() of
patient JSON fails on file://.

### Completed and John-approved

- Doc-9 Phases 1-3 (commit "phase 1 complete"): manifests + validation of all
  160 schema-2.2 patients, state tree with invariant checks, selectors,
  versioned localStorage preferences, 9:16 shell with 5dvh breathing room,
  HOME lobby (registered START SHIFT door patch, live chalk board summaries,
  settings/about popups, Intern title, 5/10-min triage + 60/120s rush
  lengths, GLOBAL/GAME SOUNDS/MUSIC toggles), staged loading with READY
  status, full navigation cycle HOME->GAME->REVIEW->HOME with quit
  confirmation, KING-FM music element (HOME-gesture only).
- Doc-9 Phase 4 core (this session): shuffled deck + cursor with reshuffle;
  waiting queue (5 seed triage / 2 rush, silent), queue rows with per-patient
  waiting backgrounds, complaint strips, hint badges (→ select / ↔ swap),
  breathing attract animation; selection with immediate announced triage
  refill (doink via Web Audio sound registry); pre-assignment swap; blocking
  portrait preload (seed + 8 reserve) with clean failure back to HOME;
  rolling preload ahead of cursor; seven-room closed-door rail (art renders,
  clicks do nothing yet); unified patient chart PANEL setting.

### Patient panel layout — iterated live with John, APPROVED, do not rework

Chart card stack top-to-bottom (all inside `.patient-chart`, built once in
ui.js `buildPatientChart`, styled per-setting in styles.css):

1. Nameplate: centered dark plate, 86% width, small gap above, own box.
2. Scene: FULLY TRANSPARENT (no tint/gradient/scrim — John removed the blue
   hue) showing the corridor panel art; portrait bottom-anchored, honors
   authored imageFlipped/imageScale metadata.
3. Complaint plate: own centered box BELOW the portrait (never overlays the
   image — e.g. an injured foot must stay visible). Font clamp(8px, 2.6cqw,
   12px) w900 — largest text item.
4. Quote card: "PATIENT QUOTE" kicker + italic Georgia body.
5. Vitals: 3x2 label+value tiles, authored colors (yellow/red tint values);
   icons pending (see below).
6. Triage note: "TRIAGE NOTE" kicker + regular-Arial body (NOT condensed —
   deliberate, matches Georgia visual bulk). NO clipboard clip hardware
   (redundant; the Coach wrapper provides the clipboard).

Flex height shares: nameplate auto / scene 43 / complaint auto / quote 17 /
vitals 18 / note 19. Quote was deliberately enlarged from 12.5 and note
shrunk from 23.5 because quotes run longer than notes.
Body fonts (quote + note): clamp(7px, 2.2cqw, 10px); kickers clamp(6px,
1.9cqw, 9px). Sized down for MOBILE fit (desktop had slack); John said
"much better", stop iterating. If text ever clips, the planned fix is
demo-style auto-fit shrinking (fitTextToBox), not layout rework.

ANSWER/CLINICAL do NOT render in the panel (showSectionStrips: false).
They will render as full sections in the Coach/review settings of the SAME
buildPatientChart — one content builder, per-setting wrappers (confirmed
with John twice; he understands Coach reuses this shell).

## Next work (in order)

1. Doc-9 Phase 5: assignment + evaluation — door clicks, full-credit sets,
   strict/forgiving, direction, one-ledger-record-with-replacement, recall
   (orange arrow badge), open/closed door art swap, pulse on selected door
   only, result toast, correct/close/wrong sounds into the registry.
2. Phase 6 Coach: clipboard wrapper around buildPatientChart, whole-panel
   tap target, ANSWER locked, CLINICAL shift memory, pause while open.
3. Phase 7 scheduler: 250ms heartbeat, countdown, tick cues, RUSH arrivals
   + 20% bursts.
4. Phases 8-9: review, patients-seen, persistence/recovery. Then 10-11.

## Deferred / known items (do not lose)

- John: "we will fix the settings/about/etc text later" — popup board
  copy/layout is placeholder; revisit before release.
- Six vital icons: John chose GENERATE NEW art (not extract). assets/icons/
  is empty; vitals tiles have no icons yet.
- fitTextToBox auto-shrink not implemented yet.
- Long-press/hover room-guide popover not implemented (doc 7 supplemental).
- Empty-state hint arrow is plain text "◀ TAP A WAITING PATIENT"; demo had
  fancier CSS arrows.
- Archiving unused art (boombox, bubble PNGs, room interiors) proposed,
  awaiting John's OK — do not move files without asking.
- Favicon 404 in console — harmless; add a favicon someday.
- patient-data/patient-index.json is an EMPTY stub {"patients": []}; the
  real manifest is generated in assets.js (patient-001..160).

## Session workflow notes

- John reviews visually in HIS browser after each change — do not take
  screenshots to show him; use text snapshots for verification (context
  economy; his explicit preference after /context warnings).
- Iterate one small change at a time, wait for his verdict. He gives
  numbered change lists; acknowledge each, ask nothing mid-list.
- Dev servers: John uses start-triageRush.bat (port 8090). Claude's test
  server during sessions can be any port; cache is disabled via ?v= plus
  no-cache headers.
