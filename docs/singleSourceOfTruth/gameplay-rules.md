# triageRush — Gameplay Direction Under Revision

**Last reviewed:** 2026-07-26 19:05 PDT
**Status:** Canonical statement of direction; detailed rules under discussion

## Product intent

`triageRush` is primarily a game. It uses serious and realistic emergency
triage content to create a hybrid game/education experience.

The revised design should retain quick decisions and waiting-room pressure
while teaching the distinctions between the five ESI levels more directly.

## Working seven-choice model

The v1 consolidations of ESI 2–3 into Acute and ESI 4–5 into Fast Track are no
longer the target design.

The working model has seven selectable treatment choices. The five ESI levels
use these exact names:

| Choice | Full name | Compact door name |
|---|---|---|
| ESI 1 | Resuscitation | `RESUS` |
| ESI 2 | Emergent | `EMERGENT` |
| ESI 3 | Urgent | `URGENT` |
| ESI 4 | Less Urgent | `LESS URGENT` |
| ESI 5 | Non-Urgent | `NON-URGENT` |
| Psych | Psych | `PSYCH` |
| Discharge | Discharge | `DISCHARGE` |

On an ESI door, the smaller `ESI #` label appears above the larger compact
door name. `LESS URGENT` and `NON-URGENT` may wrap to two lines when required
for legibility.

The choices may continue to be represented as “rooms,” but the rooms are a
gameplay metaphor for how the patient should be classified and treated. ESI
levels are not literal physical destinations. Psych and Discharge are special
routing/disposition choices and do not become ESI levels 6 and 7.

Psych and Discharge feedback should retain the patient's underlying ESI
classification.

### Interim Psych and Discharge evaluation

Until a patient-specific evaluation table is approved, patients whose intended
answer is Psych or Discharge use this rule:

- Selecting the named Psych or Discharge destination is `Correct`.
- Selecting a numbered ESI room equal to the patient's underlying ESI or one
  level above or below it is `Acceptable`.
- Selecting any other destination is `Wrong`.

`Acceptable` is a distinct player-facing result rather than `Close` or `Wrong`.
It communicates that the numbered treatment placement is reasonable even
though the named special pathway is the intended answer. In the test
application, Acceptable receives its own label, positive audiovisual feedback,
and Edu tally. Its temporary Game score equals the provisional Close score;
that point value is not a final scoring decision.

## Decision and feedback sequence

The intended order is:

1. The player reviews the patient evidence.
2. The player taps one treatment choice.
3. The decision is locked and evaluated.
4. Immediate audiovisual feedback occurs.
5. The Coach card becomes available.
6. The player may inspect the completed decision or continue.

The Coach card must not reveal the answer or offer a hint before the player
commits to a choice.

Room hover information is a separate pre-decision teaching aid. Mouse hover,
keyboard focus, or a mobile press-and-hold may display a short general
definition of a room and its ESI meaning. It is available in both Game and Edu
modes because it describes the controls, not the current patient. It must not
evaluate the patient, reveal the correct placement, unlock Coach, or count as a
decision. Releasing the hold dismisses the information, and the completed hold
must not generate a placement tap.

## Patient recall and first-assignment scoring

After any room assignment, the patient panel clears and the selected room
remains open. The player may then either:

- Select any patient from the triage queue to begin a different case; or
- Tap the still-open assigned room to recall the same patient for another
  placement attempt.

Recalling closes the room, restores the patient and evidence to the center
panel, and locks Coach again. It does not restore the patient to the triage
queue. The player may repeat this reconsideration cycle, but only the first
assignment for that patient counts toward Game points or Edu tallies.

The active-patient state includes `previouslyAssigned`, initially `false`.
The first assignment records its outcome and sets the value to `true`.
Room recall and reassignment do not reset it. Selecting a patient from the
triage queue is the normal action that resets it to `false` for the newly active
patient. Subsequent attempts still receive complete
Correct/Acceptable/Close/Wrong
feedback and may open Coach; they simply make no scoring or tally change.

The triage queue remains selectable even before the current patient has been
assigned. Choosing a queue patient in that state swaps the current patient back
into the exact selected queue position without reordering the queue. Choosing a
queue patient after an assignment finalizes the assigned case instead of
returning it to the queue. Because the patient panel is then empty, the selected
queue patient is removed, lower patients compact upward, and a fresh patient
from the store enters the final slot.

Browser refresh and Reset Round start with an empty patient panel and five
occupied compact queue cells. Selecting from the queue fills the patient panel
using the compaction-and-refill rule above. Arrival timing and other changes in
queue length during a round remain future gameplay work.

## Immediate feedback direction

