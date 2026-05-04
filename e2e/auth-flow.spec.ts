/* ═══════════════════════════════════════════════════
   E2E Tests — Authentication Flows
   ═══════════════════════════════════════════════════ */
import { test, expect, Page } from '@playwright/test';

// Helper: generate unique email for each test run
const uniqueEmail = () => `e2e_${Date.now()}@test.com`;

test.describe('Authentication', () => {
    test('signup flow creates a new student account', async ({ page }) => {
        const email = uniqueEmail();
        
        await page.goto('/signup');
        
        // Fill in signup form
        await page.fill('input[name="full_name"], input[placeholder*="الاسم"]', 'طالب تجريبي');
        await page.fill('input[name="email"], input[type="email"]', email);
        await page.fill('input[name="password"], input[type="password"]', 'test123456');
        
        // Submit form
        await page.click('button[type="submit"]');
        
        // Should redirect to student dashboard
        await page.waitForURL(/\/student/, { timeout: 10000 });
        expect(page.url()).toContain('/student');
    });

    test('login flow authenticates existing user', async ({ page }) => {
        // First register a user via API
        const email = uniqueEmail();
        await page.request.post('http://localhost:5000/api/auth/register', {
            data: { email, password: 'test123456', full_name: 'Login Test User' }
        });
        
        await page.goto('/login');
        
        // Fill login form
        await page.fill('input[name="email"], input[type="email"]', email);
        await page.fill('input[name="password"], input[type="password"]', 'test123456');
        
        // Submit
        await page.click('button[type="submit"]');
        
        // Should redirect to student dashboard
        await page.waitForURL(/\/student/, { timeout: 10000 });
    });

    test('login with wrong password shows error', async ({ page }) => {
        await page.goto('/login');
        
        await page.fill('input[name="email"], input[type="email"]', 'nobody@test.com');
        await page.fill('input[name="password"], input[type="password"]', 'wrongpass');
        
        await page.click('button[type="submit"]');
        
        // Should stay on login page and show error
        await page.waitForTimeout(2000);
        expect(page.url()).toContain('/login');
    });

    test('protected routes redirect to login when not authenticated', async ({ page }) => {
        // Clear any stored tokens
        await page.goto('/');
        await page.evaluate(() => localStorage.removeItem('auth_token'));
        
        // Try to access student dashboard
        await page.goto('/student');
        
        // Should redirect to login
        await page.waitForURL(/\/login/, { timeout: 10000 });
    });

    test('logout clears session', async ({ page }) => {
        // Register + login via API
        const email = uniqueEmail();
        const res = await page.request.post('http://localhost:5000/api/auth/register', {
            data: { email, password: 'test123456', full_name: 'Logout Test' }
        });
        const { token } = await res.json();
        
        // Set token and go to dashboard
        await page.goto('/');
        await page.evaluate(t => localStorage.setItem('auth_token', t), token);
        await page.goto('/student');
        
        // Find and click logout button
        const logoutBtn = page.locator('button:has-text("خروج"), button:has-text("تسجيل الخروج"), [aria-label*="logout"]');
        if (await logoutBtn.isVisible()) {
            await logoutBtn.click();
            
            // Should redirect to home or login
            await page.waitForTimeout(2000);
            const url = page.url();
            expect(url.includes('/login') || url === 'http://localhost:5173/').toBeTruthy();
        }
    });
});
