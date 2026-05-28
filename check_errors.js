import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.error('Page error:', err.message);
  });
  
  page.on('error', err => {
    console.error('Error:', err.message);
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text());
    }
  });

  try {
    await page.goto('http://localhost:5179', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log('Page loaded successfully without crashing the renderer entirely.');
  } catch(e) {
    console.log('Navigation error:', e.message);
  }
  
  await browser.close();
})();
