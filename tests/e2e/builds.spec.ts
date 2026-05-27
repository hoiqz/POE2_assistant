import { test, expect } from '@playwright/test';

const sampleBuild = {
  "class": "Witch",
  "mainSkill": "Explosive Arrow",
  "ascendancy": "Occultist",
  "level": 75,
  "lifeTotal": 2500,
  "buildData": "{}"
};

async function loginUser(page, email, password) {
  await page.goto('/signup');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.fill('input[placeholder="Confirm Password"]', password);
  await page.click('button:has-text("Sign Up")');
  await page.waitForURL(/.*builds/, { timeout: 10000 });
}

test.describe('Build Management', () => {
  test('should display builds page with import button', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test123!@#';

    await loginUser(page, email, password);

    await expect(page.locator('text=Your Builds')).toBeVisible();
    await expect(page.locator('button:has-text("Import Build")')).toBeVisible();
  });

  test('should import a build', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test123!@#';

    await loginUser(page, email, password);
    await page.click('button:has-text("Import Build")');
    await page.waitForURL(/.*import/, { timeout: 5000 });

    // Fill in build data
    await page.fill('input[placeholder="e.g., Fire Witch"]', 'Test Build');
    await page.fill('textarea', JSON.stringify(sampleBuild));
    await page.click('button:has-text("Import")');

    // Should return to builds list and show the new build
    await page.waitForURL(/.*builds/, { timeout: 5000 });
    await expect(page.locator('text=Test Build')).toBeVisible();
    await expect(page.locator('text=Witch')).toBeVisible();
  });

  test('should validate JSON before importing', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test123!@#';

    await loginUser(page, email, password);
    await page.click('button:has-text("Import Build")');
    await page.waitForURL(/.*import/, { timeout: 5000 });

    await page.fill('input[placeholder="e.g., Fire Witch"]', 'Invalid Build');
    await page.fill('textarea', '{invalid json}');
    await page.click('button:has-text("Import")');

    // Check for error message (either "Invalid JSON" or similar)
    const errorDiv = page.locator('div.bg-red-100');
    await expect(errorDiv).toBeVisible({ timeout: 3000 });
  });

  test('should delete a build', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test123!@#';

    await loginUser(page, email, password);
    await page.click('button:has-text("Import Build")');
    await page.waitForURL(/.*import/, { timeout: 5000 });

    await page.fill('input[placeholder="e.g., Fire Witch"]', 'Delete Me Build');
    await page.fill('textarea', JSON.stringify(sampleBuild));
    await page.click('button:has-text("Import")');

    await page.waitForURL(/.*builds/, { timeout: 5000 });
    await expect(page.locator('text=Delete Me Build')).toBeVisible();

    // Delete the build - handle the confirmation dialog
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Delete")', { strict: false });

    // Wait for deletion to complete
    await page.waitForTimeout(500);

    // Build should be removed from list
    await expect(page.locator('text=Delete Me Build')).not.toBeVisible();
  });

  test('should navigate to chat from build', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test123!@#';

    await loginUser(page, email, password);
    await page.click('button:has-text("Import Build")');
    await page.waitForURL(/.*import/, { timeout: 5000 });

    await page.fill('input[placeholder="e.g., Fire Witch"]', 'Chat Test Build');
    await page.fill('textarea', JSON.stringify(sampleBuild));
    await page.click('button:has-text("Import")');

    await page.waitForURL(/.*builds/, { timeout: 5000 });

    // Click chat button
    await page.click('button:has-text("Chat")', { strict: false });

    // Should navigate to chat page
    await page.waitForURL(/.*chat/, { timeout: 5000 });
    await expect(page.locator('text=Chat Test Build')).toBeVisible();
  });

  test('should navigate to variants from build', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test123!@#';

    await loginUser(page, email, password);
    await page.click('button:has-text("Import Build")');
    await page.waitForURL(/.*import/, { timeout: 5000 });

    await page.fill('input[placeholder="e.g., Fire Witch"]', 'Variants Test Build');
    await page.fill('textarea', JSON.stringify(sampleBuild));
    await page.click('button:has-text("Import")');

    await page.waitForURL(/.*builds/, { timeout: 5000 });

    // Click variants button
    await page.click('button:has-text("Variants")', { strict: false });

    // Should navigate to variants page
    await page.waitForURL(/.*variants/, { timeout: 5000 });
  });
});
