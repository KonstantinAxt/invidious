import { expect, test } from '@playwright/test'

test('renders search results from the Invidious API', async ({ page, request }) => {
  const apiBase = process.env.INVIDIOUS_API_BASE_URL
  if (!apiBase) throw new Error('INVIDIOUS_API_BASE_URL must be set (copy .env.example to .env)')

  const query = 'redesign'
  const apiRes = await request.get(`${apiBase}/api/v1/search?q=${query}`)
  expect(apiRes.ok()).toBeTruthy()
  const items = (await apiRes.json()) as { type: string; title: string; videoId: string }[]
  const videos = items.filter((item) => item.type === 'video')
  expect(videos.length).toBeGreaterThan(0)
  const first = videos[0]
  if (!first) throw new Error('search returned no videos')

  await page.goto(`/search?q=${query}`)

  await expect(page.locator('.result-row').first()).toBeVisible()
  await expect(page.getByText(first.title).first()).toBeVisible()
  await expect(page.locator(`a[href="/watch?v=${first.videoId}"]`).first()).toBeVisible()
})
