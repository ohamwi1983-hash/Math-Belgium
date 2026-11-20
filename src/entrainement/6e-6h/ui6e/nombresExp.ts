/**
 * Écritures exactes partagées par 6gen144–6gen147 (6e ch. 2, lot G) : rationnels `Q`, décimaux à
 * virgule `{,}` (espace fine des milliers), coefficients devant une lettre, termes signés. Aucune
 * notation clavier : tout ce qui sort d'ici est du LaTeX.
 */

export interface Q {
  n: number;
  d: number;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function q(n: number, d = 1): Q {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = pgcd(n, d);
  return { n: n / g, d: d / g };
}

export const qVal = (x: Q): number => x.n / x.d;
export const qAdd = (a: Q, b: Q): Q => q(a.n * b.d + b.n * a.d, a.d * b.d);
export const qSub = (a: Q, b: Q): Q => q(a.n * b.d - b.n * a.d, a.d * b.d);
export const qMul = (a: Q, b: Q): Q => q(a.n * b.n, a.d * b.d);
export const qDiv = (a: Q, b: Q): Q => q(a.n * b.d, a.d * b.n);
export const qEgal = (a: Q, b: Q): boolean => a.n === b.n && a.d === b.d;

/** Fraction réduite en LaTeX (`\dfrac`), entier seul si d = 1, « − » devant. */
export function qL(x: Q, frac = "\\dfrac"): string {
  if (x.d === 1) return `${x.n}`;
  return `${x.n < 0 ? "-" : ""}${frac}{${Math.abs(x.n)}}{${x.d}}`;
}

/** Fraction en ligne (exposant, indice) : `\frac`. */
export const qLi = (x: Q): string => qL(x, "\\frac");

/** Décimal exact (au plus `max` décimales, zéros inutiles retirés) en LaTeX : virgule `{,}`,
 * espace fine des milliers à partir de 10 000. */
export function decL(x: number, max = 6): string {
  const s = Math.abs(x).toFixed(max).replace(/\.?0+$/, "");
  const [ent, dec] = s.split(".");
  const entier = ent.length > 4 ? ent.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : ent;
  const corps = dec ? `${entier}{,}${dec}` : entier;
  return `${x < 0 && Number(s) !== 0 ? "-" : ""}${corps}`;
}

/** Même décimal en texte (virgule, espace fine insécable, « − »). */
export function decT(x: number, max = 6): string {
  return decL(x, max).replace(/\{,\}/g, ",").replace(/\\,/g, " ").replace(/^-/, "−");
}

/** Le nombre est-il un décimal à au plus `max` décimales ? */
export function estDecimal(x: number, max = 4): boolean {
  return Math.abs(x * 10 ** max - Math.round(x * 10 ** max)) < 1e-7;
}

/** Rationnel écrit en décimal s'il l'est (≤ 4 décimales), sinon en fraction. */
export function qDecL(x: Q): string {
  const v = qVal(x);
  return estDecimal(v, 4) ? decL(v, 4) : qL(x);
}

/** Coefficient devant une expression : « », « − », « 3 », « −3 ». */
export function coefL(c: number): string {
  if (c === 1) return "";
  if (c === -1) return "-";
  return `${c}`;
}

/** Terme signé (après un premier terme) : « + 3 », « − 3 », « » si nul. */
export function termeL(c: number, suffixe = ""): string {
  if (c === 0) return "";
  const abs = Math.abs(c);
  const corps = suffixe && abs === 1 ? suffixe : `${abs}${suffixe}`;
  return c < 0 ? `-${corps}` : `+${corps}`;
}

/** Expression affine m·x + p en LaTeX (« 3x-2 », « -x », « 4 »). */
export function affineL(m: number, p: number, v = "x"): string {
  if (m === 0) return `${p}`;
  return `${coefL(m)}${v}${termeL(p)}`;
}

/** Facteur entre parenthèses s'il est négatif (« (−2) »). */
export const parN = (n: number | string): string => (String(n).startsWith("-") ? `(${n})` : `${n}`);

/** Mélange (Fisher-Yates) avec `Math.random` (rejoué par le `?code=`). */
export function melanger<T>(t: readonly T[]): T[] {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

export function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
