# Claude Code Review of Patients 1–160

**Date:** 2026-08-01
**Reviewer:** Claude Code (Fable 5), working with John
**Scope:** Full validation and clinical-fidelity review of all 160 schema-2.2 patient
records and their images in `patient-data-for-claude-review/`
**Status at end of session:** All 160 records pass all three automated validators.
Every change listed in this document was applied to
`patient-data-for-claude-review/patient-json/` only. No images were modified.

This document is written for John and for any future AI helper picking up this
project. It is the single record of what was validated, what was changed and why,
what was deliberately left alone, and what remains to be decided.

---

## 1. What this review covered

The app is a triage trainer: the player sees only the Presentation section of a
patient (name, sex, race, age, image, vitals, quote, chief complaint, triageNote)
and must assign the correct ESI level / room. The player is never asked to
diagnose. The Clinical section may be revealed on request, but the correct ESI
must be justifiable from Presentation alone. That principle — the **core evidence
rule** — was the yardstick for the whole review.

The review ran in four passes:

1. **Structural** — schema conformance, image pairing, types, vocabularies,
   encoding (automated; script written this session).
2. **Writing contracts** — punctuation, capitalization, list conventions,
   `(maybe)` ordering (automated; same script).
3. **Internal consistency** — vitals plausibility and color logic, demographics
   agreement between text/image/data (script-assisted plus judgment).
4. **Clinical fidelity** — every record and every image read individually:
   is the ESI defensible from Presentation, do all four sections tell one story,
   does the image match the text, is the quote in the patient's voice.

---

## 2. Where things live and how to re-check them

```
patient-data-for-claude-review/
  patient-json/                patient-001.json … patient-160.json  (authoritative)
  patient-images/              patient-001.png  … patient-160.png   (do not modify)
  patient-index.json           deliberately empty for now
  schema/
    patient-schema-notes.md    the 2.2 spec (now includes the vitals color contract)
    patient-schema-template.json
    schema-support-files/
      validate-schema-v22.mjs  structural + answer-leakage checks
      sweep-check-1-2.mjs      structural gaps + writing contracts (written this session)
      vitals-bands.md          authoritative vitals color thresholds (written this session)
      vitals-bands.json        machine-readable mirror of the bands
      audit-vitals-bands.mjs   verifies/fixes stored colors against the bands
```

Run all three validators from `patient-data-for-claude-review/`:

```
node schema/schema-support-files/validate-schema-v22.mjs patient-json
node schema/schema-support-files/sweep-check-1-2.mjs .
node schema/schema-support-files/audit-vitals-bands.mjs patient-json          (report)
node schema/schema-support-files/audit-vitals-bands.mjs patient-json --fix    (apply)
```

As of the end of this session all three pass with zero findings.

**Important:** the sibling folder `patient-data/` was NOT updated this session.
It now diverges from the review copy (vitals colors, renames, text fixes). Treat
`patient-data-for-claude-review/` as the authoritative source until John syncs
or promotes it.

---

## 3. The vitals color system (major design decision this session)

The old data colored vitals inconsistently — the same value could be green in one
record and red in another, sometimes reflecting authored "clinical concern."
John adopted a **two-rule design**:

1. **Colors are fixed thresholds.** A color is a pure function of the value and
   the patient's age band, like a monitor alarm. Green = normal for this age,
   yellow = notice this, red = this number alone is alarming. Colors never
   encode per-patient context, so the player can always trust them.
2. **Context lives in the text.** When context changes what a number means
   (fever on chemo, bradycardia with chest pain), that context must appear in
   the quote or triageNote so the ESI stays fair from Presentation alone.

The full band table is in `schema/schema-support-files/vitals-bands.md`
(age bands: infant 0 / toddler 1–2 / preschool 3–5 / school 6–12 / teen 13–17 /
adult 18+; BP colored by systolic only; pain uses the universal 0–3 / 4–6 / 7–10;
temp red starts at 39.0 °C — all chosen by John). Applying the bands changed
**77 stored colors across 63 records** (colors only; no values, no structure).
`audit-vitals-bands.mjs --fix` performed the change and now enforces it.

One value was changed (not just its color): **#146** HR 138 → 148, approved by
John so the existing "marked tachycardia" wording stays true (138 was inside the
preschool green band).

---

## 4. Complete change log (every record modified this session)

Colors: 63 records had vital **colors** normalized to the bands (run
`audit-vitals-bands.mjs` to see the mapping logic; the change list is
reproducible by diffing against `patient-data/`). Beyond colors:

