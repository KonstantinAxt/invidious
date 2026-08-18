import type { GridItem } from './api-types'
import { getPopular, getTrending, resolveApiUrl } from './invidious-api'
import { resolveGridItems } from './media'

/** Shared pipeline for the feed pages: API fetch → thumbnail/avatar resolution. */
export async function resolveFeed(
  kind: 'trending' | 'popular',
  type?: string,
  region?: string,
): Promise<{ titleKey: 'Trending' | 'Popular'; items: GridItem[] }> {
  const videos = kind === 'trending' ? await getTrending(type, region) : await getPopular()
  return {
    titleKey: kind === 'trending' ? 'Trending' : 'Popular',
    items: resolveGridItems(videos, resolveApiUrl),
  }
}
