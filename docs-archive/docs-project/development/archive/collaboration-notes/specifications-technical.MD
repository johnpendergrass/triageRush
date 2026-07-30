> **Historical document — not authoritative.** It describes an earlier
> implementation plan. Start with the current
> [Single Source of Truth](../singleSourceOfTruth/README.md).

# TRIAGE RUSH — Technical Specifications

*Implementation notes & gotchas. Updated 2026-07-19. Pairs with `specifications.MD`
(data/schema, authoritative) and `basic-design.md` (vision).*

---

> **See `TOC.md` for a plain-English map of every folder and file.** This document is
> the deeper "why and how"; TOC.md is the quick reference.

## Current repository state

**Reorganized 2026-07-21** into two self-contained halves — the game (repo root, Pages-served)
and the authoring pipeline (one folder). Data was moved *inside* the pipeline; the game gets
its own built copy under `assets/`.

```
triageRush/                         ← repo root = THE GAME (GitHub Pages serves this)
├─ .gitignore                       ← ignores the pipeline's APIKEY/, venv/, _orig/, _backups/, secrets
├─ README.md                        ← what the game is + the Andy backstory + how to run
├─ index.html                       ← entry point (MUST stay at root); <script>-includes assets + js
├─ css/style.css                    ← touch-first portrait play-screen styling
├─ js/main.js                       ← game logic (v1: config parser only; game loop is next)
├─ assets/                          ← WHAT THE GAME LOADS
│  ├─ config.js                     ← const CONFIG_TEXT = `key = value …` (per-round r1/r2/r3 + points*)
│  ├─ cases.js                      ← const CASES = [ …155… ]  (BUILT from patients/*.json; ~251 KB)
│  └─ images/NNN-slug.png × 155     ← 1024² portraits, loaded directly (copy of the masters)
├─ dev/                             ← utilities + reference stubs (not loaded by the game)
├─ patient-creation-pipeline-using-openAI/   ← THE AUTHORING PIPELINE (renamed from openAI-4o-pipeline)
│  ├─ _INFO.txt                     ← creation date, models used, reuse warnings
│  ├─ gen_images.py                 ← image generation (gpt-image-1)
│  ├─ validate_cases.py             ← schema + safety-rule checker (free; run after any case edit)
│  ├─ build_player_view.py          ← regenerates patients-player-view/ from source
│  ├─ run_triage_eval.py            ← the AI triage eval (gpt-4o default; three-tier grading)
│  ├─ make_eval_report.py           ← eval JSON → scannable Markdown table
│  ├─ author_new_cases.py, new_cases_data.py
│  ├─ patientBrowser/               ← Streamlit review tool (app.py, start-browser.bat)
│  ├─ patients/NNN-slug.json × 155  ← THE SOURCE OF TRUTH for case data (moved in during reorg)
│  ├─ images-hires/                 ← 1024² masters + _style-anchor.png + _orig/ (gitignored)
│  ├─ patients-player-view/         ← DERIVED blind eval input (rebuild, never hand-edit)
│  ├─ eval-results/                 ← raw eval records, one JSON per run config
│  ├─ APIKEY/API_KEY-triageRush.txt ← OpenAI key (GITIGNORED — never committed)
│  ├─ venv/                         ← gitignored; BROKE in the rename, recreate from requirements.txt
│  └─ requirements.txt
└─ claude-john-docs/
   ├─ TOC.md                        ← plain-English map of every folder/file
   ├─ specifications.MD             ← authoritative schema/rules + game model (current)
   ├─ specifications-technical.MD   ← this file
   ├─ Claude-ToBeContinued-*.MD     ← session handoffs (read the newest first)
   ├─ claudePlans/                  ← approved plans
   └─ DESIGN/                       ← basic-design.md, app-design-notes.md (rolling), app-design-01.jpg, triageLevels(Rooms).txt
```

**Every pipeline script's `PROJECT_ROOT` was repointed** from `SCRIPT_DIR.parent` (old repo
root) to `SCRIPT_DIR` (the pipeline folder itself), and patientBrowser's from
`PIPELINE_DIR.parent` to `PIPELINE_DIR`, because the data dirs now live *inside* the pipeline.
Verified: `validate_cases.py` finds all 155 cases + images from the new location.

