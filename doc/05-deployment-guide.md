# Deployment Guide

The app is a static site (`build/`). Deploy to any static host.

## Build

```bash
bun run build
# Output: build/  (static, ready to deploy)
```

The build disables source maps (`GENERATE_SOURCEMAP=false`) due to the legacy `resolve-url-loader`/`source-map` toolchain limitation.

## Netlify (existing)

- Build command: `bun run build`
- Publish directory: `build`
- Environment variables: set in Netlify Dashboard → Site settings → Environment variables
- SPA fallback: `public/_redirects` (`/* /index.html 200`)

## Vercel

`vercel.json` is pre-configured:

- `installCommand`: `bun install`
- `buildCommand`: `bun run build`
- `devCommand`: `bun run dev`
- `outputDirectory`: `build`
- SPA rewrite + security headers included

## Local production preview

```bash
bun run build
bun run start   # serve -s build -l 3000
```

`serve` handles `SIGINT`/`SIGTERM` and exits cleanly.

## Environment variables in production

Set `REACT_APP_*` variables in your hosting dashboard — never commit them.

- Netlify: Site settings → Environment variables
- Vercel: Project settings → Environment variables

## Docker (optional)

No `Dockerfile` is included by default. The static `build/` can be served by any HTTP server (`serve`, nginx, Caddy).
