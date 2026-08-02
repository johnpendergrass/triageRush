# Triage Rush — Codex Project Brief

## Purpose

This document is intended to orient a Codex session to the current state of **Triage Rush**, a browser-based mobile game set in a hospital emergency department.

The immediate goal is not to rewrite the game. The first goal is to inspect the existing project, understand the actual layout and asset boundaries, and establish a reliable visual iteration workflow using the real HTML, CSS, JavaScript, and art files.

---

## 1. Product concept

**Triage Rush** is a fast-paced emergency-department triage game designed primarily for mobile browsers, including Safari on iPhone and Chrome on Android.

The game should run inside a normal browser window. It is not being designed around a special full-screen or installed-web-app mode that removes the browser's address bar and bottom controls.

The player reviews patients and sends each one to the correct disposition area. As the game progresses, the waiting room becomes increasingly crowded.

### Core screen concept

The screen has three main vertical regions:

1. **Waiting room — left**
   - Shows patients waiting to be triaged.
   - Early in the game, approximately five patients may be fully visible.
   - Later, there may be six to ten patients.
   - At higher occupancy, patient cards may become shorter, crop from the bottom, and overlap vertically.
   - The queue must still remain readable and preserve the visual identity and condition of each patient.

2. **Current patient — center**
   - The largest and most important region.
   - Displays the active patient in an emergency-department corridor.
   - The patient artwork may contain clinically relevant visual clues anywhere on the body, including the feet and lower legs.
   - No quote box, vitals panel, or other interface element should cover clinically relevant parts of the patient artwork.
   - Below the image are:
     - patient quote;
     - vital signs;
     - intern presentation / clinical summary.

3. **Disposition rooms — right**
   - Five selectable destinations displayed as doors.
   - The doors should look like actual hospital doors rather than flat rectangular buttons.
   - All five doors must fit without overlap or clipping.
   - Current labels:
     - **ESI 1 — RESUS**
     - **ESI 2–3 — ACUTE**
     - **ESI 4–5 — FAST TRACK**
     - **PSYCH — BEHAVIORAL HEALTH**
     - **DISCHARGE**
   - The bottom Discharge destination should visually resemble glass hospital lobby doors, but the gameplay label must read **DISCHARGE**, not merely EXIT.

---

## 2. Current visual direction

The desired style is:

- approachable, colorful medical-game presentation;
- semi-realistic or polished friendly illustration;
- strong silhouettes and readable facial expressions;
- clear visual hierarchy;
- hospital materials such as:
  - corridor walls;
  - ceiling panels;
  - fluorescent lighting;
  - black-and-white or gray checkerboard tile;
  - institutional doors;
  - waiting-room chairs;
- dark navy structural framing;
- color-coded destination doors;
- legible, high-contrast interface text.

Gameplay clarity takes precedence over realism or decoration.

The existing generated mockups are **concept references only**. They are flattened raster images and do not define the actual production geometry of the application.

---

## 3. Important distinction: mockup versus implementation

Previous visual exploration was done by generating complete screen images. Those images were useful for:

- atmosphere;
- relative proportions;
- door concepts;
- color coding;
- general information hierarchy.

However, a flattened generated mockup does not know:

- the real HTML element boundaries;
- the CSS grid or flex dimensions;
- the intrinsic dimensions of the patient assets;
- whether an image uses `object-fit: contain` or `cover`;
- the true crop window;
- where transparent padding exists inside a PNG;
- which elements overlap at runtime;
- the actual browser viewport in CSS pixels.

Codex should therefore use the real project as the source of truth.

Do not infer exact layout dimensions from the concept images.

---

## 4. Mobile layout assumptions

The game is intended for portrait-oriented mobile browsers.

Use CSS pixels for browser layout. Raster source files use actual image pixels.

A practical reference layout is approximately:

- design reference: **360 × 640 CSS px**;
- target phone widths: roughly **360–430 CSS px**;
- support constrained viewports down to approximately **320 CSS px wide** where feasible;
- do not assume plain `100vh` always equals the visible mobile browser area;
- account for dynamic Safari and Chrome browser controls;
- preserve safe spacing around screen edges and browser UI.