**Why all Python is in `patient-creation-pipeline-using-openAI/`:** it holds the venv and the
gitignored API key; a second script folder would mean a second copy of the key. It is now
also fully self-contained (source data + tools together), so it could be lifted out and still
author patients.

**`patients-player-view/` is fully derived.** Never hand-edit it. After changing any case
run `python build_player_view.py` to regenerate cards, portraits, and the answer key
together — they must stay in sync or grading silently goes wrong.

**Naming scheme (locked 2026-07-18):** cases are `patients/NNN-slug.json`, zero-padded
3-digit prefix, **append-only** (numbers assigned once, never renumbered). Invariant:
**filename stem == `id` == png stem**. The prefix gives a stable folder sort and a
selection handle for the pipeline (generate a range like `18 29`).

**Status (2026-07-21):** **155 cases authored & validated**, all 155 images generated, 58
carrying `acceptableZones`; **case bank CLOSED**. **The static play-screen shell is built**
(index.html + css + js/main.js config-parser + assets/) and renders on the iPhone 16 Pro;
buttons only highlight. **Folder structure reorganized** (see the tree above). **Next:** the
game logic in `js/main.js`.

**Style-anchor path fix (2026-07-19):** the anchor and `_orig/` backups moved from
`patients/` to `images-hires/`, which silently **broke image re-rolling** — 95 cases still
pointed at the old `patients/_style-anchor.png`. All 100 `anchor_image` paths and both
references in `gen_images.py` were repointed. Verified: every anchor resolves on disk.
Lesson: after moving art, re-run a `--dry-run` and check anchors, since a bad anchor only
surfaces at API-call time.

## Planned code layout (not yet built)

```
index.html              ← viewport meta (viewport-fit=cover), <script> includes, screen containers
css/style.css           ← touch-first, portrait, big tap targets, traffic-light vitals, safe-area insets
js/main.js              ← game loop, 3-round state machine, tap rules (a–d) incl. queue↔panel swap,
                          flat scoring (via functions), QUIET/RUSH spawn ramp, config parser
assets/config.js        ← const CONFIG_TEXT = `key = value …`  (per-round r1/r2/r3 + points*; spec §3d)
assets/cases.js         ← const CASES = [ ... ]  (built from the pipeline's patients/*.json)
assets/images/{id}.png  ← hi-res game art, loaded directly (NO 512 downscale; spec decision 2026-07-21)
```
(This is the post-reorg layout — see the reorg note under "Current repository state".)

**Game model is finalized** (spec §3, §3b–§3d, §8): 3 timed rounds, **no fail state**,
score-only, **all-tap** interaction (no drag), flat scoring, `config.js` tunables, splash +
play screens, **no post-game Results screen** (teaching moves to a deferred patient browser).

## Schema v2 (changed this session — see specifications.MD §4 for the full example)

Per-case JSON now includes: `easterEgg` (bool, replaced `tone`), `race`
(`white|black|hispanic|asian`), `presentationShort` + `presentationLong` (intern
sign-out, two forms), `vitals` as **`{ "value", "color" }` per vital** (color authored),
`correctZone` (authored zone string), and a self-contained **`openai_4o`** block.
`name` is now first-name-only (age is its own field). `visual` retained as human notes.

## patientBrowser — the case review tool (NEW 2026-07-19)

A **Streamlit** app in `patient-creation-pipeline-using-openAI/patientBrowser/` that reads `patients/*.json`
and `images-hires/*.png` straight from disk. There is no database and no copy of the
data — the JSON files ARE the storage.

```
venv\Scripts\activate && streamlit run patientBrowser/app.py    # or double-click start-browser.bat
```

- **Why Streamlit and not a hand-rolled page:** a `file://` page can't list a directory,
  can't `fetch()` (CORS), and **can't write to disk** — so an editor needs a local server
  either way. Streamlit *is* that server, and supplies the widgets, so the tool is ~250
  lines of Python instead of ~500 lines of HTML/JS/CSS + a save endpoint. It installs into
  the existing pipeline venv, so there is still only one venv and one copy of the API key.
- **Keyboard browsing works** — the sidebar list is a real HTML radio group, so ↑/↓ moves
  through it natively once clicked. What Streamlit can't do is app-wide hotkeys (no global
  keydown hook); mouse is the equivalent fallback.
