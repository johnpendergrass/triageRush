const ASSETS = window.TRIAGE_RUSH_ASSETS;

if (!ASSETS) throw new Error("Mobile asset manifest failed to load.");

document.documentElement.style.setProperty("--asset-room-wall", `url("${ASSETS.roomsPanel.wall}")`);
document.documentElement.style.setProperty("--asset-patient-panel", `url("${ASSETS.patientPanel.background}")`);

const rooms = [
  ["esi-1", 1, "ESI 1 RESUS", "Immediate life-saving treatment is required."],
  ["esi-2", 2, "ESI 2 EMERGENT", "High-risk or severe symptoms that should not wait."],
  ["esi-3", 3, "ESI 3 URGENT", "Stable now, but likely to need several tests or treatments."],
  ["esi-4", 4, "ESI 4 LESS URGENT", "Stable and likely to need one test or treatment."],
  ["esi-5", 5, "ESI 5 NON-URGENT", "Stable and generally needs examination or simple care only."],
  ["psych", null, "PSYCH", "Behavioral-health evaluation for a medically stable patient."],
  ["discharge", null, "DISCHARGE", "Emergency treatment is not needed; provide guidance or follow-up."]
].map(([key, esi, label, description]) => ({
  key,
  esi,
  label,
  description,
  closed: ASSETS.roomsPanel.rooms[key].closedDoor,
  open: ASSETS.roomsPanel.rooms[key].openDoor
}));

const ui = Object.fromEntries(
  [
    "waitingList", "patientName", "patientDemographics", "patientImage", "complaintChip",
    "patientQuote", "presentationText", "patientExpandButton", "roomsPanel", "resultToast",
    "roomInfoPopover", "roomInfoTitle", "roomInfoText", "patientEmptyState", "emptyStateKicker",
    "emptyStateTitle", "emptyStateHint", "coachButton", "coachOverlay", "coachCard",
    "detailEyebrow", "detailPresentationSection", "detailAnswerSection", "detailClinicalSection",
    "detailSectionFeedback", "detailCaution", "coachScrollAbove", "coachScrollHint", "statusLabel",
    "statusValue", "headerCorrect", "headerClose", "headerCloseItem", "headerCloseDivider",
    "headerWrong", "headerScore", "soundButton", "nextButton", "setupOverlay", "setupTitle", "setupCancel",
    "setupNote", "startShift", "setupHints", "setupRushSounds", "rushSoundSetting",
    "triageLengthOptions", "rushLengthOptions",
    "reviewOverlay", "reviewTitle", "reviewMeta", "reviewScore", "reviewStats", "reviewDirections",
    "reviewPatientsLink", "reviewChartNav", "reviewChartPrevious", "reviewChartLabel",
    "reviewChartNext", "reviewChartClose", "reviewClose", "newShift",
    "playerTitle", "playerInitials"
  ].map((id) => [id, document.querySelector(`#${id}`)])
);
ui.patientPanel = document.querySelector(".patient-panel");
ui.waitingPanel = document.querySelector(".waiting-panel");
ui.appShell = document.querySelector(".app-shell");
ui.coachFrame = document.querySelector(".coach-frame");
ui.brand = document.querySelector(".brand");
ui.resetButton = document.querySelector("#resetButton");

let patients = [];
let patientById = new Map();
let timerId = null;
let detailReturnFocus = null;
let chartContext = null;
let reviewIndex = 0;
let muted = false;
let holdTimer = null;
let audioContext = null;

const state = {
  phase: "loading",
  mode: "triage",
  difficulty: "forgiving",
  shiftLength: 300,
  hints: true,
  rushSounds: true,
  player: { title: "Doctor", initials: "AAA" },
  startedAt: null,
  elapsed: 0,
  remaining: 300,
  deck: [],
  waiting: [],
  activePatientId: null,
  activeBackground: null,
  decision: null,
  openRoom: null,
  firstAssignmentRecorded: false,
  history: [],
  stats: { correct: 0, close: 0, over: 0, under: 0, wrong: 0 },
  score: 0,
  heartbeatPhase: 0,
  rushArrivalIn: 10,
  rushInterval: 10
};

function normalizePatientRecord(record) {
  if (record.schema?.version !== "2.2") {
    throw new Error(`${record.id || "Patient record"} is not schema version 2.2.`);
  }
  const { presentation, answer, clinical } = record.patient;
  return {
    id: record.id,
    name: presentation.personal.name,
    age: presentation.personal.age,
    sex: presentation.personal.sex,
    complaint: presentation.chiefComplaint,
    quote: presentation.quote,
    triageNote: presentation.triageNote,
    vitals: presentation.vitals,
    answer,
    clinical
  };
}

async function loadPatients() {
  const records = await Promise.all(
    ASSETS.patientData.ids.map(async (patientId) => {
      const response = await fetch(ASSETS.patientData.json(patientId));
      if (!response.ok) throw new Error(`Could not load ${patientId} (${response.status}).`);
      return response.json();
    })
  );
  patients = records.map(normalizePatientRecord);
  patientById = new Map(patients.map((patient) => [patient.id, patient]));
}

