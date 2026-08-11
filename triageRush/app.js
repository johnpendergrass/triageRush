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
     3. Music (local playlist)
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

  /* The rolling portrait reserve, in John's own words (2026-08-09):
     "we could pre-load the first 10 patient images from that list, and
     anytime the # got to 5 or below, refill the pre-loaded patient images
     up to 10 total... sort of like refilling a cash card." */
  const PORTRAIT_RESERVE_TARGET = 10;
  const PORTRAIT_RESERVE_LOW = 5;

  /* How long the entrance art may take before the boot splash appears.
     Short enough that nobody watches a half-built screen; long enough
     that a warm reload never flashes a loading screen at all. */
  const BOOT_SPLASH_DELAY_MS = 400;

  /* The entrance is revealed anyway if the art has not decoded by then.
     A missing file or a stalled decode must NEVER leave the player on a
     permanent loading screen - that would be a worse failure than the
     symptom this work exists to fix. */
  const BOOT_ART_TIMEOUT_MS = 8000;

  function portraitUrlFor(patientId) {
    return ASSETS.patients.portraitPath(patientId);
  }

  const loading = {
    /* Which stage is running, named for the status line and the splash.
       The old patientsLoaded/patientsTotal counter went with the 160
       separate fetches: there is one compilation file now, so counting
       records as they arrive would be a fiction. */
    step: "art",
    ready: false,
    failed: false,
    errorMessage: ""
  };

  function delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  /* ----------------------------------------------------------------------
     2. Image and patient loading.

     ONE RULE GOVERNS THIS SECTION (2026-08-09). Warm the URL the game
     will actually paint, and where a real element exists, decode THAT
     element. A throwaway `new Image()` warms bytes in the browser's
     cache; it does not hand a decoded bitmap to the <img> that ui.js
     builds later. That is why the entrance, the door overlay and the two
     settings boards - all of which have permanent elements - go through
     decodeElement, while art with no element yet (portraits, room and
     waiting scenes) goes through loadImage.

     Nothing is RETAINED here but URL strings. Holding Image objects
     alive would not help the elements ui.js creates, and a 1024px
     portrait costs about 4 MB once decoded - a few dozen of those is an
     iOS tab that gets reaped mid-shift.
     ------------------------------------------------------------------- */

  /* Every image URL that has been REQUESTED - which is deliberately not
     the same as "finished loading". The portrait reserve counts this set,
     so a top-up a second later does not re-fire ten requests that are
     still in flight. */
  const requestedImageUrls = new Set();

  /* A dropped connection is not a missing file, so every image gets one
     second chance (2026-08-09). Found by testing on a throttled
     connection: the dev server answered one of the 43 parallel art
     requests with 200 and zero bytes, which failed the whole manifest
     check, disabled START SHIFT for the session, and reported a file
     that was sitting right there on disk as "missing". A phone on a
     weak signal would do the same thing. A file that is genuinely
     absent still fails - it just has to fail twice. */
  const IMAGE_RETRY_DELAY_MS = 250;

  function loadImage(imagePath, retriesRemaining = 1) {
    requestedImageUrls.add(imagePath);
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(imagePath);
      image.onerror = () => {
        if (retriesRemaining > 0) {
          delay(IMAGE_RETRY_DELAY_MS)
            .then(() => loadImage(imagePath, retriesRemaining - 1))
            .then(resolve, reject);
          return;
        }
        reject(new Error("missing image: " + imagePath));
      };
      image.src = imagePath;
    });
  }

  /* Wait for an <img> already in the page to be ready to PAINT.
     decode() is feature-detected for older Safari, and its rejections are
     swallowed on purpose: it can reject for reasons that do not matter
     here, and no screen may ever hang waiting for one. A file that is
     genuinely missing is caught by verifyAllManifestImages instead. */
  function decodeElement(imageElement) {
    if (typeof imageElement.decode !== "function") return Promise.resolve();
    return imageElement.decode().catch(() => {});
  }

  /* Stage 1: the art HOME cannot appear without. The srcs are set on the
     REAL elements and awaited on the real elements - that pairing is what
     makes the entrance arrive complete instead of lettering-first.

     The two settings boards are decoded here too even though nothing
     shows them yet (TODO 18): doing it now is what makes the first board
     open instantly, and an image inside a hidden subtree is fetched but
     not necessarily decoded, so setting the src early would not be
     enough on its own. */
  async function revealEdEntrance() {
    ui.homeBackground.src = ASSETS.lobby.background;
    ui.startShiftArt.src = ASSETS.lobby.doorOverlayStartShift;
    ui.popupBlackboardArt.src = ASSETS.lobby.settingsBlackboard;
    ui.popupWhiteboardArt.src = ASSETS.lobby.aboutWhiteboard;

    await Promise.all([
      decodeElement(ui.homeBackground),
      decodeElement(ui.startShiftArt),
      decodeElement(ui.popupBlackboardArt),
      decodeElement(ui.popupWhiteboardArt)
    ]);
  }

  /* Stage 2a: ONE request for all 160 canonical patient records
     (2026-08-09). It used to be 160 separate fetches, which cost about
     two seconds on the phone before a shift could start.

     The compilation is generated output - patient-data/patient-json/ is
     still the authored source of truth - so the checks here are worth
     their keep: a stale or half-written file must fail loudly and name
     its own repair. */
  async function loadPatientCompilation() {
    const compilationPath = ASSETS.patients.compilationPath;
    const response = await fetch(compilationPath);
    if (!response.ok) {
      throw new Error(`${compilationPath} missing `
        + `(HTTP ${response.status}) - run build-patient-compilation.py`);
    }

    let envelope;
    try {
      envelope = await response.json();
    } catch (parseError) {
      throw new Error("patients-all.json is unreadable - regenerate it "
        + "with build-patient-compilation.py");
    }

    if (!envelope || envelope.schema !== "triageRush-patient-compilation"
      || envelope.version !== 1 || !Array.isArray(envelope.patients)) {
      throw new Error("patients-all.json is not a patient compilation - "
        + "regenerate it with build-patient-compilation.py");
    }

    /* Index what arrived, then walk the MANIFEST - assets.js owns which
       patients must exist, and the compilation only carries them. */
    const arrivedById = {};
    for (const record of envelope.patients) {
      if (record && typeof record.id === "string") {
        arrivedById[record.id] = record;
      }
    }

    const validated = {};
    for (const patientId of ASSETS.patients.ids) {
      const record = arrivedById[patientId];
      if (!record) {
        throw new Error(`patient ${patientId} missing from patients-all.json`
          + " - regenerate it with build-patient-compilation.py");
      }
      const problems = GAME.validatePatientRecord(record, patientId);
      if (problems.length > 0) {
        throw new Error(`patient ${patientId} invalid: ${problems[0]}`);
      }
      validated[patientId] = record;
    }

    /* All or nothing: ui.js dereferences records without guards, so a
       partial corpus must never become visible. */
    Object.assign(patientsById, validated);
  }

  /* Stage 2b: verify every manifest image exists. This also warms the
     shared game artwork. The four lobby images stay in the list even
     though revealEdEntrance already decoded them: they are already in
     cache so it costs nothing, and it keeps ONE place that proves every
     manifest entry is really on disk. */
  async function verifyAllManifestImages() {
    const paths = window.TRIAGE_RUSH_LIST_ALL_IMAGE_ASSET_PATHS();
    await Promise.all(paths.map(loadImage));
  }

  async function runStageTwoLoading() {
    try {
      loading.step = "patients";
      UI.renderLoadingStatus(loading);

      /* The serving order is shuffled the moment the records land, and
         the first ten portraits go out immediately - the deck is what
         says WHICH ten (John's rule, 2026-08-09). */
      const patientsReady = loadPatientCompilation().then(() => {
        GAME.initializeDeck(state, context);
        topUpPortraitReserve();
        loading.step = "artwork";
        UI.renderLoadingStatus(loading);
      });

      await Promise.all([patientsReady, verifyAllManifestImages()]);
      loading.ready = true;
    } catch (loadError) {
      loading.failed = true;
      loading.errorMessage = String(loadError.message || loadError);
      console.error("triageRush loading failed:", loadError);
    }
    UI.renderLoadingStatus(loading);
  }

  /* The cash-card refill. Fire-and-forget: failures are tolerable here
     because handleStartShift blocks on the portraits a shift actually
     needs before it starts.

     The count is of REQUESTED urls, not loaded ones, which is what stops
     three taps in a row from firing thirty requests for ten images. */
  function topUpPortraitReserve() {
    if (state.deck.ids.length === 0) return;

    /* Keep enough unused cards ahead of the cursor to fill the reserve;
       without this the peek runs dry near the end of the order and the
       reshuffle would ambush us mid-shift with ten cold portraits. */
    GAME.topUpDeckRunway(state, context);

    const upcomingIds = GAME.peekUpcomingPatientIds(
      state, PORTRAIT_RESERVE_TARGET);
    const warmCount = upcomingIds.filter(
      patientId => requestedImageUrls.has(portraitUrlFor(patientId))).length;
    if (warmCount > PORTRAIT_RESERVE_LOW) return;

    for (const patientId of upcomingIds) {
      loadImage(portraitUrlFor(patientId)).catch(() => {});
    }
  }

  /* A stored shift can name patients the reserve never covered - it was
     played before this page load, or long enough ago that its portraits
     were never requested (John, 2026-08-09). Warming them is
     non-blocking on purpose: the report's own summary needs no
     portraits, and Patients Seen shows one at a time. */
  function warmLedgerPortraits() {
    for (const patientId of state.ledger.order) {
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
     2026-08-07): commercial music is mastered far hotter than these
     synthesized blips, so sharing one map made the music drown them. This
     is background audio, not a music player. These are amplitudes and
     loudness is roughly logarithmic, so 0.24 sits about 12dB below full
     and 0.08 about 22dB below.

     DOUBLED TWICE on 2026-08-10 (John: "the volume was too low in game",
     then "double it again"): 0.02/0.06 -> 0.04/0.12 -> 0.08/0.24. The
     original pair had been settled by ear on 2026-08-08 - but against the
     OLD music: five band-limited 24 kbps tracks with the AM-radio filter
     baked in. The set they now play is nine full-range 64 kbps tracks,
     and it needed four times the level.

     NOTE the neighbourhood this has reached: "hi" music at 0.24 is now
     just past GAME SOUNDS at "lo" (0.22). Music still sits far under game
     sounds at "hi" (1.0), which is the pairing that matters, but the two
     families are no longer separated by an order of magnitude.

     THIS IS THE KNOB FOR "ALL THE MUSIC IS TOO QUIET". The per-track
     "gain" in music-manifest.json is for ONE track sitting wrong against
     the others; setting every gain to the same number is this change
     written in the wrong place, and it spends a trim that cannot then be
     used for balance. If the music level ever needs changing again,
     change these two numbers and nothing else. */
  const MUSIC_VOLUME = { off: 0, lo: 0.08, hi: 0.24 };

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
    /* Release the music too. A page on its way out - or frozen into the
       back/forward cache - must not keep playing, because the next page
       has its own audio element and no way to reach this one
       (2026-08-07). */
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
     3. Music: a local playlist.

     Nine files, played in manifest order, looping forever. Music plays
     EVERYWHERE - the ER ENTRANCE, the shift, the report - and a new shift
     never interrupts it. Playback needs all three of: the unlock (the
     player's middle initial), GLOBAL SOUND on, and a MUSIC level above
     off. Starting from silence begins at the track the RIGHT initial
     chose, or the first track when it chose none.

     Why files beat the stream: the stream was cross-origin, so routing it
     through a Web Audio gain node needed CORS, which iOS refused to play
     at all - leaving the iPhone with no volume control over music
     whatsoever. These files are same-origin, so the gain node just works
     and lo/hi are real on the phone. All the CORS and fallback machinery
     that existed only to fight that is gone.

     The delivered sound is BAKED INTO THE FILES, not applied here (see
     github-excluded/dev-tools/_audio-transcode/transcode-music.sh, which
     lives outside the published tree). Nothing in the game filters audio.
     The AM-radio filter that used to be baked in was dropped on 2026-08-10
     in favour of clean full-range music.
     ------------------------------------------------------------------- */

  const musicElement = new Audio();
  /* Nothing is fetched until a track is actually chosen - a player who
     has not unlocked music never requests one. */
  musicElement.preload = "none";

  /* Index into the CURRENT FOLDER's track list in the music manifest.
     -1 means "nothing loaded yet", which is also what a FULL STOP resets
     to, so the next start begins at that folder's track 0. A pause leaves
     it alone, which is what lets music resume where it was
     (John, 2026-08-09). */
  let musicTrackIndex = -1;

  /* iOS IGNORES HTMLMediaElement.volume - Apple reserves media volume for
     the hardware buttons, so setting .volume is a silent no-op there. A
     Web Audio GainNode IS honored, so the level lives on the gain node and
     the element is left wide open.

     An element can be routed only ONCE, and only into one context, so this
     is created lazily and never rebuilt. Because the audio then flows
     through the context, a suspended context silences music as well as
     game sounds - which the resume-from-any-state handling above already
     covers (TODO 9). */
  let musicSourceNode = null;
  let musicGainNode = null;

  function musicOutput(audio) {
    if (musicSourceNode) {
      /* The context was rebuilt (an iOS pagehide close, say) and this
         element belongs to the old one. It cannot be re-routed, so fall
         back to the element's own volume - correct everywhere but iOS. */
      return musicSourceNode.context === audio ? musicGainNode : null;
    }
    try {
      musicSourceNode = audio.createMediaElementSource(musicElement);
      musicGainNode = audio.createGain();
      musicSourceNode.connect(musicGainNode).connect(audio.destination);
      return musicGainNode;
    } catch (routingError) {
      console.warn("triageRush: music could not route through Web Audio",
        routingError);
      return null;
    }
  }

  /* Load a track and play it. Index wraps, which is the whole looping
     rule: the last track's "ended" hands back to the first. */
  /* The manifest, fetched ONCE and only when music is first wanted. A
     locked player never requests it, which is the same rule the audio
     files follow. null = not fetched yet; a failed fetch leaves it null so
     a later attempt can retry. */
  let musicManifest = null;

  async function loadMusicManifest() {
    if (musicManifest) return musicManifest;
    const response = await fetch(ASSETS.music.manifestPath);
    if (!response.ok) {
      throw new Error(`music manifest missing (HTTP ${response.status})`);
    }
    const envelope = await response.json();
    if (!envelope || envelope.schema !== "triageRush-music-manifest"
      || !envelope.folders) {
      throw new Error("music manifest is not a music manifest");
    }
    musicManifest = envelope;
    return musicManifest;
  }

  /* The folder whose tracks are currently loaded. There is only one
     playlist now (2026-08-10), so this no longer detects a CHANGE of
     folder - it is what the "ended" handler reads to know where to find
     the next track, and null is how a full stop is recognised. */
  let musicFolderPlaying = null;

  /* The track number the RIGHT initial asked for LAST TIME playback was
     applied - not the track that happens to be playing.

     That distinction is the whole trick (2026-08-09). Playback advances on
     its own (pick 2 and it runs 2, 3, 1...), so comparing the selection
     against the CURRENT track would drag it back to 2 at every settings
     change. Comparing it against the last selection instead means only a
     real change of the initial jumps the playlist, which is exactly what
     John asked for: "if the player increases or decreases the number, then
     that new track # is started immediately". */
  let musicSelectionApplied = null;

  function musicTracksFor(folderName) {
    const folders = musicManifest ? musicManifest.folders : null;
    const tracks = folders ? folders[folderName] : null;
    return Array.isArray(tracks) && tracks.length > 0 ? tracks : null;
  }

  /* The level last applied, kept so a track change can re-apply the gain
     with the NEW track's trim without waiting for a settings change. */
  let musicLevelValue = 0;

  /* Per-track trim from the manifest, multiplied into the family level.
     This is John's hand knob for the one track loudnorm judged wrong; it
     needs no re-transcode, and 1.0 means "as transcoded". */
  function applyMusicGain(track) {
    const trim = track && typeof track.gain === "number" ? track.gain : 1;
    const audio = ensureAudioContext();
    const gain = audio ? musicOutput(audio) : null;
    if (gain) {
      /* The gain node is the ONLY attenuation; leave the element open. */
      gain.gain.value = musicLevelValue * trim;
      musicElement.volume = 1;
    } else {
      musicElement.volume = Math.min(1, musicLevelValue * trim);
    }
  }

  function startMusicTrack(folderName, trackIndex) {
    const tracks = musicTracksFor(folderName);
    if (!tracks) return Promise.resolve();
    musicTrackIndex = ((trackIndex % tracks.length) + tracks.length)
      % tracks.length;
    musicFolderPlaying = folderName;
    const track = tracks[musicTrackIndex];
    musicElement.src = ASSETS.music.trackPath(folderName, track.file);
    applyMusicGain(track);
    return musicElement.play();
  }

  musicElement.addEventListener("ended", () => {
    /* Only continue if music is still wanted - the setting can change
       while a track is running. */
    if (!GAME.musicAudible(state)) return;
    startMusicTrack(musicFolderPlaying, musicTrackIndex + 1)
      .catch((playError) => {
        console.warn("triageRush: next music track could not start", playError);
      });
  });

  /* A missing or unplayable file should cost the game nothing. Say so once
     and stop; the shift is unaffected. */
  musicElement.addEventListener("error", () => {
    if (musicTrackIndex < 0) return;
    console.warn("triageRush: music track failed to load",
      musicElement.currentSrc);
    UI.showMusicStatusNote(
      "Music could not be played. The game is unaffected.");
  });

  /* Playback is driven by explicit values rather than by state, because
     the settings board AUDITIONS a level before it is applied - what you
     hear while choosing is the pending selection, not the saved one
     (John, 2026-08-07). isAudition only changes what a failure may do:
     a preview must never write preferences.

     THE PLAYER NAME is passed in too, for the same reason (2026-08-09).
     It used to be read from state on the grounds that "the music rows
     cannot change it" - true then, wrong now: the PLAYER NAME board's
     drums choose both the playlist and the track, and John wants to hear
     a change while spinning rather than after pressing the green check.
     Passing null means "use the saved name". */
  async function applyMusicPlayback(soundGlobal, musicLoudness, isAudition,
    pendingPlayer) {
    const playerView = { player: pendingPlayer || state.player };

    /* The middle initial unlocks the music; no unlock, no music. Losing it
       is a FULL STOP - not a pause - because the player's name no longer
       asks for this music at all. */
    if (!GAME.musicUnlocked(playerView)) {
      stopMusicPlayback();
      return;
    }
    const folderName = GAME.GAME_CONSTANTS.MUSIC_FOLDER;

    /* Merely turning the sound off is a PAUSE, so switching it back on
       picks the same track up where it was. */
    if (!soundGlobal || musicLoudness === "off") {
      pauseMusicPlayback();
      return;
    }

    musicLevelValue = MUSIC_VOLUME[musicLoudness] ?? MUSIC_VOLUME.hi;

    /* The manifest is fetched here rather than at boot, so a locked player
       never requests it either. A failure costs the game nothing. */
    try {
      await loadMusicManifest();
    } catch (manifestError) {
      console.warn("triageRush: music manifest could not be read",
        manifestError);
      if (!isAudition) {
        UI.showMusicStatusNote(
          "Music could not be played. The game is unaffected.");
      }
      return;
    }

    const tracks = musicTracksFor(folderName);
    if (!tracks) {
      console.warn("triageRush: no tracks for music folder", folderName);
      if (!isAudition) {
        UI.showMusicStatusNote(
          "Music could not be played. The game is unaffected.");
      }
      return;
    }

    /* The RIGHT initial picks the starting track, clamped to what the
       folder actually holds - John's "once they pick too high a number
       just play the highest numbered track". No digit means track one. */
    const selection = GAME.musicTrackNumber(playerView);
    const selectedIndex = selection === null
      ? 0
      : Math.min(selection, tracks.length) - 1;
    /* KNOWN, AND DELIBERATELY LEFT (John, 2026-08-09: "don't fix that, it
       is ok"). This compares the raw digit, not the track it resolves to,
       so changing the right initial from "1" to a LETTER restarts the song
       that was already playing: 1 and null both mean track one, but they
       are not equal. Same for 9 -> 3 when a folder holds three tracks.

       The fix, if it ever becomes annoying, is one line: compare
       selectedIndex instead of selection. It was not taken because a
       restart is harmless and the raw comparison is the easier one to
       reason about. */
    const selectionChanged = selection !== musicSelectionApplied;
    musicSelectionApplied = selection;

    try {
      /* A CHANGED selection jumps straight to that track, even mid-play. */
      if (selectionChanged && musicTrackIndex >= 0) {
        await startMusicTrack(folderName, selectedIndex);
        return;
      }

      /* Already playing and the selection did not move: this was a level
         change, so re-apply the gain with the CURRENT track's trim and
         leave the track alone. */
      if (musicTrackIndex >= 0 && !musicElement.paused) {
        applyMusicGain(tracks[musicTrackIndex]);
        return;
      }

      /* Resuming a track that is merely paused keeps its position; coming
         from a full stop starts at the SELECTED track. */
      if (musicTrackIndex >= 0) {
        applyMusicGain(tracks[musicTrackIndex]);
        await musicElement.play();
      } else {
        await startMusicTrack(folderName, selectedIndex);
      }
    } catch (playError) {
      /* Almost always the browser refusing to start audio without a user
         gesture. Not worth alarming anyone over during an audition. */
      console.warn("triageRush: music could not start", playError);
      if (!isAudition) musicTrackIndex = -1;
    }
  }

  /* TWO WAYS TO STOP, and the difference is the whole feature (John,
     2026-08-09: "in effect make turning off the music in game more like a
     pause").

     PAUSE keeps the track and its position. The <audio> element remembers
     currentTime by itself, so nothing has to be stored - which is also why
     a page reload still starts the playlist over, exactly as John wanted:
     the position lives in the element, never in localStorage. */
  function pauseMusicPlayback() {
    musicElement.pause();
  }

  /* FULL STOP forgets where the playlist was, so the next start begins at
     the selected track rather than resuming. Two callers, for two
     different reasons:
     - pagehide, where the point is to release the element as the page goes
       away (a frozen bfcache page must not keep playing); and
     - losing the unlock, because the player's name no longer asks for this
       music at all.
     (A third caller, CHANGING playlist, existed for one day in 2026-08-09
     and went away with the six-folder model.) */
  function stopMusicPlayback() {
    musicElement.pause();
    musicElement.removeAttribute("src");
    musicTrackIndex = -1;
    musicFolderPlaying = null;
    /* Forget the remembered selection too: a full stop means the next
       start re-reads the right initial from scratch. */
    musicSelectionApplied = null;
  }

  /* Music as the SAVED settings want it - what apply, the sound icon,
     and a cancelled board all fall back to. */
  function syncMusicPlayback() {
    return applyMusicPlayback(
      state.settings.soundGlobal, state.settings.musicLoudness, false);
  }

  /* Music as the SOUND board currently reads. */
  function auditionMusic() {
    const pending = UI.pendingSoundSelections();
    return applyMusicPlayback(
      pending.soundGlobal, pending.musicLoudness, true);
  }

  /* Music as the PLAYER NAME board currently reads (John, 2026-08-09:
     "the player should not have to hit confirm to change songs"). Spinning
     the middle drum switches playlist, spinning the right drum jumps to
     that track, both while the board is still open.

     The red X reverts it for free: cancelPopup() calls syncMusicPlayback(),
     which re-reads the SAVED name and puts the music back. */
  function auditionPlayerMusic() {
    const pendingPlayer = UI.pendingPlayerName();
    if (!pendingPlayer) return Promise.resolve();
    const pending = UI.pendingSoundSelections();
    return applyMusicPlayback(
      pending.soundGlobal, pending.musicLoudness, true, pendingPlayer);
  }

  /* A reload cannot resume music by itself: browsers refuse to start audio
     without a user gesture, so a saved "music on" would look ignored until
     the player happened to open a board. Instead the FIRST tap anywhere -
     the Start Shift door, a board, a patient - quietly starts the playlist
     if the settings want it (John's default, 2026-08-07). It begins at
     track one, because a reload is a fresh app.

     One-shot: both listeners come off the moment either fires, so this
     costs nothing for the rest of the session. */
  function startMusicOnFirstGesture() {
    const handleFirstGesture = () => {
      document.removeEventListener("pointerdown", handleFirstGesture);
      document.removeEventListener("keydown", handleFirstGesture);
      if (GAME.musicAudible(state)) syncMusicPlayback();
    };
    document.addEventListener("pointerdown", handleFirstGesture);
    document.addEventListener("keydown", handleFirstGesture);
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
    UI.renderConfirmReset(state);
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

    /* Drop any numeral left over from the LAST shift before the game view
       is shown again - a re-displayed element replays its CSS animation,
       which flashed a phantom "1" at the start of every shift after the
       first (John, 2026-08-08). */
    UI.clearCountdownNumeral();

    UI.renderArrivingOverlay(true);

    /* Block until the initial queue portraits (plus the near-term reserve)
       are fetched and decoded; the shift never starts on missing art. */
    const seedCount = state.settings.mode === "rush" ? 2
      : GAME.GAME_CONSTANTS.MIN_VISIBLE_WAITING;
    const requiredIds = GAME.peekUpcomingPatientIds(
      state, seedCount + PORTRAIT_RESERVE_TARGET);
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
      /* stopShift banked the shift into the history; write it out here,
         at the ONE place the clock can end a shift (TODO 11). */
      GAME.saveShiftHistory(state, context);
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

  /* Shared by the cancel button and Escape, so the two cannot drift. */
  function closeResetConfirmation() {
    if (state.overlay !== "confirm-reset") return;
    state.overlay = null;
    UI.renderConfirmReset(state);
    ui.resetPastShiftsButton.focus();
  }

  function wireHomeEvents() {
    ui.playerBoardButton.addEventListener("click", () => {
      state.overlay = "settings-player";
      UI.openPopup("settings-player", state, ui.playerBoardButton);
    });

    ui.shiftBoardButton.addEventListener("click", () => {
      state.overlay = "settings-shift";
      UI.openPopup("settings-shift", state, ui.shiftBoardButton);
    });

    /* REVIEW PAST SHIFTS (TODO 11): opens the browser on the most
       recent stored shift. Both lines are disabled whenever nothing is
       stored, so these only have to guard against a stale click. */
    ui.reviewPastShiftsButton.addEventListener("click", () => {
      if (!GAME.openPastShifts(state)) return;
      GAME.assertStateInvariants(state, "openPastShifts");
      warmLedgerPortraits();
      renderAll();
    });

    /* DELETE PAST SHIFTS confirms first - there is no undo. The
       identifiers still say "reset": the 2026-08-09 change was to the
       player-facing wording only, not a rename. */
    ui.resetPastShiftsButton.addEventListener("click", () => {
      if (!GAME.canResetPastShifts(state)) return;
      state.overlay = "confirm-reset";
      UI.renderConfirmReset(state);
    });

    ui.confirmResetCancel.addEventListener("click", closeResetConfirmation);

    ui.confirmResetAccept.addEventListener("click", () => {
      state.overlay = null;
      GAME.resetPastShifts(state);
      GAME.saveShiftHistory(state, context);
      GAME.assertStateInvariants(state, "resetPastShifts");
      renderAll();
      ui.reviewPastShiftsButton.focus();
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

    /* Every step of an initials drum auditions the music it selects, so a
       playlist or a track can be chosen by ear with the board still open
       (John, 2026-08-09). Registered once; it survives the drums being
       rebuilt on each open. */
    UI.setPlayerWheelListener(() => {
      auditionPlayerMusic().catch(() => {});
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

       MUSIC follows the pending selection; GLOBAL SOUND re-auditions it,
       so switching global off silences the preview too. */
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
      /* The other of the two ways a shift can end (TODO 11). */
      GAME.saveShiftHistory(state, context);
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

    /* The red X is a second door out of the report, doing exactly what
       RETURN TO ER ENTRANCE does (John, 2026-08-08). */
    ui.reviewCloseButton.addEventListener("click", () => {
      GAME.returnToLobby(state);
      GAME.assertStateInvariants(state, "returnToLobby");
      renderAll();
    });

    /* Past-shift browsing. The arrows are named for the DIRECTION IN
       TIME they travel, and this is the only place that maps left and
       right onto it: LEFT walks toward the present, RIGHT walks back
       into the past (John, 2026-08-08). Both wrap. */
    ui.shiftNewerButton.addEventListener("click", () => {
      if (!GAME.stepPastShifts(state, "newer")) return;
      GAME.assertStateInvariants(state, "stepPastShifts");
      warmLedgerPortraits();
      renderAll();
    });

    ui.shiftOlderButton.addEventListener("click", () => {
      if (!GAME.stepPastShifts(state, "older")) return;
      GAME.assertStateInvariants(state, "stepPastShifts");
      warmLedgerPortraits();
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
      } else if (state.overlay === "confirm-reset") {
        closeResetConfirmation();
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
    /* Past shifts live under their own storage key, so a history that
       fails to load cannot cost the player their preferences (TODO 11). */
    GAME.loadShiftHistory(state);
    GAME.assertStateInvariants(state, "boot");

    wireHomeEvents();
    wirePopupEvents();
    wireGameEvents();
    wireChartEvents();
    wireReviewEvents();
    wireKeyboardEvents();
    startMusicOnFirstGesture();

    /* HOME is laid out FIRST, behind the splash cover, so that when the
       entrance art is revealed the boards and their lettering are already
       painted and the whole screen appears at once (2026-08-09). */
    renderAll();

    /* The COVER is already up - it is painted from the first frame, before
       any of this runs, which is the only way to stop the board lettering
       showing through while the scripts load. What is armed here is the
       WORDS: if the art decodes inside BOOT_SPLASH_DELAY_MS, which a warm
       reload always does, the player sees a dark shell for an instant and
       never a loading screen. */
    const splashTimer = setTimeout(
      () => UI.showBootSplashMessage(loading), BOOT_SPLASH_DELAY_MS);

    /* The race is the safety net, not the plan: art that never decodes
       must not hold the entrance hostage. A file that is actually
       missing surfaces through stage 2's manifest verification, which
       reports it in the status line.

       The `finally` is the second half of that guarantee. Now that the
       cover is painted from the first frame rather than switched on by
       this function, anything that throws in here would leave the player
       looking at a dark shell forever - a worse failure than the one all
       this exists to fix. The cover comes off no matter what. */
    try {
      await Promise.race([revealEdEntrance(), delay(BOOT_ART_TIMEOUT_MS)]);
    } catch (artError) {
      console.error("triageRush: entrance art failed", artError);
    } finally {
      clearTimeout(splashTimer);
      UI.hideBootSplash();
    }

    /* Stage 2 runs while the player looks at HOME. */
    runStageTwoLoading();
  }

  boot();

})();
