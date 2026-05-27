import { test, expect } from '@playwright/test';

const sampleBuild = {
  "class": "Ranger",
  "mainSkill": "Tornado Shot",
  "ascendancy": "Raider",
  "level": 80,
  "lifeTotal": 3000,
  "buildData": "{}"
};

async function setupBuildAndNavigateToChat(page) {
  const email = `test-${Date.now()}@example.com`;
  const password = 'Test123!@#';

  // Signup
  await page.goto('/signup');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.fill('input[placeholder="Confirm Password"]', password);
  await page.click('button:has-text("Sign Up")');
  await page.waitForURL(/.*builds/, { timeout: 10000 });

  // Import build
  await page.click('button:has-text("Import Build")');
  await page.waitForURL(/.*import/, { timeout: 5000 });
  await page.fill('input[placeholder="e.g., Fire Witch"]', 'Chat Test Build');
  await page.fill('textarea', JSON.stringify(sampleBuild));
  await page.click('button:has-text("Import")');

  // Navigate to chat
  await page.waitForURL(/.*builds/, { timeout: 5000 });
  await page.click('button:has-text("Chat")', { strict: false });
  await page.waitForURL(/.*chat/, { timeout: 5000 });
}

test.describe('Chat Functionality', () => {
  test('should display chat page with build info', async ({ page }) => {
    await setupBuildAndNavigateToChat(page);

    await expect(page.locator('text=Chat Test Build')).toBeVisible();
  });

  test('should display message input', async ({ page }) => {
    await setupBuildAndNavigateToChat(page);

    const input = page.locator('input[placeholder="Ask about your build..."]');
    await expect(input).toBeVisible();
    await expect(page.locator('button:has-text("Send")')).toBeVisible();
  });

  test('should display save and export buttons', async ({ page }) => {
    await setupBuildAndNavigateToChat(page);

    await expect(page.locator('button:has-text("Save")')).toBeVisible();
    await expect(page.locator('button:has-text("Export")')).toBeVisible();
    await expect(page.locator('button:has-text("Variants")')).toBeVisible();
  });

  test('should send message and display in chat', async ({ page }) => {
    await setupBuildAndNavigateToChat(page);

    await page.fill('input[placeholder="Ask about your build..."]', 'What should I prioritize for gear?');
    await page.click('button:has-text("Send")');

    // Wait for message to appear
    await expect(page.locator('text=What should I prioritize for gear?')).toBeVisible({ timeout: 3000 });
  });

  test('should open save variant modal', async ({ page }) => {
    await setupBuildAndNavigateToChat(page);

    // Click save button to open modal
    await page.click('button:has-text("Save")');

    // Modal should appear with input field
    const variantInput = page.locator('input[placeholder="e.g., More Tanky Build"]');
    await expect(variantInput).toBeVisible();
  });

  test('should navigate to variants page', async ({ page }) => {
    await setupBuildAndNavigateToChat(page);

    await page.click('button:has-text("Variants")');

    // Should navigate to variants page
    await page.waitForURL(/.*variants/, { timeout: 5000 });
  });
});
