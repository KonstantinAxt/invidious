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
- **Design**: the UI follows the community "YouTube Redesign" look and feel
  (Figma file `YkSsZ5epnJf4eGcINMBD00`): near-black canvas, pink accent, pill
  controls, 16px-rounded thumbnails, Roboto. **Dark is the default theme**;
  light is a derived inversion (`data-theme="light"`), cycled via the
  ThemeToggle. No webfont download — `Roboto, system-ui, sans-serif`.
- **Ported pages**: home (trending), watch, search, channel (home tab) and
  playlist. Watch uses API text fields (`viewCountText`/`publishedText`);
  home formats numbers/dates locally via the locale system.
- **Out of scope for now**: auth/session/cookie forwarding through the BFF —
  only unauthenticated endpoints are consumed. Needed before porting any
  login-gated page (preferences, playlists, subscriptions…). The 857-line
  `player.js` (video.js) port is also out of scope — `Player.astro` is a
  markup-only native `<video>` wrapper: regular videos get a poster frame
  (adaptive streams are split audio/video, which native `<video>` can't mux);
  live videos get their HLS URL where available. Comments are read-only.
  See [PAGES.md](PAGES.md) for the full porting checklist.

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
>
> **Companion**: `/api/v1/videos/:id` (the watch page) requires
> invidious-companion. Add it to the copy's services:
>
> ```yaml
>   invidious-companion:
>     image: quay.io/invidious/invidious-companion
>     environment:
>       SERVER_SECRET_KEY: "0123456789abcdef"
> ```
>
> and in `INVIDIOUS_CONFIG`:
>
> ```yaml
>         invidious_companion:
>           - private_url: "http://invidious-companion:8282/companion"
>         invidious_companion_key: "0123456789abcdef"
> ```
>
> (the key must be exactly 16 chars and match on both sides).

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

Six specs cover the ported pages — each cross-checks rendered data against the
raw API JSON (`trending`, `components`, `watch`, `search`, `channel`,
`playlist`). As each page from [PAGES.md](PAGES.md) gets ported, it gets one
Playwright test alongside it — the suite grows with the port.

## Syncing locales

The 63 locale JSONs in `locales/` are vendored from the repo root (Crystal's
`locales/`). Re-sync manually when upstream translations change:

```sh
cp ../../locales/*.json locales/
```

New UI strings introduced by the redesign (Share, Reply, Up next, channel tabs,
filter labels, …) don't exist upstream. They live in
`src/lib/i18n/overrides.ts` and are merged on top of every loaded locale, so
they never render as raw keys and non-English locales fall back to English.
If a key later appears in a vendored locale, remove it from OVERRIDES so the
translation wins again.
