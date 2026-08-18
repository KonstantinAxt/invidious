import { expect, test } from '@playwright/test'

// Fixed viewport: the grid's column count (and therefore the two-row cap)
// depends on the width — 1920px gives the design's 4 columns.
test.use({ viewport: { width: 1920, height: 1080 } })

test('renders the Explore-designed trending feed', async ({ page, request }) => {
  const apiBase = process.env.INVIDIOUS_API_BASE_URL
  if (!apiBase) throw new Error('INVIDIOUS_API_BASE_URL must be set (copy .env.example to .env)')

  const apiRes = await request.get(`${apiBase}/api/v1/trending`)
  expect(apiRes.ok()).toBeTruthy()
  const videos = (await apiRes.json()) as { title: string; videoId: string }[]
  expect(videos.length).toBeGreaterThan(0)
  const first = videos[0]
  if (!first) throw new Error('trending feed returned no videos')

  await page.goto('/feed/trending')

  // Sidebar: the design has no Trending entry — Explore is the active one.
  await expect(page.locator('.sidebar-item.active span')).toHaveText('Explore')

  // Figma 273:8750 header: gradient icon box + 28px title + "View all" pill.
  await expect(page.locator('.explore-header').first().locator('.explore-icon')).toBeVisible()
  await expect(page.locator('.explore-header h1')).toHaveText('Trending')
  await expect(page.locator('.explore-header').first().locator('.view-all')).toHaveText('View all')
  await expect(page.locator('.explore-header').first().locator('.view-all')).toHaveAttribute(
    'href',
    '/feed/trending?view=all',
  )

  // Figma 273:8756 primary tabs: Now selected, Gaming links to the gaming
  // type, and the unsupported tabs carry the Coming soon tooltip.
  await expect(page.locator('.tab.selected')).toHaveText('Now')
  await expect(page.locator('a.tab[href="/feed/trending?type=gaming"]')).toBeVisible()
  await expect(page.locator('.tab.tbd').first()).toHaveAttribute('title', /Coming soon/)

  // Sections show max two rows of cards (Figma 273:8764): 4 columns × 2.
  const grid = page.locator('[data-hero-section]').first().locator('.video-grid')
  await expect(grid).toBeVisible()
  await expect(grid.locator('article:visible')).toHaveCount(Math.min(8, videos.length))
  await expect(page.getByText(first.title).first()).toBeVisible()
  await expect(page.locator(`a[href="/watch?v=${first.videoId}"]`).first()).toBeVisible()

  // Figma 273:8936: every section gets the same lone centered button (no
  // gradient panel) — always visible, including the last section.
  await expect(page.locator('[data-hero-panel]').first()).toBeVisible()

  // Both arrows stay vertically centered on their card grid.
  const arrowDelta = async (section: ReturnType<typeof page.locator>) => {
    const gridBox = await section.locator('.video-grid').first().boundingBox()
    const btnBox = await section.locator('.hero-btn').first().boundingBox()
    if (!gridBox || !btnBox) return Number.POSITIVE_INFINITY
    return Math.abs(btnBox.y + btnBox.height / 2 - (gridBox.y + gridBox.height / 2))
  }
  expect(await arrowDelta(page.locator('[data-hero-section]').first())).toBeLessThan(1)

  // Gaming section below with its own header; the hero button scrolls to it.
  const gamingRes = await request.get(`${apiBase}/api/v1/trending?type=gaming`)
  const gamingVideos = (await gamingRes.json()) as { videoId: string }[]
  if (gamingVideos.length > 0) {
    const gamingSection = page.locator('[data-hero-section]').nth(1)
    await expect(gamingSection.locator('.explore-header h2')).toHaveText('Gaming')
    // "View all" leads to the section's full, uncapped page.
    await expect(gamingSection.locator('.view-all')).toHaveAttribute(
      'href',
      '/feed/trending?type=gaming&view=all',
    )
    await expect(gamingSection.locator('.hero-panel')).toBeVisible()
    expect(await arrowDelta(gamingSection)).toBeLessThan(1)
    await page.locator('[data-hero-panel]').first().click()
    await expect(gamingSection.locator('.explore-header h2')).toBeInViewport()
  }

  // "View all" is the complete feed: no sections, no cap, no nav (YouTube
  // serves the whole trending tab in one page).
  await page.goto('/feed/trending?view=all')
  await expect(page.locator('[data-hero-section]')).toHaveCount(0)
  await expect(page.locator('.pagination')).toHaveCount(0)
  await expect(page.locator('.video-grid article:visible')).toHaveCount(videos.length)
})

test('gaming tab renders the gaming trending type', async ({ page }) => {
  await page.goto('/feed/trending?type=gaming')

  await expect(page.locator('.tab.selected')).toHaveText('Gaming')
  await expect(page.locator('.explore-header h1')).toHaveText('Trending')
  // The main grid is the gaming feed itself: no separate gaming section.
  await expect(page.locator('[data-hero-section]')).toHaveCount(1)
})

test('sections cap at two rows regardless of the column count', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 })
  await page.goto('/feed/trending')

  const grid = page.locator('[data-hero-section]').first().locator('.video-grid')
  await expect(grid).toBeVisible()
  const visible = await grid.locator('article:visible').count()
  const columns = await grid.evaluate(
    (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length,
  )
  expect(visible).toBe(columns * 2)
})
