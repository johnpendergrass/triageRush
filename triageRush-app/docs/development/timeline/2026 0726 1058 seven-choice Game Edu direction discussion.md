# Potential gamestyle change to edu/game

**Discussion date:** 2026-07-26 10:58 PDT
**Status:** Potential change in direction; discussion only
**Scope:** Product intent, gameplay, ESI choices, feedback, and game modes

## Purpose of this note

This note records a proposed major change in the intent and design of
`triageRush`, along with the user's comments and the design responses discussed
on 2026-07-26.

This is not yet a canonical specification or an instruction to implement the
change. The original concept remains preserved in Git and under the `v1` tag.

## User's proposed change in direction

The user clarified the following:

1. `triageRush` is intended to be primarily a game, although it contains
   serious and realistic medical content.
2. The original concept consolidates ESI 2 and 3 into one Acute room and ESI 4
   and 5 into one Fast Track room, even though these represent different
   patient evaluations.
3. The game should become a hybrid educational game and should stop
   consolidating those ESI levels.
4. The new concept would offer seven total choices:
   - ESI 1
   - ESI 2
   - ESI 3
   - ESI 4
   - ESI 5
   - Psych
   - Discharge
5. The screen may be redesigned as necessary.
6. The player should receive immediate feedback after assigning a patient.
7. A Coach card should be available for educational review, but only after the
   player has committed to a decision.
8. The game should have two modes:
   - **Game mode:** timer, pacing pressure, and numeric scoring.
   - **Edu mode:** no timer and no point score; performance is summarized as
     counts of correct, close, and wrong decisions.

## Meaning of the seven choices

The user understands that ESI 1 through 5 are not literal physical
destinations. The rooms are a gameplay metaphor for how the patient should be
classified and treated.

That metaphor remains workable, provided the interface and educational
feedback do not imply that ESI levels are actual hospital rooms.

ESI remains a five-level triage acuity system. Psych and Discharge are special
routing or disposition choices rather than additional ESI levels. For a Psych
or Discharge case, educational feedback should still identify the patient's
underlying ESI level.

For example:

```text
Correct treatment choice: Psych
Underlying acuity classification: ESI 4
```

This distinction is important because a behavioral-health presentation can
still be medically unstable or high-risk. Psych should not automatically
replace the patient's acuity assessment.

Relevant external references discussed:

