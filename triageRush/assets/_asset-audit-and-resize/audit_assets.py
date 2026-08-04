"""Audit triageRush production assets without changing or resizing them.

The production asset tree is the source for UI artwork. Canonical patient
portraits are audited separately because the production game will load them
from patient-data rather than copying them into triageRush/assets.

Run from any directory:

    python audit_assets.py
"""

from __future__ import annotations

import hashlib
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    from PIL import Image
except ImportError as error:
    raise SystemExit("Pillow is required: python -m pip install Pillow") from error


AUDIT_FOLDER = Path(__file__).resolve().parent
PRODUCTION_ASSETS_FOLDER = AUDIT_FOLDER.parent
REPOSITORY_FOLDER = PRODUCTION_ASSETS_FOLDER.parent.parent
PATIENT_PORTRAITS_FOLDER = REPOSITORY_FOLDER / "patient-data" / "patient-images"
INVENTORY_OUTPUT = AUDIT_FOLDER / "asset-inventory.json"
REPORT_OUTPUT = AUDIT_FOLDER / "asset-audit-report.md"

IMAGE_EXTENSIONS = {".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"}
MEBIBYTE = 1024 * 1024

# The shell measurements come from the current mobile CSS and the viewport
# acceptance cases in docs/7 and docs/9. Pixel targets are planning ceilings,
# not conversion instructions. Every proposed resize still requires visual QA.
DISPLAY_MODEL = {
    "shell_aspect_ratio": "9:16",
    "full_hd_desktop_viewport_css": [1920, 1080],
    "full_hd_desktop_shell_css": [547, 972],
    "normal_4k_desktop_viewport_css": [3840, 2160],
    "normal_4k_desktop_device_pixel_ratio": 1,
    "normal_4k_desktop_shell_css": [1094, 1944],
    "large_phone_viewport_css": [430, 932],
    "large_phone_shell_css": [422, 750],
    "iphone_16_pro_max_viewport_css": [440, 956],
    "iphone_16_pro_max_shell_css": [432, 768],
    "iphone_16_pro_max_shell_physical_pixels": [1296, 2304],
    "phone_planning_device_pixel_ratio": 3,
    "default_visual_quality_target": "approximately 2x, with up to 3x for small text and prominent portraits",
}

# max_css_box describes the largest likely displayed box in the reviewed
# layouts. suggested_raster_box includes high-density display headroom.
CATEGORY_RULES: dict[str, dict[str, Any]] = {
    "waiting-background": {
        "max_css_box": [241, 332],
        "suggested_raster_box": [320, 448],
        "mobile_usage": "rendered in each visible waiting-queue row",
    },
    "patient-panel-background": {
        "max_css_box": [613, 1668],
        "suggested_raster_box": [768, 2048],
        "mobile_usage": "covers the full center patient panel",
    },
    "patient-panel-overlay": {
        "max_css_box": [588, 840],
        "suggested_raster_box": [768, 1096],
        "mobile_usage": "available in the mobile manifest; final production layering still requires confirmation",
    },
    "room-door": {
        "max_css_box": [147, 217],
        "suggested_raster_box": [256, 400],
        "mobile_usage": "rendered inside each of seven room rows",
    },
    "room-interior": {
        "max_css_box": [241, 238],
        "suggested_raster_box": [320, 448],
        "mobile_usage": "available in the room manifest; final open-door layering requires confirmation",
    },
    "room-wall": {
        "max_css_box": [241, 1668],
        "suggested_raster_box": None,
        "mobile_usage": "final production must decide cover, repeat, or separate variants for the tall panel and room rows before resizing",
    },
    "lobby-background": {
        "max_css_box": [1094, 1944],
        "suggested_raster_box": [1152, 2048],
        "mobile_usage": "forward HOME full-frame background",
    },
    "lobby-overlay": {
        "max_css_box": [660, 298],
        "suggested_raster_box": [768, 384],
        "mobile_usage": "registered Start Shift overlay in the forward HOME design",
    },
    "lobby-board": {
        "max_css_box": [1026, 1823],
        "suggested_raster_box": [1200, 2136],
        "mobile_usage": "settings/about overlay board in the forward HOME design",
    },
    "lobby-control": {
        "max_css_box": None,
        "suggested_raster_box": None,
        "mobile_usage": "forward HOME control; exact rendered box must be fixed before resizing",
    },
    "patient-portrait": {
        "max_css_box": [1002, 1002],
        "suggested_raster_box": [1152, 1152],
        "mobile_usage": "waiting queue, active patient panel, Coach, and Patients Seen review",
    },
    "archived-source": {
        "max_css_box": None,
        "suggested_raster_box": None,
        "mobile_usage": "archive only; must never appear in the runtime manifest",
    },
    "metadata": {
        "max_css_box": None,
        "suggested_raster_box": None,
        "mobile_usage": "development metadata only; not delivered as game artwork",
    },
}


