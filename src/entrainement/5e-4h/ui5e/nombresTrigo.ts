/**
 * Écriture des nombres des générateurs 5gen54–5gen57 (5e ch. 2) : virgule décimale `{,}`, « − »
 * typographique en texte, rationnels exacts (`Q`) et multiples rationnels de π (angles exacts).
 * Une seule source pour l'écran, les aides, le papier et le corrigé.
 */

export function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Rationnel exact n/d (d > 0, réduit). */
export interface Q {
  n: number;
  d: number;
}

export function q(n: number, d = 1): Q {
  if (d === 0) throw new Error("q : dénominateur nul");
  const s = d < 0 ? -1 : 1;
  const g = pgcd(n, d);
  return { n: (s * n) / g, d: (s * d) / g };
}
export const qAdd = (a: Q, b: Q): Q => q(a.n * b.d + b.n * a.d, a.d * b.d);
export const qSub = (a: Q, b: Q): Q => q(a.n * b.d - b.n * a.d, a.d * b.d);
export const qMul = (a: Q, b: Q): Q => q(a.n * b.n, a.d * b.d);
export const qDiv = (a: Q, b: Q): Q => q(a.n * b.d, a.d * b.n);
export const qVal = (a: Q): number => a.n / a.d;
export const qEq = (a: Q, b: Q): boolean => a.n === b.n && a.d === b.d;

/** Arrondi à `dec` décimales, zéros finaux retirés sauf si `fixe`. */
function chaine(x: number, dec: number, fixe: boolean): string {
  const f = 10 ** dec;
  const r = Math.round(x * f) / f;
  let s = Math.abs(r).toFixed(dec);
  if (!fixe && s.includes(".")) s = s.replace(/\.?0+$/, "");
  const neg = r < 0 && Number(s) !== 0;
  return (neg ? "-" : "") + s;
}

/** Nombre en LaTeX (virgule `{,}`). */
export function nbL(x: number, dec = 2, fixe = false): string {
  return chaine(x, dec, fixe).replace(".", "{,}");
}

/** Nombre en texte brut (virgule, « − »). */
export function nbT(x: number, dec = 2, fixe = false): string {
  return chaine(x, dec, fixe).replace(".", ",").replace("-", "−");
}

/** Un nombre s'écrit-il exactement avec au plus `dec` décimales ? */
export function exactA(x: number, dec: number): boolean {
  const f = 10 ** dec;
  return Math.abs(x * f - Math.round(x * f)) < 1e-7;
}

/** « = 1,5 » si la valeur est exacte à `dec` décimales, sinon « \approx 1,53 ». */
export function egalL(x: number, dec = 2): string {
  return `${exactA(x, dec) ? "=" : "\\approx"} ${nbL(x, dec)}`;
}

/** Facteur entre parenthèses s'il est négatif (substitution). */
export function parL(x: number, dec = 2): string {
  return x < 0 ? `(${nbL(x, dec)})` : nbL(x, dec);
}

/** Rationnel en LaTeX : « \dfrac{4}{3} », « -\dfrac{1}{2} », « 5 ». */
export function qL(a: Q): string {
  if (a.d === 1) return `${a.n}`;
  return `${a.n < 0 ? "-" : ""}\\dfrac{${Math.abs(a.n)}}{${a.d}}`;
}

/** Rationnel en texte (« 4/3 », « −1/2 »). */
export function qT(a: Q): string {
  const s = a.d === 1 ? `${Math.abs(a.n)}` : `${Math.abs(a.n)}/${a.d}`;
  return a.n < 0 ? `−${s}` : s;
}

/** Multiple rationnel de π en LaTeX : « \dfrac{5\pi}{6} », « -\dfrac{\pi}{6} », « \pi », « 0 », « 2\pi ». */
export function piL(a: Q): string {
  if (a.n === 0) return "0";
  const signe = a.n < 0 ? "-" : "";
  const num = Math.abs(a.n) === 1 ? "\\pi" : `${Math.abs(a.n)}\\pi`;
  return a.d === 1 ? `${signe}${num}` : `${signe}\\dfrac{${num}}{${a.d}}`;
}

/** Multiple rationnel de π en texte (« 5π/6 », « −π/6 »). */
export function piT(a: Q): string {
  if (a.n === 0) return "0";
  const num = Math.abs(a.n) === 1 ? "π" : `${Math.abs(a.n)}π`;
  const s = a.d === 1 ? num : `${num}/${a.d}`;
  return a.n < 0 ? `−${s}` : s;
}

/** Ramène un multiple rationnel de π dans ]−π ; π]. */
export function reduirePi(a: Q): Q {
  let r = a;
  while (qVal(r) > 1 + 1e-12) r = qSub(r, q(2));
  while (qVal(r) <= -1 + 1e-12) r = qAdd(r, q(2));
  return r;
}

/** Ramène un angle (flottant) dans ]−π ; π]. */
export function reduireAngle(x: number): number {
  let r = x % (2 * Math.PI);
  if (r > Math.PI + 1e-12) r -= 2 * Math.PI;
  if (r <= -Math.PI + 1e-12) r += 2 * Math.PI;
  return r;
}

/** Valeur exacte d'un sinus/cosinus remarquable : « \dfrac{1}{2} », « -\dfrac{\sqrt{3}}{2} »… */
export function valeurRemarquableL(v: number): string | null {
  const table: [number, string][] = [
    [0, "0"],
    [0.5, "\\dfrac{1}{2}"],
    [Math.SQRT2 / 2, "\\dfrac{\\sqrt{2}}{2}"],
    [Math.sqrt(3) / 2, "\\dfrac{\\sqrt{3}}{2}"],
    [1, "1"],
  ];
  for (const [x, l] of table) {
    if (Math.abs(Math.abs(v) - x) < 1e-9) return v < 0 && x !== 0 ? `-${l}` : l;
  }
  return null;
}

/** Heures décimales en « 3 h 12 min ». */
export function heureMinutesT(h: number): string {
  const total = Math.round(h * 60);
  const hh = Math.floor(total / 60);
  const mm = total - hh * 60;
  return mm === 0 ? `${hh} h` : `${hh} h ${String(mm).padStart(2, "0")} min`;
}
