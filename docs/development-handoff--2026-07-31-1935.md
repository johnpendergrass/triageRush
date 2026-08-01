# triageRush Schema 2.1 and Mobile Detailed-Patient Handoff

**Current version:** 2026-07-31 19:35 PDT

**Last committed baseline:** `fbbac26 just before redoing the patient jsons files to new version`

**Working-tree status:** The work described below is complete locally but has
not yet been committed in a new checkpoint. The user-created
`patient-data - Copy/` backup remains intentionally untouched.

## Start here next session

Before making another major change, review the discussion checklist near the
end of this handoff. The first requested design work is to decide how treatment
rooms should display their backgrounds and assigned patients. Do not begin the
End of Shift Report until John returns to that feature explicitly.

## Work completed since the last commit

### Definitive patient schema 2.1

- Established schema version **2.1**, dated **2026-07-31**.
- Consolidated displayable patient content beneath one `patient` object with
  three explicit sections:
  - `patient.presentation`: evidence available before assignment
  - `patient.answer`: authoritative ESI and destination answer
  - `patient.clinical`: evidence-based explanation used by Coach and review
- Replaced short/long quote and presentation variants with one complete
  `quote` and one complete `triageNote`.
- Kept visibility state out of the schema. The application decides which of
  the three sections is exposed.
- Consolidated the proposed-schema document into the definitive schema notes;
  `proposed-schema-changes.md` is now redundant and removed from the live
  schema folder.
- Added the fixed clinical-explanation order, form-letter rules, evidence
  restrictions, possible-diagnosis disclaimer, and the `(maybe)` convention
  for plausible less-serious outcomes.
- Temperature remains stored in Celsius and is displayed as paired Celsius /
  Fahrenheit values, for example `37.0 / 98.6`.

Authoritative files:

- `patient-data/schema/patient-schema-template.json`
- `patient-data/schema/patient-schema-notes.md`
- `patient-data/schema/migrate-v20-review-to-v21.mjs`

### Reviewed patients 001–010

- Reprocessed patients 001 through 010 into schema 2.1 without overwriting the
  production 1.2 records.
- Audited image, quote, vitals, triage note, ESI, destination, expected
  resources, possible outcomes, and evidence traceability for each patient.
- Removed diagnosis disclosures from player-visible presentation evidence.
- Compared the second review with the earlier draft-schema pass.
- Patients 001–009 retained their clinical placement. Patient 010 changed from
  ESI 3 to ESI 2 after the evidence and severe-flank-pain guidance were
  rechecked.
- Copied the active reviewed patients and matching images into the mobile demo.

Review files:

- `patient-data/patient-json-v21-review/patient-001.json` through
  `patient-010.json`
- `patient-data/patient-json-v21-review/review-log-001-010.md`

The remaining production patients 011–160 have not been migrated or audited.

### One reusable detailed-patient chart

- Replaced separate detailed-patient and Coach displays with one reusable
  hospital-chart panel.
- The panel always begins with the large patient image, followed by identity,
  complaint, quote, vitals, and triage note.
- Current application presets are:

  ```text
  Before assignment: presentation ON, answer OFF, clinical OFF
  After assignment:  presentation ON, answer ON,  clinical ON
  ```

- The post-assignment Coach view adds the player's placement, correct ESI,
  over-/under-triage evaluation, explanation, resources, key findings, red
  flags, teaching points, and possible outcomes.
- Close remains anchored in the upper-right. `MORE ABOVE` and `MORE BELOW`
  appear only when scrolling in that direction is useful, and scrolling is
  smooth.
- The detailed chart is intended to become the future Patient Review panel as
  well; the schema does not encode the display switches.

The working design contract is documented in
`_testAppDesktop/docs/coach-and-patient-review-panel.md`.

### Mobile patient-panel cleanup

- The occupied compact patient panel is covered by one large transparent tap
  target that opens the detailed chart.
