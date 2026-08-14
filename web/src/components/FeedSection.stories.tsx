import { mixedGrid } from '../stories/fixtures'
import FeedSection from './FeedSection.astro'

export default {
  title: 'Components/FeedSection',
  component: FeedSection,
  args: {
    title: 'Trending',
    locale: 'en-US',
    items: mixedGrid,
  },
}

export const Default = {}

export const Hero = {
  args: { variant: 'hero', title: 'In Case You Missed' },
}
