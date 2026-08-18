import { expect, test } from '@playwright/test'

test('renders the Subs-designed popular feed', async ({ page, request }) => {
  const apiBase = process.env.INVIDIOUS_API_BASE_URL
  if (!apiBase) throw new Error('INVIDIOUS_API_BASE_URL must be set (copy .env.example to .env)')

  const apiRes = await request.get(`${apiBase}/api/v1/popular`)
  expect(apiRes.ok()).toBeTruthy()
  const videos = (await apiRes.json()) as { title: string; videoId: string }[]

  await page.goto('/feed/popular')

  // Sidebar: the design has no Popular entry — Explore stays active.
  await expect(page.locator('.sidebar-item.active span')).toHaveText('Explore')

  // Figma 97:3987 toolbar: view mode, type filters, sort, view toggles.
  const toolbar = page.locator('.popular-toolbar')
  await expect(toolbar.locator('.chip.selected').nth(0)).toHaveText('All')
  await expect(toolbar.locator('.chip.selected').nth(1)).toHaveText('Newest')
  await expect(toolbar.locator('.chip.tbd').first()).toHaveAttribute('title', /Coming soon/)

  // Popular can legitimately be empty on a zero-user instance.
  const first = videos[0]
  if (first) {
    // Date-divided timeline rows (Figma 97:4251).
    await expect(page.locator('.date-header').first()).toBeVisible()
    await expect(page.getByText(first.title).first()).toBeVisible()
    await expect(page.locator(`a[href="/watch?v=${first.videoId}"]`).first()).toBeVisible()
  } else {
    await expect(page.locator('.popular-empty')).toBeVisible()
  }
})
