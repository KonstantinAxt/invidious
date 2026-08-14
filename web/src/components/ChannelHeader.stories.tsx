import { sampleChannel } from '../stories/fixtures'
import ChannelHeader from './ChannelHeader.astro'

export default {
  title: 'Components/ChannelHeader',
  component: ChannelHeader,
  args: {
    locale: 'en-US',
    ucid: sampleChannel.authorId,
    author: sampleChannel.author,
    verified: sampleChannel.authorVerified,
    avatarSrc: 'https://placehold.co/96x96/232323/f0f0f0?text=Avatar',
    bannerSrc: 'https://placehold.co/1200x200/232323/f0f0f0?text=Banner',
    pronouns: null,
    descriptionHtml: sampleChannel.descriptionHtml,
    subCountText: '45.6K',
    baseUrl: `/channel/${sampleChannel.authorId}`,
    selectedTab: 'videos',
    tabs: [
      {
        id: 'home',
        labelKey: 'channel_tab_videos_label',
        href: `/channel/${sampleChannel.authorId}`,
      },
      {
        id: 'videos',
        labelKey: 'channel_tab_videos_label',
        href: `/channel/${sampleChannel.authorId}/videos`,
      },
      {
        id: 'shorts',
        labelKey: 'channel_tab_shorts_label',
        href: `/channel/${sampleChannel.authorId}/shorts`,
      },
      {
        id: 'community',
        labelKey: 'channel_tab_community_label',
        href: `/channel/${sampleChannel.authorId}/community`,
      },
    ],
    sortBy: 'newest',
    sortOptions: [
      { id: 'newest', labelKey: 'newest' },
      { id: 'oldest', labelKey: 'oldest' },
      { id: 'popular', labelKey: 'popular' },
    ],
  },
}

export const Default = {}
