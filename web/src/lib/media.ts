import type { GridItem, SearchItemShape, VideoThumbnail } from './api-types'

export function pickThumbnail(thumbnails: VideoThumbnail[]): VideoThumbnail | undefined {
  return thumbnails.find((t) => t.quality === 'medium') ?? thumbnails[0]
}

export function resolveGridItems(
  items: SearchItemShape[],
  resolveUrl: (path: string) => string,
): GridItem[] {
  const result: GridItem[] = []

  for (const item of items) {
    switch (item.type) {
      case 'video': {
        const thumb = pickThumbnail(item.videoThumbnails)
        result.push({
          kind: 'video',
          video: item,
          thumbnailSrc: thumb ? resolveUrl(thumb.url) : undefined,
        })
        break
      }
      case 'channel': {
        const avatar = item.authorThumbnails.find((t) => t.width >= 100) ?? item.authorThumbnails[0]
        result.push({
          kind: 'channel',
          channel: item,
          avatarSrc: avatar ? resolveUrl(avatar.url) : undefined,
        })
        break
      }
      case 'playlist':
        result.push({
          kind: 'playlist',
          playlist: item,
          thumbnailSrc: item.playlistThumbnail ? resolveUrl(item.playlistThumbnail) : undefined,
        })
        break
      case 'hashtag':
        result.push({ kind: 'hashtag', hashtag: item })
        break
      case 'parse-error':
        result.push({ kind: 'parse-error', message: item.errorMessage })
        break
      case 'category':
        break
    }
  }

  return result
}