The exact supported viewport set should be determined after inspecting the existing code.

---

## 5. Art asset guidance

### Current patient illustrations

Preferred source format:

- approximately **1024 × 1024 actual image pixels**;
- square composition;
- RGB;
- PNG or WebP;
- consistent art style;
- enough resolution for high-density phone screens;
- full body visible when the case requires it;
- no embedded UI text;
- consistent chair and lighting where appropriate.

A 1024 × 1024 source may be displayed at roughly 300–430 CSS px wide. The browser will scale the image.

### Critical composition rule

The active-patient display must preserve all clinically relevant body regions.

Do not solve a foot-visibility problem merely by covering the feet with the quote panel. Instead:

- inspect the actual image container;
- inspect transparent padding inside the asset;
- use `object-fit`, `object-position`, or a controlled transform;
- crop the source asset only when medically safe;
- reduce the displayed patient slightly when necessary;
- preserve a small visual margin around the entire body.

### UI assets

Preferred implementation:

- labels and numbers: HTML text;
- borders and panels: CSS;
- icons: SVG where practical;
- door labels: HTML text;
- patient art: separate raster assets;
- reusable backgrounds: separate raster or CSS assets;
- complete flattened screen image: reference only, never the production UI.

---

## 6. Known design decisions

### Waiting-room panel

The waiting-room column should be narrower than in the first prototype.

Current design intent:

- reduce its width by approximately **20% relative to its existing implementation**;
- transfer the recovered width to the center patient panel;
- leave the right disposition column approximately unchanged initially;
- keep each waiting patient centered horizontally;
- position patients toward the lower portion of each waiting-room slot;
- do not waste vertical space on decorative signs when queue capacity is more important.

The 20% reduction must be based on the actual implemented column width, not estimated from a screenshot.

Example:

- if the current waiting-room column is 100 CSS px wide, target approximately 80 CSS px;
- if it is controlled by a grid fraction, calculate the resulting rendered width at the test viewport.

### Waiting-room crowding

Later-game behavior may require a density system:

- 1–5 patients: full-height queue cards;
- 6–7 patients: shorter cards with modest vertical cropping;
- 8–10 patients: overlapping stack or compressed list;
- crop from the bottom only when the important upper-body expression remains visible;
- consider z-index, hover/tap expansion, or selecting a patient to bring the card forward;
- maintain a clear queue order.

Do not implement the full crowding system until the baseline five-patient layout is measured and stable.

### Active-patient panel

The center column should receive the width removed from the waiting room.

Required order:

1. patient artwork;
2. patient quote;
3. vitals;
4. intern presentation.

The quote and intern presentation require enough height for realistic cases. The patient should not have excessive empty space over the head, but the full body must remain available when clinically relevant.

### Disposition panel

Use five independently bounded cells.

Recommended structure:

- one reusable destination-card component;
- equal or deliberately controlled cell heights;
- consistent gaps;
- no cell may overlap another;
- each card remains a large tap target;
- visual door art may differ, but outer card geometry should remain predictable.

Door scheme:

| Destination | Label |
|---|---|
| Highest acuity | ESI 1 / RESUS |
| Higher and moderate acuity | ESI 2–3 / ACUTE |
| Lower acuity | ESI 4–5 / FAST TRACK |
| Behavioral-health referral | PSYCH / BEHAVIORAL HEALTH |
| No ED placement required | DISCHARGE |

Clinical note: psychiatric patients can have any ESI level. The Psych door is a gameplay disposition and should not be treated in code or content as an additional ESI level.

---

## 7. First Codex task: inspection only

Before changing the design, inspect and document the project.

### Requested work

1. Identify:
   - app entry point;
   - main screen component or page;
   - layout system;
   - asset directories;
   - patient data schema;
   - patient image rendering code;
   - waiting-room rendering code;
   - destination-door rendering code;
   - viewport and responsive CSS rules.

