// Audits (and optionally fixes) stored vital-sign colors against the fixed
// color bands defined in vitals-bands.json / vitals-bands.md.
//
// Usage: node audit-vitals-bands.mjs <patient-json-directory> [--fix]
//
//   report mode (default): lists every stored color that disagrees with the
//     banded color; changes nothing.
//   --fix: rewrites the disagreeing color values in place. Only "color"
//     values ever change - never "value", never structure. Files are written
//     with 2-space indentation and a trailing newline, matching the existing
//     patient-json formatting.

import fs from "node:fs";
import path from "node:path";

const targetDirectory = process.argv[2];
if (!targetDirectory) {
  throw new Error("Usage: node audit-vitals-bands.mjs <patient-json-directory> [--fix]");
}
const applyFix = process.argv.includes("--fix");

const scriptDirectory = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const bandsPath = path.join(scriptDirectory, "vitals-bands.json");
const { bands } = JSON.parse(fs.readFileSync(bandsPath, "utf8"));

// Returns the banded color for a vital value at a given age.
// Lookup convention (see vitals-bands.md): match the band row by floor(age),
// then green range -> yellow ranges -> otherwise red.
function bandedColor(vital, age, value) {
  const flooredAge = Math.floor(age);
  const band = bands.find(
    (b) => b.vital === vital && flooredAge >= b.ageLow && flooredAge <= b.ageHigh
  );
  if (!band) throw new Error(`No ${vital} band covers age ${age}`);
  const [greenLow, greenHigh] = band.green;
  if (value >= greenLow && value <= greenHigh) return "green";
  if (band.yellow.some(([low, high]) => value >= low && value <= high)) return "yellow";
  return "red";
}

const directory = path.resolve(targetDirectory);
const files = fs.readdirSync(directory).filter((f) => /^patient-\d{3}\.json$/.test(f)).sort();
if (files.length === 0) throw new Error(`No patient JSON files found in ${directory}`);

const mismatches = [];
let changedFileCount = 0;

for (const filename of files) {
  const filePath = path.join(directory, filename);
  const record = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const presentation = record.patient.presentation;
  const age = presentation.personal.age;
  const vitals = presentation.vitals;
  let fileChanged = false;

  for (const vital of ["hr", "bp", "rr", "spo2", "temp", "pain"]) {
    const entry = vitals[vital];
    // bp is colored by systolic only (the number before the slash)
    const value = vital === "bp" ? Number(String(entry.value).split("/")[0]) : entry.value;
    const expected = bandedColor(vital, age, value);
    if (entry.color !== expected) {
      mismatches.push(
        `#${record.number} (${age}y, ESI ${record.patient.answer.correctEsi}) ` +
        `${vital}=${entry.value}: stored ${entry.color} -> banded ${expected}`
      );
      if (applyFix) {
        entry.color = expected;
        fileChanged = true;
      }
    }
  }

  if (fileChanged) {
    fs.writeFileSync(filePath, JSON.stringify(record, null, 2) + "\n");
    changedFileCount++;
  }
}

if (mismatches.length === 0) {
  console.log(`All ${files.length} records agree with vitals-bands.json. No changes needed.`);
} else {
  console.log(`${mismatches.length} color mismatch(es) in ${files.length} records:\n`);
  mismatches.forEach((m) => console.log("  " + m));
  if (applyFix) {
    console.log(`\nFixed: rewrote ${changedFileCount} file(s). Only color values changed.`);
  } else {
    console.log("\nReport only. Run again with --fix to apply these colors.");
  }
}
