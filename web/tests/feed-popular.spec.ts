import { expect, test } from '@playwright/test'

test('renders the popular feed with the sidebar active state', async ({ page, request }) => {
  const apiBase = process.env.INVIDIOUS_API_BASE_URL
  if (!apiBase) throw new Error('INVIDIOUS_API_BASE_URL must be set (copy .env.example to .env)')

  const apiRes = await request.get(`${apiBase}/api/v1/popular`)
  expect(apiRes.ok()).toBeTruthy()
  const videos = (await apiRes.json()) as { title: string; videoId: string }[]

  await page.goto('/feed/popular')

  await expect(page.locator('.sidebar-item.active')).toHaveAttribute('href', '/feed/popular')
  await expect(page.locator('.section-title')).toBeVisible()

  // Popular can legitimately be empty on a zero-user instance — the grid only
  // renders visible rows when the API has data.
  const first = videos[0]
  if (first) {
    await expect(page.locator('.video-grid')).toBeVisible()
    await expect(page.getByText(first.title).first()).toBeVisible()
    await expect(page.locator(`a[href="/watch?v=${first.videoId}"]`).first()).toBeVisible()
  }
})
