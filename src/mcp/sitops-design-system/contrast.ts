/**
 * WCAG 2.x contrast maths (A11Y-001, A11Y-002). Pure functions so the tool and
 * the tests share one implementation.
 */
export function parseHex(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`not a hex colour: "${hex}"`);
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

export interface ContrastVerdict {
  ratio: number;
  /** A11Y-001: body text needs 4.5:1 */
  textAA: boolean;
  /** A11Y-001: large text (≥ 24 px or ≥ 19 px bold) needs 3:1 */
  largeTextAA: boolean;
  /** A11Y-002: UI components and graphics need 3:1 */
  nonText: boolean;
}

export function judgeContrast(foreground: string, background: string): ContrastVerdict {
  const ratio = Math.round(contrastRatio(foreground, background) * 100) / 100;
  return { ratio, textAA: ratio >= 4.5, largeTextAA: ratio >= 3, nonText: ratio >= 3 };
}
