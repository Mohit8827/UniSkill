const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

async function main() {
  const outDir = process.argv[2];
  const baseUrl = process.argv[3] || 'http://127.0.0.1:3000';
  if (!outDir) {
    throw new Error('Usage: node capture_screenshots.cjs <output-dir> [base-url]');
  }

  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 2200 },
    deviceScaleFactor: 1,
  });

  const targets = [
    ['home', `${baseUrl}/`],
    ['login', `${baseUrl}/login`],
    ['signup', `${baseUrl}/signup`],
  ];

  for (const [name, url] of targets) {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForLoadState('load', { timeout: 120000 }).catch(() => {});
    await page.waitForTimeout(8000);
    await page.screenshot({
      path: path.join(outDir, `${name}.png`),
      fullPage: true,
    });
    await page.close();
  }

  await browser.close();
  console.log(outDir);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
