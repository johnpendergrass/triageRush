# triageRush — Interface and Layout Transition

**Last reviewed:** 2026-07-26 19:21 PDT
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
- Green, cyan, orange, red, and light-green feedback pulses.
- Text or symbols accompanying color and sound feedback.
- A Coach affordance that remains unavailable until after a decision.
- A post-decision Coach view.
- Game-mode timer and numeric scoring.
- Edu-mode Correct/Acceptable/Close/Wrong outcome tallies.

## Seven-door geometry and labels

The first seven-door mockup retains the v1 logical canvas as a design
reference:

- Full canvas: 1080 × 1920 raster pixels / 360 × 640 CSS pixels.
- Header: 120 raster / 40 CSS pixels.
- Play area: 1680 raster / 560 CSS pixels.
- Footer: 120 raster / 40 CSS pixels.
- Door-panel width: 238 raster pixels / approximately 79.33 CSS pixels.
- Seven equal door cells: `1680 ÷ 7 = 240` raster pixels each.
- Seven equal CSS rows: `560 ÷ 7 = 80` CSS pixels each.
- The corrected visual mockup uses seven identical 144 × 224 raster-pixel
  portrait door slabs centered inside those cells.

The door rail should use:

```css
grid-template-rows: repeat(7, minmax(0, 1fr));
```

Every outer door cell must have the same width and height. Decorative artwork,
labels, and internal padding must fit inside the cell rather than changing its
dimensions.

ESI 1–5 use a single continuous door slab without a center vertical seam.
Their shared visual contract is:

- The clean base artwork contains no treatment-name plaque, text, ESI badge,
  ESI number, or other sign panel.
- Treatment-name plaques and ESI badges will be designed as separate overlay
  assets and applied later in an image editor or at runtime.
- For those future overlay assets, every treatment name uses the same font
  size; `EMERGENT` is the width authority and two-line `LESS URGENT` is the
  height authority.
- The clean base retains a shortened rectangular vision-glass panel, normal
  door lever, lower metal kickplate, colored slab texture, and institutional
  metal frame.
- All five clean doors use identical glass, hardware, kickplate, and frame
  geometry.
- The richer dimensional door textures, colors, metal framing, treatment
  plaques, and ESI badges established by the `2026 0726f` mockup are the
  current visual direction. The flatter redraw in `2026 0726g` is not the
  styling reference.
- The earlier `IN USE` indicator lights are removed from the entire door rail.
  No ESI, Psych, or Discharge choice has an indicator light above it.

The approved label content is:

```text
ESI 1       ESI 2       ESI 3       ESI 4       ESI 5
RESUS       EMERGENT    URGENT      LESS        NON-
                                    URGENT      URGENT
```

Psych and Discharge use the same outer cell dimensions as all five ESI doors.
Their architecture may differ inside that cell.

- Psych is a closed single door with a warmer, calmer professional-office
  character and a conventional round stainless institutional doorknob. It has
  no glass panel and no indicator light. Its rich medium-walnut texture follows
  the `2026 0726j` color direction, with warmer highlights, a satin finish, and
  softer contrast to feel more inviting without becoming residential. Its
  clean base artwork contains no `PSYCH` plaque, `BEHAVIORAL HEALTH` subtitle,
  text, badge, or other sign panel; those will be separate overlay assets. The
  complete outer frame uses the same 144 x 224 dimensions as every ESI door
  and must not be shortened or fitted into leftover space. Its closed-door
  artwork must have a clean frame with no floor, steps, molding, or
  neighboring-door artifacts.
- Discharge is the intentional double-door exception. It uses the selected
  glass exit doors leading outdoors, including the central meeting seam,
  daylight, push bars, and accessibility/exit cues. Its selected artwork
  already contains the word `DISCHARGE`, so no separate label is added.
- The Discharge artwork fills its complete outer cell so its walls and floor
  read as one continuous area rather than an inset alcove. Floor tiles extend
  across the full width of the cell.

The `2026 0726h` refinement combines the `f` visual treatment with the exact
seven-row geometry and the integrated Discharge treatment from `g`.

The warm beige wall areas beside every centered door use the horizontal
protective board runner/chair rail and lower baseboard language from the
selected waiting-room backgrounds. The bands are a light, desaturated
blue-gray rather than the more prominent dark green/teal used in earlier
mockups. `2026 0724s triageRush waiting room background 4.png` is the color and
architectural reference, with the door-rail bands intentionally made more
subdued.

The reusable production wall tile is `2026 0726zc`. It is exactly 238 x 240
raster pixels, matching one complete door cell. It contains subtle warm plaster
texture, a 238 x 13 upper runner at y 139, a 238 x 12 lower runner at y 192,
and a 4-pixel dark bottom separator. The verification mockup `2026 0726zd`
stacks seven identical tiles into an exact 238 x 1680 panel without gaps,
scaling drift, or accumulated rounding.

Closed-door designs are being finalized first. Matching open states will be
designed only after the closed set is approved.

The clean unlabeled closed-door working set is shown in `2026 0726v`. Separate
144 x 224 raster assets for ESI 1-5 and Psych are stored alongside that mockup
as `2026 0726w` through `2026 0726zb`.

