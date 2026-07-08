# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-pages.spec.ts >> Health Check >> public stats endpoint responds
- Location: e2e/public-pages.spec.ts:60:9

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
  1  | /* ═══════════════════════════════════════════════════
  2  |    E2E Tests — Public Pages & Navigation
  3  |    ═══════════════════════════════════════════════════ */
  4  | import { test, expect } from '@playwright/test';
  5  |
  6  | test.describe('Public Pages', () => {
  7  |     test('homepage loads with hero section', async ({ page }) => {
  8  |         await page.goto('/');
  9  |
  10 |         // Page should load
  11 |         await expect(page).toHaveTitle(/اجتهاد/i);
  12 |
  13 |         // Hero section should be visible
  14 |         const heroHeading = page.locator('h1').first();
  15 |         await expect(heroHeading).toBeVisible();
  16 |     });
  17 |
  18 |     test('courses page lists available courses', async ({ page }) => {
  19 |         await page.goto('/courses');
  20 |
  21 |         // Should show courses section
  22 |         await expect(page.locator('h1')).toBeVisible();
  23 |
  24 |         // Wait for courses to load from API
  25 |         await page.waitForResponse(resp =>
  26 |             resp.url().includes('/api/courses') && resp.status() === 200
  27 |         );
  28 |     });
  29 |
  30 |     test('navigation links work correctly', async ({ page }) => {
  31 |         await page.goto('/');
  32 |
  33 |         // Click "الكورسات" nav link
  34 |         await page.click('a[href="/courses"]');
  35 |         await expect(page).toHaveURL('/courses');
  36 |
  37 |         // Click "عن المنصة" nav link
  38 |         await page.click('a[href="/about"]');
  39 |         await expect(page).toHaveURL('/about');
  40 |     });
  41 |
  42 |     test('404 page shows for invalid routes', async ({ page }) => {
  43 |         await page.goto('/this-page-does-not-exist');
  44 |
  45 |         // Should show some form of "not found" content
  46 |         const body = await page.textContent('body');
  47 |         expect(body).toBeTruthy();
  48 |     });
  49 | });
  50 |
  51 | test.describe('Health Check', () => {
  52 |     test('API health endpoint responds', async ({ request }) => {
  53 |         const response = await request.get('http://localhost:5000/api/health');
  54 |         expect(response.ok()).toBeTruthy();
  55 |
  56 |         const data = await response.json();
  57 |         expect(data.status).toBe('ok');
  58 |     });
  59 |
  60 |     test('public stats endpoint responds', async ({ request }) => {
  61 |         const response = await request.get('http://localhost:5000/api/public/stats');
> 62 |         expect(response.ok()).toBeTruthy();
     |                               ^ Error: expect(received).toBeTruthy()
  63 |
  64 |         const data = await response.json();
  65 |         expect(data).toHaveProperty('totalStudents');
  66 |         expect(data).toHaveProperty('activeCourses');
  67 |     });
  68 | });
  69 |
```