| Record | Change | Why |
|---|---|---|
| #7 | Quote prefixed `(slurring)` | triageNote says slurred speech; matches the #111/#122 convention |
| #8 | Quote prefixed `(Daughter)` | caregiver-spoken quote was untagged; image shows the daughter |
| #14 | triageNote + keyFindings now say "shins **and forearms**" | image clearly shows forearm rash; image is player evidence |
| #24 | triageNote's last sentence rewritten to an observation ("distal pulse is currently present, hand warm and pink") | old sentence was care-plan language, not a finding |
| #38 | `race` black → white | image unmistakably shows a white woman; images are off-limits, so data was corrected |
| #44 | summary "high fever" → "fever" | 38.9 °C is yellow under the new bands |
| #60 | Quote tag `(Mom)` → `(Dad)` | image shows a father |
| #73 | "cervical os is closed" removed from triageNote, summary, keyFindings | speculum finding beyond a triage quick-look (John's call); evidence rule requires removing it everywhere |
| #89 | Quote tag `(Dad)` → `(Mom)` | image shows a mother |
| #96 | "acceptable blood pressure" → "mildly elevated…" in all four places | BP 142 is yellow under the new bands |
| #116 | acuityReason "Borderline hypoxemia" → "Abnormal oxygenation" | SpO2 90 is red under the new bands; matches its redFlags wording |
| #129 | Garbled teachingPoint repaired ("…high-risk, time-critical presentation.") | leftover of an ESI-scrub that replaced "ESI-x" with "the assigned acuity" |
| #130 | Quote "right side" → "left side" | triageNote and image both say the left eye |
| #132 | Garbled teachingPoint repaired ("…a textbook single-procedure case.") | same scrub artifact |
| #142 | Name Victor → Carlos | the image's embroidered name patch legibly reads "Carlos" |
| #145 | Garbled teachingPoint repaired ("…a high-risk presentation.") | same scrub artifact |
| #146 | HR 138 → 148 (yellow); keyFindings updated to match | keeps "marked tachycardia" true under fixed color bands |
| #148 | Garbled teachingPoint repaired ("…no emergency resources at all.") | same scrub artifact |

