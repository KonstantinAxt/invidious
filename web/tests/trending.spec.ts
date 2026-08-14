import { test, expect } from '@playwright/test';

// Smoke test for the PoC page: proves the full chain works —
// Astro SSR → fetch → Crystal /api/v1/trending → Postgres/YouTube → JSON → HTML.
// Asserts real video data renders, cross-checked against the raw API JSON,
// not just that the page returns 200.

test('renders trending videos from the Invidious API', async ({ page, request }) => {
  const apiBase = process.env.INVIDIOUS_API_BASE_URL;
  expect(apiBase, 'INVIDIOUS_API_BASE_URL must be set (copy .env.example to .env)').toBeTruthy();

  // Raw API data for the cross-check.
  const apiRes = await request.get(`${apiBase}/api/v1/trending`);
  expect(apiRes.ok()).toBeTruthy();
  const videos = (await apiRes.json()) as { title: string; videoId: string }[];
  expect(videos.length).toBeGreaterThan(0);

  const first = videos[0]!;

  await page.goto('/');

  // The page renders real data from the API: first video's title…
  await expect(page.getByText(first.title).first()).toBeVisible();
  // …and its watch link, so the render carries the video id through.
  await expect(page.locator(`a[href="/watch?v=${first.videoId}"]`)).toBeVisible();
});
