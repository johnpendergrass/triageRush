const ASSETS = window.TRIAGE_RUSH_ASSETS;

if (!ASSETS) {
  throw new Error("Mobile asset manifest failed to load.");
}

const patients = [
  {
    id: "patient-006",
    name: "Priya",
    age: 27,
    sex: "F",
    complaint: "Face swelling",
    quote: "There was shrimp in the pad thai. My face is swelling, and now I can hear myself wheezing.",
    presentation: "27yo F - facial and lip swelling with wheeze minutes after shellfish. Hypotensive and hypoxic.",
    vitals: { hr: 128, bp: "88/54", rr: 26, spo2: 90, temp: 37.0, pain: 3 },
    answer: "esi1",
    esi: 1,
    why: "Airway swelling, wheeze, hypoxia, and shock require immediate life-saving intervention. This is ESI 1."
  },
  {
    id: "patient-032",
    name: "Ronald",
    age: 71,
    sex: "M",
    complaint: "Passed out; belly and back pain",
    quote: "I passed out at the store. Now there is deep tearing pain through my belly and back.",
    presentation: "71yo M - syncope, severe abdominal/back pain, diaphoresis, pulsatile abdominal mass, BP 88/54.",
    vitals: { hr: 118, bp: "88/54", rr: 22, spo2: 97, temp: 36.8, pain: 9 },
    answer: "esi1",
    esi: 1,
    why: "Syncope, abdominal/back pain, a pulsatile mass, and hypotension suggest ruptured AAA. He needs immediate resuscitation."
  },
  {
    id: "patient-002",
    name: "Frank",
    age: 58,
    sex: "M",
    complaint: "Heartburn",
    quote: "It is just heartburn. Give me a Tums and I am out of here.",
    presentation: "58yo M - substernal burning radiating to jaw, diaphoresis, onset at his desk; possible acute coronary syndrome.",
    vitals: { hr: 108, bp: "108/70", rr: 20, spo2: 95, temp: 37.0, pain: 5 },
    answer: "esi2",
    esi: 2,
    why: "High-risk chest symptoms can deteriorate quickly despite near-normal vital signs. This is an emergent ESI 2 evaluation."
  },
  {
    id: "patient-004",
    name: "Rosa",
    age: 61,
    sex: "F",
    complaint: "Back pain after car crash",
    quote: "I am mostly fine. It is my back that is being dramatic, not me.",
    presentation: "61yo F - back pain after MVC, midline tenderness, moving both legs, stable vital signs.",
    vitals: { hr: 96, bp: "148/88", rr: 18, spo2: 98, temp: 37.0, pain: 7 },
    answer: "esi3",
    esi: 3,
    why: "She is stable but needs imaging, analgesia, and examination after a significant mechanism. Multiple resources support ESI 3."
  },
  {
    id: "patient-009",
    name: "Andre",
    age: 19,
    sex: "M",
    complaint: "Belly pain moved right",
    quote: "The pain started by my belly button, then moved down to the right.",
    presentation: "19yo M - migrating RLQ pain, nausea/vomiting, guarding; stable and concerning for appendicitis.",
    vitals: { hr: 96, bp: "124/78", rr: 18, spo2: 99, temp: 37.8, pain: 7 },
    answer: "esi3",
    esi: 3,
    why: "Probable appendicitis requires labs, imaging, medication, and surgical consultation, but he is currently stable: ESI 3."
  },
  {
    id: "patient-001",
    name: "Tyler",
    age: 10,
    sex: "M",
    complaint: "Twisted ankle",
    quote: "I landed wrong playing tennis. Walking hurts. Do I get cool crutches?",
    presentation: "10yo M - inversion ankle injury, painful weight-bearing, neurovascularly intact.",
    vitals: { hr: 92, bp: "110/70", rr: 18, spo2: 99, temp: 37.0, pain: 5 },
    answer: "esi4",
    esi: 4,
    why: "He is stable and likely needs one resource: an ankle X-ray. That makes this a less-urgent ESI 4 case."
  },
  {
    id: "patient-011",
    name: "Gerry",
    age: 45,
    sex: "M",
    complaint: "Cut my hand",
    quote: "The avocado won. It is not squirting, and I can still bend everything.",
    presentation: "45yo M - palmar knife laceration, bleeding controlled, full flexion and sensation.",
    vitals: { hr: 84, bp: "130/82", rr: 16, spo2: 99, temp: 36.8, pain: 4 },
    answer: "esi4",
    esi: 4,
    why: "A controlled laceration with intact tendon and nerve function generally needs one focused procedural resource: ESI 4."
  },
  {
    id: "patient-014",
    name: "Trevor",
    age: 15,
    sex: "M",
    complaint: "Itchy rash on both legs",
    quote: "I built a dirt jump in poison ivy. I have not stopped scratching since third period.",
    presentation: "15yo M - localized itchy streaky rash after plant exposure; no facial, airway, or systemic involvement.",
    vitals: { hr: 80, bp: "112/70", rr: 16, spo2: 100, temp: 36.9, pain: 2 },
    answer: "esi5",
    esi: 5,
    why: "Localized contact dermatitis without red flags needs examination and simple treatment without ED resources: ESI 5."
  },
  {
    id: "patient-023",
    name: "Liam",
    age: 4,
    sex: "M",
    complaint: "Bead in nose",
    quote: "It fit perfectly, and then it did not come back out. It is the blue one.",
    presentation: "4yo M - witnessed plastic bead in right nostril, comfortable, breathing well; not a battery or magnet.",
    vitals: { hr: 104, bp: "100/64", rr: 22, spo2: 100, temp: 37.0, pain: 1 },
    answer: "esi5",
    esi: 5,
    why: "This is a simple foreign-body removal without airway compromise or high-risk material: non-urgent ESI 5."
  },
  {
    id: "patient-015",
    name: "Kevin",
    age: 31,
    sex: "M",
    complaint: "Panic attack",
    quote: "My heart is pounding and my fingers are tingling. This is the fourth time this month.",
    presentation: "31yo M - recurrent palpitations and tingling, prior cardiac workup negative, no acute medical red flags.",
    vitals: { hr: 104, bp: "128/80", rr: 22, spo2: 100, temp: 36.8, pain: 0 },
    answer: "psych",
    esi: 4,
    why: "After medical red flags are excluded, the recurrent stable pattern and hyperventilation symptoms support the behavioral-health pathway."
  },
  {
    id: "patient-043",
    name: "Devon",
    age: 29,
    sex: "M",
    complaint: "Seeing and hearing things",
    quote: "I stopped my medication. I am not going to hurt anyone; I just want the voices to stop.",
    presentation: "29yo M - known schizophrenia off medication, calm, cooperative, no SI/HI, normal vitals, no organic red flags.",
    vitals: { hr: 78, bp: "122/76", rr: 14, spo2: 99, temp: 36.8, pain: 0 },
    answer: "psych",
    esi: 4,
    why: "A calm, cooperative patient with a known psychiatric condition, normal vitals, and no imminent danger fits the Psych pathway."
  },
  {
    id: "patient-013",
    name: "Gloria",
    age: 67,
    sex: "F",
    complaint: "Out of blood-pressure medicine",
    quote: "I feel perfectly fine. I just need a refill of the little pink pill.",
    presentation: "67yo F - out of antihypertensive medication, asymptomatic, mildly elevated BP, no end-organ symptoms.",
    vitals: { hr: 74, bp: "150/88", rr: 15, spo2: 98, temp: 36.8, pain: 0 },
    answer: "discharge",
    esi: 5,
    why: "Asymptomatic mild hypertension without end-organ signs does not require emergency treatment. Refill guidance and follow-up are appropriate."
  },
  {
    id: "patient-016",
    name: "Brenda",
    age: 39,
    sex: "F",
    complaint: "Web search says brain tumor",
    quote: "I have a mild headache. I need a professional to tell me whether the internet is right.",
    presentation: "39yo F - mild bilateral headache for several days, no thunderclap onset, neurologic deficit, or other red flags.",
    vitals: { hr: 72, bp: "118/76", rr: 14, spo2: 100, temp: 36.7, pain: 2 },
    answer: "discharge",
    esi: 5,
    why: "A mild headache without red flags or abnormal findings can receive reassurance, safety-net instructions, and outpatient follow-up."
  }
];

