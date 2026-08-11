# Link-icons — getting the game onto somebody's phone

The "Triage RUSH!" logo on the game's dark navy, cut to every size a
shortcut, bookmark or home-screen icon is likely to want — plus the QR code
that carries the link.

| File | Size | What it is for |
|---|---|---|
| `icon-master-1024.png` | 1024 | **The source.** Cut any new size from this one, not from the smaller copies. |
| `desktop-icon-512.png` | 512 | Desktop shortcuts, the large install icon, **and the picture in a texted link preview** |
| `maskable-icon-512.png` | 512 | **Android**, which masks icons into its own shape — see below |
| `android-icon-192.png` | 192 | Android home screen |
| `iPhone-icon-180.png` | 180 | **iPhone home screen** |
| `favicon-32.png` | 32 | Browser tab |
| `favicon-16.png` | 16 | Browser tab, small |
| `qr-code.png` | 588 | Scan-to-play — points at the published game |

## Which ones the game actually uses

**iPhone** reads one tag in the `<head>` of `index.html`:

```html
<link rel="apple-touch-icon" href="./Link-icons/iPhone-icon-180.png" />
```

**Android and desktop** ignore that and read `manifest.json` at the repo
root, which lists the 192, the 512 and the maskable 512. That file is also
what makes an Android home-screen launch open **full screen**; on an iPhone
the `apple-mobile-web-app-capable` meta tag does the same job.

The favicons and the 1024 master are not referenced by anything (the
`/favicon.ico` 404 in the console is expected and deliberate). The whole
folder costs the published site about 125 KB.

## Why there is a separate maskable icon

Android does not show your icon as drawn — it masks it into the launcher's
shape, and the only area guaranteed to survive is a **centred circle 80% of
the width**. The regular icons fill their square with the lettering about 10%
in, so a circular launcher would clip the `T` and the `!`.

`maskable-icon-512.png` is the same picture shrunk to 65% on a bigger field of
the same navy: more margin, nothing to bite. The manifest lists it as
`purpose: "maskable"` beside the plain ones and each launcher takes what it
needs. Rebuild it with `python make-maskable-icon.py` (needs Pillow).

## Adding it to a home screen

**iPhone** — Safari or Chrome, but on Chrome it is in the *share sheet*, not
the ⋯ menu:

1. Open https://johnpendergrass.github.io/triagerush/ (all lowercase — a
   Pages path is case-sensitive and does not redirect)
2. Tap **Share** (the square with the up arrow)
3. **Add to Home Screen** — on Chrome, leave *Open as web app* ON
4. The name defaults to *Triage RUSH!* → **Add**

**Android** — Chrome:

1. Open the same link
2. **⋮** → **Add to Home screen** (it may say **Install app**)
3. **Install**

**iOS caches that icon hard.** If the artwork here ever changes, an existing
home-screen shortcut keeps the old picture — delete the shortcut and add it
again to pick up the new one.

A home-screen web app gets its **own storage**, separate from the browser's,
so it opens at the first-run defaults with no past shifts. That is expected,
not a bug — and there is no offline support, so it still needs a connection.

## The QR code

`qr-code.png` encodes the published URL. It exists because the Pages address
is **case-sensitive** — `/triageRush/` works, `/triagerush/` is a 404 — so
anyone who *types* it stands a good chance of landing nowhere.

Use it when the phone is not the thing receiving the message: a screen you
are showing someone, a printed card, a slide. If you are texting or emailing
the game, just send the link — they are already holding the phone.

Rebuild with `python make-qr.py` (needs `segno`); edit `URL` in that script if
the address ever changes.

## Two rules if you redraw these

- **Keep them square, and do NOT round the corners.** iOS masks the icon into
  a rounded square itself; a pre-rounded image gets rounded twice and ends up
  with pale corners.
- **Keep the artwork clear of the edges** — roughly 10% each side, which is
  what the current lettering does. The corner mask will bite anything that
  crowds them.

## How these were made

Rendered in a browser using the game's own brand values, so the icon cannot
drift from the lettering on the entrance sign:

```text
font    Arial Black, weight 900
face    #ec543d          the letter faces
brick   #a03426          the stacked 3D depth, at .012/.024/.036/.048em
cast    rgba(60,30,15,0.55) at 0.09em 0.11em 0.1em
back    #031019          --navy-950, the shell's own background
layout  "Triage" over "RUSH!", RUSH about 1.27x larger
```

Those are the same numbers as `.brand-sign` in `triageRush/styles.css`. If the
brand ever changes, re-render at 1024, re-cut the set, and then rerun
`make-maskable-icon.py` so the Android copy follows.
