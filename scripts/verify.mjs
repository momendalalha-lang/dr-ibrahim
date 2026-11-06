import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'C:/Users/momen/AppData/Local/Temp/mus-shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const errors = [];

async function shoot(name, fn, viewport = { width: 1440, height: 1000 }) {
  const page = await browser.newPage({ viewport });
  page.on('console', (m) => m.type() === 'error' && errors.push(`[${name}] ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`[${name}] PAGEERROR ${e.message}`));
  await fn(page);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  await page.close();
  console.log('shot', name);
}

await shoot('50-matte-hero', async (page) => {
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
});

await shoot('51-matte-reels', async (page) => {
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.locator('#reels').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
});

await shoot('52-matte-branches', async (page) => {
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.locator('#branches').scrollIntoViewIfNeeded();
});

await shoot('53-matte-footer-ig', async (page) => {
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.locator('#connect').scrollIntoViewIfNeeded();
});

await shoot('54-matte-ar-rtl', async (page) => {
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.getByLabel('Switch to Arabic').click();
  await page.waitForTimeout(400);
});

await shoot('55-matte-mobile', async (page) => {
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
}, { width: 390, height: 844 });

// admin flow: wrong pin then right pin
await shoot('56-admin-gate', async (page) => {
  await page.goto('http://localhost:5173/#/admin', { waitUntil: 'networkidle' });
});

const page = await browser.newPage();
page.on('pageerror', (e) => errors.push(`[admin] PAGEERROR ${e.message}`));
await page.goto('http://localhost:5173/#/admin', { waitUntil: 'networkidle' });
await page.fill('input[type="password"]', 'wrongpin');
await page.click('button[type="submit"]');
await page.waitForTimeout(300);
const errVisible = await page.locator('text=Incorrect PIN').isVisible().catch(() => false);
console.log('wrong-pin error shown:', errVisible);
await page.fill('input[type="password"]', 'ibrahim2026');
await page.click('button[type="submit"]');
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/57-admin-panel.png` });
const hasForm = await page.locator('text=New branch').isVisible().catch(() => false);
console.log('admin unlocked, form visible:', hasForm);
await page.close();

console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'No console/page errors.');
await browser.close();
