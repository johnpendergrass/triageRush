# Finite Patient Pool, Shift-End, and Scoring Ceiling — ABANDONED

> # ABANDONED 2026-08-05 — DO NOT BUILD, DO NOT RE-PROPOSE
>
> John decided the same day this was written to **abandon this direction
> entirely** and continue developing the game as originally conceived, with
> NO patient limits — that is, the game exactly as it stands today.
>
> Nothing here was ever implemented. `triageRush/` never changed.
> Documents 1-9 were, and remain, fully authoritative.
>
> This file is kept ONLY so that a future session can see the idea was
> explored thoroughly and dropped deliberately, rather than rediscovering it
> and pitching it again. If it ever does come back, the companion decision
> log (`finite-patient-pool-decision-log--ABANDONED-2026-08-05.MD`) holds the
> reasoning, the traps, and the options that were rejected along the way.
>
> **One thing below outlived the design and is still binding:** the review
> must never fault the player for patients left in the waiting room, and must
> make no claim about performance "for level of training". Those were John's
> rulings about the game, not about this mechanic.

**Original status line, for the record:** DESIGNED, NOT BUILT. Nothing in this document is implemented.
Documents `3`, `4`, `7`, `8` and `9` describe the game as it is designed AND
as it is built through Phase 8, and they remain authoritative for the SHIPPED
game. This document describes an approved change that has not yet been made.
Section 7 lists exactly which lines of the other documents it will contradict
on the day it is built.

Decision log, superseded options, and the reasoning behind each rule:
`claude-john-docs/brainstorm-finite-patient-roster.MD`.

---

## 1. What changes, and why it matters

Today a shift deals patients endlessly and ends only when the clock runs out
or the player stops it. Consequences: the waiting room can never be emptied,
the score has no maximum, and two shifts cannot be meaningfully compared.

This design gives every timed shift a **finite pool of patients**. That single
change buys four things:

1. **A win state.** Clear the pool and the shift ends in a congratulation.
   The game has never had a way to win.