function shuffle(values) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function nextPatientId() {
  const visible = new Set([
    state.activePatientId,
    ...state.waiting.map((entry) => entry.patientId)
  ].filter(Boolean));
  if (!state.deck.length) state.deck = shuffle(patients.map((patient) => patient.id));
  let attempts = state.deck.length;
  while (attempts > 0) {
    const patientId = state.deck.shift();
    if (!visible.has(patientId)) return patientId;
    state.deck.push(patientId);
    attempts -= 1;
  }
  throw new Error("No non-duplicate patient is available.");
}

function nextBackground() {
  const used = new Set(state.waiting.map((entry) => entry.background));
  if (state.activeBackground) used.add(state.activeBackground);
  const available = ASSETS.waitingRooms.filter((background) => !used.has(background));
  const choices = available.length ? available : ASSETS.waitingRooms;
  return choices[Math.floor(Math.random() * choices.length)];
}

function addWaitingPatient() {
  if (state.waiting.length >= 10) return;
  state.waiting.push({ patientId: nextPatientId(), background: nextBackground() });
}

function fillWaiting(target) {
  while (state.waiting.length < target) addWaitingPatient();
}

function activePatient() {
  return state.activePatientId ? patientById.get(state.activePatientId) : null;
}

function startShift() {
  const requestedMode = document.querySelector('input[name="setupMode"]:checked').value;
  const requestedDifficulty = document.querySelector('input[name="setupDifficulty"]:checked').value;
  const lengthValue = requestedMode === "triage"
    ? document.querySelector('input[name="triageLength"]:checked').value
    : document.querySelector('input[name="rushLength"]:checked').value;
  if (state.phase === "active" && !window.confirm("Restart the active shift with these settings?")) return;

  state.phase = "active";
  state.mode = requestedMode;
  state.difficulty = requestedDifficulty;
  state.shiftLength = lengthValue === "none" ? null : Number(lengthValue);
  state.hints = ui.setupHints.checked;
  state.rushSounds = ui.setupRushSounds.checked;
  state.player = {
    title: ui.playerTitle.value,
    initials: (ui.playerInitials.value.toUpperCase().replace(/[^A-Z]/g, "") || "AAA").slice(0, 3)
  };
  ui.playerInitials.value = state.player.initials;
  localStorage.setItem("triageRushMobilePlayer", JSON.stringify(state.player));
  state.startedAt = new Date();
  state.elapsed = 0;
  state.remaining = state.shiftLength;
  state.deck = shuffle(patients.map((patient) => patient.id));
  state.waiting = [];
  state.activePatientId = null;
  state.activeBackground = null;
  state.decision = null;
  state.openRoom = null;
  state.firstAssignmentRecorded = false;
  state.history = [];
  state.stats = { correct: 0, close: 0, over: 0, under: 0, wrong: 0 };
  state.score = 0;
  state.heartbeatPhase = 0;
  const initialRushInterval = state.mode === "rush" && state.shiftLength === 120 ? 14.5 : 10;
  state.rushArrivalIn = initialRushInterval;
  state.rushInterval = initialRushInterval;
  fillWaiting(state.mode === "triage" ? 5 : 2);
  ui.setupOverlay.hidden = true;
  ui.reviewOverlay.hidden = true;
  closeChart();
  renderAll();
  clearInterval(timerId);
  timerId = setInterval(heartbeat, 250);
  if (state.mode === "rush" && state.rushSounds) {
    ensureAudioContext();
    playRushTick();
  }
}

function isPaused() {
  return state.phase !== "active" || !ui.setupOverlay.hidden || !ui.reviewOverlay.hidden || !ui.coachOverlay.hidden;
}

function heartbeat() {
  if (isPaused()) return;
  const willEndShift = state.shiftLength !== null && state.remaining === 1 && state.heartbeatPhase === 3;
  if (state.mode === "rush" && !willEndShift) {
    state.rushArrivalIn -= 0.25;
    if (state.rushArrivalIn <= 0) {
      if (state.rushSounds) playRushArrivalAlert();
      const hasQueueSpace = state.waiting.length < 10;
      if (hasQueueSpace) addWaitingPatient();
      else triggerRushQueueShake();
      state.rushInterval = Math.max(1, state.rushInterval - 1);
      state.rushArrivalIn = state.rushInterval;
      if (hasQueueSpace) {
        renderWaiting();
        renderStatus();
      }
    }
  }
  state.heartbeatPhase += 1;
  if (state.heartbeatPhase < 4) {
    if (
      state.mode === "rush" &&
      state.rushSounds &&
      state.remaining <= 5 &&
      state.remaining > 0 &&
      state.heartbeatPhase <= 2
    ) playRushTick();
    return;
  }
  state.heartbeatPhase = 0;
  tick();
}

