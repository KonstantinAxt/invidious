import SegmentedButton from './SegmentedButton.astro'

export default {
  title: 'Components/SegmentedButton',
  component: SegmentedButton,
  args: {
    segments: [{ label: 'Related videos', selected: true }, { label: 'Up next' }],
  },
}

export const Default = {}