2. **A score ceiling.** `pool x 100` is a perfect shift, so the Shift Review
   can report a percentage of what was actually achievable instead of an
   invented threshold. This was the blocking problem for the supervisor
   evaluation form (doc 7's provisional Shift Review look).
3. **An honest waiting room.** Patients left unseen become a real measure of
   throughput rather than a restatement of the game's premise.
4. **Comparable runs.** A percentage means a score is worth chasing twice.

**What does NOT change:** point values (+100 correct, +50 close, -50 wrong),
the evaluation rules, the recall mechanic, the three-view model, the Chart,
or the Patients Seen browser.

---

## 2. The four shift profiles

TRIAGE 600s is REMOVED and replaced by the untimed sandbox.

| | RUSH 60s | RUSH 120s | TRIAGE 300s | SANDBOX |
|---|---|---|---|---|
| Pool size | 12 | 20 | 30 | unlimited |
| Timer | 60s | 120s | 300s | none |
| Slots shown | 5, grows to 10 | 5, grows to 10 | 5, held at 5 | 5, held at 5 |
| Seeded at start | 2 | 2 | 5 | 5 |
| Arrival triggers | paced + on-empty | paced + on-empty | on selection | on selection |
| Overflow held off-screen | yes | yes | n/a | n/a |
| Not-seen penalty | -10 each | -10 each | none | none |
| Can end by clearing | yes | yes | yes | never |
| Score ceiling | 1200 | 2000 | 3000 | none |
| Review shape | graded % | graded % | graded % | stats only |
| Implied pace | 5.0 s/patient | 6.0 s/patient | 10.0 s/patient | — |

**Every pool size is a FIRST GUESS.** They must be calibrated against real
play data — how many patients John actually places in each shift length.
No figure produced by an AI counts as evidence here; the numbers used in the
Shift Review mockups were invented for layout purposes.

Suggested constant shape, so tuning is one table edit rather than a hunt
through `MIN_VISIBLE_WAITING`, `MAX_WAITING`,
`TRIAGE_LENGTH_CHOICES_SECONDS` and the mode branch in `seedInitialQueue`:

    SHIFT_PROFILES: {
      "rush-60":     { seconds:  60, pool:   12, maxSlots: 10, seed: 2, notSeenPenalty: -10 },
      "rush-120":    { seconds: 120, pool:   20, maxSlots: 10, seed: 2, notSeenPenalty: -10 },
      "triage-300":  { seconds: 300, pool:   30, maxSlots:  5, seed: 5, notSeenPenalty:   0 },
      "triage-open": { seconds: null, pool: null, maxSlots:  5, seed: 5, notSeenPenalty:   0 }
    }

`null` means "unlimited" for both `seconds` and `pool`, which keeps sandbox
from needing its own code path in most places.

---

## 3. Core rules

### 3.1 The pool counts CUMULATIVE ARRIVALS

`patientsAvailableQueue` is decremented when a patient ARRIVES in the waiting
room — never when one is placed, and never when an arrival is merely
scheduled.

This distinction is load-bearing. Stopping arrivals at maximum OCCUPANCY
instead would invert the reward: a fast player keeps freeing slots, so
occupancy never reaches the cap, so arrivals never stop, so skilled play is
punished with extra work.

Maximum occupancy remains a separate thing — a display and back-pressure cap,
exactly as today.

**Implementation trap:** a blocked or pending arrival must NOT consume the
pool. Today's `insertWaitingPatient` returns early on `reason: "full"` BEFORE
calling `drawUniquePatientId`, so the deck is not consumed. That ordering is
correct and must be preserved when the pool counter is added beside it.
Getting it wrong means a shift can end with patients who were never shown.

### 3.2 Arrivals

**RUSH** — patients arrive on TWO independent triggers:

- the regular paced RUSH interval, escalating as it does today;
- immediately whenever the waiting room reaches zero.

Both fire only while pool patients remain. The on-empty trigger must NOT
reset or delay the paced interval walk — the shrinking schedule is RUSH's
pressure curve, and the two triggers are independent.

**RUSH overflow.** If an arrival is due and all ten slots are full, the
patient waits OFF-SCREEN and enters the instant a slot opens. This is new;
today a blocked arrival is skipped until the next interval tick.

**TRIAGE** — the room is held at five. This is ALREADY the shipped behaviour:
`selectWaitingPatient` refills on every Triage selection, announced, with a
doink. The only change is that the refill stops when the pool is empty.
Triage therefore needs no off-screen overflow mechanism at all.

**Doinks.** Every successful runtime insertion doinks, including the on-empty
emergency refill (doc 4's sound contract). Recall, swap, seeding and blocked
attempts stay silent.

### 3.3 The end condition

A shift ends when ALL THREE are true:

1. the waiting room is empty (`state.waiting.length === 0`), AND
2. no pool patients remain, AND
3. no patient is in the centre panel (`state.active === null`).

Clause 3 matters on its own: the shift must never end out from under a
patient still being evaluated. If a patient is in the panel when the pool and
room empty, play CONTINUES until that patient is assigned a room.

Clause 1 alone is NOT the end condition. A RUSH shift seeds two patients; a
quick player can legitimately empty the room seconds in, and a naive
"room empty ends the shift" rule would declare victory and cut to the review.
The on-empty refill of 3.2 means clause 1 can only be satisfied once clause 2
already is, so the conjunction is safe by construction — but all three
clauses stay, because clause 3 is doing real work and the conjunction
documents the intent.

SANDBOX has no pool, so clause 2 is never true and sandbox never self-ends.

### 3.4 Endings

There are now THREE endings, up from two:

| Trigger | Wording | Notes |
|---|---|---|
| Pool cleared (3.3) | a congratulation — NEW | the happy one; deserves its own wording AND its own sound |
| Timer expiry | `TIME'S UP` | unchanged |
| Player stops the shift | `SHIFT ENDED` | the only ending sandbox can reach |

Phase 8's shift-over acknowledgement is already an overlay taking a headline
plus the patients-seen count, so the win is a third string and a new sound,
not a fourth screen.

QUIT THIS SHIFT still discards the shift and shows nothing.

### 3.5 Scoring

Point values are unchanged: **+100 correct, +50 close, -50 wrong.**

**No bonuses of any kind.** No bonus patients, no time bonus, no completion
bonus. Clearing the pool is its own reward: it ends the shift as a win and is
the only route to the full possible score. This protects the score ceiling,
which is the property the whole design exists to create.

**The not-seen penalty (RUSH only).** At timer expiry, RUSH charges
`notSeenPenalty` for every patient never assigned a room. "Not seen" sweeps
up all three groups at once:

- patients still sitting in the waiting room,
- patients still waiting off-screen,
- the unassigned patient in the centre panel.

Which makes it simply `pool - patientsSeen`.

This is deliberately a DOUBLE charge — an unseen patient costs the +100 never
earned AND the -10. That is intended, not an oversight; it is what makes
throughput matter in RUSH. Do not "fix" it.

TRIAGE 300s and SANDBOX have **no not-seen penalty**, which restores TRIAGE's
current shipped behaviour (its waiting multiplier is already 0) and keeps a
penalty-free calm mode in contrast to RUSH.

**Score ceiling.** Because clearing the pool leaves nothing unseen, the
maximum is exactly `pool x 100` for every timed profile.

---

## 4. Per-profile detail

### 4.1 RUSH 60s — the reference profile

1. The waiting room shows five slots. The first two patients occupy slots
   1-2 (today's seeding).
2. The shift starts; arrivals fill slots 3-5.
3. Beyond five, the panel GROWS: 6, 7, 8, 9, 10 (today's behaviour).
4. If an arrival is due and all ten slots are full, the patient waits
   off-screen and enters the instant a slot opens.
5. If the player empties the room and the pool is 0, nothing more is added —
   **and that is not an error.** This is the exact opposite of the old
   backlog premise that an empty room reads as broken.
6. If a patient is in the centre panel, play continues until they are
   assigned. Then the shift ends and is scored.
7. If the timer expires first, the score stands and the not-seen penalty
   applies per 3.5.

### 4.2 RUSH 120s

Identical to 4.1 in every rule. Only the pool differs: **20** (provisional).

### 4.3 TRIAGE 300s

- Pool **30** (provisional). Room starts at five and stays at five.
- No off-screen overflow needed (3.2).
- The room only begins to DRAIN when fewer than five remain in the pool —
  i.e. during the last five patients. That contraction is the clearest
  "nearly done" signal available without new UI.
- Same points as RUSH; **no not-seen penalty**.
- Same three-clause end condition.

### 4.4 SANDBOX (TRIAGE, no timer)

- Room kept at five, pool unlimited, so the room never drains.
- Patients score normally. No penalty of any kind.
- No timer: the player must explicitly stop the shift, and only then sees
  results.
- Can reach neither the win ending nor `TIME'S UP`. Every sandbox shift ends
  by the player's own hand.

---

## 5. Consequences for the Shift Review

### 5.1 The review needs TWO shapes

The three timed profiles have a possible score, so they can show a percentage
and a derived grade. Sandbox has no pool, therefore no possible score,
therefore **no percentage and no grade** — score and stats only.

The review form must be designed to shed its grade block gracefully rather
than having it retrofitted. This is a direct input to the form mockups in
`_mockups/shift-review-mockups.html` (variant A2 is John's preferred
direction, subject to seeing it on a real phone).

### 5.2 The grade stops being invented

With a ceiling, the BELOW / MEETS / EXCEEDS band can be a percentage of
possible score. That removes the objection that killed the first attempt —
that any threshold we picked implied medical knowledge we do not have.
The grade must still print its own basis so it can never read as a clinical
claim.

### 5.3 Wording that falls out

- "SAW 22 OF 30" becomes natural and meaningful.
- DURATION already prints time actually run, so a shift cleared at 3:42 of
  5:00 prints 3:42 with no new work — a number to beat, worth zero points.

---

## 6. Open decisions

1. **Pool calibration.** 12 / 20 / 30 are guesses. Needs John's real play
   data: patients actually placed in a 60s RUSH, a 120s RUSH, a 300s TRIAGE.
2. **The last-patient recall window.** Assignment is not final — an assigned
   patient sits behind a door and can be RECALLED, replacing the ledger
   result. Rule 4.1.6 ends the shift as soon as the last patient is assigned,
   which would make the FINAL patient of every shift uniquely unfixable,
   purely because they happened to be last. Either end immediately anyway
   (crisp but inconsistent), or let the normal recall window run and end when
   it closes.
3. **Sandbox ledger keying.** The deck reshuffles and repeats when exhausted
   (John's ruling). But `state.ledger.byPatientId` keyed by patient ID means a
   patient seen twice OVERWRITES the first record rather than creating a
   second — the Patients Seen browser would show one where the player saw
   two, and the score would count it once. Fixing it means making the ledger
   **encounter-keyed**, with `patientId` demoted to a field.
   **This is provably sandbox-only**: every other profile deals at most 30
   patients against a 160-patient deck, so repeats are impossible there.
   That reframes the cost — the entire rework exists to serve one untimed
   mode, which makes "just cap sandbox at 160" a serious alternative.
   Related: a reshuffled deck must exclude patients currently in the room or
   the panel, or it trips the existing "duplicate patient in waiting"
   invariant.
4. **Blocked-arrival shake in RUSH.** `processRushArrival` currently sets
   `blockedShake` when capacity refuses an arrival. Under 3.2 the arrival is
   deferred rather than lost. Keep the shake as "you are overwhelmed"
   feedback, or suppress it?
5. **Does the panel shrink below five during the final drain?** It grows
   5 -> 10; on the way down it presumably returns to a five-row minimum,
   leaving empty slots visible. Collapsing to the true remaining count would
   turn the panel into an endgame progress indicator with no new UI.
6. **Optional — composed pools.** Drawing each pool to a fixed acuity recipe
   (e.g. 2x ESI-1, 5x ESI-2, 9x ESI-3, 9x ESI-4, 5x ESI-5 for a 30-patient
   shift) would make every shift the same exam, which is what makes
   percentages honestly comparable between runs. It also unlocks seeded pools
   later. Much cheaper built in from the start than retrofitted. Must first
   be checked against the actual ESI distribution in `patient-data`.

---

## 7. What this contradicts in the current documents

To be reconciled ON THE DAY THIS IS BUILT, not before — the numbered docs
must keep describing the shipped game until then.

- **Doc 3 (gameplay rules)** — TRIAGE offers 300s and 600s countdowns.
  600s is removed and replaced by the untimed sandbox. TRIAGE's scoring gains
  a pool but keeps its zero waiting multiplier.
- **Doc 3 / doc 8** — the RUSH waiting penalty is currently charged on
  `state.waiting.length`. It becomes `pool - patientsSeen`.
- **Doc 8 (arrival algorithm)** — needs the pool, the on-empty trigger, the
  off-screen overflow queue, and the three-clause end condition.
- **Doc 9, Phase 4 gate** — currently states "RUSH selection does not
  refill". This design reverses that.
- **Doc 9, Phase 8 line** — acceptance rows for the new win ending, the
  not-seen penalty basis, and the two review shapes.
- **Doc 7** — the Shift Review look is already marked PROVISIONAL; the grade
  block and the sandbox stats-only shape both land there.
- **Doc 1 TOC** — "Triage offers five- and ten-minute countdowns" under
  Approved direction.

## 8. Backlog items this resolves

- **"RUSH must never leave an empty waiting room"** — RESOLVED by the
  on-empty arrival trigger in 3.2, made safe by the pool bounding it. Note
  this item was briefly recorded as SUPERSEDED during design; that was wrong.
  It is implemented, not dropped.
- **"RUSH arrival pacing revision"** — MUST be designed together with this,
  not after it. Pool sizes and arrival intervals determine each other: if the
  pool is spread evenly across the shift the player can never clear early,
  so arrivals must front-load, roughly
  `interval ~= (shift length x 0.65) / pool size`.
- **Shift Review supervisor-evaluation form** — UNBLOCKED by the score
  ceiling, and now additionally requires the two-shape treatment of 5.1.
