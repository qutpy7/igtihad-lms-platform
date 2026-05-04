import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for LMS E2E Tests
 * 
 * Run: npx playwright test
 * UI:  npx playwright test --ui
 * Debug: npx playwright test --debug
 */
export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    /* Start both servers before running tests */
    webServer: [
        {
            command: 'cd server && npm run dev',
            port: 5000,
            timeout: 30000,
            reuseExistingServer: !process.env.CI,
        },
        {
            command: 'cd client && npm run dev',
            port: 5173,
            timeout: 30000,
            reuseExistingServer: !process.env.CI,
        },
    ],
});
