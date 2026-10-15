export default async function run(page, ui) {
  const base = 'file:///c:/Users/THINKPAD/Desktop/jual-videotron-outdoor-jakarta/';
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + 'artikel.html', { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const info = await page.evaluate(() => {
    const vw = window.innerWidth;
    const out = [];
    document.querySelectorAll('.featured-media, .featured-media img, .featured-card').forEach((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      out.push({
        sel: el.tagName + '.' + (typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : ''),
        left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height),
        minHeight: cs.minHeight, aspect: cs.aspectRatio, objectFit: cs.objectFit, position: cs.position
      });
    });
    return { vw, items: out };
  });
  return JSON.stringify(info, null, 2);
}
