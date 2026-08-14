import { sampleRelatedVideo } from '../stories/fixtures'
import SuggestionsRail from './SuggestionsRail.astro'

const videos = [0, 1, 2, 3, 4].map((index) => ({
  video: { ...sampleRelatedVideo, videoId: `related${index}`, title: `Related video ${index + 1}` },
  thumbnailSrc: 'https://placehold.co/168x94/232323/f0f0f0?text=Thumbnail',
}))

export default {
  title: 'Components/SuggestionsRail',
  component: SuggestionsRail,
  args: {
    title: 'Related videos',
    videos,
  },
}

export const Default = {}
