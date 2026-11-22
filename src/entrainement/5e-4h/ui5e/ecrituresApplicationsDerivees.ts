/**
 * Écritures communes des générateurs 5gen68–5gen70 (5e ch. 5, « Dérivées et applications ») :
 * décimaux à virgule (`{,}` en KaTeX, « , » et « − » en texte), polynômes à coefficients décimaux,
 * notation scientifique, systèmes 2 × 2 en a et b. Aucune notation clavier ; source unique de
 * l'écran, du papier et du corrigé.
 */

/** Nombre nettoyé du bruit flottant (12 chiffres significatifs). */
export const net = (v: number): number => (v === 0 ? 0 : Number(v.toPrecision(12)));

/** Décimal en LaTeX : « 2{,}005 », « -0{,}25 », « 3 » (au plus `dec` décimales). */
export function decL(v: number, dec = 10): string {
  const x = net(v);
  if (Object.is(x, -0) || x === 0) return "0";
  const f = 10 ** dec;
  const r = Math.round(x * f) / f;
  const s = Math.abs(r).toFixed(dec).replace(/\.?0+$/, "");
  return `${r < 0 ? "-" : ""}${s.replace(".", "{,}")}`;
}

/** Décimal en texte brut : « 2,005 », « −0,25 ». */
export function decT(v: number, dec = 10): string {
  return decL(v, dec).replace("{,}", ",").replace(/^-/, "−");
}

/** Décimal entre parenthèses s'il est négatif (facteur d'un produit). */
export const parD = (v: number): string => (net(v) < 0 ? `(${decL(v)})` : decL(v));

/** « + 0{,}5 », « - 3 » collés, rien pour 0. */
export const plusD = (v: number): string => (net(v) === 0 ? "" : net(v) > 0 ? `+${decL(v)}` : decL(v));

/** Polynôme à coefficients décimaux, du plus haut degré au plus bas (« -0{,}5t^2+4t+12 »). */
export function polyDL(coefs: number[], v = "x"): string {
  const deg = coefs.length - 1;
  let s = "";
  coefs.forEach((c0, i) => {
    const c = net(c0);
    const p = deg - i;
    if (c === 0) return;
    const abs = Math.abs(c);
    const signe = c < 0 ? "-" : s === "" ? "" : "+";
    const coef = p === 0 ? decL(abs) : abs === 1 ? "" : decL(abs);
    const varP = p === 0 ? "" : p === 1 ? v : `${v}^${p}`;
    s += `${signe}${coef}${varP}`;
  });
  return s === "" ? "0" : s;
}

/** Valeur d'un polynôme (coefficients du plus haut degré au plus bas). */
export function polyVal(coefs: number[], x: number): number {
  return coefs.reduce((acc, c) => acc * x + c, 0);
}

/** Dérivée d'un polynôme (mêmes conventions). */
export function polyDerivee(coefs: number[]): number[] {
  const deg = coefs.length - 1;
  return coefs.slice(0, -1).map((c, i) => net(c * (deg - i)));
}

/** Arrondi à `sf` chiffres significatifs. */
export function arrondiSignificatif(v: number, sf = 2): number {
  if (v === 0) return 0;
  const e = Math.floor(Math.log10(Math.abs(v)));
  const f = 10 ** (sf - 1 - e);
  return Math.round(v * f) / f;
}

/** Petit nombre en notation scientifique (« 6{,}2\cdot 10^{-6} ») ; décimal si ≥ 0,001. */
export function sciL(v: number, sf = 2): string {
  const r = arrondiSignificatif(v, sf);
  if (r === 0) return "0";
  if (Math.abs(r) >= 1e-3) return decL(r);
  const e = Math.floor(Math.log10(Math.abs(r)));
  const m = net(r / 10 ** e);
  return `${decL(m)}\\cdot 10^{${e}}`;
}

/** Décimal tronqué/arrondi à `dec` décimales, écrit en entier (affichage d'une calculatrice). */
export function arrondiDecimales(v: number, dec: number): number {
  const f = 10 ** dec;
  return Math.round(v * f) / f;
}

/** Nombre de décimales d'un décimal (au plus 12). */
export function nombreDecimales(v: number): number {
  const s = net(v).toString();
  if (s.includes("e")) return 12;
  const p = s.indexOf(".");
  return p < 0 ? 0 : s.length - p - 1;
}

// ============================================================================
// Équations linéaires en a et b (5gen69).
// ============================================================================

/** Équation α·a + β·b = γ. */
export interface EquationAB {
  al: number;
  be: number;
  ga: number;
}

/** « 12a+4b=-3 », « a-b=2 », « 2b=0 ». */
export function equationABL(e: EquationAB): string {
  const terme = (c: number, v: string, premier: boolean): string => {
    if (c === 0) return "";
    const signe = c < 0 ? "-" : premier ? "" : "+";
    const abs = Math.abs(c);
    return `${signe}${abs === 1 ? "" : abs}${v}`;
  };
  const ta = terme(e.al, "a", true);
  const tb = terme(e.be, "b", ta === "");
  return `${ta}${tb === "" && ta === "" ? "0" : tb}=${e.ga}`;
}

/** Système en accolade (KaTeX). */
export const systemeL = (e1: EquationAB, e2: EquationAB): string => `\\begin{cases}${equationABL(e1)}\\\\${equationABL(e2)}\\end{cases}`;

/** Même équation (à un facteur non nul près). */
export function equationsProportionnelles(e1: EquationAB, e2: EquationAB): boolean {
  const v1 = [e1.al, e1.be, e1.ga];
  const v2 = [e2.al, e2.be, e2.ga];
  // Produits en croix nuls deux à deux.
  return v1[0] * v2[1] === v1[1] * v2[0] && v1[0] * v2[2] === v1[2] * v2[0] && v1[1] * v2[2] === v1[2] * v2[1];
}

/** Deux systèmes équivalents (mêmes équations, à l'ordre et à un facteur près). */
export function memesSystemes(s1: [EquationAB, EquationAB], s2: [EquationAB, EquationAB]): boolean {
  const p = equationsProportionnelles;
  return (p(s1[0], s2[0]) && p(s1[1], s2[1])) || (p(s1[0], s2[1]) && p(s1[1], s2[0]));
}

export function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}
