# Scoring modes

triageRush offers two player-selectable scoring modes.

## Strict

- The patient's assigned ESI room earns full credit.
- A Psych or Discharge patient also earns full credit in the matching Psych or
  Discharge room.
- Other room choices receive no credit.

## Forgiving

- Every full-credit choice from Strict mode still earns full credit.
- An ESI room one level above or below the patient's assigned ESI level earns
  half credit.
- Other room choices receive no credit.

At the ends of the scale, ESI 1 is adjacent only to ESI 2, and ESI 5 is
adjacent only to ESI 4. Psych and Discharge are special destinations, not
adjacent ESI levels.

### Example: ordinary ESI 3 patient

| Choice | Strict | Forgiving |
|---|---:|---:|
| ESI 3 | Full | Full |
| ESI 2 or ESI 4 | None | Half |
| Any other room | None | None |

### Example: Psych patient assigned ESI 4

| Choice | Strict | Forgiving |
|---|---:|---:|
| Psych | Full | Full |
| ESI 4 | Full | Full |
| ESI 3 or ESI 5 | None | Half |
| Any other room | None | None |

The selected scoring mode changes how near-miss ESI choices are scored. It
does not change the patient's clinical ESI assignment.
