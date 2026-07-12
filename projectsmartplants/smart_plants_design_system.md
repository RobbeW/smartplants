# Smart Plants UI, brand and motion system

Status: canonical reference for future AI in de Klas project pages.

Sources checked on 2026-07-10:

- `projectsmartplants/index.html`
- `projectsmartplants/platform.html`
- `projectsmartplants/evaluatie.html`
- `projectsmartplants/style.css`

## Purpose and tone

Smart Plants is a practical classroom project, not a product landing page. The visual system should help pupils start an experiment, move through it and understand their own measurements. The tone is direct, calm and concrete. Use short Dutch sentences, active verbs and examples from the actual setup. Do not use abstract claims such as "betekenisvol maken", "van data naar inzicht" or "betrouwbaar besluit" without saying what pupils must look at or do.

Preferred language:

- "Meet droog en nat. Gebruik vochtig als controle."
- "Kijk of je meetpunten bij elkaar passen."
- "Schrijf op wat je cijfers tonen."

Avoid vague process language, marketing language, warnings repeated in ordinary task text, and decorative labels that do not help a pupil choose an action.

## Ownership, copyright and metadata

Every public HTML page must include this HTML comment near the top:

```html
<!--
  Project Smart Plants
  Copyright (c) 2026 Robbe Wulgaert
-->
```

Every `<head>` must include:

```html
<meta name="author" content="Robbe Wulgaert, AI in de Klas, robbewulgaert.be" />
<meta name="copyright" content="Copyright (c) 2026 Robbe Wulgaert" />
```

Visible footer formula:

```text
Auteur: Robbe Wulgaert - AI in de Klas - robbewulgaert.be
(c) 2026 Robbe Wulgaert. Alle rechten voorbehouden.
```

On compact pages the same information may be one line. Do not remove the author, organisation, website, year or rights statement.

## Publication URL rule

The Smart Plants public base URL is `https://robbew.github.io/smartplants/`. Public HTML pages receive a canonical URL in their `<head>`. Internal links, stylesheets, scripts, images and downloads use relative paths, never root-absolute paths such as `/style.css`. Relative paths make a GitHub Pages project subpath work correctly.

## Typography

The only public type stack is:

```css
system-ui, -apple-system, "Segoe UI", Arial, sans-serif
```

Rules:

- use system text; no external webfont is required;
- use `letter-spacing: 0` for headings, labels, buttons and tables;
- use a strong weight for brand names, card titles, navigation and actions;
- reserve hero scale for a real landing hero only;
- keep headings compact inside the platform, dialogs, scorecards and sidebars;
- do not scale normal interface text with viewport width.

| Role | Use |
| --- | --- |
| Brand title | Project name in header; strong but not promotional |
| Hero title | One clear assignment or project name |
| Section title | A practical classroom question or action |
| Eyebrow / kicker | Short context only, never a slogan |
| Body text | Direct instruction or a concrete observation |
| Field label | Exact school vocabulary, with a `?` help control where needed |

## Core colour system

Use CSS variables rather than inserting colours ad hoc. The effective Smart Plants palette is:

| Token | Hex | Use |
| --- | --- | --- |
| `--brand` | `#5200FF` | Main actions, active states, links, brand mark |
| `--brand-dark` | `#3700B3` | Pressed state, dark brand text, stronger contrast |
| `--brand-soft` / `--brand-softer` | `#F7F3FF` | Selected surfaces, quiet purple panels |
| `--accent` | `#3DFFD0` | Small mint highlight and focus accent, never a page background |
| `--ink` | `#160033` | Brand ink, strong headings and footer text |
| `--text` | `#1D1930` | Standard platform body text |
| `--muted` | `#625B70` | Supporting copy and quiet labels |
| `--bg` | `#F8F7F3` | Warm page background |
| `--surface` | `#FFFFFF` | Cards, modules, dialogs and inputs |
| `--line` | `#E2DDEA` | Borders, dividers and inactive outlines |
| `--danger` | `#D0006F` | Destructive platform state; evaluation uses `#B42318` |
| `--warning` | `#FFB000` | Attention state only |
| success display | `#00A66A` or the brand purple | Good state; do not introduce a large green colour system |

Supporting surface shades are allowed only for hierarchy: `#F1ECFF`, `#EEE7FF`, `#EFE8FF`, `#EFE9FF`, `#F0E8FF`, `#FBFAFF`, `#FFF7DB`, `#FFF8E8`, `#FFF1F7`, `#FFF2F7`, `#F1FBF6` and `#DFFFF7`. They are subtle backgrounds, never primary actions.

