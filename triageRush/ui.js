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
    "confirmQuitAccept", "confirmStopOverlay", "confirmStopCancel",
    "confirmStopAccept",
    // GAME
    "gameView", "gameBrand", "gameScorecard", "scoreCorrect",
    "scoreCloseDivider", "scoreClose", "scoreWrong", "scoreTotal",
    "gameTimer", "gameSoundButton", "waitingPanel", "patientPanel",
    "patientChartMount", "patientPanelHitButton", "patientEmptyState",
    "patientEmptyHint", "resultToast", "countdownNumeral", "roomsPanel",
    "quitGameButton", "stopGameButton",
    // Chart
    "chartOverlay", "chartClipboard", "chartCloseButton", "chartScroll",
    "chartOverlayMount", "chartMoreAbove", "chartMoreBelow", "chartZoomView",
    "chartTimer", "chartTimerValue",
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
    /* The clipboard header's clock mirrors the same value, so the time
       stays readable while the chart is open (John, 2026-08-05). */
    ui.chartTimerValue.textContent = formatClock(state.shift.remainingMs);

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

  function renderConfirmStop(state) {
    ui.confirmStopOverlay.hidden = state.overlay !== "confirm-stop";
    if (state.overlay === "confirm-stop") {
      ui.confirmStopCancel.focus();
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

    /* A queue tap is always legal during play: it selects into an empty
       center (finalizing any assigned case first) or swaps with an
       unassigned active patient (Phase 5). */
    const canSelect = state.active === null;
    const canSwap = state.active !== null;
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
     panel setting; the Chart clipboard setting reuses the same builder.
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
    chart.className = "patient-chart chart--" + chartContext.setting;

    /* Scene: nameplate, portrait, complaint chip. */
    const scene = document.createElement("div");
    scene.className = "chart-scene";

    const nameplate = document.createElement("p");
    nameplate.className = "chart-nameplate";
    const nameText = document.createElement("strong");
    nameText.textContent = presentation.personal.name.toUpperCase();
    const ageSex = document.createElement("span");
    ageSex.textContent =
      `age ${presentation.personal.age} · ${presentation.personal.sex}`;
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

    /* The presentation cards are always visible in every setting; the
       panel shows nothing else (John, 2026-08-04 addendum). */
    chart.append(nameplate, scene, complaintChip, quote, vitals, note);
    if (chartContext.setting !== "clipboard") return chart;

    /* In the chart overlay the photo zooms. The hit box is the scene's
       top-right quadrant (John, 2026-08-05): one transparent button
       covering that quarter, showing the small magnifier badge in its
       corner. app.js handles data-chart-zoom clicks. */
    const zoomButton = document.createElement("button");
    zoomButton.type = "button";
    zoomButton.className = "chart-zoom-button";
    zoomButton.dataset.chartZoom = "open";
    zoomButton.setAttribute("aria-label", "See a larger photo");
    const zoomBadge = document.createElement("span");
    zoomBadge.className = "chart-zoom-badge";
    zoomBadge.textContent = "🔍";
    zoomBadge.setAttribute("aria-hidden", "true");
    zoomButton.append(zoomBadge);
    scene.append(zoomButton);

    /* Chart setting adds locked ANSWER and remembered CLINICAL (doc 3).
       No PRESENTATION header: the evidence is always shown and expanded,
       so a header would only take space (John, 2026-08-05). Section
       headers are real buttons with aria-expanded (doc 7); app.js
       toggles them by delegation on data-chart-section. */
    chart.append(
      buildChartSectionHeader("answer", "ANSWER", { locked: true }),
      buildChartSectionHeader("clinical", "CLINICAL",
        { expanded: chartContext.clinicalExpanded }),
      buildClinicalSectionBody(patientRecord.patient.clinical,
        chartContext.clinicalExpanded));

    return chart;
  }

  /* One section header button. Locked (Answer during play) renders the
     LOCKED pill and stays aria-expanded="false"; activating it only
     shakes (handled in app.js) - it never opens (doc 3). */
  function buildChartSectionHeader(sectionKey, labelText, options) {
    const header = document.createElement("button");
    header.type = "button";
    header.className =
      "chart-section-header chart-section-header--" + sectionKey;
    header.dataset.chartSection = sectionKey;

    const label = document.createElement("span");
    label.textContent = labelText;
    header.append(label);

    if (options.locked) {
      header.classList.add("is-locked");
      header.setAttribute("aria-expanded", "false");
      const lockBadge = document.createElement("span");
      lockBadge.className = "chart-lock-badge";
      lockBadge.textContent = "LOCKED";
      header.append(lockBadge);
      header.setAttribute("aria-label", labelText
        + " (locked while the patient is under evaluation)");
    } else {
      header.setAttribute("aria-expanded",
        String(Boolean(options.expanded)));
      const chevron = document.createElement("span");
      chevron.className = "chart-section-chevron";
      /* U+25BE has no emoji variant, so phones render it as plain text. */
      chevron.textContent = "▾";
      chevron.setAttribute("aria-hidden", "true");
      header.append(chevron);
    }
    return header;
  }

  /* The Clinical body renders schema 2.2's display-ready clinical
     interpretation. The authored content deliberately never names the
     correct ESI or room (doc 5), so showing all of it is safe pre-answer. */
  function buildClinicalSectionBody(clinical, startExpanded) {
    const body = document.createElement("div");
    body.className = "chart-section-body chart-clinical-body";
    body.hidden = !startExpanded;

    const addTextCard = (kickerText, bodyText) => {
      if (typeof bodyText !== "string" || bodyText.length === 0) return;
      const card = document.createElement("div");
      card.className = "chart-clinical-card";
      const kicker = document.createElement("small");
      kicker.textContent = kickerText;
      const text = document.createElement("p");
      text.textContent = bodyText;
      card.append(kicker, text);
      body.append(card);
    };

    const addListCard = (kickerText, items) => {
      if (!Array.isArray(items) || items.length === 0) return;
      const card = document.createElement("div");
      card.className = "chart-clinical-card";
      const kicker = document.createElement("small");
      kicker.textContent = kickerText;
      const list = document.createElement("ul");
      for (const itemText of items) {
        const item = document.createElement("li");
        item.textContent = String(itemText);
        list.append(item);
      }
      card.append(kicker, list);
      body.append(card);
    };

    addTextCard("SUMMARY", clinical.summary);
    addTextCard("WHY THIS ACUITY", clinical.acuityReason);
    addListCard("KEY FINDINGS", clinical.keyFindings);
    addListCard("EXPECTED RESOURCES", clinical.expectedResources);
    if (Array.isArray(clinical.redFlags) && clinical.redFlags.length > 0) {
      addListCard("RED FLAGS", clinical.redFlags);
    } else {
      addTextCard("RED FLAGS", "None identified.");
    }
    addListCard("TEACHING POINTS", clinical.teachingPoints);
    const outcome = clinical.possibleClinicalOutcome;
    if (outcome) {
      addListCard("POSSIBLE DIAGNOSES", outcome.possibleDiagnoses);
      addTextCard("LIKELY DISPOSITION", outcome.disposition);
    }
    return body;
  }

  /* The empty-state hint always offers the queue; when a patient waits
     behind an open door it adds the recall option (John, 2026-08-04). */
  /* "◀━━" fuses an arrowhead with heavy line-drawing shafts into one
     solid arrow (negative letter-spacing closes the glyph gaps). */
  function buildHintLine(arrowText, labelText, arrowFirst) {
    const line = document.createElement("span");
    line.className = "hint-line";
    const arrow = document.createElement("span");
    arrow.className = "hint-arrow "
      + (arrowFirst ? "hint-arrow--left" : "hint-arrow--right");
    arrow.textContent = arrowText;
    arrow.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.textContent = labelText;
    line.append(...(arrowFirst ? [arrow, label] : [label, arrow]));
    return line;
  }

  function renderEmptyStateHint(state) {
    /* ︎ forces plain text glyphs - without it, phones render the
       triangles as boxed emoji arrows. */
    const lines = [
      buildHintLine("◀︎━━", "TAP A WAITING ROOM PATIENT", true)
    ];
    if (state.recallAvailable) {
      const orLine = document.createElement("span");
      orLine.className = "patient-empty-hint-or";
      orLine.textContent = "or";
      lines.push(
        orLine,
        buildHintLine("━━▶︎",
          "TAP THE TRIAGE ROOM DOOR TO RECALL THAT PATIENT", false));
    }
    ui.patientEmptyHint.replaceChildren(...lines);
  }

  function renderPatient(state, portraitUrlFor) {
    const hasActivePatient = state.active !== null;
    ui.patientEmptyState.hidden = hasActivePatient;
    ui.patientEmptyHint.hidden = !state.settings.hints;
    /* The whole occupied panel is the one Chart hit target; when the
       panel is empty the target is absent and Chart cannot open (doc 7). */
    ui.patientPanelHitButton.hidden = !hasActivePatient;

    if (!hasActivePatient) {
      ui.patientChartMount.replaceChildren();
      renderEmptyStateHint(state);
      return;
    }

    const record = window.TRIAGE_RUSH_PATIENTS_BY_ID[state.active.patientId];
    /* Panel setting shows presentation only; ANSWER and CLINICAL appear
       in the Chart and review settings of the same chart (John, 2026-08-04). */
    const chart = buildPatientChart(
      record,
      { setting: "panel" },
      portraitUrlFor(state.active.patientId));
    ui.patientChartMount.replaceChildren(chart);
  }

  /* ----------------------------------------------------------------------
     5f. Chart overlay (Phase 6).
     The clipboard setting of the SAME chart builder. Rendering only
     mounts the chart; open/close legality, pause reasons, and focus
     moves live in game.js and app.js.
     ------------------------------------------------------------------- */

  function renderChartOverlay(state, portraitUrlFor) {
    const isOpen = state.overlay === "chart" && state.active !== null;
    ui.chartOverlay.hidden = !isOpen;
    if (!isOpen) {
      ui.chartOverlayMount.replaceChildren();
      return;
    }

    const record = window.TRIAGE_RUSH_PATIENTS_BY_ID[state.active.patientId];
    const chart = buildPatientChart(
      record,
      { setting: "clipboard", clinicalExpanded: state.chart.clinicalExpanded },
      portraitUrlFor(state.active.patientId));
    ui.chartOverlayMount.replaceChildren(chart);
    /* Each open starts at the top of the paper, photo zoom closed. */
    ui.chartScroll.scrollTop = 0;
    renderChartPortraitZoom(state, portraitUrlFor, false);
  }

  /* The larger-photo view: a dark scrim over the whole clipboard with
     one square photo card on it - just the photo and its close box, no
     name section (John, 2026-08-05). Reads unmistakably as "a zoomed
     photo to look at, then close". Ephemeral like the section toggles -
     it resets closed every time the chart opens. */
  function renderChartPortraitZoom(state, portraitUrlFor, isOpen) {
    ui.chartZoomView.hidden = !isOpen;
    if (!isOpen || state.active === null) {
      ui.chartZoomView.replaceChildren();
      return;
    }

    const record = window.TRIAGE_RUSH_PATIENTS_BY_ID[state.active.patientId];
    const personal = record.patient.presentation.personal;

    const card = document.createElement("div");
    card.className = "chart-zoom-card";

    const image = document.createElement("img");
    image.className = "chart-zoom-image";
    image.alt = `Large photo of ${personal.name}`;
    image.src = portraitUrlFor(state.active.patientId);
    /* Honor the authored mirroring so the pose matches the small view;
       the artist scale stays off - here the photo fits the frame. */
    const imageMeta = record.patient.presentation.image || {};
    if (imageMeta.imageFlipped) image.classList.add("is-flipped");

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "chart-zoom-close";
    closeButton.setAttribute("aria-label", "Close the larger photo");
    closeButton.textContent = "✕";

    card.append(image, closeButton);
    ui.chartZoomView.replaceChildren(card);
  }

  /* ----------------------------------------------------------------------
     5d. Seven-room door rail (Phase 5).
     Exactly one door is open: the assigned patient's. While recall is
     legal that door also carries the orange leftward recall arrow.
     Clicks are delegated in app.js (assign or recall).
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
      const isOpen =
        state.assigned !== null && state.assigned.roomKey === roomKey;

      const room = document.createElement("button");
      room.type = "button";
      room.className = "room-choice" + (isOpen ? " is-open" : "");
      room.dataset.roomKey = roomKey;
      /* The occupied door keeps a steady halo in its outcome color until
         the room closes again (John, 2026-08-04). The ledger always has
         this patient's record because assignment created it. */
      if (isOpen) {
        const outcome =
          state.ledger.byPatientId[state.assigned.patientId].outcome;
        room.classList.add("is-outcome-" + outcome);
      }
      room.setAttribute("aria-label", isOpen
        ? `Recall patient from ${ROOM_ACCESSIBLE_NAMES[roomKey]}`
        : ROOM_ACCESSIBLE_NAMES[roomKey]);

      const door = document.createElement("img");
      door.className = "door-art";
      door.alt = "";
      door.src = isOpen
        ? assets.game.doors[roomKey].open
        : assets.game.doors[roomKey].closed;
      room.append(door);

      if (isOpen && state.recallAvailable) {
        const recallArrow = document.createElement("span");
        recallArrow.className = "room-recall-arrow";
        /* Variation selector forces the plain glyph, not boxed emoji. */
        recallArrow.textContent = "◀︎"; // leftward arrow into the center
        recallArrow.setAttribute("aria-hidden", "true");
        room.append(recallArrow);
      }

      rows.push(room);
    }
    ui.roomsPanel.replaceChildren(...rows);
  }

  /* ----------------------------------------------------------------------
     5e. Assignment feedback: pulse on the selected door only, plus the
     transient result toast over the center panel. app.js owns the timer
     that clears it (rendering never starts timers - doc 4).
     ------------------------------------------------------------------- */

  const OUTCOME_FEEDBACK_TEXT = {
    correct: "✓ CORRECT",  // ✓
    close: "△ CLOSE",      // △
    wrong: "✕ WRONG"       // ✕
  };

  function showAssignmentFeedback(outcome, roomKey) {
    clearAssignmentFeedback();
    const door = ui.roomsPanel.querySelector(
      `[data-room-key="${roomKey}"]`);
    if (door) door.classList.add("is-feedback-" + outcome);
    ui.resultToast.textContent = OUTCOME_FEEDBACK_TEXT[outcome];
    ui.resultToast.className = "result-toast is-" + outcome;
    ui.resultToast.hidden = false;
  }

  function clearAssignmentFeedback() {
    ui.resultToast.hidden = true;
    for (const pulsingDoor of ui.roomsPanel.querySelectorAll(
      ".is-feedback-correct, .is-feedback-close, .is-feedback-wrong")) {
      pulsingDoor.classList.remove(
        "is-feedback-correct", "is-feedback-close", "is-feedback-wrong");
    }
  }

  /* A full waiting room refusing a RUSH arrival: the queue column shakes
     once, silently (doc 3: blocked arrivals shake but make no sound).
     Same restart idiom as the numerals; reduced motion shortens it. */
  function showWaitingBlockedShake() {
    ui.waitingPanel.classList.remove("is-arrival-blocked");
    void ui.waitingPanel.offsetWidth; /* restart the animation */
    ui.waitingPanel.classList.add("is-arrival-blocked");
  }

  /* ----------------------------------------------------------------------
     5f. RUSH final countdown numerals (Phase 7). Each numeral 10..1 pops
     quickly and fades in place over about half a second, one third down
     over the patient image (doc 7). The animation runs once per call;
     removing and re-adding the class restarts it for the next numeral.
     CSS clears it to invisible when the animation ends, so nothing here
     needs a timer (doc 4: rendering never starts timers).
     ------------------------------------------------------------------- */

  function showCountdownNumeral(numeralValue) {
    ui.countdownNumeral.textContent = String(numeralValue);
    ui.countdownNumeral.classList.remove("is-popping");
    void ui.countdownNumeral.offsetWidth; /* restart the animation */
    ui.countdownNumeral.classList.add("is-popping");
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
    renderChartOverlay,
    renderChartPortraitZoom,
    renderRooms,
    showAssignmentFeedback,
    clearAssignmentFeedback,
    showWaitingBlockedShake,
    showCountdownNumeral,
    renderGameHeader,
    renderConfirmQuit,
    renderConfirmStop,
    renderArrivingOverlay,
    renderReview
  };

})();
