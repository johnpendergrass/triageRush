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
    "patientEmptyState", "roomsPanel", "quitGameButton", "stopGameButton",
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
    renderGameHeader,
    renderConfirmQuit,
    renderArrivingOverlay,
    renderReview
  };

})();
