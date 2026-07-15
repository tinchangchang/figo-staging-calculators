# FIGO Gynecologic Cancer Staging Calculators

Online-only static website with calculators for:

## Open the calculator

[Open the FIGO staging calculators](https://tinchangchang.github.io/figo-staging-calculators/)

Scan with a smartphone camera:

![QR code for the FIGO staging calculators](FIGO-calculator-QR.png)

## Included calculators

- Epithelial ovarian, fallopian tube, and peritoneal cancer
- Cervical cancer
- Vaginal cancer
- Uterine leiomyosarcoma
- Gestational trophoblastic neoplasia

Open `index.html` to choose a calculator. GitHub Pages deploys the site automatically after changes are merged into `main`.

## Online-only operation

Offline installation and caching are intentionally disabled. The repository does not include a web app manifest, service worker, install prompt, or local-server launcher. Users should open the official HTTPS link whenever they need a calculator.

## Security

This is a static client-side website with no backend, login, analytics, or patient-data storage. The pages use a restrictive Content Security Policy and load no third-party scripts. Review changes before merging them into the published `main` branch.

## Clinical notice

These calculators are staging aids only. Confirm final FIGO stage with complete clinical, imaging, operative, pathological, and multidisciplinary information before clinical use.