**Renames (24) to thin out duplicate first names** (biggest clusters halved;
remaining duplicates are at most pairs, differentiated by age/ethnicity):
#35 Walter→Eugene, #50 Andre→Miguel, #55 Tyler→Dylan, #65 Frank→Roger,
#67 Rosa→Lucia, #72 Andre→Darius, #82 Gloria→Carmen, #83 Kevin→Jason,
#94 Priya→Anjali, #98 Marcus→Jerome, #99 Doug→Russ, #101 Walter→Albert,
#103 Rosa→Elena, #104 Chloe→Lauren, #105 Marcus→Malik, #108 Gary→Phil,
#115 Mateo→Emilio, #116 Frank→Vernon, #117 Priya→Sunita, #118 Kevin→Derek,
#123 Doug→Wade, #128 Gloria→Teresa, #137 Liam→Noah, #143 Sofia→Isabella.
(Plus #142 Victor→Carlos above.) All names were checked against the full roster
so no new collisions were created.

Schema docs: a "Vitals color contract" subsection was added to
`patient-schema-notes.md` under the 2.2 spec, pointing at the bands files.

---

## 5. Clinical-fidelity verdicts

**Bottom line: all 160 ESI/destination assignments are clinically defensible
from Presentation alone.** No record relies on hidden information; no Clinical
section leaks the answer. Quote voices consistently match age and mood, and the
"volunteered history" device (the warfarin, the insulin that ran out, the pill +
long flight) is used exactly as John intends — as a fair hint, occasionally as a
red herring (#114's gorilla-trek tourist with a cold).

Highlights by block:

- **1–25 (mixed intro set):** classic can't-miss patterns (#2 "heartburn" ACS,
  #7 stroke, #17 torsion behind an embarrassed teen, #24 supracondylar elbow
  with paresthesias) against clean minor cases. #1 vs #53 quietly teaches the
  weight-bearing/imaging distinction.
- **26–50 (high-acuity heavy):** ruptured AAA (#32), glucose 38 (#33),
  dissection with unequal arm pressures (#37), cauda equina (#42), button
  battery (#27), thunderclap headache (#41) — all textbook-clean. #30
  (anticoagulated head bump, ESI 2) is a superb under-triage trap.
- **51–100 (teaching pairs):** AF at 142 = ESI 2 vs SVT at 190 = ESI 1
  (#69/#70); the intoxication ladder #74/#99/#30 (ESI 4/3/2); the
  behavioral-health gradient #15/#97/#98; flank-pain-as-ESI-2 policy applied
  consistently (#10/#88).
- **101–160 (curricular arcs):** the COVID quartet #101–104 (one disease, four
  acuities — #102's silent hypoxemia is the best case in the library); oncology
  emergencies #150–155 with the remission counter-example; travel/ID set
  #113/#114/#159/#160 (exposure history beats geography); the minor-complaint
  resource-counting run #131–149 with explicit cross-references (#131↔#5,
  #141↔#76, #155↔#150); #153 hypercalcemia with all-green vitals ("the whole
  case is in the story"); #158's non-stigmatizing opioid-use-disorder case.

Judgment calls reviewed and accepted as-is: #26 meningococcemia at ESI 2 (not
1 — no current lifesaving intervention); #90 red RR 48 in an ESI-3 bronchiolitis
(honest color; feeding/wet diapers justify 3); red pain-7 vitals inside ESI-4
records (#154, #160 — severe pain alone doesn't raise ESI, which is itself the
lesson); pain 7 with a composed image in #4 (stoic patient).

---

## 6. Known issues deliberately left alone (image-side, and small)

Images were off-limits this session. None of these break gameplay; they matter
only if an image is ever regenerated.

- **#29** — the "shortened, externally rotated" right leg isn't visible in the
  wheelchair image; the triageNote carries the finding.
- **#56** — the dinner-fork wrist deformity is hidden by how she cradles the arm.
- **#92** — the swollen index finger is barely discernible.
- **#1** — the image shows the LEFT ankle injured while `aiImageGeneration` says
  right; no player-facing text names a side, so nothing conflicts in play.
- **Text inside images:** "BU" (#122/#124, intentional), "Randy" name tag
  (#131, matches the name), "BOWLERS" (#119), "STARDEW VALLEY" (#149),
  "LEAGUE. LEGENDS" (#148 — real brand, and the generator dropped the "OF"),
  "UNIVERSITY" (#109, against its own prompt).
- **#156** uses the newer metal-leg chair style from the regenerated batch;
  most images use the wooden-leg chair. Cosmetic.
- **`aiImageGeneration` admin fields** are inconsistent across the regenerated
  records (#26, #55, #100, #156–160 use different `anchor_image`/`outputFolder`
  values, chroma-key prompts, `1254x1254`, etc.). Administrative only — never
  displayed.

---

## 7. Open questions for John's clinical sign-off

1. **#23 vs #137 resource counting:** nasal bead removal = ESI 5 (not a counted
   resource) but ear-canal raisin = ESI 4 (counted). Defensible — ear-canal
   removals are more involved — but it's the tightest pair in the library.
   A conscious yes/no would settle the precedent.
2. **Exam-finding depth in triageNotes:** the library's convention allows brief
   quick-exam findings (tonsillar exudates #58, bulging eardrum #60, nystagmus
   #35, transillumination #94). John drew the line at the speculum exam (#73,
   removed). If a stricter line is ever wanted, those records are where to look.
3. **Remaining duplicate first names** are all pairs (Tyler, Rosa, Marcus,
   Priya, Walter, Andre, Trevor, Cody, Sofia, Chloe, Camila, Hannah, Devon,
   Nicole, Mei, Owen, Zoe, Raymond, Dennis, Curtis, Carlos). Accepted as
   realistic; no further action planned.

---

## 8. Conventions established this session (for future authoring/AI helpers)

- **Colors never lie; context always shows.** Never hand-tune a vital color —
  edit `vitals-bands.md`/`.json` instead and re-run the audit. If a record's
  danger depends on context, the quote or triageNote must say so in words.
- **Quotes are in the patient's voice** — age, mood, personality. Volunteered
  history ("Oh, I take that blood thinner…") is a legitimate hint or red
  herring, used sparingly. Impaired speech is marked in-line: `(slurring)`.
  Caregiver-spoken quotes are always tagged — `(Mom)`, `(Dad)`, `(Daughter)`,
  `(his mother)`, `(Wife)`, `(Friend)`, `(Bystander)` — and the tag must match
  the adult shown in the image.
- **The image is Presentation evidence.** Findings visible in the image (blood
  on a dressing, forearm rash, scleral icterus) count as shown to the player,
  and text must not contradict the image.
- **Evidence-rule edits cascade:** removing a fact from Presentation means
  removing every Clinical reference to it (see #73).
- **Quote ≤ 225 characters, triageNote ≤ 325 characters.** All 160 currently
  comply with wide margins.
- **Never edit clinical prose without John's sign-off.** Mechanical fixes
  (structure, colors from the band table) may be scripted; wording is John's.

---

## 9. What remains for the project (beyond this review)

- **John's items:** the sign-off questions in §7; final human clinical review
  ("three-way review" per the 2.2 anti-creep contract) if still wanted on top of
  this pass.
- **Sync/promote:** `patient-data/` is now behind `patient-data-for-claude-review/`.
  Decide when the review copy becomes the published library.
- **Docs refresh:** `README.md` and parts of `patient-schema-notes.md` still say
  the 160 production records are at schema 1.2 — stale on purpose until John
  declares the migration validated. Update both when that happens.
- **Manifest:** `patient-index.json` is deliberately empty; manifest generation
  is a separate future step.
- **Image regen queue (optional):** #29, #56, #92, #109, #148, #156 (see §6),
  plus #38 if John ever prefers regenerating the image instead of the applied
  race-field fix.
