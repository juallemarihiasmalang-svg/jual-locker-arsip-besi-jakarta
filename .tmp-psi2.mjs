export default async function run(page, ui) {
  const reqs = [];
  page.on('response', async (r) => {
    let size = 0, h = {};
    try { size = (await r.body()).length; } catch (e) { }
    try { h = r.headers(); } catch (e) { }
    reqs.push({ url: r.url(), status: r.status(), size, type: r.request().resourceType(), enc: h['content-encoding'] || '', cc: h['cache-control'] || '' });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:4788/index.html', { waitUntil: 'load', timeout: 60000 });

  const domInfo = await page.evaluate(async () => {
    const v = { cls: 0, lcp: 0, lt: [] };
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) v.cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch (e) { }
    try { new PerformanceObserver(l => { const es = l.getEntries(); v.lcp = es[es.length - 1].startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch (e) { }
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) v.lt.push(e.duration); }).observe({ type: 'longtask', buffered: true }); } catch (e) { }
    await new Promise(r => setTimeout(r, 2500));
    return {
      cls: Math.round(v.cls * 1000) / 1000,
      lcp: v.lcp ? Math.round(v.lcp) : null,
      tbt: Math.round(v.lt.reduce((s, d) => s + Math.max(0, d - 50), 0)),
      maxLongTask: v.lt.length ? Math.round(Math.max(...v.lt)) : 0,
      longTaskCount: v.lt.length,
      domNodes: document.querySelectorAll('*').length,
      fcp: Math.round((performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint') || {}).startTime || 0),
      loadEvent: Math.round((performance.getEntriesByType('navigation')[0] || {}).loadEventEnd || 0)
    };
  });

  const kb = n => Math.round(n / 1024);
  const total = reqs.reduce((s, r) => s + r.size, 0);
  const byType = {};
  reqs.forEach(r => { byType[r.type] = byType[r.type] || { n: 0, b: 0 }; byType[r.type].n++; byType[r.type].b += r.size; });

  const bigImgs = reqs.filter(r => r.type === 'image' && r.size > 30000).sort((a, b) => b.size - a.size).map(r => ({ url: r.url.replace('http://localhost:4788/', ''), kb: kb(r.size) }));
  const bigCssJs = reqs.filter(r => ['stylesheet', 'script'].includes(r.type) && r.status === 200 && r.size > 10000).map(r => ({ url: r.url.replace('http://localhost:4788/', ''), type: r.type, kb: kb(r.size), enc: r.enc || 'NONE' }));

  return {
    totals: { totalKB: kb(total), requests: reqs.length, byType: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, { n: v.n, kb: kb(v.b) }])) },
    vitals: domInfo,
    bigImgs: bigImgs.slice(0, 15),
    bigCssJs: bigCssJs.slice(0, 15)
  };
}
