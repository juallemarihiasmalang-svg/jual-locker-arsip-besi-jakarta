export default async function run(page, ui) {
  await page.setViewportSize({ width: 390, height: 844 });

  const failed = [];
  page.on('response', (r) => {
    if (r.status() >= 400) failed.push(r.status() + ' ' + r.url());
  });
  page.on('requestfailed', (r) => {
    failed.push('FAILED ' + r.url() + ' :: ' + (r.failure() && r.failure().errorText));
  });

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

  const out = [];
  for (const u of urls) {
    const before = failed.length;
    await page.goto(u, { waitUntil: 'networkidle' }).catch(() => { });
    // scroll through the page so lazy images load
    await page.evaluate(async () => {
      const step = window.innerHeight;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1200);

    const r = await page.evaluate(() => {
      const de = document.documentElement;
      const broken = Array.from(document.images)
        .filter((i) => i.complete && i.naturalWidth === 0)
        .map((i) => i.getAttribute('src'));
      return {
        title: document.title,
        hOverflow: de.scrollWidth > de.clientWidth,
        scrollW: de.scrollWidth,
        brokenImages: Array.from(new Set(broken))
      };
    });
    out.push({ url: u, ...r, netFailures: failed.slice(before) });
  }
  return out;
}
