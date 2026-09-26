# FIGO Gynecologic Cancer Staging Calculators

Online-only static website with calculators for:

Current release: **v1.4.1** (neutral opening state for cervical, vulvar, and GTN calculators, 26 September 2026).

Two layouts are available:

- **Computer version 1.4.1:** the main site at `/`.
- **Phone version 1.1:** a compact layout based on computer version 1.4.1 at `/phone/`.

See [VALIDATION-REPORT-v1.4.1.md](VALIDATION-REPORT-v1.4.1.md) for the current source audit and verification status.

## Open the calculator

[Open the FIGO staging calculators](https://tinchangchang.github.io/figo-staging-calculators/)

[Open the phone version](https://tinchangchang.github.io/figo-staging-calculators/phone/)

Scan with a smartphone camera:

![QR code for the FIGO staging calculators](FIGO-calculator-QR.png)

## Included calculators

- Cervical cancer
- Endometrial cancer (FIGO 2023 anatomical and molecular staging)
- Epithelial ovarian, fallopian tube, and peritoneal cancer
- Gestational trophoblastic neoplasia (FIGO 2026, including PSTT/ETT GP/PP classification)
- Uterine leiomyosarcoma
- Vaginal cancer
- Vulvar cancer (FIGO 2021 staging)

Open `index.html` to choose a calculator. GitHub Pages deploys the site automatically after changes are merged into `main`.

## Online-only operation

Offline installation and caching are intentionally disabled. The repository does not include a web app manifest, service worker, install prompt, or local-server launcher. Users should open the official HTTPS link whenever they need a calculator.

## Security

This is a static client-side website with no backend, login, analytics, or patient-data storage. The pages use a restrictive Content Security Policy and load no third-party scripts. Review changes before merging them into the published `main` branch.

## Clinical notice

These calculators are staging aids only. Confirm final FIGO stage with complete clinical, imaging, operative, pathological, and multidisciplinary information before clinical use.
