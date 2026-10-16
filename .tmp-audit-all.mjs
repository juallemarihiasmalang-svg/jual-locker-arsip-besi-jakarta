export default async function run(page, ui) {
  const results = [];
  const urls = [
    'http://localhost:4788/index.html',
    'http://localhost:4788/produk-lg.html',
    'http://localhost:4788/produk-samsung.html',
    'http://localhost:4788/produk-hikvision.html',
    'http://localhost:4788/portofolio.html',
    'http://localhost:4788/artikel.html',
    'http://localhost:4788/kontak-kami.html',
    'http://localhost:4788/artikel-detail.html'
  ];

  for (const u of urls) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(u, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1800);
    const r = await page.evaluate(() => {
      const de = document.documentElement;
      const over = [];
      document.querySelectorAll('body *').forEach((el) => {
        const b = el.getBoundingClientRect();
        if (b.width > 0 && (b.right > de.clientWidth + 2 || b.left < -2)) {
          over.push(el.tagName.toLowerCase() + '.' + String(el.className || '').split(' ').slice(0, 2).join('.'));
        }
      });
      const imgs = Array.from(document.images).filter((i) => i.naturalWidth === 0).map((i) => i.getAttribute('src'));
      return {
        title: document.title,
        clientW: de.clientWidth,
        scrollW: de.scrollWidth,
        hOverflow: de.scrollWidth > de.clientWidth,
        overflowCount: over.length,
        overflowSample: Array.from(new Set(over)).slice(0, 12),
        brokenImages: imgs.slice(0, 12),
        brokenCount: imgs.length
      };
    });
    results.push({ url: u, ...r });
  }
  return results;
}
