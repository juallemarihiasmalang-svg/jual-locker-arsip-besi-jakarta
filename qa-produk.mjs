export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(page.url(), { waitUntil: 'networkidle' });

  const produk = page.locator('.produk');
  await produk.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const info = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.produk-card')];
    return cards.map((c) => {
      const img = c.querySelector('.produk-image img');
      const badge = c.querySelector('.produk-badge');
      const box = c.querySelector('.produk-image').getBoundingClientRect();
      return {
        imgSrc: img ? img.getAttribute('src') : null,
        imgLoaded: img ? img.naturalWidth + 'x' + img.naturalHeight : null,
        imgFit: img ? getComputedStyle(img).objectFit : null,
        badgeText: badge ? badge.textContent.trim() : null,
        cardLeft: Math.round(c.getBoundingClientRect().left),
        cardWidth: Math.round(c.getBoundingClientRect().width),
        imageBoxW: Math.round(box.width),
        imageBoxH: Math.round(box.height),
      };
    });
  });

  await produk.screenshot({ path: 'qa-shots/produk-section.png' });
  return info;
}