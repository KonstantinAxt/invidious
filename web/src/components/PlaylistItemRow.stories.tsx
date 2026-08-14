import { samplePlaylistVideo } from '../stories/fixtures'
import PlaylistItemRow from './PlaylistItemRow.astro'

export default {
  title: 'Components/PlaylistItemRow',
  component: PlaylistItemRow,
  args: {
    video: samplePlaylistVideo,
    thumbnailSrc: 'https://placehold.co/259x146/232323/f0f0f0?text=Thumbnail',
    locale: 'en-US',
  },
}

export const Default = {}
