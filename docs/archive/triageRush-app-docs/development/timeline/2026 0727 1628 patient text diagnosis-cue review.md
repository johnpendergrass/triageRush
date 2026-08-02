# Patient text diagnosis-cue review

**Reviewed:** 2026-07-27 16:28 PDT  
**Scope:** All 160 patient JSON records, excluding images  
**Review perspective:** Expected recognition level of a fourth-year medical
student with emergency-department rotations  
**Purpose:** Identify text that gives away a diagnosis or intended urgency for
the wrong reason, while keeping triageRush approachable and enjoyable

> **Update — 2026-07-27:** The 40 patients in the highest-priority review group
> have been revised. Their pre-choice presentations now stop at history,
> symptoms, observed signs, examination findings, and measured severity.
> Diagnoses, interpretive conclusions, and management directives were removed.
> ESI levels, vitals, diagnoses, routing, answers, and all other patient data
> were left unchanged.
>
> **Second update — 2026-07-27:** The remaining 29 direct-conclusion cases were
> also revised. This pass used a deliberately natural clinical standard:
> established medical history and obvious nurse-level descriptions may remain
> in a triage presentation. The edit removes unconfirmed acute conclusions,
> answer-key phrasing, and management/disposition instructions; it does not
> force nurses to avoid ordinary diagnostic language they would reasonably use.

## Executive assessment

The patient library is imaginative, readable, and generally enjoyable. The
patient quotes are usually its strongest writing: they communicate symptoms in
a memorable voice without sounding like an examination stem.

The main issue is in `presentationShort` and `presentationLong`, especially
patients 026 through 100. Many presentations first provide appropriate
findings, then append the diagnosis, risk interpretation, or management step
after a dash. Examples include “ruptured AAA,” “posterior circulation stroke,”
“PE with DVT,” “give naloxone,” and “tPA window.” In those cases the final
phrase functions as an answer key.

This matters even though the player is choosing an ESI room rather than naming
the diagnosis. An explicit diagnosis or directive often reveals the intended
urgency and removes the need to synthesize the findings. The better design is:

- Patient-facing text gives observations, symptoms, history, vitals, and
  relevant negative findings.
- The player interprets those facts.
- The diagnosis, teaching explanation, and management urgency appear after the
  choice or in a review/teaching view.

Easy cases are not a problem. A common cold, simple laceration, obvious
fishhook, or classic ankle sprain can be immediately recognizable and still be
fair and pleasant. The concern is not recognizability; it is text that states
the conclusion rather than presenting the evidence.

## Review counts

| Review category | Patients | Meaning |
|---|---:|---|
| Direct conclusion in presentation | 69 | Presentation names or interprets the diagnosis, urgency, or management |
| Strongly cued but generally fair | 49 | Classic pattern, known diagnosis, self-diagnosis, or intentionally obvious case |
| No meaningful cueing concern | 42 | Text presents findings without supplying the clinical conclusion |
| Total | 160 | Every patient was reviewed |

These categories are editorial judgments, not measures of medical difficulty.

## Recommended writing standard

For the next patient-text pass:

1. Do not place the formal diagnosis in `quoteShort`, `presentationShort`, or
   `presentationLong` unless it is genuinely known before arrival and relevant
   history, such as established schizophrenia, COPD, migraine, sickle cell
   disease, or a positive COVID test.
2. Do not append interpretation such as “until proven otherwise,” “high risk
   for,” “occult,” “benign,” or “non-urgent.”
3. Do not include management commands such as “give naloxone,” “Epi now,”
   “reduce,” “needs I&D,” “get an ECG,” or “tPA window.”
4. Keep observable findings and useful negatives. Those are the fair clues the
   player should use.
5. Preserve the humor and patient voice unless it creates ambiguity or
   stigma.
6. Put the diagnosis, explanation, risk, and management teaching in the
   post-choice review fields, not the pre-choice presentation.
7. Do not make rare or dangerous diagnoses artificially vague. A complete
   clinical pattern is appropriate; the final diagnostic label is not needed.

