# Release notes v1.4.1

Release date: 26 September 2026

## Opening-state refinement

- Cervical, vulvar, and gestational trophoblastic neoplasia calculators now open with **Not determined** instead of displaying a stage before the reviewer enters a field.
- After the first explicit selection, live staging begins immediately and unanswered fields continue to use their first clinical option as the calculation default.
- Resetting any of these three calculators returns it to the **Not determined** opening state.
- Standard GTN results use explicit stage-and-score notation, for example `Stage III LNr, Score 6`; nodal stages use compact `LNr`/`LNp` notation.
- The redundant GTN headings “Staging inputs” and “FIGO anatomic stage” were removed.
- PSTT/ETT results spell out `with good prognostic factor` or `with poor prognostic factor`; the phrase is displayed in smaller type beneath the stage.
- GTN now uses one required “Interval from index/previous pregnancy” field. Its options include `13-47 months` and `≥48 months`; for PSTT/ETT stages I-III, this field determines the good or poor prognostic factor.

All staging rules, confidence shading, online-only safeguards, and the behavior of the other four modules are unchanged from v1.4.0.