const rooms = [
  {
    key: "esi1",
    esi: 1,
    badge: "ESI 1",
    label: "RESUS",
    description: "Immediate life-saving treatment is required.",
    closed: ASSETS.roomsPanel.rooms.esi1.closedDoor,
    open: ASSETS.roomsPanel.rooms.esi1.openDoor
  },
  {
    key: "esi2",
    esi: 2,
    badge: "ESI 2",
    label: "EMERGENT",
    description: "High-risk or severe symptoms that should not wait.",
    closed: ASSETS.roomsPanel.rooms.esi2.closedDoor,
    open: ASSETS.roomsPanel.rooms.esi2.openDoor
  },
  {
    key: "esi3",
    esi: 3,
    badge: "ESI 3",
    label: "URGENT",
    description: "Stable now, but likely needs several tests or treatments.",
    closed: ASSETS.roomsPanel.rooms.esi3.closedDoor,
    open: ASSETS.roomsPanel.rooms.esi3.openDoor
  },
  {
    key: "esi4",
    esi: 4,
    badge: "ESI 4",
    label: "LESS URGENT",
    description: "Stable and likely needs one test or treatment.",
    closed: ASSETS.roomsPanel.rooms.esi4.closedDoor,
    open: ASSETS.roomsPanel.rooms.esi4.openDoor
  },
  {
    key: "esi5",
    esi: 5,
    badge: "ESI 5",
    label: "NON-URGENT",
    description: "Stable and generally needs examination or simple care only.",
    closed: ASSETS.roomsPanel.rooms.esi5.closedDoor,
    open: ASSETS.roomsPanel.rooms.esi5.openDoor
  },
  {
    key: "psych",
    badge: "",
    label: "PSYCH",
    description: "Behavioral-health evaluation for a medically stable patient. The patient still has an underlying ESI level.",
    closed: ASSETS.roomsPanel.rooms.psych.closedDoor,
    open: ASSETS.roomsPanel.rooms.psych.openDoor
  },
  {
    key: "discharge",
    badge: "",
    label: "DISCHARGE",
    description: "Emergency treatment is not needed. Provide guidance, follow-up, or routine care.",
    closed: ASSETS.roomsPanel.rooms.discharge.closedDoor,
    open: ASSETS.roomsPanel.rooms.discharge.openDoor
  }
];

