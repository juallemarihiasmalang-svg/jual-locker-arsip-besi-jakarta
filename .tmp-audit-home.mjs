export default async function run(page, ui) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(page.url(), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const info = await page.evaluate(() => {
    const de = document.documentElement;
    const overflowEls = [];
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > de.clientWidth + 2 || r.left < -2)) {
        overflowEls.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className && typeof el.className === 'string') ? el.className.slice(0, 80) : '',
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width)
        });
      }
    });
    return {
      title: document.title,
      clientW: de.clientWidth,
      scrollW: de.scrollWidth,
      bodyChars: document.body.innerText.length,
      overflowCount: overflowEls.length,
      overflowSample: overflowEls.slice(0, 25)
    };
  });

  return info;
}
