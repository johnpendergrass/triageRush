# Asset Audit and Resize Workspace

This folder keeps production-asset audit code, generated audit data, and future
resize trials separate from the runtime artwork.

## Authority and scope

- UI artwork is audited from the parent `triageRush/assets/` tree.
- Canonical patient portraits are audited from `patient-data/patient-images/`.
- Documents `7` and `9` plus the audit display model supply preliminary geometry
  evidence. Final production CSS replaces those estimates before optimization.
- `lobby-page/archived/` is measured but excluded from runtime recommendations.
- Nothing under this audit folder is a runtime dependency.

## Approved implementation sequence

1. Build and visually approve the complete game with the current production
   assets at their current paths and resolutions.
2. Make CSS containers—not image `naturalWidth` or `naturalHeight`—own every
   rendered size so later asset replacement cannot alter layout or gameplay.
3. After the game is complete, rerun this audit against the final CSS at iPhone
   16 Pro Max 3x, Full HD, and normal 4K desktop sizes.
4. Create representative resize/compression trials under `resized-assets/` and
   obtain visual approval before batch conversion.
5. Preserve the high-resolution originals outside the runtime manifest and,
   preferably, outside the deployed web root.
6. Replace runtime assets at the same logical paths and filenames where
   practical. If a format changes, update only the centralized manifest.
7. Refresh the production cache version and rerun visual, loading, alpha, and
   manifest tests.

Asset optimization is therefore a post-implementation release phase, not a
prerequisite for beginning game development.

## Current files

- `audit_assets.py`: repeatable read-only inventory/report generator.
- `asset-inventory.json`: complete machine-readable audit data.
- `asset-audit-report.md`: human-readable findings and proposed targets.
- `resized-assets/`: future trial exports; nothing there is approved runtime art
  until it passes visual review.

Run the audit from any directory:

```text
python D:\Dev\Projects\triageRush\triageRush\assets\_asset-audit-and-resize\audit_assets.py
```

The script rewrites only its two generated audit outputs. It never modifies,
moves, renames, recompresses, or deletes source assets.
