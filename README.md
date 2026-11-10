# THBT landing page demo

Internal demo of the THBT branding landing page. Static Next.js export served from GitHub Pages at
https://kwanchanal.github.io/thbt-demo/

## Run locally

```bash
npm ci
npm run dev        # http://localhost:3000 (no base path in dev)
npm run build      # static export to ./out with base path /thbt-demo
```

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which builds and publishes `./out` to GitHub Pages.
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Rules

- Reference files in `public/` with `withBase('/file.ext')` from `src/lib/withBase.ts` — never hard-code `/file.ext`.
- `public/.nojekyll` must stay so GitHub Pages serves the `_next/` folder.
- The demo is `noindex` and labelled "Demo" until legal sign-off.