- [Emergency Nurses Association — ESI Handbook, 5th Edition](https://enau.ena.org/Listing/Emergency-Severity-Index-Handbook-5th-Edition-85744)
- [AHRQ — Emergency Severity Index](https://www.ahrq.gov/patient-safety/settings/hospital/resource/about.html)

## Proposed core play loop

The revised concept can be summarized as:

> Examine the patient, choose one of seven treatment classifications, receive
> immediate outcome feedback, and optionally review the clinical reasoning
> afterward.

The proposed sequence for each patient is:

1. The player reviews the available patient evidence.
2. The player taps one of the seven choices.
3. The decision is immediately locked and evaluated.
4. The interface gives fast audiovisual feedback.
5. The Coach card becomes available.
6. The player may inspect the explanation or continue to the next patient.

The Coach card must not reveal the answer, rationale, or hints before the
player makes a decision.

## Immediate feedback

The user proposed three immediate feedback outcomes.

| Outcome | Selected choice | Correct choice | Sound |
|---|---|---|---|
| Correct | Green pulse | Same choice | Quick “ding” |
| Close | Orange pulse | Light-green pulse | “Dong” |
| Wrong | Red pulse | Light-green pulse | “Buzz” |

The feedback should be fast enough that it does not interrupt the main game
rhythm. A provisional duration of approximately 600–900 milliseconds was
discussed.

In addition to color and sound, the interface should briefly display a symbol
and text such as:

- `✓ Correct`
- `≈ Close`
- `✕ Wrong`

This makes the result understandable on muted devices and avoids relying
entirely on color for accessibility.

Audio should be mutable without disabling the visual and textual feedback.

## Meaning of “close”

For ESI 1 through 5, the initial proposal is that a selection one numerical
level away from the correct ESI receives the orange close result.

The design response raised an important clinical distinction:

- Choosing a more acute level than necessary is **over-triage**.
- Choosing a less acute level than necessary is **under-triage**.

Both could be presented as a close or near-miss result for game simplicity, but
the Coach card should identify the direction of the error. A near miss should
not necessarily be described as clinically acceptable.

The most important possible exception is an ESI 1 patient placed at ESI 2.
Although numerically off by only one, missing the need for an immediate
lifesaving intervention may deserve a red wrong result rather than an orange
near miss. This remains an open design decision.

Psych and Discharge do not have numerical adjacency. Their close choices must
be explicitly defined. A possible starting model is:

- For a Psych-correct case, choosing the patient's underlying ESI level may be
  close.
- For a Discharge-correct case, choosing ESI 5 may be close.
- Choosing Psych or Discharge incorrectly is normally wrong unless that
  individual patient record explicitly permits it.

The term **near miss** may be more accurate than **acceptable answer** for the
orange outcome.

## Coach card

The Coach card is a post-decision educational tool. It should be unavailable,
disabled, or face-down until the player selects a treatment choice.

After the decision, the card may show:

- The player's choice.
- The correct choice.
- Correct, near miss, or wrong.
- Whether the miss was over-triage or under-triage.
- The decisive evidence in the patient presentation.
- The relevant ESI decision reasoning.
- The expected-resource reasoning where applicable.
- The underlying ESI for Psych and Discharge cases.
- A concise explanation of why the selected alternative was less appropriate.

Example:

```text
Near miss: You chose ESI 4; the correct answer is ESI 3.

The patient is stable, but the expected laboratory testing and imaging
represent multiple ED resources. This was under-triage.
```

Feedback explanations should be authored and reviewed for each patient rather
than generated at runtime. They should not simply repeat the diagnosis or
depend on information that was unavailable when the player made the decision.

## Game mode

Game mode preserves the original pressure and game identity.

Proposed characteristics:

- Timed play.
- Continuing patient arrivals and queue pressure.
- Numeric scoring.
- Immediate audiovisual result feedback.
- Optional Coach card after the decision.
- End-of-round score and outcome breakdown.

If opening the Coach card pauses the timer and arrivals, the run may need to be
marked as assisted so it is not compared directly with an unassisted score.
Another option is to reserve full case review until the end of a timed round.
Coach behavior during Game mode remains undecided.

## Edu mode

Edu mode uses the same patients, seven choices, evaluation rules, and immediate
feedback without time pressure or point values.

Proposed characteristics:

- No timer.
- No patient-arrival pressure.
- No numeric point score.
- An outcome tally showing:
  - Correct
  - Near Miss
  - Wrong
- Coach card available after every completed decision.
- Player-controlled progression to the next patient.
- A reviewable history of completed cases.

The term **outcome tally** distinguishes these counts from a conventional point
score.

## Screen and artwork implications

The existing interface was designed for five destination rows in a 560 CSS
pixel play area. Seven equal rows would be approximately 80 CSS pixels tall
instead of 112.

Seven choices can technically fit in the existing right-hand rail, but the
current scenic door artwork may become too cramped or difficult to read.
Potential responses include:

- Redesigning the destination rail as seven compact treatment bays.
- Using clearer controls rather than seven detailed miniature door scenes.
- Giving ESI 1–5 one consistent visual family.
- Giving Psych and Discharge distinct styling to show that they are special
  routing choices.
- Presenting the Coach card over the center patient area rather than reserving
  permanent screen space for it.

The final solution requires layout and mobile-viewport testing.

## Patient-data implications

The existing 160 patient records remain valuable because they already contain
exact ESI values. The new direction does not require discarding the patient
library, but it does require a substantial answer and feedback review.

Likely future work includes:

- Replacing or reinterpreting grouped room answers.
- Defining exact ESI answers.
- Defining near-miss choices.
- Distinguishing under-triage from over-triage.
- Authoring a concise Coach rationale for each patient.
- Reviewing all Psych and Discharge exceptions.
- Preserving the rule that all decision-critical evidence must be visible
  before the player selects an answer.

The present case distribution is uneven:

- ESI 1: 12
- ESI 2: 41
- ESI 3: 34
- ESI 4 with an ordinary treatment answer: 33
- ESI 5 with an ordinary treatment answer: 11
- Psych: 5
- Discharge: 24

Pure random selection could make some choices rarely useful. Curated rounds,
weighted sampling, or additional cases may be needed for balanced gameplay and
educational coverage.

## Working concept statement

> **triageRush is a fast-paced emergency-triage game in which players evaluate
> realistic patient presentations and choose among five ESI treatment levels,
> Psych, or Discharge. Every decision receives immediate feedback, with
> optional post-decision clinical coaching. Game mode emphasizes speed and
> scoring; Edu mode emphasizes untimed practice and understanding.**

## Decisions still open

1. Whether every numerically adjacent ESI answer is a near miss.
2. Whether dangerous under-triage, especially ESI 1 to ESI 2, is always wrong.
3. Exact near-miss rules for Psych and Discharge.
4. Whether the preferred term is `Close` or `Near Miss`.
5. Whether Game mode pauses while the Coach card is open.
6. Whether using Coach during Game mode marks the run as assisted.
7. Exact numeric scoring in Game mode.
8. Exact pulse and sound durations.
9. Final seven-choice layout and artwork direction.
10. The exact Coach-card fields to add to the patient-data schema.

## Repository impact at the time of this note

This note is the only project change resulting from the discussion. No game
code, patient records, canonical specifications, artwork, Git tags, or runtime
behavior were changed.
