/* ============================================================================
   triageRush - game.js
   Domain state and rules. No DOM, no rendering, no audio, no timers.

   Everything here is testable with plain data: the state tree is one
   serializable object, actions validate legality before mutating, and all
   totals are derived from the ledger by selectors (docs 4, 8).

   Section map:
     1. Canonical constants
     2. Injected context (clock + random)
     3. Initial state
     4. Settings validation and application
     5. Patient record validation (schema 2.2, schema-preserving)
     6. Score selectors
     7. Navigation actions (start / quit / stop / return-to-lobby)
     8. State invariants (development checks)
     9. Preference persistence (versioned localStorage envelope)
   ========================================================================= */

"use strict";

/* ------------------------------------------------------------------------
   1. Canonical constants (docs 3, 8)
   --------------------------------------------------------------------- */

const GAME_CONSTANTS = Object.freeze({
  POINTS: Object.freeze({ correct: 100, close: 50, wrong: -50 }),
  MAX_WAITING: 10,
  MIN_VISIBLE_WAITING: 5,
  RUSH_DOUBLE_PROBABILITY: 0.20,
  /* Emptying the RUSH waiting room earns a courtesy refill: after a
     one-second beat, one or two patients (a coin flip) walk in so the
     player is never stuck with nobody to see (John, 2026-08-06). */
  EMPTY_REFILL_DELAY_MS: 1000,
  EMPTY_REFILL_DOUBLE_PROBABILITY: 0.50,
  HEARTBEAT_MS: 250,
  BURST_BEAT_MS: 250,

  TRIAGE_LENGTH_CHOICES_SECONDS: Object.freeze([300, 600]),
  RUSH_LENGTH_CHOICES_SECONDS: Object.freeze([60, 120]),

  PLAYER_TITLES: Object.freeze([
    "Doctor", "Nurse", "RN", "RES", "Intern", "EMS",
    "MS1", "MS2", "MS3", "MS4", "MR", "MRS", "M", "MS"
  ]),

  MODES: Object.freeze(["triage", "rush"]),
  DIFFICULTIES: Object.freeze(["forgiving", "strict"]),

  VIEWS: Object.freeze(["home", "game", "review"]),
  PHASES: Object.freeze(["loading", "ready", "active", "complete", "error"])
});

/* ------------------------------------------------------------------------
   2. Injected context.
   The clock and random source are injected so scheduler and burst behavior
   can be tested deterministically (doc 4). Production uses the real ones.
   --------------------------------------------------------------------- */

function createGameContext(overrides) {
  const provided = overrides || {};
  return {
    /* Monotonic milliseconds for game timing (never wall clock). */
    monotonicNowMs: provided.monotonicNowMs || (() => performance.now()),
    /* Wall-clock timestamp for ledger bookkeeping and persistence. */
    wallClockNowMs: provided.wallClockNowMs || (() => Date.now()),
    /* Uniform [0, 1) random used for shuffles and RUSH burst draws. */
    random: provided.random || (() => Math.random())
  };
}

/* ------------------------------------------------------------------------
   3. Initial state.
   The full reference shape from doc 8, present from day one so later
   phases add behavior without reshaping the tree.
   --------------------------------------------------------------------- */

function createInitialState() {
  return {
    version: 1,

    view: "home",              // home | game | review
    overlay: null,             // settings-player | settings-shift | about |
                               // chart | patients-seen | confirm-quit |
                               // confirm-stop | shift-over | null
    phase: "ready",            // loading | ready | active | complete | error
    pauseReasons: [],          // "confirmation" | "document-hidden"
                               // (Chart deliberately does NOT pause)

    player: {
      title: "Doctor",
      initials: "AAA"
    },

    settings: {
      mode: "triage",          // triage | rush
      difficulty: "forgiving", // forgiving | strict
      triageLengthSeconds: 300,
      rushLengthSeconds: 60,
      /* Sound preferences (design change 2026-08-04, boombox retired):
         GLOBAL master switch, GAME SOUNDS family, MUSIC (KING-FM stream).
         Music plays only when soundGlobal && soundMusic, decided on HOME. */
      soundGlobal: true,
      soundGame: true,
      soundMusic: false
    },

    /* Shift-runtime override: the in-game mute button flips only this flag.
       It is re-derived from soundGlobal && soundGame at every shift start
       and never rewrites the persisted preferences. */
    gameSoundsAudible: true,

    shift: {
      id: null,
      startedAtMs: null,
      completedAtMs: null,
      endReason: null,         // timer | stop | quit | null
      elapsedMs: 0,
      remainingMs: 300000,
      lastLogicalQuarter: -1
    },

    deck: {
      ids: [],
      cursor: 0
    },

    waiting: [],               // [{ patientId, waitingBackgroundKey }]
    active: null,              // { patientId, recalledFromRoomKey? } | null
    assigned: null,            // { patientId, roomKey }
    recallAvailable: false,

    ledger: {
      order: [],               // patient IDs in stable first-assignment order
      byPatientId: {}          // id -> { patientId, roomKey, outcome,
                               //   direction, points, assignmentCount,
                               //   firstAssignedAtMs, lastAssignedAtMs }
    },

    rush: {
      arrivalRemainingMs: 10000,
      nextBaseIntervalMs: 10000,
      stagedSecondArrivalAtMs: null,
      currentArrivalEventId: 0,
      emptyRefillAtMs: null,        // logical elapsedMs of a pending refill
      emptyRefillSecondAtMs: null   // the refill pair's staged second member
    },

    chart: {
      clinicalExpanded: false  // shift-level memory; resets at new shift
    },

    review: {
      patientIndex: 0
    }
  };
}

/* ------------------------------------------------------------------------
   4. Settings validation and application.
   applySettings is legal only while no shift is active (phase ready);
   an illegal call must leave state untouched (doc 4 action contract).
   --------------------------------------------------------------------- */

/* Uppercase, strip non A-Z, keep at most 3. Empty result falls back to
   the previous value so a stray edit can never blank the initials. */
