# Project Smart Plants

Statische leswebsite voor het onderzoeken van bodemvochtigheid met Arduino of, bij een veilige 3V-opstelling, micro:bit.

De publiceerbare website staat in `projectsmartplants/`. Die map bevat de landing page, het onderzoeksplatform, de evaluatiepagina, firmware, media, voorbeelddata en lokale JavaScript-bibliotheken. Er is geen buildstap en geen CDN nodig.

## GitHub Pages

De workflow `.github/workflows/deploy-pages.yml` publiceert uitsluitend `projectsmartplants/`. Daardoor komt de landing page online op:

`https://robbew.github.io/smartplants/`

Na het aanmaken van de repository `smartplants`:

1. Maak de repository aan onder het account `RobbeW`.
2. Voeg deze map als repository toe, commit de bestanden en push de branch `main`.
3. Kies in GitHub bij **Settings > Pages > Build and deployment** voor **GitHub Actions**.
4. Controleer na de eerste workflowrun de landing page, het platform en de evaluatiepagina.

De workflow publiceert een statische map via GitHub Pages Actions. Zie de [GitHub Pages-documentatie](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) voor de standaard publicatiestappen.

## Belangrijke URLs

- Landing page: `https://robbew.github.io/smartplants/`
- Onderzoeksplatform: `https://robbew.github.io/smartplants/platform.html`
- Evaluatie: `https://robbew.github.io/smartplants/evaluatie.html`

Alle interne links en media gebruiken relatieve paden. Dat houdt de site bruikbaar in de GitHub Pages-submap en in een lokale preview.

## Documentatie

- `projectsmartplants/readme.md`: lesinhoud, hardware, firmware en publicatiecheck.
- `Background_Documents/smart_plants_design_system.md`: merk-, UI- en bewegingsrichtlijnen.
- `Background_Documents/project_url_tree.md`: bron van waarheid voor alle publieke project-URLs.

## Rechten

Copyright (c) 2026 Robbe Wulgaert. Alle rechten voorbehouden. Zie `LICENSE.md`.
