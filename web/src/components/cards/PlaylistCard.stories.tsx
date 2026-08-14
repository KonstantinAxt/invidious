import { samplePlaylist } from '../../stories/fixtures'
import PlaylistCard from './PlaylistCard.astro'

export default {
  title: 'Cards/PlaylistCard',
  component: PlaylistCard,
  args: {
    locale: 'en-US',
    playlist: samplePlaylist,
    thumbnailSrc: 'https://placehold.co/320x180/232323/f0f0f0?text=Playlist',
  },
}

export const Default = {}
