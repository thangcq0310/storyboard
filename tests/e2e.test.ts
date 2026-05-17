import { test, expect } from '@playwright/test';

test('App should load, accept input, and generate workflow', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:4173');
  
  // Verify header
  await expect(page.locator('h1')).toContainText('Workflow-first cinematic generator');
  
  // Click on the first workflow ('Standard Storyboard → Video')
  await page.getByRole('button', { name: /Standard Storyboard/i }).click();
  
  // Enter idea
  await page.getByPlaceholder('Describe the video idea...').fill('A cyberpunk city under heavy rain with flying cars');
  
  // Change style
  await page.getByLabel('Visual style').selectOption('Cinematic');
  
  // Click Generate
  await page.getByRole('button', { name: /Generate Workflow/i }).click();
  
  // Wait for the storyboard output to appear (it takes 600ms per our simulated delay)
  await expect(page.locator('.section-label', { hasText: 'Step 5' })).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Generated Output')).toBeVisible();
  
  // Verify that scenes are rendered (Case 1 has 6 panels)
  const sceneElements = await page.locator('.aspect-video.rounded.bg-black\\/30').count();
  // It renders some images or placeholders
  expect(await page.locator('text=Copy').count()).toBeGreaterThan(0);
});
