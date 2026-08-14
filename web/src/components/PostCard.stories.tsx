import { sampleCommunityPost } from '../stories/fixtures'
import PostCard from './PostCard.astro'

export default {
  title: 'Components/PostCard',
  component: PostCard,
  args: {
    post: sampleCommunityPost,
  },
}

export const Default = {}
