export default async function run(page, ui) {
  const base = 'file:///c:/Users/THINKPAD/Desktop/jual-videotron-outdoor-jakarta/';
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base + 'index.html', { waitUntil: 'load' });
  await page.waitForTimeout(600);

  const before = await page.evaluate(() => {
    const card = document.querySelector('.masalah-card');
    const r = card.getBoundingClientRect();
    const grid = document.querySelector('.masalah-grid').getBoundingClientRect();
    return { card: [Math.round(r.left), Math.round(r.right)], grid: [Math.round(grid.left), Math.round(grid.right)] };
  });

  // hover the first card
  const card = await page.$('.masalah-card');
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(600);

  const after = await page.evaluate(() => {
    const de = document.documentElement;
    const vw = window.innerWidth;
    const cards = Array.from(document.querySelectorAll('.masalah-card')).map((el) => {
      const r = el.getBoundingClientRect();
      return [Math.round(r.left), Math.round(r.right)];
    });
    return { vw, pageOverflow: de.scrollWidth - vw, cards };
  });

  return JSON.stringify({ before, after }, null, 2);
}
