/* ============================================================================
   triageRush - assets.js
   The single source of truth for every runtime asset path.

   Contract (docs 4, 6, 8):
   - No other file may contain an image/audio path. If a file is later replaced
     by an optimized copy at a new path or format, only this manifest changes.
   - CSS owns every image's rendered box, crop, fit, and alignment. Nothing in
     the game may read an image's natural pixel size to make decisions.
   - CACHE_VERSION must change whenever a runtime asset file is replaced so
     browsers cannot serve a stale copy (Phase 10 requirement).
   ========================================================================= */

"use strict";

const TRIAGE_RUSH_CACHE_VERSION = "2026-0808-about1d";

/* All paths are relative to the site root (where index.html lives). */
const ASSET_ROOT = "./triageRush/assets";
const PATIENT_DATA_ROOT = "./patient-data";

/* ---------------------------------------------------------------------------
   Patient manifest.
   The canonical set is exactly patient-001 through patient-160. The list is
   built by loop rather than typed out 160 times, but it is still an explicit
   ordered manifest: every ID it produces must exist on disk, and loading
   verifies each one individually (Phase 1 gate).
   ------------------------------------------------------------------------ */

const PATIENT_IDS = [];
for (let patientNumber = 1; patientNumber <= 160; patientNumber++) {
  PATIENT_IDS.push("patient-" + String(patientNumber).padStart(3, "0"));
}

function patientJsonPath(patientId) {
  return `${PATIENT_DATA_ROOT}/patient-json/${patientId}.json`;
}

function patientPortraitPath(patientId) {
  return `${PATIENT_DATA_ROOT}/patient-images/${patientId}.png`;
}

/* ---------------------------------------------------------------------------
   Waiting-room backgrounds: 16 interchangeable scenes. Keys are
   "background-1" .. "background-16"; a waiting entry stores one key as its
   waitingBackgroundKey. The background belongs to the ROW, not the
   patient (2026-08-06): a fresh one is chosen whenever a patient enters
   the waiting room, and rows are the only place backgrounds appear.
   ------------------------------------------------------------------------ */

const WAITING_BACKGROUND_KEYS = [];
const waitingBackgrounds = {};
for (let sceneNumber = 1; sceneNumber <= 16; sceneNumber++) {
  const key = "background-" + sceneNumber;
  WAITING_BACKGROUND_KEYS.push(key);
  waitingBackgrounds[key] =
    `${ASSET_ROOT}/game-page/waiting-room-panel/${key}.png`;
}

/* ---------------------------------------------------------------------------
   Room doors: seven rooms, each with open and closed art.
   Room keys are the canonical gameplay identifiers (docs 3, 8).
   ------------------------------------------------------------------------ */

const ROOM_KEYS = [
  "esi-1", "esi-2", "esi-3", "esi-4", "esi-5", "psych", "discharge"
];

const roomDoors = {};
for (const roomKey of ROOM_KEYS) {
  roomDoors[roomKey] = {
    open: `${ASSET_ROOT}/game-page/triage-rooms-panel/door-${roomKey}-open.png`,
    closed: `${ASSET_ROOT}/game-page/triage-rooms-panel/door-${roomKey}-closed.png`
  };
}

/* Layered room composition (TODO item 7, built 2026-08-06): every room
   cell stacks wall -> interior -> patient -> door, back to front. One
   wall image serves all seven rooms; each room has its own interior
   scene, drawn at the door art's aspect so it sits exactly behind the
   doorway. An open door's transparent doorway reveals the interior. */
const ROOMS_WALL_PATH =
  `${ASSET_ROOT}/game-page/triage-rooms-panel/background-wall-for-all-rooms.png`;

const roomInteriors = {};
for (const roomKey of ROOM_KEYS) {
  roomInteriors[roomKey] =
    `${ASSET_ROOT}/game-page/triage-rooms-panel/background-${roomKey}-room.png`;
}

/* ---------------------------------------------------------------------------
   The manifest object consumed by the rest of the application.

   Not listed on purpose (retired or unused by the approved design):
   - lobby-page/boombox.png            (boombox metaphor retired 2026-08-04)
   - game-page/patient-panel/*-bubble  (superseded by the unified chart cards)

   Not listed yet (asset does not exist yet):
   - six vital icons (HR, BP, RR, SpO2, Temp, Pain) - added here when produced.
   ------------------------------------------------------------------------ */

