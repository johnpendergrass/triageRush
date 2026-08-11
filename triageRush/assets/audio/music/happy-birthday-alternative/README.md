# The one-song alternative

This folder is a **spare playlist**: a single track, ready to swap in when the
game should play one song on a loop instead of the usual nine.

Nothing here is loaded unless you switch to it. The game only ever fetches what
`assets/audio/music-manifest.json` lists, so while the normal manifest is in
place this folder is inert — it costs a player nothing.

```text
assets/audio/
├── music-manifest.json          <- THE SWITCH. Only this file decides.
└── music/
    ├── 01-*.mp3 ... 09-*.mp3    the normal nine
    └── happy-birthday-alternative/
        ├── happy-birthday.mp3
        ├── music-manifest.json  the spare, listing only the one track
        └── README.md            this file
```

---

## Switch TO the one song

Copy this folder's manifest over the live one:

```sh
cp triageRush/assets/audio/music/happy-birthday-alternative/music-manifest.json \
   triageRush/assets/audio/music-manifest.json
```

In Explorer: copy `music-manifest.json` from this folder into
`assets/audio/`, replacing the one already there.

**Keep a copy of the nine-track manifest first** — see below.

## Switch BACK to the nine

Either restore your saved copy, or regenerate it from what is actually in the
music folder:

```sh
python github-excluded/dev-tools/_audio-transcode/write-music-manifest.py
```

Regenerating is the safer option: it reads the folder rather than trusting a
file you kept, and it preserves any hand-set `gain` values. It globs `*.mp3`
in `music/` only — **not** subfolders — so it will rebuild exactly the nine
and ignore this folder entirely.

> **Before switching, save the nine-track manifest somewhere**, e.g.
> `music-manifest.NINE.json` beside it. The regenerate command above makes this
> recoverable even if you forget, but a copy is quicker.

---

## Why this works, and why nothing else has to change

The game reads **one** manifest, at a fixed path, and takes the folder key
`music` from a constant in `game.js`. So the only thing that varies is the list
of files.

Two pieces of arithmetic already handle a list of one:

- The right initial's digit is clamped with `Math.min(selection, tracks.length)`,
  so **1 through 9 all select the only track**.
- The advance-on-`ended` index wraps modulo the list length, so **the track
  loops forever** rather than running out.

The `file` value here is a **subpath** — `happy-birthday-alternative/happy-birthday.mp3`
— because the game builds URLs as `audio/<folder>/<file>`. That is what lets the
track play from this folder without any MP3 being moved.

**The `♫` unlock is unaffected.** Music still requires `♫` as the player's
middle initial, GLOBAL SOUND on, and MUSIC above off. Swapping the manifest
changes *what* plays, never *whether* it plays.

---

## How this file was made

Same recipe as the other nine, so it needs no level adjustment:

```text
two-pass loudnorm to -20 LUFS (linear=true)
64 kbps, mono, 44.1 kHz
-map 0:a          audio only, which is what drops embedded cover art
-map_metadata -1  every inherited tag stripped
```

It measures **-20.72 LUFS** delivered, against -20.97 and -20.52 for two of the
nine — the same perceived loudness, so the MUSIC level behaves identically
whichever playlist is in use.

Unlike the nine, **no tags were written back**: this file carries no title,
artist or album. The full-quality original is kept outside the repository, with
the other sources.

To replace this song with a different one, transcode with the recipe above,
drop it in this folder, and point this folder's manifest at the new filename.
**Keep the filename URL-safe** — dashes, no spaces — because the game builds the
URL as a plain string with no percent-encoding.

---

## If music stops working after an edit

The symptom a player sees is only *"Music could not be played. The game is
unaffected."* The real error is a `console.warn` nobody reads, and it is nearly
always **malformed JSON** in the live manifest rather than anything to do with
the audio.

Check that the file still parses, and that `schema` still reads exactly
`triageRush-music-manifest` — the game rejects the whole envelope otherwise.

```sh
python -c "import json;json.load(open('triageRush/assets/audio/music-manifest.json'));print('manifest OK')"
```
