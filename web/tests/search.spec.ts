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

test('search pagination: page param drives the results and nav', async ({ page }) => {
  const query = 'redesign'

  await page.goto(`/search?q=${query}&page=2`)

  await expect(page.locator('.result-row').first()).toBeVisible()
  const nav = page.locator('.pagination')
  await expect(nav).toBeVisible()
  await expect(nav.locator('a', { hasText: 'Previous page' })).toHaveAttribute(
    'href',
    `/search?q=${query}&page=1`,
  )
})

test('search pagination: Next navigates to the next page', async ({ page }) => {
  const query = 'music' // stable 20-result first page

  await page.goto(`/search?q=${query}`)
  await expect(page.locator('.result-row').first()).toBeVisible()

  const next = page.locator('.pagination a', { hasText: 'Next page' })
  await expect(next).toBeVisible()
  await next.click()
  await expect(page).toHaveURL(/page=2/)
  await expect(page.locator('.pagination a', { hasText: 'Previous page' })).toBeVisible()
})

test('search pagination: nav reflects whether a next page exists', async ({ page, request }) => {
  const apiBase = process.env.INVIDIOUS_API_BASE_URL
  if (!apiBase) throw new Error('INVIDIOUS_API_BASE_URL must be set (copy .env.example to .env)')

  const query = 'Ice Cube'
  const items1 = (await (
    await request.get(`${apiBase}/api/v1/search?q=${encodeURIComponent(query)}&page=1`)
  ).json()) as unknown[]
  const items2 = (await (
    await request.get(`${apiBase}/api/v1/search?q=${encodeURIComponent(query)}&page=2`)
  ).json()) as unknown[]

  await page.goto(`/search?q=${encodeURIComponent(query)}`)
  await expect(page.locator('.result-row').first()).toBeVisible()

  // A short first page (YouTube sometimes returns 19/20) must still show
  // Next when page 2 has items; only a truly empty page 2 hides the nav.
  if (items1.length >= 20 || items2.length > 0) {
    await expect(page.locator('.pagination a', { hasText: 'Next page' })).toBeVisible()
  } else {
    await expect(page.locator('.pagination')).toHaveCount(0)
  }
})
