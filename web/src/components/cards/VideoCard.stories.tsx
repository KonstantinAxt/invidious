import { liveVideo, sampleVideo, upcomingVideo } from '../../stories/fixtures'
import VideoCard from './VideoCard.astro'

export default {
  title: 'Cards/VideoCard',
  component: VideoCard,
  args: {
    locale: 'en-US',
    video: sampleVideo,
    thumbnailSrc: 'https://placehold.co/320x180/232323/f0f0f0?text=Thumbnail',
  },
}

export const Default = {}

export const Live = {
  args: { video: liveVideo },
}

export const Upcoming = {
  args: { video: upcomingVideo },
}

export const NoThumbnail = {
  args: { thumbnailSrc: undefined },
}
