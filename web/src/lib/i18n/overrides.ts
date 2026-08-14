/**
 * Web-only UI strings introduced by the redesign that don't exist in the
 * vendored Invidious locale JSONs (synced from Crystal's `locales/`).
 *
 * They are merged on top of every loaded locale in `locales.ts`, so these
 * labels never render as raw keys and non-English locales fall back to the
 * English values instead of the key name. Keep this list to keys that are
 * genuinely missing upstream — if a key later appears in a vendored locale,
 * remove it from here so the translation wins again.
 */
export const OVERRIDES: Record<string, string> = {
  All: 'All',
  about: 'About',
  Any: 'Any',
  'Any Time': 'Any Time',
  Comments: 'Comments',
  community: 'Community',
  courses: 'Courses',
  duration: 'duration',
  'Duration:': 'Duration:',
  'Features:': 'Features:',
  Home: 'Home',
  'Latest posts': 'Latest posts',
  Live: 'Live',
  Newest: 'Newest',
  'Play All': 'Play all',
  playlists: 'Playlists',
  podcasts: 'Podcasts',
  'Popular videos': 'Popular videos',
  posts: 'Posts',
  'Related videos': 'Related videos',
  releases: 'Releases',
  Relevance: 'Relevance',
  Reply: 'Reply',
  Share: 'Share',
  'Shared `x` ago': '`x` ago',
  shorts: 'Shorts',
  'Sort by:': 'Sort by:',
  streams: 'Streams',
  'Type:': 'Type:',
  'Up next': 'Up next',
  'Upload Date:': 'Upload Date:',
  Videos: 'Videos',
  videos: 'videos',
  views: 'views',
}
