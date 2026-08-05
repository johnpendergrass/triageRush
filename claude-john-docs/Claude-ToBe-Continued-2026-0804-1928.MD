# Claude-ToBe-Continued — 2026-08-04 19:28 (third session, same day)

Read this first, then: `docs/1-start-here-toc.md`, the current
`docs/99-ai-handoff--*.md`, and
`docs/_2026-0804 design changes - sound model and unified patient chart
(Claude session).md` (AMENDS docs 3-9 where they conflict; its addendum
now also records this session's decisions). Persistent memory notes exist
(ER Entrance naming, room art layering) and load automatically.

## Build state (NOT yet committed — John commits via GitHub Desktop)

Working game at repo root `index.html` + `triageRush/{assets.js, game.js,
ui.js, app.js, styles.css}`. Run with `start-triageRush.bat` (port 8090);
NEVER open index.html by double-click (fetch fails on file://).
Cache version strings are now "2026-0804-phase5" (index.html + assets.js).

### Completed this session (all John-approved on sight)

- **Doc-9 Phase 5 COMPLETE**: evaluation (full-credit sets with
  psych/discharge dual correctness, strict/forgiving, required order),
  direction classification, `assignActivePatientToRoom` with
  one-ledger-record-per-patient REPLACEMENT semantics, recall
  (`recallAssignedPatient`, silent per spec but see recall sound below),
  finalize-on-next-selection inside `selectWaitingPatient`, door open/closed
  art swap, orange recall arrow, feedback pulse on selected door only,
  result toast (✓ CORRECT / △ CLOSE / ✕ WRONG) ~1/3 down the center panel,
  correct/close/wrong synthesized sounds in the registry.
  All 58 doc-9 unit cases passed (evaluation table, 8-step reassignment
  gate, finalize-by-selection) via a Node shim harness in the session
  scratchpad (ephemeral; rebuild from doc 9 if needed). Browser-driven
  smoke test passed; only console noise is the harmless favicon 404.
- **Recall sound** (John's addition, amends "recall is silent"): first two
  notes of the correct arpeggio (C5, E5), registry entry `recall`.
- **Persistent outcome halo**: the occupied door keeps its green/amber/red
  ring (class `is-outcome-*`, state-driven from the ledger) until the room
  closes; the transient `is-feedback-*` flash pulses 3x on top at
  evaluation. Both share one ::after ring in styles.css.
- **Nameplate**: age/sex is a cream "wristband" chip reading `age 10 · M`,
  font clamp(8px, 2.4cqw, 11px); long names truncate with ellipsis and the
  chip never shrinks (flex-shrink 0).
- **Quote + triage-note body fonts** raised to clamp(8px, 2.4cqw, 11px)
  ("leave at that size for awhile").
- **Naming: the opening screen is "ER ENTRANCE"** (not lobby, not
  Check-In — John tried both). Player-facing only; internal names
  (`view:"home"`, `returnToLobby`, asset key `lobby`, folder `lobby-page`)
  unchanged. Docs 3/7 still say "lobby" — sweep at next doc pass.
- **Footer**: `◀ LEAVE SHIFT / RETURN TO ER ENTRANCE` and
  `STOP SHIFT EARLY ▶ / REVIEW THIS SHIFT`; grid now 1.4fr 0.2fr 1.4fr
  (thin decorative middle). Arrows are separate edge-pinned spans sized to
  the box (~13cqw), not the label text.
- **Both footer actions confirm**: quit dialog ("Leave this shift?") and
  NEW stop dialog ("Stop this shift early?"), buttons "Whoops! I want to
  keep playing!" / "Yes, leave shift" and "Yes, stop shift". New overlay
  value "confirm-stop"; Escape cancels either.
- **Empty-state box**: 9:16 aspect (same proportion as the shell), width
  kept, vertically centered. Hints rebuilt per render: always
  "◀━━ TAP A WAITING ROOM PATIENT"; when recallAvailable adds italic "or"
  + "TAP THE TRIAGE ROOM DOOR TO RECALL THAT PATIENT ━━▶". Arrows are
  white fused glyph arrows (◀+━ with negative letter-spacing), 1.6em,
  nudge animation. IMPORTANT: triangle glyphs carry U+FE0E variation
  selectors or iPhones render them as boxed emoji (also applied to the
  door recall arrow).
- **Rails background**: `background-wall-for-all-rooms.png` REMOVED from
  rails/play-area; both are flat dark green #0f3d2f ("we may play with
  the background color later"). Removed from manifest and boot CSS vars.

### Key clarification from John (recorded in memory too)

Triage room art is a LAYERED composition, bottom to top: shared wall PNG →
per-room interior PNG → patient → door art. The wall and
`background-*-room.png` interiors are RESERVED for that future rendering —
do NOT archive them (supersedes older archive proposals for those files).
Occupied-room-shows-patient rendering is not built yet; deferred by John.

## Next work (in order)

1. Doc-9 Phase 6 Coach: clipboard wrapper around the SAME buildPatientChart
   (setting wrappers concept), whole-panel tap target, ANSWER locked,
   CLINICAL shift memory, pause while open, focus restore.
2. Phase 7 scheduler: 250ms heartbeat, countdown, tick cues, RUSH arrivals
   + 20% bursts (state fields already exist in `state.rush`).
3. Phases 8-9: full review scorecard, patients-seen browser,
   persistence/recovery. Then 10 (asset optimization) and 11.

## Deferred / known items (do not lose)

- Layered room rendering (wall/interior/patient/door) — when John asks.
- Six vital icons: GENERATE NEW art; assets/icons/ still empty.
- Settings/about popup text is placeholder; fix before release.
- fitTextToBox auto-shrink not implemented (the fix for any text overflow;
  never rework the approved panel layout).
- Long-press/hover room-guide popover (doc 7 supplemental).
- Archiving unused art (boombox, bubble PNGs) still awaiting John's OK;
  room wall/interiors are NO LONGER archive candidates (see above).
- Favicon 404 — harmless; add a favicon someday.
- Docs 3/7 wording sweep: lobby→ER Entrance, Quit/Stop Game→Leave/Stop
  Shift, recall-silent→recall sound, wall-art-behind-rails→flat green.

## Session workflow notes (unchanged and still true)

- John reviews visually in HIS browser (desktop + iPhone) after each
  change; use text snapshots for verification, not screenshots.
- One small change at a time; wait for his verdict; he gives numbered
  change lists.
- Claude's test servers: any port but 8090 (that's John's .bat); kill them
  when done. Chrome-devtools MCP works well for click-through smoke tests.
