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

/** « k × corps » écrit sans coefficient 1 ni « -1 » : 1 → corps, −1 → « -corps », sinon « 2\ln(x) »,
 * « 2(x - 1) », « 2\cdot\dfrac{…}{…} » ; corps mis entre parenthèses si c'est une somme. */
export function coefFoisLatex(k: number, corps: string, somme: boolean): string {
  const c = somme ? `\\left(${corps}\\right)` : corps;
  if (k === 1) return corps;
  if (k === -1) return `-${c}`;
  return !somme && /^([0-9]|\\d?frac)/.test(corps) ? `${k}\\cdot ${corps}` : `${k}${c}`;
}

/** Fraction « K·num / den », signe de K sorti devant (« -\dfrac{2\ln(x)}{x^2} », jamais
 * « \dfrac{-1(x-3)}{x^2} ») ; coefficient 1 omis, numérateur parenthésé s'il est une somme. */
export function fractionCoefLatex(K: number, num: string, numSomme: boolean, den: string): string {
  return `${K < 0 ? "-" : ""}\\dfrac{${coefFoisLatex(Math.abs(K), num, numSomme)}}{${den}}`;
}

/** « x − p » (« x » si p = 0) et son carré (« x^2 », « \left(x - 2\right)^2 »). */
export function xMoinsLatex(p: number): string {
  return `x${termeConstanteLatex(-p)}`;
}
export function carreXMoinsLatex(p: number): string {
  return p === 0 ? "x^2" : `\\left(${xMoinsLatex(p)}\\right)^2`;
}

/** Trinôme x² + βx + γ en LaTeX (termes nuls omis, signes propres). */
export function trinomeLatex(beta: number, gamma: number): string {
  let s = "x^2";
  if (beta !== 0) s += beta > 0 ? ` + ${beta === 1 ? "" : beta}x` : ` - ${beta === -1 ? "" : -beta}x`;
  if (gamma !== 0) s += gamma > 0 ? ` + ${gamma}` : ` - ${-gamma}`;
  return s;
}
