import { defineConfig, devices } from '@playwright/test';

/**
 * Tests E2E GymWatch — lancés contre le stack complet (Vite + Express).
 * En dev : les serveurs sont réutilisés s'ils tournent déjà (reuseExistingServer).
 * En CI : les deux serveurs sont démarrés automatiquement.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,        // séquentiel → cohérence DB
  workers: 1,                  // un seul worker → pas de conflit sur la DB
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Simule un téléphone par défaut (cible principale du projet)
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
  },

  projects: [
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'npm run dev:api',
      port: 3001,
      reuseExistingServer: !process.env.CI,
      timeout: 15_000,
    },
    {
      command: 'npm run dev:front',
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 20_000,
    },
  ],
});
