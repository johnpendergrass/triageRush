# triageRush Production Asset Audit

**Generated:** 2026-08-04T13:57:33-07:00

**Status:** Audit only. No source or runtime asset was resized, recompressed, renamed, moved, or deleted.

## Scope and authority

- UI artwork was read only from `triageRush/assets/`.
- Files inside `_asset-audit-and-resize/` were excluded from the scan.
- `lobby-page/archived/` was measured separately and is not a runtime candidate.
- Patient portraits were read from canonical `patient-data/patient-images/`.
- Documents `7` and `9` plus the audit display model supplied preliminary geometry; final production CSS replaces those estimates before optimization.

## Approved sequencing decision

1. Build and visually approve the complete game with the current high-resolution production assets.
2. Keep all layout dependent on CSS containers; runtime code must not use an image's natural pixel dimensions to determine geometry or game behavior.
3. Rerun this audit after final CSS is approved at iPhone 16 Pro Max 3x, Full HD, and normal 4K desktop sizes.
4. Export and visually compare representative trials before resizing a category in bulk.
5. Preserve high-resolution masters outside the runtime manifest and preferably outside the deployed web root.
6. Replace approved runtime images at the same logical paths and filenames where practical; format changes require only centralized manifest updates.
7. Refresh production cache versions and rerun loading, transparency, visual, and manifest tests.

Asset optimization is a post-implementation release phase. The proposed boxes below remain planning evidence and do not block game development.

## Display-planning assumptions

- One responsive 9:16 shell is used on all devices.
- The Full HD desktop case is 1920 × 1080 CSS pixels, producing an approximately 547 × 972 shell.
- A normal 3840 × 2160 4K desktop at 100% scaling produces an approximately 1094 × 1944 shell because the game uses 90% of viewport height.
- The large-phone reference is 430 × 932 CSS pixels, producing an approximately 422 × 750 shell.
- The iPhone 16 Pro Max reference is 440 × 956 logical pixels at 3x; after the current horizontal margin, its game shell is approximately 432 × 768 logical or 1296 × 2304 physical pixels.
- That iPhone shell remains more demanding than 4K desktop for many assets, while 4K establishes the larger CSS layout boxes.
- Most ordinary artwork targets approximately 2x quality; small lettering and prominent portraits receive more headroom.
- Suggested raster boxes are ceilings for trial exports, not automatic resize commands.
- The original aspect ratio must always be preserved.

## Current footprint

| Source set | Files | Images | Current size |
|---|---|---|---|
| Production UI files, including archive/metadata | 58 | 51 | 187.34 MiB |
| Runtime-candidate production UI files | 48 | 48 | 183.14 MiB |
| Archived lobby source files | 3 | 3 | 4.20 MiB |
| Canonical patient portraits | 160 | 160 | 159.94 MiB |

The browser does not download all of these files merely because they exist. Delivery cost depends on the runtime manifest and loading strategy. Nevertheless, runtime images this large would be expensive if eagerly loaded.

## Category findings

| Category | Files | Current size | Native dimension range | Trial raster box | Audit recommendation |
|---|---|---|---|---|---|
| archived-source | 3 | 4.20 MiB | 473–852 × 267–1846 | TBD | archive-only: 3 |
| lobby-background | 1 | 2.24 MiB | 852–852 × 1515–1515 | 1152 × 2048 | compression-trial-keep-dimensions: 1 |
| lobby-board | 2 | 2.23 MiB | 941–941 × 1672–1672 | 1200 × 2136 | compression-trial-keep-dimensions: 2 |
| lobby-control | 1 | 3.99 MiB | 2298–2298 × 1415–1415 | TBD | display-box-decision-required: 1 |
| lobby-overlay | 1 | 233.9 KiB | 514–514 × 232–232 | 768 × 384 | keep-size-review-normal-compression: 1 |
| metadata | 7 | 2.9 KiB | n/a | TBD | keep-as-development-metadata: 7 |
| patient-panel-background | 1 | 4.11 MiB | 906–906 × 2520–2520 | 768 × 2048 | resize-and-compression-trial: 1 |
| patient-panel-overlay | 4 | 662.7 KiB | 368–810 × 92–375 | 768 × 1096 | keep-size-review-normal-compression: 4 |
| patient-portrait | 160 | 159.94 MiB | 1024–1024 × 1024–1024 | 1152 × 1152 | compression-trial-keep-dimensions: 143, keep-size-review-normal-compression: 17 |
| room-door | 14 | 28.81 MiB | 1152–1777 × 1792–1792 | 256 × 400 | resize-and-compression-trial: 14 |
| room-interior | 7 | 29.67 MiB | 1152–1777 × 1792–1792 | 320 × 448 | resize-and-compression-trial: 7 |
| room-wall | 1 | 3.75 MiB | 1777–1777 × 1792–1792 | TBD | display-box-decision-required: 1 |
| waiting-background | 16 | 107.47 MiB | 1777–1777 × 2509–2509 | 320 × 448 | resize-and-compression-trial: 16 |

- **38** files are large enough relative to their proposed display box to justify a resize/compression trial.
- **146** files appear dimensionally reasonable but still justify a compression-only trial.
- **181** images contain transparency and must retain alpha-capable output.
- **30** images are opaque and may use quality-controlled WebP trials without an alpha requirement.
- **0** meaningful exact duplicate image groups were found across the audited source sets.

## Largest runtime candidates

