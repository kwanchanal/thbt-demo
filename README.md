# THBT landing page demo

Internal demo of the THBT branding landing page. Plain HTML + CSS, no build step, served from GitHub Pages at
https://kwanchanal.github.io/thbt-demo/

## Structure

```
index.html
assets/css/styles.css   # design tokens are CSS custom properties in :root
assets/img/                # wallet screen, coins/, swap/ (tutorial screens)
assets/js/                 # i18n.js, header.js, hero3d.js, story.js, swap.js, news.js, options.js (design options panel)
assets/i18n/               # th.js, ru.js, my.js translations
.nojekyll
.github/workflows/deploy.yml
```

## Run locally

Open `index.html` with VS Code Live Server, or:

```bash
python3 -m http.server 8000   # http://localhost:8000
```

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which publishes the repo as-is to GitHub Pages.
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Languages (EN / TH / RU / MY)

- English is written directly in `index.html`. It is the default and the fallback for anything not translated.
- Translations live in `assets/i18n/th.js`, `ru.js`, `my.js`. Each key has the English text in a comment above it; fill in the `""`. Empty strings fall back to English.
- When a language is finished, set `ready: true` for it in `assets/js/i18n.js` to enable its button.
- Preview any language before it's ready with `?lang=th` (or `ru`, `my`).
- Adding new text: put `data-i18n="section.key"` on the element (add `data-i18n-html` if it contains markup), or `data-i18n-attr="alt:section.key"` for attributes, then add the same key to each language file.
- Thai and Myanmar load Noto Sans Thai / Noto Sans Myanmar from Google Fonts only when chosen.

## Rules

- Always use relative paths (`assets/...`), never paths starting with `/` — the site lives under `/thbt-demo/`.
- The demo is `noindex` and labelled "Demo" until legal sign-off.
