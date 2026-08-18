import TabsRow from './TabsRow.astro'

export default {
  title: 'Components/TabsRow',
  component: TabsRow,
  args: {
    locale: 'en-US',
    tabs: [
      { label: 'Now', href: '/feed/trending', selected: true },
      { label: 'Music', tbd: true },
      { label: 'Gaming', href: '/feed/trending?type=gaming' },
      { label: 'Movies', tbd: true },
      { label: 'Shorts', tbd: true },
    ],
  },
}

export const Default = {}
