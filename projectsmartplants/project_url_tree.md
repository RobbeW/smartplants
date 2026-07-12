# AI in de Klas URL tree

Status: source of truth for cross-links in project landing pages.

Last checked: 2026-07-10.

This document separates public URLs from local source folders. Public URLs are the links to use when updating a landing page. Local folders are only for development and must never appear in public `href` attributes.

## Public tree

```text
AI in de Klas
https://www.aiindeklas.be/
|
|-- Basisplatformen
|   |-- Blockly: https://robbew.github.io/Blockly/
|   |-- JavaScript in de Klas: https://robbew.github.io/jsindeklas/
|   |-- HTML in de Klas: https://robbew.github.io/htmlindeklas/
|   `-- Verdieping
|       |-- Dodona course 2641: https://dodona.be/nl/courses/2641/
|       `-- Delphi: https://robbew.github.io/delphi/
|
`-- STEAM-projecten, in curriculumvolgorde
    |-- Smart Plants: https://robbew.github.io/smartplants/
    |   |-- Onderzoeksplatform: https://robbew.github.io/smartplants/platform.html
    |   |-- Evaluatie: https://robbew.github.io/smartplants/evaluatie.html
    |   `-- Projectbestanden: https://github.com/RobbeW/smartplants
    |-- Robothand: https://robbew.github.io/robothand/
    |-- Project Wind: https://robbew.github.io/projectwind/
    |   |-- Platform: https://robbew.github.io/projectwind/platform.html
    |   `-- Projectbestanden: https://github.com/RobbeW/projectwind
    |-- Slimme vuilnisbak: https://robbew.github.io/slimme_vuilnisbak/
    `-- Project Fijnstof: https://robbew.github.io/projectfijnstof/
        |-- Platform: https://robbew.github.io/projectfijnstof/platform.html
        `-- Projectbestanden: https://github.com/RobbeW/projectfijnstof
```

The Smart Plants repository URL is planned as `https://github.com/RobbeW/smartplants`. Use it in project-code links after the repository has been created and pushed.

## Smart Plants route map

| Purpose | Public URL | Published source |
| --- | --- | --- |
| Landing page | `https://robbew.github.io/smartplants/` | `projectsmartplants/index.html` |
| Research platform | `https://robbew.github.io/smartplants/platform.html` | `projectsmartplants/platform.html` |
| Teacher evaluation | `https://robbew.github.io/smartplants/evaluatie.html` | `projectsmartplants/evaluatie.html` |
| Main stylesheet | `https://robbew.github.io/smartplants/style.css` | `projectsmartplants/style.css` |
| Platform script | `https://robbew.github.io/smartplants/script.js` | `projectsmartplants/script.js` |
| Arduino firmware | `https://robbew.github.io/smartplants/firmware/arduino_smart_plants/arduino_smart_plants.ino` | `projectsmartplants/firmware/arduino_smart_plants/arduino_smart_plants.ino` |
| micro:bit MakeCode notes | `https://robbew.github.io/smartplants/firmware/microbit_smart_plants_makecode.md` | `projectsmartplants/firmware/microbit_smart_plants_makecode.md` |
| micro:bit Python firmware | `https://robbew.github.io/smartplants/firmware/microbit_smart_plants_python.py` | `projectsmartplants/firmware/microbit_smart_plants_python.py` |
| Example CSV | `https://robbew.github.io/smartplants/data/sample_soil_moisture_log.csv` | `projectsmartplants/data/sample_soil_moisture_log.csv` |
| CSV template | `https://robbew.github.io/smartplants/data/template_soil_moisture_measurements.csv` | `projectsmartplants/data/template_soil_moisture_measurements.csv` |

## Current cross-link update list

When updating the curriculum tree on another project landing page, add Smart Plants before Robothand:

```html
<a class="tree-node" href="https://robbew.github.io/smartplants/" target="_blank" rel="noopener">
  Smart Plants
</a>
```

Projects whose local source was checked and whose landing-page tree should gain this entry:

| Project | Local landing source | Current public base |
| --- | --- | --- |
| Project Wind | `Project Wind J2/Website/index.html` | `https://robbew.github.io/projectwind/` |
| Project Fijnstof | `Project Fijnstof/index.html` | `https://robbew.github.io/projectfijnstof/` |

The source tree in Smart Plants already includes itself in the correct place before Robothand. Once it is online, other project pages can use the public base URL above.

## Linking rules

1. Use the exact lower-case GitHub repository path in public links: `/smartplants/`.
2. Keep the trailing slash on project landing pages.
3. Use `.html` for static subpages until a future rewrite adds directory routes.
4. Use absolute URLs for links between separate projects.
5. Use relative URLs for links inside one project: `platform.html`, `evaluatie.html`, `media/...`, `firmware/...`.
6. Do not use local drive paths, `file:///` URLs or `/projectsmartplants/...` paths in public HTML.
7. Retain `target="_blank" rel="noopener"` for links that leave the current project; internal pupil workflow links should stay in the same tab.

## Publication structure

```text
repository root
|-- .github/workflows/deploy-pages.yml
|-- projectsmartplants/          <- only this folder is deployed
|   |-- index.html               <- /smartplants/
|   |-- platform.html            <- /smartplants/platform.html
|   |-- evaluatie.html           <- /smartplants/evaluatie.html
|   |-- media/
|   |-- firmware/
|   |-- data/
|   `-- vendor/
`-- Background_Documents/        <- repository documentation, not public site content
```

The GitHub Actions workflow uploads `projectsmartplants/` as the Pages artifact. This means the landing page is published at the project root even though the workspace contains background material and sister-project references.
