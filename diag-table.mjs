export default async function run(page, ui) {
  const base = 'file:///c:/Users/THINKPAD/Desktop/jual-videotron-outdoor-jakarta/';
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(base + 'artikel-detail.html', { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const info = await page.evaluate(() => {
    const de = document.documentElement;
    const vw = window.innerWidth;
    const wrap = document.querySelector('.article-table-wrap');
    const table = document.querySelector('.article-table');
    const wr = wrap.getBoundingClientRect();
    const tr = table.getBoundingClientRect();
    return {
      pageScrollW: de.scrollWidth,
      vw: vw,
      pageHOverflow: de.scrollWidth - vw,
      wrapper: { left: Math.round(wr.left), right: Math.round(wr.right), w: Math.round(wr.width), overflowX: getComputedStyle(wrap).overflowX, scrollW: wrap.scrollWidth, clientW: wrap.clientWidth },
      table: { left: Math.round(tr.left), right: Math.round(tr.right), w: Math.round(tr.width) }
    };
  });
  return JSON.stringify(info, null, 2);
}
