# Validation report v1.4.1

Date: 26 September 2026

## Scope

This maintenance release changes only the initial display behavior of the cervical, vulvar, and gestational trophoblastic neoplasia calculators.

## Verified behavior

- Each affected calculator opens with **Not determined** when no field has been explicitly selected.
- Selecting any field activates staging immediately.
- Once staging begins, unanswered fields use their first clinical option as the calculation default.
- Reset returns the calculator to **Not determined**.
- Stage text shading continues to deepen as more required fields are explicitly completed.
- Existing staging-engine regression tests remain successful.
- Standard GTN formatting is verified as `Stage X, Score X`, with nodal qualifiers displayed as compact `LNr`/`LNp` notation.
- PSTT/ETT results use full good/poor prognostic-factor wording, with a smaller visual qualifier below the stage.
- The shared index/previous-pregnancy interval includes `13-47 months` and `≥48 months`; it is required to classify the prognostic factor for PSTT/ETT stages I-III, while both bands retain a standard GTN interval score of 4.

## Clinical and security status

The application remains an online-only, static client-side calculator. It has no backend, login, analytics, patient-data storage, service worker, install prompt, or offline cache. It remains a staging aid and does not replace complete clinical review.
