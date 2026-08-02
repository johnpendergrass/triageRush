import fs from "node:fs";
import path from "node:path";

const targetDirectory = process.argv[2];
if (!targetDirectory) {
  throw new Error("Usage: node validate-schema-v22.mjs <patient-json-directory> [--from=N] [--through=N]");
}
const fromArg = process.argv.find((value) => value.startsWith("--from="));
const throughArg = process.argv.find((value) => value.startsWith("--through="));
const fromNumber = fromArg ? Number(fromArg.slice("--from=".length)) : 1;
const throughNumber = throughArg ? Number(throughArg.slice("--through=".length)) : Number.POSITIVE_INFINITY;

const validRooms = new Set([
  "esi-1", "esi-2", "esi-3", "esi-4", "esi-5", "psych", "discharge"
]);
const requiredClinicalFields = [
  "summary", "acuityReason", "expectedResources", "keyFindings", "redFlags",
  "teachingPoints", "possibleClinicalOutcome"
];
const presentationTextLimits = { quote: 225, triageNote: 325 };
const forbiddenClinicalPatterns = [
  /\bESI\b/i,
  /\besi-[1-5]\b/i,
  /\bResus\b/i,
  /\bEmergent\b/i,
  /\bFast Track\b/i,
  /\bPsych room\b/i,
  /\bDischarge room\b/i
];

function collectDisplayStrings(value, trail = [], output = []) {
  if (typeof value === "string") output.push({ trail, value });
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectDisplayStrings(entry, [...trail, index], output));
  } else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, entry]) => {
      if (key !== "_comment") collectDisplayStrings(entry, [...trail, key], output);
    });
  }
  return output;
}

const directory = path.resolve(targetDirectory);
const files = fs.readdirSync(directory).filter((filename) => {
  if (!/^patient-\d{3}\.json$/.test(filename)) return false;
  const number = Number(filename.slice(8, 11));
  return number >= fromNumber && number <= throughNumber;
});
if (files.length === 0) throw new Error(`No patient JSON files found in ${directory}`);

const errors = [];
const seenIds = new Set();
const seenNumbers = new Set();

for (const filename of files) {
  const record = JSON.parse(fs.readFileSync(path.join(directory, filename), "utf8"));
  const expectedId = filename.replace(".json", "");
  const expectedNumber = Number(expectedId.slice(-3));
  const { presentation, answer, clinical } = record.patient || {};

  if (record.schema?.version !== "2.2" || record.schema?.date !== "2026-08-01") {
    errors.push(`${filename}: schema must be version 2.2 dated 2026-08-01`);
  }
  if (record.id !== expectedId || record.number !== expectedNumber) {
    errors.push(`${filename}: filename, id, and number disagree`);
  }
  if (seenIds.has(record.id) || seenNumbers.has(record.number)) {
    errors.push(`${filename}: duplicate patient identity`);
  }
  seenIds.add(record.id);
  seenNumbers.add(record.number);

  if (!presentation || !answer || !clinical) errors.push(`${filename}: missing patient section`);
  if (typeof presentation?.quote !== "string" || !presentation.quote.trim() ||
      typeof presentation?.triageNote !== "string" || !presentation.triageNote.trim()) {
    errors.push(`${filename}: Presentation requires non-empty quote and triageNote`);
  }
  for (const [field, maximum] of Object.entries(presentationTextLimits)) {
    if (typeof presentation?.[field] === "string") {
      const length = Array.from(presentation[field]).length;
      if (length > maximum) {
        errors.push(`${filename}: presentation.${field} is ${length} characters; maximum is ${maximum}`);
      }
    }
  }
  if (!Number.isInteger(answer?.correctEsi) || answer.correctEsi < 1 || answer.correctEsi > 5) {
    errors.push(`${filename}: invalid answer.correctEsi`);
  }
  if (!validRooms.has(answer?.correctRoom)) errors.push(`${filename}: invalid answer.correctRoom`);
  if (answer?.correctRoom?.startsWith("esi-") && Number(answer.correctRoom.slice(-1)) !== answer.correctEsi) {
    errors.push(`${filename}: ordinary room and correct ESI disagree`);
  }
  if (typeof answer?.destinationReason !== "string" || !answer.destinationReason.trim()) {
    errors.push(`${filename}: answer.destinationReason is required`);
  }
  if (Object.hasOwn(clinical || {}, "destinationReason")) {
    errors.push(`${filename}: clinical.destinationReason is not permitted`);
  }
  for (const field of requiredClinicalFields) {
    if (!Object.hasOwn(clinical || {}, field)) errors.push(`${filename}: clinical.${field} is missing`);
  }
  for (const entry of collectDisplayStrings(clinical)) {
    const pattern = forbiddenClinicalPatterns.find((candidate) => candidate.test(entry.value));
    if (pattern) errors.push(`${filename}: clinical.${entry.trail.join(".")} matches ${pattern}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${files.length} schema 2.2 patient records in ${directory}.`);
  console.log("Structural and explicit-answer leakage checks passed; clinical-fidelity review remains manual.");
}
