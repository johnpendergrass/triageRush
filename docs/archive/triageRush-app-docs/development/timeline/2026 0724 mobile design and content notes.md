# Triage Rush Design Progress — 2026-07-24

## Purpose

This note records the UI, viewport, patient-text, and triage-content decisions
made during the July 24 ChatGPT work session. It is intended to guide the next
implementation and patient-data passes without relying on chat history.

## 1. Mobile browser canvas

Triage Rush is a portrait, non-scrolling browser game. It must be designed for
the playable area remaining while Safari or Chrome browser controls are visible,
not for the phone's advertised full-screen resolution.

### Fixed canvas decision

- Logical game canvas: **360 × 640 CSS pixels**
- High-resolution design/mock-up canvas: **1080 × 1920 pixels**
- Aspect ratio: **9:16**
- The game is authored for the minimum browser state.
- The game does **not** expand or reflow when browser controls retract.
- Extra visible space becomes letterboxing.
- The complete canvas scales uniformly; internal elements do not independently
  resize or rewrap.
- No document, panel, clipboard, quote, or presentation scrolling is allowed.

The detailed contract and test matrix are in:

`claude-john-docs/DESIGN/mobile-viewport-contract.md`

The older 1024 × 1536 mock-ups are 2:3 and are not valid proportion references.
The generated 864 × 1821 experiment is also invalid because it is too tall.

## 2. Main gameplay layout

### Three-column structure

- Left waiting-room rail and right room-door rail should be visually symmetric.
- Working proportion: approximately **22% / 56% / 22%**.
- The active patient column is precisely centered.
- All five waiting-room patients remain centered inside their individual panels.
- Number badges remain consistently placed at the upper-left of each waiting
  patient panel.
- The room doors may be narrower than in the fourth-cut design, but must retain:
  - generous vertical touch targets;
  - room names;
  - ESI guidance where applicable;
  - recognizable door imagery and room colors.

The active patient image and every waiting-room image must remain completely
stationary when the information clipboard opens. The clipboard is an overlay;
underlying content must never move to make room for it.

## 3. Default patient card

The default card shows:

1. Patient portrait.
2. `quoteShort`.
3. Six vitals.
4. `presentationShort`.
5. One shared `…` information control.

The presentation text should be modestly larger and easier to read than in the
original fourth-cut mock-up.

Every fact required for a medically defensible room assignment must remain
available in the default card through the image, demographics, `quoteShort`,
`presentationShort`, and vitals. Opening the expanded information panel must
never be required to make a fair placement.

## 4. Expanded information clipboard

Tapping the single `…` control opens one medical-clipboard overlay containing:

- the full `quoteLong`;
- the `presentationLong` intern handoff;
- a large **RETURN TO PATIENT ↩** button.

There are not separate quote and presentation expansion controls.

### Placement

The clipboard overlays:

- part of the waiting-room rail;
- part of the active patient portrait;
- the patient quote region.

It must never cover:

- any vital;
- `presentationShort`;
- essential clinical decision information.

Intended geometry for the coded version:

- Left edge begins at/overlaps the waiting-room number-badge column.
- Top edge begins around the middle of waiting-room patient panel 1.
- Right edge overlaps the left portion of the fixed patient portrait, leaving
  the patient's face and some posture visible naturally.
- Bottom edge aligns with the bottom of the normal patient quote box and leaves
  a definite gap above the vitals.

The image generator did not place all four edges reliably. These coordinates
must be implemented deterministically in HTML/CSS rather than inferred from the
latest generated clipboard image.

### Modal behavior

- While the clipboard is visible, **no other control is active**.
- Header, footer, waiting-room rail, and room-door rail become grayscale.
- They are not darkened, blurred, or hidden.
- The complete central patient column remains in full color beneath the overlay:
  portrait/corridor, quote region, vitals, and `presentationShort`.
- The clipboard and return button remain in full color.
- The grayscale state communicates that surrounding controls are temporarily
  inactive.
- There is no small `×` close control.
- The obvious close action is **RETURN TO PATIENT ↩**, with the curved arrow at
  the right end so it points back into the screen.
- No other gameplay button responds until the clipboard is closed.

## 5. Patient JSON text fields

The existing `quote` field is intended to be replaced by:

- `quoteShort`
- `quoteLong`

These parallel:

- `presentationShort`
- `presentationLong`

### Intended use

