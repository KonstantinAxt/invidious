# web/ — Astro frontend for Invidious (proof of concept)

A new UI for Invidious built as a pure client of the existing Crystal backend's
public JSON API (`/api/v1/*`). Crystal is **untouched** — Astro is a separate,
self-contained project in this directory, added as a new consumer of the API.

## Architecture

- **BFF / SSR**: Astro runs in SSR mode (`output: 'server'`, `@astrojs/node`
  adapter). Pages fetch from the Crystal API server-side
  (`src/lib/invidious-api.ts`, called from `.astro` frontmatter). The browser
  only talks to Astro's origin; Crystal is reached server-to-server, so **no
  CORS configuration is needed anywhere**.
- **No backend rewrite**: signature/stream extraction and the JSON API stay in
  Crystal / invidious-companion exactly as they are. Thumbnail `<img>` tags
  point at the API base URL directly (`resolveApiUrl()`); plain image loads
  don't require CORS.
- **Caching**: Crystal already caches YouTube data in Postgres. On top of that,
  `invidious-api.ts` keeps an in-process TTL cache (60s per endpoint+params) to
  collapse repeat navigations without adding Redis/CDN infra — sized for a
  single-user self-hosted instance.
- **Components**: `src/components/` holds presentational, props-driven
  components (design tokens in `src/styles/tokens.css`, vanilla CSS). Pages
  fetch data and resolve URLs; components never fetch. i18n: locale JSONs are
  vendored into `locales/` (see below), loaded lazily per render; `locale` is
  passed down as a prop.
- **Out of scope for now**: auth/session/cookie forwarding through the BFF —
  only unauthenticated endpoints are consumed. Needed before porting any
  login-gated page (preferences, playlists, subscriptions…). The 857-line
  `player.js` (video.js) port is also out of scope — `Player.astro` is a
  markup-only native `<video>` wrapper. See [PAGES.md](PAGES.md) for the full
  porting checklist.

## Setup

```sh
npm install
cp .env.example .env   # then adjust INVIDIOUS_API_BASE_URL if needed
```

## Running the backend (Crystal, untouched)

From the repo root:

```sh
docker compose up -d
```

> **Known gotcha**: the repo's dev `docker-compose.yml` ships
> `hmac_key: "CHANGE_ME!!"`, which this source version hard-rejects at startup
> (`src/invidious/config.cr:275-278` exits on any `CHANGE_ME!!` value). Run it
> from a copy with a real key instead of touching the repo file:
>
> ```sh
> sed "s|hmac_key: \"CHANGE_ME!!\"|hmac_key: \"$(openssl rand -hex 32)\"|" \
>   docker-compose.yml > /tmp/invidious-compose.yml
> docker compose -p invidious -f /tmp/invidious-compose.yml up -d
> ```

Check it's serving:

```sh
curl http://localhost:3000/api/v1/trending   # real video JSON, may take a few seconds on first call
```

## Running the frontend

```sh
npm run dev          # Astro SSR dev server on http://localhost:4321
npm run build        # production build (node adapter, standalone)
npm run preview      # serve the production build
```

## Storybook

```sh
npm run storybook         # dev UI on http://localhost:6006 — browse components per story
npm run build-storybook   # static build (storybook-static/)
```

Stories live next to their components (`src/**/*.stories.tsx`, CSF3). Components
are dumb (props in, markup out), so stories pass plain fixture data from
`src/stories/fixtures.ts` — no env, no fetches. SSR-rendered stories don't
hot-update on arg changes; rebuild to see edits.

## Linting, formatting, type checking

```sh
npm run check       # Biome: lint + format (biome check .)
npm run format      # Biome: format in place
npm run typecheck   # astro check (type diagnostics for .astro/.ts)
```

Biome covers TS/TSX/JS and `.astro` (experimental support, config in
`biome.json`); `locales/` and build outputs are excluded.

## Tests

```sh
npx playwright test  # boots the dev server itself, hits it at 127.0.0.1:4321
```

The config loads `.env` into the test process and sets `ASTRO_DEV_BACKGROUND=1` so
astro runs in the foreground (otherwise it auto-daemonizes in agent environments
and Playwright sees an early exit).

Two specs cover the one ported page: `tests/trending.spec.ts` (real data
cross-checked against the raw `/api/v1/trending` JSON) and
`tests/components.spec.ts` (navbar + video grid rendering). As each page from
[PAGES.md](PAGES.md) gets ported, it gets one Playwright test alongside it —
the suite grows with the port.

## Syncing locales

The 63 locale JSONs in `locales/` are vendored from the repo root (Crystal's
`locales/`). Re-sync manually when upstream translations change:

```sh
cp ../../locales/*.json locales/
```
