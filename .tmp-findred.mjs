export default async function run(page, ui) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:4788/index.html', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(2500);

  const reds = await page.evaluate(() => {
    const isRed = (s) => {
      if (!s) return false;
      let m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (m) {
        const r = +m[1], g = +m[2], b = +m[3];
        return r > 130 && r > g * 1.6 && r > b * 1.6;
      }
      const hex = s.match(/#([0-9a-f]{6})/i) || s.match(/#([0-9a-f]{3})\b/i);
      if (hex) {
        let h = hex[1];
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
        return r > 130 && r > g * 1.6 && r > b * 1.6;
      }
      return false;
    };
    const out = [];
    document.querySelectorAll('*').forEach((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const props = { color: cs.color, backgroundColor: cs.backgroundColor, borderColor: cs.borderTopColor, fill: cs.fill, stroke: cs.stroke, outlineColor: cs.outlineColor };
      for (const [k, v] of Object.entries(props)) {
        if (isRed(v)) {
          out.push({ tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 50), prop: k, val: v, text: (el.textContent || '').trim().slice(0, 40) });
        }
      }
    });
    return out;
  });

  return { redElementCount: reds.length, reds: reds.slice(0, 40) };
}
