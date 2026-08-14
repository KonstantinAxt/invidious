import ChipsRow from './ChipsRow.astro'

export default {
  title: 'Components/ChipsRow',
  component: ChipsRow,
  args: {
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
