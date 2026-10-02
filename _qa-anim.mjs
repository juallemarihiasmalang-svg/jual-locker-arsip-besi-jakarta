const BASE = 'file:///c:/Users/THINKPAD/Desktop/jual-locker-arsip-besi-jakarta/';
const PAGES = [
  'index.html', 'artikel.html', 'artikel-detail.html', 'portofolio.html', 'portfolio.html',
  'produk-lg.html', 'produk-samsung.html', 'produk-hikvision.html', 'kontak-kami.html',
  'index-videotron-outdoor.html', 'gspa-panel-indoor-1.html', 'hikvision-hvpa-unit-1.html',
  'samsung-smpa-unit-1.html'
];

async function check(page, p, scroll) {
  await page.goto(BASE + p);
  await page.waitForLoadState('load');
  await page.waitForTimeout(300);
  if (scroll) {
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.6;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 90));
      }
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 250));
    });
  } else {
    await page.waitForTimeout(3200);
  }
  return await page.evaluate(() => {
    const rv = Array.from(document.querySelectorAll('.reveal'));
    const hidden = rv.filter(e => parseFloat(getComputedStyle(e).opacity) < 0.9);
    return {
      revealCount: rv.length,
      stillHidden: hidden.length,
      sampleHidden: hidden.slice(0, 3).map(e => e.className.split(' ')[0]),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
}

export default async function run(page, ui) {
  await page.setViewportSize({ width: 1280, height: 900 });
  const afterScroll = [], noScroll = [];

  for (const p of PAGES) {
    afterScroll.push({ page: p, ...(await check(page, p, true)) });
  }
  for (const p of ['index.html', 'artikel.html', 'kontak-kami.html']) {
    noScroll.push({ page: p, ...(await check(page, p, false)) });
  }

  return {
    scrolledFailures: afterScroll.filter(o => o.stillHidden > 0 || o.overflow > 0),
    noScrollFailures: noScroll.filter(o => o.stillHidden > 0),
    sample: afterScroll.slice(0, 4),
    noScrollDetail: noScroll
  };
}
