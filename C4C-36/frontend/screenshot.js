import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  page.on('requestfailed', request => console.log('BROWSER REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'frontend_screenshot.png' });
  
  await browser.close();
})();