const roomNames = Object.fromEntries(rooms.map((room) => [room.key, `${room.badge} ${room.label}`.trim()]));
const queueSlotCount = 5;
const waitingRoomBackgrounds = ASSETS.waitingRooms;

const ui = {
  waitingList: document.querySelector("#waitingList"),
  waitingPanel: document.querySelector(".waiting-panel"),
  patientName: document.querySelector("#patientName"),
  patientDemographics: document.querySelector("#patientDemographics"),
  patientImage: document.querySelector("#patientImage"),
  complaintChip: document.querySelector("#complaintChip"),
  patientQuote: document.querySelector("#patientQuote"),
  presentationText: document.querySelector("#presentationText"),
  roomsPanel: document.querySelector("#roomsPanel"),
  resultToast: document.querySelector("#resultToast"),
  patientPanel: document.querySelector(".patient-panel"),
  roomInfoPopover: document.querySelector("#roomInfoPopover"),
  roomInfoTitle: document.querySelector("#roomInfoTitle"),
  roomInfoText: document.querySelector("#roomInfoText"),
  patientEmptyState: document.querySelector("#patientEmptyState"),
  emptyStateKicker: document.querySelector("#emptyStateKicker"),
  emptyStateTitle: document.querySelector("#emptyStateTitle"),
  emptyStateHint: document.querySelector("#emptyStateHint"),
  coachButton: document.querySelector("#coachButton"),
  coachOverlay: document.querySelector("#coachOverlay"),
  coachCard: document.querySelector("#coachCard"),
  coachScrollHint: document.querySelector("#coachScrollHint"),
  statusLabel: document.querySelector("#statusLabel"),
  statusValue: document.querySelector("#statusValue"),
  soundButton: document.querySelector("#soundButton"),
  nextButton: document.querySelector("#nextButton")
};

