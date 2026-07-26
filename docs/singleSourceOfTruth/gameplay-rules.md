# triageRush — Gameplay Direction Under Revision

**Last reviewed:** 2026-07-26 11:13 PDT
**Status:** Canonical statement of direction; detailed rules under discussion

## Product intent

`triageRush` is primarily a game. It uses serious and realistic emergency
triage content to create a hybrid game/education experience.

The revised design should retain quick decisions and waiting-room pressure
while teaching the distinctions between the five ESI levels more directly.

## Working seven-choice model

The v1 consolidations of ESI 2–3 into Acute and ESI 4–5 into Fast Track are no
longer the target design.

The working model has seven selectable treatment choices:

1. ESI 1
2. ESI 2
3. ESI 3
4. ESI 4
5. ESI 5
6. Psych
7. Discharge

The choices may continue to be represented as “rooms,” but the rooms are a
gameplay metaphor for how the patient should be classified and treated. ESI
levels are not literal physical destinations. Psych and Discharge are special
routing/disposition choices and do not become ESI levels 6 and 7.

Psych and Discharge feedback should retain the patient's underlying ESI
classification.

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

## Immediate feedback direction

| Result | Selected choice | Correct choice | Sound |
|---|---|---|---|
| Correct | Green pulse | Same choice | Quick ding |
| Close | Orange pulse | Light-green pulse | Dong |
| Wrong | Red pulse | Light-green pulse | Buzz |

The result should also have a brief textual or symbolic indicator so feedback
does not depend only on sound or color.

Exact colors, audio files, animation timing, and accessibility treatments are
not yet final.

## Coach card direction

After a completed decision, the Coach card is expected to explain:

- The player's choice.
- The correct choice.
- Whether the result was Correct, Close, or Wrong.
- The decisive clinical evidence.
- The applicable ESI reasoning.
- Whether a miss was over-triage or under-triage.
- The underlying ESI classification for Psych or Discharge.

The explanation must be based on evidence that was available to the player
before the decision. Patient-specific rationales will require clinical review
and must not be generated blindly at runtime.

## Modes

### Game mode

The accepted direction includes:

- A timer.
- Patient-arrival and queue pressure.
- Numeric scoring.
- Immediate result feedback.
- Post-decision Coach access in some form.

Exact scoring, round structure, arrival timing, and Coach/timer interaction are
still under discussion.

### Edu mode

The accepted direction includes:

- No timer.
- No numeric point score.
- A tally of Correct, Close, and Wrong outcomes.
- Immediate result feedback.
- Post-decision Coach access.
- Player-controlled learning pace.

Session history and end-of-session review are desirable but not yet confirmed
as requirements.

## Rules that are not yet settled

Do not implement assumptions for these items without further review:

1. Whether every ESI choice exactly one level away is classified as Close.
2. Whether dangerous under-triage, especially ESI 1 classified as ESI 2,
   should be Wrong despite numerical adjacency.
3. Whether the player-facing word should be `Close` or `Near Miss`.
4. Patient-specific Close choices for Psych and Discharge.
5. Whether all ESI near misses are scored equally.
6. Numeric Game-mode points and penalties.
7. Round length, queue size, arrival timing, and rush behavior.
8. Whether opening Coach pauses a Game-mode timer.
9. Whether Coach use marks a run as assisted.
10. When the active patient clears and when the next patient becomes
    selectable during feedback.
11. End-of-round and case-review behavior.

## Explicitly superseded v1 rules

The following archived rules must not be treated as current targets:

- Five total treatment doors.
- ESI 2–3 always sharing Acute.
- ESI 4–5 always sharing Fast Track.
- The v1 `correctRoom` strings as the final revised scoring contract.
- The five-row door rail as fixed interface geometry.

The complete old behavior remains available in the
[archived v1 gameplay rules](../archive/v1-original-concept-single-source-of-truth/gameplay-rules.md).
