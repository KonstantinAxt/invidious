import { sampleChannel } from '../../stories/fixtures'
import ChannelCard from './ChannelCard.astro'

export default {
  title: 'Cards/ChannelCard',
  component: ChannelCard,
  args: {
    locale: 'en-US',
    channel: sampleChannel,
    avatarSrc: 'https://placehold.co/72x72/232323/f0f0f0?text=Avatar',
  },
}

export const Default = {}
