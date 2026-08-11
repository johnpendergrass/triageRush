/* ============================================================================
   triageRush - assets.js
   The single source of truth for every runtime asset path.

   Contract (docs 4, 6, 8):
   - No other file may contain an image/audio path. If a file is later replaced
     by an optimized copy at a new path or format, only this manifest changes.
   - CSS owns every image's rendered box, crop, fit, and alignment. Nothing in
     the game may read an image's natural pixel size to make decisions.
   - A path here is the WHOLE URL. Nothing may append a "?v=..." query to it
     (2026-08-09). That cache-busting query used to be added by the loader
     and by nobody else, so the URL the game PRELOADED and the URL it later
     PAINTED were two different resources and every preload was wasted -
     which is what made screens paint their text before their background.
     Freshness is handled where it belongs instead: no-cache-server.py
     revalidates art on every request during development, and a replaced
     file gets a new name if a published copy ever needs busting. The five
     "?v=" strings in index.html stay: they version the CODE, which changes
     every session and must never be served stale.
   ========================================================================= */

"use strict";

/* All paths are relative to the site root (where index.html lives). */
const ASSET_ROOT = "./triageRush/assets";
const PATIENT_DATA_ROOT = "./patient-data";

/* ---------------------------------------------------------------------------
   Patient manifest.
   The canonical set is exactly patient-001 through patient-160. The list is
   built by loop rather than typed out 160 times, but it is still an explicit
   ordered manifest: every ID it produces must be present when the records
   load, and each one is validated individually (Phase 1 gate).

   THE RECORDS ARRIVE IN ONE FILE (2026-08-09). patients-all.json is
   GENERATED from the 160 authored files in patient-data/patient-json/ by
   patient-data/build-patient-compilation.py - those files are still the
   source of truth and the only ones anyone edits. Fetching them
   individually cost 160 requests before a shift could start; this manifest
   deliberately no longer exposes a per-patient JSON path, so nothing can
   drift back to the old way.
   ------------------------------------------------------------------------ */

const PATIENT_IDS = [];
for (let patientNumber = 1; patientNumber <= 160; patientNumber++) {
  PATIENT_IDS.push("patient-" + String(patientNumber).padStart(3, "0"));
}

const PATIENT_COMPILATION_PATH = `${PATIENT_DATA_ROOT}/patients-all.json`;

function patientPortraitPath(patientId) {
  return `${PATIENT_DATA_ROOT}/patient-images/${patientId}.webp`;
}

/* ---------------------------------------------------------------------------
   Waiting-room backgrounds: 16 interchangeable scenes. Keys are
   "background-1" .. "background-16". The background belongs to the ROW
   POSITION, not the patient: ten of the sixteen are drawn at each shift
   start and pinned to rows 0-9 for that whole shift
   (game.js assignWaitingBackgrounds, 2026-08-09), so a patient arriving or
   leaving never changes the scene behind the row. Rows are the only place
   backgrounds appear.
   ------------------------------------------------------------------------ */

const WAITING_BACKGROUND_KEYS = [];
const waitingBackgrounds = {};
for (let sceneNumber = 1; sceneNumber <= 16; sceneNumber++) {
  const key = "background-" + sceneNumber;
  WAITING_BACKGROUND_KEYS.push(key);
  waitingBackgrounds[key] =
    `${ASSET_ROOT}/game-page/waiting-room-panel/${key}.webp`;
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
    open: `${ASSET_ROOT}/game-page/triage-rooms-panel/door-${roomKey}-open.webp`,
    closed: `${ASSET_ROOT}/game-page/triage-rooms-panel/door-${roomKey}-closed.webp`
  };
}

/* Layered room composition (TODO item 7, built 2026-08-06): every room
   cell stacks wall -> interior -> patient -> door, back to front. One
   wall image serves all seven rooms; each room has its own interior
   scene, drawn at the door art's aspect so it sits exactly behind the
   doorway. An open door's transparent doorway reveals the interior. */
const ROOMS_WALL_PATH =
  `${ASSET_ROOT}/game-page/triage-rooms-panel/background-wall-for-all-rooms.webp`;

const roomInteriors = {};
for (const roomKey of ROOM_KEYS) {
  roomInteriors[roomKey] =
    `${ASSET_ROOT}/game-page/triage-rooms-panel/background-${roomKey}-room.webp`;
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
  lobby: Object.freeze({
    background: `${ASSET_ROOT}/lobby-page/background-w-open-glass-doors.webp`,
    doorOverlayStartShift: `${ASSET_ROOT}/lobby-page/glass-door-overlay-start-shift.webp`,
    settingsBlackboard: `${ASSET_ROOT}/lobby-page/settings-blackboard.webp`,
    aboutWhiteboard: `${ASSET_ROOT}/lobby-page/about-whiteboard.webp`
  }),

  game: Object.freeze({
    patientPanelBackground: `${ASSET_ROOT}/game-page/patient-panel/patient-panel-background-hires.webp`,
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

       ONE PLAYLIST of nine tracks (2026-08-10), in the folder named by
       game.js MUSIC_FOLDER. Which files are in it is NOT listed here: a
       static host cannot list a directory, so the transcode script
       generates music-manifest.json from what it actually wrote, and the
       game reads that. A hand-kept list would drift the first time a track
       was added.

       ARRAY ORDER IN THE MANIFEST IS PLAY ORDER. The player runs straight
       down the list and returns to its top - see app.js section 3. It is
       also what the RIGHT initial selects: digit N starts the Nth entry.

       THE FILES CARRY THEIR REAL NAMES AND TAGS (John, 2026-08-10),
       reversing the anonymity rule the earlier track-NN.mp3 files
       followed. Their names are made URL-SAFE at transcode time - dashes,
       no brackets - so nothing here has to percent-encode anything.

       NOTHING here is preloaded or part of the loading gate: a shift must
       never wait on music, and a player who has not unlocked it should
       never fetch anything - not even the manifest, which is why it is
       fetched lazily at first play rather than at boot. */
    manifestPath: `${ASSET_ROOT}/audio/music-manifest.json`,
    trackPath: (folderName, fileName) =>
      `${ASSET_ROOT}/audio/${folderName}/${fileName}`
  }),

  patients: Object.freeze({
    ids: Object.freeze(PATIENT_IDS.slice()),
    compilationPath: PATIENT_COMPILATION_PATH,
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
