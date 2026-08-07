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

  /* Every sound plays through this one gain node instead of straight to
     the speakers, so the GAME SOUNDS level is a single multiplier rather
     than a number threaded through ten sound recipes (TODO 3,
     2026-08-07). It is created with - and dies with - the context. */
  let gameGainNode = null;

  /* "lo" is a real step down: everything keeps its shape, the family
     just sits further back. Tuned by ear (John, 2026-08-07: 0.35 was
     not low enough). */
  const LOUDNESS_GAIN = { off: 0, lo: 0.22, hi: 1 };

  /* Music needs its OWN scale, much lower than the game sounds' (John,
     2026-08-07): a broadcast stream is mastered far hotter than these
     synthesized blips, so sharing one map made KING-FM drown them. This
     is background audio, not a music player - "hi" is quiet and "lo" is
     barely there. These are amplitudes and loudness is roughly
     logarithmic, so 0.06 sits about 24dB below full and 0.02 about 34dB
     below. Tuned twice by ear: 0.25/0.08 was still far too loud next to
     the game sounds. Tune these two numbers by ear; nothing else. */
  const MUSIC_VOLUME = { off: 0, lo: 0.02, hi: 0.06 };

  /* Set only while the settings board samples a level the player has not
     applied yet; null the rest of the time. Safe as a plain variable
     because a sound reads the gain synchronously, as it is built. */
  let auditionGameLoudness = null;

  function gameSoundOutput(audio) {
    if (!gameGainNode || gameGainNode.context !== audio) {
      gameGainNode = audio.createGain();
      gameGainNode.connect(audio.destination);
    }
    const level = auditionGameLoudness || state.settings.gameLoudness;
    gameGainNode.gain.value = LOUDNESS_GAIN[level] ?? 1;
    return gameGainNode;
  }

  function ensureAudioContext() {
    /* A closed context can never produce sound again; start over. */
    if (audioContext && audioContext.state === "closed") audioContext = null;
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (audioError) {
        console.warn("triageRush: Web Audio unavailable", audioError);
        return null;
      }
    }
    /* iOS reports "interrupted" (not "suspended") after a phone call,
       Siri, or an app switch, and a context stuck there is silent until
       resumed - so nudge ANY non-running state, not just "suspended"
       (TODO 9, John's iPhone 2026-08-06). */
    if (audioContext.state !== "running") {
      audioContext.resume().catch(() => {});
    }
    return audioContext;
  }

  /* iOS allows only a handful of Web Audio contexts per tab lineage and a
     page REFRESH can strand the old page's context, eventually leaving new
     pages silent until the tab is force-closed. Closing ours on the way
     out keeps refreshes sound-safe (TODO 9). */
  window.addEventListener("pagehide", () => {
    if (audioContext) {
      audioContext.close().catch(() => {});
      audioContext = null;
      gameGainNode = null;
    }
    /* Release the stream too. A page on its way out - or frozen into the
       back/forward cache - must not keep KING-FM playing, because the
       next page has its own audio element and no way to reach this one
       (2026-08-07). Nothing auto-resumes it; the player starts music
       again from the board, as always. */
    stopMusicPlayback();
  });

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
      oscillator.connect(gain).connect(gameSoundOutput(audio));
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
      oscillator.connect(gain).connect(gameSoundOutput(audio));
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
      oscillator.connect(gain).connect(gameSoundOutput(audio));
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
      oscillator.connect(gain).connect(gameSoundOutput(audio));
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
    oscillator.connect(gain).connect(gameSoundOutput(audio));
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.42);
  }

  /* Shared clock-tick voice (Phase 7): one short quiet blip. The three
     tick flavors differ only in pitch and level so the ear reads them as
     the same clock speaking with more or less urgency. */
  function playTickBlip(audio, frequencyHz, peakGain) {
    const startAt = audio.currentTime;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequencyHz;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(peakGain, startAt + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.07);
    oscillator.connect(gain).connect(gameSoundOutput(audio));
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.09);
  }

  /* Ordinary clock tick: RUSH whole seconds, Triage ten-second marks. */
  function playTickSound(audio) {
    playTickBlip(audio, 1200, 0.06);
  }

  /* Emphasis lead-in beat: the 0.50/0.25 ticks before a Triage minute
     or a RUSH ten-second boundary - a touch brighter than ordinary. */
  function playMinuteTickSound(audio) {
    playTickBlip(audio, 1600, 0.08);
  }

  /* Final-countdown tick: highest and most insistent of the family. */
  function playCountdownTickSound(audio) {
    playTickBlip(audio, 2000, 0.1);
  }

  /* The Triage minute donk: same bell family as the completion dong but
     higher and much shorter, so a completed minute is unmistakable
     without sounding like the end of the shift (John, 2026-08-06). */
  function playMinuteDongSound(audio) {
    const startAt = audio.currentTime;
    for (const [frequencyHz, peakGain] of [[330, 0.16], [660, 0.04]]) {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequencyHz;
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(peakGain, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.7);
      oscillator.connect(gain).connect(gameSoundOutput(audio));
      oscillator.start(startAt);
      oscillator.stop(startAt + 0.8);
    }
  }

  /* The lower completion dong at zero: fundamental plus a quiet octave,
     ringing out much longer than any tick (doc 3). */
  function playEndDongSound(audio) {
    const startAt = audio.currentTime;
    for (const [frequencyHz, peakGain] of [[220, 0.2], [440, 0.05]]) {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequencyHz;
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(peakGain, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 1.4);
      oscillator.connect(gain).connect(gameSoundOutput(audio));
      oscillator.start(startAt);
      oscillator.stop(startAt + 1.5);
    }
  }

  /* The registry: one named entry per game sound. The GAME SOUNDS toggle
     governs the whole family today; `enabled` is the future hook for
     per-sound preferences. */
  const SOUND_REGISTRY = {
    doink: { enabled: true, play: playDoinkSound },
    correct: { enabled: true, play: playCorrectSound },
    recall: { enabled: true, play: playRecallSound },
    close: { enabled: true, play: playCloseSound },
    wrong: { enabled: true, play: playWrongSound },
    tick: { enabled: true, play: playTickSound },
    minuteTick: { enabled: true, play: playMinuteTickSound },
    minuteDong: { enabled: true, play: playMinuteDongSound },
    countdownTick: { enabled: true, play: playCountdownTickSound },
    endDong: { enabled: true, play: playEndDongSound }
  };

  /* One representative sound at the level the board currently shows, so
     a player can hear what they are choosing (the board lives on HOME,
     where no game sound would otherwise play). */
  function auditionGameSound() {
    const pending = UI.pendingSoundSelections();
    if (!pending.soundGlobal || pending.gameLoudness === "off") return;
    const audio = ensureAudioContext();
    if (!audio) return;
    auditionGameLoudness = pending.gameLoudness;
    try {
      SOUND_REGISTRY.doink.play(audio);
    } finally {
      auditionGameLoudness = null;
    }
  }

  function playGameSound(soundName) {
    if (!GAME.gameSoundsAudible(state)) return;
    const sound = SOUND_REGISTRY[soundName];
    if (!sound || !sound.enabled) return;
    const audio = ensureAudioContext();
    if (audio) sound.play(audio);
  }

  /* ----------------------------------------------------------------------
     3. Music: the KING-FM stream.
     Plays only when soundGlobal && musicLoudness !== "off", at the volume
     that level names. Started from a user gesture - applying settings on
     HOME, or the game screen's sound icon, which is the global setting
     itself (2026-08-07). A failed stream turns the preference off and
     reports honestly.
     ------------------------------------------------------------------- */

  /* crossOrigin MUST be set before src: routing a cross-origin stream
     through Web Audio (below) yields SILENCE unless the response carries
     CORS headers and the element asked for them.

     But asking for CORS is not free. Safari fetches media with Range
     headers, which puts the request through a PREFLIGHT, and this
     stream's OPTIONS response allows a different, shorter header list
     than its GET response - Range is missing from it. So on iOS the
     CORS-mode load fails outright and play() rejects (John's iPhone,
     2026-08-07), while desktop Chrome never preflights and works fine.
     Hence: try the CORS element first, and fall back to a plain one the
     moment playback refuses. */
  function createMusicElement(withCors) {
    const element = new Audio();
    element.preload = "none";
    if (withCors) element.crossOrigin = "anonymous";
    element.src = ASSETS.music.kingFmStreamUrl;
    return element;
  }

  let musicElement = createMusicElement(true);

  /* iOS IGNORES HTMLMediaElement.volume - Apple reserves media volume for
     the hardware buttons, so setting .volume is a silent no-op on the
     iPhone. That is why every KING-FM level sounded identical there while
     working on desktop Chrome (John, 2026-08-07). A Web Audio GainNode is
     honored on iOS, so the stream is routed through one and the gain, not
     the element, carries the level.

     Consequences worth knowing: an element can be routed only ONCE, and
     only into one context, so this is created lazily and never rebuilt;
     and because the audio now flows through the context, a suspended
     context silences music as well as game sounds - which the existing
     resume-from-any-state handling already covers (TODO 9). */
  let musicSourceNode = null;
  let musicGainNode = null;
  let musicRoutingFailed = false;

  /* Give up on Web Audio for music and start over with a plain element:
     no CORS, no routing, so it loads everywhere - at the cost of losing
     level control on iOS, which ignores .volume. */
  function abandonMusicRouting() {
    musicRoutingFailed = true;
    musicSourceNode = null;
    musicGainNode = null;
    musicElement.pause();
    musicElement = createMusicElement(false);
  }

  function musicOutput(audio) {
    if (musicRoutingFailed) return null;
    if (musicSourceNode && musicSourceNode.context === audio) return musicGainNode;
    try {
      musicSourceNode = audio.createMediaElementSource(musicElement);
      musicGainNode = audio.createGain();
      musicSourceNode.connect(musicGainNode).connect(audio.destination);
      return musicGainNode;
    } catch (routingError) {
      /* Re-routing the same element (a rebuilt context) throws. Fall back
         to the element's own volume: no worse than before, and still
         correct everywhere except iOS. */
      console.warn("triageRush: music could not route through Web Audio",
        routingError);
      musicRoutingFailed = true;
      musicSourceNode = null;
      musicGainNode = null;
      return null;
    }
  }

  /* Playback is driven by explicit values rather than by state, because
     the settings board AUDITIONS a level before it is applied - what you
     hear while choosing is the pending selection, not the saved one
     (John, 2026-08-07). isAudition only changes what a failure may do:
     a preview must never write preferences. */
  async function applyMusicPlayback(soundGlobal, musicLoudness, isAudition) {
    if (!soundGlobal || musicLoudness === "off") {
      musicElement.pause();
      return;
    }
    const level = MUSIC_VOLUME[musicLoudness] ?? MUSIC_VOLUME.hi;
    const audio = ensureAudioContext();
    const gain = audio ? musicOutput(audio) : null;
    if (gain) {
      /* The gain node is the ONLY attenuation; leave the element open. */
      gain.gain.value = level;
      musicElement.volume = 1;
    } else {
      musicElement.volume = level;
    }
    try {
      await musicElement.play();
    } catch (playError) {
      /* The CORS element is the likely culprit (see createMusicElement):
         drop to the plain one and try once more before telling anyone
         anything. This is what keeps music working on the iPhone. */
      if (!musicRoutingFailed) {
        console.warn("triageRush: music refused while routed through "
          + "Web Audio; retrying without CORS", playError);
        abandonMusicRouting();
        return applyMusicPlayback(soundGlobal, musicLoudness, isAudition);
      }
      console.warn("triageRush: music stream could not start", playError);
      UI.showMusicStatusNote(
        "Music stream could not start. It has been switched off; "
        + "try again from Game Options.");
      if (isAudition) {
        /* Tell the board, persist nothing - the player has not applied. */
        UI.setPendingMusicLoudness("off");
        return;
      }
      state.settings.musicLoudness = "off";
      GAME.savePreferences(state, context);
    }
  }

  /* Unconditional stop, used when the page itself is going away. */
  function stopMusicPlayback() {
    musicElement.pause();
  }

  /* Music as the SAVED settings want it - what apply, the sound icon,
     and a cancelled board all fall back to. */
  function syncMusicPlayback() {
    return applyMusicPlayback(
      state.settings.soundGlobal, state.settings.musicLoudness, false);
  }

  /* Music as the BOARD currently reads. */
  function auditionMusic() {
    const pending = UI.pendingSoundSelections();
    return applyMusicPlayback(
      pending.soundGlobal, pending.musicLoudness, true);
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
    UI.renderRooms(state, portraitUrlFor);
    UI.renderConfirmQuit(state);
    UI.renderConfirmStop(state);
    UI.renderReview(state);
    UI.renderShiftOverAcknowledgement(state);
    UI.renderPatientsSeen(state, portraitUrlFor);
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
    stopShiftScheduler(); /* never two schedulers, however fast a restart */

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
    /* The clock does NOT start here: it waits, frozen at full time, for
       the first waiting-patient tap (startShiftClockIfNeeded). */
    topUpPortraitReserve();
  }

  /* ----------------------------------------------------------------------
     5b. Shift scheduler (Phase 7; start trigger revised 2026-08-06).
     One 250ms interval per shift. The anchor is the monotonic moment the
     shift's ACTIVE time started; while paused (a confirm dialog or a
     hidden tab - the Chart deliberately does NOT pause) each callback
     moves the anchor forward instead of advancing the clock, so game
     time simply freezes (doc 8 pause model). The clock starts when the
     player selects their FIRST patient - until that tap they may study
     the waiting room for as long as they like, with no ticks, no
     arrivals, and no elapsed time (John, 2026-08-06; this replaced the
     old 2-second acclimation delay). The interval removes itself when
     the shift stops being active for any reason (timer, END SHIFT
     EARLY, QUIT).
     ------------------------------------------------------------------- */

  const scheduler = {
    intervalId: null,
    anchorMs: null
  };

  function startShiftClockIfNeeded() {
    if (scheduler.intervalId !== null) return; /* already running */
    if (state.phase !== "active") return;
    scheduler.anchorMs = context.monotonicNowMs();
    scheduler.intervalId = setInterval(runSchedulerCallback, 250);
    /* RUSH plays one clock tick the moment its clock starts (doc 3). */
    if (state.settings.mode === "rush") playGameSound("tick");
  }

  function stopShiftScheduler() {
    if (scheduler.intervalId !== null) clearInterval(scheduler.intervalId);
    scheduler.intervalId = null;
    scheduler.anchorMs = null;
  }

  function runSchedulerCallback() {
    if (state.phase !== "active") {
      stopShiftScheduler();
      return;
    }

    const nowMs = context.monotonicNowMs();

    if (!GAME.schedulerCanRun(state)) {
      /* Paused: hold elapsed time still by dragging the anchor along. */
      scheduler.anchorMs = nowMs - state.shift.elapsedMs;
      return;
    }

    const result = GAME.advanceShiftTime(
      state, nowMs - scheduler.anchorMs, context);

    if (result.shiftEnded) {
      /* The completion dong wins over every coincident cue (doc 3). */
      playGameSound("endDong");
      GAME.assertStateInvariants(state, "advanceShiftTime");
      stopShiftScheduler();
      renderAll();
      /* The acknowledgement is what the player must act on next, so it
         takes focus: a keyboard player can finish a shift without a
         mouse (doc 9 Phase 11). */
      ui.shiftOverOverlay.focus();
      return;
    }

    if (result.timeChanged) {
      for (const cueName of result.soundCues) playGameSound(cueName);
      for (let i = 0; i < result.doinks; i++) playGameSound("doink");
      if (result.blockedShake) UI.showWaitingBlockedShake();
      if (result.queueChanged) {
        GAME.assertStateInvariants(state, "rushArrival");
        UI.renderWaiting(state, portraitUrlFor);
        topUpPortraitReserve();
      }
      if (result.countdownNumeral !== null) {
        UI.showCountdownNumeral(result.countdownNumeral);
      }
      UI.renderGameHeader(state);
    }
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

  /* Cancel: discard the edits AND anything they auditioned. The red X
     already means "forget what I just did", so a music preview has to
     fall back to the saved setting - if it was playing at hi before the
     board opened, it is playing at hi again (John, 2026-08-07). */
  function cancelPopup() {
    state.overlay = null;
    UI.closePopup();
    syncMusicPlayback();
  }

  function wirePopupEvents() {
    /* Red X: cancel - discard edits and close. */
    ui.popupCloseButton.addEventListener("click", cancelPopup);

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
      if (event.target === ui.popupLayer) cancelPopup();
    });

    /* Mode radios swap which shift-length group is visible. */
    for (const radio of document.querySelectorAll(
      'input[name="settingMode"]')) {
      radio.addEventListener("change", UI.renderModeLengthVisibility);
    }

    /* Sound levels AUDITION as they are tapped (John, 2026-08-07): the
       board lives on HOME, so without this a player is choosing a volume
       they cannot hear. Each tap is a real user gesture, which is also
       what lets iOS start the stream. Nothing is persisted until apply.

       KING-FM follows the pending selection; GLOBAL SOUND re-auditions
       it, so switching global off silences the preview too. */
    for (const radio of document.querySelectorAll(
      'input[name="settingMusicLoudness"]')) {
      radio.addEventListener("change", auditionMusic);
    }
    for (const radio of document.querySelectorAll(
      'input[name="settingSoundGlobal"]')) {
      radio.addEventListener("change", () => {
        auditionMusic();
        auditionGameSound();
      });
    }
    /* Game sounds have nothing continuous to preview, so a tap plays one
       representative sound at the level chosen. */
    for (const radio of document.querySelectorAll(
      'input[name="settingGameLoudness"]')) {
      radio.addEventListener("change", auditionGameSound);
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
      /* The first selection of the shift is what starts the clock. */
      startShiftClockIfNeeded();
      if (result.doink) playGameSound("doink");
      UI.renderWaiting(state, portraitUrlFor);
      UI.renderPatient(state, portraitUrlFor);
      /* Selection may have finalized an assigned case: that door closes. */
      UI.renderRooms(state, portraitUrlFor);
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
        UI.renderRooms(state, portraitUrlFor);
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
      UI.renderRooms(state, portraitUrlFor);
      UI.renderPatient(state, portraitUrlFor);
      UI.renderWaiting(state, portraitUrlFor);
      UI.renderGameHeader(state);
      /* After renderRooms so the pulse lands on the freshly built door. */
      showTransientAssignmentFeedback(assignment.outcome, roomKey);
    });

    /* The sound icon is the GLOBAL SOUND setting, not a per-shift mute
       (John, 2026-08-07): it writes the preference, so the settings board
       agrees with it, it survives the shift, and music follows it too.
       The tap is a user gesture, so restarting the stream is legal. */
    ui.gameSoundButton.addEventListener("click", () => {
      GAME.toggleGlobalSound(state);
      GAME.savePreferences(state, context);
      UI.renderGameHeader(state);
      syncMusicPlayback();
    });

    /* Both confirm dialogs pause the clock through the "confirmation"
       pause reason (game.js owns the overlay + reason together). */
    ui.quitGameButton.addEventListener("click", () => {
      if (!GAME.openConfirmDialog(state, "quit")) return;
      UI.renderConfirmQuit(state);
    });

    ui.confirmQuitCancel.addEventListener("click", () => {
      GAME.closeConfirmDialog(state);
      UI.renderConfirmQuit(state);
      ui.quitGameButton.focus();
    });

    ui.confirmQuitAccept.addEventListener("click", () => {
      GAME.quitShift(state);
      GAME.assertStateInvariants(state, "quitShift");
      renderAll();
    });

    /* Stop confirms first: ending early is final (John, 2026-08-04). */
    ui.stopGameButton.addEventListener("click", () => {
      if (!GAME.openConfirmDialog(state, "stop")) return;
      UI.renderConfirmStop(state);
    });

    ui.confirmStopCancel.addEventListener("click", () => {
      GAME.closeConfirmDialog(state);
      UI.renderConfirmStop(state);
      ui.stopGameButton.focus();
    });

    ui.confirmStopAccept.addEventListener("click", () => {
      GAME.stopShift(state, "stop", context);
      GAME.assertStateInvariants(state, "stopShift");
      renderAll();
      ui.shiftOverOverlay.focus();
    });

    /* Switching away from the tab pauses the clock (doc 8 pause model);
       coming back resumes it, without trying to catch up missed time. */
    document.addEventListener("visibilitychange", () => {
      GAME.setDocumentHidden(state, document.hidden);
      /* Returning from an app switch can leave iOS audio "interrupted";
         nudge it back so the next cue is not silently dropped (TODO 9). */
      if (!document.hidden && audioContext &&
          audioContext.state !== "running") {
        audioContext.resume().catch(() => {});
      }
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

  /* The review browser's twin (John, 2026-08-06): the same ephemeral
     larger-photo view over the Patients Seen clipboard.
     renderPatientsSeen resets it closed on every rebuild, so patient
     navigation never carries an open zoom across. */
  function isSeenZoomOpen() {
    return !ui.seenZoomView.hidden;
  }

  function openSeenZoom() {
    UI.renderSeenPortraitZoom(state, portraitUrlFor, true);
    const closeButton = ui.seenZoomView.querySelector(".chart-zoom-close");
    if (closeButton) closeButton.focus();
  }

  function closeSeenZoom() {
    UI.renderSeenPortraitZoom(state, portraitUrlFor, false);
    /* Back to the magnifier that opened it. */
    const zoomButton = ui.seenMount.querySelector(".chart-zoom-button");
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
    /* One button covering the frame: a tap anywhere, Enter, or Space all
       arrive here and reveal the summary already rendered underneath. */
    ui.shiftOverOverlay.addEventListener("click", () => {
      GAME.dismissShiftOverAcknowledgement(state);
      GAME.assertStateInvariants(state, "dismissShiftOver");
      renderAll();
      /* Hand focus to the summary's first real action, so the keyboard
         path continues instead of falling back to the document. */
      const nextFocus = ui.patientsSeenButton.disabled
        ? ui.returnToLobbyButton
        : ui.patientsSeenButton;
      nextFocus.focus();
    });

    /* --- Direction counters: hover explains, tap pins (doc 7) ---
       The hover swap is pure CSS (:hover on the button). Tap needs this
       class because iOS has no hover: it pins the same swap, and tapping
       the pinned counter again restores its number. A pin also times out
       on its own (John, 2026-08-06), so a phone reader is returned to the
       numbers without a second tap. DOM-only ephemera - no state action,
       no re-render; renderReview resets the classes, and a timer firing
       after that reset is harmless. */
    const DIRECTION_PIN_TIMEOUT_MS = 5000;
    const directionButtons = [ui.reviewUnderButton, ui.reviewOverButton];
    let directionPinTimer = null;
    const setDirectionPin = (pinnedButton) => {
      clearTimeout(directionPinTimer);
      for (const button of directionButtons) {
        const pinned = button === pinnedButton;
        button.classList.toggle("is-active", pinned);
        button.setAttribute("aria-pressed", String(pinned));
      }
      if (pinnedButton) {
        directionPinTimer =
          setTimeout(() => setDirectionPin(null), DIRECTION_PIN_TIMEOUT_MS);
      }
    };
    for (const button of directionButtons) {
      button.addEventListener("click", () => {
        setDirectionPin(button.classList.contains("is-active")
          ? null
          : button);
      });
    }

    /* --- Patients Seen browser --- */

    ui.patientsSeenButton.addEventListener("click", () => {
      if (!GAME.openPatientsSeen(state)) return;
      GAME.assertStateInvariants(state, "openPatientsSeen");
      renderAll();
      UI.updatePatientsSeenScrollHints();
      ui.seenCloseButton.focus();
    });

    const closePatientsSeenAndRestoreFocus = () => {
      if (!GAME.closePatientsSeen(state)) return;
      GAME.assertStateInvariants(state, "closePatientsSeen");
      renderAll();
      /* Focus returns to the action that opened it (doc 9). */
      ui.patientsSeenButton.focus();
    };

    ui.seenCloseButton.addEventListener("click",
      closePatientsSeenAndRestoreFocus);

    /* Navigation wraps; with one patient it lands back on that patient
       rather than dead-ending (doc 9). */
    const stepPatientsSeen = (direction) => {
      if (!GAME.stepPatientsSeen(state, direction)) return;
      GAME.assertStateInvariants(state, "stepPatientsSeen");
      renderAll();
      UI.updatePatientsSeenScrollHints();
    };

    ui.seenPreviousButton.addEventListener("click",
      () => stepPatientsSeen("previous"));
    ui.seenNextButton.addEventListener("click",
      () => stepPatientsSeen("next"));

    ui.seenScroll.addEventListener("scroll", UI.updatePatientsSeenScrollHints);

    ui.seenMoreAbove.addEventListener("click", () => {
      ui.seenScroll.scrollBy({
        top: -ui.seenScroll.clientHeight * 0.7, behavior: "smooth" });
    });

    ui.seenMoreBelow.addEventListener("click", () => {
      ui.seenScroll.scrollBy({
        top: ui.seenScroll.clientHeight * 0.7, behavior: "smooth" });
    });

    /* The zoom view's close box is rebuilt with its content, so this is
       delegated. A tap on the scrim itself also closes (doc 7). */
    ui.seenZoomView.addEventListener("click", (event) => {
      if (event.target.closest(".chart-zoom-close") ||
          event.target === ui.seenZoomView) {
        closeSeenZoom();
      }
    });

    /* Answer and Clinical are unlocked here, and toggling them is
       deliberately DOM-only: review expansion must not disturb the
       shift's Clinical preference (doc 5). */
    ui.seenMount.addEventListener("click", (event) => {
      /* The photo's zoom hit box opens the larger view. */
      if (event.target.closest("[data-chart-zoom]")) {
        openSeenZoom();
        return;
      }
      const header = event.target.closest("[data-chart-section]");
      if (!header) return;
      const bodyClass = header.dataset.chartSection === "answer"
        ? ".chart-answer-body"
        : ".chart-clinical-body";
      const body = ui.seenMount.querySelector(bodyClass);
      if (!body) return;
      const nowExpanded = body.hidden;
      body.hidden = !nowExpanded;
      header.setAttribute("aria-expanded", String(nowExpanded));
      UI.updatePatientsSeenScrollHints();
    });

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
        cancelPopup();
      } else if (state.overlay === "chart") {
        /* Escape peels one layer: the larger photo first, then the chart. */
        if (isPortraitZoomOpen()) closePortraitZoom();
        else closeChartAndRestoreFocus();
      } else if (state.overlay === "confirm-quit") {
        GAME.closeConfirmDialog(state);
        UI.renderConfirmQuit(state);
        ui.quitGameButton.focus();
      } else if (state.overlay === "confirm-stop") {
        GAME.closeConfirmDialog(state);
        UI.renderConfirmStop(state);
        ui.stopGameButton.focus();
      } else if (state.overlay === "patients-seen") {
        /* Escape peels one layer here too: the larger photo first. */
        if (isSeenZoomOpen()) {
          closeSeenZoom();
          return;
        }
        GAME.closePatientsSeen(state);
        GAME.assertStateInvariants(state, "closePatientsSeen");
        renderAll();
        ui.patientsSeenButton.focus();
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
