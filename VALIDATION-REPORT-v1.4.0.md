# Source-Concordance Validation Report - v1.4.0

Date: 26 September 2026

Version 1.4.0 changes calculator interaction and presentation without changing the published staging hierarchies. The existing source-specific rule tests remain in place for the seven cancer modules.

## Verified behavior

- No calculator displays or copies the word "provisional."
- An unanswered select field is calculated using its first clinical option, while the placeholder remains visible until the reviewer confirms a choice.
- Stage text color progresses from light burgundy to full FIGO burgundy according to the fraction of explicitly answered required fields.
- Molecular fields are excluded from the endometrial anatomical completion denominator because they are optional.
- The PSTT/ETT interval is conditionally counted for the GTN PSTT/ETT workflow; standard GTN uses its anatomical and seven score fields.
- Reset restores the unconfirmed visual state and light stage color.
- Calculator menu entries are in alphabetical order.

## Interpretation

The color conveys form completion only. It does not measure staging certainty, evidence quality, prognosis, or clinical risk. Final staging still requires review of all applicable source information and multidisciplinary confirmation.
