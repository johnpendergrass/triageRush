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
    UI.renderConfirmQuit(state);
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
    /* Phase 4 will decode the initial queue portraits here. A short beat
       keeps the status readable instead of flashing. */
    await new Promise(resolve => setTimeout(resolve, 700));

    GAME.activateShift(state);
    GAME.assertStateInvariants(state, "activateShift");
    UI.renderArrivingOverlay(false);
    renderAll();
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

  function wireGameEvents() {
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

    ui.stopGameButton.addEventListener("click", () => {
      GAME.stopShift(state, "stop", context);
      GAME.assertStateInvariants(state, "stopShift");
      renderAll();
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
      } else if (state.overlay === "confirm-quit") {
        state.overlay = null;
        UI.renderConfirmQuit(state);
        ui.quitGameButton.focus();
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
    rootStyle.setProperty("--asset-room-wall",
      `url("${absoluteUrl(ASSETS.game.roomWall)}")`);
    rootStyle.setProperty("--asset-patient-panel",
      `url("${absoluteUrl(ASSETS.game.patientPanelBackground)}")`);

    GAME.loadPreferences(state);
    GAME.assertStateInvariants(state, "boot");

    wireHomeEvents();
    wirePopupEvents();
    wireGameEvents();
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