let currentPatientIndex = null;
let currentPatientQueueBackground = null;
let waiting = makeWaitingQueue(currentPatientIndex);
let decision = null;
let openRoom = null;
let mode = "game";
let muted = false;
let seconds = 60;
let score = 0;
let tally = { correct: 0, acceptable: 0, close: 0, wrong: 0 };
let timerId = null;
let holdGesture = null;
let awaitingPatient = true;
let previouslyAssigned = false;

function randomIndex(exclude = []) {
  const blocked = new Set(Array.isArray(exclude) ? exclude : [exclude]);
  const choices = patients.map((_, index) => index).filter((index) => !blocked.has(index));
  return choices[Math.floor(Math.random() * choices.length)];
}

function makeWaitingQueue(activeIndex, queueLength = queueSlotCount) {
  const queue = [];
  while (queue.length < queueLength) {
    const queuedPatientIndexes = queue.map((entry) => entry.patientIndex);
    const usedBackgrounds = queue.map((entry) => entry.background);
    const candidate = randomIndex([activeIndex, ...queuedPatientIndexes]);
    queue.push(createQueueEntry(candidate, usedBackgrounds));
  }
  return queue;
}

function createQueueEntry(patientIndex, excludedBackgrounds = []) {
  const availableBackgrounds = waitingRoomBackgrounds.filter(
    (background) => !excludedBackgrounds.includes(background)
  );
  const choices = availableBackgrounds.length ? availableBackgrounds : waitingRoomBackgrounds;
  return {
    patientIndex,
    background: choices[Math.floor(Math.random() * choices.length)]
  };
}

function activePatient() {
  return patients[currentPatientIndex];
}

function renderAll() {
  renderPatient();
  renderWaiting();
  renderRooms();
  renderStatus();
  renderFooterControls();
}

function renderPatient() {
  const patient = activePatient();
  const isCleared = awaitingPatient;
  const isAssignedCase = Boolean(decision);
  ui.patientPanel.classList.toggle("is-awaiting-patient", isCleared);
  ui.patientEmptyState.hidden = !isCleared;
  ui.emptyStateKicker.textContent = isAssignedCase ? "ROOM ASSIGNED" : "READY";
  ui.emptyStateTitle.textContent = isAssignedCase ? "SELECT ANOTHER PATIENT" : "SELECT A PATIENT";
  ui.emptyStateHint.textContent = isAssignedCase
    ? "Tap the triage queue · or tap the open room to recall"
    : "Tap a patient in the triage queue";
  ui.patientPanel
    .querySelectorAll(".patient-scene, .patient-quote, .vitals-card, .presentation-card")
    .forEach((element) => element.setAttribute("aria-hidden", String(isCleared)));

  if (!patient) {
    ui.patientImage.removeAttribute("src");
    ui.patientImage.alt = "";
    return;
  }

  ui.patientName.textContent = patient.name;
  ui.patientDemographics.textContent = `${patient.age}${patient.sex}`;
  ui.patientImage.src = ASSETS.patientData.image(patient.id);
  ui.patientImage.alt = `${patient.name}, current patient`;
  ui.complaintChip.textContent = patient.complaint;
  ui.patientQuote.textContent = `“${patient.quote}”`;
  ui.presentationText.textContent = patient.presentation;

  setVital("vitalHr", patient.vitals.hr, patient.vitals.hr > 115 || patient.vitals.hr < 50);
  setVital("vitalBp", patient.vitals.bp, Number.parseInt(patient.vitals.bp, 10) < 90);
  setVital("vitalRr", patient.vitals.rr, patient.vitals.rr > 24 || patient.vitals.rr < 10);
  setVital("vitalSpo2", `${patient.vitals.spo2}%`, patient.vitals.spo2 < 92);
  setVital("vitalTemp", `${patient.vitals.temp.toFixed(1)}°`, patient.vitals.temp >= 38);
  setVital("vitalPain", `${patient.vitals.pain}/10`, patient.vitals.pain >= 8, patient.vitals.pain >= 5);
}

