export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  const sections = await page.evaluate(() => {
    const els = document.querySelectorAll('header, section, footer');
    return Array.from(els).map((el, i) => {
      const r = el.getBoundingClientRect();
      return { i, top: r.top + window.scrollY, h: r.height, cls: el.className || el.tagName };
    });
  });
  for (const s of sections) {
    if (s.h < 40) continue;
    await page.evaluate((y) => window.scrollTo(0, y), s.top);
    await page.waitForTimeout(350);
    const safe = String(s.cls).replace(/[^a-z0-9-]/gi, '_').slice(0, 40);
    await page.screenshot({ path: `${process.env.OUT_DIR}\\d-${s.i}-${safe}.png` });
  }
  return sections.map(s => `${s.i} ${s.cls} h=${Math.round(s.h)}`);
}