Legacy colours found in earlier landing styles (`#03DDEF`, `#3A00B8`, `#F4F6F8`, `#17212F`, `#657286`, `#D8E0EA`) are compatibility values. New work should use the core palette above unless it is deliberately matching an older shared component.

Do not create a one-colour purple page. Purple identifies the project; warm white, ink, muted text and occasional mint keep scanning comfortable.

## Surfaces, borders and elevation

- Page sections are unframed bands or constrained layouts, not floating cards.
- Use cards for repeated content, tools, dialogs and individual score criteria.
- Card and modal radius: `8px` maximum.
- Main shadow: `0 12px 34px rgba(15, 23, 42, 0.08)`.
- Softer landing shadow: `0 18px 55px rgba(32, 20, 54, 0.10)`.
- Borders use `--line`; avoid heavy grey boxes.
- Keep content wide enough for repeated classroom use: `--max-width: 1180px`.

## Buttons, links and controls

- Primary action: purple fill, white text. Use for one obvious next action.
- Secondary action: white surface with purple border/text.
- Destructive action: danger colour and explicit wording.
- Use icons for compact utility controls when a familiar icon exists; keep text on clear commands such as "Start meting" or "Vergroot grafiek".
- Every control has a visible keyboard focus state. Focus uses a high-contrast purple/mint treatment.
- Buttons and their labels must not resize a panel when their state changes.
- Avoid pill-shaped content cards. Pills are acceptable for short status tags and the language toggle only.

## Layout patterns

### Landing page

- The first viewport shows the project name or literal assignment, a real project image and the main action.
- The next section must remain slightly visible on desktop and mobile.
- Navigation stays short: task, curriculum, teacher information and the important routes.
- Real photos show the setup, pupils or material. Do not replace them with abstract gradients or stock-like atmosphere.
- The curriculum tree is a navigation aid, not a decorative illustration.

### Platform

- The platform is a workflow with six separate panels: predict, build, calibrate, measure, analyse, conclude.
- Show one active step at a time. Keep previous/next controls available.
- Group controls by the pupil's current task. Do not place every possible control in one long first view.
- Explain school vocabulary with a small `?` button and plain, twelve-year-old language.
- Use modals only for enlarged diagrams, help, report settings and the enlarged chart.
- Keep data graph labels crisp and short. On hover, show only the score and the soil determination.

### Evaluation

- The teacher page is a compact observation tool, not a second landing page.
- Make score criteria concrete and observable: the wiring, calibration, data and conclusion.
- Local-only storage and export are stated plainly.

## Motion system

Use these shared tokens:

```css
--motion-fast: 150ms;
--motion-medium: 260ms;
--motion-slow: 520ms;
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
```

| Pattern | Behaviour | Use |
| --- | --- | --- |
| `smartplants-soft-rise` | fade in and rise by 12px | entering a section, active workflow panel or modal |
| `smartplants-fade-in` | small opacity transition | overlay and background state |
| Card hover | `translateY(-3px)` and a slightly stronger shadow | landing cards and interactive panels |
| Step hover | `translateY(-2px)` | workflow navigation |
| Control transition | colour, border, shadow and transform over about 160ms | buttons and inputs |

Movement explains a change of context. It must never compete with reading a table, entering data or inspecting a graph. No looping decorative motion, gradient orbs, bouncing imagery or surprise layout shifts.

Always include:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Accessibility and quality gate

Before reusing this system, check:

- page language is `nl-BE` unless a real translated page is supplied;
- a skip link reaches the main content;
- every informative image has a useful `alt` text;
- dialogs use `role="dialog"`, `aria-modal="true"` and a close control;
- no text overlaps at narrow or wide widths;
- hover-only information remains available by keyboard or in the normal layout;
- colour is never the only way to explain dry, moist or wet;
- reduced-motion preference works;
- local assets and vendor scripts load without a network connection.

## Reuse checklist

1. Begin with the same font stack and core variables.
2. Add author, copyright and footer formula.
3. Use an actual project image before decorative artwork.
4. Choose one primary action per screen area.
5. Keep language practical and age-appropriate.
6. Add only motion that signals a state change.
7. Test keyboard focus, reduced motion, mobile text wrapping and offline asset loading.
