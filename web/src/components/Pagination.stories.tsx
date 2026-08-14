import Pagination from './Pagination.astro'

export default {
  title: 'Components/Pagination',
  component: Pagination,
  args: {
    locale: 'en-US',
    baseUrl: '/search?q=test',
    currentPage: 2,
    hasNext: true,
  },
}

export const Numeric = {}

export const FirstPage = {
  args: { currentPage: 1 },
}

export const Continuation = {
  args: {
    currentPage: undefined,
    continuationToken: '4qmFsgJAEhhVQzQ2QTQ0OUU5RkQ1NTc3NzhGMkExQzAx',
  },
}

export const LastPage = {
  args: { currentPage: 5, hasNext: false },
}
