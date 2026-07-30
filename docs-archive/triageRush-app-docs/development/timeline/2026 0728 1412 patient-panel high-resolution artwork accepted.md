# Patient-Panel High-Resolution Artwork Accepted

Date: 2026-07-28

The reconstructed patient-panel artwork has been reviewed and promoted into
the active asset tree. The former smaller files were deleted, and the
`-candidate` suffixes were removed from the accepted files.

## Final inventory

The active folder is
`triageRush-app/assets/patient-panel/backgrounds/`.

| Asset | Dimensions | Alpha |
|---|---:|---|
| `patient-panel-background-hires.png` | `906 x 2520` | Opaque RGB |
| `patient-panel-name-bubble-hires.png` | `368 x 92` | Transparent RGBA |
| `patient-panel-quote-bubble-hires.png` | `764 x 227` | Transparent RGBA |
| `patient-panel-vitals-bubble-hires.png` | `810 x 351` | Transparent RGBA |
| `patient-panel-clipboard-bubble-hires.png` | `809 x 375` | Transparent RGBA |

The background is exactly 1.5 times the former `604 x 1680` artwork. The four
overlay dimensions are the nearest whole-pixel equivalents to the same 1.5x
scale. Their transparent corners and independent layering must be preserved.

Runtime patient names, quotations, vital values, and presentation text remain
separate UI content and must not be baked into these images.

