import { expect, test } from '@playwright/test'

test('renders the watch page from the Invidious API', async ({ page, request }) => {
  const apiBase = process.env.INVIDIOUS_API_BASE_URL
  if (!apiBase) throw new Error('INVIDIOUS_API_BASE_URL must be set (copy .env.example to .env)')

  const trendingRes = await request.get(`${apiBase}/api/v1/trending`)
  expect(trendingRes.ok()).toBeTruthy()
  const trending = (await trendingRes.json()) as { title: string; videoId: string }[]
  expect(trending.length).toBeGreaterThan(0)
  const first = trending[0]
  if (!first) throw new Error('trending feed returned no videos')

  const videoRes = await request.get(`${apiBase}/api/v1/videos/${first.videoId}`)
  expect(videoRes.ok()).toBeTruthy()
  const video = (await videoRes.json()) as {
    title: string
    viewCountText?: string
    recommendedVideos: { title: string; videoId: string }[]
  }

  await page.goto(`/watch?v=${first.videoId}`)

  await expect(page.getByText(video.title).first()).toBeVisible()
  await expect(page.locator('video.player')).toBeVisible()
  await expect(page.locator('.watch-title')).toHaveText(video.title)
  await expect(page.locator('.meta-row .meta')).toBeVisible()
  if (video.viewCountText) {
    await expect(page.getByText(video.viewCountText)).toBeVisible()
  }

  const railRows = page.locator('.suggestions li')
  await expect(railRows).toHaveCount(video.recommendedVideos.length)
  await expect(railRows.first().locator('a[href^="/watch?v="]')).toBeVisible()
})