## Room hover and touch-hold education

In project discussions, the word `hover` covers the equivalent interaction
across pointer types:

- Desktop mouse or trackpad: the pointer enters a room control.
- Mobile touchscreen: the player presses and holds the room control for
  approximately 500 milliseconds.
- Keyboard: the room control receives focus.

Hover displays a small temporary room-guide popup. The popup disappears when
the pointer leaves, the touch is released or cancelled, or keyboard focus
leaves the room control.

A quick mobile tap remains the placement action. A completed touch hold must
suppress the click that normally follows `pointerup`, so inspecting a room
cannot accidentally commit a patient placement. Moving more than approximately
8-12 CSS pixels before the hold threshold cancels the hold and must not commit
a placement. Implement this with Pointer Events, `pointercancel` handling, and
a visible hold-activation response. Brief haptic feedback may be used where the
device and user settings allow it.

The popup should appear to the left of the door rail on mobile so the player's
finger does not cover it. It must be concise, legible at mobile size, and must
not permanently obscure required patient evidence.

Room-guide information explains the meaning of the control only. It must never:

- Evaluate the current patient.
- Indicate whether the hovered room is correct for the current patient.
- Reveal patient-specific clinical reasoning.
- Replace or unlock the post-decision Coach card.

Working room-guide copy:

| Choice | Temporary explanatory copy |
|---|---|
| ESI 1 - Resuscitation | Immediate life-saving treatment is required. |
| ESI 2 - Emergent | High-risk or severe symptoms that should not wait. |
| ESI 3 - Urgent | Stable now, but likely needs several tests or treatments. |
| ESI 4 - Less Urgent | Stable and likely needs one test or treatment. |
| ESI 5 - Non-Urgent | Stable and generally needs examination or simple care only. |
| Psych | Behavioral-health evaluation for a medically stable patient. The patient still has an underlying ESI level. |
| Discharge | Emergency treatment is not needed. Provide guidance, follow-up, or routine care. |

This information is expected to be available in both Game and Edu modes because
it teaches the meaning of the controls rather than giving patient-specific
hints. Essential functionality must not depend on hover or a long press.

## Patient selection, assignment, and recall

After the player assigns the active patient to a room in either mode:

1. The active patient and all patient-specific evidence disappear from the
   center patient panel.
2. The brief `Correct`, `Acceptable`, `Close`, or `Wrong` result appears
   prominently in the cleared center panel.
3. After the result fades, the center panel remains empty and directs the
   player to choose a patient from either the triage queue or the still-open
   assigned room.

The player may fill the empty patient panel in either of two ways:

- Tapping a triage-queue patient finalizes the assigned case, closes its door,
  places the selected queue patient in the center, and resets first-assignment
  scoring for the newly selected patient.
- Tapping the still-open assigned room recalls that same patient, closes the
  door, restores the complete patient evidence in the center, and locks Coach
  for another placement attempt.

While recall is available, a static left-pointing arrow appears at the
vertical center of the assigned room cell. Its center straddles the boundary
between the rooms rail and patient panel, so half of the marker sits in each
area and visually suggests moving the patient back inward. It appears only on
the one open room holding the recallable patient and disappears when that door
closes, the patient is recalled, or a queue patient is selected. The marker is
a hint, not a separate touch target.

The triage queue must also remain selectable while a patient is already visible
in the center panel. In that state, selecting a queue patient performs a true
position-preserving exchange: the current unassigned patient returns to the
exact queue cell vacated by the selected patient. The queue is not reordered.
If the center is empty after an assignment, the completed patient leaves active
play. The selected queue patient moves into the center, every patient below the
selected cell shifts upward one slot, and a fresh random patient from the
patient store enters the final queue slot.

### Triage-queue presentation and transfer cues

The working queue has five compact equal visual cells. Browser refresh and
Reset Round begin with all five queue cells occupied and the patient panel
empty. Selecting queue slot 3 in that state, for example, moves its patient
into the patient panel, shifts former slots 4 and 5 upward into slots 3 and 4,
and places a fresh patient from the patient store into slot 5. More generally,
whenever a fresh patient is added from the store, existing queue patients first
compact upward to fill empty slots and the new patient enters the lowest
available slot. The queue does not show ordinal numbers on patients and does
not use a separate `WAITING` plaque.

Each occupied queue cell is a layered composition, back to front:

1. One randomly selected image from the 16 approved `waiting room background`
   assets in `docs/DESIGN/SELECTED ARTWORK`.
2. The queued patient's transparent image.
3. The cell frame, complaint label, transfer marker, and other interface
   overlays.

The selected background is state attached to that queued patient rather than
chosen during rendering. It therefore remains unchanged when the queue redraws,
when that patient moves during queue compaction, and when the patient is
exchanged with the patient panel. A newly introduced patient receives a new
random background. Visible queue patients should avoid duplicate backgrounds
when alternatives are available.

