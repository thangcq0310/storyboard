import { chromium } from '@playwright/test';

(async () => {
  // Find the correct port
  const ports = [5175, 5176, 5177, 5178, 5179, 5180];
  let baseUrl = '';
  for (const port of ports) {
    try {
      const r = await fetch(`http://localhost:${port}`, { signal: AbortSignal.timeout(1000) });
      if (r.ok || r.status < 500) { baseUrl = `http://localhost:${port}`; break; }
    } catch { /* try next */ }
  }
  if (!baseUrl) { console.error('No dev server found!'); process.exit(1); }
  console.log(`Using ${baseUrl}`);

  const browser = await chromium.launch({ headless: false, slowMo: 150 });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(baseUrl);
  await page.waitForSelector('h1', { timeout: 15000 });
  await page.waitForTimeout(500);

  // Select workflow
  await page.locator('button').filter({ hasText: /Standard Storyboard/i }).first().click();
  await page.waitForTimeout(400);

  // Fill idea
  await page.locator('textarea, input[type="text"]').first().fill('A cyberpunk city at night with neon lights');

  // Generate
  await page.locator('button').filter({ hasText: /Generate/i }).last().click();
  await page.waitForTimeout(1500);

  // Screenshot showing Render All button
  await page.screenshot({ path: 'test-results/render-all-button.png' });
  
  // Verify the Render All button exists
  const renderAllBtn = page.locator('#render-all-btn');
  const exists = await renderAllBtn.count();
  console.log(`✅ "Render All Scenes" button found: ${exists > 0}`);
  const text = exists > 0 ? await renderAllBtn.textContent() : 'NOT FOUND';
  console.log(`   Button text: "${text?.trim()}"`);

  // Count per-scene Render and Video buttons
  const renderBtns = await page.getByRole('button', { name: /^Render$|^Re-render$/i }).count();
  const videoBtns  = await page.getByRole('button', { name: /^Video$|^Re-generate$/i }).count();
  console.log(`✅ Per-scene Render buttons: ${renderBtns}`);
  console.log(`✅ Per-scene Video buttons:  ${videoBtns}`);

  await page.screenshot({ path: 'test-results/render-all-final.png', fullPage: false });
  await browser.close();
  console.log('🎉 Done!');
})();