2. Run the application locally.

3. Capture the current screen at these CSS viewport sizes:
   - 390 × 844;
   - 430 × 932;
   - 360 × 640;
   - 320 × 568, if the app can reasonably support it.

4. Report the rendered rectangles, in CSS pixels, for:
   - full application shell;
   - waiting-room column;
   - active-patient column;
   - disposition column;
   - active-patient image container;
   - actual active-patient `<img>` element;
   - quote panel;
   - vitals panel;
   - intern-presentation panel;
   - each of the five destination cells.

5. Do not redesign or refactor yet.

### Suggested first prompt to Codex

> Inspect this repository and run the Triage Rush browser game. Do not redesign or rewrite the application yet. Identify the app entry point, layout system, patient-image component, waiting-room component, destination-door component, asset directories, and responsive CSS. Capture screenshots at 390×844, 430×932, 360×640, and, if viable, 320×568 CSS pixels. Report the actual rendered CSS rectangles for the three main columns, the active-patient image container, the rendered `<img>`, the quote, vitals, intern-presentation panel, and all five destination cells. Treat the repository and live browser rendering as the source of truth, not any flattened design mockup.

---

## 8. Add a debug-layout mode

Create an optional debug mode that shows true runtime geometry.

Suggested query parameter:

```text
?debugLayout=1
```

Suggested outlines:

- cyan: allocated image container;
- magenta dashed: actual rendered `<img>` bounds;
- yellow: clipping or overflow container;
- lime: quote panel;
- blue: vitals panel;
- orange: intern presentation;
- white: waiting-room card bounds;
- red: destination-card bounds.

Also display a small nonblocking diagnostic label with:

- element name;
- x/y position;
- rendered width/height;
- intrinsic image width/height;
- `object-fit`;
- `object-position`;
- active transform;
- overflow behavior.

The mode must be removable or disabled in production.

### Suggested Codex prompt

> Add a temporary debug-layout mode activated by `?debugLayout=1`. Outline the active-patient image container in cyan, the actual rendered `<img>` in dashed magenta, and its clipping/overflow ancestor in yellow. Outline the quote, vitals, intern-presentation panel, waiting-room cards, and all five destination cells using distinct colors. Add compact labels showing rendered CSS dimensions and, for images, intrinsic dimensions, object-fit, object-position, transform, and overflow. Do not alter normal gameplay when debug mode is off.

---

## 9. Second Codex task: measured width change

After inspection and debug mode are complete:

1. Measure the current waiting-room column.
2. Reduce it by exactly 20%.
3. Transfer the recovered width to the center column.
4. Keep the disposition column width unchanged unless a minimum tap-target constraint requires a documented adjustment.
5. Keep waiting-room patients horizontally centered and bottom-aligned.
6. Preserve all five waiting patients in the baseline view.
7. Verify that the center patient remains fully visible.
8. Capture before-and-after screenshots at the test viewports.

### Suggested Codex prompt

> Using the measured runtime layout, reduce the waiting-room column width by exactly 20% relative to its current rendered width and transfer the recovered width to the active-patient column. Keep the disposition column unchanged. Preserve five visible waiting-room patients, center each patient horizontally, and bottom-align the artwork within each slot. Do not change game logic. Test all target mobile viewports and provide before-and-after screenshots plus the measured column widths.

---

## 10. Third Codex task: patient-image safety

The patient-image system needs a repeatable way to ensure that clinically important anatomy is not obscured.

Codex should inspect:

- source image dimensions;
- transparent padding;
- displayed bounds;
- crop behavior;
- overlay order;
- quote-panel position;
- case-specific focal requirements.

A useful patient metadata extension may include:

```json
{
  "image": "assets/patients/cardiac-mi-01.webp",
  "objectFit": "contain",
  "objectPosition": "50% 50%",
  "scale": 1.0,
  "translateX": 0,
  "translateY": 0,
  "mustShow": ["face", "hands", "feet"]
}
```

