export default async function run(page, ui) {
  const results = await page.evaluate(() => {
    function lum(c) {
      const m = c.match(/\d+(\.\d+)?/g).map(Number);
      const [r, g, b] = m.slice(0, 3).map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    function ratio(a, b) {
      const l1 = lum(a), l2 = lum(b);
      const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
      return (hi + 0.05) / (lo + 0.05);
    }
    function bg(el) {
      let e = el;
      while (e) {
        const c = getComputedStyle(e).backgroundColor;
        if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c;
        e = e.parentElement;
      }
      return 'rgb(255, 255, 255)';
    }
    const sels = ['.lg-series-card', '.lg-series-card p', '.lg-series-cta', '.lg-series-heading'];
    const out = [];
    for (const s of sels) {
      document.querySelectorAll(s).forEach((el, i) => {
        if (i > 0) return;
        const cs = getComputedStyle(el);
        const color = cs.color;
        const size = parseFloat(cs.fontSize);
        const weight = parseInt(cs.fontWeight) || 400;
        const large = size >= 24 || (size >= 18.66 && weight >= 700);
        const b = bg(el);
        const r = ratio(color, b);
        const need = large ? 3 : 4.5;
        out.push({ sel: s, text: (el.textContent || '').trim().slice(0, 25), color, bg: b, fontSize: size, weight, ratio: +r.toFixed(2), required: need, pass: r >= need });
      });
    }
    return out;
  });
  return results;
}