- Removed the `VIEW FULL CHART` text badge.
- Added a slightly larger magnifying-glass cue in the lower-right of the triage
  note. It is purely visual, has `pointer-events: none`, and is not a separate
  tap target.
- Removed the redundant program-generated room-number/name badges; the door
  artwork remains the visual room label.
- Preserved desktop hover/focus room definitions.
- Added the mobile equivalent: press and hold a treatment door for about half
  a second. Releasing closes the definition without assigning the patient;
  normal tapping still assigns.
- Reworked the empty center panel into a directional instruction card. After
  assignment it explains selection from the waiting room, recall from the last
  treatment room, press-and-hold ESI definitions, and Coach review. The Coach
  instruction appears only after Coach becomes available and its downward
  arrow is centered over the Coach button.

## Current detailed-panel design status

The unified chart and its three information levels are the accepted working
direction. Final vital-value positioning still needs cleanup. In particular,
the compact vital artwork may need patient-specific alignment once production
game implementation begins.

The current pre-assignment behavior hides the Answer and Clinical sections
entirely. That behavior is **not final**; see the discussion checklist below.

## TODO and discussion checklist for the next session

These are deliberately recorded as questions or design tasks, not approved
decisions.

1. **Add room backgrounds and assigned patients to the treatment rooms.**
   Design and implement the room-interior/background layer and decide how the
   assigned patient is positioned, scaled, and retained while the room is open.
2. **Reconsider the circular queue/recall arrow pointers.** Now that the center
   instruction panel explicitly explains selection and recall, determine
   whether the arrow-circle cues are helpful reinforcement or redundant visual
   noise. Do not remove them until the interaction remains discoverable without
   them.
3. **Consider persistent locked previews of Answer and Clinical.** Instead of
   removing those sections before assignment, consider always rendering both
   as compressed chart sections. Immediately below each header, show:

   > NOT AVAILABLE UNTIL YOU HAVE ASSIGNED THE PATIENT

   Once assignment unlocks the chart, expand those sections and replace the
   notice with their real content. This could teach the player that additional
   review will become available without exposing the answer early. Discuss the
   collapsed height, locked visual treatment, scrolling consequences, wording,
   and whether both sections unlock together before implementing it.
4. **Continue the schema 2.1 clinical audit with patients 011–160** only after
   the first ten records and the chart presentation are accepted.
5. **Finish compact vital-value alignment** during production integration.

## Files materially changed since the checkpoint

- `patient-data/schema/patient-schema-template.json`
- `patient-data/schema/patient-schema-notes.md`
- `patient-data/schema/migrate-v20-review-to-v21.mjs`
- `patient-data/patient-json-v21-review/`
- `patient-data/README.md`
- `_testAppMobile/index.html`
- `_testAppMobile/styles.css`
- `_testAppMobile/app.js`
- `_testAppMobile/README.txt`
- `_testAppMobile/patient-data/`
- `_testAppDesktop/docs/coach-and-patient-review-panel.md`
- `docs/patient-data-and-assets--2026-07-29-1655.md`
- `docs/scoring-specification--2026-07-29-1655.md`

## Verification already performed

- Schema 2.1 template and reviewed patient structure validated.
- Ten reviewed JSON records parsed and matched their mobile demo copies.
- Production patient records remained unchanged during the first-ten review.
- Mobile JavaScript syntax checks passed.
- Mobile layouts and interaction states were visually checked at a 390 × 844
  viewport, including pre-assignment presentation, post-assignment Coach,
  directional instruction card, room-definition gesture wiring, and the
  magnifying-glass cue.
- `git diff --check` reports no whitespace errors; line-ending conversion
  warnings remain informational on this Windows checkout.

## Change history

- **2026-07-31 19:35 PDT:** Recorded schema 2.1, the patients 001–010 review,
  the reusable detailed-patient chart, mobile interaction cleanup, and the
  next-session discussion list.