function normalizeInitials(rawText, previousInitials) {
  const cleaned = String(rawText || "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 3);
  return cleaned.length > 0 ? cleaned : previousInitials;
}

function isValidSettingsShape(candidate) {
  if (!candidate || typeof candidate !== "object") return false;
  return (
    GAME_CONSTANTS.MODES.includes(candidate.mode) &&
    GAME_CONSTANTS.DIFFICULTIES.includes(candidate.difficulty) &&
    GAME_CONSTANTS.TRIAGE_LENGTH_CHOICES_SECONDS.includes(candidate.triageLengthSeconds) &&
    GAME_CONSTANTS.RUSH_LENGTH_CHOICES_SECONDS.includes(candidate.rushLengthSeconds) &&
    typeof candidate.soundGlobal === "boolean" &&
    typeof candidate.soundGame === "boolean" &&
    typeof candidate.soundMusic === "boolean"
  );
}

function isValidPlayerShape(candidate) {
  if (!candidate || typeof candidate !== "object") return false;
  return (
    GAME_CONSTANTS.PLAYER_TITLES.includes(candidate.title) &&
    typeof candidate.initials === "string" &&
    /^[A-Z]{1,3}$/.test(candidate.initials)
  );
}

/* Returns true when applied, false when rejected. Rejection leaves state
   completely unchanged. */
function applySettings(state, newPlayer, newSettings) {
  if (state.phase !== "ready") return false;
  if (!isValidPlayerShape(newPlayer)) return false;
  if (!isValidSettingsShape(newSettings)) return false;

  state.player = { title: newPlayer.title, initials: newPlayer.initials };
  state.settings = {
    mode: newSettings.mode,
    difficulty: newSettings.difficulty,
    triageLengthSeconds: newSettings.triageLengthSeconds,
    rushLengthSeconds: newSettings.rushLengthSeconds,
    soundGlobal: newSettings.soundGlobal,
    soundGame: newSettings.soundGame,
    soundMusic: newSettings.soundMusic
  };
  return true;
}

/* The shift length that the current mode actually uses. */
function selectedShiftLengthSeconds(state) {
  return state.settings.mode === "rush"
    ? state.settings.rushLengthSeconds
    : state.settings.triageLengthSeconds;
}

/* ------------------------------------------------------------------------
   5. Patient record validation.
   Records are kept exactly as authored (schema-preserving boundary,
   docs 4, 5). Validation reads canonical paths; it never copies or
   renames anything.
   --------------------------------------------------------------------- */

function validatePatientRecord(record, expectedPatientId) {
  const problems = [];
  const check = (condition, message) => {
    if (!condition) problems.push(message);
  };

  check(record && typeof record === "object", "record is not an object");
  if (problems.length > 0) return problems;

  check(record.schema && record.schema.version === "2.2",
    `schema.version is ${record.schema && record.schema.version}, expected 2.2`);
  check(record.id === expectedPatientId,
    `id is ${record.id}, expected ${expectedPatientId}`);
  check(record.patient && typeof record.patient === "object",
    "patient group missing");
  if (problems.length > 0) return problems;

  const presentation = record.patient.presentation;
  check(presentation && typeof presentation === "object",
    "patient.presentation missing");
  if (presentation) {
    check(presentation.personal && typeof presentation.personal === "object",
      "patient.presentation.personal missing");
    check(typeof presentation.chiefComplaint === "string",
      "patient.presentation.chiefComplaint missing");
    check(presentation.vitals && typeof presentation.vitals === "object",
      "patient.presentation.vitals missing");
  }

  const answer = record.patient.answer;
  check(answer && typeof answer === "object", "patient.answer missing");
  if (answer) {
    check(Number.isInteger(answer.correctEsi) &&
      answer.correctEsi >= 1 && answer.correctEsi <= 5,
      `patient.answer.correctEsi is ${answer && answer.correctEsi}, expected 1-5`);
    check(TRIAGE_RUSH_ASSETS.roomKeys.includes(answer.correctRoom),
      `patient.answer.correctRoom is ${answer && answer.correctRoom}, not a legal room key`);
  }

  check(record.patient.clinical && typeof record.patient.clinical === "object",
    "patient.clinical missing");

  return problems; // empty array means valid
}

/* ------------------------------------------------------------------------
   5b. Deck, waiting queue, and patient selection (doc 8).
   The deck is a shuffled array of patient IDs plus a cursor. Waiting
   entries are tiny records: { patientId, waitingBackgroundKey } - the
   background belongs to the row, not the patient (2026-08-06). Actions
   return one-time effect flags (e.g. doink) that app.js executes once;
   nothing here plays sounds or touches the DOM.
   --------------------------------------------------------------------- */

function shuffledCopy(sourceArray, random) {
  const shuffled = sourceArray.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function isPatientIdInUse(state, patientId) {
  return (
    state.waiting.some(entry => entry.patientId === patientId) ||
    (state.active && state.active.patientId === patientId) ||
    (state.assigned && state.assigned.patientId === patientId) ||
    /* Current 160-patient shifts never repeat a seen patient (doc 8). */
    Boolean(state.ledger.byPatientId[patientId])
  );
}

/* Advance the cursor to the next unused ID. At exhaustion, reshuffle once;
   if a full second pass finds nothing legal, return null (explicit error
   beats looping forever). */
function drawUniquePatientId(state, context) {
  for (let pass = 0; pass < 2; pass++) {
    while (state.deck.cursor < state.deck.ids.length) {
      const candidateId = state.deck.ids[state.deck.cursor];
      state.deck.cursor += 1;
      if (!isPatientIdInUse(state, candidateId)) return candidateId;
    }
    state.deck.ids = shuffledCopy(state.deck.ids, context.random);
    state.deck.cursor = 0;
  }
  return null;
}

/* Backgrounds belong to waiting ROWS, not patients (John, 2026-08-06):
   a fresh one is chosen every time a patient enters a row, and rows are
   the only place backgrounds appear. Prefer one no visible row is using;
   with all 16 in use, any of them is fine. */
function chooseWaitingBackgroundKey(state, context) {
  const allKeys = TRIAGE_RUSH_ASSETS.waitingBackgroundKeys;
  const usedKeys = new Set(state.waiting.map(e => e.waitingBackgroundKey));
  const unusedKeys = allKeys.filter(key => !usedKeys.has(key));
  const pool = unusedKeys.length > 0 ? unusedKeys : allKeys;
  return pool[Math.floor(context.random() * pool.length)];
}

/* The one queue-insertion primitive. The doink belongs here and nowhere
   else: recall, swap, seeding (announce: false), and blocked attempts
   never produce one (doc 4 sound contract). */
function insertWaitingPatient(state, context, options) {
  if (state.waiting.length >= GAME_CONSTANTS.MAX_WAITING) {
    return { inserted: false, reason: "full", doink: false };
  }
  const patientId = drawUniquePatientId(state, context);
  if (patientId === null) {
    return { inserted: false, reason: "deck-exhausted", doink: false };
  }
  const entry = {
    patientId,
    waitingBackgroundKey: chooseWaitingBackgroundKey(state, context)
  };
  state.waiting.push(entry);
  return { inserted: true, entry, doink: Boolean(options && options.announce) };
}

/* Shift start seeds silently: 5 patients for Triage, 2 for RUSH. */
function seedInitialQueue(state, context) {
  const seedCount = state.settings.mode === "rush" ? 2
    : GAME_CONSTANTS.MIN_VISIBLE_WAITING;
  for (let i = 0; i < seedCount; i++) {
    insertWaitingPatient(state, context, { announce: false });
  }
}

/* The IDs the next `count` draws would produce, for portrait preloading.
   Draws skip in-use IDs, so peek must apply the same rule. */
function peekUpcomingPatientIds(state, count) {
  const upcoming = [];
  for (let i = state.deck.cursor;
       i < state.deck.ids.length && upcoming.length < count; i++) {
    const candidateId = state.deck.ids[i];
    if (!isPatientIdInUse(state, candidateId)) upcoming.push(candidateId);
  }
  return upcoming;
}

/* Tapping a waiting patient. Result includes effect flags for app.js.
   - Empty center: patient moves in; Triage refills immediately (announced).
   - Active unassigned center: the two swap; nothing else changes.
   - Assigned patient behind a door: the tap FINALIZES that case (door
     closes, recall opportunity ends, latest ledger result stands), then
     proceeds exactly like an empty center (doc 8).                        */
function selectWaitingPatient(state, context, waitingIndex) {
  if (state.phase !== "active") return { accepted: false, doink: false };
  if (waitingIndex < 0 || waitingIndex >= state.waiting.length) {
    return { accepted: false, doink: false };
  }

  if (state.active !== null) {
    /* Swap: no insert, no doink, no ledger change (doc 8). The patient
       returning to the row gets a fresh background (rows own their
       backgrounds). A recalled marker does not survive going back to
       the queue. */
    const waitingEntry = state.waiting[waitingIndex];
    state.waiting[waitingIndex] = {
      patientId: state.active.patientId,
      waitingBackgroundKey: chooseWaitingBackgroundKey(state, context)
    };
    state.active = { patientId: waitingEntry.patientId };
    return { accepted: true, doink: false };
  }

  /* Finalize any assigned case: its latest ledger record is already the
     recorded result, so only the placement state clears here. */
  if (state.assigned !== null) {
    state.assigned = null;
    state.recallAvailable = false;
  }

  const [selectedEntry] = state.waiting.splice(waitingIndex, 1);
  state.active = { patientId: selectedEntry.patientId };
  let doink = false;
  if (state.settings.mode === "triage") {
    const refill = insertWaitingPatient(state, context, { announce: true });
    doink = refill.doink;
  }
  return { accepted: true, doink };
}

/* ------------------------------------------------------------------------
   5c. Evaluation, assignment, recall, and ledger replacement (docs 3, 8).
   Pure rules first (testable with plain records), then the two state
   actions. Each seen patient owns exactly one ledger record keyed by
   patient ID; reassignment REPLACES that record in place, and because
   every total derives from the ledger, the old points and counts vanish
   automatically - nothing subtracts anything by hand.
   --------------------------------------------------------------------- */

/* "esi-3" -> 3; "psych" / "discharge" -> null. */
function parseEsiRoomNumber(roomKey) {
  const match = /^esi-([1-5])$/.exec(String(roomKey));
  return match ? Number(match[1]) : null;
}

/* The rooms worth full credit. Ordinary patients: their ESI room only.
   Psych/Discharge patients: BOTH the named special room and the ESI room
   from patient.answer.correctEsi (doc 3 dual correctness). */
function fullCreditRoomKeys(patientRecord) {
  const answer = patientRecord.patient.answer;
  const rooms = new Set([answer.correctRoom]);
  if (answer.correctRoom === "psych" || answer.correctRoom === "discharge") {
    rooms.add("esi-" + answer.correctEsi);
  }
  return rooms;
}

/* Required evaluation order (doc 3): full credit first, then the Strict
   short-circuit, then non-ESI rooms are Wrong, and finally ESI adjacency
   earns Close in Forgiving. */
function evaluateRoomChoice(patientRecord, roomKey, difficulty) {
  if (fullCreditRoomKeys(patientRecord).has(roomKey)) return "correct";
  if (difficulty === "strict") return "wrong";
  const selectedEsi = parseEsiRoomNumber(roomKey);
  if (selectedEsi === null) return "wrong";
  const correctEsi = patientRecord.patient.answer.correctEsi;
  return Math.abs(selectedEsi - correctEsi) === 1 ? "close" : "wrong";
}

/* Every room sits on ONE acuity ladder, most urgent first (doc 3):
   the five ESI rooms rank 1-5, then Psych (6) and Discharge (7). */
const ROOM_ACUITY_RANK = Object.freeze({
  "esi-1": 1, "esi-2": 2, "esi-3": 3, "esi-4": 4, "esi-5": 5,
  "psych": 6, "discharge": 7
});

/* Direction is explanatory and adds no points. It compares ladder RANKS:
   a lower rank than the correct room means "over" (higher acuity than
   required), a higher rank means "under". The correct side uses the
   ROOM's rank, never answer.correctEsi - deliberate, so the rule cannot
   break if a Psych or Discharge patient is ever authored at a different
   ESI. Ties are impossible: the same rank means the same room, which is
   full credit and returns at the first line. Every miss therefore moves
   exactly one counter, in every mode and difficulty (doc 3). */
function classifyTriageDirection(patientRecord, roomKey, outcome) {
  if (outcome === "correct") return "correct";
  const selectedRank = ROOM_ACUITY_RANK[roomKey];
  const correctRank =
    ROOM_ACUITY_RANK[patientRecord.patient.answer.correctRoom];
  return selectedRank < correctRank ? "over" : "under";
}

/* Assigning the active patient to a room. The caller looks up and passes
   the canonical patient record so this stays testable with plain data.
   Feedback (pulse, toast, sound) is app.js's job, driven by the result. */
function assignActivePatientToRoom(state, context, patientRecord, roomKey) {
  if (state.phase !== "active" || state.active === null) {
    return { accepted: false };
  }
  if (!TRIAGE_RUSH_ASSETS.roomKeys.includes(roomKey)) {
    return { accepted: false };
  }
  if (!patientRecord || patientRecord.id !== state.active.patientId) {
    return { accepted: false };
  }

  const outcome = evaluateRoomChoice(
    patientRecord, roomKey, state.settings.difficulty);
  const direction = classifyTriageDirection(patientRecord, roomKey, outcome);
  const previousRecord = state.ledger.byPatientId[patientRecord.id];
  const nowMs = context.wallClockNowMs();

  /* One record per patient: order keeps the first-assignment position, so
     a reassigned patient never moves in Patients Seen (doc 3). */
  if (!previousRecord) state.ledger.order.push(patientRecord.id);
  state.ledger.byPatientId[patientRecord.id] = {
    patientId: patientRecord.id,
    roomKey,
    outcome,
    direction,
    points: GAME_CONSTANTS.POINTS[outcome],
    assignmentCount: previousRecord ? previousRecord.assignmentCount + 1 : 1,
    firstAssignedAtMs:
      previousRecord ? previousRecord.firstAssignedAtMs : nowMs,
    lastAssignedAtMs: nowMs
  };

  state.assigned = { patientId: patientRecord.id, roomKey };
  state.active = null;
  state.recallAvailable = true;

  /* RUSH courtesy refill (doc 3): assigning the LAST waiting patient
     books one-or-two arrivals a one-second beat from now, so the player
     never sits with nobody to see. The scheduled-arrival countdown is
     deliberately untouched - normal pacing continues on schedule. Only
     the first emptying books a refill (a recall-and-reassign while one
     is pending must not push the beat back). */
  if (state.settings.mode === "rush" && state.waiting.length === 0 &&
      state.rush.emptyRefillAtMs === null) {
    state.rush.emptyRefillAtMs =
      state.shift.elapsedMs + GAME_CONSTANTS.EMPTY_REFILL_DELAY_MS;
  }

  return { accepted: true, outcome, direction, roomKey };
}

/* Recall: activating the assigned patient's open door returns them to the
   center for another look. The ledger record is untouched - it remains
   the recorded result until a reassignment replaces it (doc 3). */
function recallAssignedPatient(state, roomKey) {
  if (state.phase !== "active") return { accepted: false };
  if (!state.recallAvailable || state.assigned === null ||
      state.assigned.roomKey !== roomKey) {
    return { accepted: false };
  }
  state.active = {
    patientId: state.assigned.patientId,
    recalledFromRoomKey: roomKey
  };
  state.assigned = null;
  state.recallAvailable = false;
  return { accepted: true };
}

/* ------------------------------------------------------------------------
   5d. Chart (doc 3, doc 8; Phase 6).
   Chart is an active-patient tool: it can open only while a patient
   occupies the center panel. Reading the chart does NOT pause the clock
   (John, 2026-08-05): studying a patient costs shift time. Only the
   Clinical section's expanded/collapsed choice is remembered (for the
   rest of the shift); Answer never unlocks here, and Presentation resets
   to expanded on the next open, so neither needs state.
   --------------------------------------------------------------------- */

function addPauseReason(state, reason) {
  if (!state.pauseReasons.includes(reason)) state.pauseReasons.push(reason);
}

function removePauseReason(state, reason) {
  state.pauseReasons = state.pauseReasons.filter(r => r !== reason);
}

function openChart(state) {
  if (state.phase !== "active" || state.active === null) return false;
  if (state.overlay !== null) return false;
  state.overlay = "chart";
  return true;
}

function closeChart(state) {
  if (state.overlay !== "chart") return false;
  state.overlay = null;
  return true;
}

/* Called only when the player toggles the Clinical section inside Chart. */
function setChartClinicalExpanded(state, expanded) {
  state.chart.clinicalExpanded = Boolean(expanded);
}

/* ------------------------------------------------------------------------
   5e. Confirmation dialogs and document visibility (doc 8 pause model).
   The two things that pause the game are a confirm dialog being open and
   the browser tab being hidden - each a pause reason, so the scheduler
   needs no special cases. Both must clear before time moves again.
   --------------------------------------------------------------------- */

function openConfirmDialog(state, kind) {
  if (kind !== "quit" && kind !== "stop") return false;
  if (state.phase !== "active" || state.overlay !== null) return false;
  state.overlay = "confirm-" + kind;
  addPauseReason(state, "confirmation");
  return true;
}

/* Cancel path only; accepting runs quitShift/stopShift, which clear all
   pause state themselves. */
function closeConfirmDialog(state) {
  if (state.overlay !== "confirm-quit" && state.overlay !== "confirm-stop") {
    return false;
  }
  state.overlay = null;
  removePauseReason(state, "confirmation");
  return true;
}

function setDocumentHidden(state, hidden) {
  if (hidden && state.phase === "active") {
    addPauseReason(state, "document-hidden");
  } else if (!hidden) {
    removePauseReason(state, "document-hidden");
  }
}

/* ------------------------------------------------------------------------
   5f. Logical scheduler (doc 8; Phase 7).
   app.js runs one 250ms interval and asks this pure function to advance
   the clock. Time is quantized to 250ms "logical quarters": elapsedMs is
   always lastLogicalQuarter * 250, so a delayed browser callback that
   reports the same quarter twice changes nothing. Each newly crossed
   quarter is processed one at a time so no boundary event can be skipped
   even when several quarters arrive in one late callback.
   --------------------------------------------------------------------- */

const QUARTER_MS = 250;

/* The scheduler advances only when nothing is pausing the game (doc 8):
   phase active, view GAME, and the pause-reason set empty. */
function schedulerCanRun(state) {
  return state.phase === "active" &&
    state.view === "game" &&
    state.pauseReasons.length === 0;
}

/* The clock cue for one logical quarter, or null for a silent quarter
   (doc 3 "Clock, countdown, and sound timing"). Every cue lands on its
   own 250ms boundary, so each quarter carries at most one cue; that is
   also what makes "no duplicate tick at a coincident boundary" automatic
   (a Triage minute boundary IS that ten-second boundary's tick).
   Returns { sound, numeral } where numeral is 10..1 for the RUSH
   pop-over-the-patient display and null otherwise. */
function clockCueForQuarter(state) {
  const remainingMs = state.shift.remainingMs;
  const elapsedMs = state.shift.elapsedMs;
  const isRush = state.settings.mode === "rush";

  /* Final ten seconds (both modes use the RUSH audio cadence, doc 3):
     countdown tick on each whole second 10..1; during the final five,
     extra beats at one-quarter and one-half second AFTER the integer,
     silence at three-quarters - EXCEPT the last TWO seconds, which beat
     on every quarter as a run-in to the dong (John, 2026-08-05).
     Numerals are RUSH-only (doc 7). */
  if (remainingMs <= 10000) {
    if (remainingMs % 1000 === 0) {
      return {
        sound: "countdownTick",
        numeral: isRush ? remainingMs / 1000 : null
      };
    }
    if (remainingMs < 2000) return { sound: "countdownTick", numeral: null };
    const beatInSecond = remainingMs % 1000;
    if (remainingMs < 5000 && (beatInSecond === 750 || beatInSecond === 500)) {
      return { sound: "countdownTick", numeral: null };
    }
    return null;
  }

  if (isRush) {
    /* Ten-second boundaries B above the final ten get a three-beat
       emphasis: lead-in ticks at B+0.50 and B+0.25, then the ordinary
       whole-second tick lands on B itself. The transition to 10 starts
       the countdown instead, so B = 10s gets no lead-ins (doc 3). */
    if ((remainingMs - 500) % 10000 === 0 && remainingMs - 500 > 10000) {
      return { sound: "minuteTick", numeral: null };
    }
    if ((remainingMs - 250) % 10000 === 0 && remainingMs - 250 > 10000) {
      return { sound: "minuteTick", numeral: null };
    }
    /* Ordinary tick on every whole second while time remains. Elapsed
       zero is shift start, whose immediate tick app.js already plays. */
    if (remainingMs % 1000 === 0 && elapsedMs > 0) {
      return { sound: "tick", numeral: null };
    }
    return null;
  }

  /* Triage counts cues in ELAPSED time (John, 2026-08-06): EVERY
     ten-second boundary gets the RUSH-style three-beat emphasis -
     lead-ins at B-0.50 and B-0.25, then the boundary beat itself. The
     boundary beat is the ordinary tick, except a completed MINUTE lands
     the longer, deeper minuteDong instead. Lead-ins whose boundary falls
     inside the final-ten countdown are suppressed, exactly like RUSH's
     transition to 10. */
  if ((elapsedMs + 500) % 10000 === 0 && remainingMs - 500 > 10000) {
    return { sound: "minuteTick", numeral: null };
  }
  if ((elapsedMs + 250) % 10000 === 0 && remainingMs - 250 > 10000) {
    return { sound: "minuteTick", numeral: null };
  }
  if (elapsedMs % 10000 === 0 && elapsedMs > 0) {
    return {
      sound: elapsedMs % 60000 === 0 ? "minuteDong" : "tick",
      numeral: null
    };
  }
  return null;
}

/* One scheduled RUSH arrival (doc 8). Draws the 20% double-burst chance,
   inserts what capacity allows, stages the burst's second member exactly
   one 250ms beat later (in LOGICAL game time, so pauses freeze it), and
   walks the base interval down by one second to a 1-second floor. */
function processRushArrival(state, context, effects) {
  const requested =
    context.random() < GAME_CONSTANTS.RUSH_DOUBLE_PROBABILITY ? 2 : 1;
  const available = GAME_CONSTANTS.MAX_WAITING - state.waiting.length;
  const actual = Math.min(requested, available);
  const blocked = actual < requested;
  state.rush.currentArrivalEventId += 1;

  if (actual >= 1) {
    const insertion = insertWaitingPatient(state, context, { announce: true });
    if (insertion.inserted) {
      effects.doinks += 1;
      effects.queueChanged = true;
    }
  }
  if (actual === 2) {
    state.rush.stagedSecondArrivalAtMs =
      state.shift.elapsedMs + GAME_CONSTANTS.BURST_BEAT_MS;
  }
  /* One shake per blocked event, however many members were refused. */
  if (blocked) effects.blockedShake = true;

  /* The next interval shrinks regardless of insertion success; a burst
     never resets or delays the base schedule (doc 8). */
  state.rush.nextBaseIntervalMs =
    Math.max(1000, state.rush.nextBaseIntervalMs - 1000);
  state.rush.arrivalRemainingMs = state.rush.nextBaseIntervalMs;
}

/* elapsedActiveMs is active play time only: app.js freezes it during
   pauses by moving its anchor, so this function never sees paused time.
   soundCues lists this callback's cue sounds in order; countdownNumeral
   is the latest numeral to pop over the patient image (or null);
   doinks/queueChanged/blockedShake are RUSH arrival effects. */
function advanceShiftTime(state, elapsedActiveMs, context) {
  const noChange = { timeChanged: false, shiftEnded: false,
    soundCues: [], countdownNumeral: null,
    doinks: 0, queueChanged: false, blockedShake: false };
  if (state.phase !== "active") return noChange;

  const reachedQuarter = Math.floor(elapsedActiveMs / QUARTER_MS);
  if (reachedQuarter <= state.shift.lastLogicalQuarter) return noChange;

  const shiftLengthMs = selectedShiftLengthSeconds(state) * 1000;
  const isRush = state.settings.mode === "rush";
  const soundCues = [];
  let countdownNumeral = null;
  const effects = { doinks: 0, queueChanged: false, blockedShake: false };

  for (let quarter = state.shift.lastLogicalQuarter + 1;
       quarter <= reachedQuarter; quarter++) {
    state.shift.lastLogicalQuarter = quarter;
    state.shift.elapsedMs = quarter * QUARTER_MS;
    state.shift.remainingMs = Math.max(0, shiftLengthMs - state.shift.elapsedMs);

    /* Zero completes the shift exactly once, before anything else this
       quarter would do (doc 8 order); the completion dong suppresses
       every other coincident cue INCLUDING a same-instant arrival
       (doc 3). Later quarters in a late callback are ignored because
       the phase is no longer active. */
    if (state.shift.remainingMs === 0) {
      stopShift(state, "timer", context);
      return { timeChanged: true, shiftEnded: true,
        soundCues: ["endDong"], countdownNumeral: null,
        doinks: 0, queueChanged: effects.queueChanged, blockedShake: false };
    }

    if (isRush) {
      /* The burst's staged second member lands exactly one beat after
         the first; capacity is rechecked and a blocked staged insertion
         is silent, sharing its event's one shake (doc 8). */
      if (state.rush.stagedSecondArrivalAtMs !== null &&
          state.shift.elapsedMs >= state.rush.stagedSecondArrivalAtMs) {
        state.rush.stagedSecondArrivalAtMs = null;
        const staged = insertWaitingPatient(state, context, { announce: true });
        if (staged.inserted) {
          effects.doinks += 1;
          effects.queueChanged = true;
        }
      }

      /* Courtesy refill, one second after the room was emptied (doc 3).
         It fires even if a scheduled arrival landed during the beat -
         simple and predictable - and a full room just skips silently
         (a refill is a gift, never a blocked-event shake). The pair's
         second member uses the burst rhythm: one beat later. */
      if (state.rush.emptyRefillSecondAtMs !== null &&
          state.shift.elapsedMs >= state.rush.emptyRefillSecondAtMs) {
        state.rush.emptyRefillSecondAtMs = null;
        const second = insertWaitingPatient(state, context, { announce: true });
        if (second.inserted) {
          effects.doinks += 1;
          effects.queueChanged = true;
        }
      }
      if (state.rush.emptyRefillAtMs !== null &&
          state.shift.elapsedMs >= state.rush.emptyRefillAtMs) {
        state.rush.emptyRefillAtMs = null;
        const pair = context.random() <
          GAME_CONSTANTS.EMPTY_REFILL_DOUBLE_PROBABILITY;
        const first = insertWaitingPatient(state, context, { announce: true });
        if (first.inserted) {
          effects.doinks += 1;
          effects.queueChanged = true;
        }
        if (pair) {
          state.rush.emptyRefillSecondAtMs =
            state.shift.elapsedMs + GAME_CONSTANTS.BURST_BEAT_MS;
        }
      }
    }

    const cue = clockCueForQuarter(state);
    if (cue) {
      soundCues.push(cue.sound);
      if (cue.numeral !== null) countdownNumeral = cue.numeral;
    }

    /* Quarter 0 is the anchor instant - no play time has passed yet -
       so the arrival countdown only ticks from quarter 1 on. */
    if (isRush && state.shift.elapsedMs > 0) {
      state.rush.arrivalRemainingMs -= QUARTER_MS;
      if (state.rush.arrivalRemainingMs <= 0) {
        processRushArrival(state, context, effects);
      }
    }
  }

  return { timeChanged: true, shiftEnded: false, soundCues, countdownNumeral,
    doinks: effects.doinks, queueChanged: effects.queueChanged,
    blockedShake: effects.blockedShake };
}

/* ------------------------------------------------------------------------
   6. Score selectors.
   All totals derive from the ledger; nothing stores an independently
   mutable copy (doc 4). Header and review must both call these.
   --------------------------------------------------------------------- */

function selectLedgerRecords(state) {
  return state.ledger.order.map(id => state.ledger.byPatientId[id]);
}

function selectScoreTotals(state) {
  const records = selectLedgerRecords(state);
  const totals = {
    assignmentPoints: 0,
    correct: 0,
    close: 0,
    wrong: 0,
    over: 0,
    under: 0,
    patientsSeen: records.length,
    score: 0
  };
  for (const record of records) {
    totals.assignmentPoints += record.points;
    if (record.outcome === "correct") totals.correct += 1;
    if (record.outcome === "close") totals.close += 1;
    if (record.outcome === "wrong") totals.wrong += 1;
    if (record.direction === "over") totals.over += 1;
    if (record.direction === "under") totals.under += 1;
  }
  /* Assignments are the WHOLE score. Patients left waiting cost nothing
     in any mode: the waiting room can never be emptied, so charging for
     it would penalise the game's premise, not the play (John,
     2026-08-05). */
  totals.score = totals.assignmentPoints;
  return totals;
}

/* ------------------------------------------------------------------------
   7. Navigation actions.
   Phase 1 implements the primary-view cycle only; queue seeding, the
   scheduler, and scoring arrive in later phases and slot into startShift.
   --------------------------------------------------------------------- */

/* Start Shift is HOME's only path into GAME. Returns false if illegal. */
function startShift(state, context) {
  if (state.phase !== "ready" || state.view !== "home") return false;

  state.phase = "loading";

  state.shift = {
    id: "shift-" + context.wallClockNowMs(),
    startedAtMs: context.wallClockNowMs(),
    completedAtMs: null,
    endReason: null,
    elapsedMs: 0,
    remainingMs: selectedShiftLengthSeconds(state) * 1000,
    lastLogicalQuarter: -1
  };

  /* A new shift owns none of the previous shift's play state. */
  state.waiting = [];
  state.active = null;
  state.assigned = null;
  state.recallAvailable = false;
  state.ledger = { order: [], byPatientId: {} };
  state.review = { patientIndex: 0 };
  state.pauseReasons = [];
  state.chart.clinicalExpanded = false;

  /* RUSH base interval: 10s for a 60s shift, 14.5s for 120s (doc 8). */
  const rushBaseMs = state.settings.rushLengthSeconds === 120 ? 14500 : 10000;
  state.rush = {
    arrivalRemainingMs: rushBaseMs,
    nextBaseIntervalMs: rushBaseMs,
    stagedSecondArrivalAtMs: null,
    currentArrivalEventId: 0,
    emptyRefillAtMs: null,
    emptyRefillSecondAtMs: null
  };

  /* The in-game mute starts from the persisted preferences each shift. */
  state.gameSoundsAudible =
    state.settings.soundGlobal && state.settings.soundGame;

  /* Fresh shuffled deck; seeding happens after the initial portraits
     decode (doc 4 loading contract), via seedInitialQueue. */
  state.deck = {
    ids: shuffledCopy(TRIAGE_RUSH_ASSETS.patients.ids, context.random),
    cursor: 0
  };

  return true;
}

/* Called when required loading finished and GAME may be shown.
   (Later phases seed the queue and anchor the scheduler here.) */
function activateShift(state) {
  if (state.phase !== "loading") return false;
  state.phase = "active";
  state.view = "game";
  state.overlay = null;
  return true;
}

/* Quit discards the shift after confirmation; no review results exist. */
function quitShift(state) {
  if (state.phase !== "active" && state.phase !== "loading") return false;
  state.shift.endReason = "quit";
  resetToLobby(state);
  return true;
}

/* Stop finalizes the shift and opens SHIFT REVIEW.

   The review is fully rendered underneath, but a short acknowledgement
   sits on top of it first (John, 2026-08-05): the player gets a beat to
   register that the shift is over before the score is in front of them.
   It is an overlay rather than a fourth view, so the HOME/GAME/REVIEW
   model in doc 7 is untouched. */
function stopShift(state, endReason, context) {
  if (state.phase !== "active") return false;
  state.phase = "complete";
  state.shift.completedAtMs = context.wallClockNowMs();
  state.shift.endReason = endReason; // "stop" | "timer"
  state.view = "review";
  state.overlay = "shift-over";
  state.pauseReasons = [];
  return true;
}

/* The acknowledgement waits for the player rather than timing out, so a
   glance away never costs them the moment (John, 2026-08-05). Any tap or
   key on it lands here and reveals the summary underneath. */
function dismissShiftOverAcknowledgement(state) {
  if (state.overlay !== "shift-over") return false;
  state.overlay = null;
  return true;
}

/* ------------------------------------------------------------------------
   7b. Patients Seen browser (Phase 8).
   Walks the ledger in its stable first-assignment order. A recalled and
   reassigned patient is ONE entry showing the assignment that finally
   stood, because replacement rewrites the record in place (doc 3).
   --------------------------------------------------------------------- */

function openPatientsSeen(state) {
  if (state.phase !== "complete" || state.view !== "review") return false;
  if (state.overlay !== null) return false;
  if (state.ledger.order.length === 0) return false;
  state.overlay = "patients-seen";
  state.review.patientIndex = 0;
  return true;
}

function closePatientsSeen(state) {
  if (state.overlay !== "patients-seen") return false;
  state.overlay = null;
  return true;
}

/* Navigation wraps in both directions (doc 9). With a single patient
   every step lands back on that patient, which is the documented
   "safely no-ops" behavior rather than a disabled control. */
function stepPatientsSeen(state, direction) {
  if (state.overlay !== "patients-seen") return false;
  const total = state.ledger.order.length;
  if (total === 0) return false;
  const step = direction === "previous" ? -1 : 1;
  state.review.patientIndex =
    (state.review.patientIndex + step + total) % total;
  return true;
}

/* The ledger record currently on show, or null when the browser is not
   open. ui.js needs both this and its patient record. */
function selectPatientSeenRecord(state) {
  const patientId = state.ledger.order[state.review.patientIndex];
  if (patientId === undefined) return null;
  return state.ledger.byPatientId[patientId];
}

/* Return to Lobby is SHIFT REVIEW's only primary-view destination. */
function returnToLobby(state) {
  if (state.phase !== "complete" || state.view !== "review") return false;
  resetToLobby(state);
  return true;
}

/* Shared teardown: HOME never owns an active or resumable shift. */
function resetToLobby(state) {
  state.phase = "ready";
  state.view = "home";
  state.overlay = null;
  state.pauseReasons = [];
  state.waiting = [];
  state.active = null;
  state.assigned = null;
  state.recallAvailable = false;
  state.ledger = { order: [], byPatientId: {} };
  state.deck = { ids: [], cursor: 0 };
  state.review = { patientIndex: 0 };
  state.shift.id = null;
  state.shift.startedAtMs = null;
  state.shift.completedAtMs = null;
  state.shift.elapsedMs = 0;
  state.shift.remainingMs = selectedShiftLengthSeconds(state) * 1000;
  state.shift.lastLogicalQuarter = -1;
}

/* The in-game mute button: flips only the runtime flag, never preferences. */
function toggleGameSoundsAudible(state) {
  state.gameSoundsAudible = !state.gameSoundsAudible;
}

/* ------------------------------------------------------------------------
   8. State invariants.
   Run after every action during development; each violated rule is a bug
   in a transition, never something to "fix up" here (doc 8).
   --------------------------------------------------------------------- */

function collectInvariantViolations(state) {
  const violations = [];
  const check = (condition, message) => {
    if (!condition) violations.push(message);
  };

  check(GAME_CONSTANTS.VIEWS.includes(state.view), "illegal view");
  check(GAME_CONSTANTS.PHASES.includes(state.phase), "illegal phase");

  check(state.waiting.length <= GAME_CONSTANTS.MAX_WAITING,
    "waiting exceeds 10");
  const waitingIds = state.waiting.map(entry => entry.patientId);
  check(new Set(waitingIds).size === waitingIds.length,
    "duplicate patient in waiting");

  if (state.active) {
    check(!waitingIds.includes(state.active.patientId),
      "active patient also in waiting");
  }
  if (state.assigned) {
    check(!waitingIds.includes(state.assigned.patientId),
      "assigned patient also in waiting");
  }
  check(!(state.active && state.assigned),
    "active and assigned populated simultaneously");

  check(state.ledger.order.length ===
    Object.keys(state.ledger.byPatientId).length,
    "ledger order and byPatientId disagree");
  for (const patientId of state.ledger.order) {
    const record = state.ledger.byPatientId[patientId];
    check(!!record, `ledger order id ${patientId} has no record`);
    if (record) {
      check(record.points === GAME_CONSTANTS.POINTS[record.outcome],
        `ledger points disagree with outcome for ${patientId}`);
      if (state.settings.difficulty === "strict") {
        check(record.outcome !== "close", "Close outcome under Strict");
      }
    }
  }

  check(!state.recallAvailable || !!state.assigned,
    "recall available without an assigned patient");
  check(state.overlay !== "chart" || !!state.active,
    "Chart open without an active patient");
  check(state.overlay !== "shift-over"
    || (state.view === "review" && state.phase === "complete"),
    "shift-over acknowledgement outside a completed shift review");
  check(state.overlay !== "patients-seen"
    || (state.view === "review" && state.phase === "complete"),
    "Patients Seen open outside a completed shift review");
  check(state.overlay !== "patients-seen"
    || (state.review.patientIndex >= 0
      && state.review.patientIndex < state.ledger.order.length),
    "Patients Seen index outside the ledger");
  check(!state.pauseReasons.includes("chart"),
    "chart pause reason exists (Chart stopped pausing 2026-08-05)");
  check(state.overlay === "confirm-quit" || state.overlay === "confirm-stop"
    || !state.pauseReasons.includes("confirmation"),
    "confirmation pause reason without a confirm dialog open");
  check(state.phase === "active" || state.pauseReasons.length === 0,
    "pause reasons outside an active shift");
  check(state.shift.remainingMs >= 0, "remaining time below zero");
  check(state.phase !== "active" || state.view === "game",
    "active phase outside GAME view");
  check(!(state.view === "home" && state.phase === "active"),
    "HOME owns an active shift");

  return violations;
}

function assertStateInvariants(state, actionName) {
  const violations = collectInvariantViolations(state);
  for (const violation of violations) {
    console.warn(`[triageRush invariant] after ${actionName}: ${violation}`);
  }
  return violations.length === 0;
}

/* ------------------------------------------------------------------------
   9. Preference persistence.
   Versioned envelope (doc 8). Invalid stored data must never partially
   apply: preferences are kept only when they validate as a whole.
   activeShift recovery is a later phase; the envelope already carries the
   field so the format will not need to change.
   --------------------------------------------------------------------- */

const STORAGE_KEY = "triageRush-local";

function savePreferences(state, context) {
  const envelope = {
    schema: "triageRush-local",
    version: 1,
    savedAt: context.wallClockNowMs(),
    preferences: {
      player: { title: state.player.title, initials: state.player.initials },
      settings: { ...state.settings }
    },
    activeShift: null
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    return true;
  } catch (storageError) {
    console.warn("triageRush: could not save preferences", storageError);
    return false;
  }
}

/* Applies stored preferences onto a fresh state when they validate.
   Returns true when preferences were restored. */
function loadPreferences(state) {
  let envelope = null;
  try {
    const storedText = localStorage.getItem(STORAGE_KEY);
    if (!storedText) return false;
    envelope = JSON.parse(storedText);
  } catch (parseError) {
    console.warn("triageRush: stored preferences unreadable; ignoring",
      parseError);
    return false;
  }

  if (!envelope || envelope.schema !== "triageRush-local" ||
      envelope.version !== 1 || !envelope.preferences) {
    return false;
  }

  const stored = envelope.preferences;

  /* Titles removed 2026-08-06 (LPN, PA) map to the default rather than
     invalidating the whole envelope - a stored title should never cost
     the player their other settings. */
  if (stored.player &&
      (stored.player.title === "LPN" || stored.player.title === "PA")) {
    stored.player.title = "Doctor";
  }

  /* The hints setting was removed 2026-08-07 (empty-state arrows became
     permanent; queue badges deleted). Strip the stale key from older
     saves so it never re-enters the state tree via the spread below. */
  if (stored.settings && "hints" in stored.settings) {
    delete stored.settings.hints;
  }

  if (!isValidPlayerShape(stored.player) ||
      !isValidSettingsShape(stored.settings)) {
    return false;
  }

  state.player = { title: stored.player.title, initials: stored.player.initials };
  state.settings = { ...stored.settings };
  state.shift.remainingMs = selectedShiftLengthSeconds(state) * 1000;
  return true;
}

/* Round-trip helper used by the Phase 1 gate: serialize then re-parse. */
function serializeState(state) {
  return JSON.stringify(state);
}

function deserializeState(serializedText) {
  const parsed = JSON.parse(serializedText);
  const violations = collectInvariantViolations(parsed);
  if (violations.length > 0) {
    throw new Error("deserialized state is illegal: " + violations.join("; "));
  }
  return parsed;
}

/* ------------------------------------------------------------------------
   Exports (plain globals; no module system by design)
   --------------------------------------------------------------------- */

window.TRIAGE_RUSH_GAME = {
  GAME_CONSTANTS,
  createGameContext,
  createInitialState,
  normalizeInitials,
  isValidSettingsShape,
  isValidPlayerShape,
  applySettings,
  selectedShiftLengthSeconds,
  validatePatientRecord,
  insertWaitingPatient,
  seedInitialQueue,
  peekUpcomingPatientIds,
  selectWaitingPatient,
  parseEsiRoomNumber,
  ROOM_ACUITY_RANK,
  fullCreditRoomKeys,
  evaluateRoomChoice,
  classifyTriageDirection,
  assignActivePatientToRoom,
  recallAssignedPatient,
  openChart,
  closeChart,
  setChartClinicalExpanded,
  openConfirmDialog,
  closeConfirmDialog,
  setDocumentHidden,
  schedulerCanRun,
  advanceShiftTime,
  selectLedgerRecords,
  selectScoreTotals,
  startShift,
  activateShift,
  quitShift,
  stopShift,
  dismissShiftOverAcknowledgement,
  openPatientsSeen,
  closePatientsSeen,
  stepPatientsSeen,
  selectPatientSeenRecord,
  returnToLobby,
  toggleGameSoundsAudible,
  collectInvariantViolations,
  assertStateInvariants,
  savePreferences,
  loadPreferences,
  serializeState,
  deserializeState
};