function tick() {
  state.elapsed += 1;
  if (state.shiftLength !== null) {
    state.remaining = Math.max(0, state.remaining - 1);
  }
  if (state.mode === "rush") {
    if (state.rushSounds) {
      if (state.remaining > 0) playRushTick();
      else playRushEndDong();
    }
    if (state.remaining <= 10 && state.remaining > 0) showRushCountdownNumber(state.remaining);
  }
  renderStatus();
  if (state.shiftLength !== null && state.remaining === 0) endShift();
}

function triggerRushQueueShake() {
  ui.waitingPanel.classList.remove("is-rush-shaking");
  void ui.waitingPanel.offsetWidth;
  ui.waitingPanel.classList.add("is-rush-shaking");
}

function showRushCountdownNumber(number) {
  const shellRect = ui.appShell.getBoundingClientRect();
  const imageRect = ui.patientImage.getBoundingClientRect();
  const panelRect = ui.patientPanel.getBoundingClientRect();
  const fontSize = panelRect.width * 0.5;
  const numberElement = document.createElement("span");
  numberElement.className = "rush-countdown-number";
  numberElement.setAttribute("aria-hidden", "true");
  numberElement.textContent = String(number);
  numberElement.style.left = `${imageRect.left - shellRect.left + imageRect.width * 0.5}px`;
  numberElement.style.top = `${imageRect.top - shellRect.top + imageRect.height * 0.33}px`;
  numberElement.style.fontSize = `${fontSize}px`;
  numberElement.addEventListener("animationend", () => numberElement.remove(), { once: true });
  ui.appShell.append(numberElement);
  setTimeout(() => numberElement.remove(), 800);
}

