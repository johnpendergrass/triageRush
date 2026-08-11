"""Generate the QR code that points at the published game.

Why a QR code exists at all: the Pages URL is CASE-SENSITIVE, so anyone who
TYPES it has a good chance of landing nowhere. A QR code carries the exact
characters, and nobody types anything.

THE URL IS NOW ALL LOWERCASE (2026-08-11). The repository was renamed
"triageRush" -> "triagerush" on GitHub, which silently reversed the very
example this file used to give: /triagerush/ is what works and /triageRush/
is the 404. GitHub redirects the repo for git operations, so pushes kept
working and nothing complained - but Pages does NOT redirect a renamed path.
**Re-run this script after any future rename**, because the old URL stays
baked into qr-code.png until you do, and a QR code fails silently.

Use it when the phone is not the thing receiving the message: on a screen you
are showing someone, on a printed card, in a slide. If you are texting or
emailing the game, just send the link - the recipient is already holding the
phone and only has to tap.

    python make-qr.py

Requires segno (pip install segno). Error correction is set to H, the
highest, so the code still scans off a folded page or a photographed screen.
"""

from pathlib import Path

import segno

HERE = Path(__file__).parent

URL = "https://johnpendergrass.github.io/triagerush/"
OUTPUT = HERE / "qr-code.png"

# Pixels per QR module. 12 gives a picture around 500px across - big enough
# to paste into a document or show on a screen without resampling mush.
SCALE = 12

# A quiet border of 4 modules is the spec minimum; scanners need it, and
# cropping it off is the usual reason a code will not read.
BORDER = 4


def main() -> None:
    code = segno.make(URL, error="h")
    code.save(OUTPUT, scale=SCALE, border=BORDER, dark="#000000", light="#ffffff")

    width, height = code.symbol_size(scale=SCALE, border=BORDER)
    print(f"wrote {OUTPUT.name}  {width}x{height}  ->  {URL}")


if __name__ == "__main__":
    main()
