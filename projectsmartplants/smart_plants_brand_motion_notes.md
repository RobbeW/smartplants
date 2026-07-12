# Smart Plants brand, copyright and motion notes

Datum: 2026-07-07

Bronnen:
- `projectsmartplants/index.html`
- `projectsmartplants/style.css`
- Controle tegen `projectsmartplants/platform.html`

## Copyright en auteur

De landingspagina gebruikt bovenaan een HTML-comment:

```html
Project Smart Plants
Copyright (c) 2026 Robbe Wulgaert
```

In de `<head>` staan ook:

- `author`: `Robbe Wulgaert, AI in de Klas, robbewulgaert.be`
- `copyright`: `Copyright (c) 2026 Robbe Wulgaert`

De footer gebruikt dezelfde lijn in leerlingvriendelijke vorm:

```text
Auteur: Robbe Wulgaert - AI in de Klas - robbewulgaert.be
(c) 2026 Robbe Wulgaert. Alle rechten voorbehouden.
```

Richtlijn: elke publieke HTML-pagina krijgt dezelfde auteur- en copyrightmetadata. Zichtbare footertekst mag korter zijn, maar moet Robbe Wulgaert, AI in de Klas, robbewulgaert.be en (c) 2026 bevatten.

## Brand colours

De visuele identiteit komt vooral uit `style.css`.

Belangrijkste kleuren:

- Brand purple: `#5200FF`
- Brand dark: `#3700B3` of in een latere landing-afstemming `#3a00b8`
- Ink / diepe tekstkleur: `#160033`
- Soft brand background: `#f7f3ff`
- Accent mint: `#3dffd0`
- Landing accent in een ouder blok: `#03ddef`
- Surface: `#ffffff`
- Warm page background: `#f8f7f3` / `#fbfaf7`
- Muted text: ongeveer `#625b70` of `#657286`

Richtlijn: primaire acties, actieve stappen en merkmarkeringen gebruiken brand purple. Secundaire knoppen blijven wit met paarse rand. Mint wordt alleen gebruikt als focus/accent, niet als dominante pagina-kleur.

## Font family en typografie

De basisfont is:

```css
system-ui, -apple-system, "Segoe UI", Arial, sans-serif
```

De pagina gebruikt stevige gewichten voor navigatie, knoppen, labels en kaarttitels. Letter spacing blijft `0`. Grote `clamp()`-groottes horen bij de hero en sectietitels, niet bij compacte platformpanelen.

Richtlijn: platform en landing moeten dezelfde systeemfontfamilie gebruiken. Platformkoppen blijven compacter dan de landing hero.

## Animatie en transities

De gedeelde motion-laag gebruikt:

- `--motion-fast: 150ms`
- `--motion-medium: 260ms`
- `--motion-slow: 520ms`
- `--ease-standard: cubic-bezier(0.2, 0, 0, 1)`
- `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`

Belangrijke patronen:

- `smartplants-soft-rise`: subtiele fade + 12px omhoog voor landingsecties, actieve platformstappen en modals.
- `smartplants-fade-in`: lichte fade voor overlays.
- Hover op kaarten en meetpanelen: kleine `translateY(-3px)` met zachtere schaduw.
- Platformstappen: `translateY(-2px)` bij hover/focus, actieve stap blijft paars.
- `prefers-reduced-motion: reduce` schakelt animatie- en transitieduur praktisch uit.

Richtlijn: beweging moet de leerling helpen orienteren tussen stappen. Geen drukke loops, geen decoratieve beweging die met meten of lezen concurreert.

## Controle platform.html

Voor de controle is `platform.html` vergeleken met bovenstaande punten.

Aangepast:

- Copyrightcomment toegevoegd bovenaan.
- Charset en viewport gelijkgezet met de landingspagina.
- Auteur- en copyrightmetadata toegevoegd.
- Beschrijving herschreven in dezelfde toon als de landing.
- Skip-link toegevoegd naar de hoofdinhoud.
- Platformkop gekoppeld aan de merkstructuur met `brand-link`, `brand-mark`, `brand-copy`, `brand-title` en `brand-subtitle`.
- Footer gelijkgetrokken met de copyrightformule van de landing.

Bewust behouden:

- `body class="app-page"` blijft de bron voor platformkleuren, fontfamilie en motion.
- De workflowstappen en meetmodules blijven in `platform.html`; de animaties blijven in `style.css`, zodat platform en landing dezelfde motionregels delen.
