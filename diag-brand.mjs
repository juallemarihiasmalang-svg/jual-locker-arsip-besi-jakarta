export default async function run(page, ui) {
  const base = 'file:///c:/Users/THINKPAD/Desktop/jual-videotron-outdoor-jakarta/';
  const pages = ['produk-lg.html', 'produk-samsung.html', 'produk-hikvision.html'];
  const widths = [1440, 1280, 991, 768, 390, 320];
  const lines = [];
  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 900 });
    for (const file of pages) {
      await page.goto(base + file, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(400);
      const info = await page.evaluate(() => {
        const de = document.documentElement;
        const vw = window.innerWidth;
        const hero = document.querySelector('.lg-hero');
        const heroR = hero ? hero.getBoundingClientRect() : null;
        const imgs = Array.from(document.querySelectorAll('.lg-product-image')).slice(0, 3).map((el) => {
          const r = el.getBoundingClientRect();
          return Math.round(r.width) + 'x' + Math.round(r.height);
        });
        const cards = Array.from(document.querySelectorAll('.lg-product-card')).slice(0, 3).map((el) => {
          const r = el.getBoundingClientRect();
          return Math.round(r.width) + 'x' + Math.round(r.height);
        });
        return {
          pageOverflow: de.scrollWidth - vw,
          heroRight: heroR ? Math.round(heroR.right) : null,
          heroW: heroR ? Math.round(heroR.width) : null,
          vw,
          imgs,
          cards
        };
      });
      const flag = info.pageOverflow > 0 ? ' <<< OVERFLOW ' + info.pageOverflow : '';
      lines.push(`w=${String(w).padEnd(5)} ${file.padEnd(20)} heroW=${info.heroW} heroR=${info.heroRight} vw=${info.vw}${flag}`);
      lines.push(`      imgs=[${info.imgs.join(', ')}] cards=[${info.cards.join(', ')}]`);
    }
  }
  return lines.join('\n');
}
