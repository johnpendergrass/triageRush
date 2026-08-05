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

const TRIAGE_RUSH_CACHE_VERSION = "2026-0805-phase7i";

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
   waitingBackgroundKey and the background travels with the patient.
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

/* ---------------------------------------------------------------------------
   The manifest object consumed by the rest of the application.

   Not listed on purpose (retired or unused by the approved design):
   - lobby-page/boombox.png            (boombox metaphor retired 2026-08-04)
   - game-page/patient-panel/*-bubble  (superseded by the unified chart cards)

   Not listed yet (reserved for the layered room composition, per John
   2026-08-04: wall, then room interior, then patient, then door). They
   are NOT general screen background art; the rails use a flat color:
   - triage-rooms-panel/background-wall-for-all-rooms.png (base wall layer)
   - triage-rooms-panel/background-*-room.png (room interiors)

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
    doors: Object.freeze(roomDoors)
  }),

  music: Object.freeze({
    /* Classical KING 98.1 FM, Seattle. Secure 128 kbps AAC stream.
       Never autoplays; playback starts only from a user gesture on HOME. */
    kingFmStreamUrl: "https://classicalking.streamguys1.com/KING-FM-128KAAC"
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
  for (const roomKey of TRIAGE_RUSH_ASSETS.roomKeys) {
    paths.push(TRIAGE_RUSH_ASSETS.game.doors[roomKey].open);
    paths.push(TRIAGE_RUSH_ASSETS.game.doors[roomKey].closed);
  }
  return paths;
}

window.TRIAGE_RUSH_ASSETS = TRIAGE_RUSH_ASSETS;
window.TRIAGE_RUSH_LIST_ALL_IMAGE_ASSET_PATHS = listAllImageAssetPaths;
