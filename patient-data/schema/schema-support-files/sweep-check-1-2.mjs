// Sweep checks #1 (structural gaps) and #2 (writing contracts) for schema 2.2
// patient records. Read-only: reports findings, changes nothing.
//
// Usage: node sweep-check-1-2.mjs <patient-data-folder>
//   (the folder that contains patient-json/ and patient-images/)

import fs from "node:fs";
import path from "node:path";

const baseDirectory = path.resolve(process.argv[2] ?? ".");
const jsonDirectory = path.join(baseDirectory, "patient-json");
const imageDirectory = path.join(baseDirectory, "patient-images");

const findings = [];        // { file, check, message }
const presentationTextLimits = { quote: 225, triageNote: 325 };
const vocab = {             // observed values, reported for review (not hard failures)
  sex: new Map(),
  race: new Map(),
  vitalColors: new Map(),
};

function report(file, check, message) {
  findings.push({ file, check, message });
}
function tally(map, value) {
  const key = JSON.stringify(value);
  map.set(key, (map.get(key) ?? 0) + 1);
}

// ---------- image pairing ----------
const jsonFiles = fs.readdirSync(jsonDirectory).filter((f) => /^patient-\d{3}\.json$/.test(f)).sort();
const imageFiles = fs.readdirSync(imageDirectory).filter((f) => /\.png$/i.test(f)).sort();
const jsonStems = new Set(jsonFiles.map((f) => f.replace(".json", "")));
const imageStems = new Set(imageFiles.map((f) => f.replace(/\.png$/i, "")));

for (const stem of jsonStems) {
  if (!imageStems.has(stem)) report(stem + ".json", "image-pairing", "no matching PNG in patient-images");
}
for (const stem of imageStems) {
  if (!jsonStems.has(stem)) report(stem + ".png", "image-pairing", "PNG has no matching JSON record");
}

// ---------- helpers ----------
const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

