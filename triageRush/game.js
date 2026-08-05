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
  RUSH_WAITING_PENALTY_PER_PATIENT: -10,
  MAX_WAITING: 10,
  MIN_VISIBLE_WAITING: 5,
  RUSH_DOUBLE_PROBABILITY: 0.20,
  HEARTBEAT_MS: 250,
  BURST_BEAT_MS: 250,

  TRIAGE_LENGTH_CHOICES_SECONDS: Object.freeze([300, 600]),
  RUSH_LENGTH_CHOICES_SECONDS: Object.freeze([60, 120]),

  PLAYER_TITLES: Object.freeze([
    "Doctor", "Nurse", "RN", "LPN", "RES", "Intern",
    "EMS", "PA", "MS1", "MS2", "MS3", "MS4"
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
                               // coach | patients-seen | confirm-quit | null
    phase: "ready",            // loading | ready | active | complete | error
    pauseReasons: [],          // logical reasons, e.g. "coach", "confirm-quit"

    player: {
      title: "Doctor",
      initials: "AAA"
    },

    settings: {
      mode: "triage",          // triage | rush
      difficulty: "forgiving", // forgiving | strict
      triageLengthSeconds: 300,
      rushLengthSeconds: 60,
      hints: true,
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
    active: null,              // { patientId, waitingBackgroundKey,
                               //   recalledFromRoomKey? } | null
    assigned: null,            // { patientId, roomKey, waitingBackgroundKey }
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
      currentArrivalEventId: 0
    },

    coach: {
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
    typeof candidate.hints === "boolean" &&
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
    hints: newSettings.hints,
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
   entries are tiny records: { patientId, waitingBackgroundKey }. Actions
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

/* Prefer a background no on-screen patient is using; with all 16 in use,
   any of them is fine (doc 8 waiting backgrounds). */
function chooseWaitingBackgroundKey(state, context) {
  const allKeys = TRIAGE_RUSH_ASSETS.waitingBackgroundKeys;
  const usedKeys = new Set(state.waiting.map(e => e.waitingBackgroundKey));
  if (state.active) usedKeys.add(state.active.waitingBackgroundKey);
  if (state.assigned) usedKeys.add(state.assigned.waitingBackgroundKey);

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
   - Assigned patient behind a door: finalization arrives with evaluation
     in a later phase; until then the tap is ignored.                      */
function selectWaitingPatient(state, context, waitingIndex) {
  if (state.phase !== "active") return { accepted: false, doink: false };
  if (waitingIndex < 0 || waitingIndex >= state.waiting.length) {
    return { accepted: false, doink: false };
  }

  if (state.active === null && state.assigned === null) {
    const [selectedEntry] = state.waiting.splice(waitingIndex, 1);
    state.active = {
      patientId: selectedEntry.patientId,
      waitingBackgroundKey: selectedEntry.waitingBackgroundKey
    };
    let doink = false;
    if (state.settings.mode === "triage") {
      const refill = insertWaitingPatient(state, context, { announce: true });
      doink = refill.doink;
    }
    return { accepted: true, doink };
  }

  if (state.active !== null && state.assigned === null) {
    /* Swap: backgrounds travel with their patients; no insert, no doink,
       no ledger change (doc 8). A recalled marker does not survive going
       back to the queue. */
    const waitingEntry = state.waiting[waitingIndex];
    state.waiting[waitingIndex] = {
      patientId: state.active.patientId,
      waitingBackgroundKey: state.active.waitingBackgroundKey
    };
    state.active = {
      patientId: waitingEntry.patientId,
      waitingBackgroundKey: waitingEntry.waitingBackgroundKey
    };
    return { accepted: true, doink: false };
  }

  return { accepted: false, doink: false };
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
    waitingPenalty: 0,
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
  if (state.settings.mode === "rush") {
    totals.waitingPenalty =
      state.waiting.length * GAME_CONSTANTS.RUSH_WAITING_PENALTY_PER_PATIENT;
  }
  totals.score = totals.assignmentPoints + totals.waitingPenalty;
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
  state.coach.clinicalExpanded = false;

  /* RUSH base interval: 10s for a 60s shift, 14.5s for 120s (doc 8). */
  const rushBaseMs = state.settings.rushLengthSeconds === 120 ? 14500 : 10000;
  state.rush = {
    arrivalRemainingMs: rushBaseMs,
    nextBaseIntervalMs: rushBaseMs,
    stagedSecondArrivalAtMs: null,
    currentArrivalEventId: 0
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

/* Stop finalizes the shift and opens SHIFT REVIEW. */
function stopShift(state, endReason, context) {
  if (state.phase !== "active") return false;
  state.phase = "complete";
  state.shift.completedAtMs = context.wallClockNowMs();
  state.shift.endReason = endReason; // "stop" | "timer"
  state.view = "review";
  state.overlay = null;
  state.pauseReasons = [];
  return true;
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
  selectLedgerRecords,
  selectScoreTotals,
  startShift,
  activateShift,
  quitShift,
  stopShift,
  returnToLobby,
  toggleGameSoundsAudible,
  collectInvariantViolations,
  assertStateInvariants,
  savePreferences,
  loadPreferences,
  serializeState,
  deserializeState
};
