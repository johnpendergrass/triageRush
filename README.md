# Triage RUSH!

*(note: this readme was written by Claude, based on the August 11th, 2026
version of the game)*

An emergency-department **triage** game. Patients arrive in the waiting room;
you read what a triage nurse would see — the complaint, the quote, the vitals,
the triage note — and send each one to the right place.

Not diagnosis. Speed and judgement, against a clock.

### ▶ [Play it](https://johnpendergrass.github.io/triagerush/)

`https://johnpendergrass.github.io/triagerush/`

Runs in any modern browser, phone or desktop. Nothing to install, nothing to
sign into, no account — your settings and past shifts live in your own
browser and go nowhere else.

**Version 0.19.2 — August 2026.**

---

## In thirty seconds

1. **Tap a waiting patient** on the left.
2. **Read them** — vitals, what they say, and the full chart if you want it.
   The clock is running while you read.
3. **Tap a door** on the right to send them there.

Seven doors: **ESI 1** Resuscitation, **ESI 2** Emergent, **ESI 3** Urgent,
**ESI 4** Less urgent, **ESI 5** Non-urgent, **Psych**, and **Discharge**.

Correct **+100**, close **+50**, wrong **−50**. Patients still waiting cost
you nothing — a full waiting room is the premise, not your fault.

**→ [HOW-TO-PLAY.md](HOW-TO-PLAY.md)** has the rules in full: both modes, both
difficulties, every control, and what the doors mean.

**→ [HISTORY.md](HISTORY.md)** is the short story of how it got built.

---

## Put it on your home screen

Worth doing on a phone or tablet. It gets the Triage RUSH! icon and opens
**full screen** — no address bar, no toolbars, which is what the 9:16 layout
was designed for.

> **iPhone / iPad:** open the link → **Share** → **Add to Home Screen**
> 
> **Android:** open the link → **⋮** → **Install app**

A home-screen copy keeps its own settings and past shifts, separate from the
browser's. It still needs a connection — there is no offline mode.

---

## Sending it to someone

The whole game is a link, so send the link:

```text
https://johnpendergrass.github.io/triagerush/
```

**Send it as a tappable link rather than as text to retype.** The address is
case-sensitive and **all lowercase**; typing it is the only way to get it
wrong. Pasted into Messages or Gmail it arrives as a card with the game's icon
on it.

For handing it to someone in person — on a printed page, or on screen — there
is a QR code at [`Link-icons/qr-code.png`](Link-icons/qr-code.png). It carries
the exact address, so nobody types anything.

---

## Running it on your own machine

Double-click **`start-local/start-triageRush.bat`**. It starts a small web
server and opens the game at `http://localhost:8090/`. Keep the console window
open while you play; close it to stop.

It also prints an address for testing on a phone on the same Wi-Fi.

**Do not open `index.html` straight from disk.** Browsers block a local page
from loading the patient data, so the game cannot start that way. The
published version has no such problem.

[`start-local/README.md`](start-local/README.md) explains both files and what
to do when something does not work.

---

## What is in here

```text
index.html            the game's entry point
manifest.json         makes it installable as an app
triageRush/           the game itself — four JavaScript files, one stylesheet, the artwork
patient-data/         160 patient records, portraits and schema
Link-icons/           app icons, the QR code, and the scripts that build them
start-local/          a small web server for playing on this machine
```

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies —
clone it or download it and it runs.

---

*Patients, charts and artwork are fictional. This is a game, not medical
training or advice.*
