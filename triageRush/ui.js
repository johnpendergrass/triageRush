/* ============================================================================
   triageRush - ui.js
   Rendering: functions that read state (and selectors) and write the DOM.
   No game rules live here, and rendering never plays sounds, starts timers,
   or mutates game state (doc 4 rendering contract).

   Section map:
     1. Element lookup
     2. View switching
     3. HOME rendering (board summaries, loading status)
     4. Popup management (open/close with focus handling)
     5. GAME skeleton rendering
     6. SHIFT REVIEW rendering
   ========================================================================= */

"use strict";

(function buildUiNamespace() {

  const GAME = window.TRIAGE_RUSH_GAME;

  /* ----------------------------------------------------------------------
     1. Element lookup - one place that knows every ID in index.html.
     ------------------------------------------------------------------- */

  const elementIds = [
    "appShell",
    // HOME
    "homeView", "homeBackground", "startShiftButton", "startShiftArt",
    "playerBoardButton", "playerBoardTitleLine", "playerBoardInitialsLine",
    "shiftBoardButton", "shiftBoardModeLine", "shiftBoardDifficultyLine",
    "shiftBoardLengthLine", "aboutButton", "homeLoadingStatus",
    // Popups
    "popupLayer", "popupCard", "popupBoardArt", "popupCloseButton",
    "popupApplyButton", "playerBoardContent", "shiftBoardContent",
    "aboutBoardContent", "playerTitleSelect", "playerInitialsInput",
    "triageLengthFieldset", "rushLengthFieldset",
    "settingSoundGlobal", "settingSoundGame", "settingSoundMusic",
    "settingHints", "musicStatusNote",
    // Overlays
    "arrivingOverlay", "confirmQuitOverlay", "confirmQuitCancel",
    "confirmQuitAccept",
    // GAME
    "gameView", "gameBrand", "gameScorecard", "scoreCorrect",
    "scoreCloseDivider", "scoreClose", "scoreWrong", "scoreTotal",
    "gameTimer", "gameSoundButton", "waitingPanel", "patientPanel",
    "patientChartMount", "patientEmptyState", "patientEmptyHint",
    "roomsPanel", "quitGameButton", "stopGameButton",
    // REVIEW
    "reviewView", "reviewEyebrow", "reviewPlayerLine", "reviewScoreLine",
    "returnToLobbyButton"
  ];

  const ui = {};
  for (const id of elementIds) {
    ui[id] = document.getElementById(id);
    if (!ui[id]) console.warn(`triageRush ui: missing element #${id}`);
  }

  /* Where focus should return when the current popup/overlay closes. */
  let popupReturnFocus = null;

  /* ----------------------------------------------------------------------
     2. View switching. Exactly one primary view is visible (doc 7).
     ------------------------------------------------------------------- */

  function renderShellView(state) {
    ui.homeView.hidden = state.view !== "home";
    ui.gameView.hidden = state.view !== "game";
    ui.reviewView.hidden = state.view !== "review";
  }

  /* ----------------------------------------------------------------------
     3. HOME rendering.
     ------------------------------------------------------------------- */

  function formatShiftLengthLabel(state) {
    const seconds = GAME.selectedShiftLengthSeconds(state);
    if (seconds >= 60 && seconds % 60 === 0) {
      return `${seconds / 60}:00`;
    }
    return `${seconds}s`;
  }

  function renderHomeBoardSummaries(state) {
    ui.playerBoardTitleLine.textContent = state.player.title.toUpperCase();
    ui.playerBoardInitialsLine.textContent = state.player.initials;

    ui.shiftBoardModeLine.textContent =
      state.settings.mode === "rush" ? "TRIAGE RUSH!" : "TRIAGE";
    ui.shiftBoardDifficultyLine.textContent =
      state.settings.difficulty.toUpperCase();
    ui.shiftBoardLengthLine.textContent = formatShiftLengthLabel(state);
  }

  /* Loading status states: progress text, ready (fades out), or error. */
  function renderLoadingStatus(loading) {
    const statusElement = ui.homeLoadingStatus;
    statusElement.classList.toggle("is-error", loading.failed);
    statusElement.classList.toggle("is-ready", loading.ready);

    if (loading.failed) {
      statusElement.textContent = loading.errorMessage;
    } else if (loading.ready) {
      statusElement.textContent = "READY";
    } else {
      statusElement.textContent =
        `Loading patients… ${loading.patientsLoaded}/${loading.patientsTotal}`;
    }

    /* Start Shift is blocked until everything required has validated. */
    ui.startShiftButton.disabled = !loading.ready;
  }

  /* ----------------------------------------------------------------------
     4. Popup management.
     One dialog layer; the visible content block and board art swap by
     popup name: "settings-player" | "settings-shift" | "about".
     ------------------------------------------------------------------- */

  function openPopup(popupName, state, triggerElement) {
    popupReturnFocus = triggerElement || null;

    const assets = window.TRIAGE_RUSH_ASSETS;
    const isPlayer = popupName === "settings-player";
    const isShift = popupName === "settings-shift";
    const isAbout = popupName === "about";

    ui.popupBoardArt.src = isAbout
      ? assets.lobby.aboutWhiteboard
      : assets.lobby.settingsBlackboard;

    ui.playerBoardContent.hidden = !isPlayer;
    ui.shiftBoardContent.hidden = !isShift;
    ui.aboutBoardContent.hidden = !isAbout;
    /* Only settings boards have an apply action; About just closes. */
    ui.popupApplyButton.hidden = isAbout;

    ui.popupLayer.setAttribute("aria-label",
      isPlayer ? "Player settings" : isShift ? "Shift settings" : "About");

    if (isPlayer || isShift) fillSettingsControls(state);
    ui.popupLayer.hidden = false;
    ui.popupCloseButton.focus();
  }

  function closePopup() {
    ui.popupLayer.hidden = true;
    ui.musicStatusNote.hidden = true;
    if (popupReturnFocus) {
      popupReturnFocus.focus();
      popupReturnFocus = null;
    }
  }

  function isPopupOpen() {
    return !ui.popupLayer.hidden;
  }

  /* Copy current state into the form controls (both boards at once; only
     one is visible, and reading them back together keeps apply simple). */
  function fillSettingsControls(state) {
    /* Titles are rebuilt each open so the enum lives in one place. */
    ui.playerTitleSelect.replaceChildren();
    for (const title of GAME.GAME_CONSTANTS.PLAYER_TITLES) {
      const option = document.createElement("option");
      option.value = title;
      option.textContent = title;
      ui.playerTitleSelect.appendChild(option);
    }
    ui.playerTitleSelect.value = state.player.title;
    ui.playerInitialsInput.value = state.player.initials;

    setRadioGroup("settingMode", state.settings.mode);
    setRadioGroup("settingDifficulty", state.settings.difficulty);
    setRadioGroup("settingTriageLength",
      String(state.settings.triageLengthSeconds));
    setRadioGroup("settingRushLength",
      String(state.settings.rushLengthSeconds));

    ui.settingSoundGlobal.checked = state.settings.soundGlobal;
    ui.settingSoundGame.checked = state.settings.soundGame;
    ui.settingSoundMusic.checked = state.settings.soundMusic;
    ui.settingHints.checked = state.settings.hints;

    renderModeLengthVisibility();
  }

  function setRadioGroup(groupName, value) {
    for (const radio of document.querySelectorAll(
      `input[name="${groupName}"]`)) {
      radio.checked = radio.value === value;
    }
  }

  function getRadioGroup(groupName) {
    const checked = document.querySelector(
      `input[name="${groupName}"]:checked`);
    return checked ? checked.value : null;
  }

  /* Only the selected mode's length choices are shown. */
  function renderModeLengthVisibility() {
    const mode = getRadioGroup("settingMode");
    ui.triageLengthFieldset.hidden = mode !== "triage";
    ui.rushLengthFieldset.hidden = mode !== "rush";
  }

  /* Read the form controls back into candidate player/settings objects.
     Validation happens in game.js applySettings, not here. */
  function readSettingsControls(state) {
    return {
      player: {
        title: ui.playerTitleSelect.value,
        initials: GAME.normalizeInitials(
          ui.playerInitialsInput.value, state.player.initials)
      },
      settings: {
        mode: getRadioGroup("settingMode"),
        difficulty: getRadioGroup("settingDifficulty"),
        triageLengthSeconds: Number(getRadioGroup("settingTriageLength")),
        rushLengthSeconds: Number(getRadioGroup("settingRushLength")),
        hints: ui.settingHints.checked,
        soundGlobal: ui.settingSoundGlobal.checked,
        soundGame: ui.settingSoundGame.checked,
        soundMusic: ui.settingSoundMusic.checked
      }
    };
  }

  function showMusicStatusNote(messageText) {
    ui.musicStatusNote.textContent = messageText;
    ui.musicStatusNote.hidden = false;
  }

  /* ----------------------------------------------------------------------
     5. GAME skeleton rendering.
     ------------------------------------------------------------------- */

  function formatClock(totalMs) {
    const totalSeconds = Math.max(0, Math.ceil(totalMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  function renderGameHeader(state) {
    /* Brand: TRIAGE! in Triage; TRIAGE + orange RUSH! in RUSH (doc 7). */
    if (state.settings.mode === "rush") {
      ui.gameBrand.replaceChildren(
        document.createTextNode("TRIAGE"),
        Object.assign(document.createElement("span"),
          { className: "brand-rush", textContent: "RUSH!" }));
    } else {
      ui.gameBrand.textContent = "TRIAGE!";
    }

    const totals = GAME.selectScoreTotals(state);
    ui.scoreCorrect.textContent = String(totals.correct);
    ui.scoreClose.textContent = String(totals.close);
    ui.scoreWrong.textContent = String(totals.wrong);
    ui.scoreTotal.textContent = String(totals.score);

    /* Strict hides Close without leaving a gap. */
    const isStrict = state.settings.difficulty === "strict";
    ui.scoreClose.hidden = isStrict;
    ui.scoreCloseDivider.hidden = isStrict;

    ui.gameTimer.textContent = formatClock(state.shift.remainingMs);

    ui.gameSoundButton.classList.toggle(
      "is-muted", !state.gameSoundsAudible);
    ui.gameSoundButton.textContent =
      state.gameSoundsAudible ? "♪" : "×";
    ui.gameSoundButton.setAttribute("aria-label",
      state.gameSoundsAudible ? "Mute sounds" : "Unmute sounds");
  }

  function renderConfirmQuit(state) {
    ui.confirmQuitOverlay.hidden = state.overlay !== "confirm-quit";
    if (state.overlay === "confirm-quit") {
      ui.confirmQuitCancel.focus();
    }
  }

  function renderArrivingOverlay(isVisible) {
    ui.arrivingOverlay.hidden = !isVisible;
  }

  /* ----------------------------------------------------------------------
     5b. Waiting queue rendering.
     Rows are rebuilt on each change; clicks are handled by delegation in
     app.js, so no listeners are attached here.
     ------------------------------------------------------------------- */

  function renderWaiting(state, portraitUrlFor) {
    const assets = window.TRIAGE_RUSH_ASSETS;
    const rowCount = Math.max(
      GAME.GAME_CONSTANTS.MIN_VISIBLE_WAITING, state.waiting.length);
    ui.waitingPanel.style.gridTemplateRows =
      `repeat(${rowCount}, minmax(0, 1fr))`;

    const canSelect = state.active === null && state.assigned === null;
    const canSwap = state.active !== null && state.assigned === null;
    const rows = [];

    state.waiting.forEach((entry, waitingIndex) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "queue-patient" + (canSelect ? " is-selectable" : "");
      row.dataset.waitingIndex = String(waitingIndex);

      const background = document.createElement("img");
      background.className = "queue-background";
      background.alt = "";
      background.src = assets.game.waitingBackgrounds[entry.waitingBackgroundKey];

      const portrait = document.createElement("img");
      portrait.className = "queue-patient-image";
      portrait.alt = "";
      portrait.src = portraitUrlFor(entry.patientId);

      const frame = document.createElement("span");
      frame.className = "queue-cell-frame";

      const complaint = document.createElement("span");
      complaint.className = "queue-complaint";
      const record = window.TRIAGE_RUSH_PATIENTS_BY_ID[entry.patientId];
      complaint.textContent = record.patient.presentation.chiefComplaint;

      row.append(background, portrait, frame, complaint);

      if (state.settings.hints && (canSelect || canSwap)) {
        const hint = document.createElement("span");
        hint.className = "queue-hint";
        hint.textContent = canSelect ? "→" : "↔";
        row.append(hint);
      }

      row.setAttribute("aria-label",
        `${record.patient.presentation.personal.name}: `
        + `${record.patient.presentation.chiefComplaint}`
        + (canSwap ? " (swap with current patient)" : ""));
      rows.push(row);
    });

    /* Empty rows keep wall/scene art at reduced emphasis (doc 7). */
    for (let i = state.waiting.length; i < rowCount; i++) {
      const emptySlot = document.createElement("div");
      emptySlot.className = "queue-slot-empty";
      const background = document.createElement("img");
      background.className = "queue-background";
      background.alt = "";
      const backgroundKey = assets.waitingBackgroundKeys[
        i % assets.waitingBackgroundKeys.length];
      background.src = assets.game.waitingBackgrounds[backgroundKey];
      const frame = document.createElement("span");
      frame.className = "queue-cell-frame";
      emptySlot.append(background, frame);
      rows.push(emptySlot);
    }

    ui.waitingPanel.replaceChildren(...rows);
  }

  /* ----------------------------------------------------------------------
     5c. The unified patient chart (design change 2026-08-04).
     One builder maps a canonical patient record to the info cards; outer
     setting wrappers decide the look. This phase uses the transparent
     panel setting; the Coach clipboard setting reuses the same builder.
     ------------------------------------------------------------------- */

  const VITAL_DISPLAY_ORDER = [
    { vitalKey: "hr", label: "HR" },
    { vitalKey: "bp", label: "BP" },
    { vitalKey: "rr", label: "RR" },
    { vitalKey: "spo2", label: "SpO2" },
    { vitalKey: "temp", label: "TEMP" },
    { vitalKey: "pain", label: "PAIN" }
  ];

  function buildPatientChart(patientRecord, chartContext, portraitUrl) {
    const presentation = patientRecord.patient.presentation;
    const chart = document.createElement("div");
    chart.className = "patient-chart";

    /* Scene: nameplate, portrait, complaint chip. */
    const scene = document.createElement("div");
    scene.className = "chart-scene";

    const nameplate = document.createElement("p");
    nameplate.className = "chart-nameplate";
    const nameText = document.createElement("strong");
    nameText.textContent = presentation.personal.name.toUpperCase();
    const ageSex = document.createElement("span");
    ageSex.textContent =
      `${presentation.personal.age} ${presentation.personal.sex}`;
    nameplate.append(nameText, ageSex);

    const portrait = document.createElement("img");
    portrait.className = "chart-portrait";
    portrait.alt = "";
    portrait.src = portraitUrl;
    /* Honor authored image metadata: mirroring and artist scale. This is
       schema data, not pixel-sniffing, so it does not violate the
       CSS-owns-geometry rule. */
    const image = presentation.image || {};
    const flip = image.imageFlipped ? " scaleX(-1)" : "";
    const scaleFactor = typeof image.imageScale === "number"
      ? image.imageScale : 1;
    portrait.style.transform =
      `translateX(-50%)${flip} scale(${scaleFactor})`;

    const complaintChip = document.createElement("p");
    complaintChip.className = "chart-complaint";
    complaintChip.textContent = presentation.chiefComplaint;

    /* The nameplate and complaint are their own boxes above and below the
       scene (John's 2026-08-04 panel review), so nothing overlays the
       portrait - an injured foot stays visible. */
    scene.append(portrait);

    /* Quote card: kicker header plus the italic quotation. */
    const quote = document.createElement("div");
    quote.className = "chart-quote";
    const quoteKicker = document.createElement("small");
    quoteKicker.textContent = "PATIENT QUOTE";
    const quoteBody = document.createElement("p");
    quoteBody.textContent = `“${presentation.quote}”`;
    quote.append(quoteKicker, quoteBody);

    /* Vitals: 3 x 2 tiles; authored colors only (doc 4). Icon slots are
       ready but empty until John's generated icons arrive. */
    const vitals = document.createElement("div");
    vitals.className = "chart-vitals";
    for (const { vitalKey, label } of VITAL_DISPLAY_ORDER) {
      const vital = presentation.vitals[vitalKey];
      const tile = document.createElement("p");
      tile.className = "vital-tile";
      const tileLabel = document.createElement("small");
      tileLabel.textContent = label;
      const tileValue = document.createElement("strong");
      tileValue.textContent = String(vital.value);
      tileValue.className = "vital-value is-" + vital.color;
      tile.append(tileLabel, tileValue);
      tile.setAttribute("aria-label", `${label} ${vital.value}`);
      vitals.append(tile);
    }

    /* Triage note card. No clip hardware: the chart itself is the
       clipboard, so drawing another clip here was redundant (John). */
    const note = document.createElement("div");
    note.className = "chart-note";
    const noteKicker = document.createElement("small");
    noteKicker.textContent = "TRIAGE NOTE";
    const noteBody = document.createElement("p");
    noteBody.textContent = presentation.triageNote;
    note.append(noteKicker, noteBody);

    chart.append(nameplate, scene, complaintChip, quote, vitals, note);

    /* Slim ANSWER/CLINICAL strips: the panel setting's compact stand-ins
       for the full chart sections. They open with Coach in a later phase. */
    if (chartContext.showSectionStrips) {
      const answerStrip = document.createElement("p");
      answerStrip.className = "chart-strip chart-strip--answer";
      answerStrip.textContent = "ANSWER — LOCKED";
      const clinicalStrip = document.createElement("p");
      clinicalStrip.className = "chart-strip chart-strip--clinical";
      clinicalStrip.textContent = "CLINICAL INFORMATION";
      chart.append(answerStrip, clinicalStrip);
    }

    return chart;
  }

  function renderPatient(state, portraitUrlFor) {
    const hasActivePatient = state.active !== null;
    ui.patientEmptyState.hidden = hasActivePatient;
    ui.patientEmptyHint.hidden = !state.settings.hints;

    if (!hasActivePatient) {
      ui.patientChartMount.replaceChildren();
      return;
    }

    const record = window.TRIAGE_RUSH_PATIENTS_BY_ID[state.active.patientId];
    /* Panel setting shows presentation only; ANSWER and CLINICAL appear
       in the Coach and review settings of the same chart (John, 2026-08-04). */
    const chart = buildPatientChart(
      record,
      { setting: "panel", showSectionStrips: false },
      portraitUrlFor(state.active.patientId));
    ui.patientChartMount.replaceChildren(chart);
  }

  /* ----------------------------------------------------------------------
     5d. Seven-room door rail. Assignment behavior arrives in the next
     phase; this renders the accepted closed-door artwork.
     ------------------------------------------------------------------- */

  const ROOM_ACCESSIBLE_NAMES = {
    "esi-1": "ESI 1 Resuscitation room",
    "esi-2": "ESI 2 Emergent room",
    "esi-3": "ESI 3 Urgent room",
    "esi-4": "ESI 4 Less urgent room",
    "esi-5": "ESI 5 Non-urgent room",
    "psych": "Psych room",
    "discharge": "Discharge"
  };

  function renderRooms(state) {
    const assets = window.TRIAGE_RUSH_ASSETS;
    const rows = [];
    for (const roomKey of assets.roomKeys) {
      const room = document.createElement("button");
      room.type = "button";
      room.className = "room-choice";
      room.dataset.roomKey = roomKey;
      room.setAttribute("aria-label", ROOM_ACCESSIBLE_NAMES[roomKey]);

      const door = document.createElement("img");
      door.className = "door-art";
      door.alt = "";
      door.src = assets.game.doors[roomKey].closed;

      room.append(door);
      rows.push(room);
    }
    ui.roomsPanel.replaceChildren(...rows);
  }

  /* ----------------------------------------------------------------------
     6. SHIFT REVIEW rendering (skeleton).
     ------------------------------------------------------------------- */

  function renderReview(state) {
    ui.reviewEyebrow.textContent = state.settings.mode === "rush"
      ? "TRIAGE RUSH COMPLETE"
      : "TRIAGE SHIFT COMPLETE";
    ui.reviewPlayerLine.textContent =
      `${state.player.title} ${state.player.initials}`;
    const totals = GAME.selectScoreTotals(state);
    ui.reviewScoreLine.textContent = `SCORE: ${totals.score}`;
  }

  /* ----------------------------------------------------------------------
     Exports
     ------------------------------------------------------------------- */

  window.TRIAGE_RUSH_UI = {
    ui,
    renderShellView,
    renderHomeBoardSummaries,
    renderLoadingStatus,
    openPopup,
    closePopup,
    isPopupOpen,
    readSettingsControls,
    renderModeLengthVisibility,
    showMusicStatusNote,
    renderWaiting,
    buildPatientChart,
    renderPatient,
    renderRooms,
    renderGameHeader,
    renderConfirmQuit,
    renderArrivingOverlay,
    renderReview
  };

})();