function setVital(id, value, alert = false, watch = false) {
  const element = document.querySelector(`#${id}`);
  element.textContent = value;
  element.className = alert ? "is-alert" : watch ? "is-watch" : "";
}

function renderWaiting() {
  ui.waitingList.replaceChildren();
  ui.waitingPanel.classList.toggle("is-awaiting-selection", awaitingPatient);
  waiting.forEach((queueEntry, queueIndex) => {
    const patient = patients[queueEntry.patientIndex];
    const actionLabel = awaitingPatient
      ? `Move ${patient.name} into the patient panel`
      : `Swap ${patient.name} with the current patient`;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "queue-patient";
    button.classList.toggle("is-selectable", awaitingPatient);
    button.setAttribute("aria-label", `${actionLabel}: ${patient.complaint}`);
    button.innerHTML = `
      <img
        class="queue-background"
        src="${queueEntry.background}"
        alt=""
      />
      <img class="queue-patient-image" src="${ASSETS.patientData.image(patient.id)}" alt="" />
      <span class="queue-cell-frame" aria-hidden="true"></span>
      <span class="queue-complaint">${patient.complaint}</span>
      <span
        class="queue-transfer-hint ${awaitingPatient ? "is-move" : "is-swap"}"
        aria-hidden="true"
      ><b>${awaitingPatient ? "→" : "↔"}</b></span>
    `;
    button.addEventListener("click", () => selectWaitingPatient(queueIndex));
    ui.waitingList.append(button);
  });

  for (let slot = waiting.length; slot < queueSlotCount; slot += 1) {
    const emptySlot = document.createElement("div");
    emptySlot.className = "queue-slot-empty";
    emptySlot.setAttribute("aria-hidden", "true");
    ui.waitingList.append(emptySlot);
  }
}

function renderRooms() {
  ui.roomsPanel.replaceChildren();
  rooms.forEach((room) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "room-choice";
    button.dataset.room = room.key;

    if (openRoom === room.key) button.classList.add("is-open");
    if (decision) {
      if (decision.room === room.key) button.classList.add(`pulse-${decision.outcome}`);
      if (decision.outcome !== "correct" && activePatient().answer === room.key) {
        button.classList.add("reveal-correct");
      }
    }

    const isOpen = openRoom === room.key;
    const canRecallPatient = awaitingPatient && decision?.room === room.key;
    button.setAttribute(
      "aria-label",
      `${roomNames[room.key]} door, ${isOpen ? "open" : "closed"}. ${room.description}${
        canRecallPatient ? " Tap to recall the assigned patient." : ""
      }`
    );
    button.setAttribute("aria-describedby", "roomInfoPopover");
    button.setAttribute("aria-pressed", String(isOpen));
    button.innerHTML = `
      ${canRecallPatient ? `<span class="recall-arrow" aria-hidden="true"><b>←</b></span>` : ""}
      <span class="room-label">
        ${room.badge ? `<span>${room.badge}</span>` : ""}
        <strong>${room.label}</strong>
      </span>
      <img class="door-art" src="${isOpen ? room.open : room.closed}" alt="" />
    `;
    installRoomHover(button, room);
    ui.roomsPanel.append(button);
  });
}

