const powerToggle = document.querySelector("#powerToggle");
const musicToggle = document.querySelector("#musicToggle");
const uiToggle = document.querySelector("#uiToggle");
const kingStream = document.querySelector("#kingStream");
const popupLayer = document.querySelector("#popupLayer");
const popupArt = document.querySelector("#popupArt");
const popupClose = document.querySelector("#popupClose");
const popupButtons = document.querySelectorAll("[data-popup]");

const popupDefinitions = {
  player: {
    title: "PLAYER SETTINGS",
    src: "../triageRush/assets/home-screen/backgrounds/popup-settings-player-board.png"
  },
  shift: {
    title: "SHIFT SETTINGS",
    src: "../triageRush/assets/home-screen/backgrounds/popup-settings-shift-settings-board.png"
  },
  about: {
    title: "ABOUT TRIAGERUSH",
    src: "../triageRush/assets/home-screen/backgrounds/popup-about-whiteboard.png"
  }
};

let popupTrigger = null;

function openPopup(name, trigger) {
  const popup = popupDefinitions[name];
  if (!popup) return;

  popupTrigger = trigger;
  popupArt.src = popup.src;
  popupArt.alt = `${popup.title} background`;
  popupLayer.setAttribute("aria-label", `${popup.title} popup preview`);
  popupLayer.hidden = false;
  popupClose.focus();
}

function closePopup() {
  popupLayer.hidden = true;
  popupArt.removeAttribute("src");
  popupTrigger?.focus();
}

popupButtons.forEach((button) => {
  button.addEventListener("click", () => openPopup(button.dataset.popup, button));
});

popupClose.addEventListener("click", closePopup);

popupLayer.addEventListener("click", (event) => {
  if (event.target === popupLayer) closePopup();
});

let radioPowered = false;
let musicEnabled = true;

function renderSoundControls() {
  powerToggle.classList.toggle("is-on", radioPowered);
  powerToggle.setAttribute("aria-pressed", String(radioPowered));
  powerToggle.setAttribute(
    "aria-label",
    radioPowered ? "Turn radio power off" : "Turn radio power on"
  );

  musicToggle.classList.toggle("is-on", musicEnabled);
  musicToggle.setAttribute("aria-pressed", String(musicEnabled));
  musicToggle.setAttribute(
    "aria-label",
    musicEnabled ? "Turn Classical KING music off" : "Turn Classical KING music on"
  );
}

async function syncRadioPlayback() {
  if (!radioPowered || !musicEnabled) {
    kingStream.pause();
    return;
  }

  try {
    await kingStream.play();
  } catch (error) {
    radioPowered = false;
    renderSoundControls();
    powerToggle.setAttribute(
      "aria-label",
      "Radio could not start. Tap power to try again"
    );
    console.warn("Classical KING stream could not start.", error);
  }
}

powerToggle.addEventListener("click", async () => {
  radioPowered = !radioPowered;
  renderSoundControls();
  await syncRadioPlayback();
});

musicToggle.addEventListener("click", async () => {
  musicEnabled = !musicEnabled;
  renderSoundControls();
  await syncRadioPlayback();
});

uiToggle.addEventListener("click", () => {
  const isOn = uiToggle.classList.toggle("is-on");
  uiToggle.setAttribute("aria-pressed", String(isOn));
});

kingStream.addEventListener("error", () => {
  radioPowered = false;
  renderSoundControls();
  powerToggle.setAttribute(
    "aria-label",
    "Classical KING stream is unavailable. Tap power to retry"
  );
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !popupLayer.hidden) closePopup();
});

renderSoundControls();
