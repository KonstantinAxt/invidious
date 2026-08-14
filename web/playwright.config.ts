import { existsSync } from 'node:fs'
import { defineConfig } from '@playwright/test'

if (existsSync('.env')) {
  process.loadEnvFile('.env')
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:4321',
  },
  webServer: {
    command: 'npm run dev -- --port 4321 --host 127.0.0.1 --ignore-lock',
    port: 4321,
    reuseExistingServer: true,
    timeout: 120_000,
    env: { ...process.env, ASTRO_DEV_BACKGROUND: '1' },
  },
})
