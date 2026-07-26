# triageRush — Gameplay Rules

**Last reviewed:** 2026-07-25 15:24 PDT  
**Owner:** Current gameplay behavior and clinical routing

## Purpose and tone

triageRush is a fast portrait browser game about emergency-department triage.
The player must make quick, medically relevant destination decisions without
being punished for explicitly recognized close calls.

It is a game of keeping up with a waiting room, not a detailed diagnostic quiz.
The player sees a deliberately limited but fair patient card. Every clue needed
for the intended room decision must be available in the default short view.

## Definitions

- there are three main panels in the game.  they are called:
  - TRIAGE panel - the panel on the left with 5-10 waiting patients
  - PATIENT panel - the central panel of the current patient
  - ROOMS panel - the disposition of the current patient
  - the CLIPBOARD is the item that shows the Presentation info, and when clicked brings up and expanded clipboard with additional info.  The additional info is not required to place the patient - it just provides more info if the player desires it.  It is either in the inactive state, showing text in the patient panel, or the active state, where it is a popup with more info.
  - rushMode - is a T/F value that tells when the game is in rush mode.  It starts FALSE.
  - rushTrigger - a % (0-100) that sets the percent of time to trigger (set rushMode to TRUE).  This is set in config.


## Core interaction

- Five waiting-room slots appear on the left (TRIAGE panel).
- One active-patient panel appears in the center (PATIENT panel).
- Five destination doors appear on the right (DOORS panel).
- The game is tap-based; do not require drag-and-drop.
- Tapping a triage patient, when the patient panel is empty, places that patient in the active panel.
- If the patient panel is occupied, tapping another triage patient swaps them.
- Tapping a room when there is an active patient panel places and scores that patient.
- Tapping a room while the patient panel is empty does nothing.
- The patient panel itself is not a placement button.
- A successful placement empties the active panel; it is not automatically
  refilled.
- Tapping the patient panel 'presentation' button brings up a more detailed clipboard with longer quotes and presentation details.  The player returns to the game by either tapping a close button, or by tapping outside of that element.
- There is no scrolling in the game.  All elements (graphics/text) are to be fully presented.

## Pace of the game

- The default beginning state (configurable in a config file) is to have:
  - 2 triage patients in place (there are slots for five, only the top two are filled).
  - empty patient area
  - timer reading default value (60?)
  - all buttons inactive except for the START and EXIT.
  - rushMode is set to FALSE.
- Tapping EXIT takes player back to HOME screen (still undefined).
- Tapping START:
  - 1. starts timer
  - 2. enables the buttons in the triage panel, the rooms panel and the clipboard area.
  - 3. the START button changes to PAUSE
  - 4. the EXIT button remains active.
  - 5. new patients are added to the triage queue according to 'addQueueNormal' = 5 (config). The queue added new patients upto the value of maxQueueNormal = 5 (config)
- Rush Mode - when the timer gets past rushTrigger then rushMode is set to T.  At that point Rush Mode is activated.  This changes the pace.  Now patients are added to the triage queue at a faster pace of addQueueRush and to a max of maxQueueRush.
- Rush Mode requires that the TRIAGE panel have between 5-10 patients.  The five patient slots need to compress in order to make room for more slots.  So the game will need to have code to handle 5 potential slots, 6 potential slots, and so on upto 10 potential slots.  Each slot needs to be a separate button.
  

## Player-visible patient evidence

The default view is intended to show:

- Patient image.
- Name and basic demographics.
- `quoteShort`.
- `presentationShort`.
- HR, BP, RR, SpO₂, temperature, and pain.

`quoteLong` and `presentationLong` belong to optional expanded information.
They may enrich the case but must not contain the only clue needed for a fair
room decision.

## Destinations

The five exact JSON room strings are:

- `Resus`
- `Acute`
- `Fast Track`
- `Psych`
- `Discharge`

Artwork may render these labels in uppercase. Code should compare the exact
title-case JSON strings.

## ESI-to-room contract

ESI remains a clinical value from 1 through 5. Room assignment is a coarser
gameplay grouping.

| ESI | Correct room | Acceptable alternate |
|---:|---|---|
| 1 | Resus | none |
| 2 | Acute | Resus |
| 3 | Acute | none |
| 4 | Fast Track | Acute |
| 5 | Fast Track | none |

The base mapping is:

```text
ESI 1   → Resus
ESI 2–3 → Acute
ESI 4–5 → Fast Track
```

The alternate represents one higher ESI acuity class when that class resolves
to a different physical door:

- ESI 2 may go to Resus.
- ESI 4 may go to Acute.
- ESI 3 has no extra alternate because ESI 2 and 3 both resolve to Acute.
- ESI 5 has no extra alternate because ESI 4 and 5 both resolve to Fast Track.
- ESI 1 has no higher-acuity destination.

This is not permission to accept every room that appears “safer.”

## Psych exception

Psych is a destination, not an extra ESI level.

- Psych may be correct only for a medically stable, low-risk behavioral patient
  at ESI 4 or 5.
- Fast Track is acceptable for a Psych-correct patient.
- Behavioral presentations at ESI 1, 2, or 3 follow the ordinary medical room
  mapping and are not Psych-correct.
- The exception is decided during patient authoring and stored in JSON.

## Discharge exception

Discharge is a destination, not an extra ESI level.

- Discharge may be correct only for an explicitly reviewed ESI 5 patient.
- The patient needs no ED treatment-area resources beyond brief evaluation,
  counseling, reassurance, or similar conversation-level care.
- Fast Track is acceptable.
- An ESI 5 patient who still belongs in a treatment area remains Fast Track
  with no alternate.
- The game must never infer “possible discharge” during play.

## Scoring contract

Runtime scoring reads the authored answer:

```json
"answer": {
  "correctRoom": "Acute",
  "otherAcceptableRooms": ["Resus"]
}
```

- Choosing `correctRoom` is fully correct.
- Choosing a room in `otherAcceptableRooms` is an accepted close call.
- Any other room is incorrect.
- The game should not derive a different answer from diagnosis prose at
  runtime.

Exact point values have not been reconfirmed in the current design and should
remain configurable. Older documents proposed `+100`, `+50`, and `−50`, but
implementation should not treat those numbers as locked until the user
reconfirms them.

## Placement feedback

- Clicking a destination changes its closed-door art to the matching open-door
  art as immediate feedback.
- Correct, acceptable, and incorrect placements should be distinguishable
  without requiring the player to read an explanation during the rush.
- Audio, color-flash behavior, and exact feedback duration remain implementation
  decisions.
- Once placed, the patient leaves active play.

## Expanded information

There is one shared expanded medical-clipboard view.

- It provides `quoteLong` and `presentationLong`.
- It may cover the normal quote and part of the patient/waiting area.
- It must not cover the vitals or `presentationShort`.
- Only the return control is active while it is open.
- The timer-pause behavior remains undecided.

## Decisions still requiring confirmation

Do not resurrect an older specification merely to fill these gaps:

- Number and duration of rounds.
- Exact point values and end-of-round bonuses or penalties.
- Patient arrival timing and pacing.
- Whether the timer pauses for expanded information.
- Final sound effects and feedback duration.
- End-of-game and patient-review flow.

