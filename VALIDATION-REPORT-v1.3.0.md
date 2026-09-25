# Source-Concordance Validation Report — v1.3.0

**Review date:** 25 September 2026

Version 1.3.0 adds the FIGO 2021 Vulvar Cancer calculator and immediate provisional-stage display. The vulvar rules were checked against Olawaiye AB, Cuello MA, Beriwal S, Rogers LJ. *Cancer of the vulva: 2025 update*. Int J Gynecol Obstet. 2025;171(Suppl. 1):36-47. DOI 10.1002/ijgo.70390.

The module implements:

- IA: tumor confined to vulva, ≤2 cm and stromal invasion ≤1 mm.
- IB: tumor confined to vulva, >2 cm or stromal invasion >1 mm.
- II: extension to lower third of urethra, vagina, or anus with no higher-stage finding.
- IIIA: upper adjacent-structure extension or non-fixed/non-ulcerated regional nodal metastasis ≤5 mm.
- IIIB: regional nodal metastasis >5 mm.
- IIIC: regional nodal metastasis with extracapsular spread.
- IVA: disease fixed to pelvic bone or fixed/ulcerated regional nodes.
- IVB: pelvic lymph-node or other distant metastasis.

All modules now calculate from currently available inputs. If fields remain unanswered, the display and copied result explicitly say **Provisional**, and the rationale states how many unanswered fields may change the final stage. This design provides immediate feedback without presenting partial-input output as final.

Automated regression tests cover complete and provisional cases. Source-concordance testing does not replace the planned independent 12-case-per-site committee validation.
