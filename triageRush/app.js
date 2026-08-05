/* ============================================================================
   triageRush - app.js
   Bootstrap and glue: staged loading, event wiring, and one-time effects
   (music playback, focus moves). Game rules live in game.js; rendering in
   ui.js; every asset path in assets.js.

   Staged loading (doc 4):
     Stage 1 - HOME becomes interactive after its critical lobby art decodes.
     Stage 2 - while the player reviews settings, all patient JSON is
               fetched/validated and shared game artwork is verified.
     Stage 3 - Start Shift shows the blocking PATIENTS ARE ARRIVING status;
               later phases add portrait decoding and queue seeding there.

   Section map:
     1. Shared runtime objects
     2. Image and patient loading
     3. Music (KING-FM stream)
     4. Rendering orchestration
     5. Start Shift flow
     6. Event wiring
     7. Boot
   ========================================================================= */

"use strict";

(function bootstrapTriageRush() {

  const ASSETS = window.TRIAGE_RUSH_ASSETS;
  const GAME = window.TRIAGE_RUSH_GAME;
  const UI = window.TRIAGE_RUSH_UI;
  const ui = UI.ui;

  /* ----------------------------------------------------------------------
     1. Shared runtime objects.
     patientsById holds the schema-preserving canonical records; it is
     deliberately outside the state tree because records are large,
     immutable reference data (docs 4, 8).
     ------------------------------------------------------------------- */

  const context = GAME.createGameContext();
  const state = GAME.createInitialState();
  const patientsById = {};
  /* ui.js reads canonical records through this shared reference. */
  window.TRIAGE_RUSH_PATIENTS_BY_ID = patientsById;

  /* Rolling portrait reserve ahead of the deck cursor. 8 is a starting
     estimate; the acceptance plan sizes it by throttled-network testing
     against the fastest RUSH arrival curve. */
  const PORTRAIT_RESERVE_COUNT = 8;

  function portraitUrlFor(patientId) {
    return ASSETS.patients.portraitPath(patientId);
  }

  const loading = {
    patientsTotal: ASSETS.patients.ids.length,
    patientsLoaded: 0,
    ready: false,
    failed: false,
    errorMessage: ""
  };

  /* ----------------------------------------------------------------------
     2. Image and patient loading.
     ------------------------------------------------------------------- */

  function loadImage(imagePath) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(imagePath);
      image.onerror = () => reject(new Error("missing image: " + imagePath));
      image.src = imagePath + "?v=" + ASSETS.cacheVersion;
    });
  }

  /* Stage 1: the four lobby images HOME cannot appear without. */
  async function loadCriticalLobbyArt() {
    await Promise.all([
      loadImage(ASSETS.lobby.background),
      loadImage(ASSETS.lobby.doorOverlayStartShift),
      loadImage(ASSETS.lobby.settingsBlackboard),
      loadImage(ASSETS.lobby.aboutWhiteboard)
    ]);
    ui.homeBackground.src = ASSETS.lobby.background;
    ui.startShiftArt.src = ASSETS.lobby.doorOverlayStartShift;
  }

  /* Stage 2a: fetch and validate all 160 canonical patient records. */
  async function loadAllPatients() {
    const loadOne = async (patientId) => {
      const response = await fetch(ASSETS.patients.jsonPath(patientId));
      if (!response.ok) {
        throw new Error(`patient JSON missing: ${patientId} `
          + `(HTTP ${response.status})`);
      }
      const record = await response.json();
      const problems = GAME.validatePatientRecord(record, patientId);
      if (problems.length > 0) {
        throw new Error(`patient ${patientId} invalid: ${problems[0]}`);
      }
      patientsById[patientId] = record;
      loading.patientsLoaded += 1;
      /* Progress updates are cheap; render every few records. */
      if (loading.patientsLoaded % 8 === 0) {
        UI.renderLoadingStatus(loading);
      }
    };
    await Promise.all(ASSETS.patients.ids.map(loadOne));
  }

  /* Stage 2b: verify every manifest image exists and decodes. This also
     warms the browser cache for the shared game artwork. */
  async function verifyAllManifestImages() {
    const paths = window.TRIAGE_RUSH_LIST_ALL_IMAGE_ASSET_PATHS();
    await Promise.all(paths.map(loadImage));
  }

  async function runStageTwoLoading() {
    try {
      await Promise.all([loadAllPatients(), verifyAllManifestImages()]);
      loading.ready = true;
    } catch (loadError) {
      loading.failed = true;
      loading.errorMessage = String(loadError.message || loadError);
      console.error("triageRush loading failed:", loadError);
    }
    UI.renderLoadingStatus(loading);
  }

  /* Fire-and-forget preload of the next portraits the deck will draw.
     Failures here are tolerable; the blocking initial load is what
     guarantees a shift never starts with missing art. */
  function topUpPortraitReserve() {
    const upcomingIds = GAME.peekUpcomingPatientIds(
      state, PORTRAIT_RESERVE_COUNT);
    for (const patientId of upcomingIds) {
      loadImage(portraitUrlFor(patientId)).catch(() => {});
    }
  }

  /* ----------------------------------------------------------------------
     2b. Game sound effects.
     One lazily created Web Audio context (first user gesture). Every
     sound is an individually named recipe so later per-sound options
     are a flag away (design change 2026-08-04). All synthesized; no
     audio files.
     ------------------------------------------------------------------- */

  let audioContext = null;

  function ensureAudioContext() {
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (audioError) {
        console.warn("triageRush: Web Audio unavailable", audioError);
        return null;
      }
    }
    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  }

  /* Two-note chime: the arrival doink. */
  function playDoinkSound(audio) {
    const startAt = audio.currentTime;
    for (const [frequencyHz, peakGain] of [[1046, 0.14], [2093, 0.035]]) {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequencyHz;
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(peakGain, startAt + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.42);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + 0.45);
    }
  }

  /* Quick rising major arpeggio (C5-E5-G5): the Correct reward. */
  function playCorrectSound(audio) {
    const startAt = audio.currentTime;
    for (const [frequencyHz, delaySeconds] of
         [[523.25, 0], [659.25, 0.09], [783.99, 0.18]]) {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequencyHz;
      const noteStart = startAt + delaySeconds;
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.15, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.35);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + 0.4);
    }
  }

  /* The first two notes of the Correct arpeggio (C5-E5): recall - the
     patient is coming back for another look (John, 2026-08-04). */
  function playRecallSound(audio) {
    const startAt = audio.currentTime;
    for (const [frequencyHz, delaySeconds] of [[523.25, 0], [659.25, 0.09]]) {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequencyHz;
      const noteStart = startAt + delaySeconds;
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.15, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.35);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + 0.4);
    }
  }

  /* Two mellow mid notes easing down a half step: Close - neither a
     reward nor a rebuke. */
  function playCloseSound(audio) {
    const startAt = audio.currentTime;
    for (const [frequencyHz, delaySeconds] of [[440, 0], [415.3, 0.15]]) {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = frequencyHz;
      const noteStart = startAt + delaySeconds;
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.16, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.3);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + 0.35);
    }
  }

  /* Short low sliding-down buzz: Wrong. Quiet gain because square waves
     sound much louder than sines at the same level. */
  function playWrongSound(audio) {
    const startAt = audio.currentTime;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(196, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(123.47, startAt + 0.28);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.07, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.4);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.42);
  }

  /* The registry: one named entry per game sound. The GAME SOUNDS toggle
     governs the whole family today; `enabled` is the future hook for
     per-sound preferences. */
  const SOUND_REGISTRY = {
    doink: { enabled: true, play: playDoinkSound },
    correct: { enabled: true, play: playCorrectSound },
    recall: { enabled: true, play: playRecallSound },
    close: { enabled: true, play: playCloseSound },
    wrong: { enabled: true, play: playWrongSound }
    /* tick, minuteTick, countdownTick, endDong arrive with the
       scheduler phase. */
  };

  function playGameSound(soundName) {
    if (!state.gameSoundsAudible) return;
    const sound = SOUND_REGISTRY[soundName];
    if (!sound || !sound.enabled) return;
    const audio = ensureAudioContext();
    if (audio) sound.play(audio);
  }

  /* ----------------------------------------------------------------------
     3. Music: the KING-FM stream.
     Plays only when soundGlobal && soundMusic. Started only from a HOME
     user gesture (applying settings); the game screen never starts it.
     A failed stream turns the preference off and reports honestly.
     ------------------------------------------------------------------- */

  const musicElement = new Audio();
  musicElement.preload = "none";
  musicElement.src = ASSETS.music.kingFmStreamUrl;

  async function syncMusicPlayback() {
    const shouldPlay = state.settings.soundGlobal && state.settings.soundMusic;
    if (!shouldPlay) {
      musicElement.pause();
      return;
    }
    try {
      await musicElement.play();
    } catch (playError) {
      console.warn("triageRush: music stream could not start", playError);
      state.settings.soundMusic = false;
      GAME.savePreferences(state, context);
      UI.showMusicStatusNote(
        "Music stream could not start. It has been switched off; "
        + "try again from Shift Settings.");
    }
  }

  /* ----------------------------------------------------------------------
     4. Rendering orchestration.
     ------------------------------------------------------------------- */

  function renderAll() {
    UI.renderShellView(state);
    UI.renderHomeBoardSummaries(state);
    UI.renderLoadingStatus(loading);
    UI.renderGameHeader(state);
    UI.renderWaiting(state, portraitUrlFor);
    UI.renderPatient(state, portraitUrlFor);
    UI.renderChartOverlay(state, portraitUrlFor);
    UI.renderRooms(state);
    UI.renderConfirmQuit(state);
    UI.renderConfirmStop(state);
    UI.renderReview(state);
  }

  /* ----------------------------------------------------------------------
     5. Start Shift flow.
     Later phases extend the arriving step with portrait decoding and
     queue seeding before activation (doc 4 loading contract).
     ------------------------------------------------------------------- */

  async function handleStartShift() {
    if (!loading.ready) return;
    if (!GAME.startShift(state, context)) return;
    GAME.assertStateInvariants(state, "startShift");

    UI.renderArrivingOverlay(true);

    /* Block until the initial queue portraits (plus the near-term reserve)
       are fetched and decoded; the shift never starts on missing art. */
    const seedCount = state.settings.mode === "rush" ? 2
      : GAME.GAME_CONSTANTS.MIN_VISIBLE_WAITING;
    const requiredIds = GAME.peekUpcomingPatientIds(
      state, seedCount + PORTRAIT_RESERVE_COUNT);
    try {
      await Promise.all(
        requiredIds.map(id => loadImage(portraitUrlFor(id))));
    } catch (portraitError) {
      console.error("triageRush: portrait preload failed", portraitError);
      UI.renderArrivingOverlay(false);
      GAME.quitShift(state);
      loading.failed = true;
      loading.errorMessage =
        "A patient portrait failed to load. Check the connection and retry.";
      renderAll();
      return;
    }

    GAME.seedInitialQueue(state, context);
    GAME.activateShift(state);
    GAME.assertStateInvariants(state, "activateShift");
    UI.renderArrivingOverlay(false);
    renderAll();
    topUpPortraitReserve();
  }

  /* ----------------------------------------------------------------------
     6. Event wiring - installed once (doc 8 rendering boundary).
     ------------------------------------------------------------------- */

  function wireHomeEvents() {
    ui.playerBoardButton.addEventListener("click", () => {
      state.overlay = "settings-player";
      UI.openPopup("settings-player", state, ui.playerBoardButton);
    });

    ui.shiftBoardButton.addEventListener("click", () => {
      state.overlay = "settings-shift";
      UI.openPopup("settings-shift", state, ui.shiftBoardButton);
    });

    ui.aboutButton.addEventListener("click", () => {
      state.overlay = "about";
      UI.openPopup("about", state, ui.aboutButton);
    });

    ui.startShiftButton.addEventListener("click", handleStartShift);
  }

  function wirePopupEvents() {
    /* Red X: cancel - discard edits and close. */
    ui.popupCloseButton.addEventListener("click", () => {
      state.overlay = null;
      UI.closePopup();
    });

    /* Green check: apply - validate through the game action, persist,
       refresh summaries, and sync music (user gesture, so play is legal). */
    ui.popupApplyButton.addEventListener("click", () => {
      const edited = UI.readSettingsControls(state);
      const applied = GAME.applySettings(state, edited.player, edited.settings);
      if (!applied) {
        console.warn("triageRush: settings rejected", edited);
        return;
      }
      GAME.assertStateInvariants(state, "applySettings");
      GAME.savePreferences(state, context);
      state.overlay = null;
      UI.closePopup();
      UI.renderHomeBoardSummaries(state);
      syncMusicPlayback();
    });

    /* Scrim click cancels; clicks inside the card never close. */
    ui.popupLayer.addEventListener("click", (event) => {
      if (event.target === ui.popupLayer) {
        state.overlay = null;
        UI.closePopup();
      }
    });

    /* Mode radios swap which shift-length group is visible. */
    for (const radio of document.querySelectorAll(
      'input[name="settingMode"]')) {
      radio.addEventListener("change", UI.renderModeLengthVisibility);
    }
  }

  /* One pending timeout clears the transient assignment feedback; a new
     assignment before it fires simply restarts it. */
  const FEEDBACK_DURATION_MS = 1400;
  let feedbackClearTimeoutId = null;

  function showTransientAssignmentFeedback(outcome, roomKey) {
    UI.showAssignmentFeedback(outcome, roomKey);
    clearTimeout(feedbackClearTimeoutId);
    feedbackClearTimeoutId = setTimeout(
      UI.clearAssignmentFeedback, FEEDBACK_DURATION_MS);
  }

  function wireGameEvents() {
    /* Queue rows are rebuilt on every change, so one delegated listener
       on the panel handles them all. */
    ui.waitingPanel.addEventListener("click", (event) => {
      const row = event.target.closest("[data-waiting-index]");
      if (!row) return;
      const result = GAME.selectWaitingPatient(
        state, context, Number(row.dataset.waitingIndex));
      if (!result.accepted) return;
      GAME.assertStateInvariants(state, "selectWaitingPatient");
      if (result.doink) playGameSound("doink");
      UI.renderWaiting(state, portraitUrlFor);
      UI.renderPatient(state, portraitUrlFor);
      /* Selection may have finalized an assigned case: that door closes. */
      UI.renderRooms(state);
      UI.renderGameHeader(state);
      topUpPortraitReserve();
    });

    /* Door rail: an open door recalls its patient; a closed door assigns
       the active patient. Both are one delegated listener because the
       rail is rebuilt on every change. */
    ui.roomsPanel.addEventListener("click", (event) => {
      const room = event.target.closest("[data-room-key]");
      if (!room) return;
      const roomKey = room.dataset.roomKey;

      if (state.assigned !== null && state.assigned.roomKey === roomKey) {
        const recall = GAME.recallAssignedPatient(state, roomKey);
        if (!recall.accepted) return;
        GAME.assertStateInvariants(state, "recallAssignedPatient");
        playGameSound("recall");
        /* Recall cancels any lingering result display. */
        clearTimeout(feedbackClearTimeoutId);
        UI.clearAssignmentFeedback();
        UI.renderRooms(state);
        UI.renderPatient(state, portraitUrlFor);
        UI.renderWaiting(state, portraitUrlFor);
        return;
      }

      if (state.active === null) return;
      const patientRecord = patientsById[state.active.patientId];
      const assignment = GAME.assignActivePatientToRoom(
        state, context, patientRecord, roomKey);
      if (!assignment.accepted) return;
      GAME.assertStateInvariants(state, "assignActivePatientToRoom");
      playGameSound(assignment.outcome);
      UI.renderRooms(state);
      UI.renderPatient(state, portraitUrlFor);
      UI.renderWaiting(state, portraitUrlFor);
      UI.renderGameHeader(state);
      /* After renderRooms so the pulse lands on the freshly built door. */
      showTransientAssignmentFeedback(assignment.outcome, roomKey);
    });

    ui.gameSoundButton.addEventListener("click", () => {
      GAME.toggleGameSoundsAudible(state);
      UI.renderGameHeader(state);
    });

    ui.quitGameButton.addEventListener("click", () => {
      state.overlay = "confirm-quit";
      UI.renderConfirmQuit(state);
    });

    ui.confirmQuitCancel.addEventListener("click", () => {
      state.overlay = null;
      UI.renderConfirmQuit(state);
      ui.quitGameButton.focus();
    });

    ui.confirmQuitAccept.addEventListener("click", () => {
      state.overlay = null;
      GAME.quitShift(state);
      GAME.assertStateInvariants(state, "quitShift");
      renderAll();
    });

    /* Stop confirms first: ending early is final (John, 2026-08-04). */
    ui.stopGameButton.addEventListener("click", () => {
      state.overlay = "confirm-stop";
      UI.renderConfirmStop(state);
    });

    ui.confirmStopCancel.addEventListener("click", () => {
      state.overlay = null;
      UI.renderConfirmStop(state);
      ui.stopGameButton.focus();
    });

    ui.confirmStopAccept.addEventListener("click", () => {
      state.overlay = null;
      GAME.stopShift(state, "stop", context);
      GAME.assertStateInvariants(state, "stopShift");
      renderAll();
    });
  }

  /* ----------------------------------------------------------------------
     6b. Chart (Phase 6).
     Open/close legality and the "chart" pause reason live in game.js;
     here is only the wiring: the whole-panel hit target, close paths
     (X, scrim, Escape), section toggles, and the internal scroll hints.
     ------------------------------------------------------------------- */

  /* MORE ABOVE / MORE BELOW show only while hidden content exists in
     that direction (with a little slack so a hairline never counts). */
  function updateChartScrollHints() {
    const scroller = ui.chartScroll;
    const slackPx = 8;
    ui.chartMoreAbove.hidden = scroller.scrollTop <= slackPx;
    ui.chartMoreBelow.hidden =
      scroller.scrollTop + scroller.clientHeight
        >= scroller.scrollHeight - slackPx;
  }

  function openChartFromPanel() {
    if (!GAME.openChart(state)) return;
    GAME.assertStateInvariants(state, "openChart");
    UI.renderChartOverlay(state, portraitUrlFor);
    updateChartScrollHints();
    ui.chartCloseButton.focus();
  }

  function closeChartAndRestoreFocus() {
    if (!GAME.closeChart(state)) return;
    GAME.assertStateInvariants(state, "closeChart");
    UI.renderChartOverlay(state, portraitUrlFor);
    /* Focus returns to the patient panel, the element that opened it. */
    ui.patientPanelHitButton.focus();
  }

  /* The larger-photo view. Ephemeral (never in the state tree): it
     resets closed whenever the chart itself (re)opens. */
  function isPortraitZoomOpen() {
    return !ui.chartZoomView.hidden;
  }

  function openPortraitZoom() {
    UI.renderChartPortraitZoom(state, portraitUrlFor, true);
    const closeButton = ui.chartZoomView.querySelector(".chart-zoom-close");
    if (closeButton) closeButton.focus();
  }

  function closePortraitZoom() {
    UI.renderChartPortraitZoom(state, portraitUrlFor, false);
    /* Back to the magnifier that opened it. */
    const zoomButton = ui.chartOverlayMount.querySelector(".chart-zoom-button");
    if (zoomButton) zoomButton.focus();
  }

  function wireChartEvents() {
    ui.patientPanelHitButton.addEventListener("click", openChartFromPanel);
    ui.chartCloseButton.addEventListener("click", closeChartAndRestoreFocus);

    /* Scrim click closes; clicks inside the clipboard never do (doc 7). */
    ui.chartOverlay.addEventListener("click", (event) => {
      if (event.target === ui.chartOverlay) closeChartAndRestoreFocus();
    });

    /* Section headers are rebuilt with the chart, so one delegated
       listener handles them. Clinical toggles and records the
       shift-level preference; locked Answer only shakes (doc 3). The
       presentation cards have no header - always visible (John,
       2026-08-05). */
    ui.chartOverlayMount.addEventListener("click", (event) => {
      /* The photo's zoom hit box opens the larger view. */
      if (event.target.closest("[data-chart-zoom]")) {
        openPortraitZoom();
        return;
      }

      const header = event.target.closest("[data-chart-section]");
      if (!header) return;

      if (header.dataset.chartSection === "answer") {
        header.classList.remove("is-denied");
        void header.offsetWidth; /* restart the shake animation */
        header.classList.add("is-denied");
        return;
      }

      const body = ui.chartOverlayMount.querySelector(".chart-clinical-body");
      if (!body) return;
      const nowExpanded = body.hidden; /* it was hidden, so this expands */
      body.hidden = !nowExpanded;
      header.setAttribute("aria-expanded", String(nowExpanded));
      GAME.setChartClinicalExpanded(state, nowExpanded);
      updateChartScrollHints();
    });

    /* The zoom view's close box is rebuilt with its content, so this is
       delegated too. Its dark scrim also closes; the photo card itself
       never does. */
    ui.chartZoomView.addEventListener("click", (event) => {
      if (event.target.closest(".chart-zoom-close") ||
          event.target === ui.chartZoomView) {
        closePortraitZoom();
      }
    });

    ui.chartScroll.addEventListener("scroll", updateChartScrollHints);

    ui.chartMoreAbove.addEventListener("click", () => {
      ui.chartScroll.scrollBy({
        top: -ui.chartScroll.clientHeight * 0.7, behavior: "smooth" });
    });

    ui.chartMoreBelow.addEventListener("click", () => {
      ui.chartScroll.scrollBy({
        top: ui.chartScroll.clientHeight * 0.7, behavior: "smooth" });
    });
  }

  function wireReviewEvents() {
    ui.returnToLobbyButton.addEventListener("click", () => {
      GAME.returnToLobby(state);
      GAME.assertStateInvariants(state, "returnToLobby");
      renderAll();
    });
  }

  function wireKeyboardEvents() {
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (UI.isPopupOpen()) {
        state.overlay = null;
        UI.closePopup();
      } else if (state.overlay === "chart") {
        /* Escape peels one layer: the larger photo first, then the chart. */
        if (isPortraitZoomOpen()) closePortraitZoom();
        else closeChartAndRestoreFocus();
      } else if (state.overlay === "confirm-quit") {
        state.overlay = null;
        UI.renderConfirmQuit(state);
        ui.quitGameButton.focus();
      } else if (state.overlay === "confirm-stop") {
        state.overlay = null;
        UI.renderConfirmStop(state);
        ui.stopGameButton.focus();
      }
    });
  }

  /* ----------------------------------------------------------------------
     7. Boot.
     ------------------------------------------------------------------- */

  async function boot() {
    /* Game artwork variables for CSS; paths only, never pixel sizes.
       Manifest paths are page-relative, but url() inside CSS resolves
       against the stylesheet, so absolutize them against the page here. */
    const rootStyle = document.documentElement.style;
    const absoluteUrl = (path) => new URL(path, document.baseURI).href;
    rootStyle.setProperty("--asset-patient-panel",
      `url("${absoluteUrl(ASSETS.game.patientPanelBackground)}")`);

    GAME.loadPreferences(state);
    GAME.assertStateInvariants(state, "boot");

    wireHomeEvents();
    wirePopupEvents();
    wireGameEvents();
    wireChartEvents();
    wireReviewEvents();
    wireKeyboardEvents();

    try {
      await loadCriticalLobbyArt();
    } catch (artError) {
      loading.failed = true;
      loading.errorMessage = String(artError.message || artError);
    }

    renderAll();

    /* Stage 2 runs while the player looks at HOME. */
    if (!loading.failed) runStageTwoLoading();
  }

  boot();

})();
