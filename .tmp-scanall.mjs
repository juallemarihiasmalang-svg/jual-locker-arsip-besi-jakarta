export default async function run(page, ui) {
  await page.setViewportSize({ width: 390, height: 844 });
  const pages = ['index.html', 'index-videotron-outdoor.html', 'produk-lg.html', 'produk-samsung.html', 'produk-hikvision.html', 'artikel.html', 'kontak-kami.html', 'portofolio.html', 'artikel-detail.html'];
  const results = [];
  for (const p of pages) {
    const broken = [];
    const failed = [];
    const handler = (r) => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url().replace('http://localhost:4788/', '')); };
    page.on('response', handler);
    try {
      await page.goto('http://localhost:4788/' + p, { waitUntil: 'load', timeout: 40000 });
      await page.waitForTimeout(1500);
      const imgs = await page.evaluate(() => Array.from(document.images).map(i => ({ src: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0 })));
      const brokenImgs = imgs.filter(i => !i.ok).map(i => i.src);
      const de = await page.evaluate(() => ({ cw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth }));
      results.push({ page: p, brokenImgs, failedRequests: failed.slice(0, 10), overflow: de.sw > de.cw ? (de.sw + '>' + de.cw) : 'none' });
    } catch (e) {
      results.push({ page: p, error: e.message });
    }
    page.off('response', handler);
  }
  return results;
}
