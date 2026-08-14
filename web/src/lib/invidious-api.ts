// Typed fetch wrapper around the Invidious JSON API.
//
// Runs server-side only (BFF pattern): Astro's SSR server calls Crystal
// server-to-server, the browser never talks to the API directly, so no CORS
// is involved anywhere. In-process TTL cache below collapses repeat
// navigations/refreshes — Crystal already caches YouTube data in Postgres,
// this just saves the HTTP round-trip + JSON parse on every page render.

const API_BASE_URL = import.meta.env.INVIDIOUS_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error(
    'INVIDIOUS_API_BASE_URL is not set. Copy web/.env.example to web/.env and adjust as needed.',
  );
}

const CACHE_TTL_MS = 60_000; // per endpoint+params key

const cache = new Map<string, { expires: number; value: unknown }>();

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const cached = cache.get(url);
  if (cached && cached.expires > Date.now()) {
    return cached.value as T;
  }

  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Invidious API ${path} returned ${res.status}`);
  }

  const json = (await res.json()) as T;
  cache.set(url, { expires: Date.now() + CACHE_TTL_MS, value: json });
  return json;
}

/** Prefix relative API asset URLs (e.g. `/vi/:id/mqdefault.jpg` thumbnails)
 * with the API base URL so <img> tags can load them cross-origin
 * (plain <img> loading needs no CORS). */
export function resolveApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
}

// --- /api/v1 types (shape confirmed against a live /api/v1/trending response) ---

export interface ImageObject {
  url: string;
  width: number;
  height: number;
}

export interface VideoThumbnail extends ImageObject {
  quality: string;
}

export interface Video {
  type: string;
  title: string;
  videoId: string;
  author: string;
  authorId: string;
  authorUrl: string;
  authorVerified: boolean;
  authorThumbnails: ImageObject[];
  videoThumbnails: VideoThumbnail[];
  description: string;
  descriptionHtml: string;
  viewCount: number;
  viewCountText: string;
  published: number;
  publishedText: string;
  lengthSeconds: number;
  liveNow: boolean;
  premium: boolean;
  hasCaptions: boolean;
  isUpcoming: boolean;
  isNew: boolean;
  is3d: boolean;
  is4k: boolean;
  is8k: boolean;
  isVr180: boolean;
  isVr360: boolean;
}

// --- Feed endpoints ---

export function getTrending(): Promise<Video[]> {
  return fetchJson<Video[]>('/api/v1/trending');
}

// NOTE: /api/v1/popular only aggregates videos from channels users are
// subscribed to — empty on a fresh instance with no users. Add getPopular()
// here (same Video[] shape) once subscriptions exist.
