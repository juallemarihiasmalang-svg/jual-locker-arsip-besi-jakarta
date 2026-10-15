export default async function run(page, ui) {
  const pages = [
    'index.html',
    'produk-lg.html',
    'produk-samsung.html',
    'produk-hikvision.html',
    'portofolio.html',
    'kontak-kami.html',
    'artikel.html'
  ];
  const viewports = [
    { name: 'desktop-1440', w: 1440, h: 900 },
    { name: 'laptop-1280', w: 1280, h: 800 },
    { name: 'tablet-768', w: 768, h: 1024 },
    { name: 'mobile-390', w: 390, h: 844 },
    { name: 'mobile-320', w: 320, h: 720 }
  ];

  const base = 'file:///c:/Users/THINKPAD/Desktop/jual-videotron-outdoor-jakarta/';
  const out = {};

  for (const vp of viewports) {
    out[vp.name] = {};
    await page.setViewportSize({ width: vp.w, height: vp.h });
    for (const file of pages) {
      const consoleErrors = [];
      const onConsole = (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 160)); };
      page.on('console', onConsole);
      try {
        await page.goto(base + file, { waitUntil: 'load', timeout: 30000 });
        await page.waitForTimeout(500);
        const audit = await page.evaluate(() => {
          const de = document.documentElement;
          const vw = window.innerWidth;
          const overflowing = [];
          document.querySelectorAll('body *').forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.width < 1 || r.height < 1) return;
            if (r.right > vw + 2 || r.left < -2) {
              const cls = (typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
              overflowing.push({
                tag: el.tagName,
                cls,
                left: Math.round(r.left),
                right: Math.round(r.right),
                w: Math.round(r.width)
              });
            }
          });
          return {
            scrollW: de.scrollWidth,
            clientW: vw,
            diff: de.scrollWidth - vw,
            overflowing: overflowing.slice(0, 12)
          };
        });
        out[vp.name][file] = {
          overflow: audit.diff,
          overflowing: audit.overflowing,
          jsErrors: consoleErrors
        };
      } catch (e) {
        out[vp.name][file] = { error: String(e).slice(0, 160) };
      }
      page.off('console', onConsole);
    }
  }

  // Compact textual report
  const lines = [];
  for (const [vpName, files] of Object.entries(out)) {
    for (const [file, d] of Object.entries(files)) {
      if (d.error) { lines.push(`${vpName} ${file}: ERROR ${d.error}`); continue; }
      const flags = [];
      if (d.overflow > 0) flags.push(`OVERFLOW+${d.overflow}px`);
      if (d.overflowing.length) flags.push(`els=${d.overflowing.length}(${d.overflowing.map(o => o.tag + (o.cls ? '.' + o.cls : '')).slice(0, 4).join(',')})`);
      if (d.jsErrors.length) flags.push(`JSERR=${d.jsErrors.length}`);
      lines.push(`${vpName} ${file}: ${flags.length ? flags.join(' ') : 'OK'}`);
    }
  }
  return lines.join('\n');
}
