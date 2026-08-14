import Icon from './Icon.astro'

export default {
  title: 'Components/Icon',
  component: Icon,
  args: {
    name: 'search',
    size: 24,
  },
  argTypes: {
    name: {
      control: 'select',
      options: [
        'search',
        'sun',
        'moon',
        'check',
        'rss',
        'youtube',
        'headset',
        'switch',
        'eye',
        'alert',
        'github',
        'doc',
        'wallet',
        'arrow-left',
        'arrow-right',
        'plus',
        'trash',
      ],
    },
  },
}

export const Search = {}

export const Check = {
  args: { name: 'check' },
}

export const Labelled = {
  args: { name: 'alert', label: 'Alert' },
}
