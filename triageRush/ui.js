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
    "aboutBoardContent", "playerTitleWheel", "playerInitialsWheels",
    "triageLengthOptions", "rushLengthOptions", "musicStatusNote",
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
    "reviewView", "reviewModeLine", "reviewProvider",
    "reviewDate", "reviewDuration", "reviewDurationNote", "reviewSeen",
    "reviewScoreValue", "reviewFormulas", "reviewUnder", "reviewOver",
    "reviewUnderButton", "reviewOverButton",
    "patientsSeenButton", "returnToLobbyButton",
    "shiftOverOverlay", "shiftOverHeadline", "shiftOverCount",
    // Patients Seen browser
    "patientsSeenOverlay", "seenPositionValue",
    "seenPreviousButton", "seenNextButton", "seenCloseButton",
    "seenScroll", "seenMount", "seenZoomView",
    "seenMoreAbove", "seenMoreBelow"
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

  /* Kept for the summary-board design (2026-08-07): the boards are blank
     for now, and this is the label they showed - "5:00", "60s". */
  function formatShiftLengthLabel(state) {
    const seconds = GAME.selectedShiftLengthSeconds(state);
    if (seconds >= 60 && seconds % 60 === 0) {
      return `${seconds / 60}:00`;
    }
    return `${seconds}s`;
  }

  /* The sidewalk summary boards are deliberately BLANK (John,
     2026-08-07): the detail boards now carry the letter-board look, and
     the summaries get their own design pass. The boards still open the
     settings; only their lettering is held back. When the summary design
     lands, fill these same lines - the values each one wants are already
     one expression away, kept here as the comments below.  */
  function renderHomeBoardSummaries(state) {
    ui.playerBoardTitleLine.textContent = "";       // state.player.title
    ui.playerBoardInitialsLine.textContent = "";    // state.player.initials

    ui.shiftBoardModeLine.textContent = "";         // mode name
    ui.shiftBoardDifficultyLine.textContent = "";   // difficulty
    ui.shiftBoardLengthLine.textContent = "";       // formatShiftLengthLabel
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
      isPlayer ? "Player name" : isShift ? "Game options" : "About");

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

  /* ---- PLAYER NAME odometer drums (TODO 3, 2026-08-07) ----------------
     One drum per value. Two ways to change it, and neither ever raises a
     keyboard: the chevrons step with wrap-around, and tapping the value
     opens the platform's own picker (an invisible <select> over the
     window). The drums are rebuilt on every open, and the wheels the
     build hands back are what readSettingsControls reads. */

  const CHEVRON_UP =
    '<svg viewBox="0 0 22 14" aria-hidden="true"><path d="M3 11 L11 3 L19 11"/></svg>';
  const CHEVRON_DOWN =
    '<svg viewBox="0 0 22 14" aria-hidden="true"><path d="M3 3 L11 11 L19 3"/></svg>';

  /* { title, initials: [wheel, wheel, wheel] }, rebuilt on each open. */
  let playerWheels = null;

  function buildWheel(mountElement, values, startValue, pickerLabel) {
    let index = Math.max(0, values.indexOf(startValue));
    const count = values.length;
    const valueAt = (offset) => values[(index + offset + count) % count];

    mountElement.replaceChildren();

    const stepUpButton = document.createElement("button");
    stepUpButton.type = "button";
    stepUpButton.className = "wheel-step";
    stepUpButton.innerHTML = CHEVRON_UP;
    stepUpButton.setAttribute("aria-label", `${pickerLabel}: previous`);

    const bezel = document.createElement("div");
    bezel.className = "wheel-bezel";
    const windowElement = document.createElement("div");
    windowElement.className = "wheel-window";
    const drum = document.createElement("div");
    drum.className = "wheel-drum";
    windowElement.append(drum);
    bezel.append(windowElement);

    const picker = document.createElement("select");
    picker.className = "wheel-select";
    picker.setAttribute("aria-label", pickerLabel);
    /* Named so it is a proper form field (nothing reads it by name). */
    picker.name = "playerWheel-" + pickerLabel.replace(/\s+/g, "-").toLowerCase();
    for (const value of values) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      picker.append(option);
    }
    picker.value = values[index];
    picker.addEventListener("change", () => {
      index = Math.max(0, values.indexOf(picker.value));
      renderDrum();
    });
    windowElement.append(picker);

    const stepDownButton = document.createElement("button");
    stepDownButton.type = "button";
    stepDownButton.className = "wheel-step";
    stepDownButton.innerHTML = CHEVRON_DOWN;
    stepDownButton.setAttribute("aria-label", `${pickerLabel}: next`);

    /* Three cells: the value above peeking, the current one, the value
       below peeking. Rebuilt on every step - simpler than moving a long
       strip, and the roll animation covers the swap. */
    function renderDrum() {
      drum.replaceChildren();
      for (const offset of [-1, 0, 1]) {
        const cell = document.createElement("div");
        cell.className = "drum-cell" + (offset === 0 ? "" : " drum-cell--peek");
        cell.textContent = valueAt(offset);
        drum.append(cell);
      }
    }

    function step(direction) {
      index = (index + direction + count) % count;
      picker.value = values[index];
      renderDrum();
      drum.className = "wheel-drum " + (direction > 0 ? "roll-down" : "roll-up");
      /* Restart the animation even on rapid taps: clearing the property
         and reading a layout value forces the browser to start over. */
      drum.style.animation = "none";
      void drum.offsetWidth;
      drum.style.animation = "";
    }

    stepUpButton.addEventListener("click", () => step(-1));
    stepDownButton.addEventListener("click", () => step(1));

    renderDrum();
    mountElement.append(stepUpButton, bezel, stepDownButton);

    return { value: () => values[index] };
  }

  function buildPlayerWheels(state) {
    const constants = GAME.GAME_CONSTANTS;
    const symbols = GAME.initialsSymbols(state.player.initials);

    const title = buildWheel(ui.playerTitleWheel,
      constants.PLAYER_TITLES, state.player.title, "Title");

    /* Always three drums, even if a stored name is shorter. */
    ui.playerInitialsWheels.replaceChildren();
    const initials = [];
    for (let position = 0; position < constants.INITIALS_LENGTH; position += 1) {
      const mountElement = document.createElement("div");
      mountElement.className = "wheel";
      ui.playerInitialsWheels.append(mountElement);
      initials.push(buildWheel(mountElement, constants.INITIAL_SYMBOLS,
        symbols[position] || "A", `Initial ${position + 1}`));
    }

    playerWheels = { title, initials };
  }

  /* Copy current state into the form controls (both boards at once; only
     one is visible, and reading them back together keeps apply simple). */
  function fillSettingsControls(state) {
    buildPlayerWheels(state);

    setRadioGroup("settingMode", state.settings.mode);
    setRadioGroup("settingDifficulty", state.settings.difficulty);
    setRadioGroup("settingTriageLength",
      String(state.settings.triageLengthSeconds));
    setRadioGroup("settingRushLength",
      String(state.settings.rushLengthSeconds));

    setRadioGroup("settingSoundGlobal",
      state.settings.soundGlobal ? "on" : "off");
    setRadioGroup("settingGameLoudness", state.settings.gameLoudness);
    setRadioGroup("settingMusicLoudness", state.settings.musicLoudness);

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
    ui.triageLengthOptions.hidden = mode !== "triage";
    ui.rushLengthOptions.hidden = mode !== "rush";
  }

  /* Read the form controls back into candidate player/settings objects.
     Validation happens in game.js applySettings, not here. */
  function readSettingsControls(state) {
    /* The drums exist only while a board has been opened; before that,
       the stored name is the answer. */
    const initials = playerWheels
      ? playerWheels.initials.map((wheel) => wheel.value()).join("")
      : state.player.initials;

    return {
      player: {
        title: playerWheels ? playerWheels.title.value() : state.player.title,
        initials: GAME.normalizeInitials(initials, state.player.initials)
      },
      settings: {
        mode: getRadioGroup("settingMode"),
        difficulty: getRadioGroup("settingDifficulty"),
        triageLengthSeconds: Number(getRadioGroup("settingTriageLength")),
        rushLengthSeconds: Number(getRadioGroup("settingRushLength")),
        soundGlobal: getRadioGroup("settingSoundGlobal") === "on",
        gameLoudness: getRadioGroup("settingGameLoudness"),
        musicLoudness: getRadioGroup("settingMusicLoudness")
      }
    };
  }

  /* The sound choices as they stand ON THE BOARD right now - which is
     not what state says until apply. Auditioning a level has to follow
     the pending selections, including a pending GLOBAL SOUND off
     (2026-08-07). */
  function pendingSoundSelections() {
    return {
      soundGlobal: getRadioGroup("settingSoundGlobal") === "on",
      gameLoudness: getRadioGroup("settingGameLoudness"),
      musicLoudness: getRadioGroup("settingMusicLoudness")
    };
  }

  /* Used when a music audition fails: the board goes back to OFF without
     anything being persisted. */
  function setPendingMusicLoudness(value) {
    setRadioGroup("settingMusicLoudness", value);
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
    /* The brand is static markup in index.html - "Triage RUSH!" in every
       mode (John, 2026-08-06) - so the header renders only the live
       numbers. */

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

    /* The icon IS the GLOBAL SOUND setting (John, 2026-08-07) - one
       persisted value seen twice, here and on the settings board. */
    const soundOn = state.settings.soundGlobal;
    ui.gameSoundButton.classList.toggle("is-muted", !soundOn);
    ui.gameSoundButton.textContent = soundOn ? "♪" : "×";
    ui.gameSoundButton.setAttribute("aria-label",
      soundOn ? "Mute sounds" : "Unmute sounds");
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

  /* Room names as a reader sees them on the review chart. The longer
     ROOM_ACCESSIBLE_NAMES strings in 5d are written for screen readers;
     these are written to sit in a sentence. */
  const ROOM_DISPLAY_NAMES = {
    "esi-1": "ESI 1 · Resuscitation",
    "esi-2": "ESI 2 · Emergent",
    "esi-3": "ESI 3 · Urgent",
    "esi-4": "ESI 4 · Less urgent",
    "esi-5": "ESI 5 · Non-urgent",
    "psych": "Psych",
    "discharge": "Discharge"
  };

  const OUTCOME_DISPLAY_NAMES = {
    correct: "CORRECT",
    close: "CLOSE",
    wrong: "WRONG"
  };

  /* The same three glyphs the in-game result toast uses (5e), so a mark
     on the review chart means what it meant during play. U+FE0E keeps
     the triangle a plain character instead of a boxed emoji on iPhones.
     Wrong is a MINUS (U+2212, no emoji form), not a cross (John,
     2026-08-06): it reads as the -50 deduction, and a red ✕ was too
     easily confused with the red close box now that the review photo
     is also a tap target. */
  const OUTCOME_MARK_GLYPHS = {
    correct: "✓",
    close: "△︎",
    wrong: "−"
  };

  /* Temperatures are authored in CELSIUS (all 160 records sit between
     36.2 and 41.2). John's format, 2026-08-07: show both, Celsius first,
     as "37.0 / 98.6" - compact, and obvious to anyone medical. The
     stored record is never touched; this is display only. */
  function formatTemperature(celsius) {
    if (typeof celsius !== "number") return String(celsius);
    const fahrenheit = celsius * 9 / 5 + 32;
    return `${celsius.toFixed(1)} / ${fahrenheit.toFixed(1)}`;
  }

  const VITAL_DISPLAY_ORDER = [
    { vitalKey: "hr", label: "HR" },
    { vitalKey: "bp", label: "BP" },
    { vitalKey: "rr", label: "RR" },
    { vitalKey: "spo2", label: "SpO2" },
    { vitalKey: "temp", label: "TEMP C/F" },
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

    /* Vitals: 3 x 2 tiles; authored colors only (doc 4). Each tile is
       variant A from _mockups/vitals-icons-mockup.html (2026-08-06):
       icon on the left, label-over-value stack on the right. Icons are
       <use> stamps of the vital-icon-* defs in index.html. */
    const vitals = document.createElement("div");
    vitals.className = "chart-vitals";
    const SVG_NS = "http://www.w3.org/2000/svg";
    for (const { vitalKey, label } of VITAL_DISPLAY_ORDER) {
      const vital = presentation.vitals[vitalKey];
      const tile = document.createElement("p");
      tile.className = "vital-tile";

      const icon = document.createElementNS(SVG_NS, "svg");
      icon.setAttribute("viewBox", "0 0 24 24");
      icon.setAttribute("class", "vital-icon");
      icon.setAttribute("aria-hidden", "true");
      const iconRef = document.createElementNS(SVG_NS, "use");
      iconRef.setAttribute("href", "#vital-icon-" + vitalKey);
      icon.append(iconRef);

      const stack = document.createElement("span");
      stack.className = "vital-stack";
      const tileLabel = document.createElement("small");
      tileLabel.textContent = label;
      const tileValue = document.createElement("strong");
      const displayValue = vitalKey === "temp"
        ? formatTemperature(vital.value)
        : String(vital.value);
      tileValue.textContent = displayValue;
      tileValue.className = "vital-value is-" + vital.color;
      stack.append(tileLabel, tileValue);
      tile.append(icon, stack);
      tile.setAttribute("aria-label", vitalKey === "temp"
        ? `${label} ${displayValue} degrees Celsius / Fahrenheit`
        : `${label} ${vital.value}`);
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
    if (chartContext.setting === "panel") return chart;

    /* Review (Patients Seen): the shift is over, so nothing is secret.
       Answer and Clinical are both unlocked and start expanded (doc 5).
       Toggling them here is deliberately DOM-only - review expansion is
       separate from the shift's Clinical preference (doc 5). */
    if (chartContext.setting === "review") {
      /* The outcome stamped on the photo itself (John, 2026-08-05): the
         player sees how the case went before reading a word. Same three
         glyphs as the Answer mark and the in-game toast, modestly larger
         (about 1.4x - kept unobtrusive, John 2026-08-06), in the photo's
         bottom-right corner. */
      if (chartContext.ledgerRecord) {
        const outcome = chartContext.ledgerRecord.outcome;
        const badge = document.createElement("span");
        badge.className = "chart-outcome-badge is-outcome-" + outcome;
        badge.textContent = OUTCOME_MARK_GLYPHS[outcome] || "";
        badge.setAttribute("aria-hidden", "true");
        scene.append(badge);
      }
      /* The photo zooms here too (John, 2026-08-06) - appended AFTER the
         badge so the transparent hit box sits on top and a tap anywhere
         on the photo, badge included, opens the larger view. */
      appendPortraitZoomButton(scene);

      chart.append(
        buildChartSectionHeader("answer", "ANSWER", { expanded: true }),
        buildAnswerSectionBody(patientRecord, chartContext.ledgerRecord),
        buildChartSectionHeader("clinical", "CLINICAL", { expanded: true }),
        buildClinicalSectionBody(patientRecord.patient.clinical, true));
      return chart;
    }

    /* In the chart overlay the photo zooms too. */
    appendPortraitZoomButton(scene);

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

  /* The photo's zoom hit box: one transparent button covering the photo
     minus a small pad, showing the small magnifier badge in its top-right
     corner (John, 2026-08-05). Used by BOTH scrolling settings - the
     Chart overlay and the Patients Seen review browser (2026-08-06).
     app.js handles data-chart-zoom clicks per overlay. */
  function appendPortraitZoomButton(scene) {
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

  /* The Answer body exists only in the review setting - during play this
     section is locked and has no body at all. Doc 5 fixes its content:
     the player's latest choice and result from the ledger, the correct
     room and ESI from the record, and the destination rationale.

     ledgerRecord is the patient's SINGLE ledger entry, so a recalled and
     reassigned patient shows only the assignment that finally stood
     (doc 3). It is passed in rather than looked up because the chart
     builder never reads game state. */
  function buildAnswerSectionBody(patientRecord, ledgerRecord) {
    const answer = patientRecord.patient.answer;
    const body = document.createElement("div");
    body.className = "chart-section-body chart-answer-body";

    /* The verdict line: what the player picked and what it scored. */
    if (ledgerRecord) {
      const verdict = document.createElement("div");
      verdict.className =
        "chart-answer-verdict is-outcome-" + ledgerRecord.outcome;

      const choice = document.createElement("p");
      choice.className = "chart-answer-choice";
      const choiceKicker = document.createElement("small");
      choiceKicker.textContent = "YOU SENT THEM TO";

      /* The room the player picked, marked with the same glyph the
         in-game feedback toast uses for that outcome (John, 2026-08-05),
         so the review speaks the language of play. */
      const choiceLine = document.createElement("span");
      choiceLine.className = "chart-answer-choice-line";
      const mark = document.createElement("span");
      mark.className = "chart-answer-mark";
      mark.textContent = OUTCOME_MARK_GLYPHS[ledgerRecord.outcome] || "";
      mark.setAttribute("aria-hidden", "true");
      const choiceValue = document.createElement("strong");
      choiceValue.textContent =
        ROOM_DISPLAY_NAMES[ledgerRecord.roomKey] || ledgerRecord.roomKey;
      choiceLine.append(mark, choiceValue);
      choice.append(choiceKicker, choiceLine);

      const result = document.createElement("p");
      result.className = "chart-answer-result";
      const resultLabel = document.createElement("strong");
      resultLabel.textContent =
        OUTCOME_DISPLAY_NAMES[ledgerRecord.outcome] || ledgerRecord.outcome;
      const resultPoints = document.createElement("span");
      resultPoints.textContent = ledgerRecord.points > 0
        ? `+${ledgerRecord.points}`
        : String(ledgerRecord.points);
      result.append(resultLabel, resultPoints);

      verdict.append(choice, result);
      body.append(verdict);
    }

    const addCard = (kickerText, valueText) => {
      if (typeof valueText !== "string" || valueText.length === 0) return;
      const card = document.createElement("div");
      card.className = "chart-clinical-card";
      const kicker = document.createElement("small");
      kicker.textContent = kickerText;
      const text = document.createElement("p");
      text.textContent = valueText;
      card.append(kicker, text);
      body.append(card);
    };

    /* An ESI room's name already states its number, so repeating it reads
       as a stutter ("ESI 4 · Less urgent (ESI 4)"). Psych and Discharge
       carry a clinically valid ESI that the name does NOT show, and that
       is worth saying (doc 5). */
    const correctRoomName =
      ROOM_DISPLAY_NAMES[answer.correctRoom] || answer.correctRoom;
    const isEsiRoom = String(answer.correctRoom).startsWith("esi-");
    addCard("CORRECT ROOM", isEsiRoom
      ? correctRoomName
      : `${correctRoomName}  (clinically ESI ${answer.correctEsi})`);

    /* Special destinations accept more than one room, and the player
       deserves to see the whole full-credit set rather than guess why a
       different pick also counted (doc 3). Ask game.js rather than
       reading answer.otherAcceptableRooms: that field is null for every
       current patient, and the real dual-credit rule (Psych/Discharge
       also accept their underlying esi-N) is DERIVED in
       fullCreditRoomKeys. One source of truth for what scores. */
    const alsoAccepted = [...GAME.fullCreditRoomKeys(patientRecord)]
      .filter(roomKey => roomKey !== answer.correctRoom)
      .map(roomKey => ROOM_DISPLAY_NAMES[roomKey] || roomKey);
    if (alsoAccepted.length > 0) {
      addCard("ALSO FULL CREDIT", alsoAccepted.join(", "));
    }

    addCard("WHY", answer.destinationReason);
    return body;
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
          "TAP THE TRIAGE ROOM DOOR TO RECALL YOUR MOST RECENT PATIENT",
          false));
    }
    ui.patientEmptyHint.replaceChildren(...lines);
  }

  function renderPatient(state, portraitUrlFor) {
    const hasActivePatient = state.active !== null;
    ui.patientEmptyState.hidden = hasActivePatient;
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

  /* The larger-photo card: just the photo and its close box, no name
     section (John, 2026-08-05) - and deliberately NO outcome badge in
     the review browser either (John, 2026-08-06): the zoomed photo is
     for looking at the patient, not the result. Shared by both zoom
     views. */
  function buildPortraitZoomCard(patientId, portraitUrlFor) {
    const record = window.TRIAGE_RUSH_PATIENTS_BY_ID[patientId];
    const personal = record.patient.presentation.personal;

    const card = document.createElement("div");
    card.className = "chart-zoom-card";

    const image = document.createElement("img");
    image.className = "chart-zoom-image";
    image.alt = `Large photo of ${personal.name}`;
    image.src = portraitUrlFor(patientId);
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
    return card;
  }

  /* The larger-photo view: a dark scrim over the whole clipboard with
     one photo card on it. Reads unmistakably as "a zoomed photo to look
     at, then close". Ephemeral like the section toggles - it resets
     closed every time the chart opens. */
  function renderChartPortraitZoom(state, portraitUrlFor, isOpen) {
    ui.chartZoomView.hidden = !isOpen;
    if (!isOpen || state.active === null) {
      ui.chartZoomView.replaceChildren();
      return;
    }
    ui.chartZoomView.replaceChildren(
      buildPortraitZoomCard(state.active.patientId, portraitUrlFor));
  }

  /* The review browser's twin (John, 2026-08-06): same treatment over
     the Patients Seen clipboard, keyed by the patient being reviewed
     rather than the active patient. */
  function renderSeenPortraitZoom(state, portraitUrlFor, isOpen) {
    ui.seenZoomView.hidden = !isOpen;
    if (!isOpen) {
      ui.seenZoomView.replaceChildren();
      return;
    }
    const ledgerRecord = GAME.selectPatientSeenRecord(state);
    if (!ledgerRecord) {
      ui.seenZoomView.hidden = true;
      ui.seenZoomView.replaceChildren();
      return;
    }
    ui.seenZoomView.replaceChildren(
      buildPortraitZoomCard(ledgerRecord.patientId, portraitUrlFor));
  }

  /* ----------------------------------------------------------------------
     5d. Seven-room door rail (Phase 5; layered composition TODO item 7,
     2026-08-06). Each cell stacks, back to front: the rail's flat green
     (CSS), the shared wall art, the room's interior scene, the assigned
     patient standing in the doorway (open room only), then the door art -
     an open door's transparent doorway reveals the interior and patient.
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

  function renderRooms(state, portraitUrlFor) {
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

      const wall = document.createElement("img");
      wall.className = "room-wall";
      wall.alt = "";
      wall.src = assets.game.roomsWall;

      const interior = document.createElement("img");
      interior.className = "room-interior";
      interior.alt = "";
      interior.src = assets.game.roomInteriors[roomKey];

      room.append(wall, interior);

      if (isOpen) {
        const patient = document.createElement("img");
        patient.className = "room-patient";
        patient.alt = "";
        patient.src = portraitUrlFor(state.assigned.patientId);
        room.append(patient);
      }

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
    correct: "✓ CORRECT",
    close: "△ CLOSE",
    wrong: "− WRONG"       // minus, not a cross - see OUTCOME_MARK_GLYPHS
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
     6. SHIFT REVIEW rendering (Phase 8).
     A printed discharge summary. Every number comes from the live score
     selector, so the formula rows and the headline score can never
     disagree (doc 9: "formulas sum exactly to displayed score").
     ------------------------------------------------------------------- */

  /* The shift's own date and start time: "Aug 5, 2026 - 2:14 PM".
     Locale-formatted, so it reads correctly outside the US too. */
  function formatShiftDate(timestampMs) {
    if (!timestampMs) return "—";
    const when = new Date(timestampMs);
    const datePart = when.toLocaleDateString(undefined,
      { month: "short", day: "numeric", year: "numeric" });
    const timePart = when.toLocaleTimeString(undefined,
      { hour: "numeric", minute: "2-digit" });
    return `${datePart} · ${timePart}`;
  }

  /* The label cell opens with the outcome's glyph (John, 2026-08-06), so
     the table rows carry the same marks as the toast, the Answer verdict,
     and the photo badge. The glyph takes the outcome's accent color; the
     word stays in label ink. */
  function buildFormulaLabelCell(className, outcomeKey, label) {
    const cell = document.createElement("span");
    cell.className = className;
    const glyph = document.createElement("span");
    glyph.className = "review-formula-glyph is-outcome-" + outcomeKey;
    glyph.textContent = OUTCOME_MARK_GLYPHS[outcomeKey] || "";
    glyph.setAttribute("aria-hidden", "true");
    cell.append(glyph, label);
    return cell;
  }

  /* One formula line. The four cells are appended straight into the grid
     (not wrapped in a row element) so columns align down the whole page. */
  function appendFormulaRow(mount, outcomeModifier, label, count, multiplier) {
    mount.append(buildFormulaLabelCell(
      `review-formula-label review-formula--${outcomeModifier}`,
      outcomeModifier, label));
    const cells = [
      ["review-formula-count", String(count)],
      ["review-formula-multiplier", `× ${multiplier}`],
      ["review-formula-subtotal", String(count * multiplier)]
    ];
    for (const [className, text] of cells) {
      const cell = document.createElement("span");
      cell.className = `${className} review-formula--${outcomeModifier}`;
      cell.textContent = text;
      mount.append(cell);
    }
  }

  /* A row that does not apply in this difficulty (CLOSE under Strict).
     It keeps its place so the table never changes shape, but the count
     and multiplier cells stay EMPTY - no "0", no "x 50" - and the total
     reads NA (doc 3). The glyph rides along, faint like the rest of the
     row (CSS overrides its accent under .is-na). */
  function appendFormulaNaRow(mount, outcomeKey, label) {
    mount.append(buildFormulaLabelCell(
      "review-formula-label is-na", outcomeKey, label));
    const cells = [
      ["review-formula-count", ""],
      ["review-formula-multiplier", ""],
      ["review-formula-subtotal is-na", "NA"]
    ];
    for (const [className, text] of cells) {
      const cell = document.createElement("span");
      cell.className = className;
      cell.textContent = text;
      mount.append(cell);
    }
  }

  /* The CONFIGURED shift length, worded exactly as the Settings radios
     word it: RUSH lengths in seconds ("60 seconds"), Triage lengths in
     minutes ("5 minutes"). Mixed units are deliberate - "300 seconds"
     reads badly and neither matches its Settings label (John,
     2026-08-06). Labels use words; running/elapsed time uses m:ss. */
  function configuredShiftLengthLabel(state) {
    const seconds = GAME.selectedShiftLengthSeconds(state);
    return state.settings.mode === "rush"
      ? `${seconds} seconds`
      : `${seconds / 60} minutes`;
  }

  /* The direction counters' explanations and disclaimer live as static
     text in index.html; showing an explanation is a pure CSS/class swap
     inside each button. Wording there says "misses", not "wrong calls":
     the counters move on CLOSE calls too, in every mode and difficulty
     (doc 3). */

  function renderReview(state) {
    /* HOME and GAME renders call this too; an unstarted shift has no
       timestamps to format, so leave the hidden view alone. */
    if (state.view !== "review") return;

    const isRush = state.settings.mode === "rush";
    const totals = GAME.selectScoreTotals(state);

    /* The masthead is static markup ("Triage RUSH! Shift Report" in every
       mode, John 2026-08-06); this MODE: line is what names the mode.
       "Triage!" on its own appears ONLY here and in the settings mode
       chooser. */
    const difficultyName =
      state.settings.difficulty === "strict" ? "Strict" : "Forgiving";
    ui.reviewModeLine.textContent =
      `MODE: ${isRush ? "Triage RUSH!" : "Triage!"}, ${difficultyName}, ` +
      configuredShiftLengthLabel(state);

    ui.reviewProvider.textContent =
      `${state.player.title} ${state.player.initials}`;
    ui.reviewDate.textContent = formatShiftDate(state.shift.startedAtMs);
    /* Duration is time actually RUN, so ending early at 3:12 of a 5:00
       shift prints 3:12 (John, 2026-08-05). Because the mode line above
       prints the CONFIGURED length, a shift the player stopped early
       gets its note - otherwise the gap between the two numbers would
       read as a bug. "timer" needs no note, and "quit" never reaches
       the review at all. */
    ui.reviewDuration.textContent = formatClock(state.shift.elapsedMs);
    ui.reviewDurationNote.hidden = state.shift.endReason !== "stop";
    ui.reviewSeen.textContent = String(totals.patientsSeen);

    ui.reviewScoreValue.textContent = String(totals.score);
    ui.reviewScoreValue.classList.toggle("is-negative", totals.score < 0);

    /* ALWAYS the same three rows in the same order, so the table never
       changes shape between modes or difficulties (doc 3). Under Strict
       the CLOSE row holds its place and reads NA. LEFT WAITING is gone
       from every mode - a full waiting room is the game's premise, not
       the player's failure (John, 2026-08-05). */
    const formulas = ui.reviewFormulas;
    formulas.replaceChildren();
    appendFormulaRow(formulas, "correct", "CORRECT",
      totals.correct, GAME.GAME_CONSTANTS.POINTS.correct);
    if (state.settings.difficulty === "forgiving") {
      appendFormulaRow(formulas, "close", "CLOSE",
        totals.close, GAME.GAME_CONSTANTS.POINTS.close);
    } else {
      appendFormulaNaRow(formulas, "close", "CLOSE");
    }
    appendFormulaRow(formulas, "wrong", "WRONG",
      totals.wrong, GAME.GAME_CONSTANTS.POINTS.wrong);

    ui.reviewUnder.textContent = String(totals.under);
    ui.reviewOver.textContent = String(totals.over);

    /* Each render restores the counters to their numbers and clears any
       pinned button - the same reset-on-render rule as the other
       DOM-only ephemera (photo zoom, scroll position). */
    for (const button of [ui.reviewUnderButton, ui.reviewOverButton]) {
      button.classList.remove("is-active");
      button.setAttribute("aria-pressed", "false");
    }

    ui.patientsSeenButton.textContent =
      `Review the Patients Seen (${totals.patientsSeen})`;
    ui.patientsSeenButton.disabled = totals.patientsSeen === 0;
  }

  /* The Patients Seen browser: one ledger patient at a time, in the
     review setting of the same chart builder used during play.

     Rebuilding the chart on every navigation is what resets scroll to
     the top (doc 3) - the new paper simply starts at its beginning. */
  function renderPatientsSeen(state, portraitUrlFor) {
    const isShowing = state.overlay === "patients-seen";
    ui.patientsSeenOverlay.hidden = !isShowing;
    if (!isShowing) {
      ui.seenMount.replaceChildren();
      renderSeenPortraitZoom(state, null, false);
      return;
    }

    const ledgerRecord = GAME.selectPatientSeenRecord(state);
    if (!ledgerRecord) return;
    const record = window.TRIAGE_RUSH_PATIENTS_BY_ID[ledgerRecord.patientId];
    const total = state.ledger.order.length;

    /* The name is deliberately NOT repeated here: the chart's own
       nameplate carries it a few pixels below (John, 2026-08-05). */
    ui.seenPositionValue.textContent =
      `${state.review.patientIndex + 1} / ${total}`;

    /* Carry the reading position across patients as a PROPORTION rather
       than resetting to the top (John, 2026-08-05): someone comparing
       everyone's ANSWER section should not have to scroll down again for
       each one. Charts differ in length, so the same fraction lands in
       the same neighbourhood, not on the same card.

       Measured before the rebuild and reapplied after. On first open the
       previous chart is empty, so the fraction is 0 and the browser
       opens at the top, which is what it should do. */
    const previousScrollable =
      ui.seenScroll.scrollHeight - ui.seenScroll.clientHeight;
    const scrolledFraction = previousScrollable > 0
      ? ui.seenScroll.scrollTop / previousScrollable
      : 0;

    const chart = buildPatientChart(
      record,
      { setting: "review", ledgerRecord },
      portraitUrlFor(ledgerRecord.patientId));
    ui.seenMount.replaceChildren(chart);
    /* A rebuild is a new patient (or a fresh open): the photo zoom
       starts closed, same as the Chart overlay. */
    renderSeenPortraitZoom(state, portraitUrlFor, false);

    /* Reading scrollHeight here forces the new layout, so the fraction
       applies to the chart that is actually on screen now. */
    const nextScrollable =
      ui.seenScroll.scrollHeight - ui.seenScroll.clientHeight;
    ui.seenScroll.scrollTop = Math.round(nextScrollable * scrolledFraction);
  }

  /* Same rule as the Chart's hints: offer a direction only when content
     actually exists that way (doc 7). */
  function updatePatientsSeenScrollHints() {
    const scroll = ui.seenScroll;
    const hiddenBelow =
      scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop;
    ui.seenMoreAbove.hidden = scroll.scrollTop <= 4;
    ui.seenMoreBelow.hidden = hiddenBelow <= 4;
  }

  /* The acknowledgement that covers the summary until the player taps.
     The two endings read differently because the shift ending on its own
     and the player choosing to stop are different moments (John,
     2026-08-05); state.shift.endReason already tells them apart. */
  function renderShiftOverAcknowledgement(state) {
    const isShowing = state.overlay === "shift-over";
    ui.shiftOverOverlay.hidden = !isShowing;
    if (!isShowing) return;

    ui.shiftOverHeadline.textContent =
      state.shift.endReason === "timer" ? "TIME’S UP" : "SHIFT ENDED";

    const seen = GAME.selectScoreTotals(state).patientsSeen;
    ui.shiftOverCount.textContent =
      seen === 1 ? "1 patient seen" : `${seen} patients seen`;
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
    pendingSoundSelections,
    setPendingMusicLoudness,
    renderModeLengthVisibility,
    showMusicStatusNote,
    renderWaiting,
    buildPatientChart,
    renderPatient,
    renderChartOverlay,
    renderChartPortraitZoom,
    renderSeenPortraitZoom,
    renderRooms,
    showAssignmentFeedback,
    clearAssignmentFeedback,
    showWaitingBlockedShake,
    showCountdownNumeral,
    renderGameHeader,
    renderConfirmQuit,
    renderConfirmStop,
    renderArrivingOverlay,
    renderReview,
    renderShiftOverAcknowledgement,
    renderPatientsSeen,
    updatePatientsSeenScrollHints
  };

})();
