# triageRush — Interface and Layout Transition

**Last reviewed:** 2026-07-26 11:13 PDT
**Status:** Existing assets documented; revised layout under discussion

## Current authority

The v1 interface was designed around five destination doors and five matching
side rows. That geometry is archived and is not a binding requirement for the
revised seven-choice design.

No final v2 interface geometry has been approved.

## Assumptions that remain useful

Unless later testing changes them, the revised design is still expected to be:

- A mobile-browser game.
- Primarily portrait-oriented.
- Tap-driven rather than dependent on drag-and-drop.
- Non-scrolling during active play.
- Built with full-cell semantic controls and visible focus treatment.
- Able to present all evidence required for a fair decision before placement.

The previous 360 × 640 logical canvas and 9:16 design work remain useful
starting references, not locked v2 requirements.

## New interface requirements

The revised interface must accommodate:

- Seven treatment choices rather than five.
- Distinct, readable ESI 1–5 choices.
- Visually differentiated Psych and Discharge choices.
- Green, orange, red, and light-green feedback pulses.
- Text or symbols accompanying color and sound feedback.
- A Coach affordance that remains unavailable until after a decision.
- A post-decision Coach view.
- Game-mode timer and numeric scoring.
- Edu-mode Correct/Close/Wrong outcome tallies.

## Existing artwork status

The selected v1 artwork remains stored at:

`docs/DESIGN/REFINING IMAGES/SELECTED ARTWORK/`

Those assets are historical/design inputs. They are no longer the automatic
production-art authority because:

- The door set represents five consolidated choices.
- Seven stacked choices change the available cell height.
- Separate ESI 2, ESI 3, ESI 4, and ESI 5 treatments may require new visual
  language.
- A Coach card introduces a new overlay and interaction state.

Patient images and reusable patient-panel components may still be suitable
after layout testing.

## Working layout observations

Seven equal choices within the previous 560 CSS pixel play height would be
approximately 80 CSS pixels tall rather than 112. This can provide usable touch
targets, but the detailed scenic door art may become visually cramped.

Possible directions still under discussion include:

- Seven compact treatment bays in the existing right rail.
- Simplified destination controls instead of seven miniature door scenes.
- One visual family for ESI 1–5 and distinct styling for Psych/Discharge.
- A Coach overlay using the central patient region.
- A broader screen redesign if the three-column composition cannot remain
  readable.

None of these alternatives is yet selected.

## Feedback accessibility

The design must not rely solely on:

- Color, because of color-vision differences.
- Sound, because devices may be muted and players may have hearing
  differences.

Each result should combine visual animation with a concise symbol or word.
Sound should be mutable without disabling other feedback.

## Validation still required

Before interface geometry becomes canonical:

1. Create low-fidelity seven-choice layouts.
2. Test label and artwork legibility at representative mobile sizes.
3. Test all feedback states.
4. Test the hidden, newly available, open, and dismissed Coach states.
5. Test both Game and Edu status displays.
6. Confirm that no required patient evidence is obscured.
7. Confirm full touch targets, focus behavior, and safe-area handling.

The detailed v1 contract remains available in the
[archived interface and layout document](../archive/v1-original-concept-single-source-of-truth/interface-and-layout.md).
