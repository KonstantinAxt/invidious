import { sampleHashtag } from '../../stories/fixtures'
import HashtagCard from './HashtagCard.astro'

export default {
  title: 'Cards/HashtagCard',
  component: HashtagCard,
  args: {
    locale: 'en-US',
    hashtag: sampleHashtag,
  },
}

export const Default = {}
