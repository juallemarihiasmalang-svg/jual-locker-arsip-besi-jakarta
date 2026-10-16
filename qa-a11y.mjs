// Contrast audit for elements changed in the accessibility fix
function parseColor(str) {
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(',').map(s => parseFloat(s.trim()));
  return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
}
function lum({ r, g, b }) {
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(fg, bg) {
  const L1 = lum(fg), L2 = lum(bg);
  const a = Math.max(L1, L2), b = Math.min(L1, L2);
  return +((a + 0.05) / (b + 0.05)).toFixed(2);
}
function effectiveBg(el) {
  let node = el;
  while (node) {
    const c = parseColor(getComputedStyle(node).backgroundColor);
    if (c && c.a === 1) return c;
    node = node.parentElement;
  }
  return { r: 255, g: 255, b: 255, a: 1 };
}

export default async function run(page, ui) {
  const targets = [
    { name: 'lg-series-card (link text)', sel: '.lg-series-card' },
    { name: 'gray-400 token text', sel: '.pd-tbd' },
  ];
  const out = [];
  for (const t of targets) {
    const res = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { found: false };
      const cs = getComputedStyle(el);
      const fontSize = parseFloat(cs.fontSize);
      const weight = parseInt(cs.fontWeight, 10) || 400;
      return { found: true, color: cs.color, fontSize, weight, text: (el.textContent || '').trim().slice(0, 40) };
    }, t.sel);
    if (!res.found) { out.push({ ...t, found: false }); continue; }
    const bg = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      let node = el;
      while (node) {
        const c = getComputedStyle(node).backgroundColor;
        const m = c.match(/rgba?\(([^)]+)\)/);
        if (m) {
          const p = m[1].split(',').map(s => parseFloat(s.trim()));
          if (p[3] === undefined || p[3] === 1) return c;
        }
        node = node.parentElement;
      }
      return 'rgb(255, 255, 255)';
    }, t.sel);
    const fg = parseColor(res.color), bgc = parseColor(bg);
    const large = res.fontSize >= 24 || (res.fontSize >= 18.66 && res.weight >= 700);
    const r = ratio(fg, bgc);
    out.push({ ...t, color: res.color, bg, ratio: r, largeText: large, passAA: r >= (large ? 3 : 4.5) });
  }
  return { viewport: page.viewportSize(), results: out };
}
