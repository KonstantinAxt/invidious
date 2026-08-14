import { mixedGrid } from '../stories/fixtures'
import VideoGrid from './VideoGrid.astro'

export default {
  title: 'Components/VideoGrid',
  component: VideoGrid,
  args: {
    locale: 'en-US',
    items: mixedGrid,
  },
}

export const Mixed = {}
