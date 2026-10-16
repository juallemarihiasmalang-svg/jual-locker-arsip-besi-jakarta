import { chromium } from 'playwright';

const URL = 'http://localhost:4788/index.html';

const run = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
  });
  const page = await context.newPage();

  const requests = [];
  const responses = [];
  page.on('request', (r) => requests.push({ url: r.url(), type: r.resourceType() }));
  page.on('response', async (r) => {
    let size = 0;
    try { size = (await r.body()).length; } catch (e) { }
    responses.push({ url: r.url(), status: r.status(), size, type: r.request().resourceType() });
  });
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message));

  const t0 = Date.now();
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  const loadMs = Date.now() - t0;

  // Wait for network to settle a bit
  await page.waitForTimeout(3000);

  // Measure paint metrics + CLS-ish info
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const paints = {};
    performance.getEntriesByType('paint').forEach((p) => { paints[p.name] = Math.round(p.startTime); });
    const de = document.documentElement;
    return {
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
      loadEvent: Math.round(nav.loadEventEnd || 0),
      fcp: paints['first-contentful-paint'] || null,
      clientW: de.clientWidth,
      scrollW: de.scrollWidth,
      imgCount: document.images.length,
      imgWithoutDims: Array.from(document.images).filter(i => !i.getAttribute('width') && !i.getAttribute('height')).length,
      imgNoLazy: Array.from(document.images).filter(i => i.getAttribute('loading') !== 'lazy' && !i.hasAttribute('data-priority')).length
    };
  });

  const totalBytes = responses.reduce((s, r) => s + r.size, 0);
  const byType = {};
  responses.forEach((r) => {
    byType[r.type] = byType[r.type] || { count: 0, bytes: 0 };
    byType[r.type].count++;
    byType[r.type].bytes += r.size;
  });

  const heavy = responses
    .filter((r) => r.size > 50000)
    .sort((a, b) => b.size - a.size)
    .slice(0, 15)
    .map((r) => ({ url: r.url.replace('http://localhost:4788/', ''), kb: Math.round(r.size / 1024), type: r.type }));

  const kb = (n) => Math.round(n / 1024);

  console.log(JSON.stringify({
    loadMs,
    totalKB: kb(totalBytes),
    requestCount: requests.length,
    byType: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, { count: v.count, kb: kb(v.bytes) }])),
    metrics,
    heavy,
    consoleErrors: consoleErrors.slice(0, 10)
  }, null, 2));

  await browser.close();
};

run().catch((e) => { console.error(e); process.exit(1); });
