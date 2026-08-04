"""Serve the triageRush production app without browser or proxy caching.

Run from the project root (the folder containing index.html), or use
start-triageRush.bat which does everything for you.
"""

from argparse import ArgumentParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheRequestHandler(SimpleHTTPRequestHandler):
    """Add development-only no-cache headers to every response."""

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main() -> None:
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--bind", default="0.0.0.0", help="Address to bind")
    parser.add_argument("--port", type=int, default=8090, help="Port to listen on")
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.bind, args.port), NoCacheRequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
