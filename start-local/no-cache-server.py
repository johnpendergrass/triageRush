"""Serve the triageRush app locally with development-friendly caching.

Use start-triageRush.bat beside this file - it does everything for you. This
script can also be run directly, from ANY working directory: it serves the
PROJECT ROOT (its own folder's parent, where index.html lives), not wherever
you happened to be standing. That matters now that both files live in
start-local/ rather than at the root.

    python start-local/no-cache-server.py --port 9000

TWO CACHING RULES, and the difference matters (2026-08-09)
----------------------------------------------------------
The old version sent "no-store" on EVERY response, which meant the browser
was forbidden to keep anything - including 160 MB of artwork. That made
preloading impossible to test: art warmed during loading was thrown away and
re-downloaded the moment a screen appeared, which is exactly the "text first,
background second" symptom the Phase 10 work exists to fix.

So the two kinds of file are treated differently:

  CODE (html, js, css)  -> no-store.  Never kept, so a reload always runs the
                           file you just edited. This is what you actually
                           needed when you could not see your changes.

  ART and DATA          -> no-cache.  Kept, but revalidated on every request:
                           a file you replaced comes back with new bytes (200),
                           an unchanged one comes back as a 304 with no body
                           and no re-decode. Fresh AND fast, which "no-store"
                           could never be.

This is what lets the game's preloading work in development the same way it
works when published, and it is why runtime asset URLs no longer carry a
"?v=..." cache-busting query.
"""

from argparse import ArgumentParser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

# The site root is this file's parent folder - start-local/.. - which is where
# index.html is. Resolved from __file__ rather than from the current working
# directory, so the server cannot accidentally publish the wrong folder.
SITE_ROOT = Path(__file__).resolve().parent.parent

# Everything under these prefixes is artwork or patient data: large, changed
# rarely, and safe to keep as long as the browser asks whether it is current.
REVALIDATED_PREFIXES = ("/patient-data/", "/triageRush/assets/")


class TriageRushRequestHandler(SimpleHTTPRequestHandler):
    """Serve code uncached and art revalidated; see the module docstring."""

    def _is_revalidated_asset(self) -> bool:
        """True for artwork and patient data, false for code."""
        path = self.path.split("?", 1)[0]
        return path.startswith(REVALIDATED_PREFIXES)

    def end_headers(self) -> None:
        if self._is_revalidated_asset():
            # Keep it, but check with the server every time. The base handler
            # answers If-Modified-Since with a 304, so an unchanged file costs
            # a round trip and no bytes.
            self.send_header("Cache-Control", "no-cache")
        else:
            # Code must never be served from cache during development.
            self.send_header("Cache-Control",
                             "no-store, no-cache, must-revalidate, max-age=0")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        super().end_headers()


def main() -> None:
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--bind", default="0.0.0.0", help="Address to bind")
    parser.add_argument("--port", type=int, default=8090, help="Port to listen on")
    args = parser.parse_args()

    if not (SITE_ROOT / "index.html").exists():
        raise SystemExit(
            f"No index.html in {SITE_ROOT}\n"
            "This script expects to sit in start-local/ inside the project.")

    # `directory=` pins what gets served, so the current working directory is
    # irrelevant - run it from anywhere.
    handler = partial(TriageRushRequestHandler, directory=str(SITE_ROOT))
    server = ThreadingHTTPServer((args.bind, args.port), handler)
    print(f"triageRush: serving {SITE_ROOT}")
    print(f"            http://localhost:{args.port}/   (ctrl-C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
