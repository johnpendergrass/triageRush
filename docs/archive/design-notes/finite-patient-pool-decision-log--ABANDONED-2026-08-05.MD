# BRAINSTORM / DECISION LOG — a finite patient pool per shift (ABANDONED)

> # ABANDONED 2026-08-05 — DO NOT BUILD, DO NOT RE-PROPOSE
>
> John abandoned this direction the same day, choosing to continue with the
> game as originally conceived and as it stands today — no patient limits.
> Nothing was implemented. This log survives only to prevent the idea being
> rediscovered and re-pitched. The design it fed is archived beside it as
> `finite-patient-pool-design--ABANDONED-2026-08-05.md`.

> **Original pointer, now stale:** the design lived in `docs/10-...`.
> That document is authoritative for WHAT TO BUILD. This file is kept as the
> DECISION LOG: how each rule was arrived at, which options were rejected and
> why, and the traps found along the way. Read doc 10 first; come here only
> when you need the reasoning behind a rule, or are tempted to re-propose
> something that was already considered and dropped.
>
> Note the vocabulary drifted during the session: "roster" here is
> `patientsAvailableQueue` / "pool" in doc 10. Same thing.

**Status:** design settled 2026-08-05 and promoted to doc 10. Nothing built.
Raised by John while reviewing the Shift Review screen mockups.

---

## 0. DECIDED by John, 2026-08-05

### 0.1 The roster counts CUMULATIVE ARRIVALS, not room occupancy

Confirmed explicitly. A shift deals a fixed number of patients IN TOTAL over
its life. The waiting room's slot count is a separate thing: a display and
back-pressure cap that blocks (and shakes) when full, exactly as it does
today.

This distinction is load-bearing and must be stated in doc 8 when this is
specified, because the two rules sound identical in English and the wrong one
inverts the reward — stopping arrivals at max OCCUPANCY would mean a fast
player, who keeps freeing slots, never triggers the stop and therefore
receives MORE patients than a slow one.

So the roster is decremented **when a patient arrives**, never when one is
placed, and the room being full merely DELAYS an arrival (as now); it does
not consume roster.

### 0.2 The four shift profiles

| Mode / length     | Roster (total patients) | Waiting slots shown | Seeded at start |
|-------------------|-------------------------|---------------------|-----------------|
| RUSH 60s          | **12** (revised, see 0.7) | up to 10          | 2 (as now)      |
| RUSH 120s         | **20** (revised, provisional) | up to 10      | 2 (as now)      |
| TRIAGE 300s       | **30** (revised, see 0.7c) | 5 (held at 5)    | 5 (as now)      |
| TRIAGE no timer   | UNLIMITED (sandbox)     | 5 (as now)          | 5 (as now)      |

