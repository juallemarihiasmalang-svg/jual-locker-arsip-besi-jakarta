export default async function run(page, ui) {
  const url = 'file:///C:/Users/THINKPAD/Desktop/jual-locker-arsip-besi-jakarta/index.html'
  const sizes = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 820, height: 1180 },
    { name: 'mobile', width: 390, height: 844 },
  ]

  const out = []
  for (const s of sizes) {
    await page.setViewportSize({ width: s.width, height: s.height })
    await page.goto(url)
    await page.waitForTimeout(700)

    const data = await page.evaluate(() => {
      const hero = document.querySelector('.hero')
      const media = document.querySelector('.hero-media')
      const img = document.querySelector('.hero-bg-image')
      const content = document.querySelector('.hero-content')
      const header = document.querySelector('.header')
      const next = document.querySelector('.masalah')
      const hr = hero.getBoundingClientRect()
      const cr = content.getBoundingClientRect()
      const ir = img.getBoundingClientRect()
      const cs = getComputedStyle(hero)
      const ics = getComputedStyle(img)
      const paddingTop = parseFloat(cs.paddingTop)
      const paddingBottom = parseFloat(cs.paddingBottom)
      // Does the tall lockers region still sit on the right? sample column bands
      return {
        heroHeight: Math.round(hr.height),
        heroTop: Math.round(hr.top),
        heroMinHeight: cs.minHeight,
        heroCssHeight: cs.height,
        heroOverflow: cs.overflow,
        heroPadding: cs.paddingTop + ' / ' + cs.paddingBottom,
        contentHeight: Math.round(cr.height),
        contentFits: cr.top >= hr.top - 1 && cr.bottom <= hr.bottom + 1,
        contentVerticallyCentered: Math.abs((cr.top - hr.top) - (hr.bottom - cr.bottom)) <= 2,
        gapAboveContent: Math.round(cr.top - hr.top),
        gapBelowContent: Math.round(hr.bottom - cr.bottom),
        headerBottom: Math.round(header.getBoundingClientRect().bottom),
        heroStartsBelowHeader: Math.round(hr.top) >= Math.round(header.getBoundingClientRect().bottom) - 1,
        nextSectionTop: Math.round(next.getBoundingClientRect().top),
        imageObjectFit: ics.objectFit,
        imageObjectPosition: ics.objectPosition,
        imageNatural: img.naturalWidth + 'x' + img.naturalHeight,
        imageRendered: Math.round(ir.width) + 'x' + Math.round(ir.height),
        imageAspectRatio: (img.naturalWidth / img.naturalHeight).toFixed(3),
        renderedAspectRatio: (ir.width / ir.height).toFixed(3),
        imageDistortion: Math.abs((img.naturalWidth / img.naturalHeight) - (ir.width / ir.height)) < 0.35,
        heroInsideViewport: hr.height < window.innerHeight,
        viewportHeight: window.innerHeight,
        paddingTopBottom: { paddingTop, paddingBottom },
      }
    })
    data.size = s.name
    out.push(data)
    await page.screenshot({ path: `qa-shots/hero-${s.name}.png` })
  }
  return out
}