# Page inventory

Source of truth: `src/invidious/routing.cr` (scanned 2026-08-14). This is the porting checklist for the Astro frontend — each checked box = page ported + Playwright test written. Order within each section is the suggested porting order (public, no-auth pages first).

Legend:
- `[ ]` not ported / `[x]` ported (page + Playwright test)
- 🔒 login-gated (needs BFF auth/session forwarding — currently out of scope)
- Backing API column: the `/api/v1/*` endpoint that returns the page's data, where one exists.

## Public pages (no auth) — port first

| Status | Route | Backing API |
|--------|-------|-------------|
| [ ] | `/` (home) | `/api/v1/trending` + `/api/v1/popular` |
| [ ] | `/feed/popular` | `/api/v1/popular` |
| [ ] | `/feed/trending` | `/api/v1/trending` |
| [ ] | `/watch` | `/api/v1/videos/:id` + `/api/v1/comments/:id` |
| [ ] | `/search` (+ `/results` alias) | `/api/v1/search` (+ `/api/v1/search/suggestions`) |
| [ ] | `/hashtag/:hashtag` | `/api/v1/hashtag/:hashtag` |
| [ ] | `/playlist` | `/api/v1/playlists/:plid` |
| [ ] | `/mix` | `/api/v1/mixes/:rdid` |
| [ ] | `/watch_videos` | `/api/v1/playlists/:plid` |
| [ ] | `/channel/:ucid` (+ `/channel/:ucid/home`) | `/api/v1/channels/:ucid` |
| [ ] | `/channel/:ucid/videos` | `/api/v1/channels/:ucid/videos` |
| [ ] | `/channel/:ucid/shorts` | `/api/v1/channels/:ucid/shorts` |
| [ ] | `/channel/:ucid/streams` | `/api/v1/channels/:ucid/streams` |
| [ ] | `/channel/:ucid/podcasts` | `/api/v1/channels/:ucid/podcasts` |
| [ ] | `/channel/:ucid/releases` | `/api/v1/channels/:ucid/releases` |
| [ ] | `/channel/:ucid/courses` | `/api/v1/channels/:ucid/courses` |
| [ ] | `/channel/:ucid/playlists` | `/api/v1/channels/:ucid/playlists` |
| [ ] | `/channel/:ucid/community` (+ `/channel/:ucid/posts`) | `/api/v1/channels/:ucid/community` |
| [ ] | `/channel/:ucid/channels` | `/api/v1/channels/:ucid/channels` |
| [ ] | `/channel/:ucid/about` | `/api/v1/channels/:ucid` |
| [ ] | `/channel/:ucid/live` (also `/user/:user/live`, `/c/:user/live`) | — |
| [ ] | `/post/:id` (community post) | `/api/v1/post/:id` + `/api/v1/post/:id/comments` |
| [ ] | `/clip/:clip` | `/api/v1/clips/:id` |
| [ ] | `/embed/:id` (minimal embed UI, not full page) | — |
| [ ] | `/privacy` (static content) | — |
| [ ] | `/licenses` (static content) | — |
| [ ] | `/login` (public page, but account flow) | — |

## Login-gated pages 🔒 (blocked on BFF auth forwarding)

| Status | Route | Notes |
|--------|-------|-------|
| [ ] | `/feed/subscriptions` | — |
| [ ] | `/feed/history` | — |
| [ ] | `/feed/playlists` (+ `/view_all_playlists` redirect) | — |
| [ ] | `/preferences` | — |
| [ ] | `/data_control` | — |
| [ ] | `/change_password` | — |
| [ ] | `/delete_account` | — |
| [ ] | `/clear_watch_history` | — |
| [ ] | `/authorize_token` | — |
| [ ] | `/token_manager` | — |
| [ ] | `/subscription_manager` | — |
| [ ] | `/create_playlist` | — |
| [ ] | `/subscribe_playlist` | — |
| [ ] | `/delete_playlist` | — |
| [ ] | `/edit_playlist` | — |
| [ ] | `/add_playlist_items` | — |
| [ ] | `/modify_notifications` | only registered if `enable_user_notifications` |

## Redirect/utility routes (not pages — port only if URLs must keep working)

`/redirect` (cross-instance redirect), `/channel/:ucid/*` (catch-all → channel home),
`/c/:user`, `/c/:user/:tab`, `/user/:user`, `/user/:user/:tab`, `/@:user`, `/@:user/:tab` (brand/handle → channel),
`/attribution_link`, `/attribution_link/:tab`, `/profile`, `/profile/*`,
`/watch/:id`, `/live/:id`, `/shorts/:id`, `/w/:id`, `/v/:id`, `/e/:id` (→ `/watch`), `/embed/` (→ embed of trending).

## Excluded (not HTML pages — never port)

- `/api/v1/*` — JSON API (stays in Crystal, consumed server-side by Astro).
- `/api/manifest/*`, `/videoplayback`, `/latest_version` — video playback proxy (player needs them as-is).
- `/ggpht/*`, `/sb/*`, `/s_p/*`, `/yts/img/*`, `/vi/*`, `/pl_c/*`, `/tvfilm_banner/*` — image/storyboard proxy (thumbnails/images keep pointing at Crystal).
- `/feed/channel/:ucid`, `/feed/private`, `/feed/playlist/:plid`, `/feeds/videos.xml` — RSS feeds.
- `/feed/webhook/:token` — PubSubHubbub webhook.
- `/opensearch.xml` — search descriptor XML.
- `/companion/*` — invidious-companion proxy.
- POST/other-only routes: `/signout`, `/watch_ajax`, `/download`, `/playlist_ajax`, `/token_ajax`, `/subscription_ajax`, `POST /search`, `POST /preferences`, etc. (handled wherever their pages are ported).