// Prose: must end with terminal punctuation and begin with a capital letter,
// digit, or quote character.
function checkProse(file, label, value) {
  if (!isNonEmptyString(value)) {
    report(file, "prose", `${label} is missing or empty`);
    return;
  }
  const trimmed = value.trim();
  if (!/[.!?]["')\]]?$/.test(trimmed)) {
    report(file, "prose", `${label} lacks terminal punctuation: "...${trimmed.slice(-40)}"`);
  }
  if (!/^["'(]?[A-Z0-9]/.test(trimmed)) {
    report(file, "prose", `${label} does not start with a capital/digit: "${trimmed.slice(0, 40)}..."`);
  }
}

// Phrase-list items: non-empty, concise, no terminal punctuation.
function checkPhraseList(file, label, value, { allowNull = false, requireNonEmptyArray = true } = {}) {
  if (value === null) {
    if (!allowNull) report(file, "list", `${label} is null but null is not permitted`);
    return;
  }
  if (!Array.isArray(value)) {
    report(file, "list", `${label} is not an array`);
    return;
  }
  if (requireNonEmptyArray && value.length === 0) {
    report(file, "list", `${label} is an empty array`);
  }
  value.forEach((item, i) => {
    if (!isNonEmptyString(item)) {
      report(file, "list", `${label}[${i}] is not a non-empty string`);
      return;
    }
    if (/[.!?]$/.test(item.trim())) {
      report(file, "list", `${label}[${i}] has terminal punctuation: "${item.trim().slice(-50)}"`);
    }
  });
}

// Mojibake / replacement-character scan over the raw file text.
const mojibakePatterns = [
  { re: /�/, name: "U+FFFD replacement character" },
  { re: /â€™|â€œ|â€|â€"|â€˜|Ã©|Ã¨|Ã¡|Ã­|Ã³|Ãº|Â°|Â»| Â/, name: "classic UTF-8-as-Latin-1 mojibake" },
];

// ---------- per-record checks ----------
for (const filename of jsonFiles) {
  const filePath = path.join(jsonDirectory, filename);
  const raw = fs.readFileSync(filePath, "utf8");

  for (const { re, name } of mojibakePatterns) {
    if (re.test(raw)) report(filename, "encoding", `raw text contains ${name}`);
  }

  let record;
  try {
    record = JSON.parse(raw);
  } catch (e) {
    report(filename, "json", `does not parse: ${e.message}`);
    continue;
  }

  const stem = filename.replace(".json", "");

  // --- top-level shape ---
  const allowedTop = new Set(["schema", "id", "number", "johnsComments", "patient", "aiImageGeneration"]);
  for (const key of Object.keys(record)) {
    if (!allowedTop.has(key)) report(filename, "structure", `unexpected top-level field "${key}"`);
  }
  if (typeof record.johnsComments !== "string") {
    report(filename, "structure", "johnsComments is not a string");
  }

  const patient = record.patient ?? {};
  const allowedPatient = new Set(["_comment", "presentation", "answer", "clinical"]);
  for (const key of Object.keys(patient)) {
    if (!allowedPatient.has(key)) report(filename, "structure", `unexpected/legacy patient field "${key}"`);
  }

  // --- presentation ---
  const p = patient.presentation ?? {};
  const allowedPresentation = new Set(["_comment", "personal", "image", "chiefComplaint", "quote", "triageNote", "vitals"]);
  for (const key of Object.keys(p)) {
    if (!allowedPresentation.has(key)) report(filename, "structure", `unexpected presentation field "${key}"`);
  }
  for (const key of ["personal", "image", "chiefComplaint", "quote", "triageNote", "vitals"]) {
    if (!(key in p)) report(filename, "structure", `presentation.${key} is missing`);
  }
  for (const [field, maximum] of Object.entries(presentationTextLimits)) {
    if (typeof p[field] === "string") {
      const length = Array.from(p[field]).length;
      if (length > maximum) {
        report(filename, "length", `presentation.${field} is ${length} characters; maximum is ${maximum}`);
      }
    }
  }
  if (!isNonEmptyString(p.chiefComplaint)) report(filename, "structure", "presentation.chiefComplaint is missing or empty");

  const personal = p.personal ?? {};
  if (!isNonEmptyString(personal.name)) report(filename, "structure", "personal.name is missing or empty");
  if (typeof personal.age !== "number" || personal.age < 0) report(filename, "structure", `personal.age invalid: ${JSON.stringify(personal.age)}`);
  tally(vocab.sex, personal.sex);
  tally(vocab.race, personal.race);

  const image = p.image ?? {};
  if (image.imageFilename !== stem + ".png") {
    report(filename, "image-pairing", `image.imageFilename "${image.imageFilename}" != "${stem}.png"`);
  }
  if (typeof image.imageFlipped !== "boolean") report(filename, "structure", "image.imageFlipped is not a boolean");
  if (typeof image.imageScale !== "number" || image.imageScale <= 0) {
    report(filename, "structure", `image.imageScale invalid: ${JSON.stringify(image.imageScale)}`);
  }

  // --- vitals ---
  const vitals = p.vitals ?? {};
  const requiredVitals = ["hr", "bp", "rr", "spo2", "temp", "pain"];
  for (const key of Object.keys(vitals)) {
    if (!requiredVitals.includes(key)) report(filename, "vitals", `unexpected vitals field "${key}"`);
  }
  for (const key of requiredVitals) {
    const entry = vitals[key];
    if (!entry || typeof entry !== "object") {
      report(filename, "vitals", `vitals.${key} is missing`);
      continue;
    }
    for (const sub of Object.keys(entry)) {
      if (sub !== "value" && sub !== "color") report(filename, "vitals", `vitals.${key} has unexpected field "${sub}"`);
    }
    tally(vocab.vitalColors, entry.color);
    if (key === "bp") {
      if (typeof entry.value !== "string" || !/^\d{2,3}\/\d{2,3}$/.test(entry.value)) {
        report(filename, "vitals", `vitals.bp.value not "NNN/NN" string: ${JSON.stringify(entry.value)}`);
      }
    } else if (typeof entry.value !== "number") {
      report(filename, "vitals", `vitals.${key}.value is not a number: ${JSON.stringify(entry.value)}`);
    }
  }

  // --- answer ---
  const answer = patient.answer ?? {};
  const allowedAnswer = new Set(["_comment", "correctEsi", "correctRoom", "otherAcceptableRooms", "destinationReason"]);
  for (const key of Object.keys(answer)) {
    if (!allowedAnswer.has(key)) report(filename, "structure", `unexpected answer field "${key}"`);
  }
  if (answer.otherAcceptableRooms !== null) {
    report(filename, "structure", `answer.otherAcceptableRooms must be null, got ${JSON.stringify(answer.otherAcceptableRooms)}`);
  }
  checkProse(filename, "answer.destinationReason", answer.destinationReason);

  // --- clinical ---
  const clinical = patient.clinical ?? {};
  const allowedClinical = new Set(["_comment", "summary", "acuityReason", "expectedResources", "keyFindings", "redFlags", "teachingPoints", "possibleClinicalOutcome"]);
  for (const key of Object.keys(clinical)) {
    if (!allowedClinical.has(key)) report(filename, "structure", `unexpected clinical field "${key}"`);
  }
  checkProse(filename, "clinical.summary", clinical.summary);
  checkProse(filename, "clinical.acuityReason", clinical.acuityReason);
  checkPhraseList(filename, "clinical.expectedResources", clinical.expectedResources, { requireNonEmptyArray: false });
  checkPhraseList(filename, "clinical.keyFindings", clinical.keyFindings);
  checkPhraseList(filename, "clinical.redFlags", clinical.redFlags, { allowNull: true });

  // teachingPoints: complete punctuated sentences
  if (!Array.isArray(clinical.teachingPoints) || clinical.teachingPoints.length === 0) {
    report(filename, "structure", "clinical.teachingPoints missing or empty");
  } else {
    clinical.teachingPoints.forEach((item, i) => checkProse(filename, `clinical.teachingPoints[${i}]`, item));
  }

  // possibleClinicalOutcome
  const pco = clinical.possibleClinicalOutcome ?? {};
  for (const key of Object.keys(pco)) {
    if (key !== "possibleDiagnoses" && key !== "disposition") {
      report(filename, "structure", `unexpected possibleClinicalOutcome field "${key}"`);
    }
  }
  checkProse(filename, "possibleClinicalOutcome.disposition", pco.disposition);
  const diagnoses = pco.possibleDiagnoses;
  checkPhraseList(filename, "possibleDiagnoses", diagnoses);
  if (Array.isArray(diagnoses)) {
    let seenMaybe = false;
    diagnoses.forEach((item, i) => {
      if (typeof item !== "string") return;
      const isExactMaybe = item.startsWith("(maybe) ");
      const looksLikeMaybe = /^\(?\s*maybe\b/i.test(item);
      if (looksLikeMaybe && !isExactMaybe) {
        report(filename, "maybe", `possibleDiagnoses[${i}] malformed (maybe) prefix: "${item}"`);
      }
      if (isExactMaybe) seenMaybe = true;
      else if (seenMaybe) report(filename, "maybe", `possibleDiagnoses[${i}] non-(maybe) entry appears after a (maybe) entry: "${item}"`);
    });
  }

  // --- aiImageGeneration ---
  const ai = record.aiImageGeneration ?? {};
  if (ai.outputFile !== image.imageFilename) {
    report(filename, "image-pairing", `aiImageGeneration.outputFile "${ai.outputFile}" != imageFilename "${image.imageFilename}"`);
  }
  for (const key of ["who", "pose", "expression", "lookSeverity", "anchor_image", "size", "outputFolder", "outputFile", "prompt"]) {
    if (!isNonEmptyString(ai[key])) report(filename, "structure", `aiImageGeneration.${key} is missing or empty`);
  }
  if (!Array.isArray(ai.signs)) report(filename, "structure", "aiImageGeneration.signs is not an array");
}

// ---------- output ----------
console.log(`Swept ${jsonFiles.length} JSON records and ${imageFiles.length} images.\n`);

if (findings.length === 0) {
  console.log("No findings. All #1 structural and #2 writing-contract checks passed.");
} else {
  console.log(`${findings.length} finding(s):\n`);
  for (const f of findings) {
    console.log(`  ${f.file}  [${f.check}]  ${f.message}`);
  }
}

console.log("\nObserved vocabularies (for review, not failures):");
for (const [name, map] of Object.entries(vocab)) {
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} x${n}`);
  console.log(`  ${name}: ${entries.join(", ")}`);
}
