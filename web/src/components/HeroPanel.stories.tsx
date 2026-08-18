import HeroPanel from './HeroPanel.astro'

export default {
  title: 'Components/HeroPanel',
  component: HeroPanel,
  args: {
    label: 'Next section',
  },
  decorators: [
    () => ({
      template: `
        <div data-hero-section style="position: relative; min-height: 300px; background: #1f1f1f; padding: 24px;">
          <story/>
        </div>
        <div data-hero-section style="min-height: 300px; background: #1a1a1a; padding: 24px;">next section</div>
      `,
    }),
  ],
}

export const Default = {}
