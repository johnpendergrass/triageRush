# Future platform, home, and program-structure considerations

**Recorded:** 2026-07-28 10:26 PDT  
**Status:** Topics to discuss before production game coding; no implementation
work is requested at this stage.

## Purpose

These notes preserve emerging design ideas while asset work continues. They
are not a final interface contract or implementation specification. Each topic
should be revisited deliberately when production game coding begins.

## Mobile and desktop presentation

triageRush should run well on both mobile and desktop. Most design attention so
far has gone to the mobile presentation, but the production application should
not make either platform feel like an afterthought. Both should look and
behave naturally for their platform.

Achieving that goal will require more than merely scaling the same layout. The
desktop and mobile presentations may need different use of space, navigation,
controls, information density, and supporting features while retaining the
same game identity and underlying behavior. The exact responsive strategy is
still to be discussed.

On desktop, the HOME screen may offer a presentation choice:

- Desktop presentation
- Mobile presentation

The current idea is that the mobile choice would serve the actual mobile
implementation within the desktop environment rather than create a separate
imitation. This would let the mobile look and feel be played and debugged on a
desktop. The mechanics and viewport treatment will be decided later.

## Desktop-only patient tool

The desktop version is expected to include an additional patient
browser/editor capability that will not appear in the mobile presentation.
Its exact scope is unresolved. In particular, a later decision must determine
whether this remains the currently planned read-only patient viewer or gains
editing functions.

Until that decision is made, this note does not change the current repository
boundary: the production triageRush patient viewer is read-only, and patient
creation and CRUD work belongs to the separate local patient pipeline.

## Possible program-state representation

There appear to be only about fifteen meaningful states in which the game can
exist, with each state enabling, disabling, showing, or hiding a particular
set of UI elements. A stateful, list-oriented representation and traversal
sequence may therefore be a natural way to organize the production code.

This is only an idea to retain for later discussion. No state inventory,
transition model, or architectural commitment should be documented or
implemented yet.

## Provisional scoring-mode direction

The HOME screen is expected to offer three scoring modes. Their intended
direction is:

- **Strict:** only the correct routing choice or choices are accepted.
- **Normal:** the correct choice or choices plus one level of over-triage are
  accepted.
- **Lenient:** the correct choice or choices plus one level of over-triage or
  under-triage are accepted.

For an ordinary ESI patient, the assigned ESI level is the correct door.
Over-triage means placing the patient one ESI level more acute; under-triage
means placing the patient one ESI level less acute. Boundary behavior at ESI 1
and ESI 5 follows the adjacent levels that actually exist.

Psych and discharge patients have two correct doors: their special-purpose
door and their assigned ESI door. How the normal and lenient alternatives,
credit values, and player feedback apply across all patient types still needs
to be finalized.

This direction supersedes neither the current strict/forgiving technical
specification nor its player guide yet. Those documents should be revised only
after the three-mode behavior is fully discussed and approved.

## HOME screen controls and choices

The HOME screen concept currently includes:

1. Game or Edu mode
2. Strict, Normal, or Lenient scoring
3. A timer choice, possibly 60 or 120 seconds
4. A rolling three-character player-name selector
5. A playful rolling title selector
6. On desktop, Desktop or Mobile presentation
7. Start
8. Help
9. About

Possible titles include `M1`, `M2`, `M3`, `M4`, `Intern`, `Doctor`, `RN`,
`Mr.`, `Mrs.`, `Ms.`, and `Miss`. The exact list and whether the title has any
effect beyond display remain open.

Timer values and their behavior are also provisional.

## HOME screen visual concept

The screen may use a subdued image of a hospital emergency-department entrance
as its setting. Sidewalk signs on the left and right would contain the HOME
choices. The signs would use an old-fashioned black felt or velvet
letter-board appearance, with removable letters pressed into horizontal
grooves.

The final allocation of choices between the two signs, interaction behavior,
legibility at mobile sizes, desktop adaptation, and accessibility treatment
remain to be designed.

## Questions reserved for later

- What makes the desktop layout feel intentionally desktop-native while
  preserving the established mobile identity?
- What exact behavior and credit values distinguish Strict, Normal, and
  Lenient scoring?
- Is the desktop patient feature a browser only, an editor, or a bridge to the
  separate CRUD pipeline?
- How should the real mobile presentation be hosted and controlled when chosen
  on desktop?
- What are the final timer choices and when does the timer run?
- What are the game's actual states, and does a list-oriented state model
  remain appropriate after they are enumerated?
- Which HOME controls belong on each sidewalk sign, and how do they adapt to a
  narrow screen?

