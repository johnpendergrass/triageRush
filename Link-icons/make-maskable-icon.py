"""Cut the MASKABLE Android icon from the 1024 master.

Android does not show an app icon as you drew it. It masks it into whatever
shape the launcher uses - circle, squircle, teardrop - and the only area
guaranteed to survive is a centred circle 80% of the icon's width. The
regular icons in this folder fill their square edge to edge (the lettering
sits about 10% in), so declaring them "maskable" would let a circular
launcher bite the T and the ! clean off.

The cure is a second copy with the artwork shrunk onto a bigger field of the
game's own navy: same picture, more breathing room, nothing to clip. The
manifest lists it with purpose "maskable" alongside the plain 192/512, and
each launcher picks the one it needs.

    python make-maskable-icon.py

Rerun this whenever icon-master-1024.png is redrawn.
"""

from pathlib import Path

from PIL import Image

HERE = Path(__file__).parent

MASTER = HERE / "icon-master-1024.png"
OUTPUT = HERE / "maskable-icon-512.png"

SIZE = 512

# The share of the icon's width the artwork gets to use. 0.65 keeps the
# lettering well inside the 80% safe circle while still reading as large.
ARTWORK_SCALE = 0.65

# --navy-950, the shell's own background - so the added margin is invisible
# against the artwork it surrounds.
BACKGROUND = (3, 16, 25)


def main() -> None:
    master = Image.open(MASTER).convert("RGB")

    artwork_size = round(SIZE * ARTWORK_SCALE)
    artwork = master.resize((artwork_size, artwork_size), Image.LANCZOS)

    canvas = Image.new("RGB", (SIZE, SIZE), BACKGROUND)
    offset = (SIZE - artwork_size) // 2
    canvas.paste(artwork, (offset, offset))

    canvas.save(OUTPUT, optimize=True)
    print(f"wrote {OUTPUT.name}  {SIZE}x{SIZE}  artwork {artwork_size}px centred")


if __name__ == "__main__":
    main()
