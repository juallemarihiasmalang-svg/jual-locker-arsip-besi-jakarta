export default async function run(page, ui) {
  await page.goto('file:///C:/Users/THINKPAD/Desktop/jual-locker-arsip-besi-jakarta/index.html')
  await page.waitForTimeout(600)

  const links = ['#beranda', '#artikel', '#keunggulan', '#kontak']
  const colorOf = (sel) => page.locator(`.nav-links a[href="${sel}"]`).first()
    .evaluate((n) => getComputedStyle(n).color)

  // Hover Beranda first (this is also the section in view -> used to get is-active)
  await page.locator('.nav-links a[href="#beranda"]').first().hover()
  await page.waitForTimeout(500)
  const firstHover = await colorOf('#beranda')
  const othersWhileFirst = {}
  for (const s of ['#artikel', '#keunggulan', '#kontak']) othersWhileFirst[s] = await colorOf(s)

  // Now move the cursor to Artikel and check Beranda releases the blue
  await page.locator('.nav-links a[href="#artikel"]').first().hover()
  await page.waitForTimeout(500)
  const afterMove = {}
  afterMove['#artikel'] = await colorOf('#artikel')
  afterMove['#beranda'] = await colorOf('#beranda')

  // Move to dropdown toggle, then away from the nav entirely
  await page.locator('.dropdown-toggle').hover()
  await page.waitForTimeout(500)
  const toggleHover = await page.locator('.dropdown-toggle')
    .evaluate((n) => getComputedStyle(n).color)
  const berandaAfterToggle = await colorOf('#beranda')

  await page.locator('.hero-content').first().hover()
  await page.waitForTimeout(500)
  const allReleased = {}
  for (const s of links) allReleased[s] = await colorOf(s)
  allReleased['.dropdown-toggle'] = await page.locator('.dropdown-toggle')
    .evaluate((n) => getComputedStyle(n).color)

  await page.screenshot({ path: 'qa-shots/nav-hover-final.png' })
  return {
    'hover #beranda, others idle': { firstHover, othersWhileFirst },
    'cursor moved to #artikel': afterMove,
    'cursor on dropdown-toggle': { toggleHover, berandaAfterToggle },
    'cursor left nav (all should be slate rgb(71,85,105))': allReleased,
  }
}