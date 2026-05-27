import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1:has-text("Login")')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should navigate to signup from login', async ({ page }) => {
    await page.goto('/login');
    await page.click('a:has-text("Sign up")');
    await expect(page).toHaveURL(/.*signup/);
    await expect(page.locator('h1:has-text("Sign Up")')).toBeVisible();
  });

  test('should create account and redirect to builds', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test123!@#';

    await page.goto('/signup');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.fill('input[placeholder="Confirm Password"]', password);
    await page.click('button:has-text("Sign Up")');

    // Wait for redirect and verify we're logged in
    await page.waitForURL(/.*builds/, { timeout: 10000 });
    await expect(page.locator('text=Your Builds')).toBeVisible();
  });

  test('should login with existing account', async ({ page, context }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test123!@#';

    // Signup first
    await page.goto('/signup');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.fill('input[placeholder="Confirm Password"]', password);
    await page.click('button:has-text("Sign Up")');
    await page.waitForURL(/.*builds/, { timeout: 10000 });

    // Clear localStorage to simulate logout
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Login")');

    await page.waitForURL(/.*builds/, { timeout: 10000 });
    await expect(page.locator('text=Your Builds')).toBeVisible();
  });

  test('should logout and return to login', async ({ page, context }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test123!@#';

    // Signup
    await page.goto('/signup');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.fill('input[placeholder="Confirm Password"]', password);
    await page.click('button:has-text("Sign Up")');
    await page.waitForURL(/.*builds/, { timeout: 10000 });

    // Logout
    await page.click('button:has-text("Logout")');
    await page.waitForURL(/.*login/, { timeout: 5000 });
    await expect(page.locator('h1:has-text("Login")')).toBeVisible();
  });

  test('should require matching passwords on signup', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.fill('input[placeholder="Confirm Password"]', 'DifferentPassword123!');
    await page.click('button:has-text("Sign Up")');

    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });
});
