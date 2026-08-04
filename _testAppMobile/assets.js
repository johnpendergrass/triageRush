window.TRIAGE_RUSH_ASSETS = Object.freeze({
  patientData: Object.freeze({
    ids: Object.freeze(
      Array.from({ length: 160 }, (_, index) =>
        `patient-${String(index + 1).padStart(3, "0")}`
      )
    ),
    jsonDirectory: "patient-data/json",
    imageDirectory: "patient-data/images",
    json: (patientId) => `patient-data/json/${patientId}.json`,
    image: (patientId) => `patient-data/images/${patientId}.png`
  }),
  waitingRooms: Object.freeze(
    Array.from(
      { length: 16 },
      (_, index) => `assets/game-page/waiting-room-panel/background-${index + 1}.png`
    )
  ),
  patientPanel: Object.freeze({
    background: "assets/game-page/patient-panel/patient-panel-background-hires.png",
    nameBubble: "assets/game-page/patient-panel/patient-panel-name-bubble-hires.png",
    quoteBubble: "assets/game-page/patient-panel/patient-panel-quote-bubble-hires.png",
    vitalsBubble: "assets/game-page/patient-panel/patient-panel-vitals-bubble-hires.png",
    clipboardBubble: "assets/game-page/patient-panel/patient-panel-clipboard-bubble-hires.png"
  }),
  roomsPanel: Object.freeze({
    wall: "assets/game-page/triage-rooms-panel/background-wall-for-all-rooms.png",
    rooms: Object.freeze(
      Object.fromEntries(
        ["esi-1", "esi-2", "esi-3", "esi-4", "esi-5", "psych", "discharge"].map(
          (room) => [
            room,
            Object.freeze({
              closedDoor: `assets/game-page/triage-rooms-panel/door-${room}-closed.png?v=20260803-door-contrast`,
              openDoor: `assets/game-page/triage-rooms-panel/door-${room}-open.png?v=20260803-door-contrast`,
              interior: `assets/game-page/triage-rooms-panel/background-${room}-room.png`
            })
          ]
        )
      )
    )
  })
});
