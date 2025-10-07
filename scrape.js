const fs = require('fs');
const { chromium } = require('playwright');

const urls = [
  "https://www.lowes.com/pd/DuroMax-HX-Series-12000-Watt-Dual-Fuel-Gasoline-Propane-Portable-Generator/5014925935"
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  for (const url of urls) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(4000);
      const title = await page.locator('h1').first().textContent().catch(()=> '');
      const priceText = await page.locator('[data-testid="item-price"], .price').first().textContent().catch(()=> '');
      const price = priceText?.match(/[\d,.]+/)?.[0]?.replace(/,/g,'');
      results.push({ url, title: title.trim(), price: Number(price) || null, timestamp: new Date().toISOString() });
    } catch (e) {
      results.push({ url, title: '', price: null, timestamp: new Date().toISOString(), error: e.message });
    }
  }
  await browser.close();
  fs.writeFileSync('docs/lowes_prices.json', JSON.stringify(results, null, 2));
})();
