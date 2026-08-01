# Schema 2.1 Review Log: Patients 001–010

**Review date:** 2026-07-31

**Status:** First review batch for discussion. These files do not replace the
version 1.2 production records in `patient-data/patient-json/`.

## Scope and method

Each record was reassessed from the original version 1.2 JSON and the matching
full-resolution patient image. The earlier files in `patientsNewSchema/` were
not used to make the new decisions; they were compared only after the new
records were complete.

The review included:

1. Clinical review under the evidence-based 2.0 rules, followed by conversion
   to the definitive 2.1 presentation / answer / clinical structure
2. Selection of one complete authoritative quote and one complete triage note
3. Removal of accidental final-diagnosis disclosure from player-visible text
4. Reassessment of acuity before resource counting
5. Review of anticipated clinical resources and possible disposition
6. Evidence tracing from image, quote, vitals, and presentation
7. Full-resolution image consistency review
8. Blinded comparison with the earlier draft-schema results

The primary triage reference was the Emergency Nurses Association's
*Emergency Severity Index Handbook, Fifth Edition*. Supporting workup checks
used current guidance from the American College of Radiology, American Heart
Association/American Stroke Association, AAAAI anaphylaxis practice
parameters, and Surviving Sepsis Campaign.

## Batch results

| Patient | Reviewed ESI | Earlier draft | Result and image audit |
|---|---:|---:|---|
| 001 | 4 | 4 | Agreement. Image clearly shows localized ankle swelling, painful expression, tennis context, and no obvious deformity. One imaging resource remains appropriate. |
| 002 | 2 | 2 | Agreement. Image supports the high-risk presentation with diaphoresis, pallor, distress, and a hand over the chest. The patient's word `heartburn` remains a symptom label, not a diagnosis. |
| 003 | 2 | 2 | Agreement. Image shows an upper-arm pressure dressing with blood staining and marked distress. ESI 2 remains defensible because of penetrating trauma, pain 8/10, and potential concealed limb injury, although this stable extremity case deserves clinician confirmation. |
| 004 | 3 | 3 | Agreement. Image shows guarded movement and lower-back pain after trauma. ESI 3 assumes both spine imaging and parenteral pain treatment; if the intended workflow predicts only imaging plus oral medication, ESI 4 would need reconsideration. |
| 005 | 2 | 2 | Agreement. Image supports diaphoresis, upper-abdominal guarding, fear, and stillness. Player-visible text now supports the high-risk assignment without announcing perforation or another final diagnosis. |
| 006 | 1 | 1 | Agreement. Image clearly shows extensive hives and throat-focused distress. Facial or lip swelling is less visually obvious, so the quote and presentation state it directly. Hypotension, hypoxemia, and wheeze support immediate epinephrine and ESI 1. |
| 007 | 2 | 2 | Agreement. The image subtly places the right arm lower, but facial droop and weakness may not read clearly at game scale. The text carries the time-critical focal findings. Consider a future artwork revision if stronger visible asymmetry is desired. |
| 008 | 2 | 2 | Agreement. Image shows an acutely unwell older adult with a concerned family member. The review no longer assumes a urinary source in the triage evidence; infection sources appear only as possible outcomes. |
| 009 | 3 | 3 | Agreement. Image and text support abdominal pain and guarding without instability. The ENA handbook itself uses a stable right-lower-quadrant-pain case as an ESI-3 multi-resource example. |
| 010 | **2** | **3** | **Changed.** The original quote disclosed a kidney “pebble,” so it was rewritten without the diagnosis. The image accurately shows severe left-sided pain and marked distress. The ENA fifth-edition handbook specifically states that severe flank pain receives ESI 2. `patient.answer.correctEsi` and `patient.answer.correctRoom` were both changed accordingly. |

## Cross-check against the earlier draft pass

- Nine of ten ESI assignments agreed.
- Patient 010 was the only acuity disagreement: earlier ESI 3, reviewed ESI 2.
- All ten earlier draft records had `quoteShort: null`. Complete authored text
  was created during review; schema 2.1 now stores only the selected `quote`
  and `triageNote` beneath `patient.presentation`.
- The broad clinical interpretation of patients 001–009 was stable across both
  passes.
- The image review strengthened or clarified the evidence lists, especially
  diaphoresis in 002 and 005, visible hives in 006, and the subtle neurologic
  artwork in 007.
- Possible-diagnosis lists were shortened where the earlier lists repeated the
  same concept under several names.
- Lower-risk possibilities retain the exact `(maybe)` prefix and appear after
  serious triage-driving possibilities.

## Diagnosis-disclosure audit

No reviewed `patient.presentation.chiefComplaint`, `quote`, or `triageNote`
announces a final diagnosis.

Allowed player-visible content includes:

- Known mechanisms such as inversion injury, motor-vehicle collision, and
  gunshot wound
- Patient labels such as heartburn or indigestion
- Symptoms and signs such as radiation, guarding, diaphoresis, hives,
  dysarthria, and altered mental status
- Known history or exposure such as daily NSAID use or recent shellfish

Possible diagnoses appear only in
`patient.clinical.possibleClinicalOutcome.possibleDiagnoses`, after the ESI
explanation and application-owned disclaimer.

## Issues to settle before scaling to patients 011–160

1. Obtain clinician confirmation of patient 003's ESI-2 assignment for a
   stable upper-arm gunshot wound with intact distal neurovascular findings.
2. Confirm that patient 004 is intended to receive a second countable resource
   such as parenteral analgesia; otherwise reconsider ESI 4.
3. Decide whether patient 007's subtle image findings are adequate at game
   scale or whether the image should more clearly show right facial and arm
   weakness.
4. Continue distinguishing a known mechanism or patient-reported label from an
   accidentally disclosed final diagnosis.
5. Apply Decision Points A and B before resource counting. Patient 010 shows
   why this order matters: severe systemic pain makes the case ESI 2 even
   though the workup also requires multiple resources.

## Reference links

- ENA, *Emergency Severity Index Handbook, Fifth Edition*:
  https://emscimprovement.center/documents/2177/Emergency_Severity_Index_Handbook.pdf
- ENA triage portfolio and current ESI resources:
  https://www.ena.org/education/emergency-nursing-triage-education-program/triage-portfolio
- ACR Appropriateness Criteria:
  https://www.acr.org/Clinical-Resources/Clinical-Tools-and-Reference/Appropriateness-Criteria
- AHA/ASA acute ischemic stroke guidance:
  https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke/top-things-to-know
- AAAAI anaphylaxis practice parameter:
  https://www.aaaai.org/Aaaai/media/Media-Library-PDFs/Allergist%20Resources/Statements%20and%20Practice%20Parameters/Anaphylaxis-Practice-Paramaters-2023.pdf
- Surviving Sepsis Campaign adult guidelines:
  https://www.sccm.org/survivingsepsiscampaign/guidelines-and-resources/surviving-sepsis-campaign-adult-guidelines
