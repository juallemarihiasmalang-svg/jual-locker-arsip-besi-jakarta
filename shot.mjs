export default async function run(page, ui) {
  const base = 'file:///c:/Users/THINKPAD/Desktop/jual-videotron-outdoor-jakarta/';
  const outDir = process.env.OUT_DIR;
  const targets = (process.env.TARGETS || 'index.html').split(',');
  const vp = {
    w: parseInt(process.env.VW || '1440', 10),
    h: parseInt(process.env.VH || '900', 10),
    tag: process.env.TAG || 'desktop'
  };
  await page.setViewportSize({ width: vp.w, height: vp.h });
  const results = [];
  for (const t of targets) {
    await page.goto(base + t, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(900);
    const name = t.replace('.html', '');
    await page.screenshot({ path: outDir + '\\' + vp.tag + '-' + name + '-top.png' });
    results.push(name);
  }
  return 'shots: ' + results.join(', ');
}
