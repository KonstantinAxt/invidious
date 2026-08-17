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

export const Collapsible = {
  args: { toggle: true },
}

export const Panel = {
  args: { toggle: true, panel: true, title: 'In Case You Missed' },
}

export const WithIcon = {
  args: { title: 'Shorts', icon: 'shorts' },
}

export const WithoutTitle = {
  args: { title: undefined },
}
