export default async function run(page, ui) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:4788/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'qa-shots-local-home-mobile.png', fullPage: true });
  const body = await page.evaluate(() => document.body.innerText.length);
  return { bodyChars: body };
}
