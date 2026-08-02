# Vitals color bands

**Established:** 2026-08-01 (agreed with John during the schema 2.2 validation)

This document is the authoritative definition of what the vital-sign colors in
a patient record mean and exactly which color every value receives. The
machine-readable mirror is `vitals-bands.json`; the audit script
`audit-vitals-bands.mjs` enforces agreement between these bands and the stored
colors in `patient-json/`.

## The two-rule design

1. **Colors are fixed thresholds.** A color is a pure function of the vital's
   value and the patient's age band — like a monitor alarm. It never encodes
   per-patient context. The player can always trust a color:

   - **green** — normal for this age
   - **yellow** — notice this; outside normal but not alarming by itself
   - **red** — this number alone is alarming

2. **Context lives in the text.** When patient context changes the clinical
   meaning of a number (a fever on chemotherapy, bradycardia with chest pain),
   that context must appear in the quote or triageNote — preferably — so the
   correct ESI stays justifiable from Presentation alone. The colors say what
   the number is; the words say why it matters for this patient.

Colors are baked into each patient JSON by the authoring/audit pipeline. The
application displays stored colors and never computes them.

## Lookup convention

- Find the row matching the vital where `age-low <= floor(age) <= age-high`.
  Bounds are inclusive; every age from 0 to 120 is covered exactly once per
  vital.
- If the value falls inside the green range (inclusive), the color is green.
- Otherwise, if it falls inside any yellow range (inclusive), it is yellow.
- Otherwise it is red.

## Band table

| Vital | Age class | age-low | age-high | Green | Yellow | Red (everything else) |
|---|---|---:|---:|---|---|---|
| hr | infant | 0 | 0 | 100–160 | 80–99, 161–180 | <80, >180 |
| hr | toddler | 1 | 2 | 90–150 | 75–89, 151–170 | <75, >170 |
| hr | preschool | 3 | 5 | 80–140 | 65–79, 141–160 | <65, >160 |
| hr | school | 6 | 12 | 70–120 | 60–69, 121–140 | <60, >140 |
| hr | teen | 13 | 17 | 60–105 | 50–59, 106–130 | <50, >130 |
| hr | adult | 18 | 120 | 60–100 | 50–59, 101–120 | <50, >120 |
| rr | infant | 0 | 0 | 30–55 | 25–29, 56–65 | <25, >65 |
| rr | toddler | 1 | 2 | 22–37 | 18–21, 38–45 | <18, >45 |
| rr | preschool | 3 | 5 | 20–30 | 16–19, 31–40 | <16, >40 |
| rr | school | 6 | 12 | 16–25 | 12–15, 26–30 | <12, >30 |
| rr | teen | 13 | 17 | 12–20 | 9–11, 21–28 | <9, >28 |
| rr | adult | 18 | 120 | 12–20 | 9–11, 21–29 | <9, >=30 |
| bp (systolic) | infant | 0 | 0 | 72–104 | 65–71, 105–115 | <65, >115 |
| bp (systolic) | toddler | 1 | 2 | 84–110 | 75–83, 111–120 | <75, >120 |
| bp (systolic) | preschool | 3 | 5 | 88–112 | 80–87, 113–125 | <80, >125 |
| bp (systolic) | school | 6 | 12 | 95–120 | 85–94, 121–135 | <85, >135 |
| bp (systolic) | teen | 13 | 17 | 100–130 | 90–99, 131–150 | <90, >150 |
| bp (systolic) | adult | 18 | 120 | 100–139 | 90–99, 140–179 | <90, >=180 |
| spo2 | all | 0 | 120 | 95–100 | 92–94 | <=91 |
| temp (°C) | all | 0 | 120 | 36.0–37.9 | 35.0–35.9, 38.0–38.9 | <35.0, >=39.0 |
| pain | all | 0 | 120 | 0–3 | 4–6 | 7–10 |

## Deliberate simplifications

- **BP is colored by systolic only.** The diastolic value is displayed but
  never drives the color.
- **Ages 65+ use adult bands.** No separate geriatric band; age-related nuance
  belongs in the triageNote.
- **Pain uses the universal clinical convention:** mild 0–3, moderate 4–6,
  severe 7–10, for all ages.
- **Temperature red starts at 39.0 °C** — a deliberate middle ground: high
  fevers (39.0+) read as alarming on their own; 38.0–38.9 is "notice this."
  Context that makes a lesser fever dangerous (chemotherapy, recent travel)
  belongs in the text per rule 2.
- Bands are simplified from standard references (PALS pediatric ranges, adult
  norms, ESI danger-zone vitals) toward game clarity: red is deliberately rare
  and unambiguous.

## Changing these bands

Edit the table here and mirror the change in `vitals-bands.json`, then run:

```
node schema/schema-support-files/audit-vitals-bands.mjs patient-json          (report)
node schema/schema-support-files/audit-vitals-bands.mjs patient-json --fix    (apply)
```

After any fix, re-verify affected records' text still matches (rule 2) and
re-run `validate-schema-v22.mjs` and `sweep-check-1-2.mjs`.