function formatClock(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

function renderAll() {
  renderHeader();
  renderPatient();
  renderWaiting();
  renderRooms();
  renderStatus();
  renderFooter();
}

function renderHeader() {
  ui.brand.innerHTML = state.mode === "rush"
    ? "<span>TRIAGE</span><strong>RUSH!</strong>"
    : "<span>TRIAGE!</span>";
}

function renderStatus() {
  if (state.phase === "loading") return;
  const time = state.shiftLength === null ? `+${formatClock(state.elapsed)}` : formatClock(state.remaining);
  const total = state.history.length;
  ui.headerCorrect.textContent = state.stats.correct;
  ui.headerClose.textContent = state.stats.close;
  ui.headerWrong.textContent = total - state.stats.correct - state.stats.close;
  ui.headerScore.textContent = currentScore();
  const closeEnabled = state.difficulty === "forgiving";
  ui.headerCloseItem.hidden = !closeEnabled;
  ui.headerCloseDivider.hidden = !closeEnabled;
  if (state.mode === "rush") {
    ui.statusLabel.textContent = `SCORE ${state.score}`;
    ui.statusValue.textContent = time;
  } else {
    ui.statusLabel.textContent = `${state.stats.correct} CORRECT · ${state.history.length} SEEN`;
    ui.statusValue.textContent = time;
  }
  ui.statusLabel.textContent = state.shiftLength === null ? "ELAPSED" : "TIME";
  ui.statusValue.classList.remove("is-edu");
}

function currentScore() {
  return state.score - (state.mode === "rush" ? state.waiting.length * 10 : 0);
}

function renderFooter() {
  ui.coachButton.disabled = !state.decision;
  ui.coachButton.querySelector("small").textContent = state.decision ? "READY" : "LOCKED";
  ui.resetButton.disabled = state.phase !== "active";
  ui.resetButton.querySelector("small").textContent = state.shiftLength === null ? "END SHIFT" : "VIEW / END";
}

function renderPatient() {
  const patient = activePatient();
  const empty = !patient;
  ui.patientPanel.classList.toggle("is-awaiting-patient", empty);
  ui.patientEmptyState.hidden = !empty;
  ui.patientExpandButton.hidden = empty;
  ui.patientPanel
    .querySelectorAll(".patient-scene, .patient-quote, .vitals-card, .presentation-card")
    .forEach((element) => element.setAttribute("aria-hidden", String(empty)));

  if (empty) {
    ui.emptyStateKicker.textContent = state.phase === "active" ? "READY" : "MOBILE GAME";
    ui.emptyStateTitle.textContent = state.phase === "active" ? "SELECT A PATIENT" : "START A SHIFT";
    ui.emptyStateHint.innerHTML = state.hints && state.phase === "active"
      ? '<span class="empty-state-action empty-state-action--from-waiting"><b class="empty-state-arrow empty-state-arrow--right" aria-hidden="true"></b><span>FROM WAITING ROOM</span></span>'
      : "";
    ui.patientImage.removeAttribute("src");
    return;
  }

  ui.patientName.textContent = patient.name;
  ui.patientDemographics.textContent = `${patient.age}${patient.sex}`;
  ui.patientImage.src = ASSETS.patientData.image(patient.id);
  ui.patientImage.alt = `${patient.name}, current patient`;
  ui.complaintChip.textContent = patient.complaint;
  ui.patientQuote.textContent = `“${patient.quote}”`;
  ui.presentationText.textContent = patient.triageNote;
  setVital("vitalHr", patient.vitals.hr);
  setVital("vitalBp", patient.vitals.bp);
  setVital("vitalRr", patient.vitals.rr);
  setVital("vitalSpo2", patient.vitals.spo2, "%");
  setVital("vitalTemp", patient.vitals.temp, " °C");
  setVital("vitalPain", patient.vitals.pain, "/10");
  requestAnimationFrame(() => {
    fitTextToBox(ui.patientQuote, 6.5);
    fitTextToBox(ui.presentationText, 6.5);
  });
}

function setVital(id, vital, suffix = "") {
  const element = document.querySelector(`#${id}`);
  element.textContent = `${vital.value}${suffix}`;
  element.className = vital.color === "red" ? "is-alert" : vital.color === "yellow" ? "is-watch" : "";
}

function fitTextToBox(element, minimumSize) {
  element.style.removeProperty("font-size");
  let size = Number.parseFloat(getComputedStyle(element).fontSize);
  while (size > minimumSize && element.scrollHeight > element.clientHeight + 1) {
    size -= 0.25;
    element.style.fontSize = `${size}px`;
  }
}

function renderWaiting() {
  ui.waitingList.replaceChildren();
  const slots = Math.max(5, state.waiting.length);
  ui.waitingList.style.gridTemplateRows = `repeat(${slots}, minmax(0, 1fr))`;
  ui.waitingPanel.classList.toggle("is-awaiting-selection", !state.activePatientId);
  state.waiting.forEach((entry, index) => {
    const patient = patientById.get(entry.patientId);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "queue-patient";
    if (!state.activePatientId) button.classList.add("is-selectable");
    button.setAttribute("aria-label", `${state.activePatientId ? "Swap" : "Select"} ${patient.name}: ${patient.complaint}`);
    button.innerHTML = `
      <img class="queue-background" src="${entry.background}" alt="" />
      <img class="queue-patient-image" src="${ASSETS.patientData.image(patient.id)}" alt="" />
      <span class="queue-cell-frame" aria-hidden="true"></span>
      <span class="queue-complaint">${patient.complaint}</span>
      ${state.hints ? `<span class="queue-transfer-hint ${state.activePatientId ? "is-swap" : "is-move"}" aria-hidden="true"><b>${state.activePatientId ? "↔" : "→"}</b></span>` : ""}
    `;
    button.addEventListener("click", () => selectWaitingPatient(index));
    ui.waitingList.append(button);
  });
  for (let index = state.waiting.length; index < slots; index += 1) {
    const empty = document.createElement("div");
    empty.className = "queue-slot-empty";
    empty.setAttribute("aria-hidden", "true");
    const background = ASSETS.waitingRooms[index % ASSETS.waitingRooms.length];
    empty.innerHTML = `
      <img class="queue-background" src="${background}" alt="" />
      <span class="queue-cell-frame" aria-hidden="true"></span>
    `;
    ui.waitingList.append(empty);
  }
}

function selectWaitingPatient(index) {
  if (state.phase !== "active") return;
  const selected = state.waiting[index];
  if (!state.activePatientId) {
    finalizeOpenCase();
    state.activePatientId = selected.patientId;
    state.activeBackground = selected.background;
    state.waiting.splice(index, 1);
    if (state.mode === "triage") fillWaiting(5);
  } else if (!state.decision) {
    const previous = { patientId: state.activePatientId, background: state.activeBackground };
    state.activePatientId = selected.patientId;
    state.activeBackground = selected.background;
    state.waiting[index] = previous;
  } else {
    return;
  }
  state.decision = null;
  state.openRoom = null;
  state.firstAssignmentRecorded = false;
  renderAll();
}

function finalizeOpenCase() {
  state.activePatientId = null;
  state.activeBackground = null;
  state.decision = null;
  state.openRoom = null;
  state.firstAssignmentRecorded = false;
}

function renderRooms() {
  ui.roomsPanel.replaceChildren();
  rooms.forEach((room) => {
    const open = state.openRoom === room.key;
    const canRecall = !state.activePatientId && state.decision?.room === room.key;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "room-choice";
    if (open) button.classList.add("is-open");
    if (state.decision?.room === room.key) button.classList.add(`pulse-${state.decision.outcome}`);
    button.setAttribute("aria-label", `${room.label} door, ${open ? "open" : "closed"}. ${room.description}${canRecall ? " Tap to recall the patient." : ""}`);
    button.innerHTML = `${canRecall ? '<span class="recall-arrow" aria-hidden="true"><b>←</b></span>' : ""}<img class="door-art" src="${open ? room.open : room.closed}" alt="" />`;
    installRoomInteractions(button, room);
    ui.roomsPanel.append(button);
  });
}

function installRoomInteractions(button, room) {
  button.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "touch") showRoomInfo(room, button);
  });
  button.addEventListener("pointerleave", hideRoomInfo);
  button.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch") return;
    holdTimer = setTimeout(() => showRoomInfo(room, button), 520);
  });
  ["pointerup", "pointercancel"].forEach((type) => button.addEventListener(type, () => clearTimeout(holdTimer)));
  button.addEventListener("contextmenu", (event) => event.preventDefault());
  button.addEventListener("click", () => {
    hideRoomInfo();
    chooseRoom(room.key);
  });
}

