export default async function run(page, ui) {
  const results = {};

  const measure = async () => page.evaluate(() => {
    const hero = document.querySelector('.hero');
    const img = document.querySelector('.hero-bg-image');
    const h1 = document.querySelector('.hero h1');
    const desc = document.querySelector('.hero-desc');
    const cs = (el, p) => getComputedStyle(el, p);
    const r = hero.getBoundingClientRect();
    return {
      heroW: Math.round(r.width),
      heroH: Math.round(r.height),
      ratio: +(r.width / r.height).toFixed(2),
      imgLoaded: img ? img.naturalWidth + 'x' + img.naturalHeight : 'none',
      objectFit: img ? cs(img).objectFit : null,
      objectPosition: img ? cs(img).objectPosition : null,
      containerDisplay: cs(hero.querySelector('.container')).display,
      overlay: cs(hero, '::before').backgroundImage.slice(0, 40),
      h1Color: h1 ? cs(h1).color : null,
      descColor: desc ? cs(desc).color : null,
      h1Font: h1 ? cs(h1).fontFamily : null,
    };
  });

  // ---- Desktop ----
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(page.url(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  results.desktop = await measure();
  await page.screenshot({ path: 'qa-shots/hero-desktop.png' });

  // ---- Tablet ----
  await page.setViewportSize({ width: 900, height: 800 });
  await page.waitForTimeout(300);
  results.tablet = await measure();
  await page.screenshot({ path: 'qa-shots/hero-tablet.png' });

  // ---- Mobile ----
  await page.setViewportSize({ width: 390, height: 780 });
  await page.waitForTimeout(300);
  results.mobile = await measure();
  await page.screenshot({ path: 'qa-shots/hero-mobile.png' });

  return results;
}