- `quoteShort`: normal patient card; personality plus a useful clue.
- `quoteLong`: optional expanded clipboard; fuller patient voice.
- `presentationShort`: normal patient card; all placement-critical clinical
  facts.
- `presentationLong`: optional clipboard; concise attending-style intern
  handoff with useful context and negative findings.

### Proposed maximum word counts

These remain the working authoring limits and should be validated in the coded
9:16 layout before migrating all patient JSON:

| Field | Proposed maximum |
|---|---:|
| `quoteShort` | 20 words |
| `quoteLong` | 40 words |
| `presentationShort` | 30 words |
| `presentationLong` | 60 words |

The planned comment under each JSON `clinical` object is:

```json
"_comment": "Maximum word counts: quoteShort = 20, quoteLong = 40, presentationShort = 30, presentationLong = 60. All placement-critical clues must appear in the short fields. Long fields provide optional detail and must fit the expanded panel without scrolling."
```

Do not migrate the full patient bank until the coded 9:16 card and clipboard
confirm these rendered limits. Word counts are authoring guards; actual rendered
fit is the final authority.

## 6. Clinical-content audit status

The seven approved pilot changes were applied to patients:

- 003
- 017
- 055
- 072
- 129
- 145
- 160

A full 160-patient audit was completed using player-visible evidence. After the
quote was confirmed as player-visible, the review boundary became:

- image;
- demographics;
- patient quote;
- `presentationShort`;
- vitals.

Current audit result:

- 126 passed without material concern.
- 8 need ESI or primary-room review.
- 10 need a more forgiving alternate room.
- 18 presentations contain answer-revealing diagnostic wording.
- No additional image-versus-diagnosis mismatch was found during that pass.

Audit files:

- `chatGPT-dev-stuff/disposition-audit/full-audit-review.md`
- `chatGPT-dev-stuff/disposition-audit/full-audit-results.json`
- `chatGPT-dev-stuff/disposition-audit/rubric.md`
- `chatGPT-dev-stuff/disposition-audit/text-capacity-audit.md`

The new short/long-field design supersedes the earlier assumption that all text
must fit simultaneously on the default card, but short fields must still contain
every required triage clue.

## 7. Image mock-up set

### Original visual reference

- `2026 0722 triageRush 4th cut (chatGPT).png`

This remains the main reference for the realistic waiting room, tiled corridor,
medical doors, overall material treatment, and original patient-card styling.
Its 2:3 canvas is not the final mobile proportion.

### Text and clipboard explorations

- `2026 0724 triageRush short-text mockup.png`
- `2026 0724 triageRush expanded-clipboard mockup.png`
- `2026 0724 triageRush left-clipboard grayscale mockup.png`
- `2026 0724 triageRush fixed-patient left-clipboard mockup.png`
- `2026 0724 triageRush symmetric-rails clipboard mockup.png`
- `2026 0724 triageRush fixed-9x16 expanded-clipboard mockup.png`

These are concept references, not exact geometry specifications.

### Latest centered base and modal references

- `2026 0724 triageRush symmetric-centered base mockup.png`
- `2026 0724 triageRush symmetric-centered clipboard mockup.png`

The centered base is the clearest current reference for:

- a 9:16 game canvas;
- symmetric side rails;
- centered active patient;
- centered waiting-room patients;
- larger presentation text.

The clipboard image illustrates the modal motif and grayscale concept, but its
clipboard edge coordinates should be corrected in code according to Section 4.

## 8. Recommended next sequence

1. Build the fixed 360 × 640 / 9:16 HTML/CSS game shell.
2. Implement symmetric side rails and verify touch-target sizes.
3. Implement the clipboard overlay with deterministic coordinates.
4. Implement modal grayscale and input blocking.
5. Render at the viewport test matrix in
   `mobile-viewport-contract.md`.
6. Establish the real rendered word/line limits.
7. Finalize the four patient-text limits and JSON `_comment`.
8. Migrate all 160 current patient JSON files to `quoteShort`/`quoteLong`.
9. Rewrite short and long text within the proven limits.
10. Apply approved medical-audit changes and rebuild derived game/player files.

## 9. Items not yet finalized

- Exact clipboard pixel coordinates within the 360 × 640 logical canvas.
- Final rendered word limits for all four text fields.
- Whether the popup pauses any timer; the current game-flow design should avoid
  penalizing players for reading optional detail.
- Dedicated desktop layout. Until later work, desktop may center and letterbox
  the mobile 9:16 canvas.

