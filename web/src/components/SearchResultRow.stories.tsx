import { sampleVideo } from '../stories/fixtures'
import SearchResultRow from './SearchResultRow.astro'

export default {
  title: 'Components/SearchResultRow',
  component: SearchResultRow,
  args: {
    video: sampleVideo,
    thumbnailSrc: 'https://placehold.co/332x186/232323/f0f0f0?text=Thumbnail',
    avatarSrc: 'https://placehold.co/28x28/232323/f0f0f0?text=Avatar',
  },
}

export const Default = {}