- **No thumbnail folder.** `images-hires/` is 181 MB (1.7 MB × 100), far too heavy to list
  raw, but portraits are resized on the fly and memoised with `@st.cache_data`, keyed on
  the file's mtime — so re-rolled art invalidates itself. Nothing to keep in sync.
- **`patients_signature()` is the cache key for case data** — a tuple of every filename
  plus its mtime. Edits made by ANY route (this app, a script, a text editor) invalidate
  the cache automatically. Without it, a `@st.cache_data` list of cases goes stale and
  throws `KeyError` the moment the schema changes underneath it (this bit us once).
- **Styling escape hatch:** Streamlit widgets expose no style options, so the sidebar CSS
  targets its DOM via `data-testid`. That is unofficial and can break on upgrade, so the
  wrapping fix is *also* solved in the data (short labels, zone as a coloured square) —
  the CSS is belt-and-braces, not the only defence.
### Editing & saving (added 2026-07-19)

**Editable: `johnsComments`, `name`, `quote`** — listed in the `EDITABLE_FIELDS` table at
the top of `app.py`. Adding another free-text field is one line there and nothing else.

**NOT editable, deliberately:** `id`, `number` (identity — a rename job, not a text edit),
and `triage` / `correctZone` / `acceptableZones` / `vitals` (medical decisions that belong
in a reviewed batch, not a stray keystroke). The distinction that matters is **structural
risk vs medical risk**: the three editable fields are free text carrying neither.

**Four independent guards in `save_fields()`** — the important part:

1. **Line-surgery, not `json.dump`.** `patch_field()` regex-replaces the single line for
   one top-level field, anchored to *exactly two spaces* of indent, so nested keys (inside
   `vitals` / `visual` / `openai_4o`) can never match by accident. The hand formatting —
   blank-line grouping, column-aligned vitals — survives, and a save is a ONE-LINE git
   diff instead of a whole-file rewrite. Values go through `json.dumps()`, so quotes,
   backslashes, newlines, and emoji escape correctly and always stay on one line.
2. **Re-parse and diff every field.** The patched text is parsed and compared key-by-key
   against the original; if any field other than the edited ones differs, or a field was
   added or removed, the save is abandoned **before anything is written**.
3. **The real validator has the last word.** `check_case` is *imported from
   `validate_cases.py`*, not copied, so the browser and the CLI validator can never
   disagree. If it complains, the file is restored from the backup.
4. **Timestamped backup + atomic write** (`_backups/{id}.{stamp}.json`, then temp file +
   `os.replace`). The stamp includes **microseconds** — second-resolution names collided
   when two saves landed in the same second and silently lost the older backup.

A no-op save (nothing actually changed) rewrites nothing and creates no backup.

`_backups/` is gitignored. Verified by a 19-assertion headless test covering hostile
characters (embedded quotes, commas, tabs, newlines, emoji, backslashes), trailing-comma
preservation, the nested-key anchor, and no-op saves.

**Known quirk:** Streamlit keeps widget state per key, so unsaved typing survives if you
navigate to another case and back. Convenient as a draft, but it is NOT saved — only the
Save button writes.

## Data pipeline: per-case JSON → cases.js

- Author as individual `patients/{id}.json` (easy to add/review). **Combine into one
  `js/cases.js`** later — `const CASES = [...]` via `<script>`.
- **Why `cases.js`, not `fetch('cases.json')`:** `fetch()` fails under `file://` (CORS)
  when John double-clicks index.html. A `<script>` include works everywhere. Deliberate —
  do NOT switch to fetch.
- Combine step is trivial (concatenate objects into an array). Tiny Node/Python script.

## Image pipeline (NEW — automated via OpenAI API)

Replaces the manual one-at-a-time ChatGPT web flow. Standalone, in `patient-creation-pipeline-using-openAI/`.

- **Model: `gpt-image-1`** via the Images **edits** endpoint (`client.images.edit`), so
  the **style-anchor image** can be attached to every call — this is what enforces one
  consistent style across the batch (API calls are stateless, unlike the web chat).
- **`gen_images.py`** iterates `patients/*.json`, reads each case's `openai_4o` block, and
  sends `prompt` + `anchor_image` at `size`, writing the returned bytes to `output`
  (**`images-hires/{id}.png`** — 1024² masters, separate from the case data). The
  `openai_4o.prompt` is the source of truth for generation — to re-roll one image, edit
  that string and re-run for that id.