| Source | Path | Category | Size | Dimensions | Recommendation |
|---|---|---|---|---|---|
| production-ui | game-page/waiting-room-panel/background-1.png | waiting-background | 7.11 MiB | 1777 × 2509 | resize-and-compression-trial |
| production-ui | game-page/waiting-room-panel/background-13.png | waiting-background | 7.04 MiB | 1777 × 2509 | resize-and-compression-trial |
| production-ui | game-page/waiting-room-panel/background-6.png | waiting-background | 6.98 MiB | 1777 × 2509 | resize-and-compression-trial |
| production-ui | game-page/waiting-room-panel/background-15.png | waiting-background | 6.98 MiB | 1777 × 2509 | resize-and-compression-trial |
| production-ui | game-page/waiting-room-panel/background-10.png | waiting-background | 6.96 MiB | 1777 × 2509 | resize-and-compression-trial |
| production-ui | game-page/waiting-room-panel/background-16.png | waiting-background | 6.88 MiB | 1777 × 2509 | resize-and-compression-trial |
| production-ui | game-page/waiting-room-panel/background-12.png | waiting-background | 6.88 MiB | 1777 × 2509 | resize-and-compression-trial |
| production-ui | game-page/waiting-room-panel/background-14.png | waiting-background | 6.76 MiB | 1777 × 2509 | resize-and-compression-trial |
| production-ui | game-page/waiting-room-panel/background-11.png | waiting-background | 6.75 MiB | 1777 × 2509 | resize-and-compression-trial |
| production-ui | game-page/waiting-room-panel/background-4.png | waiting-background | 6.71 MiB | 1777 × 2509 | resize-and-compression-trial |
| production-ui | game-page/waiting-room-panel/background-5.png | waiting-background | 6.66 MiB | 1777 × 2509 | resize-and-compression-trial |
| production-ui | game-page/waiting-room-panel/background-2.png | waiting-background | 6.61 MiB | 1777 × 2509 | resize-and-compression-trial |
| production-ui | game-page/waiting-room-panel/background-7.png | waiting-background | 6.59 MiB | 1777 × 2509 | resize-and-compression-trial |
| production-ui | game-page/waiting-room-panel/background-9.png | waiting-background | 6.28 MiB | 1777 × 2509 | resize-and-compression-trial |
| production-ui | game-page/waiting-room-panel/background-3.png | waiting-background | 6.19 MiB | 1777 × 2509 | resize-and-compression-trial |
| production-ui | game-page/waiting-room-panel/background-8.png | waiting-background | 6.11 MiB | 1777 × 2509 | resize-and-compression-trial |
| production-ui | game-page/triage-rooms-panel/background-discharge-room.png | room-interior | 5.80 MiB | 1777 × 1792 | resize-and-compression-trial |
| production-ui | game-page/triage-rooms-panel/background-esi-1-room.png | room-interior | 4.49 MiB | 1152 × 1792 | resize-and-compression-trial |
| production-ui | game-page/triage-rooms-panel/background-esi-2-room.png | room-interior | 4.32 MiB | 1152 × 1792 | resize-and-compression-trial |
| production-ui | game-page/patient-panel/patient-panel-background-hires.png | patient-panel-background | 4.11 MiB | 906 × 2520 | resize-and-compression-trial |

## Format-trial guidance

- Preserve every original PNG as the high-resolution source during trials.
- Transparent doors, boards, and UI overlays: compare optimized PNG with lossless WebP first so lettering and edges remain exact.
- Transparent patient portraits: compare optimized PNG with WebP alpha at several quality levels inside the real queue, patient panel, and Coach views.
- Opaque painted backgrounds and room interiors: compare optimized PNG with quality-controlled WebP. JPEG is optional but adds no advantage if WebP wins consistently.
- Do not choose one universal format merely to simplify the manifest; choose a small category rule only after measured visual comparisons.

## Recommended optimization order

1. **Room doors:** trial approximately 256 × 400 bounding boxes. Their current native resolution is far above the seven-row display box; preserve lettering and transparency during visual QA.
2. **Waiting-room backgrounds:** trial approximately 320 × 448. Test both five-row Triage and ten-row RUSH layouts.
3. **Room interiors:** trial approximately 320 × 448 bounding boxes after confirming the final open-door layering.
4. **Patient-panel artwork:** trial category-specific dimensions, retaining more vertical detail for the full-height panel background.
5. **Patient portraits:** keep the current square dimensions initially, test quality-controlled WebP/PNG compression, and measure the total. Resize only if actual Coach/review rendering proves a smaller ceiling safe.
6. **HOME background, boards, and Start Shift overlay:** avoid downsizing. They are prominent, contain lettering, and are displayed near or above their current native dimensions on a normal 4K screen and a 3x phone; test compression first and never upscale an existing source merely to meet a planning box.
7. **Shared room-wall texture:** defer resizing until the square source's tall-panel and room-row background behavior is resolved.
8. **Boombox:** defer resizing until its final CSS display box is approved.

## Proposed delivery flow

1. Load the shell and HOME-critical assets first.
2. Load/validate patient data while the player views HOME.
3. On Start Shift, show `PATIENTS ARE ARRIVING` while decoding the initial queue portraits and a measured reserve.
4. Start the timer only after required assets are ready.
5. Maintain a rolling portrait preload buffer during the shift instead of automatically downloading all 160 portraits.
6. Use the no-cache server only for development. Production should use normal caching and versioned asset URLs.

## Approval gates before resizing

- John approves each category's maximum rendered box and quality target.
- One representative asset per category is exported and compared in the actual shell at phone DPR 3, Full HD desktop, and normal 4K desktop at 100% scaling.
- Transparency, fine lettering, and non-transparent edge colors are checked.
- The original high-resolution file is retained outside the runtime manifest.
- Only approved optimized copies are placed in the eventual runtime asset tree.
- Initial-load bytes, Start Shift preparation bytes, and rolling-buffer bytes are measured separately.

## Generated data

The complete per-file dimensions, hashes, transparency flags, proposed fitted dimensions, and recommendations are in `asset-inventory.json`. Rerun this report with:

```text
python audit_assets.py
```
