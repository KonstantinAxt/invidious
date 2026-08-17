import ChipsRow from './ChipsRow.astro'

export default {
  title: 'Components/ChipsRow',
  component: ChipsRow,
  args: {
    locale: 'en-US',
    chips: [
      { label: 'All', selected: true },
      { label: 'Music' },
      { label: 'Gaming' },
      { label: 'Movies' },
      { label: 'Live' },
      { label: 'News' },
    ],
  },
}

export const Default = {}

export const Filters = {
  args: {
    chips: [
      { label: 'All', selected: true },
      { label: 'Type:' },
      { label: 'Upload Date:' },
      { label: 'Duration:' },
      { label: 'Features:' },
      { label: 'Sort by:' },
    ],
  },
}

export const Category = {
  args: {
    variant: 'category',
    chips: [
      { icon: 'feed', jumpToStart: true },
      { label: 'All', href: '/', selected: true },
      { label: 'Subscriptions', tbd: true },
      { label: 'Music', href: '/search?q=Music' },
      { label: 'Tech', href: '/search?q=Tech' },
      { label: 'New Creators', href: '/search?q=New+Creators', star: true },
    ],
  },
}
