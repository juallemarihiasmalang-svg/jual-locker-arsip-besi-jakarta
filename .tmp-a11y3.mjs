export default async function run(page, ui) {
  await page.setViewportSize({ width: 390, height: 844 });
  const pages = ['index.html', 'produk-lg.html', 'produk-samsung.html', 'produk-hikvision.html', 'artikel.html', 'kontak-kami.html', 'portofolio.html', 'artikel-detail.html', 'index-videotron-outdoor.html'];
  const out = [];
  for (const p of pages) {
    try {
      await page.goto('http://localhost:4788/' + p, { waitUntil: 'load', timeout: 40000 });
      await page.waitForTimeout(1200);
      const r = await page.evaluate(() => {
        const res = { imgsNoAlt: [], btnsNoName: [], linksNoName: [], inputsNoLabel: [], headingOrder: [], lang: document.documentElement.lang || '', framesNoTitle: [], h1count: document.querySelectorAll('h1').length };
        document.querySelectorAll('img').forEach(i => { if (!i.hasAttribute('alt')) res.imgsNoAlt.push(i.getAttribute('src')); });
        document.querySelectorAll('button').forEach(b => { const t = (b.textContent || '').trim(); const a = b.getAttribute('aria-label') || b.getAttribute('title'); if (!t && !a) res.btnsNoName.push((b.className || '').toString().slice(0, 40)); });
        document.querySelectorAll('a').forEach(a => { const t = (a.textContent || '').trim(); const ar = a.getAttribute('aria-label') || a.getAttribute('title'); if (!t && !ar && !a.querySelector('img[alt]')) res.linksNoName.push(a.getAttribute('href')); });
        document.querySelectorAll('input,select,textarea').forEach(inp => { const id = inp.id; const hasLabel = id && document.querySelector('label[for="' + id + '"]'); const ar = inp.getAttribute('aria-label') || inp.getAttribute('aria-labelledby'); if (!hasLabel && !ar) res.inputsNoLabel.push(inp.tagName + '[' + (inp.type || '') + ']' + (inp.name ? (' name=' + inp.name) : '')); });
        document.querySelectorAll('iframe').forEach(f => { if (!f.getAttribute('title')) res.framesNoTitle.push(f.getAttribute('src')); });
        const hs = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => +h.tagName[1]);
        let prev = 0, bad = [];
        hs.forEach(v => { if (prev && v > prev + 1) bad.push(prev + '->' + v); prev = v; });
        res.headingOrder = bad;
        return res;
      });
      out.push({ page: p, ...r });
    } catch (e) { out.push({ page: p, error: e.message }); }
  }
  return out;
}
