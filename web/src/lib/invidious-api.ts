import type { Video } from './api-types'

export type {
  GridItem,
  ImageObject,
  SearchChannelShape,
  SearchHashtagShape,
  SearchItemShape,
  SearchPlaylistShape,
  SearchVideoShape,
  Video,
  VideoThumbnail,
} from './api-types'

const API_BASE_URL = import.meta.env.INVIDIOUS_API_BASE_URL
if (!API_BASE_URL) {
  throw new Error('INVIDIOUS_API_BASE_URL is not set. Copy web/.env.example to web/.env.')
}

const CACHE_TTL_MS = 60_000

const cache = new Map<string, { expires: number; value: unknown }>()

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path}`

  const cached = cache.get(url)
  if (cached && cached.expires > Date.now()) {
    return cached.value as T
  }

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Invidious API ${path} returned ${res.status}`)
  }

  const json = (await res.json()) as T
  cache.set(url, { expires: Date.now() + CACHE_TTL_MS, value: json })
  return json
}

export function resolveApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path
  }
  return `${API_BASE_URL}${path}`
}

export async function getTrending(): Promise<Video[]> {
  return fetchJson<Video[]>('/api/v1/trending')
}
