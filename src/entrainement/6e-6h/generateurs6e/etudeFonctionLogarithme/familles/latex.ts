/** Forme exacte LaTeX de e^{num/den} (num/den irréductible ou non) : 1, e, 1/e, √e, 1/√e, e^{n},
 * 1/e^{n}, e^{p/q}. */
export function puissanceELatex(num: number, den: number): string {
  const g = pgcd(Math.abs(num), Math.abs(den)) || 1;
  const n = num / g;
  const d = den / g;
  if (n === 0) return "1";
  if (d === 1) {
    if (n === 1) return "e";
    if (n === -1) return "\\dfrac{1}{e}";
    return n > 0 ? `e^{${n}}` : `\\dfrac{1}{e^{${-n}}}`;
  }
  if (d === 2 && Math.abs(n) === 1) return n > 0 ? "\\sqrt{e}" : "\\dfrac{1}{\\sqrt{e}}";
  return n > 0 ? `e^{${n}/${d}}` : `\\dfrac{1}{e^{${-n}/${d}}}`;
}

function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

/** Terme signé « + 3 », « − 2 » (vide si 0), en LaTeX. */
export function termeConstanteLatex(v: number): string {
  if (v === 0) return "";
  return v > 0 ? ` + ${v}` : ` - ${-v}`;
}

/** Préfixe multiplicatif d'un ln : « » (1), « - » (−1), « 2 », « -2 ». */
export function coefficientLatex(m: number): string {
  if (m === 1) return "";
  if (m === -1) return "-";
  return String(m);
}

/** Trinôme x² + βx + γ en LaTeX (termes nuls omis, signes propres). */
export function trinomeLatex(beta: number, gamma: number): string {
  let s = "x^2";
  if (beta !== 0) s += beta > 0 ? ` + ${beta === 1 ? "" : beta}x` : ` - ${beta === -1 ? "" : -beta}x`;
  if (gamma !== 0) s += gamma > 0 ? ` + ${gamma}` : ` - ${-gamma}`;
  return s;
}
