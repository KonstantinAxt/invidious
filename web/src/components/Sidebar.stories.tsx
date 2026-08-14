import Sidebar from './Sidebar.astro'

export default {
  title: 'Components/Sidebar',
  component: Sidebar,
  args: {
    locale: 'en-US',
    activeHref: '/',
  },
}

export const HomeActive = {}

export const SearchActive = {
  args: { activeHref: '/search' },
}
