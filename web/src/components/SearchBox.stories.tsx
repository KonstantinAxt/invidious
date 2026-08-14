import SearchBox from './SearchBox.astro'

export default {
  title: 'Components/SearchBox',
  component: SearchBox,
  args: {
    locale: 'en-US',
    query: '',
  },
}

export const Empty = {}

export const WithQuery = {
  args: { query: 'invidious' },
}
