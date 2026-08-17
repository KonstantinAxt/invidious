import type {
  ChannelDetail,
  ChannelVideosResponse,
  CommentsResponse,
  CommunityResponse,
  PlaylistDetail,
  SearchItemShape,
  SearchShortVideoShape,
  SearchVideoShape,
  VideoDetail,
} from './api-types'

export type {
  ApiComment,
  ChannelDetail,
  ChannelVideosResponse,
  CommentsResponse,
  CommunityPost,
  CommunityResponse,
  GridItem,
  ImageObject,
  PlaylistDetail,
  PlaylistVideo,
  RelatedVideo,
  SearchChannelShape,
  SearchHashtagShape,
  SearchItemShape,
  SearchPlaylistShape,
  SearchShortVideoShape,
  SearchVideoShape,
  Video,
  VideoDetail,
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

export async function getTrending(): Promise<SearchVideoShape[]> {
  return fetchJson<SearchVideoShape[]>('/api/v1/trending')
}

export async function getPopular(): Promise<SearchShortVideoShape[]> {
  return fetchJson<SearchShortVideoShape[]>('/api/v1/popular')
}

export async function getVideo(id: string): Promise<VideoDetail> {
  const json = await fetchJson<VideoDetail | { error: string }>(`/api/v1/videos/${id}`)
  if ('error' in json) {
    throw new Error(json.error)
  }
  return json
}

export async function getComments(id: string): Promise<CommentsResponse> {
  try {
    const json = await fetchJson<CommentsResponse | { error: string }>(`/api/v1/comments/${id}`)
    if ('error' in json) {
      return { comments: [], commentCount: 0 }
    }
    return json
  } catch {
    // 404 or network failure: the section degrades to empty
    return { comments: [], commentCount: 0 }
  }
}

export async function searchVideos(query: string): Promise<SearchItemShape[]> {
  return fetchJson<SearchItemShape[]>(`/api/v1/search?q=${encodeURIComponent(query)}`)
}

export async function getChannel(ucid: string): Promise<ChannelDetail> {
  return fetchJson<ChannelDetail>(`/api/v1/channels/${ucid}`)
}

export async function getChannelVideos(ucid: string): Promise<ChannelVideosResponse> {
  return fetchJson<ChannelVideosResponse>(`/api/v1/channels/${ucid}/videos`)
}

export async function getCommunity(ucid: string): Promise<CommunityResponse> {
  return fetchJson<CommunityResponse>(`/api/v1/channels/${ucid}/community`)
}

export async function getPlaylist(plid: string): Promise<PlaylistDetail> {
  return fetchJson<PlaylistDetail>(`/api/v1/playlists/${plid}`)
}