| Result | Selected choice | Correct choice | Sound |
|---|---|---|---|
| Correct | Green pulse | Same choice | Quick ding |
| Acceptable | Cyan positive pulse | Light-green pulse | Positive two-tone |
| Close | Orange pulse | Light-green pulse | Dong |
| Wrong | Red pulse | Light-green pulse | Buzz |

The result should also have a brief textual or symbolic indicator so feedback
does not depend only on sound or color.

Exact colors, audio files, animation timing, and accessibility treatments are
not yet final.

## Coach card direction

After a completed decision, the Coach card is expected to explain:

- A compact recap of the patient's image, name, age/demographic, and complaint.
- The same patient quote, vitals, and triage comment available before the
  decision.
- The player's choice.
- The correct choice.
- Whether the result was Correct, Acceptable, Close, or Wrong.
- The decisive clinical evidence.
- The applicable ESI reasoning.
- Whether a miss was over-triage or under-triage.
- The underlying ESI classification for Psych or Discharge.

The explanation must be based on evidence that was available to the player
before the decision. Patient-specific rationales will require clinical review
and must not be generated blindly at runtime.

The Coach card's reading order should move from patient identity and evidence
to placement comparison, result, and clinical suggestion. This supports review
without making the player remember every detail after the patient panel clears.
Coach remains locked until the first decision in the current attempt.
If the Coach explanation exceeds its visible mobile area, the interface must
make the remaining content discoverable with a clear downward scroll indicator
that disappears at the end of the card.
The Coach window itself remains fixed within the viewport. Scrolling affects
only its review content, while Close remains persistently available.

## Modes

### Game mode

The accepted direction includes:

- A timer.
- Patient-arrival and queue pressure.
- Numeric scoring.
- Immediate result feedback.
- Post-decision Coach access in some form.
- After a room assignment, the active patient and evidence clear from the
  patient panel while the brief Correct/Acceptable/Close/Wrong result appears.
- The game then waits for either a triage-queue selection or a recall tap on
  the still-open assigned room.
- The completed patient is removed from active play and is not returned to the
  waiting queue when the player chooses a queued patient.
- There is no automatic next-patient selection and no separate Game-mode Next
  action that bypasses the triage queue.
- The timer continues throughout room assignment, recall, reassignment, and
  queue selection.
- Only the first assignment of each patient changes the numeric score.

Exact scoring, round structure, arrival timing, and Coach/timer interaction are
still under discussion.

Future enhancement TODO: once open-room artwork is separated into interior,
patient, and foreground-door layers, consider showing the completed patient's
full transparent image inside the selected open room until the door closes or
the next patient is selected. This is not implemented in the current demo.

### Edu mode

The accepted direction includes:

- No timer.
- No numeric point score.
- A tally of Correct, Acceptable, Close, and Wrong outcomes.
- Immediate result feedback.
- Post-decision Coach access.
- Player-controlled learning pace.
- The same room-recall mechanic, with only the first assignment changing the
  Correct/Acceptable/Close/Wrong tallies.

Session history and end-of-session review are desirable but not yet confirmed
as requirements.

## Rules that are not yet settled

Do not implement assumptions for these items without further review:

1. Whether every ESI choice exactly one level away is classified as Close.
2. Whether dangerous under-triage, especially ESI 1 classified as ESI 2,
   should be Wrong despite numerical adjacency.
3. Whether the player-facing word should be `Close` or `Near Miss`.
4. The final patient-specific Acceptable table for Psych and Discharge beyond
   the current same-or-adjacent-ESI interim rule.
5. Whether all ESI near misses are scored equally.
6. Numeric Game-mode points and penalties.
7. Round length, queue size, arrival timing, and rush behavior.
8. Whether opening Coach pauses a Game-mode timer.
9. Whether Coach use marks a run as assisted.
10. When the active patient clears and when the next patient becomes
    selectable during feedback.
11. End-of-round and case-review behavior.

## Potential configurable gameplay options

A later gameplay setting may offer `Loose` and `Strict` room-assignment
evaluation:

- A Loose configuration could recognize clinically reasonable alternate
  placements, including Acceptable numbered ESI placements for Psych and
  Discharge patients.
- A Strict configuration could require the single intended destination or use
  a narrower reviewed table.

The setting, labels, scoring effects, defaults, and exact evaluation tables are
future design work. The current demo implements only the interim rule above and
does not expose a Loose/Strict control.

## Explicitly superseded v1 rules

The following archived rules must not be treated as current targets:

- Five total treatment doors.
- ESI 2–3 always sharing Acute.
- ESI 4–5 always sharing Fast Track.
- The v1 `correctRoom` strings as the final revised scoring contract.
- The five-row door rail as fixed interface geometry.

The complete old behavior remains available in the
[archived v1 gameplay rules](../archive/v1-original-concept-single-source-of-truth/gameplay-rules.md).
