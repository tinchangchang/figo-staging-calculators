# Source-Concordance Validation Report — v1.2.0

**Review date:** 24 September 2026  
**Scope:** Cervical, epithelial ovarian/fallopian-tube/peritoneal, vaginal, endometrial, uterine leiomyosarcoma, and gestational trophoblastic neoplasia calculators.

## Validation status

Version 1.2.0 passed source-table review and 91 automated regression assertions. This establishes technical and rule concordance with the cited staging publications; it does **not** replace the planned independent clinical validation by FIGO Women's Cancer Committee members. The proposed 12-case-per-cancer-site committee exercise remains required before describing the calculators as clinically validated.

The vulvar calculator is outside this package because the existing FIGO website calculator remains the designated tool.

## Governing sources checked

| Calculator | Governing staging source used for v1.2.0 | Result |
|---|---|---|
| Endometrial | Berek et al., FIGO staging of endometrial cancer: 2023, DOI 10.1002/ijgo.14923; corrigendum DOI 10.1002/ijgo.15193 | Corrected |
| Cervical | Bhatla et al., Cancer of the cervix uteri: 2025 update, DOI 10.1002/ijgo.70277 (FIGO 2018 staging table retained) | Concordant after safeguards |
| Ovary/fallopian tube/peritoneum | Renz et al., 2025 update, DOI 10.1002/ijgo.70282 (FIGO 2014 staging retained) | Corrected |
| Vaginal | Adams and Cuello, Cancer of the vagina: 2025 update, DOI 10.1002/ijgo.70325 | Corrected |
| Uterine leiomyosarcoma | Prat, FIGO staging for uterine sarcomas, DOI 10.1016/j.ijgo.2008.12.008 | Concordant after safeguards |
| GTN | Ngan et al., FIGO staging for gestational trophoblastic neoplasia: 2026, DOI 10.1002/ijgo.71229 | Upgraded to 2026 system |

## Corrections made

### Endometrial cancer

- Removed automatic favorable defaults; all 15 anatomical fields must be answered.
- Enforced molecular hierarchy: POLE first, then MMR, then p53. MMRd or p53abn is not finalized when an upstream result is unknown.
- Corrected nodal labels to micrometastasis **>0.2–2 mm and/or >200 cells** and ITCs **≤0.2 mm and ≤200 cells**.
- Limited “non-aggressive” histology to low-grade (grade 1 or 2) endometrioid carcinoma.
- Routes unresolved mixed nodal-volume patterns to committee review instead of inferring IIIC2i/IIIC2ii.

### Other calculators

- All modules now require completion of their staging fields before reporting a final lower stage; unknown findings are not treated as negative.
- Cervical: added isolated tumor-cell handling and extension beyond the true pelvis; updated the reference to the 2025 FIGO Cancer Report.
- Ovary/fallopian tube/peritoneum: separated explicit negative findings from “not documented,” removed the ambiguous positive-node-with-peritoneal option, and retained IIIA1 size subdivisions.
- Vaginal: prevents Stage I/II assignment without N0, rejects bullous edema alone as T4, and prevents N1 grouping without a T1–T3 primary.
- Uterine leiomyosarcoma: confirmed the 2009 FIGO table and added completeness safeguards.
- GTN: implemented FIGO 2026 staging, infradiaphragmatic/supradiaphragmatic nodal notation, seven-factor score, 0–6/7–12/≥13 risk groups, removal of previous failed chemotherapy, exact hCG and tumor-size boundaries, and the PSTT/ETT GP/PP system.

## Automated verification

Run:

```sh
/Users/research/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/endometrial-engine.test.js
/Users/research/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/calculators-regression.test.js
```

Both suites pass in v1.2.0. The tests cover representative stage groups, precedence, boundary conditions, incomplete inputs, molecular precedence, nodal notation, GTN 2026 scoring, and PSTT/ETT classification.

## Items requiring committee validation

1. Independently test 12 cases per cancer site using the electronic capture protocol.
2. Predefine the expected reference stage for every case and keep adjudicators blinded to calculator output until submission.
3. Adjudicate endometrial mixed pelvic/para-aortic nodal-volume patterns and other cases that the calculator labels “Review required.”
4. Record exact agreement, disagreement type, and free-text comments; do not convert review-required outcomes into inferred stages during analysis.

## Release integrity

The public URL and QR destination are unchanged, so the existing hyperlink and QR code continue to open the current release after deployment. This repository is a static client-side application and does not transmit or store case data.