- **Regenerate the WHOLE set** (incl. the original 5) anchored on one image, for
  uniformity. **Back up the current 5 PNGs to `patients/_orig/` first.**
- **Test before batch:** run 2–3 cases, eyeball style-match to the anchor, tweak prompt
  wording if needed, then run all.
- **Setup** (confirm before creating, per John's Python rule): `python -m venv venv` in
  `patient-creation-pipeline-using-openAI/`, `pip install openai pillow`, `pip freeze > requirements.txt`, and set
  `OPENAI_API_KEY` in the environment. Cost for the full set ≈ $1–4 (low/med/high tier).
- **Ship prep (revised 2026-07-21):** the 1024² masters ship directly to `assets/images/`;
  **no downscale** (John's decision — one image set to maintain). Only revisit if a real
  phone-perf problem appears.

### The framing fix (2026-07-19) — READ BEFORE RE-ROLLING ANY ART

Earlier batches kept coming out as **close-ups with cropped legs, missing laps and
invisible chair legs**. Root cause: **the shared style anchor is itself a cropped
close-up** (the subject's legs run off the bottom edge), and every prompt said *"match
the exact style … of the attached reference image"* — so the model faithfully copied its
**composition** along with its brushwork.

`author_new_cases.py` now builds prompts from two separate blocks:
- **STYLE** — brushwork, shading, line weight, lighting, palette … *"but do NOT copy its
  cropping, camera distance or composition."* That final clause is the fix.
- **FRAMING** — full-body wide shot; entire figure head to soles; entire chair including
  all four legs; ~10% margin above head and below feet; explicitly NOT a close-up, bust or
  portrait crop; plus an anatomical completeness clause (head, torso, both arms, hands,
  lap, both legs, both feet — nothing cropped, truncated or fading out).

Verified on three test images before the batch: all full-body, whole chair, clear margins.

**OUTSTANDING CONSEQUENCE:** cases **101–143 are framed wider than 001–100**, which are
cropped mid-thigh. Since the game composites transparent cutouts onto a room layer, the
two groups will sit differently on the floor. Re-rolling 001–100 with the fixed prompt
would cost ~**$17** (100 × $0.167 at high quality). Recommended before ship, but worth
seeing in the real layout first. A better long-term fix is a **new full-body style
anchor**, which would remove the tension between "match the reference" and "don't copy
its crop" entirely.

**Real cost, for future estimates:** `gpt-image-1` at 1024² **high** quality is
**$0.167/image** — 43 images cost **$7.18**. (medium ≈ $0.042, low ≈ $0.011.) The
original 100 were generated at the `high` default, so dropping quality for new batches
would make the art visibly inconsistent.

### Sketch (conceptual)
```python
import base64, json, glob
from openai import OpenAI
client = OpenAI()  # reads OPENAI_API_KEY
for path in glob.glob("patients/*.json"):
    c = json.load(open(path))
    o = c["openai_4o"]
    r = client.images.edit(model="gpt-image-1",
                           image=[open(o["anchor_image"], "rb")],
                           prompt=o["prompt"], size=o["size"])
    open(o["output"], "wb").write(base64.b64decode(r.data[0].b64_json))
```

## The AI triage eval (NEW 2026-07-19)

**Purpose: an AMBIGUITY DETECTOR, not a scoring test.** It shows an AI exactly what a
player sees — the blind 8-field card plus the portrait — as an EM-bound M4 who has already
done several ED rotations, and asks for one zone. If a competent reader can't reach the
authored answer from the card alone, the CARD is underspecified (or the case is
mis-authored). **The eval only nominates; a human decides.** It must never auto-edit cases.

Workflow:
```
python build_player_view.py                 # after ANY case edit — regenerates blind set
python run_triage_eval.py --runs 3          # all 100, 3x   (~$1.80, ~9 min)
python run_triage_eval.py 1 10 --dry-run    # free preview
python run_triage_eval.py --no-image        # text-only ablation: is the art carrying signal?
python make_eval_report.py                  # newest result → "openAI {model} {lo}-{hi}.md"
```

- **Three-tier grading** matches the game: `correct` (textbook) / `acceptable` (listed in
  `acceptableZones`, NOT a miss) / miss, labelled over-triage, under-triage, or wrong-lane.
- **`--runs 3` is the real tool.** A case answered differently across identical runs
  ("WOBBLE" in the report) is *genuinely ambiguous* — a stronger signal than a consistent
  miss, and the primary `acceptableZones` candidate.
- **`keyFactors`** (2–4 short phrases the model actually used) is the most valuable output:
  when your intended tell is *absent* from that list, the card isn't conveying it. This is
  how case 003 was diagnosed — the model weighed "bleeding controlled" and never once
  surfaced the penetrating mechanism.
- **AI text is diagnostic only, never shipped.** `keyFactors`/`reasoning` stay in
  `eval-results/` and out of the case schema. Shipping unreviewed AI medical text to an EM
  doctor is the fastest way to lose the gift's credibility; it can be confidently wrong
  even when the zone is right. Promote ideas into the human-authored `teach` field instead.
- `race` is deliberately withheld from the eval card (authored for realism, never linked to
  the medicine — feeding it in could only introduce bias).
- The prompt *gives* the AI the zone definitions and both tripwire rules, so it is better
  briefed than a cold player. That's intentional (otherwise it tests the glossary, not the
  cases) but it means traps depending on those two rules won't be detected.

## Re-grading an eval without re-running it (free)

**Authoring an `acceptableZones` entry does not change what the AI answered — only how it
scores.** So after tuning the answer key, re-score the *saved* responses instead of
spending ~$2.80 on a fresh run. This is exact, not an approximation, and it avoids adding
sampling noise that would muddy the comparison.

Procedure used 2026-07-19:
1. Copy the raw run to `eval-results/_archive/…-RAW-as-run.json` and verify the `chosen`
   values are byte-identical afterwards.
2. For each record, refresh `correctZone` / `acceptableZones` / `triage` from the current
   case file and re-grade with **`grade()` imported from `run_triage_eval.py`** — never a
   reimplementation, or the report and the eval could disagree about what counts as a hit.
3. Write back to the canonical filename and re-run `make_eval_report.py`.

**Gotcha — the report filename is parsed from the eval filename.** `make_eval_report.py`
derives the model as `"-".join(parts[1:-3])` of the stem, so the file must end with
`…-{image|noimage}-{N}x-{N}cases.json`. A `-regraded` suffix silently produced
`openAI gpt-4o-image 001-155.md` instead of `openAI gpt-4o 001-155.md`.

## MIXED file formatting — read before scripting an edit

`patients/*.json` is **not** uniformly formatted. Some files are hand-authored with
compact single-line arrays (`"signs": ["a", "b"],`); others were written by `json.dump`
and have multi-line arrays. Blind line-surgery on `"signs"` corrupted case 058 by
replacing the opening line and orphaning the rest.

**The safe pattern**, used by every edit script in this project:

```python
original = path.read_text(encoding="utf-8")
if json.dumps(json.loads(original), indent=2, ensure_ascii=False) + "\n" == original:
    ...json round-trip is lossless for THIS file - just dump it...
else:
    ...line-patch, and only for fields known to be single-line...
```

Always re-parse afterwards and assert that **no field except the intended ones changed**.
That guard is what caught the 058 corruption before anything was written to disk.

## Image safety-filter blocks

`gpt-image-1` moderates at the **output** stage, so a rejection is about the rendered
picture, not the wording. Case 058 (a 16-year-old girl with "a hand at the throat") was
rejected as `self-harm` and stayed rejected after rewording — **any hands-near-a-minor's-
neck composition trips it.** The same phrase on a 27-year-old man (case 083) passes fine.
If a paediatric case ever needs re-rolling, move the hands away from the neck.

## Engine responsibilities (to build) — game model finalized 2026-07-21

- **Zone check (three-tier, flat) — routed through scoring functions:** `correctZone` →
  `pointsCORRECT`/green/ding. Else if in `acceptableZones` → `pointsACCEPTABLE`/amber/bing —
  NOT a miss. Else `pointsWRONG` (negative)/red/buzz. All string compares; no runtime lookup.
  **Compute every award via a function** (`scoreForPlacement`, `penaltyForLeftInQueue`,
  `bonusForSecondsLeft`) so a future proportional rule is a one-function change (spec §3).
  **Flat, not directional** in v1 — `triage` does not scale the penalty yet.
- **Tap state machine (no drag):** 2 states (PATIENT panel empty/occupied), rules a–d in
  spec §3c. Any queued patient is selectable; **occupied panel + tap another queued patient =
  swap** (queue↔panel); the **PATIENT panel is not a button** (taps ignored); panel is not
  auto-refilled after a room placement.
- **Transfer animation = isolated, disable-able:** `animateTransfer(img, srcPos, destPos,
  fade)` called on every move; game logic must not depend on it (stub/return = still playable).
- **Vitals rendering:** draw each vital as a colored circle from `vitals[k].color` with
  `vitals[k].value` inside. **No age-band computation** — colors are authored.
- **In-play feedback = non-verbal:** green/amber/red room flash + ding/bing/buzz + a floating
  `+100`/`+50`/`−50`. No text, no mid-rush reveal. The `−25` left-in-queue and time bonus
  appear only in the round-stats popup (they are end-of-round adjustments).
- **Round loop:** 3 rounds, each configured by an `rN_` block; ends on timer=0 OR (queue
  empty AND all patients placed) — early clear banks a time bonus. Countdown popup starts each
  round; round-stats popup bridges rounds and itemizes the score. Game-over → splash. **No
  fail state, no reputation meter, no Results screen.**
- **Queue/spawn (QUIET → RUSH):** `rN_patientsTotal` pool; start with `rN_patientsInitial`;
  QUIET adds every `rN_patientsDelay_QUIET`s up to `rN_patientsQueueMax_QUIET`; at
  `rN_RUSHtrigger` (timer remaining) switch to `_RUSH` delay + cap (≤10); new patients push
  the queue up and appear at the bottom; thumbnails squish; pool drains, no refill. No LWBS.
- **Config:** all tunables from `assets/config.js` (`CONFIG_TEXT`), parsed at startup (§3d).
- **Persistence:** `localStorage` — player ID, last-game recap, device-local top-5.

## Environment notes

- Windows 11, plain HTML/CSS/JS, no build step. Deploy via GitHub Desktop → GitHub Pages.
- **chrome-devtools MCP** registered & connected — open/screenshot/touch-test at
  iPhone/iPad viewports (`emulate` / `resize_page`).
- Node v22.16.0, npm 11.18.0. Pillow available. Quote Windows backslash paths in Bash.
- Validation one-liner used this session (Node) confirms every case: valid JSON,
  `correctZone === TRIAGE_ZONE[triage]`, id === filename, `openai_4o.output` path,
  vitals `{value,color}` shape.

## Open technical questions (decide during build)

**Resolved 2026-07-21:** drag is gone (all-tap, §3c) · fail model is gone (3 rounds,
score-only, §3b) · scoring is flat (§3) · localStorage confirmed over cookies · config is
`config.js` not a fetched file (§3d). Remaining:

- Which of `presentationShort` / `presentationLong` the card shows (maybe responsive to
  space; both authored, so a pure UI choice).
- Game art size: **DECIDED 2026-07-21 — the hi-res 1024² masters ship as-is, one set, no
  downscale** (`assets/images/`). John's call: don't maintain two sets; revisit only if a
  real phone-performance problem appears, and then downscale the single game copy. Images
  live in the HTTP cache (auto-evicted), never localStorage; preload the round's patients
  during the splash/countdown.
- Room layout: 5 stacked full-height lanes on the right vs another arrangement — prototype
  and touch-test on the real phone.
- SFX assets (ding/bing/buzz), the tornado swirl tuning, League easter-egg polish: later.

## Cross-device testing plan (2026-07-21)

- **Iterate:** chrome-devtools MCP — emulate iPhone 16 Pro / iPad viewports + screenshot.
- **Desktop/iPad quick look:** Chrome device-toolbar (responsive mode) presets.
- **Truth:** the real iPhone 16 Pro via GitHub Pages ("Add to Home Screen" for standalone).
- **Phone testing before a Pages deploy:** `python -m http.server` on the PC, open
  `http://<PC-LAN-IP>:8000` from the phone on the same wifi. Emulation is for speed; only
  real iOS Safari tells the truth about touch feel and safe areas.