function showRoomInfo(room, anchor) {
  ui.roomInfoTitle.textContent = room.label;
  ui.roomInfoText.textContent = room.description;
  ui.roomInfoPopover.hidden = false;
  const panelRect = ui.patientPanel.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  const desired = anchorRect.top + anchorRect.height / 2 - panelRect.top - ui.roomInfoPopover.offsetHeight / 2;
  ui.roomInfoPopover.style.top = `${Math.max(6, Math.min(desired, panelRect.height - ui.roomInfoPopover.offsetHeight - 6))}px`;
}

function hideRoomInfo() {
  ui.roomInfoPopover.hidden = true;
}

function fullCreditRooms(patient) {
  const credit = new Set([patient.answer.correctRoom]);
  if (["psych", "discharge"].includes(patient.answer.correctRoom)) {
    credit.add(`esi-${patient.answer.correctEsi}`);
  }
  return credit;
}

function evaluateChoice(patient, roomKey) {
  if (fullCreditRooms(patient).has(roomKey)) return "correct";
  if (state.difficulty === "strict") return "wrong";
  const selected = rooms.find((room) => room.key === roomKey);
  if (!selected?.esi) return "wrong";
  return Math.abs(selected.esi - patient.answer.correctEsi) === 1 ? "close" : "wrong";
}

function triageDirection(patient, roomKey, outcome) {
  if (outcome === "correct") return "correct";
  const selected = rooms.find((room) => room.key === roomKey);
  if (!selected?.esi) return "wrong";
  return selected.esi < patient.answer.correctEsi ? "over" : "under";
}

function chooseRoom(roomKey) {
  if (state.phase !== "active") return;
  if (!state.activePatientId) {
    if (state.decision?.room === roomKey) recallPatient();
    return;
  }
  if (state.decision) return;
  const patient = activePatient();
  const outcome = evaluateChoice(patient, roomKey);
  state.decision = { patientId: patient.id, room: roomKey, outcome };
  state.openRoom = roomKey;
  if (!state.firstAssignmentRecorded) recordFirstAssignment(patient, roomKey, outcome);
  state.activePatientId = null;
  state.activeBackground = null;
  showResult(outcome);
  playFeedback(outcome);
  renderAll();
}

function recordFirstAssignment(patient, roomKey, outcome) {
  const direction = triageDirection(patient, roomKey, outcome);
  state.firstAssignmentRecorded = true;
  if (outcome === "correct") {
    state.stats.correct += 1;
  } else {
    if (outcome === "close") state.stats.close += 1;
    state.stats[direction] += 1;
  }
  state.score += outcome === "correct" ? 100 : outcome === "close" ? 50 : -50;
  state.history.push({ patientId: patient.id, room: roomKey, outcome, direction });
}

function recallPatient() {
  if (!state.decision || state.activePatientId) return;
  state.activePatientId = state.decision.patientId;
  state.decision = null;
  state.openRoom = null;
  renderAll();
}

function showResult(outcome) {
  const labels = { correct: "✓ CORRECT", close: "△ CLOSE", wrong: "✕ WRONG" };
  ui.resultToast.textContent = labels[outcome];
  ui.resultToast.className = `result-toast ${outcome} is-visible`;
  setTimeout(() => ui.resultToast.classList.remove("is-visible"), 1600);
}

function playFeedback(outcome) {
  if (muted) return;
  const context = ensureAudioContext();
  if (!context) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.connect(gain).connect(context.destination);
  const now = context.currentTime;
  if (outcome === "correct") {
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(520, now);
    oscillator.frequency.exponentialRampToValueAtTime(760, now + 0.2);
  } else if (outcome === "close") {
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(390, now);
    oscillator.frequency.exponentialRampToValueAtTime(260, now + 0.25);
  } else {
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(125, now);
    oscillator.frequency.linearRampToValueAtTime(90, now + 0.35);
  }
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.2, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
  oscillator.start(now);
  oscillator.stop(now + 0.36);
}

function ensureAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!audioContext) audioContext = new AudioContext();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playRushTick() {
  if (muted) return;
  const context = ensureAudioContext();
  if (!context) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(1050, now);
  oscillator.frequency.exponentialRampToValueAtTime(720, now + 0.035);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.055, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.06);
}

