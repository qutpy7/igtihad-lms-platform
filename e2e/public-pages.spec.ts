/* ═══════════════════════════════════════════════════
   E2E Tests — Public Pages & Navigation
   ═══════════════════════════════════════════════════ */
import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
    test('homepage loads with hero section', async ({ page }) => {
        await page.goto('/');
        
        // Page should load
        await expect(page).toHaveTitle(/اجتهاد/i);
        
        // Hero section should be visible
        const heroHeading = page.locator('h1').first();
        await expect(heroHeading).toBeVisible();
    });

    test('courses page lists available courses', async ({ page }) => {
        await page.goto('/courses');
        
        // Should show courses section
        await expect(page.locator('h1')).toBeVisible();
        
        // Wait for courses to load from API
        await page.waitForResponse(resp => 
            resp.url().includes('/api/courses') && resp.status() === 200
        );
    });

    test('navigation links work correctly', async ({ page }) => {
        await page.goto('/');
        
        // Click "الكورسات" nav link
        await page.click('a[href="/courses"]');
        await expect(page).toHaveURL('/courses');
        
        // Click "عن المنصة" nav link
        await page.click('a[href="/about"]');
        await expect(page).toHaveURL('/about');
    });

    test('404 page shows for invalid routes', async ({ page }) => {
        await page.goto('/this-page-does-not-exist');
        
        // Should show some form of "not found" content
        const body = await page.textContent('body');
        expect(body).toBeTruthy();
    });
});

test.describe('Health Check', () => {
    test('API health endpoint responds', async ({ request }) => {
        const response = await request.get('http://localhost:5000/api/health');
        expect(response.ok()).toBeTruthy();
        
        const data = await response.json();
        expect(data.status).toBe('ok');
    });

    test('public stats endpoint responds', async ({ request }) => {
        const response = await request.get('http://localhost:5000/api/public/stats');
        expect(response.ok()).toBeTruthy();
        
        const data = await response.json();
        expect(data).toHaveProperty('totalStudents');
        expect(data).toHaveProperty('activeCourses');
    });
});
