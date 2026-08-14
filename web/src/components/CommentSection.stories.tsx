import { sampleComment } from '../stories/fixtures'
import CommentSection from './CommentSection.astro'

const comments = [0, 1, 2].map((index) => ({
  comment: {
    ...sampleComment,
    commentId: `comment${index}`,
    author: `Viewer ${index + 1}`,
  },
  avatarSrc: 'https://placehold.co/43x43/232323/f0f0f0?text=Avatar',
}))

export default {
  title: 'Components/CommentSection',
  component: CommentSection,
  args: {
    locale: 'en-US',
    commentCount: 1587,
    comments,
  },
}

export const Default = {}

export const Empty = {
  args: { commentCount: 0, comments: [] },
}