function installRoomHover(button, room) {
  button.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "touch") showRoomInfo(room, button);
  });

  button.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "touch") hideRoomInfo();
    cancelHoldGesture(button, false);
  });

  button.addEventListener("focus", () => {
    if (button.matches(":focus-visible")) showRoomInfo(room, button);
  });
  button.addEventListener("blur", hideRoomInfo);

  button.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") return;

    cancelHoldGesture(null, false);
    holdGesture = {
      button,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      activated: false,
      timer: window.setTimeout(() => {
        if (!holdGesture || holdGesture.button !== button) return;
        holdGesture.activated = true;
        button.dataset.suppressClick = "true";
        showRoomInfo(room, button);
        if (navigator.vibrate) navigator.vibrate(12);
      }, 500)
    };
  });

  button.addEventListener("pointermove", (event) => {
    if (!holdGesture || holdGesture.button !== button || holdGesture.pointerId !== event.pointerId) return;
    const moved = Math.hypot(event.clientX - holdGesture.startX, event.clientY - holdGesture.startY);
    if (moved > 10) {
      button.dataset.suppressClick = "true";
      cancelHoldGesture(button, true);
    }
  });

  button.addEventListener("pointerup", (event) => {
    if (!holdGesture || holdGesture.button !== button || holdGesture.pointerId !== event.pointerId) return;
    const wasActivated = holdGesture.activated;
    window.clearTimeout(holdGesture.timer);
    holdGesture = null;
    if (wasActivated) {
      hideRoomInfo();
      window.setTimeout(() => delete button.dataset.suppressClick, 700);
    }
  });

  button.addEventListener("pointercancel", () => cancelHoldGesture(button, true));
  button.addEventListener("contextmenu", (event) => event.preventDefault());

  button.addEventListener("click", (event) => {
    if (button.dataset.suppressClick === "true") {
      event.preventDefault();
      event.stopPropagation();
      delete button.dataset.suppressClick;
      return;
    }
    hideRoomInfo();
    chooseRoom(room.key);
  });
}

function cancelHoldGesture(button, suppressClick) {
  if (!holdGesture || (button && holdGesture.button !== button)) return;
  const activeButton = holdGesture.button;
  window.clearTimeout(holdGesture.timer);
  if (suppressClick) {
    activeButton.dataset.suppressClick = "true";
    window.setTimeout(() => delete activeButton.dataset.suppressClick, 700);
  }
  holdGesture = null;
  hideRoomInfo();
}

function showRoomInfo(room, anchor) {
  ui.roomInfoTitle.textContent = roomNames[room.key];
  ui.roomInfoText.textContent = room.description;
  ui.roomInfoPopover.hidden = false;

  const panelRect = ui.patientPanel.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  const popupHeight = ui.roomInfoPopover.offsetHeight;
  const desiredTop = anchorRect.top + anchorRect.height / 2 - panelRect.top - popupHeight / 2;
  const maximumTop = panelRect.height - popupHeight - 6;
  ui.roomInfoPopover.style.top = `${Math.max(6, Math.min(desiredTop, maximumTop))}px`;
}

function hideRoomInfo() {
  ui.roomInfoPopover.hidden = true;
}

function chooseRoom(roomKey) {
  if (awaitingPatient) {
    if (decision?.room === roomKey) recallAssignedPatient();
    return;
  }
  if (decision) return;

  const patient = activePatient();
  const room = rooms.find((item) => item.key === roomKey);
  const correctRoom = rooms.find((item) => item.key === patient.answer);
  const hasSpecialDestination = patient.answer === "psych" || patient.answer === "discharge";
  let outcome = "wrong";

  if (roomKey === patient.answer) {
    outcome = "correct";
  } else if (
    hasSpecialDestination
    && room.esi
    && Math.abs(room.esi - patient.esi) <= 1
  ) {
    outcome = "acceptable";
  } else if (room.esi && correctRoom.esi && Math.abs(room.esi - correctRoom.esi) === 1) {
    outcome = "close";
  }

  decision = { room: roomKey, outcome };
  hideRoomInfo();
  openRoom = roomKey;
  if (!previouslyAssigned) {
    tally[outcome] += 1;
    if (mode === "game") {
      score += outcome === "correct" ? 100 : outcome === "close" || outcome === "acceptable" ? 35 : -50;
    }
    previouslyAssigned = true;
  }
  awaitingPatient = true;
  renderPatient();
  renderWaiting();
  renderFooterControls();

  showResult(outcome);
  playFeedback(outcome);
  ui.coachButton.disabled = false;
  ui.coachButton.querySelector("small").textContent = "READY";
  renderRooms();
  renderStatus();
}

function recallAssignedPatient() {
  if (!awaitingPatient || !decision) return;
  awaitingPatient = false;
  resetDecision();
  renderAll();
}