const TRIAGE_RUSH_ASSETS = Object.freeze({
  cacheVersion: TRIAGE_RUSH_CACHE_VERSION,

  lobby: Object.freeze({
    background: `${ASSET_ROOT}/lobby-page/background-w-open-glass-doors.png`,
    doorOverlayStartShift: `${ASSET_ROOT}/lobby-page/glass-door-overlay-start-shift.png`,
    settingsBlackboard: `${ASSET_ROOT}/lobby-page/settings-blackboard.png`,
    aboutWhiteboard: `${ASSET_ROOT}/lobby-page/about-whiteboard.png`
  }),

  game: Object.freeze({
    patientPanelBackground: `${ASSET_ROOT}/game-page/patient-panel/patient-panel-background-hires.png`,
    waitingBackgrounds: Object.freeze(waitingBackgrounds),
    doors: Object.freeze(roomDoors),
    roomsWall: ROOMS_WALL_PATH,
    roomInteriors: Object.freeze(roomInteriors)
  }),

  music: Object.freeze({
    /* Local background music files. SAME-ORIGIN IS THE WHOLE POINT: a
       remote source cannot be routed through a Web Audio gain node
       without CORS, and without that node iOS has no volume control at
       all (it ignores HTMLMediaElement.volume). A local file has no such
       problem - do not move this music to a remote URL.

       ARRAY ORDER IS PLAY ORDER. The player runs straight down this list
       and returns to the top - see app.js section 3. The files are
       deliberately anonymous and carry no metadata; which track is which
       song is recorded outside the repository (see
       assets/_audio-transcode/transcode-music.sh).

       These are NOT preloaded and are NOT part of the loading gate: a
       shift must never wait on music, and a player who has not unlocked
       it should never fetch it. */
    tracks: Object.freeze([
      `${ASSET_ROOT}/audio/track-01.mp3`,
      `${ASSET_ROOT}/audio/track-02.mp3`,
      `${ASSET_ROOT}/audio/track-03.mp3`,
      `${ASSET_ROOT}/audio/track-04.mp3`,
      `${ASSET_ROOT}/audio/track-05.mp3`
    ])
  }),

  patients: Object.freeze({
    ids: Object.freeze(PATIENT_IDS.slice()),
    jsonPath: patientJsonPath,
    portraitPath: patientPortraitPath
  }),

  waitingBackgroundKeys: Object.freeze(WAITING_BACKGROUND_KEYS.slice()),
  roomKeys: Object.freeze(ROOM_KEYS.slice())
});

/* Flat list of every image path, used by the loader to verify that each
   manifest entry actually exists and decodes before a shift can start. */
function listAllImageAssetPaths() {
  const paths = [
    TRIAGE_RUSH_ASSETS.lobby.background,
    TRIAGE_RUSH_ASSETS.lobby.doorOverlayStartShift,
    TRIAGE_RUSH_ASSETS.lobby.settingsBlackboard,
    TRIAGE_RUSH_ASSETS.lobby.aboutWhiteboard,
    TRIAGE_RUSH_ASSETS.game.patientPanelBackground
  ];
  for (const key of TRIAGE_RUSH_ASSETS.waitingBackgroundKeys) {
    paths.push(TRIAGE_RUSH_ASSETS.game.waitingBackgrounds[key]);
  }
  paths.push(TRIAGE_RUSH_ASSETS.game.roomsWall);
  for (const roomKey of TRIAGE_RUSH_ASSETS.roomKeys) {
    paths.push(TRIAGE_RUSH_ASSETS.game.doors[roomKey].open);
    paths.push(TRIAGE_RUSH_ASSETS.game.doors[roomKey].closed);
    paths.push(TRIAGE_RUSH_ASSETS.game.roomInteriors[roomKey]);
  }
  return paths;
}

window.TRIAGE_RUSH_ASSETS = TRIAGE_RUSH_ASSETS;
window.TRIAGE_RUSH_LIST_ALL_IMAGE_ASSET_PATHS = listAllImageAssetPaths;
