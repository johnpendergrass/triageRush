# Resize triageRush room/waiting art down to display-appropriate sizes.
#
# The hi-res originals were already copied by John to
# assets/HIRES-ORIGINAL-ART/ — this script OVERWRITES the runtime copies
# in place (same path, same filename, still PNG) so assets.js needs no
# path changes, only a cache-version bump.
#
# Targets (from the 2026-08-04 audit, confirmed against the final CSS,
# sized for the worst case = iPhone 16 Pro Max 3x shell 1296x2304 with
# ~15% headroom). Each image keeps its own aspect ratio; the target
# below is a HEIGHT, since every box here is height-constrained.
#
#   doors      height 400   (native 1792 tall)
#   interiors  height 448   (native 1792 tall)
#   wall       height 320   (native 1792 tall, fills a ~square cell)
#   waiting    height 448   (native 2509 tall)

from pathlib import Path
from PIL import Image

ASSETS = Path(r"D:\Dev\Projects\triageRush\triageRush\assets")
ROOMS = ASSETS / "game-page" / "triage-rooms-panel"
WAITING = ASSETS / "game-page" / "waiting-room-panel"

ROOM_KEYS = ["esi-1", "esi-2", "esi-3", "esi-4", "esi-5", "psych", "discharge"]

jobs = []  # (path, target_height)
for key in ROOM_KEYS:
    jobs.append((ROOMS / f"door-{key}-closed.png", 400))
    jobs.append((ROOMS / f"door-{key}-open.png", 400))
    jobs.append((ROOMS / f"background-{key}-room.png", 448))
jobs.append((ROOMS / "background-wall-for-all-rooms.png", 320))
for n in range(1, 17):
    jobs.append((WAITING / f"background-{n}.png", 448))

total_before = 0
total_after = 0
for path, target_h in jobs:
    if not path.exists():
        raise SystemExit(f"MISSING: {path}")
    before = path.stat().st_size
    img = Image.open(path)
    w, h = img.size
    if h <= target_h:
        print(f"skip (already small): {path.name} {w}x{h}")
        total_before += before
        total_after += before
        continue
    new_w = round(w * target_h / h)
    resized = img.resize((new_w, target_h), Image.LANCZOS)
    resized.save(path, optimize=True)
    after = path.stat().st_size
    total_before += before
    total_after += after
    print(f"{path.name}: {w}x{h} {before/1048576:.2f}MB -> "
          f"{new_w}x{target_h} {after/1024:.0f}KB  mode={img.mode}")

print(f"\nTOTAL: {total_before/1048576:.1f} MB -> {total_after/1048576:.1f} MB "
      f"({len(jobs)} files)")
