import { type APIRequestContext, expect, test } from '@playwright/test'

// Trending rotates and some channels expose no video listing — pick the
// first trending channel whose /videos endpoint is non-empty.
async function pickChannelWithVideos(request: APIRequestContext, apiBase: string) {
  const trendingRes = await request.get(`${apiBase}/api/v1/trending`)
  expect(trendingRes.ok()).toBeTruthy()
  const trending = (await trendingRes.json()) as { authorId: string }[]

  for (const item of trending.slice(0, 10)) {
    const res = await request.get(`${apiBase}/api/v1/channels/${item.authorId}/videos`)
    if (!res.ok()) continue
    const { videos } = (await res.json()) as { videos: unknown[] }
    if (videos.length > 0) return item.authorId
  }
  return null
}

test('renders the channel page from the Invidious API', async ({ page, request }) => {
  const apiBase = process.env.INVIDIOUS_API_BASE_URL
  if (!apiBase) throw new Error('INVIDIOUS_API_BASE_URL must be set (copy .env.example to .env)')

  const ucid = await pickChannelWithVideos(request, apiBase)
  if (!ucid) throw new Error('no trending channel with videos found')

  const channelRes = await request.get(`${apiBase}/api/v1/channels/${ucid}`)
  expect(channelRes.ok()).toBeTruthy()
  const channel = (await channelRes.json()) as { author: string }

  const videosRes = await request.get(`${apiBase}/api/v1/channels/${ucid}/videos`)
  expect(videosRes.ok()).toBeTruthy()
  const { videos } = (await videosRes.json()) as { videos: unknown[] }

  await page.goto(`/channel/${ucid}`)

  await expect(page.getByText(channel.author).first()).toBeVisible()
  const grid = page.locator('.video-grid')
  await expect(grid).toBeVisible()
  await expect(grid.locator('article')).toHaveCount(videos.length)
  await expect(page.locator('.channel-header .tabs a').first()).toBeVisible()
})

test('channel continuation page renders with First page nav', async ({ page, request }) => {
  const apiBase = process.env.INVIDIOUS_API_BASE_URL
  if (!apiBase) throw new Error('INVIDIOUS_API_BASE_URL must be set (copy .env.example to .env)')

  const ucid = await pickChannelWithVideos(request, apiBase)
  if (!ucid) throw new Error('no trending channel with videos found')

  const res = (await (await request.get(`${apiBase}/api/v1/channels/${ucid}/videos`)).json()) as {
    videos: unknown[]
    continuation?: string
  }
  if (!res.continuation) return // channel has a single page — nothing to assert

  await page.goto(`/channel/${ucid}?continuation=${encodeURIComponent(res.continuation)}`)

  const nav = page.locator('.pagination')
  await expect(nav).toBeVisible()
  await expect(nav.locator('a', { hasText: 'First page' })).toHaveAttribute(
    'href',
    `/channel/${ucid}`,
  )
  await expect(page.locator('.video-grid article').first()).toBeVisible()
})
