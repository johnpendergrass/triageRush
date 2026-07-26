# Triage Rush Mobile Browser Viewport Contract

## Decision

The game is a portrait, non-scrolling browser game. It must fit the **currently
visible browser viewport**, not the phone's advertised screen resolution.

Mobile browser address/navigation bars can expand and retract, so there is no
single universal phone aspect ratio. The layout must respond to the runtime
viewport height.

## Supported viewport and fixed game canvas

All dimensions below are CSS pixels after the browser has reserved its own
interface.

The minimum supported visible viewport is **360 × 640**. The game itself uses a
fixed **9:16** canvas designed for that minimum browser state.

- Logical design canvas: **360 × 640 CSS pixels**
- High-resolution mock-up canvas: **1080 × 1920 pixels**
- Aspect ratio: **9:16**

On wider or taller phones, the complete 9:16 game canvas is scaled uniformly to
the largest size that fits inside the small viewport. Unused space is
letterboxed. The internal layout does not stretch, reflow, or reveal additional
content.

When browser controls retract and the visible viewport becomes taller, the game
canvas remains the same size and position. The additional area becomes
letterboxing; there is no expansion state.

## Safe-area and browser-chrome rules

1. Use the viewport meta tag with `width=device-width`, `initial-scale=1`, and
   `viewport-fit=cover`.
2. Size the outer browser wrapper to the visible page, but size the game canvas
   against the stable small viewport (`100svh`), not `100dvh`.
3. Apply `env(safe-area-inset-top/right/bottom/left)` as internal padding.
4. Keep the document and game shell `overflow: hidden`.
5. Always assume that the address/navigation bars are fully visible.
6. Never place required content behind the Dynamic Island, camera cutout,
   rounded corners, home indicator, or browser toolbar.
7. Browser-bar transitions must not resize or reflow the game canvas.
8. Center the fixed canvas inside any surplus space and use the game's
   background treatment for letterboxing.

## Layout behavior

- The waiting-room and door rails are symmetric.
- Each side rail is approximately 22% of usable width; the centered patient
  column receives approximately 56%.
- The 360 × 640 canvas is the authored minimum. No element depends on extra
  height from a taller phone or retracted browser controls.
- The entire canvas scales uniformly; individual text and controls do not
  independently shrink or reflow.
- Quote, vitals, presentation, room targets, header, and footer always remain
  visible.
- The expanded clipboard may cover waiting-room patients, portrait, and quote,
  but never vitals or the short presentation.

## Required test matrix

Test initial load with browser controls visible at:

- 360 × 640
- 375 × 667
- 390 × 700
- 393 × 720
- 402 × 780
- 412 × 732
- 430 × 800

For every size:

- the rendered game retains a 9:16 aspect ratio;
- surplus width or height appears only as letterboxing;
- document `scrollWidth <= clientWidth`;
- document `scrollHeight <= clientHeight`;
- no text container has `scrollHeight > clientHeight`;
- no text is line-clamped or ellipsized;
- all controls remain inside safe-area padding;
- all touch targets remain operable;
- opening the information clipboard introduces no layout shift;
- only the clipboard return control is active while the modal is open.

Also test browser controls retracting and returning. The outer visible page may
change height, but the game canvas dimensions and all internal element
coordinates must remain unchanged.

## Desktop

Until a dedicated desktop layout is designed, desktop browsers may center the
mobile game shell at the primary portrait proportions with unused background
space around it. Desktop expansion is a separate later breakpoint and must not
change the mobile contract.
