export default async function run(page, ui) {
  const pages = [
    'index.html',
    'produk-lg.html',
    'produk-samsung.html',
    'produk-hikvision.html',
    'portofolio.html',
    'portfolio.html',
    'kontak-kami.html',
    'artikel.html',
    'artikel-detail.html',
    'gspa-panel-outdoor-1.html',
    'samsung-smpa-outdoor-1.html',
    'hikvision-hvpa-outdoor-1.html'
  ];
  const viewports = [
    { name: 'desktop-1440', w: 1440, h: 900 },
    { name: 'laptop-1280', w: 1280, h: 800 },
    { name: 'tablet-768', w: 768, h: 1024 },
    { name: 'mobile-390', w: 390, h: 844 },
    { name: 'mobile-320', w: 320, h: 720 }
  ];
  const base = 'file:///c:/Users/THINKPAD/Desktop/jual-videotron-outdoor-jakarta/';
  const lines = [];
  let problems = 0;

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    for (const file of pages) {
      const consoleErrors = [];
      const onConsole = (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 120)); };
      page.on('console', onConsole);
      try {
        await page.goto(base + file, { waitUntil: 'load', timeout: 30000 });
        await page.waitForTimeout(500);
        const a = await page.evaluate(() => {
          const de = document.documentElement;
          const vw = window.innerWidth;
          const overflowing = [];
          document.querySelectorAll('body *').forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.width < 1 || r.height < 1) return;
            if (r.right > vw + 2 || r.left < -2) {
              const cls = (typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
              overflowing.push(el.tagName + (cls ? '.' + cls : '') + ' [L' + Math.round(r.left) + ' R' + Math.round(r.right) + ']');
            }
          });
          return { diff: de.scrollWidth - vw, overflowing: overflowing.slice(0, 6) };
        });
        const flags = [];
        if (a.diff > 0) flags.push('OVERFLOW+' + a.diff);
        if (a.overflowing.length) flags.push('els=' + a.overflowing.length + '(' + a.overflowing.join('; ') + ')');
        if (consoleErrors.length) flags.push('JSERR=' + consoleErrors.length + '(' + consoleErrors.join(' | ') + ')');
        if (flags.length) problems++;
        lines.push(`${vp.name.padEnd(13)} ${file.padEnd(22)} ${flags.length ? flags.join(' ') : 'OK'}`);
      } catch (e) {
        problems++;
        lines.push(`${vp.name.padEnd(13)} ${file.padEnd(22)} ERROR ${String(e).slice(0, 100)}`);
      }
      page.off('console', onConsole);
    }
  }
  lines.push('');
  lines.push('TOTAL PROBLEM ROWS: ' + problems);
  return lines.join('\n');
}
