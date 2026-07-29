"use strict";

document.documentElement.dataset.testApp = "desktop";

if (!window.TRIAGE_RUSH_ASSETS) {
  throw new Error("Desktop asset manifest failed to load.");
}

const appState = {
  phase: "initializing",

  appPlatform: "desktop",
  appMode: "game",
  appStrictness: "normal",
  timerMax: 120,
  rushMode: false,
  playerName: "ahp",
  playerTitle: "M4"
};

window.triageRushDesktop = {
  getState: () => ({ ...appState })
};