Queue cells use a tangible institutional frame rather than the earlier beige
card with a thin white edge. The frame and empty-cell treatment mirror the warm
wall, subdued blue-gray horizontal runner, and darker baseboard colors used in
the room-panel wall artwork.

Every occupied queue cell displays a compact circular marker centered on and
straddling the boundary with the patient panel:

- When the patient panel is empty, a static right arrow (`→`) points inward and
  indicates that tapping moves that queued patient into the panel.
- When the patient panel contains a patient, a static double-ended arrow (`↔`)
  indicates that tapping swaps the queued and active patients.
- Empty queue cells have no arrow.

The queue and room-recall markers form one visual family. Both use stationary
circles smaller than the earlier recall marker, bold static arrows optically
centered inside their circles with a slight upward optical correction, and a
dark background that is approximately 25 percent transparent. The markers are
hints rather than separate touch targets.

The application should maintain a per-active-patient Boolean state named
`previouslyAssigned`:

- It is `false` when a patient is first selected from the triage queue.
- The first room assignment is evaluated, scored or tallied, and then changes
  it to `true`.
- Recalling the patient from the open room does not reset it.
- Every later assignment of that recalled patient produces normal audiovisual
  feedback and post-decision Coach behavior but does not change the Game score
  or Edu tallies.
- Only selecting a patient from the triage queue resets it to `false`.
- Starting or resetting an entire session may initialize it to `false`.

Game mode must not pause the timer during assignment, the empty-panel state,
room recall, or queue selection. Neither mode should automatically choose the
next patient or provide a separate Next action that bypasses the triage queue.

### Post-decision Coach card

The Coach overlay should preserve the patient's decision-time evidence in a
compact case-review format. Its visual and reading order is:

1. A small full-patient image with name, age/demographic, and complaint.
2. The patient's quote.
3. The complete vital-sign set.
4. The triage comment.
5. The player's choice, intended choice, and
   Correct/Acceptable/Close/Wrong result.
6. The current clinical suggestion or explanation.

The patient evidence is a recap of information that was available before the
decision, not newly revealed evidence. The card remains unavailable until an
actual room assignment has been made and should scroll within the overlay when
needed on a small mobile screen.

When additional Coach content exists below the visible portion of the card, an
obvious animated `MORE BELOW` down-arrow remains at the card's lower edge. It
disappears when the player reaches the bottom or when all content already fits.
The indicator may also be tapped to advance the card by most of one visible
page, while ordinary touch scrolling remains available.

The Coach window should remain fully contained and visually balanced within the
mobile viewport. Its working height is 82 percent of the overlay's available
height in the current prototype. It is offset slightly upward so additional
height is added above while preserving the previously approved lower edge.
Only the case-review content scrolls. The Close control is fixed to the
window's upper-right corner and must remain visible regardless of the content's
scroll position.

### Future occupied-room composite TODO

The idea of showing the assigned patient inside the selected open room remains
a future enhancement. It is intentionally not implemented in the current test
application because every current open-door PNG combines the room interior,
medical equipment, frame, and open door into one opaque bitmap. A patient
cannot be placed correctly between the equipment and the door using those
assets.

Implementing this idea requires newly separated artwork with this layer order:

1. The 238 x 240 cell wall background.
2. The 144 x 224 room interior and medical-equipment background.
3. The assigned patient's transparent image.
4. The open door, frame, hardware, threshold, and foreground shadows.
5. The ESI badge, treatment-name label, and feedback overlays.

Working requirements to revisit with the separated assets:

- The complete patient image, not a head-and-shoulders crop.
- The existing transparent patient PNG.
- A working displayed size approximately three quarters of the corresponding
  triage-panel patient image. This is a scale experiment and remains subject to
  mobile review.
- A position within the open part of the doorway so it reads as being inside
  the room rather than pasted onto the door.
- Visibility only while the assigned door is open. Closing the door hides the
  patient; reopening that locked assigned door shows the patient again.

When implemented, selecting the next patient should remove the completed
patient's room image before closing the old door and starting the next
decision.

## Existing artwork status

Selected artwork is stored at:

`docs/DESIGN/SELECTED ARTWORK/`

The broader iteration history remains in `docs/DESIGN/REFINING IMAGES/`.
Selected v1 assets are historical/design inputs rather than automatic
production-art authority. The revised seven-choice mockups and prototype assets
establish the current direction, but final production artwork still requires a
reviewed asset plan and, for in-room patient compositing, separated interior
and foreground-door layers.

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

## Reversible mobile safe-viewport experiment

The test application currently contains an isolated sizing experiment for
mobile-browser use. On browsers supporting small viewport units, the complete
9:16 game shell is scaled against `100svh` rather than the changing dynamic
viewport. The top, right, bottom, and left safe-area insets are removed from
the available dimensions before the shell is sized. This is intended to keep
the footer above expanded browser controls and device obstructions across
modern phone sizes and aspect ratios.

This treatment may make the game slightly smaller while browser controls are
expanded. It is not yet an approved production rule. The original sizing
declarations remain intact immediately above the experimental override, and
the experiment can be reversed by removing its single labeled `@supports`
block. Browsers without small-viewport-unit support retain the original sizing.

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