def format_bytes(byte_count: int) -> str:
    """Return a compact binary-size label."""

    if byte_count >= MEBIBYTE:
        return f"{byte_count / MEBIBYTE:.2f} MiB"
    if byte_count >= 1024:
        return f"{byte_count / 1024:.1f} KiB"
    return f"{byte_count} B"


def sha256_for_file(file_path: Path) -> str:
    """Calculate a stable content hash without loading the whole file at once."""

    digest = hashlib.sha256()
    with file_path.open("rb") as source_file:
        for chunk in iter(lambda: source_file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def classify_production_asset(relative_path: Path) -> str:
    """Assign one meaning-oriented category to a production asset."""

    path_text = relative_path.as_posix().lower()
    file_name = relative_path.name.lower()

    if "archived" in relative_path.parts:
        return "archived-source"
    if relative_path.suffix.lower() not in IMAGE_EXTENSIONS:
        return "metadata"
    if path_text.startswith("game-page/waiting-room-panel/"):
        return "waiting-background"
    if path_text.startswith("game-page/patient-panel/"):
        if "background" in file_name:
            return "patient-panel-background"
        return "patient-panel-overlay"
    if path_text.startswith("game-page/triage-rooms-panel/"):
        if file_name.startswith("door-"):
            return "room-door"
        if file_name == "background-wall-for-all-rooms.png":
            return "room-wall"
        return "room-interior"
    if path_text.startswith("lobby-page/"):
        if file_name.startswith("background-"):
            return "lobby-background"
        if "overlay" in file_name:
            return "lobby-overlay"
        if "blackboard" in file_name or "whiteboard" in file_name:
            return "lobby-board"
        if file_name.startswith("boombox"):
            return "lobby-control"
    return "unclassified"


def inspect_image(file_path: Path) -> dict[str, Any]:
    """Read image geometry and transparency without changing the file."""

    with Image.open(file_path) as image:
        width, height = image.size
        image_mode = image.mode
        image_format = image.format
        has_alpha_channel = "A" in image.getbands() or "transparency" in image.info
        contains_transparency = False

        if "A" in image.getbands():
            minimum_alpha, _ = image.getchannel("A").getextrema()
            contains_transparency = minimum_alpha < 255
        elif "transparency" in image.info:
            contains_transparency = True

    return {
        "format": image_format,
        "width": width,
        "height": height,
        "pixel_count": width * height,
        "mode": image_mode,
        "has_alpha_channel": has_alpha_channel,
        "contains_transparency": contains_transparency,
    }


def suggested_dimensions(
    native_width: int,
    native_height: int,
    suggested_raster_box: list[int] | None,
) -> list[int] | None:
    """Fit native dimensions inside a category box without enlarging them."""

    if suggested_raster_box is None:
        return None

    target_width, target_height = suggested_raster_box
    resize_scale = min(
        1.0,
        target_width / native_width,
        target_height / native_height,
    )
    return [
        max(1, round(native_width * resize_scale)),
        max(1, round(native_height * resize_scale)),
    ]


def recommend_action(asset: dict[str, Any]) -> str:
    """Recommend review work; never automatically approve a conversion."""

    category = asset["category"]
    if category == "archived-source":
        return "archive-only"
    if not asset["is_image"]:
        return "keep-as-development-metadata"
    if category == "unclassified":
        return "manual-classification-required"
    if asset["suggested_raster_box"] is None:
        return "display-box-decision-required"

    proposed_dimensions = asset["suggested_dimensions"]
    if proposed_dimensions:
        native_pixel_count = asset["width"] * asset["height"]
        proposed_pixel_count = proposed_dimensions[0] * proposed_dimensions[1]
        if proposed_pixel_count and native_pixel_count / proposed_pixel_count >= 1.5:
            return "resize-and-compression-trial"

    if asset["bytes"] >= 500 * 1024:
        return "compression-trial-keep-dimensions"
    return "keep-size-review-normal-compression"


def recommend_format_trial(asset: dict[str, Any]) -> str:
    """Describe a safe format comparison without selecting a winner."""

    if not asset["is_image"]:
        return "not-applicable"
    if asset["category"] == "archived-source":
        return "none-archive-only"
    if asset["contains_transparency"]:
        if asset["category"] in {"room-door", "lobby-board", "patient-panel-overlay"}:
            return "optimized-PNG-vs-lossless-WebP"
        return "optimized-PNG-vs-WebP-alpha"
    if asset["category"] in {"lobby-overlay", "lobby-board"}:
        return "optimized-PNG-vs-lossless-WebP"
    return "quality-controlled-WebP-vs-optimized-PNG"


def inspect_file(
    file_path: Path,
    relative_path: Path,
    source_set: str,
    category: str,
) -> dict[str, Any]:
    """Create one serializable inventory record."""

    file_size = file_path.stat().st_size
    category_rule = CATEGORY_RULES.get(category, {})
    record: dict[str, Any] = {
        "source_set": source_set,
        "relative_path": relative_path.as_posix(),
        "file_name": file_path.name,
        "extension": file_path.suffix.lower(),
        "bytes": file_size,
        "size_label": format_bytes(file_size),
        "sha256": sha256_for_file(file_path),
        "category": category,
        "runtime_candidate": category not in {"archived-source", "metadata"},
        "is_image": file_path.suffix.lower() in IMAGE_EXTENSIONS,
        "max_css_box": category_rule.get("max_css_box"),
        "suggested_raster_box": category_rule.get("suggested_raster_box"),
        "mobile_usage": category_rule.get("mobile_usage", "not yet classified"),
    }

    if record["is_image"]:
        record.update(inspect_image(file_path))
        record["suggested_dimensions"] = suggested_dimensions(
            record["width"],
            record["height"],
            record["suggested_raster_box"],
        )
    else:
        record.update(
            {
                "format": None,
                "width": None,
                "height": None,
                "pixel_count": None,
                "mode": None,
                "has_alpha_channel": None,
                "contains_transparency": None,
                "suggested_dimensions": None,
            }
        )

    record["recommended_action"] = recommend_action(record)
    record["recommended_format_trial"] = recommend_format_trial(record)
    return record


def collect_inventory() -> list[dict[str, Any]]:
    """Inventory production UI assets and canonical patient portraits."""

    inventory: list[dict[str, Any]] = []

    for file_path in sorted(PRODUCTION_ASSETS_FOLDER.rglob("*")):
        if not file_path.is_file() or AUDIT_FOLDER in file_path.parents:
            continue
        relative_path = file_path.relative_to(PRODUCTION_ASSETS_FOLDER)
        category = classify_production_asset(relative_path)
        inventory.append(
            inspect_file(file_path, relative_path, "production-ui", category)
        )

    if PATIENT_PORTRAITS_FOLDER.exists():
        for file_path in sorted(PATIENT_PORTRAITS_FOLDER.rglob("*")):
            if not file_path.is_file() or file_path.suffix.lower() not in IMAGE_EXTENSIONS:
                continue
            relative_path = file_path.relative_to(PATIENT_PORTRAITS_FOLDER)
            inventory.append(
                inspect_file(
                    file_path,
                    relative_path,
                    "canonical-patient-portraits",
                    "patient-portrait",
                )
            )

    return inventory


def summarize_records(records: list[dict[str, Any]]) -> dict[str, Any]:
    """Summarize a set of inventory records."""

    return {
        "file_count": len(records),
        "image_count": sum(record["is_image"] for record in records),
        "bytes": sum(record["bytes"] for record in records),
        "size_label": format_bytes(sum(record["bytes"] for record in records)),
    }


def markdown_table(headers: list[str], rows: list[list[Any]]) -> str:
    """Build a simple Markdown table."""

    header_row = "| " + " | ".join(headers) + " |"
    divider_row = "|" + "|".join("---" for _ in headers) + "|"
    data_rows = ["| " + " | ".join(str(value) for value in row) + " |" for row in rows]
    return "\n".join([header_row, divider_row, *data_rows])


def build_report(inventory: list[dict[str, Any]], generated_at: str) -> str:
    """Create a human-readable audit report from the full inventory."""

    production_records = [
        record for record in inventory if record["source_set"] == "production-ui"
    ]
    runtime_ui_records = [
        record for record in production_records if record["runtime_candidate"]
    ]
    archived_records = [
        record for record in production_records if record["category"] == "archived-source"
    ]
    patient_records = [
        record
        for record in inventory
        if record["source_set"] == "canonical-patient-portraits"
    ]

    category_groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in inventory:
        category_groups[record["category"]].append(record)

    source_rows = []
    for label, records in [
        ("Production UI files, including archive/metadata", production_records),
        ("Runtime-candidate production UI files", runtime_ui_records),
        ("Archived lobby source files", archived_records),
        ("Canonical patient portraits", patient_records),
    ]:
        summary = summarize_records(records)
        source_rows.append(
            [label, summary["file_count"], summary["image_count"], summary["size_label"]]
        )

    category_rows = []
    for category, records in sorted(category_groups.items()):
        image_records = [record for record in records if record["is_image"]]
        native_widths = [record["width"] for record in image_records]
        native_heights = [record["height"] for record in image_records]
        native_range = "n/a"
        if image_records:
            native_range = (
                f"{min(native_widths)}–{max(native_widths)} × "
                f"{min(native_heights)}–{max(native_heights)}"
            )
        rule = CATEGORY_RULES.get(category, {})
        suggested_box = rule.get("suggested_raster_box")
        suggested_label = "TBD" if suggested_box is None else f"{suggested_box[0]} × {suggested_box[1]}"
        action_counts = Counter(record["recommended_action"] for record in records)
        action_label = ", ".join(
            f"{action}: {count}" for action, count in sorted(action_counts.items())
        )
        category_rows.append(
            [
                category,
                len(records),
                format_bytes(sum(record["bytes"] for record in records)),
                native_range,
                suggested_label,
                action_label,
            ]
        )

    largest_runtime_records = sorted(
        [*runtime_ui_records, *patient_records],
        key=lambda record: record["bytes"],
        reverse=True,
    )[:20]
    largest_rows = [
        [
            record["source_set"],
            record["relative_path"],
            record["category"],
            record["size_label"],
            f"{record['width']} × {record['height']}",
            record["recommended_action"],
        ]
        for record in largest_runtime_records
    ]

    resize_candidate_records = [
        record
        for record in inventory
        if record["recommended_action"] == "resize-and-compression-trial"
    ]
    compression_candidate_records = [
        record
        for record in inventory
        if record["recommended_action"] == "compression-trial-keep-dimensions"
    ]

    duplicate_groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in inventory:
        if not record["is_image"] or record["bytes"] == 0:
            continue
        duplicate_groups[record["sha256"]].append(record)
    exact_duplicate_groups = [
        records for records in duplicate_groups.values() if len(records) > 1
    ]

    image_records = [record for record in inventory if record["is_image"]]
    transparent_image_records = [
        record for record in image_records if record["contains_transparency"]
    ]
    opaque_image_records = [
        record for record in image_records if not record["contains_transparency"]
    ]

    report_lines = [
        "# triageRush Production Asset Audit",
        "",
        f"**Generated:** {generated_at}",
        "",
        "**Status:** Audit only. No source or runtime asset was resized, recompressed, renamed, moved, or deleted.",
        "",
        "## Scope and authority",
        "",
        "- UI artwork was read only from `triageRush/assets/`.",
        "- Files inside `_asset-audit-and-resize/` were excluded from the scan.",
        "- `lobby-page/archived/` was measured separately and is not a runtime candidate.",
        "- Patient portraits were read from canonical `patient-data/patient-images/`.",
        "- Documents `7` and `9` plus the audit display model supplied preliminary geometry; final production CSS replaces those estimates before optimization.",
        "",
        "## Approved sequencing decision",
        "",
        "1. Build and visually approve the complete game with the current high-resolution production assets.",
        "2. Keep all layout dependent on CSS containers; runtime code must not use an image's natural pixel dimensions to determine geometry or game behavior.",
        "3. Rerun this audit after final CSS is approved at iPhone 16 Pro Max 3x, Full HD, and normal 4K desktop sizes.",
        "4. Export and visually compare representative trials before resizing a category in bulk.",
        "5. Preserve high-resolution masters outside the runtime manifest and preferably outside the deployed web root.",
        "6. Replace approved runtime images at the same logical paths and filenames where practical; format changes require only centralized manifest updates.",
        "7. Refresh production cache versions and rerun loading, transparency, visual, and manifest tests.",
        "",
        "Asset optimization is a post-implementation release phase. The proposed boxes below remain planning evidence and do not block game development.",
        "",
        "## Display-planning assumptions",
        "",
        "- One responsive 9:16 shell is used on all devices.",
        "- The Full HD desktop case is 1920 × 1080 CSS pixels, producing an approximately 547 × 972 shell.",
        "- A normal 3840 × 2160 4K desktop at 100% scaling produces an approximately 1094 × 1944 shell because the game uses 90% of viewport height.",
        "- The large-phone reference is 430 × 932 CSS pixels, producing an approximately 422 × 750 shell.",
        "- The iPhone 16 Pro Max reference is 440 × 956 logical pixels at 3x; after the current horizontal margin, its game shell is approximately 432 × 768 logical or 1296 × 2304 physical pixels.",
        "- That iPhone shell remains more demanding than 4K desktop for many assets, while 4K establishes the larger CSS layout boxes.",
        "- Most ordinary artwork targets approximately 2x quality; small lettering and prominent portraits receive more headroom.",
        "- Suggested raster boxes are ceilings for trial exports, not automatic resize commands.",
        "- The original aspect ratio must always be preserved.",
        "",
        "## Current footprint",
        "",
        markdown_table(["Source set", "Files", "Images", "Current size"], source_rows),
        "",
        "The browser does not download all of these files merely because they exist. Delivery cost depends on the runtime manifest and loading strategy. Nevertheless, runtime images this large would be expensive if eagerly loaded.",
        "",
        "## Category findings",
        "",
        markdown_table(
            [
                "Category",
                "Files",
                "Current size",
                "Native dimension range",
                "Trial raster box",
                "Audit recommendation",
            ],
            category_rows,
        ),
        "",
        f"- **{len(resize_candidate_records)}** files are large enough relative to their proposed display box to justify a resize/compression trial.",
        f"- **{len(compression_candidate_records)}** files appear dimensionally reasonable but still justify a compression-only trial.",
        f"- **{len(transparent_image_records)}** images contain transparency and must retain alpha-capable output.",
        f"- **{len(opaque_image_records)}** images are opaque and may use quality-controlled WebP trials without an alpha requirement.",
        f"- **{len(exact_duplicate_groups)}** meaningful exact duplicate image groups were found across the audited source sets.",
        "",
        "## Largest runtime candidates",
        "",
        markdown_table(
            ["Source", "Path", "Category", "Size", "Dimensions", "Recommendation"],
            largest_rows,
        ),
        "",
        "## Format-trial guidance",
        "",
        "- Preserve every original PNG as the high-resolution source during trials.",
        "- Transparent doors, boards, and UI overlays: compare optimized PNG with lossless WebP first so lettering and edges remain exact.",
        "- Transparent patient portraits: compare optimized PNG with WebP alpha at several quality levels inside the real queue, patient panel, and Coach views.",
        "- Opaque painted backgrounds and room interiors: compare optimized PNG with quality-controlled WebP. JPEG is optional but adds no advantage if WebP wins consistently.",
        "- Do not choose one universal format merely to simplify the manifest; choose a small category rule only after measured visual comparisons.",
        "",
        "## Recommended optimization order",
        "",
        "1. **Room doors:** trial approximately 256 × 400 bounding boxes. Their current native resolution is far above the seven-row display box; preserve lettering and transparency during visual QA.",
        "2. **Waiting-room backgrounds:** trial approximately 320 × 448. Test both five-row Triage and ten-row RUSH layouts.",
        "3. **Room interiors:** trial approximately 320 × 448 bounding boxes after confirming the final open-door layering.",
        "4. **Patient-panel artwork:** trial category-specific dimensions, retaining more vertical detail for the full-height panel background.",
        "5. **Patient portraits:** keep the current square dimensions initially, test quality-controlled WebP/PNG compression, and measure the total. Resize only if actual Coach/review rendering proves a smaller ceiling safe.",
        "6. **HOME background, boards, and Start Shift overlay:** avoid downsizing. They are prominent, contain lettering, and are displayed near or above their current native dimensions on a normal 4K screen and a 3x phone; test compression first and never upscale an existing source merely to meet a planning box.",
        "7. **Shared room-wall texture:** defer resizing until the square source's tall-panel and room-row background behavior is resolved.",
        "8. **Boombox:** defer resizing until its final CSS display box is approved.",
        "",
        "## Proposed delivery flow",
        "",
        "1. Load the shell and HOME-critical assets first.",
        "2. Load/validate patient data while the player views HOME.",
        "3. On Start Shift, show `PATIENTS ARE ARRIVING` while decoding the initial queue portraits and a measured reserve.",
        "4. Start the timer only after required assets are ready.",
        "5. Maintain a rolling portrait preload buffer during the shift instead of automatically downloading all 160 portraits.",
        "6. Use the no-cache server only for development. Production should use normal caching and versioned asset URLs.",
        "",
        "## Approval gates before resizing",
        "",
        "- John approves each category's maximum rendered box and quality target.",
        "- One representative asset per category is exported and compared in the actual shell at phone DPR 3, Full HD desktop, and normal 4K desktop at 100% scaling.",
        "- Transparency, fine lettering, and non-transparent edge colors are checked.",
        "- The original high-resolution file is retained outside the runtime manifest.",
        "- Only approved optimized copies are placed in the eventual runtime asset tree.",
        "- Initial-load bytes, Start Shift preparation bytes, and rolling-buffer bytes are measured separately.",
        "",
        "## Generated data",
        "",
        "The complete per-file dimensions, hashes, transparency flags, proposed fitted dimensions, and recommendations are in `asset-inventory.json`. Rerun this report with:",
        "",
        "```text",
        "python audit_assets.py",
        "```",
        "",
    ]
    return "\n".join(report_lines)


def main() -> None:
    generated_at = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")
    inventory = collect_inventory()

    inventory_document = {
        "audit_version": 1,
        "generated_at": generated_at,
        "production_assets_folder": str(PRODUCTION_ASSETS_FOLDER),
        "canonical_patient_portraits_folder": str(PATIENT_PORTRAITS_FOLDER),
        "geometry_reference": "docs/7, docs/9, and the preliminary display model; rerun against final production CSS",
        "display_model": DISPLAY_MODEL,
        "category_rules": CATEGORY_RULES,
        "summary_by_source_set": {
            source_set: summarize_records(
                [record for record in inventory if record["source_set"] == source_set]
            )
            for source_set in sorted({record["source_set"] for record in inventory})
        },
        "recommendation_counts": dict(
            sorted(Counter(record["recommended_action"] for record in inventory).items())
        ),
        "assets": inventory,
    }

    INVENTORY_OUTPUT.write_text(
        json.dumps(inventory_document, indent=2) + "\n",
        encoding="utf-8",
    )
    REPORT_OUTPUT.write_text(
        build_report(inventory, generated_at),
        encoding="utf-8",
    )

    production_summary = inventory_document["summary_by_source_set"].get(
        "production-ui", {}
    )
    patient_summary = inventory_document["summary_by_source_set"].get(
        "canonical-patient-portraits", {}
    )
    print(f"Wrote {INVENTORY_OUTPUT}")
    print(f"Wrote {REPORT_OUTPUT}")
    print(
        "Production UI: "
        f"{production_summary.get('file_count', 0)} files, "
        f"{production_summary.get('size_label', '0 B')}"
    )
    print(
        "Patient portraits: "
        f"{patient_summary.get('file_count', 0)} files, "
        f"{patient_summary.get('size_label', '0 B')}"
    )


if __name__ == "__main__":
    main()