function showResult(outcome) {
  const labels = {
    correct: "✓ CORRECT",
    acceptable: "◇ ACCEPTABLE",
    close: "△ CLOSE",
    wrong: "✕ WRONG"
  };
  ui.resultToast.textContent = labels[outcome];
  ui.resultToast.className = `result-toast ${outcome} is-visible`;
  window.setTimeout(() => ui.resultToast.classList.remove("is-visible"), 1250);
}

function playFeedback(outcome) {
  if (muted) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.connect(gain);
  gain.connect(context.destination);
  const now = context.currentTime;

  if (outcome === "correct") {
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(740, now);
    oscillator.frequency.exponentialRampToValueAtTime(1180, now + 0.14);
  } else if (outcome === "acceptable") {
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(520, now);
    oscillator.frequency.exponentialRampToValueAtTime(740, now + 0.2);
  } else if (outcome === "close") {
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(360, now);
    oscillator.frequency.exponentialRampToValueAtTime(220, now + 0.24);
  } else {
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(125, now);
    oscillator.frequency.linearRampToValueAtTime(95, now + 0.34);
  }

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.015);
  const soundDuration = outcome === "correct" ? 0.18 : outcome === "acceptable" ? 0.24 : 0.36;
  gain.gain.exponentialRampToValueAtTime(0.0001, now + soundDuration);
  oscillator.start(now);
  oscillator.stop(now + soundDuration + 0.01);
  oscillator.addEventListener("ended", () => context.close());
}

function selectWaitingPatient(queueIndex) {
  const selectedEntry = waiting[queueIndex];
  if (awaitingPatient) {
    currentPatientIndex = selectedEntry.patientIndex;
    currentPatientQueueBackground = selectedEntry.background;
    waiting.splice(queueIndex, 1);
    refillWaitingQueue();
  } else {
    const previousPatient = currentPatientIndex;
    const previousBackground =
      currentPatientQueueBackground
      || createQueueEntry(previousPatient, waiting.map((entry) => entry.background)).background;
    currentPatientIndex = selectedEntry.patientIndex;
    currentPatientQueueBackground = selectedEntry.background;
    waiting[queueIndex] = {
      patientIndex: previousPatient,
      background: previousBackground
    };
  }

  awaitingPatient = false;
  previouslyAssigned = false;
  resetDecision();
  renderAll();
}

function refillWaitingQueue() {
  while (waiting.length < queueSlotCount) {
    const queuedPatientIndexes = waiting.map((entry) => entry.patientIndex);
    const usedBackgrounds = waiting.map((entry) => entry.background);
    const newPatientIndex = randomIndex([currentPatientIndex, ...queuedPatientIndexes]);
    waiting.push(createQueueEntry(newPatientIndex, usedBackgrounds));
  }
}

function resetDecision() {
  cancelHoldGesture(null, false);
  decision = null;
  openRoom = null;
  ui.coachButton.disabled = true;
  ui.coachButton.querySelector("small").textContent = "LOCKED";
  ui.resultToast.className = "result-toast";
  closeCoach();
}

function renderStatus() {
  if (mode === "game") {
    ui.statusLabel.textContent = `SCORE ${score}`;
    ui.statusValue.textContent = seconds;
  } else {
    ui.statusLabel.textContent = "C / A / CL / W";
    ui.statusValue.textContent =
      `${tally.correct}/${tally.acceptable}/${tally.close}/${tally.wrong}`;
  }
  ui.statusValue.classList.toggle("is-edu", mode !== "game");
}

function renderFooterControls() {
  ui.nextButton.disabled = true;
  ui.nextButton.querySelector("span").textContent = awaitingPatient ? "SELECT" : "SWITCH";
  ui.nextButton.querySelector("small").textContent = "FROM LEFT";
}