This approach follows the general educational distinction between presenting
enough information to synthesize a case and accidentally cueing the answer.
The [NBME Item-Writing Guide](https://www.nbme.org/institutions/nbme-item-writing-guide/)
describes both the value of complete clinical vignettes and the need to avoid
cues that let learners answer without the intended expertise. The
[AHRQ Emergency Severity Index](https://www.ahrq.gov/practiceimprovement/index.html)
frames ESI around acuity and expected resources, reinforcing that the player
should interpret clinical information rather than merely recognize a printed
diagnostic label.

## Highest-priority review group

These presentations contain the clearest answer-key language. They should be
reviewed first. In most cases, deleting or rewriting only the concluding phrase
would preserve an otherwise good vignette.

| Patient | Intended diagnosis | Answer-key language or issue |
|---|---|---|
| 026 | Meningococcal meningitis/sepsis | Names meningococcal disease and says “until proven otherwise” |
| 028 | Intracranial injury/bleed | Interprets the lucid interval and explicitly concludes evolving bleed |
| 030 | Head injury on warfarin | States “high risk for delayed intracranial hemorrhage” |
| 031 | Occult pneumonia | Names occult pneumonia and explains delirium as its herald |
| 032 | Ruptured AAA | Explicitly says ruptured AAA/abdominal aortic aneurysm |
| 033 | Severe hypoglycemia | Supplies the interpretive term “neuroglycopenia” |
| 034 | Decompensated heart failure | Names decompensated CHF/heart failure |
| 035 | Posterior circulation stroke | Explicitly names the stroke location |
| 036 | Pulmonary embolism with DVT | Explicitly states “PE with DVT” |
| 037 | Aortic dissection | Explicitly names the diagnosis |
| 038 | Ectopic pregnancy | Says ectopic pregnancy “until excluded/proven otherwise” |
| 039 | Ovarian torsion | Names torsion and calls it a surgical emergency |
| 040 | DKA | Names DKA/diabetic ketoacidosis |
| 041 | Subarachnoid hemorrhage | Names SAH after an already-complete classic presentation |
| 042 | Cauda equina syndrome | Names the syndrome directly |
| 046 | Asthma exacerbation | Supplies the severity conclusion “moderate-severe exacerbation” |
| 052 | Upper GI bleed | Names the bleed rather than stopping after hematemesis/melena/orthostasis |
| 055 | Shoulder dislocation | Names anterior dislocation and instructs “reduce” |
| 056 | Distal-radius fracture | Names the fracture and Colles pattern |
| 058 | Streptococcal pharyngitis | Converts findings into a Centor/strep conclusion |
| 064 | Cutaneous abscess | Names the abscess and states “needs I&D” |
| 066 | COPD exacerbation | Names the exacerbation after listing the findings |
| 067 | Cholecystitis | Names acute cholecystitis |
| 068 | Pancreatitis | Names acute pancreatitis |
| 069 | Atrial fibrillation with RVR | Supplies both rhythm diagnosis and response |
| 070 | SVT | Names supraventricular tachycardia |
| 071 | BPPV | Names BPPV/benign paroxysmal positional vertigo |
| 073 | Threatened miscarriage | Names the obstetric diagnosis |
| 076 | DVT | Names deep vein thrombosis |
| 077 | Urosepsis/septic shock | Names both urosepsis and shock |
| 078 | Opioid overdose | Names overdose and instructs naloxone/airway treatment |
| 079 | Acute MI | Names myocardial infarction and tells the player to obtain an ECG |
| 080 | Pneumothorax | Names spontaneous pneumothorax |
| 082 | HHS | Names hyperosmolar hyperglycemic state |
| 083 | Anaphylaxis | Names anaphylaxis and directs immediate epinephrine |
| 084 | Acute stroke | Names stroke and supplies “tPA window” |
| 085 | Flash pulmonary edema | Names the diagnosis |
| 088 | Renal colic | Names renal colic and ureteral stone |
| 097 | Hyperventilation syndrome | Names the syndrome and attributes it to anxiety |
| 100 | Facial cellulitis | Names cellulitis and directs orbital assessment |

## Complete direct-conclusion review queue

The following 69 patients contain a direct diagnostic, interpretive,
management, or disposition conclusion in at least one pre-choice presentation
field:

```text
019 025 026 028 030 031 032 033 034 035 036 037 038 039 040
041 042 044 045 046 047 049 050 051 052 053 055 056 057 058
059 060 061 062 063 064 065 066 067 068 069 070 071 072 073
074 075 076 077 078 079 080 081 082 083 084 085 086 088 089
090 091 092 093 094 095 097 098 100
```

Not all require the same amount of work. Many low-acuity cases need only the
diagnostic phrase after the final dash removed. Patients in the
highest-priority table deserve a more deliberate rewrite because their current
text also states urgency or management.

After completing the 40 highest-priority revisions, the remaining
direct-conclusion queue is:

```text
019 025 044 045 047 049 050 051 053 057 059 060 061 062 063
065 072 074 075 081 086 089 090 091 092 093 094 095 098
```

These 29 cases are mostly straightforward or lower-acuity presentations where
the diagnosis is appended to otherwise adequate text.

This remaining queue was completed during the second revision pass. It is
retained here as a historical record of which patients were reviewed.

## Strongly cued but generally fair

The following 49 patients are recognizable from classic findings, known
history, explicit exposure, or an intentionally obvious presentation:

```text
002 006 007 009 010 014 015 017 021 027 029 043 048 087 096
101 102 103 104 105 106 109 110 112 113 121 122 125 126 127
128 129 130 142 144 145 146 147 148 150 151 152 153 154 155
157 158 159 160
```

These should not automatically be made harder. Specific observations:

- 002, 006, 007, 009, 017, 027, 029, 121, 122, 125, 127, 128, and 129 use
  classic emergency patterns. That is fair pattern recognition.
- 048, 087, 101–105, and 112 involve a known or already identified condition.
  Naming that history is legitimate.
- 130 is deliberately comic and almost self-solving. It works as a low-stress
  relief case if that tone is desired.
- 146 includes Koplik spots; 152 says “Charcot's triad complete”; and 148
  includes positive Tinel's and Phalen's tests. These are unusually strong
  textbook cues. Keep them if the educational goal is recognition; soften
  them if the player is expected to reason more broadly.
- 113 and 159 are high-consequence outbreak/exposure cases. Their strong
  epidemiological cue is clinically appropriate, though they may feel more
  stressful or niche than the rest of the library.
- 158 risks reading as a “drug-seeking patient” stereotype. The physiologic
  withdrawal findings and safety assessment are useful, but the tone should
  receive a sensitivity and stigma review.

## No meaningful cueing concern

These 42 patients currently present findings without a material diagnosis
leak:

```text
001 003 004 005 008 011 012 013 016 018 020 022 023 024 054
099 107 108 111 114 115 116 117 118 119 120 123 124 131 132
133 134 135 136 137 138 139 140 141 143 149 156
```

This does not mean their medical content is perfect; it means diagnosis cueing
is not a reason to prioritize them.

## Quote assessment

The quotes are generally not the source of accidental answer leakage. When a
patient uses a familiar term—“migraine,” “bladder infection,” “poison ivy,”
“COVID,” or “my usual crisis”—it usually reads as realistic prior knowledge,
not an editorial answer key.

Potential quote-level decisions:

- Patient 010 calls the cause a kidney “pebble.” This is playful and obvious,
  but not harmful.
- Patient 014 directly identifies poison ivy. Appropriate if the case is meant
  to be easy.
- Patients 048 and 087 call the condition a migraine. Appropriate for a known
  recurrent diagnosis.
- Patient 059 says “bladder infection.” Appropriate patient language, though
  it makes the case intentionally easy.
- Patients 101–104 already know or strongly imply COVID status. Appropriate if
  the task is severity rather than diagnosis.
- Patient 112 says “my usual crisis.” Appropriate for known sickle cell
  disease.

No quote needs urgent rewriting solely because it is easy.

## Additional text-quality findings

These are outside the diagnosis-cue question but should be captured for the
planned patient review:

- `quoteShort` is `null` in all 160 records, so the eventual default card does
  not yet have its intended concise patient voice.
- Two `quoteLong` values exceed the current 40-word working maximum:
  patients 150 (41) and 151 (45). Patients 047, 049, 075, and 100 were
  shortened during the two presentation-revision passes.
- No `presentationShort` exceeds 30 words.
- No `presentationLong` exceeds 60 words.
- The library contains repeated clinical families—multiple MI, stroke,
  anaphylaxis, migraine, URI/COVID/RSV, and rash cases. Repetition can be
  educational, but the runtime should avoid serving near-duplicates back to
  back when practical.
- Some presentations alternate US and UK terminology/spelling. A later
  editorial pass should choose whether that variation is intentional.

## Recommended sequence

1. ~~Rewrite the 40 highest-priority presentations without changing diagnosis,
   ESI, vitals, or routing.~~ Completed.
2. ~~Review the remaining direct-conclusion queue using the natural clinical
   language standard.~~ Completed.
3. Re-read each revised case using only pre-choice information and ask:
   “Could a fourth-year student justify the ESI level without seeing the
   diagnosis?”
4. Review the 49 strongly cued cases for desired difficulty and tone, changing
   only those that feel joyless, unfair, or too exam-like.
5. Author `quoteShort` after the presentation language stabilizes.
6. Test actual text fit and player experience in the production mobile layout.

The objective is not to turn triageRush into a difficult examination. It is to
let easy cases be easy because their clinical pattern is clear—not because the
presentation prints the answer.