function playRushArrivalAlert() {
  if (muted) return;
  const context = ensureAudioContext();
  if (!context) return;
  const now = context.currentTime;
  [[1046, 0.14], [2093, 0.035]].forEach(([frequency, peakGain]) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.43);
  });
}

function playRushEndDong() {
  if (muted) return;
  const context = ensureAudioContext();
  if (!context) return;
  const now = context.currentTime;
  [[523, 0.17], [1046, 0.045]].forEach(([frequency, peakGain]) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.81);
  });
}

function openSetup(requestedMode = null) {
  if (state.phase === "loading") return;
  document.querySelector(`input[name="setupMode"][value="${requestedMode || state.mode}"]`).checked = true;
  document.querySelector(`input[name="setupDifficulty"][value="${state.difficulty}"]`).checked = true;
  ui.setupHints.checked = state.hints;
  ui.setupRushSounds.checked = state.rushSounds;
  ui.playerTitle.value = state.player.title;
  ui.playerInitials.value = state.player.initials;
  if (state.mode === "triage") {
    const triageValue = state.shiftLength === null ? "none" : "300";
    document.querySelector(`input[name="triageLength"][value="${triageValue}"]`).checked = true;
  } else {
    document.querySelector(`input[name="rushLength"][value="${state.shiftLength || 60}"]`).checked = true;
  }
  updateSetupForMode();
  ui.setupTitle.textContent = state.phase === "active" ? "Shift settings" : "Start a shift";
  ui.startShift.textContent = state.phase === "active" ? "Apply and restart" : "Start shift";
  ui.setupCancel.hidden = state.phase !== "active";
  ui.setupOverlay.hidden = false;
}

function updateSetupForMode() {
  const mode = document.querySelector('input[name="setupMode"]:checked').value;
  ui.triageLengthOptions.hidden = mode !== "triage";
  ui.rushLengthOptions.hidden = mode !== "rush";
  ui.rushSoundSetting.hidden = mode !== "rush";
  ui.setupNote.textContent = mode === "triage"
    ? "Triage starts with five waiting patients, refills immediately, and has no waiting-room penalty."
    : "RUSH starts with two waiting patients and adds patients faster until the queue reaches ten.";
}

function endShift() {
  if (state.phase !== "active") return;
  state.phase = "complete";
  renderReview();
  ui.reviewOverlay.hidden = false;
  renderFooter();
}

function requestShiftReview() {
  if (state.phase === "active") {
    endShift();
  } else if (state.history.length) {
    renderReview();
    ui.reviewOverlay.hidden = false;
  }
}

function renderReview() {
  reviewIndex = Math.min(reviewIndex, Math.max(0, state.history.length - 1));
  ui.reviewTitle.textContent = state.mode === "rush" ? "TriageRUSH complete" : "Triage shift complete";
  const duration = state.shiftLength === null ? state.elapsed : state.shiftLength - state.remaining;
  ui.reviewMeta.textContent = `${state.player.title} ${state.player.initials} · ${state.difficulty === "strict" ? "Strict" : "Forgiving"} · ${formatClock(duration)} · ${state.startedAt?.toLocaleString() || ""}`;
  ui.reviewScore.hidden = false;
  ui.reviewScore.textContent = `SCORE ${currentScore()}`;
  const wrongCount = state.history.length - state.stats.correct - state.stats.close;
  const waitingPoints = state.mode === "rush" ? -10 : 0;
  const scoringValues = [
    ["Patients seen", state.history.length, "review-stat--seen"],
    ["Correct", `${state.stats.correct} &times; 100 pts = ${state.stats.correct * 100}`, "review-stat--formula review-stat--correct"],
    ...(state.difficulty === "forgiving"
      ? [["Close", `${state.stats.close} &times; 50 pts = ${state.stats.close * 50}`, "review-stat--formula review-stat--close"]]
      : []),
    ["Wrong", `${wrongCount} &times; -50 pts = ${wrongCount * -50}`, "review-stat--formula review-stat--wrong"],
    ["Left waiting", `${state.waiting.length} &times; ${waitingPoints} pts = ${state.waiting.length * waitingPoints}`, "review-stat--formula"]
  ];
  ui.reviewStats.innerHTML = scoringValues
    .map(([label, value, className]) => `<div class="${className}"><dt>${label}</dt><dd>${value}</dd></div>`)
    .join("");
  ui.reviewDirections.innerHTML = `
    <span>TRIAGE DIRECTION</span>
    <div><small>UNDER-TRIAGED</small><strong>${state.stats.under}</strong></div>
    <div><small>OVER-TRIAGED</small><strong>${state.stats.over}</strong></div>
  `;
  ui.reviewPatientsLink.hidden = !state.history.length;
  ui.reviewPatientsLink.textContent = `PATIENTS SEEN (${state.history.length})`;
}

