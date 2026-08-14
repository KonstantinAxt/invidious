import Navbar from './Navbar.astro'

export default {
  title: 'Components/Navbar',
  component: Navbar,
  args: {
    locale: 'en-US',
    showSearch: true,
  },
}

export const Default = {}

export const NoSearch = {
  args: { showSearch: false },
}
