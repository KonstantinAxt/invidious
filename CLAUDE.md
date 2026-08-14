# CLAUDE.md

## Commits

- **Commit only when the user explicitly says so.** You may stage files (`git add`) and leave a clean working tree ready at any time, but never run `git commit` unless the user has explicitly instructed you to commit in that moment.
- `master` is protected — work lands on feature branches and via PRs. Current work branch: `astro-frontend` (no push, no PR until flagged as ready).

## Project layout

- `src/` — Crystal backend (Invidious). Untouched by current work; do not modify `src/`, `Makefile`, `shard.yml`, `docker-compose.yml`, or CI.
- `web/` — new Astro frontend PoC: SSR client of the existing `/api/v1/*` JSON API (BFF pattern, server-to-server fetch, no CORS). Runs on port 4321 in dev.
- `web/PAGES.md` — porting checklist for HTML routes; each ported page gets a Playwright test.

## Local backend

- `docker compose -p invidious -f /tmp/invidious-compose-3000.yml up -d` — repo's compose file with a random `hmac_key` substituted (the shipped `CHANGE_ME!!` is hard-rejected at startup by `src/invidious/config.cr:275-278`).
- Serves on `http://localhost:3000`; `web/.env` → `INVIDIOUS_API_BASE_URL=http://localhost:3000`.

## Frontend (web/) verification

From `web/`, run `npm run check && npm run typecheck` before handing work off:

- `npm run check` — Biome lint + format
- `npm run typecheck` — `astro check`
- `npm run build-storybook` — Storybook static build
- `npx playwright test` — e2e (boots its own dev server on :4321)
- `npm run storybook` — Storybook dev on :6006 (manual visual check of components)

Must run from `web/` (else npx resolves the wrong package). `npm run dev` / `npm run build` serve the app itself.
