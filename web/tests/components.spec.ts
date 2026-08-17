import { expect, test } from '@playwright/test'

test('renders navbar and video grid from the Invidious API', async ({ page, request }) => {
  const apiBase = process.env.INVIDIOUS_API_BASE_URL
  if (!apiBase) throw new Error('INVIDIOUS_API_BASE_URL must be set (copy .env.example to .env)')

  const apiRes = await request.get(`${apiBase}/api/v1/trending`)
  expect(apiRes.ok()).toBeTruthy()
  const videos = (await apiRes.json()) as {
    videoId: string
    lengthSeconds: number
    liveNow: boolean
  }[]
  expect(videos.length).toBeGreaterThan(0)
  const firstVideo = videos[0]
  if (!firstVideo) throw new Error('trending feed returned no videos')

  await page.goto('/')

  await expect(page.locator('#searchbox')).toBeVisible()
  await expect(page.locator('.navbar a[href="/"]')).toBeVisible()

  // Home feed: first 4 videos in the rail, the rest in the grid section.
  const railCount = Math.min(4, videos.length)
  await expect(page.locator('[data-rail]').first().locator('.rail-item')).toHaveCount(railCount)

  const grid = page.locator('.video-grid')
  if (videos.length > railCount) {
    await expect(grid).toBeVisible()
    await expect(grid.locator('article')).toHaveCount(videos.length - railCount)
  }

  const firstCard = page.locator('.rail-item article').first()
  await expect(firstCard.locator('a[href^="/watch?v="]').first()).toBeVisible()
  await expect(firstCard.locator('a[href^="/channel/"]').first()).toBeVisible()

  const thumb = firstCard.locator('.thumb img')
  await expect(thumb).toBeVisible()

  const imgSrc = await thumb.getAttribute('src')
  expect(imgSrc?.startsWith(apiBase)).toBeTruthy()

  if (!firstVideo.liveNow && firstVideo.lengthSeconds > 0) {
    await expect(firstCard.locator('.badge').first()).toHaveText(/^\d{0,2}:\d{2}(:\d{2})?$/)
  }
})
