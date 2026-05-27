import { test, expect } from '@playwright/test';

const sampleBuild = {
  "class": "Templar",
  "mainSkill": "Holy Flame Totem",
  "ascendancy": "Inquisitor",
  "level": 85,
  "lifeTotal": 3500,
  "buildData": "{}"
};

test.describe('Full User Flow', () => {
  test('complete user journey: signup → import → chat → variants', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'SecurePass123!@#';
    const buildName = 'Full Flow Test Build';

    // 1. SIGNUP
    await page.goto('/login');
    await page.click('a:has-text("Sign up")');
    await expect(page).toHaveURL(/.*signup/);

    // Fill signup form
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.fill('input[placeholder="Confirm Password"]', password);
    await page.click('button:has-text("Sign Up")');

    // Should redirect to builds page
    await page.waitForURL(/.*builds/, { timeout: 10000 });
    await expect(page.locator('text=Your Builds')).toBeVisible();

    // 2. IMPORT BUILD
    await page.click('button:has-text("Import Build")');
    await page.waitForURL(/.*import/, { timeout: 5000 });

    await page.fill('input[placeholder="e.g., Fire Witch"]', buildName);
    await page.fill('textarea', JSON.stringify(sampleBuild));
    await page.click('button:has-text("Import")');

    // Should return to builds and show new build
    await page.waitForURL(/.*builds/, { timeout: 5000 });
    await expect(page.locator(`text=${buildName}`)).toBeVisible();
    await expect(page.locator('text=Templar')).toBeVisible();

    // 3. NAVIGATE TO CHAT
    await page.click('button:has-text("Chat")', { strict: false });
    await page.waitForURL(/.*chat/, { timeout: 5000 });

    await expect(page.locator(`text=${buildName}`)).toBeVisible();

    // 4. SEND MESSAGE
    const testMessage = 'What gems should I use?';
    await page.fill('input[placeholder="Ask about your build..."]', testMessage);
    await page.click('button:has-text("Send")');

    // Wait for message input to be visible again (indicating message was sent)
    await page.waitForTimeout(500);

    // 5. NAVIGATE TO VARIANTS
    await page.click('button:has-text("Variants")');
    await page.waitForURL(/.*variants/, { timeout: 5000 });

    // 6. LOGOUT
    await page.click('button:has-text("Logout")');
    await page.waitForURL(/.*login/, { timeout: 5000 });

    // Should be back at login
    await expect(page.locator('h1:has-text("Login")')).toBeVisible();

    // 7. LOGIN AGAIN
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Login")');

    await page.waitForURL(/.*builds/, { timeout: 10000 });
    await expect(page.locator(`text=${buildName}`)).toBeVisible();
  });

  test('should protect routes and redirect to login', async ({ page }) => {
    // Try to access builds page without logging in
    await page.goto('/builds');

    // Should redirect to login
    await page.waitForURL(/.*login/, { timeout: 5000 });
    await expect(page.locator('h1:has-text("Login")')).toBeVisible();
  });

  test('should maintain authentication across page reloads', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test123!@#';

    // Signup
    await page.goto('/signup');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.fill('input[placeholder="Confirm Password"]', password);
    await page.click('button:has-text("Sign Up")');
    await page.waitForURL(/.*builds/, { timeout: 10000 });

    // Reload page
    await page.reload();

    // Should still be logged in on builds page
    await expect(page.locator('text=Your Builds')).toBeVisible();
  });

  test('should show error when importing invalid JSON', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test123!@#';

    // Signup
    await page.goto('/signup');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.fill('input[placeholder="Confirm Password"]', password);
    await page.click('button:has-text("Sign Up")');
    await page.waitForURL(/.*builds/, { timeout: 10000 });

    // Try to import invalid JSON
    await page.click('button:has-text("Import Build")');
    await page.waitForURL(/.*import/, { timeout: 5000 });

    await page.fill('input[placeholder="e.g., Fire Witch"]', 'Bad Build');
    await page.fill('textarea', 'not valid json at all');
    await page.click('button:has-text("Import")');

    // Should show error
    const errorDiv = page.locator('div.bg-red-100');
    await expect(errorDiv).toBeVisible();
  });
});