function openPatientChart(context, historyEntry = null, preserveReturnFocus = false) {
  const patient = historyEntry ? patientById.get(historyEntry.patientId) : activePatient();
  if (!patient) return;
  chartContext = { patient, historyEntry };
  if (!preserveReturnFocus) detailReturnFocus = document.activeElement;
  const reviewBrowsing = context === "review";
  ui.reviewChartNav.hidden = !reviewBrowsing;
  ui.coachFrame.classList.toggle("is-review-browsing", reviewBrowsing);
  if (reviewBrowsing) updateReviewChartNavigation();
  populateChart(patient, historyEntry);
  setSectionState("presentation", "expanded");
  setSectionState("answer", historyEntry ? "expanded" : "locked");
  setSectionState("clinical", context === "assignment" ? "collapsed" : "expanded");
  ui.detailEyebrow.textContent = context === "review" ? "PATIENT REVIEW" : context === "coach" ? "COACH" : "PATIENT ASSIGNMENT";
  ui.detailCaution.textContent = "Educational prototype · Patient-specific reasoning remains subject to clinical review.";
  ui.coachOverlay.hidden = false;
  ui.coachCard.scrollTop = 0;
  requestAnimationFrame(updateChartScrollHints);
}

function updateReviewChartNavigation() {
  const entry = state.history[reviewIndex];
  ui.reviewChartLabel.textContent = `${reviewIndex + 1} / ${state.history.length} · ${patientById.get(entry.patientId).name}`;
  const onlyOnePatient = state.history.length < 2;
  ui.reviewChartPrevious.disabled = onlyOnePatient;
  ui.reviewChartNext.disabled = onlyOnePatient;
}

function navigateReviewChart(direction) {
  if (state.history.length < 2) return;
  reviewIndex = (reviewIndex + direction + state.history.length) % state.history.length;
  openPatientChart("review", state.history[reviewIndex], true);
}

function populateChart(patient, entry) {
  document.querySelector("#coachPatientImage").src = ASSETS.patientData.image(patient.id);
  document.querySelector("#coachPatientImage").alt = `${patient.name}, patient`;
  document.querySelector("#coachTitle").textContent = patient.name;
  document.querySelector("#coachDemographics").textContent = `${patient.age}-year-old ${patient.sex === "F" ? "female" : patient.sex === "M" ? "male" : patient.sex}`;
  document.querySelector("#coachComplaint").textContent = patient.complaint;
  document.querySelector("#coachQuote").textContent = `“${patient.quote}”`;
  document.querySelector("#coachTriage").textContent = patient.triageNote;
  document.querySelector("#coachVitals").innerHTML = [
    ["HR", patient.vitals.hr.value], ["BP", patient.vitals.bp.value], ["RR", patient.vitals.rr.value],
    ["SpO₂", `${patient.vitals.spo2.value}%`], ["TEMP °C", patient.vitals.temp.value], ["PAIN", `${patient.vitals.pain.value}/10`]
  ].map(([label, value]) => `<div class="coach-vital"><span>${label}</span><strong>${value}</strong></div>`).join("");
  document.querySelector("#coachChoice").textContent = entry ? rooms.find((room) => room.key === entry.room).label : "Not assigned";
  document.querySelector("#coachCorrect").textContent = `${patient.answer.correctRoom.toUpperCase()} · ESI ${patient.answer.correctEsi}`;
  document.querySelector("#coachResult").textContent = entry ? ({ correct: "Correct assignment", close: "Close assignment", wrong: "Wrong assignment" })[entry.outcome] : "Answer locked until assignment";
  document.querySelector("#coachDestinationReason").textContent = patient.answer.destinationReason;
  document.querySelector("#coachSummaryText").textContent = patient.clinical.summary;
  document.querySelector("#coachAcuityReason").textContent = patient.clinical.acuityReason;
  populateList("coachResources", patient.clinical.expectedResources);
  populateList("coachKeyFindings", patient.clinical.keyFindings);
  populateList("coachRedFlags", patient.clinical.redFlags);
  document.querySelector("#coachRedFlagsSection").hidden = !patient.clinical.redFlags?.length;
  populateList("coachTeachingPoints", patient.clinical.teachingPoints);
  populateList("coachPossibleDiagnoses", patient.clinical.possibleClinicalOutcome.possibleDiagnoses);
  document.querySelector("#coachDisposition").textContent = patient.clinical.possibleClinicalOutcome.disposition;
}

function populateList(id, values) {
  const list = document.querySelector(`#${id}`);
  list.replaceChildren();
  (values || []).forEach((value) => {
    const item = document.createElement("li");
    item.textContent = value;
    if (value.startsWith("(maybe)")) item.className = "is-maybe";
    list.append(item);
  });
}

function sectionElement(section) {
  return { presentation: ui.detailPresentationSection, answer: ui.detailAnswerSection, clinical: ui.detailClinicalSection }[section];
}

