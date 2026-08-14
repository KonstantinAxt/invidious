# web/ — Astro frontend for Invidious (proof of concept)

A new UI for Invidious built as a pure client of the existing Crystal backend's
public JSON API (`/api/v1/*`). Crystal is **untouched** — Astro is a separate,
self-contained project in this directory, added as a new consumer of the API.

## Architecture (don't re-litigate)

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
- **Out of scope for now**: auth/session/cookie forwarding through the BFF —
  only unauthenticated endpoints are consumed. Needed before porting any
  login-gated page (preferences, playlists, subscriptions…). See
  [PAGES.md](PAGES.md) for the full porting checklist.

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

## Tests

```sh
npx playwright test  # boots the dev server itself, hits it at 127.0.0.1:4321
```

One smoke test exists (`tests/trending.spec.ts`) against the one ported page
(renders the trending feed, cross-checks real video data against the raw
`/api/v1/trending` JSON). As each page from [PAGES.md](PAGES.md) gets ported,
it gets one Playwright test alongside it — the suite grows with the port.
