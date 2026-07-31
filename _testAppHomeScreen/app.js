const boombox = document.querySelector("#boombox");
const coordinateReadout = document.querySelector("#coordinateReadout");
const moveButtons = document.querySelectorAll(".move-button");
const scaleDown = document.querySelector("#scaleDown");
const scaleUp = document.querySelector("#scaleUp");
const scaleReadout = document.querySelector("#scaleReadout");
const powerToggle = document.querySelector("#powerToggle");
const musicToggle = document.querySelector("#musicToggle");
const uiToggle = document.querySelector("#uiToggle");
const kingStream = document.querySelector("#kingStream");

let boomboxX = 357;
let boomboxY = 1256;
let boomboxScale = 100;
const boomboxBaseWidth = 480;

function renderPosition() {
  boombox.style.setProperty("--boombox-x", `${(boomboxX / 852) * 100}%`);
  boombox.style.setProperty("--boombox-y", `${(boomboxY / 1515) * 100}%`);
  boombox.style.setProperty(
    "--boombox-width",
    `${((boomboxBaseWidth * boomboxScale) / 100 / 852) * 100}%`
  );
  coordinateReadout.value =
    `X ${boomboxX} · Y ${boomboxY} · SCALE ${boomboxScale}%`;
  coordinateReadout.textContent =
    `X ${boomboxX} · Y ${boomboxY} · SCALE ${boomboxScale}%`;
  scaleReadout.value = `${boomboxScale}%`;
  scaleReadout.textContent = `${boomboxScale}%`;
}

function moveBoombox(dx, dy, amount = 1) {
  boomboxX += dx * amount;
  boomboxY += dy * amount;
  renderPosition();
}

moveButtons.forEach((button) => {
  button.addEventListener("click", () => {
    moveBoombox(Number(button.dataset.dx), Number(button.dataset.dy));
  });
});

function scaleBoombox(direction, amount = 1) {
  boomboxScale = Math.min(180, Math.max(40, boomboxScale + direction * amount));
  renderPosition();
}

scaleDown.addEventListener("click", () => scaleBoombox(-1));
scaleUp.addEventListener("click", () => scaleBoombox(1));

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
  const directionByKey = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0]
  };
  const direction = directionByKey[event.key];

  if (direction) {
    event.preventDefault();
    moveBoombox(direction[0], direction[1], event.shiftKey ? 10 : 1);
  }

  if (event.key === "-" || event.key === "_") {
    scaleBoombox(-1, event.shiftKey ? 10 : 1);
  }

  if (event.key === "+" || event.key === "=") {
    scaleBoombox(1, event.shiftKey ? 10 : 1);
  }
});

renderPosition();
renderSoundControls();
