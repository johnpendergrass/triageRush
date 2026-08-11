# start-local — playing and testing the game on this computer

**To play: double-click `start-triageRush.bat`.** A black console window opens
and your browser goes to the game. Keep that window open while you play;
closing it stops the server. That is the whole thing.

It also prints an address like `http://192.168.1.42:8090/` — type that into
the iPhone's browser, with both devices on the same Wi-Fi, and you get the
game on the phone. If Windows asks about network access, allow it on
**Private** networks.

---

## Why these files exist at all

**Because you cannot just double-click `index.html`.** The game fetches its
patient data and artwork, and a browser refuses to let a page opened from
`file://` fetch files off your disk — a security rule, not a bug. Open the
game that way and it hangs on the loading screen forever.

A web server fixes that by serving the same files over `http://` instead. So
these two files exist for one reason: **to make the game work on your own
machine the way it works when it is published.**

Nothing in here ships with the game. GitHub Pages is the web server for the
published version, and it never sees these files.

## What each file does

**`start-triageRush.bat`** — the double-click launcher. It finds your
computer's network address so you have a URL for the phone, opens your
browser, locates Python (tries `py`, then `python`), and starts the server on
port 8090.

**`no-cache-server.py`** — the actual server. About forty lines around
Python's own built-in one, with a single job of its own: sending the right
caching instructions.

They live in this folder rather than at the project root so the root stays
tidy — just `index.html` and the README. Both files know they have moved:
the launcher steps up one level, and the Python file works out the project
root from its own location, so it serves the game no matter which directory
you run it from.

## The caching, which is the only clever part

This is worth remembering, because it is the answer to *"why am I not seeing
my changes?"* — and to a subtler problem that cost a day in August 2026.

The server treats two kinds of file differently:

| | |
|---|---|
| **Code** — `.html`, `.js`, `.css` | `no-store`. Never kept. A reload always runs the file you just edited. |
| **Art and data** — `patient-data/`, `triageRush/assets/` | `no-cache`. Kept, but re-checked every time. A file you replaced comes back fresh; an unchanged one comes back as "still good" with no data sent. |

**It used to say `no-store` for everything**, which sounds safer and was
worse. It forbade the browser to keep even a 160 MB pile of artwork, so
nothing the game preloaded was ever reused — every screen re-downloaded its
own background at the moment it appeared, and the preloading work could not be
tested at all, because the server was silently undoing it.

The lesson: **"never cache anything" is not the safe default.** What you
actually want is "never cache the code I am editing, and always re-check
everything else."

## Using it another way

Run the server by hand if you want a different port — useful when something
else is already on 8090:

```
python start-local/no-cache-server.py --port 9000
```

It prints the folder it is serving, so you can see at a glance that it found
the project root. `Ctrl-C` stops it.

## If something goes wrong

**"Python was not found."** Install Python from python.org and tick *Add
Python to PATH* during setup.

**The browser opens but nothing loads.** Something else may be using port
8090. Run it by hand on another port, as above.

**The phone cannot reach it.** Both devices must be on the same Wi-Fi, and
Windows Firewall must be allowing Python on Private networks. The address the
launcher prints must be your computer's LAN address — if it shows
`YOUR-COMPUTER-IP` it could not work it out, and you can find it with
`ipconfig`.

**The game sits on the loading screen.** That is the `file://` problem — you
have opened `index.html` directly instead of using the launcher.
