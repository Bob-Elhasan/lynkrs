# Lynkrs

The Lynkrs marketing site — a Next.js (App Router) static export, deployed to GitHub Pages.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Building

```bash
npm run build
```

This produces a static export in `out/` (`next.config.ts` sets `output: "export"`). Fonts are self-hosted via `next/font`, so there are no external font requests at runtime.

## Deployment

Pushing to `main` runs `.github/workflows/deploy-pages.yml`, which builds the static export and publishes it to GitHub Pages via `actions/deploy-pages`. In the repository settings, **Pages → Source** must be set to **GitHub Actions** for this to take effect.

The workflow sets `PAGES_BASE_PATH` from `actions/configure-pages`, which `next.config.ts` reads into `basePath` — so the build works whether the site is served from a custom domain (empty base path) or from `https://<owner>.github.io/lynkrs/` (base path `/lynkrs`).

## Logo

The nav and footer currently show a text wordmark ("Lynkrs.") in `src/components/Header.tsx` and `src/components/Footer.tsx`, not the brand's PNG logo. Add the real file at `public/logo.png` and swap both components back to a `next/image` `<Image>` tag to restore it.
