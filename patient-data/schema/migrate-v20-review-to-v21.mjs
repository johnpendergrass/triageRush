import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const targetDirectory = process.argv[2];

if (!targetDirectory) {
  throw new Error("Usage: node migrate-v20-review-to-v21.mjs <review-json-directory>");
}

const patientIds = Array.from(
  { length: 10 },
  (_, index) => `patient-${String(index + 1).padStart(3, "0")}`
);

function migrate(record) {
  if (record.schema?.version !== "2.0") {
    throw new Error(`${record.id || "Unknown patient"} is not a version 2.0 review record.`);
  }

  const sourcePatient = record.patient;
  const sourceReasoning = sourcePatient.triageReasoning;
  const sourceAnswer = record.answer;

  return {
    schema: {
      version: "2.1",
      date: "2026-07-31"
    },
    id: record.id,
    number: record.number,
    johnsComments: record.johnsComments,
    patient: {
      _comment: "'patient' contains the three sections that may be exposed in the detailed patient display: presentation, answer, and clinical.",
      presentation: {
        _comment: "Information available to the player before assigning a room. This is the only detailed-patient section exposed before the first assignment.",
        personal: sourcePatient.personal,
        image: sourcePatient.image,
        chiefComplaint: sourcePatient.clinical.chiefComplaint,
        quote: sourcePatient.clinical.quoteLong,
        triageNote: sourcePatient.clinical.presentationLong,
        vitals: sourcePatient.vitals
      },
      answer: {
        _comment: "The authoritative game answer. The player's assigned room is session state and is not stored in the patient record.",
        correctEsi: sourceReasoning.correctEsi,
        correctRoom: sourceAnswer.correctRoom,
        otherAcceptableRooms: sourceAnswer.otherAcceptableRooms
      },
      clinical: {
        _comment: "Display-ready educational explanation of why the correct ESI applies, using only evidence in patient.presentation. Used by Coach and Patient Review after the answer is available; does not participate in scoring.",
        summary: sourceReasoning.summary,
        acuityReason: sourceReasoning.acuityReason,
        expectedResources: sourceReasoning.expectedResources,
        destinationReason: sourceReasoning.destinationReason,
        keyFindings: sourceReasoning.keyFindings,
        redFlags: sourceReasoning.redFlags,
        teachingPoints: sourceReasoning.teachingPoints,
        possibleClinicalOutcome: sourceReasoning.possibleClinicalOutcome
      }
    },
    aiImageGeneration: record.aiImageGeneration
  };
}

for (const patientId of patientIds) {
  const filename = path.join(targetDirectory, `${patientId}.json`);
  const source = JSON.parse(await readFile(filename, "utf8"));
  const migrated = migrate(source);
  await writeFile(filename, `${JSON.stringify(migrated, null, 2)}\n`, "utf8");
}

console.log(`Migrated ${patientIds.length} review records to schema 2.1.`);
