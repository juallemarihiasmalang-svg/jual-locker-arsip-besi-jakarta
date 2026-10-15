export default async function run(page, ui) {
  const base = 'file:///c:/Users/THINKPAD/Desktop/jual-videotron-outdoor-jakarta/';
  const pages = [
    'index.html', 'produk-lg.html', 'produk-samsung.html', 'produk-hikvision.html',
    'portofolio.html', 'kontak-kami.html', 'artikel.html', 'artikel-detail.html',
    'gspa-panel-outdoor-1.html', 'samsung-smpa-outdoor-1.html', 'hikvision-hvpa-outdoor-1.html'
  ];
  await page.setViewportSize({ width: 1280, height: 900 });
  const results = [];
  for (const file of pages) {
    const failed = [];
    const onFail = (req) => { failed.push(req.url().split('/').pop()); };
    page.on('requestfailed', onFail);
    const respErrors = [];
    const onResp = (resp) => { if (resp.status() >= 400) respErrors.push(resp.url().split('/').pop()); };
    page.on('response', onResp);
    try {
      await page.goto(base + file, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(400);
    } catch (e) { /* ignore */ }
    page.off('requestfailed', onFail);
    page.off('response', onResp);
    const all = failed.concat(respErrors);
    results.push(file + ': ' + (all.length ? all.join(', ') : 'ALL OK'));
  }
  return results.join('\n');
}