TRIAGE 600s is GONE — replaced by the untimed sandbox (John: "600s was an
error"). There are four profiles, not five.

- RUSH arrival pace keeps escalating as it does today (or as revised by the
  separate pacing item).
- RUSH 60s is the one profile where roster == display cap: the room, when
  full, IS the whole shift.
- RUSH 120s and TRIAGE 300s have rosters LARGER than their display, so the
  room refills and the endgame-drain signal (Q3b) applies.

Implied player pace, for calibration against real play data:

| Profile     | Seconds per patient |
|-------------|---------------------|
| RUSH 60s    | **5.0** (12 in 60s) |
| RUSH 120s   | **6.0** (20 in 120s) |
| TRIAGE 300s | **10.0** (30 in 300s) |

RUSH now demands ~2x TRIAGE's pace rather than the ~3x implied by the first
guesses. Better balanced, still unverified.

### 0.3 TRIAGE with no timer = SANDBOX

A new shift profile: no clock, no roster, patients keep arriving, the player
stops when they choose. Score and stats only.

**TRIAGE 600s IS REPLACED BY SANDBOX** (John, 2026-08-05 — "600s was an
error"). `TRIAGE_LENGTH_CHOICES_SECONDS` drops to a single timed choice
(300) plus the untimed sandbox. Doc 3 and the settings length picker both
need this.

### 0.4 What sandbox breaks (consequences of 0.3)

Sandbox is not just "one more length" — it removes three things the rest of
the design leans on:

1. **No denominator, so no grade.** The whole reason the roster is valuable
   is that `roster x 100` gives the Shift Review a possible score and hence a
   percentage. Sandbox has none, so the review needs a SECOND shape: score
   and stats, no BELOW/MEETS/EXCEEDS band. John already specified this
   ("just a score and stats"). It means the review form must be designed to
   lose its grade block gracefully — worth building into the mockup rather
   than discovering later.
2. **No end condition but the player.** With no timer, END SHIFT is the only
   exit. Two knock-ons: the footer's "END SHIFT EARLY" wording is wrong when
   there is no scheduled end (it is just "END SHIFT"), and the shift-over
   acknowledgement can never say `TIME'S UP` — sandbox always reaches
   `SHIFT ENDED`.
3. **The deck can run dry — DECIDED: reshuffle and reuse** (John,
   2026-08-05). There are 160 patients and `drawUniquePatientId` returns null
   on exhaustion; in a timed shift that can never realistically happen, but a
   long sandbox session will. On exhaustion the deck reshuffles and patients
   repeat. Two things this forces, both easy to miss:

   **(a) The reshuffled deck must exclude patients currently in play.**
   `assertStateInvariants` checks "duplicate patient in waiting", so a
   reshuffle that immediately re-deals someone already sitting in the room
   (or the active patient) trips an invariant. The reshuffle must filter
   against the live queue and the active patient, not just against the
   drawn-pile.

   **(b) THE LEDGER IS KEYED BY PATIENT ID, AND THAT BREAKS ON REPEATS.**
   This is the sharp one. `state.ledger.byPatientId[patientId]` with
   `ledger.order` holding IDs means a patient seen TWICE in one sandbox
   session does not create a second record — it OVERWRITES the first, and
   `assignmentCount` makes it look like a re-assignment of one encounter
   rather than two separate ones. Consequences: the Patients Seen browser
   would show one patient where the player saw two, and the score would count
   the encounter once.

   So reshuffling requires the ledger to become **encounter-keyed** rather
   than patient-keyed — a synthetic encounter id, with `patientId` demoted to
   a field on the record. That is a contained change but it touches the
   ledger, the score selectors, the Patients Seen browser, and doc 8's state
   shape. It only matters in sandbox, but a silently-merged encounter is the
   kind of bug that corrupts a score without ever throwing.

   Cheap alternative if that feels like too much: cap sandbox at 160 patients
   after all and let the room drain to a natural win. Worth weighing, since
   nobody is likely to place 160 patients in one sitting.

Also: no roster means no CLEAR, so **sandbox can never reach the win ending**
of 0.5 — it can only be ended by the player. Consistent, but worth stating so
it does not read as an oversight.

### 0.5 CLEARING THE ROOM ENDS THE SHIFT (John, 2026-08-05)

Restated by John as the heart of the idea: all this really changes is the
MAXIMUM NUMBER OF PATIENTS TO BE SEEN, which lets the waiting room empty as
well as fill. And when it empties:

> "If the player runs out of patients (waiting room 0) then that is that, and
> they are presented with a congrats message of some sort, ends the shift,
> and they can see the review."

**This SUPERSEDES the bonus-patient mechanic** of section 1. Clearing the
room is now a WIN that ENDS the shift, not a gate that deals more patients.
Questions Q1, Q2, Q4 and Q5 below were all about bonus patients and are
therefore moot — they are left in place only as a record of the road not
taken. If bonus patients ever come back, Q2 (the guessing exploit) is the
one that matters.

Simpler, and better: it gives the game a real win state, which it has never
had.

**TRAP 3 — "waiting room 0" is NOT the end condition. The end condition is
"ROSTER EXHAUSTED **AND** WAITING ROOM 0".**

This one will bite hard if it is written the obvious way. A RUSH shift seeds
2 patients; if a quick player places both before the third arrives, the room
is legitimately at 0 about eight seconds in — and a naive "room empty ends
the shift" rule would declare victory and cut to the review. The same happens
any time the player out-runs the arrival interval mid-shift, which is exactly
what a GOOD player does.

And in SANDBOX there is no roster at all, so the room hitting 0 must never
end anything; arrivals simply keep coming.

So the rule is: the shift ends when **no roster patients remain undealt AND
the waiting room is empty**. Momentary empties before the roster is exhausted
are normal, and are in fact the sign of a player who is winning.

**A third ending.** There are currently two: `TIME'S UP` (timer expiry) and
`SHIFT ENDED` (END SHIFT EARLY). This adds a third — all patients seen — and
it is the happy one, so it deserves distinct wording and its own sound rather
than reusing either. Cheaply done: Phase 8's shift-over acknowledgement is
already an overlay that takes a headline plus the patients-seen count, so
this is a third string, not a fourth screen.

**NO BONUSES OF ANY KIND — DECIDED (John, 2026-08-05): "no bonus of any
type... no time bonus, no extra patient bonus."**

So the score is exactly `correct x 100 + close x 50 + wrong x -50`, capped by
the roster, with nothing added for speed and nothing added for clearing.
Clearing the room is its own reward: it ends the shift as a win and it is the
only way to reach the full possible score.

This is the cleanest possible version of the idea and it protects the one
property that motivated all of it — **the score has an exact, honest
ceiling** (`roster x 100`), so the Shift Review's percentage can never exceed
100% and never needs explaining.

Note that finishing time is still VISIBLE without being a bonus: the review
already prints DURATION as "time actually run", so a shift cleared at 3:42 of
5:00 prints 3:42 with no new work at all. That field simply becomes
meaningful — a number to beat next run, worth zero points.

### 0.6 Arrival rules, the end condition, and the penalty (John, 2026-08-05)

**Three separate rulings, all recorded verbatim in intent.**

#### 0.6a Arrivals: paced OR on-empty, bounded by the roster

- **RUSH** — patients arrive at the regular paced RUSH interval (escalating
  as today, or as the pacing item later revises), AND a new patient is added
  IMMEDIATELY whenever the waiting room hits zero. Both triggers keep firing
  only while roster patients remain.
- **TRIAGE** — the same idea, except the room is kept AT FIVE rather than
  merely non-empty, until the roster has fewer than five left; after that it
  simply drains.

**TRIAGE ALREADY WORKS THIS WAY — no new behaviour needed.**
`selectWaitingPatient` (game.js ~line 412) already calls
`insertWaitingPatient(..., { announce: true })` on every Triage selection, so
one-in-one-out at five is the shipped behaviour, doink included. The ONLY
change Triage needs is that the refill stops when the roster is exhausted.

**RUSH's on-empty refill is new.** It resurrects the backlog item "RUSH must
never leave an empty waiting room", which earlier in this document was
recorded as superseded — that was wrong. John wants both: the roster BOUNDS
the refill, which is exactly what made the old item feel unsafe (an endless
refill) acceptable now.

Carried forward from that old backlog item, still true and still needing
confirmation when built:
  - the emergency refill DOES doink (doc 4: every successful runtime
    insertion doinks; only recall, swap, seeding and blocked attempts are
    silent);
  - it must NOT reset or delay the paced interval walk — the shrinking
    schedule is RUSH's pressure curve and the two triggers are independent.

#### 0.6b The end condition gains a third clause

The shift ends when ALL THREE are true:

1. waiting room is empty (`state.waiting.length === 0`), AND
2. no roster patients remain undealt, AND
3. **no patient is in the centre panel** (`state.active === null`).

John added clause 3 and it matters — the shift must not end out from under a
patient still being evaluated. Note that with 0.6a's on-empty refill, clause 1
can only be satisfied once clause 2 already is, which makes the whole
condition safe by construction; TRAP 3 above is defused rather than merely
avoided. Keep all three clauses anyway — clause 3 is doing real work, and the
conjunction documents the intent.

SANDBOX has no roster, so clause 2 is never true and sandbox never
self-ends. Correct and intended.

#### 0.6c The left-waiting penalty STAYS, and extends to TRIAGE 300s

John's ruling: the penalty applies to **RUSH and TRIAGE 300s**, and NOT to
sandbox. (Claude had recommended dropping it; John reaffirmed and extended
it. Decided — it is also genuinely more defensible now that the room can be
cleared. Sandbox is exempt because it has no roster, so there is no shortfall
to measure.)

**OPEN — what does "patients still waiting" COUNT?** This needs a decision,
because the obvious reading makes the penalty do almost no work:

  - **Reading A — those visible in the room at the end.** In TRIAGE the room
    is HELD AT FIVE by 0.6a, so essentially every player who fails to clear
    ends with exactly 5 waiting. The penalty becomes a flat -50 for everyone,
    identical whether they saw 8 of 20 or 18 of 20. It discriminates barely
    at all in TRIAGE, and only loosely in RUSH.
  - **Reading B — roster patients never seen** (`roster - patientsSeen`,
    i.e. those waiting PLUS those never dealt). Saw 8 of 20 → 12 unseen
    → -120. Saw 18 of 20 → 2 unseen → -20. Discriminates exactly in
    proportion to the shortfall.

  **Recommend B.** It measures the thing the penalty is for, it is trivial to
  explain ("patients you never got to"), and it reads naturally beside the
  review's "SAW 15 OF 20". It also preserves the score ceiling: clearing the
  roster means zero unseen, so the maximum is still exactly `roster x 100`.

**OPEN — what is the per-patient amount for TRIAGE?** RUSH uses
`RUSH_WAITING_PENALTY_PER_PATIENT: -10`. TRIAGE currently uses 0. If both
modes now charge, the constant should probably be renamed and given a
per-profile value rather than a RUSH-specific one.

Note the deliberate double charge: an unseen patient costs the +100 never
earned AND the per-patient penalty. That is John's call and is consistent
with wanting throughput to matter; recording it so it is not "fixed" later by
someone who thinks it is an accident.

### 0.7 RUSH 60s, walked through in full (John, 2026-08-05)

John's own walkthrough. **The other three profiles are still to come — he is
mid-explanation.** Treat this as the reference profile; the others will be
described against it.

    patientsAvailableQueue = 12        <- NOTE: was 10 in 0.2, now 12

1. The waiting room shows FIVE slots. The first two patients occupy slots
   1-2. (Matches today's `seedInitialQueue`: RUSH seeds 2, and
   `MIN_VISIBLE_WAITING` 5 means five rows are drawn.)
2. The shift starts. Arrivals fill slots 3-5.
3. Beyond five, the panel GROWS: 6, 7, 8, 9, 10. (Today's behaviour — the CSS
   already documents "5 minimum, up to 10 in RUSH".)
4. **If an arrival is due and all ten slots are full, the patient WAITS
   OFF-SCREEN and enters the instant a slot opens.** This is new. Today a
   blocked arrival is simply skipped until the next interval tick; John wants
   a pending patient to enter immediately on the next free slot.
5. If the player empties the room and `patientsAvailableQueue` is 0, nothing
   more is added — **and that is not an error**. (This is the exact opposite
   of the old backlog premise that an empty room reads as broken.)
6. If a patient is still in the centre panel, the shift CONTINUES until that
   patient is assigned a room. Then the shift ends and is scored.
7. If the timer expires first, the score stands and there is a penalty for
   **every patient still not seen — including the one sitting in the centre
   panel.**

#### What point 7 settles

It answers 0.6c's open question decisively: **Reading B.** "Not seen" means
"never assigned a room", so the penalty counts `roster - patientsSeen`, which
sweeps up all three groups at once — those in the waiting room, those still
off-screen, and the unassigned patient in the panel. Reading A (count only
what is visible in the room) is dead.

#### Three implementation notes this raises

**(a) A blocked or pending arrival must NOT consume the roster.** The roster
may only decrement on ACTUAL insertion into the waiting room. If it were
decremented when an arrival is scheduled, blocked arrivals would silently eat
the roster and the shift could end with patients who were never shown. Today's
`insertWaitingPatient` already returns early on `reason: "full"` BEFORE
calling `drawUniquePatientId`, so the deck is not consumed — that ordering is
correct and must be preserved when the roster counter is added beside it.

**(b) Does a full room still SHAKE?** `processRushArrival` currently sets
`blockedShake` when capacity refuses an arrival. Under the new model the
arrival is deferred rather than lost, but the shake still communicates
something true — "you are overwhelmed". Keep it, or suppress it now that the
patient is merely waiting rather than turned away? Small, but it is a feel
question and should be answered rather than inherited.

**(c) THE LAST-PATIENT RECALL WINDOW — the sharpest edge case here.**
Assignment is not final in this game: an assigned patient sits behind a door
and can be RECALLED, replacing the ledger result (Phase 5 mechanic; see
`selectWaitingPatient`'s doc comment about a tap FINALIZING the case). Point 6
says the shift ends as soon as the last patient is assigned — which would mean
the FINAL patient of a shift is the one patient the player can never fix,
uniquely, and only because they happened to be last. That will feel wrong in
play ("I wanted to change that one"). Options: end the shift immediately
anyway (crisp, but inconsistent), or let the normal recall window run and end
when it closes. NEEDS A DECISION.

#### Smaller open point

Does the panel shrink back BELOW five as the last patients are placed? It
grows 5 -> 10; on the way down it presumably returns to a five-row minimum,
which would leave empty slots visible during the final drain. Collapsing to
the true remaining count would turn the panel into the endgame progress
indicator described in Q3b. Not yet decided.

### 0.7b RUSH 120s (John, 2026-08-05)

**Identical to 0.7 in every rule.** The only difference is a larger starting
`patientsAvailableQueue`: **20, provisional** ("let's say 20? Will figure that
out later").

Everything else carries over unchanged — five slots shown, seeded with 2,
panel grows to 10, arrivals wait off-screen when full and enter on the next
free slot, empty room with an empty pool is not an error, the shift runs on
while a patient is in the centre panel, and the timer-expiry penalty counts
every patient never assigned a room.

Implied pace: **6.0 s/patient**, slightly more forgiving than RUSH 60s at
5.0 — which is the right direction for the longer shift.

### 0.7c TRIAGE 300s (John, 2026-08-05)

    patientsAvailableQueue = 30        <- was 20 in 0.2; adjustable later

- The waiting room starts with 5 and **stays at 5 for the whole shift**.
  Already the shipped behaviour: `selectWaitingPatient` refills on every
  Triage selection, announced, with a doink. The only new part is that the
  refill stops when the pool runs out.
- Because the room is held at exactly five and is refilled the moment a slot
  opens, TRIAGE never needs 0.7's off-screen pending queue. There is no
  overflow to hold.
- The room only begins to DRAIN when fewer than five patients remain in the
  pool — i.e. during the last five patients of the shift. The endgame
  contraction is therefore short, but it is still the clearest "you are
  nearly done" signal available without new UI.
- **Scoring is the same as RUSH** — same points table (+100 / +50 / -50).
- Shift ends when the pool is empty, the room is empty, and the centre panel
  is clear. Same three-clause rule as 0.6b.

Implied pace: **10.0 s/patient**, roughly twice as forgiving as RUSH. That
gap now looks right: RUSH 5-6s, TRIAGE 10s.

#### REVERSAL — TRIAGE has NO not-seen penalty

**"There is no did not see penalty."** This REVERSES John's earlier ruling
(recorded in 0.6c) that the left-waiting penalty applied to RUSH *and* TRIAGE
300s. Flagged rather than silently applied, because a reversal two messages
apart is exactly the kind of thing that turns out to be an oversight.

Assuming it stands, it is the better design and it restores today's shipped
behaviour: TRIAGE's waiting multiplier is already 0 in the live game, and a
penalty-free calm mode contrasts cleanly with RUSH's pressure.

Consequences worth noting:
  - the penalty question in 0.6c now applies to **RUSH only**, so there is no
    longer any need for a per-profile penalty amount — the existing
    `RUSH_WAITING_PENALTY_PER_PATIENT: -10` stays exactly as it is, correctly
    named;
  - the deliberate double charge (points never earned PLUS the penalty)
    likewise now applies only to RUSH, where an unseen patient effectively
    costs 110;
  - TRIAGE's score ceiling remains exactly `30 x 100 = 3000`, so the review's
    percentage still works, and a TRIAGE score can no longer go negative from
    unseen patients alone.

### 0.7d TRIAGE no-timer / SANDBOX (John, 2026-08-05)

- The waiting room is **kept full** (five), exactly as TRIAGE 300s, but with
  no pool limit — it never drains.
- Patients score normally (+100 / +50 / -50).
- **No penalty of any kind.**
- **No timer.** The player must explicitly STOP the shift, and only then sees
  the results.

Which means sandbox is the one profile that can never reach the win ending of
0.5 — clause 2 (pool empty) is never true — and can never reach `TIME'S UP`
either. Every sandbox shift ends by the player's own hand.

Still open for sandbox, unchanged from 0.4:
  - the review needs a SECOND SHAPE (no roster means no possible score, so no
    percentage and no BELOW/MEETS/EXCEEDS band — score and stats only);
  - "END SHIFT EARLY" is the wrong footer wording when nothing was scheduled;
  - **the ledger keying problem is now provably sandbox-only.** Every other
    profile deals at most 30 patients, far below the 160-patient deck, so
    repeats are impossible there. Sandbox is the ONLY mode that can exhaust
    and reshuffle the deck, and therefore the only reason to make the ledger
    encounter-keyed rather than patient-keyed. That reframes the cost: the
    entire complexity exists to serve one untimed mode, which strengthens the
    "just cap sandbox at 160" alternative.

---

### 0.8 THE COMPLETE PICTURE — all four profiles

| | RUSH 60s | RUSH 120s | TRIAGE 300s | SANDBOX |
|---|---|---|---|---|
| Pool size | 12 | 20 | 30 | unlimited |
| Timer | 60s | 120s | 300s | none |
| Slots shown | 5, grows to 10 | 5, grows to 10 | 5, held | 5, held |
| Seeded | 2 | 2 | 5 | 5 |
| Arrivals | paced + on-empty | paced + on-empty | on selection | on selection |
| Overflow held off-screen | yes | yes | n/a | n/a |
| Not-seen penalty | **-10 each** | **-10 each** | none | none |
| Can end by clearing | yes | yes | yes | never |
| Score ceiling | 1200 | 2000 | 3000 | none |
| Review shape | graded % | graded % | graded % | stats only |
| Implied pace | 5.0 s | 6.0 s | 10.0 s | — |

All pool sizes are first guesses pending John's real play data.

Common to all four: scoring is +100 / +50 / -50; no bonuses of any kind; the
pool counts CUMULATIVE arrivals; the shift ends only when pool, waiting room
and centre panel are all empty; and clearing is a win with its own
congratulation, its own wording and its own sound.

### 0.9 Suggested shape for the constants

These four profiles want to live in ONE readable table rather than scattered
across `MIN_VISIBLE_WAITING`, `MAX_WAITING`, `TRIAGE_LENGTH_CHOICES_SECONDS`
and mode branches in `seedInitialQueue`. Something like:

    SHIFT_PROFILES: {
      "rush-60":     { seconds:  60, pool:   12, maxSlots: 10, seed: 2, notSeenPenalty: -10 },
      "rush-120":    { seconds: 120, pool:   20, maxSlots: 10, seed: 2, notSeenPenalty: -10 },
      "triage-300":  { seconds: 300, pool:   30, maxSlots:  5, seed: 5, notSeenPenalty:   0 },
      "triage-open": { seconds: null, pool: null, maxSlots:  5, seed: 5, notSeenPenalty:   0 }
    }

`roster: null` and `seconds: null` both mean "unlimited", which keeps sandbox
from needing its own code path in most places. Tuning then means editing one
table — which is the point, since every number above is a first guess.

---

## 1. What John proposed

> "What if there were a limited number of patients to be seen? Say 10 in a
> 60 second rush, 15 in 120 second rush, 30 in a 600 second triage? Those are
> just first guesses, which would need to be refined. If the player empties
> the waiting room in the allowed time they are permitted 'bonus' patients
> added after the last patient, but that is bonus points, never a
> subtraction."

Two mechanics in one:

- **A ROSTER** — a fixed, known number of patients that belong to this shift.
- **BONUS PATIENTS** — clear the roster before time runs out and more arrive,
  worth points, never a penalty.

---

## 2. Why this matters more than it first appears

### It gives the score a denominator

This is the strongest argument for the idea, and it came from an unrelated
problem. While designing the Shift Review's supervisor-evaluation form we hit
a wall: a BELOW / MEETS / EXCEEDS grade needs a threshold, and any threshold
we pick is invented, because **the current score has no ceiling**. There is
no such thing as a perfect shift, so there is nothing to be a percentage of.

A roster fixes that at the root:

    possible score = roster size x 100      (every patient placed correctly)
    grade          = score / possible score

    "2,150 of a possible 3,000 - 72%"

That is arithmetic, not judgement. No invented thresholds to defend, no
implied claim about what a real clinician should achieve, and — critically —
**scores become comparable between runs**, which is what makes a score worth
chasing a second time. Today two shifts of different lengths cannot be
meaningfully compared at all.

### It makes the waiting room honest

John's other objection the same day (see the memory note
`waiting-room-not-players-fault`) was that the review must never fault the
player for patients left waiting, because the room can never be emptied. With
a roster the room CAN be emptied. "Patients not seen" becomes a real measure
of the player's throughput instead of a restatement of the game's premise —
and it needs no penalty attached, because the points never earned ARE the
cost.

---

## 3. The framing that keeps this cheap

If bonus patients keep arriving indefinitely, **the roster never caps play**.
The game feels almost exactly as it does now. What the number actually buys:

1. a target,
2. a moment of triumph when it is cleared,
3. a denominator for scoring.

That is a much smaller change than "limited patients" sounds like, and RUSH
keeps its drowning feeling intact. Worth stating plainly up front, because
the phrase "limited patients" makes it sound like the arcade endlessness is
being thrown away. It is not.

---

## 4. Open questions

> **Q1, Q2, Q4 and Q5 are SUPERSEDED** by section 0.5: clearing the room now
> ENDS the shift instead of dealing bonus patients. They are kept as a record
> of the road not taken. Q3, Q3b, Q6, Q7 and Q8 are still live.

### Q1. When exactly does BONUS begin? (SUPERSEDED)

Two readings, and they play very differently:

- **(a) On CLEAR** — bonus starts when the waiting room is actually empty:
  every roster patient has arrived AND been placed. Bonus is a reward for
  catching up.
- **(b) On DEAL-OUT** — bonus starts when the last roster patient has
  *arrived*, whether or not the player has caught up.

John's wording ("if the player empties the waiting room in the allowed time
they are permitted bonus patients") clearly means **(a)**. Recommend (a). It
makes bonus an achievement rather than a clock event.

### Q2. How do bonus patients score? (SUPERSEDED — but read it if bonus ever returns)

"Bonus points, never a subtraction" has two readings, and one of them breaks
the game:

- **(i) Pure upside** — a bonus patient placed correctly pays, a bonus
  patient placed wrong costs nothing.
  **This is exploitable.** Once in bonus the correct strategy is to slam
  patients into rooms at random as fast as possible, because guessing is
  free. It would turn the reward for skilful play into a button-mashing
  minigame.
- **(ii) Normal scoring in bonus; the promise is about the ROSTER** — you are
  never docked for roster patients you did not reach. Bonus patients score
  the usual +100 / +50 / -50.

**Recommend (ii).** It is exploit-free, and it is very likely what John
meant: the "never a subtraction" reassurance is about not being punished for
falling short, which was the whole thrust of his waiting-room objection ten
minutes earlier.

If John does want pure upside, the exploit needs a brake. Options:
  - bonus wrong pays 0 but still counts against the accuracy percentage that
    drives the grade (so the score is safe, the grade is not);
  - a wrong answer ends bonus mode for the shift;
  - bonus patients pay half (+50 correct, 0 wrong), so guessing has a
    low expected value.

### Q3. Does the player SEE the count during play?

The single decision that most changes how the mode FEELS.

- **Visible ("12 / 30")** — RUSH becomes a race against a known finish line.
  Motivating, legible, speedrun-friendly. Trades dread for pace.
- **Hidden** — keeps the current dread; clearing the room becomes a genuine
  surprise and a great moment.
- **Middle** — hidden in RUSH, visible in TRIAGE. Fits their characters: RUSH
  is panic, TRIAGE is a workmanlike shift.

No recommendation yet — this is a taste call and John's alone.

### Q3b. THE WAITING ROOM AS THE INDICATOR (John, 2026-08-05)

John's refinement: stop inventing a counter. The waiting room already goes
from 0 to 10 — let IT show where the player stands. Start as today (5 seeded
in TRIAGE, 2 in RUSH — confirmed accurate against `seedInitialQueue`), add
patients up to a maximum, then let the room drain. Find the true maximum
number of slots and that fixes the roster size; everything left is arrival
timing versus the clock.

This is a better instinct than a numeric counter: diegetic, no new UI, and
it makes the answer to Q3 "visible, but as a feeling rather than a number."

Two things buried in it, though.

**TRAP 1 — RESOLVED (John, 2026-08-05: cumulative). Kept here because the
reasoning must survive into doc 8.** "Until the max is reached" is ambiguous,
and one reading inverts the reward.

  - If arrivals stop when the room hits *max concurrent occupancy*, then a
    FAST player keeps freeing slots, occupancy never reaches the cap,
    arrivals never stop, and they receive MORE patients than a slow player.
    Skill would be punished with extra work.
  - If arrivals stop after N *cumulative arrivals*, it behaves correctly.

  These are different stopping rules that sound identical in English. The
  roster must be **cumulative arrivals**. Max occupancy stays what it is
  today: a back-pressure cap that blocks (and shakes) when the room is full.

**TRAP 2 — RESOLVED by John's profiles in 0.2, which deliberately let the
roster exceed the display (15 patients through 10 slots, 20 through 5).**
Kept because it explains WHY the profiles are shaped that way. Room capacity
and roster size are different numbers, and forcing them to be equal breaks
long TRIAGE.

The panel is a single-column grid in the 22%-wide left column (doc 7's
22/56/22 layout, which is approved and final). Ten rows already means roughly
45px per chip on a 320px-wide phone, at 70px wide, with a complaint label at
the bottom. Twelve rows is ~37px. Fifteen is ~29px and the complaint text
stops being readable. So the practical ceiling is **10, maybe 12** — it is a
layout constraint, not a preference, and widening the column is off the table.

If roster == capacity == 12:

| Shift       | Roster | Seconds per patient |
|-------------|--------|---------------------|
| RUSH 60s    | 12     | 5.0                 |
| RUSH 120s   | 12     | 10.0                |
| TRIAGE 300s | 12     | 25.0                |
| TRIAGE 600s | 12     | **50.0**            |

RUSH is excellent. TRIAGE 600s is fifty seconds per patient — dead air for
most of the shift. The idea works beautifully for short modes and falls apart
for long ones.

**PROPOSED SYNTHESIS — the room is the indicator, but only in the endgame.**

Keep roster > capacity. The room refills normally while roster remains. Once
the roster is fully dealt, nothing refills, so the room can only shrink — and
`.waiting-panel` already has its row count set by JS, so the empty slots can
be *collapsed* rather than drawn. The column visibly CONTRACTS as the player
works.

That is an unmistakable progress bar built from parts that already exist:

  - no new UI, no counter, no number;
  - the dread is preserved for most of the shift (no finish line in sight);
  - the endgame gets a natural crescendo — the moment the player notices new
    patients have stopped coming is a real beat;
  - it scales to any roster size, so TRIAGE 600s is no longer capped at 12.

Optional reinforcement, thematic and cheap: the ambulance-bay doors close, or
a quiet `NO NEW ARRIVALS` chip appears where the empty slots used to be.

**Side effect worth deciding on its own merits: single wave vs siege.**
Under John's roster==capacity version, every shift is ONE wave — fill, then
drain, one crescendo, a calm final stretch. Under the refill version it is a
siege that only relents at the end. RUSH's current character is escalation,
so roster==capacity would make the last stretch of a RUSH *calmer* than the
middle. That may be a welcome arc (panic then relief) or may gut the mode.
It is a taste call and should be made deliberately rather than inherited.

### Q4. What happens at the moment of CLEAR? (PARTLY SUPERSEDED — clearing now
ends the shift, but the celebration ideas below still apply to that ending)

Currently an empty waiting room reads as broken (which is exactly why the
backlog has a "RUSH must never leave an empty waiting room" item). Under this
design it becomes the best moment in the game and deserves a beat:

- a `WAITING ROOM CLEAR` flash, its own sound;
- (the bonus-patient marking ideas that were here are moot — clearing now
  ends the shift; what survives is that the WIN ending deserves its own
  wording and sound, not a reuse of TIME'S UP or SHIFT ENDED).

### Q5. Bank or push? (SUPERSEDED — there is nothing to push on now)

The road not taken: clearing the roster could END the shift with a TIME BONUS
rather than deal more patients. John chose bonus patients — but there is a
third option that is more interesting than either, and cheap:

> On clear, offer a choice. **END SHIFT NOW** and bank a time bonus, or
> **KEEP GOING** and take bonus patients with normal scoring.

That is a genuine risk/reward decision at the most dramatic moment of the
shift — bank a certain reward, or push and risk wrong answers eating into it.
It costs one overlay and one formula. Flagging it because it is the kind of
thing that is nearly free if designed in now and expensive to retrofit.

### Q6. Should the roster be COMPOSED, not just counted?

An opportunity that only exists once shifts have a fixed size, and it matters
for the whole "comparable scores" argument:

If one shift happens to draw thirty easy ESI-4s and the next draws thirty
ambiguous ones, the percentages are NOT comparable and the denominator is
a bit of a lie. Drawing the roster to a fixed acuity recipe — e.g. always
2x ESI-1, 5x ESI-2, 9x ESI-3, 9x ESI-4, 5x ESI-5 for a 30-patient shift —
makes every shift the same exam. It also unlocks seeded rosters later
("play the same 30 patients I did"), which is the natural route to any kind
of score sharing.

Cost: `patient-data` needs enough patients at every acuity to fill the recipe
without repeats. 160 patients total, so probably fine, but it must be checked
against the actual ESI distribution before promising it.

### Q7. What is the denominator when a shift ends early?

If the player hits END SHIFT EARLY at 0:30 having placed 5 of 5 correctly, is
that 100%? Recommend **no** — the denominator stays the FULL roster, so
leaving early honestly shows as "5 of 30". Ending early is a legitimate
choice, and the score should reflect the choice rather than hide it.

### Q8. Does the RUSH left-waiting penalty survive? (CLOSED — YES, and it now
also applies to TRIAGE 300s. See 0.6c. The recommendation below was NOT taken.)

Recommend **dropping it**. `RUSH_WAITING_PENALTY_PER_PATIENT` (-10 each)
currently docks the player for a full room. With a roster the shortfall is
already priced in — every patient not reached is +100 not earned. Charging
twice for one shortfall is the harsh version and re-creates exactly the
unfairness John objected to.

This is a doc 3 scoring change and needs John's explicit sign-off.

---

## 5. The numbers, and why we cannot pick them yet

John's first guesses imply a required working pace:

| Shift        | Roster        | Seconds per patient |
|--------------|---------------|---------------------|
| RUSH 60s     | 10            | **6.0**             |
| RUSH 120s    | 15            | **8.0**             |
| TRIAGE 300s  | *unspecified* | — (15 would be 20s) |
| TRIAGE 600s  | 30            | **20.0**            |

Two observations:

1. **RUSH demands roughly 3x the speed of TRIAGE.** Six seconds to read a
   patient and choose a room is very aggressive. If 10-in-60s is unreachable,
   the WIN ending never triggers in the shortest mode at all — not
   necessarily wrong for a hard mode, but it should be a decision rather than
   an accident.
2. **TRIAGE 300s has no number yet.**

**We cannot calibrate any of this from the code.** The numbers used in the
Shift Review mockups (11 seen in 5:00, 5 seen in 2:00) were INVENTED by
Claude and must not be treated as evidence. The one thing that would set all
four rosters at once is John playing three or four shifts and reporting how
many patients he actually gets through per length.

Sizing principle once that data exists: **a good shift should clear the
roster with roughly 15-20% of the clock left.** That makes the win a real but
earned outcome rather than routine or impossible.

### Arrival pacing has to be redesigned with this, not after it

If the roster is spread evenly across the whole shift, the player CANNOT
clear early — the last patient arrives as time expires. So arrivals must
front-load: deal the whole roster within roughly the first 60-70% of the
shift, leaving a catch-up window where clearing is achievable.

Rough shape: `arrival interval ~= (shift length x 0.65) / roster size`.
For 60s/10 that is ~3.9s between arrivals — much faster than today's 10s
first-arrival wait, and RUSH keeps its dread because the room fills quickly.

This dovetails with the existing backlog item **"RUSH arrival pacing
revision"** (John wants the rush to start sooner, and is considering dropping
the 20% two-patient burst). Those two should be designed as one piece of
work, not sequentially.

Also worth checking: `MIN_VISIBLE_WAITING` is 5 and `MAX_WAITING` is 10. With
a 10-patient roster, starting the shift with 5 visible means HALF the roster
is on screen before the player does anything. The initial fill probably needs
to scale with roster size.

---

## 6. What this supersedes or collides with

- **SUPERSEDES the backlog item "RUSH must never leave an empty waiting
  room."** That item exists because an empty room currently reads as broken.
  Here an empty room is the win condition and ends the shift.
  The item should be deleted, not implemented, if this ships.
- **MERGES WITH the backlog item "RUSH arrival pacing revision"** (see above).
- **BLOCKS the Shift Review supervisor-evaluation build.** The grade band
  changes shape if the score gains a ceiling — a percentage-of-possible grade
  is a different component from a threshold grade. The FORM MOTIF and the
  density work (variant A2) survive either way, so the mockups are not
  wasted, but the grade section should not be finalised until this is
  settled.
- **Phase 9 persistence** would need to carry roster identity if seeded
  rosters (Q6) are ever wanted.

---

## 7. Honest risks

- **It can make short shifts feel like a checklist** rather than a siege.
  The endless-arcade feeling is part of RUSH's charm.
- **If the roster is too large to ever clear, the feature is invisible** —
  the whole thing silently reduces to a denominator. That is still worth
  having, but John should know that is the likely outcome for TRIAGE 600s
  unless the roster is sized generously.
- **Calibration burden**: four roster numbers, each interacting with arrival
  pacing and with two difficulties.
- **Naming**: "roster" is a dev word. The real ED term for patients in the
  department is **CENSUS** — "SHIFT CENSUS: 30" has better flavour and is
  worth considering for any player-facing string.

---

## 8. What is still needed from John

Most of the design is now settled (section 0). What remains:

1. **Real play data** — patients actually placed in a 60s RUSH, a 120s RUSH
   and a 300s TRIAGE. The rosters (10 / 15 / 20) are first guesses and this
   is the only thing that can confirm or correct them. Nothing Claude has
   produced counts as evidence: the figures in the Shift Review mockups were
   invented.
2. **What the left-waiting penalty COUNTS** (0.6c) — those visible in the
   room at the end (reading A, nearly constant and so nearly meaningless in
   TRIAGE), or roster patients never seen (reading B, recommended)?
3. **The per-patient penalty amount for TRIAGE 300s** — same -10 as RUSH, or
   its own number?
4. **Sandbox ledger ruling** (0.4 item 3b) — make the ledger encounter-keyed
   so repeated patients record as separate encounters, or simply cap sandbox
   at 160 patients and avoid the problem?
5. **Q6, optional** — compose the roster to a fixed acuity recipe so shifts
   are comparable exams? Much cheaper to build in now than to retrofit, and
   it is what would make percentages honestly comparable between runs.

Q8 (drop the RUSH penalty) is CLOSED — John reaffirmed and extended it
instead; see 0.6c.

ALREADY ANSWERED and recorded in section 0: cumulative arrivals; the four
profiles and their numbers; TRIAGE 600s replaced by sandbox; deck reshuffles
on exhaustion; clearing the room ends the shift with a congratulation; and no
bonuses of any kind.
