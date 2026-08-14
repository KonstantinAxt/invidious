import { defineConfig } from 'astro/config';

import node from '@astrojs/node';

// SSR mode: pages are rendered server-side per request, with the Node adapter.
// The Astro server fetches the Invidious JSON API server-to-server (BFF pattern),
// so the browser never talks to Crystal directly.
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
});
