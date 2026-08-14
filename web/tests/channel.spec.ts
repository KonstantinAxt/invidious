import { expect, test } from '@playwright/test'

test('renders the channel page from the Invidious API', async ({ page, request }) => {
  const apiBase = process.env.INVIDIOUS_API_BASE_URL
  if (!apiBase) throw new Error('INVIDIOUS_API_BASE_URL must be set (copy .env.example to .env)')

  const trendingRes = await request.get(`${apiBase}/api/v1/trending`)
  expect(trendingRes.ok()).toBeTruthy()
  const trending = (await trendingRes.json()) as { author: string; authorId: string }[]
  expect(trending.length).toBeGreaterThan(0)
  const first = trending[0]
  if (!first) throw new Error('trending feed returned no videos')

  const channelRes = await request.get(`${apiBase}/api/v1/channels/${first.authorId}`)
  expect(channelRes.ok()).toBeTruthy()
  const channel = (await channelRes.json()) as { author: string }

  const videosRes = await request.get(`${apiBase}/api/v1/channels/${first.authorId}/videos`)
  expect(videosRes.ok()).toBeTruthy()
  const { videos } = (await videosRes.json()) as { videos: unknown[] }

  await page.goto(`/channel/${first.authorId}`)

  await expect(page.getByText(channel.author).first()).toBeVisible()
  const grid = page.locator('.video-grid')
  await expect(grid).toBeVisible()
  await expect(grid.locator('article')).toHaveCount(videos.length)
  await expect(page.locator('.channel-header .tabs a').first()).toBeVisible()
})
