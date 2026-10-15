export default async function run(page, ui) {
  const base = 'file:///c:/Users/THINKPAD/Desktop/jual-videotron-outdoor-jakarta/';
  const widths = [1440, 1280, 1100, 991, 768, 480, 390, 320];
  const lines = [];
  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(base + 'index.html', { waitUntil: 'load' });
    await page.waitForTimeout(500);
    const info = await page.evaluate(() => {
      const de = document.documentElement;
      const vw = window.innerWidth;
      const hc = document.querySelector('.hero-content');
      const h1 = document.querySelector('.hero h1');
      const r = hc.getBoundingClientRect();
      const h1r = h1.getBoundingClientRect();
      return {
        vw,
        pageOverflow: de.scrollWidth - vw,
        contentLeft: Math.round(r.left),
        contentRight: Math.round(r.right),
        h1Left: Math.round(h1r.left),
        marginLeft: getComputedStyle(hc).marginLeft
      };
    });
    const flag = info.pageOverflow > 0 ? '  <<< OVERFLOW ' + info.pageOverflow : '';
    const clip = info.h1Left < 4 ? '  <<< H1 TOO CLOSE TO EDGE' : '';
    lines.push(`w=${String(w).padEnd(5)} marginL=${info.marginLeft.padEnd(9)} content=[${info.contentLeft},${info.contentRight}] h1Left=${info.h1Left}${flag}${clip}`);
  }
  return lines.join('\n');
}
