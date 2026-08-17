import { mixedGrid } from '../stories/fixtures'
import VideoRail from './VideoRail.astro'

export default {
  title: 'Components/VideoRail',
  component: VideoRail,
  args: {
    items: mixedGrid.slice(0, 4),
    locale: 'en-US',
    cardWidth: 354,
    nextLabel: 'Next',
    prevLabel: 'Previous',
  },
}

export const Video = {}

export const Shorts = {
  args: {
    variant: 'short',
    cardWidth: 231,
    items: mixedGrid.slice(0, 6),
  },
}
