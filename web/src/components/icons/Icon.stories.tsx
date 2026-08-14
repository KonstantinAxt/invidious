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
        'menu',
        'notifs',
        'settings',
        'more',
        'play',
        'pause',
        'shorts',
        'heart',
        'dislike',
        'reply',
        'share',
        'download',
        'sort',
        'filter',
        'cast',
        'mic',
        'live',
        'list',
        'drag',
        'backward',
        'forward',
        'fullscreen',
        'theater',
        'volume',
        'home',
        'trending',
        'history',
        'clock',
        'compass',
        'tv',
        'collections',
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
