import { test, expect } from '@playwright/test';

test('renders trending videos from the Invidious API', async ({ page, request }) => {
  const apiBase = process.env.INVIDIOUS_API_BASE_URL;
  expect(apiBase, 'INVIDIOUS_API_BASE_URL must be set (copy .env.example to .env)').toBeTruthy();

  const apiRes = await request.get(`${apiBase}/api/v1/trending`);
  expect(apiRes.ok()).toBeTruthy();
  const videos = (await apiRes.json()) as { title: string; videoId: string }[];
  expect(videos.length).toBeGreaterThan(0);

  const first = videos[0]!;

  await page.goto('/');

  await expect(page.getByText(first.title).first()).toBeVisible();
  await expect(page.locator(`a[href="/watch?v=${first.videoId}"]`)).toBeVisible();
});
