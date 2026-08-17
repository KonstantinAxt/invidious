import { expect, test } from '@playwright/test'

const apiBase = process.env.INVIDIOUS_API_BASE_URL
if (!apiBase) throw new Error('INVIDIOUS_API_BASE_URL must be set (copy .env.example to .env)')

test('renders the Figma category lane with functional chips', async ({ page }) => {
  await page.goto('/')

  const track = page.locator('[data-chips-track]').first()
  await expect(track).toBeVisible()

  // Icon-only leading chip + selected "All" + accent star chip
  await expect(track.locator('.chip.icon-chip').first()).toBeVisible()
  await expect(track.locator('.chip.selected').first()).toHaveText('All')
  await expect(track.locator('.chip.accent')).toHaveCount(1)

  // Selected chip stays white on hover; clickable chips get a pointer cursor.
  const selected = track.locator('.chip.selected').first()
  await selected.hover()
  await expect(selected).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(track.locator('a.chip').first()).toHaveCSS('cursor', 'pointer')

  // TBD chips are inert and carry a "Coming soon" tooltip
  const tbd = track.locator('.chip.tbd')
  await expect(tbd.first()).toHaveAttribute('title', /Coming soon/)
  await expect(tbd.locator('a')).toHaveCount(0)

  // Category chips navigate to search
  await expect(track.locator('a.chip[href="/search?q=Music"]')).toBeVisible()

  // Edge affordances appear only when the chips overflow the edge
  const next = page.locator('[data-chips-next]').first()
  const prev = page.locator('[data-chips-prev]').first()
  const canScroll = await track.evaluate((el) => el.scrollWidth > el.clientWidth)
  if (canScroll) {
    await expect(next).toBeVisible()
    await expect(prev).toBeHidden()
    await next.click()
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
    // Left affordance appears once scrolled and scrolls back to the start.
    await expect(prev).toBeVisible()
    await prev.click()
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBe(0)
    await expect(prev).toBeHidden()
    // …and the right one disappears once the end is reached.
    await track.evaluate((el) => el.scrollTo({ left: el.scrollWidth }))
    await expect(next).toBeHidden()
    await expect(prev).toBeVisible()

    // The leading icon chip (Figma 71:33874) is a button: it jumps back to
    // the start and re-selects "All".
    const iconChip = track.locator('button.chip.icon-chip')
    await expect(iconChip).toHaveCSS('cursor', 'pointer')
    await iconChip.click()
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBe(0)
    await expect(track.locator('.chip.selected').first()).toHaveText('All')
  } else {
    await expect(next).toBeHidden()
    await expect(prev).toBeHidden()
  }
})

test('feed rail: next button scrolls and header toggle collapses the section', async ({
  page,
  request,
}) => {
  const apiRes = await request.get(`${apiBase}/api/v1/trending`)
  expect(apiRes.ok()).toBeTruthy()
  const videos = (await apiRes.json()) as { videoId: string }[]
  expect(videos.length).toBeGreaterThan(0)

  await page.goto('/')

  const rail = page.locator('[data-rail]').first()
  await expect(rail).toBeVisible()
  await expect(rail.locator('.rail-item')).toHaveCount(Math.min(4, videos.length))

  // Figma 92:12742/92:12833: blue section panel + gradient hero overlay
  const section = page.locator('.feed-section').first()
  await expect(section).toHaveClass(/panel/)
  await expect(rail.locator('.rail-panel')).toBeVisible()

  const next = rail.locator('[data-rail-next]')
  const prev = rail.locator('[data-rail-prev]')
  const prevPanel = rail.locator('.rail-panel-prev')
  const track = rail.locator('[data-rail-track]')
  await expect(prev).toBeHidden()
  await expect(prevPanel).toBeHidden()
  const canScroll = await track.evaluate((el) => el.scrollWidth > el.clientWidth)
  if (canScroll) {
    await next.click()
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
    // Left arrow + its gradient panel appear once scrolled; it scrolls back.
    await expect(prevPanel).toBeVisible()
    await expect(prev).toBeVisible()
    await prev.click()
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBe(0)
    await expect(prevPanel).toBeHidden()
    await expect(prev).toBeHidden()
    // The whole gradient panel area scrolls, not just the round button.
    await rail.locator('.rail-panel').click()
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
    await rail.locator('.rail-panel-prev').click()
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBe(0)
    // At the end the right affordance disappears.
    await track.evaluate((el) => el.scrollTo({ left: el.scrollWidth }))
    await expect(rail.locator('.rail-panel')).toBeHidden()
    await expect(prevPanel).toBeVisible()
  }

  // Header double-chevron collapses and restores the section
  await section.locator('[data-section-toggle]').click()
  await expect(section).toHaveClass(/collapsed/)
  await expect(rail).toBeHidden()
  await section.locator('[data-section-toggle]').click()
  await expect(rail).toBeVisible()
})

test('shorts rail renders popular shorts when available', async ({ page, request }) => {
  const apiRes = await request.get(`${apiBase}/api/v1/popular`)
  expect(apiRes.ok()).toBeTruthy()
  const popular = (await apiRes.json()) as { videoId: string }[]

  await page.goto('/')

  if (popular.length > 0) {
    await expect(page.locator('.section-title', { hasText: 'Shorts' })).toBeVisible()
    await expect(page.locator('.shorts-card')).toHaveCount(Math.min(6, popular.length))
    await expect(page.locator('.pills .pill')).toHaveCount(2)

    // Blue panel + category chips sub-header
    const shortsSection = page.locator('.feed-section').nth(2)
    await expect(shortsSection).toHaveClass(/panel/)
    const chips = shortsSection.locator('[data-chips-track]')
    await expect(chips.locator('.chip')).toHaveCount(4)
    await expect(chips.locator('.chip.selected').first()).toHaveText('All')
    await expect(chips.locator('a.chip[href="/search?q=Comedy"]')).toBeVisible()
    // Four chips fit the row: no arrow overlays.
    await expect(shortsSection.locator('[data-chips-next]')).toBeHidden()
    await expect(shortsSection.locator('[data-chips-prev]')).toBeHidden()
  }
})