function setSectionState(section, sectionState) {
  const element = sectionElement(section);
  const button = element.querySelector("[data-section-toggle]");
  const content = element.querySelector(".coach-section-content");
  const control = button.querySelector(".coach-section-control");
  element.dataset.sectionState = sectionState;
  const expanded = sectionState === "expanded";
  button.setAttribute("aria-expanded", String(expanded));
  button.setAttribute("aria-disabled", String(sectionState === "locked"));
  content.hidden = !expanded;
  control.textContent = sectionState === "locked" ? "LOCKED" : expanded ? "COLLAPSE" : "EXPAND";
}

function toggleSection(section) {
  const element = sectionElement(section);
  if (element.dataset.sectionState === "locked") {
    ui.detailSectionFeedback.textContent = "This section is locked until the patient is assigned.";
    setTimeout(() => { ui.detailSectionFeedback.textContent = ""; }, 1800);
    return;
  }
  setSectionState(section, element.dataset.sectionState === "expanded" ? "collapsed" : "expanded");
  requestAnimationFrame(updateChartScrollHints);
}

function closeChart() {
  if (ui.coachOverlay.hidden) return;
  ui.coachOverlay.hidden = true;
  if (detailReturnFocus?.isConnected) detailReturnFocus.focus();
  detailReturnFocus = null;
  chartContext = null;
  ui.reviewChartNav.hidden = true;
  ui.coachFrame.classList.remove("is-review-browsing");
}

function updateChartScrollHints() {
  const more = ui.coachCard.scrollHeight > ui.coachCard.clientHeight + 4;
  ui.coachScrollAbove.hidden = !more || ui.coachCard.scrollTop <= 4;
  ui.coachScrollHint.hidden = !more || ui.coachCard.scrollTop + ui.coachCard.clientHeight >= ui.coachCard.scrollHeight - 4;
}

document.querySelectorAll('input[name="setupMode"]').forEach((input) => input.addEventListener("change", updateSetupForMode));
ui.startShift.addEventListener("click", startShift);
ui.setupCancel.addEventListener("click", () => { ui.setupOverlay.hidden = true; });
ui.nextButton.addEventListener("click", openSetup);
ui.resetButton.addEventListener("click", requestShiftReview);
ui.reviewClose.addEventListener("click", () => { ui.reviewOverlay.hidden = true; });
ui.newShift.addEventListener("click", () => { ui.reviewOverlay.hidden = true; state.phase = "ready"; openSetup(); });
ui.reviewPatientsLink.addEventListener("click", () => openPatientChart("review", state.history[reviewIndex]));
ui.reviewChartPrevious.addEventListener("click", () => navigateReviewChart(-1));
ui.reviewChartNext.addEventListener("click", () => navigateReviewChart(1));
ui.reviewChartClose.addEventListener("click", closeChart);
ui.patientExpandButton.addEventListener("click", () => openPatientChart("assignment"));
ui.coachButton.addEventListener("click", () => openPatientChart("coach", state.history.findLast((entry) => entry.patientId === state.decision?.patientId)));
document.querySelector("#coachClose").addEventListener("click", closeChart);
document.querySelectorAll("[data-section-toggle]").forEach((button) => button.addEventListener("click", () => toggleSection(button.dataset.sectionToggle)));
ui.coachCard.addEventListener("scroll", updateChartScrollHints, { passive: true });
ui.coachScrollAbove.addEventListener("click", () => ui.coachCard.scrollBy({ top: -ui.coachCard.clientHeight * 0.7, behavior: "smooth" }));
ui.coachScrollHint.addEventListener("click", () => ui.coachCard.scrollBy({ top: ui.coachCard.clientHeight * 0.7, behavior: "smooth" }));
ui.coachOverlay.addEventListener("click", (event) => { if (event.target === ui.coachOverlay) closeChart(); });
ui.soundButton.addEventListener("click", () => {
  muted = !muted;
  ui.soundButton.setAttribute("aria-pressed", String(muted));
  ui.soundButton.setAttribute("aria-label", muted ? "Unmute sounds" : "Mute sounds");
  ui.soundButton.textContent = muted ? "×" : "♪";
});
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeChart(); });
window.addEventListener("resize", updateChartScrollHints);

async function initialize() {
  renderAll();
  try {
    try {
      const savedPlayer = JSON.parse(localStorage.getItem("triageRushMobilePlayer"));
      if (savedPlayer?.title && savedPlayer?.initials) state.player = savedPlayer;
    } catch (error) {
      console.warn("Saved player settings could not be read.", error);
    }
    await loadPatients();
    state.phase = "ready";
    ui.statusLabel.textContent = "READY";
    ui.statusValue.textContent = "160";
    renderAll();
    openSetup();
    timerId = setInterval(heartbeat, 250);
  } catch (error) {
    console.error(error);
    state.phase = "error";
    ui.setupOverlay.hidden = true;
    ui.emptyStateKicker.textContent = "DATA ERROR";
    ui.emptyStateTitle.textContent = "PATIENTS NOT LOADED";
    ui.emptyStateHint.textContent = "Start the mobile preview server and refresh.";
  }
}

initialize();
