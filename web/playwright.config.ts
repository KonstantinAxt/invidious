import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

// Astro loads .env itself, but the Playwright test process doesn't —
// load it here so tests can reach the Crystal API directly for cross-checks.
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:4321',
  },
  // Boot the Astro dev server (SSR) for the tests. Port pinned to 4321 so it
  // doesn't collide with the Crystal backend (3001) or the WhatsApp bridge (3000).
  // ASTRO_DEV_BACKGROUND disables astro's agent-environment auto-backgrounding
  // (it would daemonize the server and make Playwright see an "early exit");
  // --ignore-lock avoids stale lock files from killed runs blocking startup.
  webServer: {
    command: 'npm run dev -- --port 4321 --host 127.0.0.1 --ignore-lock',
    port: 4321,
    reuseExistingServer: true,
    timeout: 120_000,
    env: { ...process.env, ASTRO_DEV_BACKGROUND: '1' },
  },
});