The exact schema should follow the existing project architecture rather than being imposed blindly.

Possible future metadata:

- `mustShow`;
- `focalPoint`;
- `safeCrop`;
- `thumbnailObjectPosition`;
- `mainObjectPosition`;
- `mainScale`;
- `queueScale`;
- `queueCropMode`.

### Suggested Codex prompt

> Inspect how patient images are currently sized, positioned, and clipped. Propose the smallest maintainable change that allows per-patient image positioning without embedding UI concerns into the artwork. The system must support separate thumbnail and main-view positioning and allow a case to mark anatomy that must remain visible, such as feet or an injured arm. Implement only after presenting the proposed schema and migration impact.

---

## 11. Art-generation workflow inside Codex

Codex may be used to generate or edit assets, but generated art should be integrated into the real project rather than used as a flattened replacement for the interface.

Recommended loop:

1. Inspect the actual component dimensions.
2. Define the required asset role and aspect ratio.
3. Generate or edit the asset.
4. Save it into the correct asset directory with a stable filename.
5. Update metadata or references.
6. Run the application.
7. Capture screenshots at target viewports.
8. Check clipping, readability, body visibility, and visual consistency.
9. Iterate on either the asset or CSS, depending on the actual problem.

### Art constraints to preserve

- consistent illustration style;
- consistent clinic chair where appropriate;
- clear medical presentation;
- no embedded labels or UI text;
- no unintended logos;
- patient expression and posture must communicate the case;
- relevant injury or symptom must remain visible;
- background should not compete with the character;
- source files should retain enough resolution for mobile high-density displays.

---

## 12. Recommended repository documentation

Create or update an `AGENTS.md` file at the repository root with:

- project purpose;
- startup commands;
- test commands;
- supported viewport sizes;
- asset directory conventions;
- patient-art naming convention;
- no-flattened-UI rule;
- requirement to test visible anatomy;
- requirement to preserve all five destination cells;
- requirement to provide screenshots for visual changes;
- instruction not to change gameplay logic during layout-only tasks.

Suggested asset naming:

```text
assets/
  patients/
    cardiac-mi-gerd-01.webp
    trauma-ankle-01.webp
  backgrounds/
    er-corridor.webp
    waiting-room.webp
  icons/
    resus.svg
    acute.svg
    fast-track.svg
    psych.svg
    discharge.svg
```

Adapt this to the existing repository instead of reorganizing files without a clear benefit.

---

## 13. Acceptance criteria for the initial layout milestone

The initial layout milestone is complete when:

- the project runs in the target mobile browser sizes;
- the true image and container boundaries are inspectable;
- the waiting-room column is measurably 20% narrower than before;
- the recovered width is added to the center panel;
- all five disposition doors are visible and non-overlapping;
- the Discharge door reads **DISCHARGE**;
- patient quote, vitals, and intern presentation have stable allocated space;
- the active patient's full clinically relevant body area remains visible;
- no interface text is baked into patient art;
- screenshots are supplied for each target viewport;
- gameplay logic remains unchanged.

---

## 14. Working principle

For every visual problem, first determine whether the cause is:

1. source-art composition;
2. transparent padding;
3. image element sizing;
4. container sizing;
5. `object-fit` or `object-position`;
6. transform;
7. clipping or overflow;
8. z-index or overlap;
9. responsive breakpoint;
10. insufficient overall screen allocation.

Do not regenerate an asset when the actual problem is CSS.  
Do not force a CSS crop when the actual problem is badly composed source art.  
Measure first, then change the correct layer.

---

## 15. Immediate recommended sequence

1. Inspect repository and run app.
2. Measure real layout at mobile viewports.
3. Add debug-layout mode.
4. Establish screenshot comparison workflow.
5. Narrow waiting-room panel by a measured 20%.
6. Verify five-door disposition layout.
7. Stabilize active-patient image visibility.
8. Add patient-specific positioning metadata if needed.
9. Design later-game six-to-ten-patient queue behavior.
10. Resume art generation using real component dimensions.
