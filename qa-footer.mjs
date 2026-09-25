export default async function run(page, ui) {
  await page.goto('file:///C:/Users/THINKPAD/Desktop/jual-locker-arsip-besi-jakarta/index.html')
  await page.waitForTimeout(600)

  const footer = page.locator('footer.footer').first()
  await footer.scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)

  const info = await page.evaluate(() => {
    const f = document.querySelector('footer.footer')
    const grid = f.querySelector('.footer-grid')
    const brand = f.querySelector('.footer-brand')
    const img = f.querySelector('.footer-brand .logo-img')
    const texts = f.querySelector('.footer-brand .logo-text')
    const headings = [...f.querySelectorAll('h4')].map((h) => h.textContent.trim())
    const cols = [...grid.children].map((c) => ({
      cls: c.className,
      heading: c.querySelector('h4') ? c.querySelector('h4').textContent.trim() : null,
      links: [...c.querySelectorAll('a')].map((a) => a.textContent.trim() + ' -> ' + a.getAttribute('href')),
    }))
    const r = img.getBoundingClientRect()
    return {
      gridColumns: getComputedStyle(grid).gridTemplateColumns,
      logoTextSpanPresent: !!texts,
      logoRenderedHeight: Math.round(r.height),
      logoRenderedWidth: Math.round(r.width),
      headings,
      cols,
      brandText: brand.querySelector('p').textContent.trim().slice(0, 40),
      footerHeight: Math.round(f.getBoundingClientRect().height),
    }
  })

  await page.screenshot({ path: 'qa-shots/footer-desktop.png', clip: await footer.boundingBox() })
  return info
}