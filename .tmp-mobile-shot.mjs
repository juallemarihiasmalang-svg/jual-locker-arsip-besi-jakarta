export default async function run(page, ui) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: '.tmp-index-mobile.png', fullPage: false });
  await page.screenshot({ path: '.tmp-index-mobile-full.png', fullPage: true });
  const info = await page.evaluate(() => ({
    w: document.documentElement.clientWidth,
    sw: document.documentElement.scrollWidth,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    h: document.body.scrollHeight
  }));
  return info;
}
