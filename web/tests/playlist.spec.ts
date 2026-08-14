import { expect, test } from '@playwright/test'

test('renders the playlist page from the Invidious API', async ({ page, request }) => {
  const apiBase = process.env.INVIDIOUS_API_BASE_URL
  if (!apiBase) throw new Error('INVIDIOUS_API_BASE_URL must be set (copy .env.example to .env)')

  const searchRes = await request.get(`${apiBase}/api/v1/search?q=redesign`)
  expect(searchRes.ok()).toBeTruthy()
  const items = (await searchRes.json()) as { type: string; playlistId: string }[]
  const playlist = items.find((item) => item.type === 'playlist')
  if (!playlist) return

  const playlistRes = await request.get(`${apiBase}/api/v1/playlists/${playlist.playlistId}`)
  expect(playlistRes.ok()).toBeTruthy()
  const detail = (await playlistRes.json()) as { title: string; videos: { title: string }[] }
  expect(detail.videos.length).toBeGreaterThan(0)

  await page.goto(`/playlist?list=${playlist.playlistId}`)

  await expect(page.getByText(detail.title).first()).toBeVisible()
  await expect(page.locator('.item-row')).toHaveCount(detail.videos.length)
  await expect(page.locator('.playlist-header .actions .pill').first()).toBeVisible()
})
