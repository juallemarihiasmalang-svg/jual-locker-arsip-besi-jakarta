export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  });
  await page.waitForTimeout(500);

  const report = await page.evaluate(() => {
    const grid = (sel) => getComputedStyle(document.querySelector(sel)).gridTemplateColumns;
    const faqItems = [...document.querySelectorAll('.faq-item')];
    const rowsOf = (items) => {
      const tops = new Set(items.map((el) => Math.round(el.getBoundingClientRect().top)));
      return tops.size;
    };
    const keunggulanCards = [...document.querySelectorAll('.keunggulan-card')];
    const keunggulanH = keunggulanCards.map((el) => Math.round(el.getBoundingClientRect().height));

    return {
      navItems: [...document.querySelectorAll('.nav-links a')].map((a) => a.textContent.trim()),
      navCta: document.querySelector('.nav-cta').textContent.trim(),
      mobileNavItems: [...document.querySelectorAll('.mobile-nav a')].map((a) => a.textContent.trim()),
      faqCols: grid('.faq-grid'),
      faqRows: rowsOf(faqItems),
      faqCount: faqItems.length,
      keunggulanCols: grid('.keunggulan-grid'),
      keunggulanRows: rowsOf(keunggulanCards),
      keunggulanCount: keunggulanCards.length,
      keunggulanHeights: keunggulanH,
      keunggulanEqualHeights: new Set(keunggulanH).size === 1,
      footerBg: getComputedStyle(document.querySelector('.footer')).background.slice(0, 90),
      bodyBg: getComputedStyle(document.body).backgroundImage.slice(0, 60),
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  });

  await page.screenshot({ path: 'qa-shots/color-full.png', fullPage: true });

  // FAQ region in final state
  await page.evaluate(() => document.querySelector('#faq').scrollIntoView());
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'qa-shots/color-faq.png' });

  await page.evaluate(() => document.querySelector('#keunggulan').scrollIntoView());
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'qa-shots/color-keunggulan.png' });

  return report;
}
