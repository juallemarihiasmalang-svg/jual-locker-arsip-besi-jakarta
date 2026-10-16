export default async function run(page, ui) {
  await page.setViewportSize({ width: 390, height: 844 });
  const pages = ['index.html', 'produk-lg.html', 'produk-samsung.html', 'produk-hikvision.html', 'artikel.html', 'kontak-kami.html', 'portofolio.html', 'artikel-detail.html', 'index-videotron-outdoor.html'];
  const out = [];

  for (const p of pages) {
    try {
      await page.goto('http://localhost:4788/' + p, { waitUntil: 'load', timeout: 40000 });
      await page.waitForTimeout(1200);
      const res = await page.evaluate(() => {
        function lum(c) {
          const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
          return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
        }
        function ratio(a, b) { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
        function parse(str) {
          const m = String(str).match(/rgba?\(([^)]+)\)/); if (!m) return null;
          const p = m[1].split(',').map(s => parseFloat(s.trim()));
          return { rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 };
        }
        function bg(el) {
          let n = el;
          while (n && n.nodeType === 1) {
            const c = parse(getComputedStyle(n).backgroundColor);
            if (c && c.a > 0) return c.rgb;
            n = n.parentElement;
          }
          return [255, 255, 255];
        }
        const r = { contrast: [], tapTargets: [], zoomBlocked: false, sameNameLinks: [], imgAlt: [], labelIssues: [], langOk: document.documentElement.lang === 'id' };
        document.querySelectorAll('body *').forEach(el => {
          const txt = Array.from(el.childNodes).filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ').trim();
          if (!txt) return;
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return;
          const rect = el.getBoundingClientRect();
          if (rect.width < 2 || rect.height < 2) return;
          const fg = parse(cs.color); if (!fg || fg.a === 0) return;
          const cr = ratio(fg.rgb, bg(el));
          const size = parseFloat(cs.fontSize);
          const weight = parseInt(cs.fontWeight, 10) || 400;
          const large = size >= 24 || (size >= 18.66 && weight >= 700);
          const need = large ? 3 : 4.5;
          if (cr < need) r.contrast.push({ text: txt.slice(0, 55), ratio: +cr.toFixed(2), need, color: cs.color, cls: String(el.className || '').slice(0, 45) });
        });
        document.querySelectorAll('a,button,input,select,textarea,[role="button"],[role="link"]').forEach(el => {
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') return;
          const b = el.getBoundingClientRect();
          if (b.width === 0 || b.height === 0) return;
          if (b.width < 24 || b.height < 24) r.tapTargets.push({ t: el.tagName.toLowerCase(), txt: (el.textContent || '').trim().slice(0, 28), w: Math.round(b.width), h: Math.round(b.height), cls: String(el.className || '').slice(0, 40) });
        });
        const vp = document.querySelector('meta[name="viewport"]');
        if (vp && /user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?[^0-9]/i.test(vp.content)) r.zoomBlocked = true;
        const byName = {};
        document.querySelectorAll('a[href]').forEach(a => {
          const t = (a.textContent || '').trim().replace(/\s+/g, ' '); if (!t) return;
          const href = a.getAttribute('href');
          (byName[t] = byName[t] || new Set()).add(href);
        });
        Object.keys(byName).forEach(k => { if (byName[k].size > 1) r.sameNameLinks.push({ text: k.slice(0, 40), hrefs: Array.from(byName[k]).slice(0, 4) }); });
        document.querySelectorAll('img').forEach(i => { if (!i.hasAttribute('alt')) r.imgAlt.push(i.getAttribute('src')); });
        document.querySelectorAll('input,select,textarea').forEach(inp => {
          const id = inp.id; const has = id && document.querySelector('label[for="' + id + '"]');
          const ar = inp.getAttribute('aria-label') || inp.getAttribute('aria-labelledby') || inp.getAttribute('title');
          if (!has && !ar) r.labelIssues.push(inp.tagName + '[' + (inp.type || '') + ']' + (inp.name ? ' name=' + inp.name : ''));
        });
        return r;
      });
      out.push({ page: p, ...res });
    } catch (e) { out.push({ page: p, error: e.message }); }
  }
  return out;
}
