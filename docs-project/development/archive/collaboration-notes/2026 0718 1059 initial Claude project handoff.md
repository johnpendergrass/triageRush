> **Historical document — not authoritative.** This is an early project
> handoff. Start with the current
> [Single Source of Truth](../singleSourceOfTruth/README.md).

# Claude-ToBeContinued — 2026-07-18 10:59
## Project: TRIAGE RUSH (browser game, gift project)

This file is the handoff from the initial brainstorming session (held in the
now-abandoned `D:\Dev\Projects\operation` folder). The project is being
restarted fresh in a new `triageRush` folder. **No code has been written yet.**
This file is the entire project state.

---

## THE MISSION (hard constraints)

- A small browser game as a **gift for a 4th-year medical student**.
- **Deadline: must ship TOMORROW (2026-07-19).** Total build budget: **6-8 hours.**
- Giftee plays on **iPhone or iPad only** — touch-first design, NO mouse/hover
  assumptions, big touch targets, forgiving gestures.
- Must NOT be text-only / flashcard-like (giftee does flashcards all day).
- Fun over educational — but medical content should be real enough that an M4
  finds it clever, with humor mixed in.
- Difficulty should ramp as play continues.
- Tech: plain **HTML / CSS / JS**, no build step, self-contained.
- Deploy target: **GitHub Pages** (John deploys via GitHub Desktop / website).

## THE GAME: TRIAGE RUSH

Chosen 2026-07-18 over three alternatives (Swipe Clinic / Reigns-style,
Steady Hands / path tracing, Rhythm Check / ECG game). Reasons: visual and
kinetic rather than card/text-based, real-but-funny medical content, clean
difficulty ramp, touch-forgiving interaction, comfortably fits the time budget.

### Core loop
- An ER waiting room fills with patients. Each patient card shows a chief
  complaint, e.g. "crushing chest pain radiating to left arm" or
  "stubbed toe, demanding MRI."
- Player **drags each patient to the correct destination**: e.g. Resus,
  Fast Track, Waiting Room, Psych (final destination list TBD with John).
- Correct triage = points; wrong triage = penalty (mechanic TBD — lives?
  hospital-reputation meter?).
- Lose condition: waiting room overflows (patients keep arriving).

### Difficulty ramp
- Patients arrive faster over time.
- Complaints get subtler — the fun is cases that LOOK minor but aren't
  (and vice versa). That's the clinical-judgment flex an M4 enjoys.

### Tone
- Humor in the patient write-ups is a core feature, not decoration.
- Content lives in a data file (JS array/JSON) so it's easy to add/edit cases.

## OPEN DESIGN QUESTIONS (ask John before/while building)

1. Destination list: how many triage targets, and which? (4 feels right.)
2. Fail/penalty mechanic: lives vs. reputation meter vs. score-only.
3. Portrait vs. landscape layout (likely portrait for iPhone; test both).
4. Giftee's name — personalize the title screen? ("St. ___'s Memorial ER"?)
5. Sound effects: nice-to-have only if time remains.

## JOHN'S WORKING STYLE (carry over)

- **Small incremental steps.** Build a bare scaffold first (index.html,
  css/style.css, js/main.js — title + empty play area), confirm it renders,
  then add ONE mechanic at a time. **Wait for John's go-ahead between steps.**
- Easy-to-understand, well-commented code beats clever/fast code.
- John deploys with GitHub Desktop / the GitHub website, not terminal git.

## ENVIRONMENT NOTES (fixed this session — should Just Work now)

- **chrome-devtools MCP** is registered at user scope (`npx -y
  chrome-devtools-mcp@latest`) and verified connected — use it to open,
  screenshot, and touch-test the game. Use `emulate` / `resize_page` to
  preview iPhone/iPad viewport sizes.
- **Global npm was corrupted and has been repaired** (reinstalled npm 11.18.0
  into D:\languages\npm-global using Node's bundled npm). Node is v22.16.0.
  npm 12 requires newer Node — stay on npm 11.
- File permissions verified: Write/Edit flow freely; `rm`/`del` are
  deny-listed by design (ask John to delete files).
- Leftover junk: `_permission-test.txt` in the old `operation` folder —
  John can delete the whole folder once this file is copied out.

## IMMEDIATE NEXT STEPS (new session, new folder)

1. Read this file; confirm to John it was read.
2. Settle the open design questions above (quickly — deadline is real).
3. Build scaffold: index.html / css/style.css / js/main.js, mobile viewport
   meta tags, title screen. Verify in browser via chrome-devtools MCP at an
   iPhone viewport.
4. Then, one step at a time with John's approval: patient card rendering →
   drag-to-zone mechanic → scoring → arrival timer/ramp → content pass
   (write ~30-50 cases) → polish → GitHub Pages deploy.

## LONG-TERM / STRETCH (only if time allows before shipping)

- Sound effects (buzzer/ding), simple animations, high-score in localStorage,
  special "celebrity patient" cameo cases, personalized ending screen.
