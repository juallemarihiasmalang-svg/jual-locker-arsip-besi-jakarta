export default async function run(page, ui) {
  const responses = [];
  page.on('response', async (r) => {
    let size = 0, headers = {};
    try { size = (await r.body()).length; } catch (e) { }
    try { headers = r.headers(); } catch (e) { }
    responses.push({ url: r.url(), status: r.status(), size, type: r.request().resourceType(), headers });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  // Inject observers BEFORE navigation so we catch CLS/LCP/INP
  await page.addInitScript(() => {
    window.__vit = { cls: 0, lcp: 0, longtasks: [], inp: 0 };
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) {
          if (!e.hadRecentInput) window.__vit.cls += e.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) { }
    try {
      new PerformanceObserver((l) => {
        const es = l.getEntries();
        window.__vit.lcp = es[es.length - 1].startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) { }
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) window.__vit.longtasks.push({ s: e.startTime, d: e.duration });
      }).observe({ type: 'longtask', buffered: true });
    } catch (e) { }
  });

  await page.goto('http://localhost:4788/index.html', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3500);

  const vit = await page.evaluate(() => {
    const v = window.__vit || {};
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const paints = {};
    performance.getEntriesByType('paint').forEach((p) => { paints[p.name] = Math.round(p.startTime); });
    const de = document.documentElement;
    const imgs = Array.from(document.images);
    // find elements causing horizontal overflow
    const overflow = [];
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > de.clientWidth + 2 || r.right > de.clientWidth + 2) {
        overflow.push({ tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 40), w: Math.round(r.width), right: Math.round(r.right) });
      }
    });
    return {
      cls: Math.round((v.cls || 0) * 1000) / 1000,
      lcp: v.lcp ? Math.round(v.lcp) : null,
      longtasks: v.longtasks || [],
      fcp: paints['first-contentful-paint'] || null,
      tbt: (v.longtasks || []).reduce((s, t) => s + Math.max(0, t.d - 50), 0),
      clientW: de.clientWidth, scrollW: de.scrollWidth,
      imgCount: imgs.length,
      imgWithoutDims: imgs.filter(i => !i.getAttribute('width') && !i.getAttribute('height')).length,
      imgNoLazy: imgs.filter(i => i.getAttribute('loading') !== 'lazy').length,
      overflow: overflow.slice(0, 12)
    };
  });

  const kb = (n) => Math.round(n / 1024);
  const totalBytes = responses.reduce((s, r) => s + r.size, 0);
  const heavy = responses.filter((r) => r.size > 30000).sort((a, b) => b.size - a.size).slice(0, 15)
    .map((r) => ({ url: r.url.replace('http://localhost:4788/', ''), kb: Math.round(r.size / 1024), type: r.type }));
  // uncached = no cache-control / long max-age
  const uncached = responses.filter(r => r.type !== 'document' && r.size > 10000 && !(r.headers['cache-control'] || '').match(/max-age=[1-9]/)).map(r => r.url.replace('http://localhost:4788/', '')).slice(0, 10);
  const noCompress = responses.filter(r => (r.type === 'document' || r.type === 'stylesheet' || r.type === 'script') && !(r.headers['content-encoding'] || '')).map(r => r.url.replace('http://localhost:4788/', '')).slice(0, 10);

  return {
    totalKB: kb(totalBytes),
    requestCount: responses.length,
    vit,
    heavy,
    uncached,
    noCompress
  };
}
