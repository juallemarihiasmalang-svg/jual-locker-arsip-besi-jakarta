export default async function run(page, ui) {
  const responses = [];
  page.on('response', async (r) => {
    let size = 0;
    try { size = (await r.body()).length; } catch (e) { }
    responses.push({ url: r.url(), status: r.status(), size, type: r.request().resourceType() });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  const t0 = Date.now();
  await page.goto('http://localhost:4788/index.html', { waitUntil: 'load', timeout: 60000 });
  const loadMs = Date.now() - t0;
  await page.waitForTimeout(2500);

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const paints = {};
    performance.getEntriesByType('paint').forEach((p) => { paints[p.name] = Math.round(p.startTime); });
    let lcp = null;
    try {
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length) lcp = Math.round(lcpEntries[lcpEntries.length - 1].startTime);
    } catch (e) { }
    const de = document.documentElement;
    const imgs = Array.from(document.images);
    return {
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
      loadEvent: Math.round(nav.loadEventEnd || 0),
      fcp: paints['first-contentful-paint'] || null,
      lcp,
      clientW: de.clientWidth,
      scrollW: de.scrollWidth,
      imgCount: imgs.length,
      imgWithoutDims: imgs.filter(i => !i.getAttribute('width') && !i.getAttribute('height')).length,
      imgNoLazy: imgs.filter(i => i.getAttribute('loading') !== 'lazy').length,
      title: document.title
    };
  });

  const totalBytes = responses.reduce((s, r) => s + r.size, 0);
  const byType = {};
  responses.forEach((r) => {
    byType[r.type] = byType[r.type] || { count: 0, bytes: 0 };
    byType[r.type].count++;
    byType[r.type].bytes += r.size;
  });
  const kb = (n) => Math.round(n / 1024);
  const heavy = responses.filter((r) => r.size > 40000).sort((a, b) => b.size - a.size).slice(0, 15)
    .map((r) => ({ url: r.url.replace('http://localhost:4788/', ''), kb: Math.round(r.size / 1024), type: r.type }));
  const failed = responses.filter(r => r.status >= 400).map(r => ({ url: r.url, status: r.status }));

  return {
    loadMs,
    totalKB: kb(totalBytes),
    requestCount: responses.length,
    byType: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, { count: v.count, kb: kb(v.bytes) }])),
    metrics,
    heavy,
    failed
  };
}
