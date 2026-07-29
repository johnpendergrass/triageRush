"use strict";

window.TRIAGE_RUSH_ASSETS = {
  patientData: {
    jsonDirectory: "patient-data/json",
    imageDirectory: "patient-data/images",
    json: (patientId) => `patient-data/json/${patientId}.json`,
    image: (patientId) => `patient-data/images/${patientId}.png`
  },
  waitingRooms: Array.from(
    { length: 16 },
    (_, index) =>
      `assets/waiting-room-panel/backgrounds/waiting-room-background-${index + 1}-hires.png`
  ),
  patientPanel: {
    background: "assets/patient-panel/backgrounds/patient-panel-background-hires.png",
    nameBubble: "assets/patient-panel/backgrounds/patient-panel-name-bubble-hires.png",
    quoteBubble: "assets/patient-panel/backgrounds/patient-panel-quote-bubble-hires.png",
    vitalsBubble: "assets/patient-panel/backgrounds/patient-panel-vitals-bubble-hires.png",
    clipboardBubble: "assets/patient-panel/backgrounds/patient-panel-clipboard-bubble-hires.png"
  },
  roomsPanel: {
    wall: "assets/rooms-panel/backgrounds/wall-room-background-hires.png",
    rooms: {
      esi1: {
        closedDoor: "assets/rooms-panel/doors/esi-1-door-closed-with-sign-hires.png",
        openDoor: "assets/rooms-panel/doors/esi-1-door-open-with-sign-hires.png",
        interior: "assets/rooms-panel/backgrounds/esi-1-room-background-hires.png"
      },
      esi2: {
        closedDoor: "assets/rooms-panel/doors/esi-2-door-closed-with-sign-hires.png",
        openDoor: "assets/rooms-panel/doors/esi-2-door-open-with-sign-hires.png",
        interior: "assets/rooms-panel/backgrounds/esi-2-room-background-hires.png"
      },
      esi3: {
        closedDoor: "assets/rooms-panel/doors/esi-3-door-closed-with-sign-hires.png",
        openDoor: "assets/rooms-panel/doors/esi-3-door-open-with-sign-hires.png",
        interior: "assets/rooms-panel/backgrounds/esi-3-room-background-hires.png"
      },
      esi4: {
        closedDoor: "assets/rooms-panel/doors/esi-4-door-closed-with-sign-hires.png",
        openDoor: "assets/rooms-panel/doors/esi-4-door-open-with-sign-hires.png",
        interior: "assets/rooms-panel/backgrounds/esi-4-room-background-hires.png"
      },
      esi5: {
        closedDoor: "assets/rooms-panel/doors/esi-5-door-closed-with-sign-hires.png",
        openDoor: "assets/rooms-panel/doors/esi-5-door-open-with-sign-hires.png",
        interior: "assets/rooms-panel/backgrounds/esi-5-room-background-hires.png"
      },
      psych: {
        closedDoor: "assets/rooms-panel/doors/psych-door-closed-with-sign-hires.png",
        openDoor: "assets/rooms-panel/doors/psych-door-open-with-sign-hires.png",
        interior: "assets/rooms-panel/backgrounds/psych-room-background-hires.png"
      },
      discharge: {
        closedDoor: "assets/rooms-panel/doors/discharge-door-closed-hires.png",
        openDoor: "assets/rooms-panel/doors/discharge-door-open-hires.png",
        interior: "assets/rooms-panel/backgrounds/discharge-room-background-hires.png"
      }
    }
  }
};

document.documentElement.style.setProperty(
  "--asset-room-wall",
  `url("${window.TRIAGE_RUSH_ASSETS.roomsPanel.wall}")`
);
document.documentElement.style.setProperty(
  "--asset-patient-panel",
  `url("${window.TRIAGE_RUSH_ASSETS.patientPanel.background}")`
);