function setMode(nextMode) {
  if (mode === nextMode) return;
  mode = nextMode;
  document.querySelectorAll(".mode-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  });
  renderAll();
}

function openCoach() {
  if (!decision) return;
  const patient = activePatient();
  const sexLabel = patient.sex === "F" ? "female" : patient.sex === "M" ? "male" : patient.sex;
  document.querySelector("#coachPatientImage").src = ASSETS.patientData.image(patient.id);
  document.querySelector("#coachPatientImage").alt = `${patient.name}, reviewed patient`;
  document.querySelector("#coachTitle").textContent = patient.name;
  document.querySelector("#coachDemographics").textContent =
    `${patient.age}-year-old ${sexLabel} · underlying ESI ${patient.esi}`;
  document.querySelector("#coachComplaint").textContent = patient.complaint;
  document.querySelector("#coachQuote").textContent = `“${patient.quote}”`;
  document.querySelector("#coachTriage").textContent = patient.presentation;
  document.querySelector("#coachVitals").innerHTML = [
    ["HR", patient.vitals.hr],
    ["BP", patient.vitals.bp],
    ["RR", patient.vitals.rr],
    ["SpO₂", `${patient.vitals.spo2}%`],
    ["TEMP", `${patient.vitals.temp.toFixed(1)}°C`],
    ["PAIN", `${patient.vitals.pain}/10`]
  ]
    .map(([label, value]) => `
      <div class="coach-vital">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    `)
    .join("");
  document.querySelector("#coachChoice").textContent = roomNames[decision.room];
  document.querySelector("#coachCorrect").textContent = roomNames[patient.answer];
  document.querySelector("#coachResult").textContent =
    decision.outcome === "correct"
      ? "You selected the intended treatment level."
      : decision.outcome === "acceptable"
        ? "This numbered ESI placement is acceptable for this patient, although the special pathway remains the intended choice."
      : decision.outcome === "close"
        ? "Your ESI choice was one level from the intended answer."
        : "This choice differs materially from the intended treatment level.";
  document.querySelector("#coachReason").textContent = patient.why;
  ui.coachOverlay.hidden = false;
  ui.coachCard.scrollTop = 0;
  window.requestAnimationFrame(updateCoachScrollHint);
  document.querySelector("#coachClose").focus();
}

function closeCoach() {
  ui.coachOverlay.hidden = true;
}

function updateCoachScrollHint() {
  const hasMore = ui.coachCard.scrollHeight > ui.coachCard.clientHeight + 4;
  const isAtBottom =
    ui.coachCard.scrollTop + ui.coachCard.clientHeight >= ui.coachCard.scrollHeight - 4;
  ui.coachScrollHint.hidden = !hasMore || isAtBottom;
}

function resetRound() {
  score = 0;
  tally = { correct: 0, acceptable: 0, close: 0, wrong: 0 };
  seconds = 60;
  currentPatientIndex = null;
  currentPatientQueueBackground = null;
  waiting = makeWaitingQueue(currentPatientIndex);
  awaitingPatient = true;
  previouslyAssigned = false;
  resetDecision();
  renderAll();
}

function startTimer() {
  window.clearInterval(timerId);
  timerId = window.setInterval(() => {
    if (mode !== "game" || !ui.coachOverlay.hidden) return;
    seconds = seconds <= 0 ? 60 : seconds - 1;
    renderStatus();
  }, 1000);
}

document.querySelectorAll(".mode-button").forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

document.querySelector("#resetButton").addEventListener("click", resetRound);
ui.coachButton.addEventListener("click", openCoach);
document.querySelector("#coachClose").addEventListener("click", closeCoach);
ui.coachCard.addEventListener("scroll", updateCoachScrollHint, { passive: true });
ui.coachScrollHint.addEventListener("click", () => {
  ui.coachCard.scrollBy({
    top: ui.coachCard.clientHeight * 0.7,
    behavior: "smooth"
  });
});
document.querySelector("#coachPatientImage").addEventListener("load", updateCoachScrollHint);
window.addEventListener("resize", updateCoachScrollHint);
ui.coachOverlay.addEventListener("click", (event) => {
  if (event.target === ui.coachOverlay) closeCoach();
});

ui.soundButton.addEventListener("click", () => {
  muted = !muted;
  ui.soundButton.setAttribute("aria-pressed", String(muted));
  ui.soundButton.setAttribute("aria-label", muted ? "Unmute sounds" : "Mute sounds");
  ui.soundButton.textContent = muted ? "×" : "♪";
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCoach();
});

renderAll();
startTimer();
