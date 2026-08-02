> **Historical document — not authoritative.** It describes an earlier schema,
> ESI model, and game design. Start with the current
> [Single Source of Truth](../singleSourceOfTruth/README.md).

# TRIAGE RUSH — Specifications (Design & Data)

*Authoritative locked spec. Data/schema last updated 2026-07-18; **game model finalized
2026-07-21** (see §3 and §3b–§3d). Design docs now live in `claude-john-docs/DESIGN/`:
`DESIGN/basic-design.md` (vision), `DESIGN/app-design-notes.md` (the rolling design
commentary — John's mockup + the Round 1/2/3 back-and-forth that locked the game model),
`DESIGN/app-design-01.jpg` (the mockup), `DESIGN/triageLevels(Rooms).txt`. Implementation
notes are in `specifications-technical.MD`.*

Browser game gift for **Andy** — a Boston University M4 heading into Emergency
Medicine, ~30, board/video gamer, League of Legends fan. Touch-first (iPhone/iPad),
plain HTML/CSS/JS, no build step, ships on GitHub Pages. **Deadline: 2026-07-19.**

---

## 1. Core concept (one line)

An **Overcooked-style triage rush**, NOT a quiz. You almost always *know* the answer;
the challenge is keeping up as patients pile up. Real medicine delivered visually and
fast; humor is a core feature; ~80% of cases are read-at-a-glance easy, with subtle
"looks-minor-but-isn't" traps as occasional spikes.

## 2. The triage model (THE key data decision)

Each case carries **one** medically-scored value: `triage`, an integer **1–7**. Values
1–5 are the real **ESI (Emergency Severity Index)** acuity levels; 6 and 7 are game
routing values for disposition-type lanes. The number is **never shown to the player** —
they see only the five zones. Code maps the number to a zone:

```js
const TRIAGE_ZONE = {
  1: "Resus", 2: "Resus",         // ESI 1–2: immediate / emergent
  3: "Acute",                     // ESI 3: stable, needs multi-resource workup
  4: "Fast Track", 5: "Fast Track",  // ESI 4–5: minor
  6: "Psych",                     // stable behavioral
  7: "Discharge",                 // worried-well / send home
};
```

**`correctZone` is now authored into each case** (the zone string above) as the answer
the engine checks — simple and readable. It is always exactly `TRIAGE_ZONE[triage]`, so
the two can never disagree; `triage` stays as the medical truth AND the driver of
`acceptableZones` (and of any *later* proportional scoring — v1 scoring is flat, see §3).
The player only ever sees zone names, never a number.

**ESI reference (what the numbers mean):**

| ESI | Meaning | Example |
|-----|---------|---------|
| 1 | Immediate life-saving intervention needed | Arrest, unresponsive, crashing trauma |
| 2 | High-risk, can't wait; **or danger to self/others** | Chest pain c/f MI, stroke, sepsis, suicidal-with-plan |
| 3 | Stable but needs *multiple* resources | Abd-pain workup, post-MVC back pain |
| 4 | Needs *one* resource | Ankle X-ray, simple laceration |
| 5 | Needs *no* resources (exam ± Rx) | Med refill, poison ivy |

Five drop zones total: **Resus / Acute / Fast Track / Psych / Discharge.**
Color-coded acuity feel (critical-red → routine-green), phone-friendly large touch
lanes, portrait-first.

## 3. Scoring & feedback (FLAT scheme, score-only, NON-verbal in play)

**Finalized 2026-07-21.** The engine compares the chosen zone to `correctZone` /
`acceptableZones` and awards flat points. **There is NO fail state** — no reputation meter,
no lives, no overflow game-over. A run is exactly **3 timed rounds**; the only outcome is a
score (see §3b). All point values are read from `config.js` (§3d); defaults shown:

| Outcome | Points | config key | Feedback |
|---|---|---|---|
| **Correct zone** (`correctZone`) | **+100** | `pointsCORRECT` | green flash + *ding* + floating `+100` |
| **Acceptable zone** (`acceptableZones`) | **+50** | `pointsACCEPTABLE` | amber flash + *bing* + floating `+50` |
| **Wrong zone** (any other) | **−50** | `pointsWRONG` | red flash + *buzz* + floating `−50` |
| **Left in the visible queue at round end** | **−25 each** | `pointsPerPatientLeftInQueue` | shown only in the round-stats popup |
| **Seconds left when a round is cleared early** | **+10/sec** | `pointsPerSecondRemaining` | shown only in the round-stats popup |

**Score each outcome through a function, not a bare constant** (John's request 2026-07-21):
the engine should compute each award via a small function — e.g. `scoreForPlacement(chosen,
case)` returning `pointsCORRECT` / `pointsACCEPTABLE` / `pointsWRONG`, and
`penaltyForLeftInQueue(n)` / `bonusForSecondsLeft(s)`. Today each just returns the flat
config value, but routing every award through a function means a future **proportional**
rule (e.g. "very wrong" ≫ "barely wrong", scaled by the `triage` gap) is a one-function
change with no other code touched.

**This flat scheme is a deliberate change from the earlier directional model.** The old spec
made under-triage hurt worse than over-triage, scaled by the `triage` gap. v1 uses a **flat
±** scheme — simpler, arcade-honest, and the authored `acceptableZones` already absorb most
defensible over-triage as `+50` rather than `−50`. The "paranoia valve" survives (wrong is
wrong in either direction), just without magnitude. `triage` remains the medical truth and
the driver of `acceptableZones`; proportional scoring is the *later* enhancement above.

**Running score vs. end-of-round adjustments.** The on-screen score updates live as patients
are placed (`+100`/`+50`/`−50` per tap). The **queue penalty and time bonus are applied only
at round end**, in the round-stats popup — they are not knowable mid-round. John accepts the
consequence that the displayed total can *drop* at round end (the leftover-queue penalty) or
*jump* (the time bonus); showing a running penalty for still-waiting patients would risk a
discouraging negative score early, so it is deliberately deferred to the popup.

**Only the visible queue is penalized**, not undrawn patients — so the end-of-round penalty
is bounded at `−25 × visible-cap` (≤ −250 at the RUSH cap of 10), which suits a no-fail game.

### The disagreement problem (why `acceptableZones` exists)

Andy is an M4 heading into EM. **The single biggest risk to this gift is the game
confidently telling a doctor he is wrong when he is actually right.** Real ESI calls are
genuinely debatable at the margins (2-vs-3, 4-vs-5) — arguing about them *is* emergency
medicine. A game that flattens that into binary right/wrong loses its credibility with
exactly the person it was made for.

So each case carries **one** `correctZone` (the textbook call) plus an optional list of
`acceptableZones` (defensible alternates). The Results screen therefore **never says
"wrong"** for an acceptable answer — it says *"Textbook call: Resus — you said Acute,
which is defensible,"* and the `teach` line owns the debate instead of pretending it
doesn't exist.

**HARD RULE:** `acceptableZones` may contain only an **over-triage or a genuine
toss-up** — **never a dangerous under-triage**, and never anything for an ESI 1–2 case.
Missing the sick patient must always stay a miss. `validate_cases.py` enforces this.

**How alternates are identified:** `run_triage_eval.py --runs 3` shows an AI the blind
player card and asks for a zone, three times. Cards that answer consistently are
decidable; cards that **wobble between runs** are the ambiguity shortlist — the
`acceptableZones` candidates. The eval only *nominates*; a human (ideally Andy) decides.

**In-play feedback is NON-VERBAL — no text to read mid-rush (this is NOT a flashcard
app).** On a room tap (see §3c — the game is tap, not swipe):
- Correct → target room flashes **green** + a *ding* + a floating `+100`.
- Acceptable → **amber** flash + *bing* + floating `+50`.
- Wrong → **red** flash + *buzz* + floating `−50`.
- Once a patient is placed, **they're gone.** No mid-game reveal, no interrupt.

**No post-game Results/report screen (decided 2026-07-21).** The earlier design routed
every resolved patient into a Results pool and put all teaching on a game-over report
screen. That is **cut** — game-over shows the score and returns to the splash. The teaching
content (`diagnosis` / `disposition` / `redFlag` / `teach` / `quote`) is **not lost**: it
moves to an opt-in **patient browser** reachable from the splash screen (a read-on-the-couch
card viewer, not attached to a score). The patient browser is **deferred** — built after the
game works. Those fields stay in the schema, authored and ready, for that screen.

## 3b. Game structure & the round loop (finalized 2026-07-21)

**A run = splash → 3 rounds → game-over popup → back to splash.** No fail state.

**Each round is configured independently** by an `r1_`, `r2_`, `r3_` block in `config.js`
(§3d), so the three rounds can differ in pace and volume without any code change.

**One round:**
1. A **countdown popup** — `START ROUND n`, then a `3 … 2 … 1` beat. The same popup starts
   round 1. While it is up, game state for the round is reset/prepared.
2. Player taps to begin; the **timer** counts down from `rN_timer` (default r1 = 60s).
3. The round **ends when the timer hits 0, OR when the queue is empty AND every patient is in
   a room** (i.e. all `rN_patientsTotal` handled). Ending early banks the leftover seconds as
   bonus (`pointsPerSecondRemaining`).
4. A **round-stats popup** shows the itemized score for that round (correct / acceptable /
   wrong / left-in-queue / time-bonus) and the running total, then bridges to the next
   round's countdown popup. Round-stats and the "click to start round n" beat are the *same*
   screen.

**The queue (waiting room) — a QUIET phase then a RUSH phase.** Each round draws from a pool
of `rN_patientsTotal` patients (default r1 = 20); once the pool is exhausted the queue drains
and does not refill.

- **Start:** the visible queue begins with `rN_patientsInitial` patients (r1 = 2).
- **QUIET phase:** a new patient is added every `rN_patientsDelay_QUIET` seconds (r1 = 5s)
  until the visible queue reaches `rN_patientsQueueMax_QUIET` (r1 = 5). After that the queue
  stays at the cap — a new patient appears only as one is taken.
- **RUSH trigger:** when the timer counts *down* to `rN_RUSHtrigger` (r1 = 20, i.e. 20s
  remaining on a 60s timer → 40s elapsed), the pace switches to RUSH: adds every
  `rN_patientsDelay_RUSH` seconds and the cap rises to `rN_patientsQueueMax_RUSH` (r1 = 10).
- **New patients push the existing ones UP and appear at the bottom.** Thumbnails **squish**
  (progressively flatter — ~90% / 75% / 50% height) to fit up to the RUSH cap.

**The queue is NOT always full-or-empty** — it can be part-full while first filling toward
the QUIET cap, and again while ramping up to the RUSH cap. (This corrects the earlier
"always full or empty" simplification.) **No LWBS, no per-patient timeout** — considered and
deferred as too much complexity for too little gain.

**Difficulty:** v1 ships **no in-game difficulty selector** — the three `rN_` blocks *are*
the tuning, and the timer is the felt difficulty. If a selector is ever wanted it belongs on
the **splash screen** and would just swap in a different set of round values (e.g. shorter
timers). The old `easy*`/`hard*` config split is replaced by the explicit per-round blocks.

## 3c. Interaction model — ALL TAP, no drag (finalized 2026-07-21)

Drag was **dropped** (iOS Safari drag is the single most fragile thing we could build). Only
two things are tappable: **queued patients** and **rooms**. The rules (revised 2026-07-21 —
the queue↔panel swap is new):

- **a.** PATIENT panel **empty** + tap a queued patient → that patient moves into the PATIENT
  panel. **Any** queued patient is selectable, not just the top one (this is *eyeball
  triage* — you choose who to see next from how they look). The queue reflows.
- **b.** PATIENT panel **occupied** + tap a *different* queued patient → **the two swap**: the
  tapped patient comes into the panel, the panel's current patient returns to the queue (into
  the tapped patient's slot). So the player can freely shuffle patients between the queue and
  the panel with a tap — nothing is committed until a *room* is tapped.
- **c.** PATIENT panel **occupied** + tap a room → the patient is placed there and scored;
  the panel empties. It is **not** auto-refilled — you must pick the next patient yourself.
- **d.** PATIENT panel **empty** + tap a room → nothing.

**The PATIENT panel is NOT a button.** Tapping it does nothing, ever — the player can rest a
finger on it. Only queue taps and room taps are gameplay input. **No confirmation tap and no
lockout needed** — a room placement empties the panel, so you must re-select from the queue
before another placement can happen; a stray double-tap cannot misfire.

**The transfer animation (tornado swirl) must be an isolated, disable-able function**
(John's request 2026-07-21 — he expects it to be fiddly to get right). Signature roughly:
`animateTransfer(sourceImg, sourcePos, destPos, fadeIn/fadeOut)`. It is called on every move
(queue→panel, panel→queue on a swap, panel→room) but the game logic must not depend on it —
if it misbehaves, the function can simply `return` immediately (or be stubbed) and the game
still plays correctly. Keep the state change and the animation fully decoupled.

## 3d. Config file — `config.js` (finalized 2026-07-21)

All tunables live in **`assets/config.js`** — `<script>`-included, NOT a `.txt`/`.ini` read
with `fetch()` (`fetch()` fails under `file://` when index.html is double-clicked, the same
wall that forces `cases.js`). The editable content is a plain `key = value` block (one per
line) inside a template string; a small parser in `js/main.js` splits on newlines, drops
blank/comment lines, splits each remaining line on the **first** `=`, trims both sides,
strips optional surrounding quotes from the value, and coerces numeric strings to numbers.
Non-techie-safe: John/Andy touch only the `key = value` lines.

**Comment marker: `#` or `//`.** The parser treats either as "ignore the rest of the line."
**Do NOT use `\` for comments** — inside a JS template string a backslash is an escape
character (`\t`, `\n`…) and can silently corrupt the line. (John's draft used `\\`; `#`/`//`
are the safe equivalents.) Quotes around a value are optional — `AHP` and `"AHP"` both parse.

Config is **per-round**: an `r1_`, `r2_`, `r3_` block configures each of the three rounds
independently (see §3b for what each key does), plus one `points*` block for scoring (§3).

```js
// config.js — edit only the lines between the two ` marks. Leave the first and last line alone.
const CONFIG_TEXT = `

playerDefaultInitials = AHP        # 3-letter arcade initials, editable on the splash screen

# ---- ROUND 1 (easiest / warm-up) ----
r1_timer                 = 60      # seconds on the clock
r1_patientsTotal         = 20      # total patients this round; pool drains, no refill after
r1_patientsInitial       = 2       # patients already in the queue when the round starts
r1_patientsDelay_QUIET   = 5       # QUIET phase: add a patient every N seconds...
r1_patientsQueueMax_QUIET = 5      # ...until the visible queue holds this many
r1_RUSHtrigger           = 20      # when the timer counts DOWN to this, switch to RUSH
r1_patientsDelay_RUSH    = 3       # RUSH phase: add a patient every N seconds (faster)...
r1_patientsQueueMax_RUSH = 10      # ...and let the visible queue grow to this (max 10)

# ---- ROUND 2 (busier) ----
r2_timer                 = 60
r2_patientsTotal         = 24
r2_patientsInitial       = 3
r2_patientsDelay_QUIET   = 4
r2_patientsQueueMax_QUIET = 6
r2_RUSHtrigger           = 25
r2_patientsDelay_RUSH    = 3
r2_patientsQueueMax_RUSH = 10

# ---- ROUND 3 (hectic) ----
r3_timer                 = 60
r3_patientsTotal         = 28
r3_patientsInitial       = 4
r3_patientsDelay_QUIET   = 3
r3_patientsQueueMax_QUIET = 6
r3_RUSHtrigger           = 30
r3_patientsDelay_RUSH    = 2
r3_patientsQueueMax_RUSH = 10

# ---- SCORING (see §3; each is applied through a function so it can go proportional later) ----
pointsCORRECT               = 100  # patient placed in the correct room
pointsACCEPTABLE            = 50   # placed in a listed acceptable room (not a miss)
pointsWRONG                 = -50  # placed in any other room
pointsPerPatientLeftInQueue = -25  # per patient still visible in the queue at round end
pointsPerSecondRemaining    = 10   # bonus per second left if the round is cleared early
`;
```

**10 is the hard ceiling for any `QueueMax_RUSH`** — the visible queue never shows more than
10 (the squish stops there). Values for r2/r3 above are illustrative defaults showing the
intended round-to-round escalation; all are John-tunable.

## 4. Per-case schema (LOCKED)

One JSON object per case. Stored (for now) as one file per case in `patients/`, named
`{id}.json`, alongside the matching `{id}.png`. Combined into one bank later. Complete
worked example:

```json
{
  "id": "001-peds-ankle",
  "number": 1,
  "easterEgg": false,
  "difficulty": 1,
  "johnsComments": "",

  "name": "Tyler",
  "age": 10,
  "sex": "M",
  "race": "white",

  "chiefComplaint": "Twisted ankle",
  "quote": "I was basically winning Wimbledon, then my ankle quit and I ate the court. Walking hurts now. ...Do I get cool crutches?",
  "presentationShort": "10yo M — inversion ankle injury on court. Painful weight-bearing, NV intact.",
  "presentationLong": "10-year-old male, inversion ankle injury playing tennis, painful to bear weight, neurovascularly intact.",

  "vitals": {
    "hr":   { "value": 92,       "color": "green"  },
    "bp":   { "value": "110/70", "color": "green"  },
    "rr":   { "value": 18,       "color": "green"  },
    "spo2": { "value": 99,       "color": "green"  },
    "temp": { "value": 37.0,     "color": "green"  },
    "pain": { "value": 5,        "color": "yellow" }
  },

  "triage": 4,
  "correctZone": "Fast Track",
  "acceptableZones": [],

  "diagnosis": "Grade I lateral ankle sprain",
  "disposition": "Fast Track → ankle X-ray to rule out Salter-Harris, then splint & RICE, discharge with return precautions",
  "redFlag": null,
  "teach": "Ottawa/peds rules borderline — one X-ray makes it a true ESI 4. Back on court soon. 🎾",

  "visual": {
    "who": "10-year-old boy in white tennis kit, racket beside him",
    "pose": "sitting on a clinic chair, one shoe off",
    "expression": "brave-face wince",
    "signs": ["right ankle visibly swollen and red"],
    "lookSeverity": "uncomfortable but clearly stable"
  },

  "openai_4o": {
    "anchor_image": "patients/_style-anchor.png",
    "size": "1024x1024",
    "output": "images-hires/001-peds-ankle.png",
    "prompt": "Flat-color cartoon, Overcooked/Pixar style: thick clean outlines, soft pastel palette, single character, 3/4 front view, centered, square 1:1. Match the exact style, line weight, lighting, and palette of the attached reference image. Subject: a white 10-year-old boy in a tennis outfit, racket beside him, on the same blue clinic chair against a soft light-blue background. Pose: sitting, one shoe off. Expression: a brave-face wince — NOT gritted teeth. Clearly visible: right ankle swollen and red. Overall uncomfortable but clearly stable. No text, no logos."
  }
}
```

**Field roles:**
| field | voice | job |
|---|---|---|
| `chiefComplaint` | — | 1–3 word headline you skim in the rush |
| `presentationShort` | intern, chart shorthand (B) | one-line sign-out — the *story*, not the vitals |
| `presentationLong` | intern, spoken handoff (A) | same content, full spoken words; program picks which per layout |
| `quote` | patient, sometimes funny | charm + occasional tell |
| `vitals` | — | value + authored `color` per vital; UI draws colored circles |
| `race` | — | portrait diversity; ~55% white / 15% black / 15% hispanic / 15% asian |
| `triage` / `correctZone` | — | hidden ESI truth + the checkable zone answer |
| `acceptableZones` | — | array of *defensible* alternate zones (usually `[]`); scored as a near-hit, never a miss |
| `number` | — | integer database key (case 001 → `1`); always equals the id's NNN prefix |
| `johnsComments` | John, to himself | private review scratchpad; authoring-only, never shipped |

**Notes / removed fields:**
- `tone` was replaced by `easterEgg` (boolean) — flags LoL/gamer/Andy cases.
- `archetype` and `image` were dropped; images load by convention `patients/{id}.png`.
- **`number` (added 2026-07-19)** is the database-style key — a plain **integer**, not
  `"001"`. JSON forbids leading zeros, so `001` is not even valid JSON; the zero-padded
  form is a *display* concern (`f"{number:03d}"`). It must always equal the NNN prefix of
  the `id`, and `validate_cases.py` enforces both that and bank-wide uniqueness. Adding it
  did **not** change the naming scheme: files stay `NNN-slug.json`. Neutral filenames were
  considered and rejected — 483 existing references in `eval-results/` and the eval report
  are written in slugs, the diagnosis-leak problem is already solved by the derived
  `patients-player-view/`, and the slug is what makes a file listing readable.
- **`johnsComments` (added 2026-07-19)** is John's private review scratchpad, written via
  `patientBrowser`. **Authoring-only:** it is not in `build_player_view.py`'s
  `PLAYER_FIELDS` allowlist, so it structurally cannot reach the eval or the player.
- **`acceptableZones` is AUTHORED, not computed** (added 2026-07-19; defaults to `[]` on
  all 100 cases). Deliberately *not* derived from an "adjacent ESI" rule — a rule would
  produce nonsense like making Discharge acceptable for an ESI 5. Defensibility is a
  medical judgment, not arithmetic. The debate explanation lives in the existing `teach`
  field; no separate explanation field was added.
- **Vitals colors are AUTHORED, not computed.** Each vital is `{ "value", "color" }`
  with `color` ∈ `green | yellow | red` = the author's physiologic, age-appropriate
  judgment (green = normal-for-age, yellow = concerning, red = dangerous). The engine
  just renders them — no age-band table in code.
- **`openai_4o`** is a self-contained block for the image pipeline: the fully-assembled
  `prompt` (the source of truth for generation — edit it to re-roll art), the
  `anchor_image` exemplar, `size` (**1024×1024**, the only square `gpt-image-1` offers),
  and `output` path. It intentionally duplicates some of `visual`; `visual` remains the
  human-readable breakdown.
- **Image locations:** the pipeline writes **1024² hi-res masters to `images-hires/{id}.png`**
  (the `output` path). **Decided 2026-07-21: the game loads these hi-res images directly —
  no 512² downscale, no second image set to maintain.** Only if a real phone-performance
  problem appears do we revisit downscaling. (After the folder reorg the game's copy lives in
  `assets/images/{id}.png`.)

## 5. Authoring rules (keep the medicine honest)

1. **Fairness contract:** a benign case has `redFlag: null` and no red flags anywhere.
   A "looks-minor-but-isn't" case ALWAYS carries at least one honest tell (in a
   `presentation`, the `quote`, the `vitals`, or the `visual.signs`) a sharp player
   could catch.
2. **Traps are spice, not the meal** — target ~80% easy/obvious cases.
3. **Presentation = the story a photo and a monitor can't show.** The card's four
   channels must be *complementary, never redundant*: the picture shows how they look,
   the traffic-light vitals show the numbers, the `presentation` gives mechanism / onset
   / timing / relevant history / pertinent exam findings, and the `quote` is the
   patient's own (unreliable) version. **Never narrate the vitals in the presentation** —
   the colored circles already do that. Keep each presentation to one line (~12–22 words
   for Long) so it fits a phone card.
4. **Dangerous psychiatric emergencies are medical 1–2 (Resus), NOT 6.** The Psych lane
   (6) is for *stable* behavioral cases only.
5. **Discharge (7)** = the worried-well who need no ED care. (ESI 5 still means "a
   provider must lay eyes on them"; 7 is the "you're honestly fine, go home" bucket.)
6. **Expression is a deliberate clue channel** — vary it (dread, stoic denial, dazed,
   exhausted, indignant, panicked); a dazed or frightened face can itself be a red flag.
7. **Race is independent of the medicine** — assign it for a realistic waiting room, never
   link a condition to a race.
8. **Medical sanity pass required** before ship — subtle errors are exactly what an M4
   catches, and accuracy IS the credibility of the gift.

## 6b. Case bank expansion — 55 cases added 2026-07-19 (101–155)

**THE CASE BANK IS CLOSED AT 155 CASES** (declared done 2026-07-19; only obvious-error
fixes from here). Authored via `patient-creation-pipeline-using-openAI/author_new_cases.py` +
`new_cases_data.py` (content authored by hand, schema and image prompt generated
mechanically so they cannot drift between cases).

**FINAL distribution:** Resus 50 (32.3%) · Acute 33 (21.3%) · Fast Track 42 (27.1%) ·
Psych 5 (3.2%) · Discharge 25 (16.1%). Difficulty d1 65 · d2 55 · d3 35.
Sex M 87 / F 68 · race white 80 / hispanic 30 / black 28 / asian 17 · 22 children <13 ·
6 easter eggs · **58 cases carry `acceptableZones`.**

**What was added and why:**
- **COVID ×4** (101–104) — ESI 1 through Discharge, incl. **silent hypoxaemia** (102):
  comfortable, chatty, SpO₂ 84. The tell is *entirely* in the vitals badge.
- **Psych ×4** (105–108) — the lane was badly underweighted at 3. Includes the rule-§5.4
  pair: stable relapse → Psych (105) vs **command hallucinations → Resus** (106).
- **Overdose ×4** (109–112) — incl. **paracetamol OD** (109, feels completely fine, is
  the most dangerous card in the batch) and **sickle cell crisis labelled "drug-seeking"**
  (112). Stereotype deliberately inverted in 111 (tidy professional in a tailored suit).
- **Travel pair** (113–114) — same "just back from Congo" headline, opposite answers.
  Resolves to Resus via the ESI 2 *"danger to others"* clause; there is no Isolation lane
  and none was added.
- **RSV ×3** (115–117) — the *"but my COVID test was negative"* line lives in the **quote**
  (unreliable narrator), never the presentation.
- **Comedy ×9** — costume cases carrying real medicine. Deliberately **not all benign**:
  Santa is a STEMI (121) and the BU mascot is exertional heat stroke (122), so "is this
  case funny?" cannot be used as a shortcut for "is this patient sick?"
- **Classics ×5** (125–129) — carbon monoxide (SpO₂ reads *falsely green*), hyperkalaemia
  after a missed dialysis session, compartment syndrome, necrotising fasciitis, acute
  angle-closure glaucoma.
- **12 deliberately boring fillers** (132–143) — the real gap was *easy* cases. The
  **distinct easy pool went 38 → 59**, which is the number that matters: a ~40-patient run
  draws its easy 80% without visibly repeating faces. The overall Resus *percentage*
  barely moved (33.0% → 32.9%) and that is fine — spawn weighting controls the felt ratio.

**BU easter eggs** (`easterEgg: true`): 122 mascot, 124 cheerleader. The mascot is drawn
as a scarlet-and-white terrier suit and **is never named "Rhett"** — BU convened a formal
committee in 2020 to consider retiring that name over its *Gone With the Wind* origins.
The visual gag carries the joke without the baggage.

**Deliberately rejected:** non-accidental trauma (child/elder abuse). A legitimate EM
responsibility, but tonally wrong in a birthday gift and impossible to make feel right as
a swipe-and-score mechanic.

**Open item:** case **108** was authored with `acceptableZones: ["Discharge"]` and the
validator rejected it — it compares Discharge (acuity 7) against triage 6 and calls it an
under-triage. Psych is supposed to be *off* the acuity ladder (see the `ZONE_ACUITY`
comment), so this looks like a validator gap rather than a medical error. **The field was
left `[]` and the safety rule was NOT modified** — that decision is John's.

## 6c. The eval-driven tuning pass (2026-07-19) — how the bank was finished

The full eval (155 cases × 3 runs, gpt-4o, card + portrait) drove two rounds of change.
**Scores went 78% textbook / 86% not-wrong → 82% / 96%.**

### Round 1 — `acceptableZones` for the new cases (26 added)

The eval showed the new cases scoring **76% textbook AND 76% not-wrong — identical**,
because none of them had alternates authored: every debatable call scored as a miss. The
old cases scored 79% / 91%, and that 12-point gap *is* `acceptableZones` working. The new
cases were never weaker medicine, only unprotected.

Every alternate added is an **over-triage or a true toss-up**; the safety rule was not
bent. Notably **all 31 over-triage misses were absorbed** — after this pass the report
shows *zero* over-triage, because each one was a call a competent M4 could defend
(angle-closure glaucoma → Resus, varicella pneumonia → Resus, adult measles → Resus,
RSV/COPD → Resus, sedative OD → Resus).

**Policy decision — every Discharge case now accepts Fast Track.** The eval crossed the
ESI-5 ↔ Discharge line in *both* directions on eight cases. That boundary is genuinely
not decidable from a card, and "a provider should lay eyes on them" is always defensible.

### Round 2 — re-zoning six cases (a medical decision, not a scoring one)

Six cases were under-triaged 3/3 by the AI and could **not** be fixed with
`acceptableZones`, because a lower-acuity alternate is precisely what the safety rule
forbids. John changed the authored answer instead — moving the textbook call to where a
competent M4 actually lands, and keeping the more cautious zone as the (legal) alternate:

| Case | Was | Now | Accepts |
|---|---|---|---|
| 013 rx-refill-bp | Fast Track (5) | **Discharge (7)** | Fast Track |
| 055 shoulder-dislocation | Acute (3) | **Fast Track (4)** | Acute |
| 071 bppv-vertigo | Acute (3) | **Fast Track (4)** | Acute |
| 072 vasovagal-syncope | Acute (3) | **Discharge (7)** | Fast Track |
| 099 intoxicated-head-lac | Acute (3) | **Fast Track (4)** | Acute |
| 155 remission-common-cold | Fast Track (5) | **Discharge (7)** | Fast Track |

**The `teach` lines had to move with them.** 013 previously read *"she still needs
eyes-on, so ESI 5, not a discharge-from-the-door"* and 072 read *"Still get an ECG"* —
both now argued against their own answer key. They were rewritten to own the debate
instead (see §3, "the disagreement problem").

**Flagged reservation on 072:** "every syncope gets an ECG" is close to dogma in EM, so
Discharge is the one call in this batch an EM-bound reader might argue with. Fast Track is
acceptable, so the cautious answer is never punished — but this is the first case to
revisit if Andy pushes back.

### What still misses 3/3 — and why that is correct

Only **five** cases, all ESI 2, all deliberately understated on the card:
`003` GSW to arm · `030` anticoagulated head strike · `081` postictal seizure ·
`112` sickle cell labelled "drug-seeking" · `126` missed dialysis → hyperkalaemia.

**These are the traps. Being missed is the design.** The rule correctly forbids alternates
on ESI 1–2, and that line must never soften — it is the whole reason under-triage stays a
miss.

## 6. Case bank — 100 cases authored 2026-07-18

The full bank is **100 cases** (`patients/001-*.json` … `patients/100-*.json`), each a
locked-schema JSON. `triage` is shown here for review only — hidden in game. Rather than
list all 100, the per-case files are the source of truth; here is the shape of the bank:

**By zone:** Resus 33 · Fast Track 28 · Acute 26 · Discharge 10 · Psych 3.
**By difficulty:** d1 = 43 · d2 = 36 · d3 = 21 (a real easy→hard spread; ~80% is d1–d2).
**Demographics:** sex M 54 / F 46; race white 49 / hispanic 22 / black 18 / asian 11;
16 children (<13). **Easter eggs:** 2 (gamer/League — `047-mechanical-back-pain`,
`049-common-cold`).

**Coverage highlights:**
- *Batch 1 (001–017):* the founding mix — MI masquerade, stroke, elder sepsis, GI perf,
  appendicitis, testicular torsion, anaphylaxis, plus easy Fast-Track/Discharge cases.
- *Batch 2 (018–052):* peds accidents (skateboard, burns, nursemaid's elbow), the
  commonly-**missed** dangerous dx (PE, aortic dissection, ectopic, ovarian torsion,
  meningitis, SAH, cauda equina, AAA, DKA, GI bleed, anticoag head bleed, cerebellar
  stroke), plus everyday volume. `043` = **acute psychosis** (Psych) — replaced an earlier
  suicidal-ideation case at John's request.
- *Batch 3 (053–100):* everyday ED breadth — sprains/fractures, lacerations, UTI, strep,
  cholecystitis, pancreatitis, AF/SVT, COPD, DVT, shingles — and the overt-vitals critical
  end (septic shock, opioid OD, STEMI, pneumothorax, anaphylaxis, stroke, flash pulmonary
  edema, HHS) where the traffic-light badge reads clearly red. More rapid discharges.

**Authoring rule reinforced this session:** the **quote + presentation must contain the
honest tells that validate the diagnosis** — every case decidable from the card alone.
Sicker cases now carry **overtly abnormal (yellow/red) vitals** so the badge is a real
signal, not decoration.

**Engine note:** because the bank leans a bit critical, the game **weights spawns** (mostly
easy cases, Resus as occasional spikes) to preserve the ~80/20 *feel* — a deep critical
bench doesn't break it.

## 7. Art house style (LOCKED — painterly + transparent)

Style direction **changed this session** after comparing a flat-cartoon set against the
original painterly renders. Final house style:

- **Softly-shaded painterly cartoon, semi-realistic Pixar/Disney feel:** smooth gradient
  shading, soft lighting, fine delicate outlines (NOT thick flat outlines), natural
  proportions, single character, 3/4 front view, centered, square **1024².**
- **Transparent background (RGBA cutout of character + chair).** The room is composited as
  a **game layer** (fixed floor + baseboard + a swappable wall/sign behind), which is what
  the mockup's card area does. This enables changing backgrounds without regenerating art.
- **Style-anchor method, per-case:** each case's `openai_4o.anchor_image` points at a
  painterly reference. The original 5 anchor on their own `_orig` source; cases 006+ anchor
  on the shared `patients/_style-anchor.png` (a painterly reference). The pipeline attaches
  it every call with "match the exact painterly style, brushwork, shading, palette."
- **`openai_4o.prompt` is the source of truth** for each image (painterly preamble +
  subject/pose/expression/signs). Edit the string and re-run that id to re-roll.
- **Style was chosen by experiment** (a flat-cartoon set and a painterly-baked-background
  set were generated for comparison, then discarded once painterly-transparent won). Only
  the final 100 painterly-transparent masters are retained.
- **Ship prep (revised 2026-07-21):** the ~1.7 MB 1024² masters ship **as-is** — the game
  loads them directly (no downscale). Revisit only if a real phone-performance problem shows
  up; the mitigation then would be to downscale the *single* game copy, still no second set.
- **See `DESIGN/app-design-notes.md`** for the rolling design commentary and John's
  play-screen mockup (`DESIGN/app-design-01.jpg`) — the layout the art is built to fit,
  and the source of the finalized game model in §3b–§3d.

## 8. Screens (finalized 2026-07-21)

Three screens, plus a deferred fourth:

1. **Splash / loading screen** — title + funny subtitle, a **last-game recap** ("last shift:
   12 patients, 165 pts"), **NEW GAME** (difficulty = timer value, as a sub-item if exposed),
   a **HINTS** popup (quick how-to-play), a **BEST DOCTOR** badge → **device-local**
   leaderboard (localStorage top-5; labelled "best on this device" — a real shared board
   needs a backend we don't have), and an editable **3-char PLAYER ID** (arcade-style,
   defaults to `AHP`). During the splash/countdown, the ~20 drawn patient images preload.
2. **Play screen** — the mockup: header (`round | timer`), queue rail, PATIENT panel
   (portrait + quote + vitals badge + presentation), 5 room doors, footer.
3. **Footer / game controls** — `START | PAUSE | UNPAUSE` (one button, state-dependent) ·
   `SCORE` (round / total, e.g. `45 / 125`, resolves to total at game end) · `QUIT`. PAUSE
   dims everything except the footer, **no penalty**. QUIT → pause → "Are you sure? Y/N";
   N resumes after a short beat (all buttons live immediately, only the timer's restart is
   delayed a second or two). After the game-over popup → return to the splash.
4. **Patient browser (DEFERRED)** — the opt-in card viewer that inherits all the teaching
   fields; built only after the game works.

**Persistence:** `localStorage` (not cookies) — one JSON blob: player ID, last-game recap
(patients seen, score, date), and the top-5 board.

**Target device:** iPhone 16 Pro (402×874 CSS-px, DPR 3, Dynamic Island + home indicator →
`viewport-fit=cover` + `env(safe-area-inset-*)`). One portrait layout that scales fluidly;
iPad/desktop get a centered, larger version of the same screen, not a separate layout.
