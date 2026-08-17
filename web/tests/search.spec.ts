import { expect, test } from '@playwright/test'

test('renders search results from the Invidious API', async ({ page, request }) => {
  const apiBase = process.env.INVIDIOUS_API_BASE_URL
  if (!apiBase) throw new Error('INVIDIOUS_API_BASE_URL must be set (copy .env.example to .env)')

  const query = 'redesign'
  const apiRes = await request.get(`${apiBase}/api/v1/search?q=${query}`)
  expect(apiRes.ok()).toBeTruthy()
  const items = (await apiRes.json()) as { type: string; title: string; videoId: string }[]
  const videoIds = new Set(
    items.filter((item) => item.type === 'video').map((item) => item.videoId),
  )
  expect(videoIds.size).toBeGreaterThan(0)

  await page.goto(`/search?q=${query}`)

  await expect(page.locator('.result-row').first()).toBeVisible()

  // Live search results rotate between requests, so the page must render at
  // least one video from the API's response — not a specific first item.
  const hrefs = await page
    .locator('.results a[href^="/watch?v="]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''))
  const pageIds = hrefs.map((href) => href.split('v=')[1]).filter(Boolean)
  expect(pageIds.length).toBeGreaterThan(0)
  expect(pageIds.some((id) => videoIds.has(id))).toBeTruthy()
})
