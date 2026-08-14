# CLAUDE.md

## Commits

- **Never commit. The user commits manually.** You may stage files (`git add`) and leave a clean working tree ready, but never run `git commit`. If a commit is needed, stop and ask.
- `master` is protected — work lands on feature branches and via PRs. Current work branch: `astro-frontend` (no push, no PR until flagged as ready).

## Project layout

- `src/` — Crystal backend (Invidious). Untouched by current work; do not modify `src/`, `Makefile`, `shard.yml`, `docker-compose.yml`, or CI.
- `web/` — new Astro frontend PoC: SSR client of the existing `/api/v1/*` JSON API (BFF pattern, server-to-server fetch, no CORS). Runs on port 4321 in dev.
- `web/PAGES.md` — porting checklist for HTML routes; each ported page gets a Playwright test.

## Local backend

- `docker compose -p invidious -f /tmp/invidious-compose-3000.yml up -d` — repo's compose file with a random `hmac_key` substituted (the shipped `CHANGE_ME!!` is hard-rejected at startup by `src/invidious/config.cr:275-278`).
- Serves on `http://localhost:3000`; `web/.env` → `INVIDIOUS_API_BASE_URL=http://localhost:3000`.

## Testing the frontend

- `cd web && npx playwright test` — boots its own dev server (must run from `web/`, else npx resolves the wrong package).
- `npm run dev` / `npm run build` inside `web/`.
