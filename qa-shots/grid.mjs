export default async function run(page, ui) {
  const outDir = process.env.OUT_DIR;
  const results = [];
  const sizes = [
    { name: 'desktop', w: 1440, h: 900 },
    { name: 'laptop', w: 1280, h: 800 },
    { name: 'tablet', w: 820, h: 1100 },
    { name: 'mobile', w: 390, h: 844 },
    { name: 'mobile-sm', w: 360, h: 780 },
  ];
  const targets = [
    { sel: 'header.header', label: 'header' },
    { sel: '.hero', label: 'hero' },
    { sel: '.masalah', label: 'masalah' },
    { sel: '.solusi', label: 'solusi' },
    { sel: '.produk', label: 'produk' },
    { sel: '.keunggulan', label: 'keunggulan' },
    { sel: '.artikel', label: 'artikel' },
    { sel: '.faq', label: 'faq' },
    { sel: '.cta-section', label: 'cta' },
    { sel: '.footer', label: 'footer' },
  ];
  for (const s of sizes) {
    await page.setViewportSize({ width: s.w, height: s.h });
    await page.waitForTimeout(500);
    for (const t of targets) {
      const el = await page.$(t.sel);
      if (!el) continue;
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(350);
      const box = await el.boundingBox();
      await page.screenshot({
        path: `${outDir}\\${s.name}-${t.label}.png`,
        clip: box ? { x: 0, y: Math.max(0, box.y), width: s.w, height: Math.min(box.height, s.h) } : undefined,
      });
    }
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      const bad = [];
      document.querySelectorAll('*').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1)) {
          bad.push({ tag: el.tagName, cls: String(el.className).slice(0, 40), left: Math.round(r.left), right: Math.round(r.right) });
        }
      });
      return { docW: de.scrollWidth, winW: window.innerWidth, count: bad.length, sample: bad.slice(0, 8) };
    });
    results.push({ size: s.name, ...overflow });
  }
  return results;
}
