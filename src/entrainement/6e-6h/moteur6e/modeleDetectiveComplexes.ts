import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type {
  ChampDetectiveComplexes,
  DonneesDetectiveComplexes,
  ExerciceFormeTrigo,
  ExerciceModuleSomme,
  ExerciceMoivre,
  ExercicePuissance,
  ExerciceQuotient,
  ExerciceRacineProduit,
  ExerciceRacines,
  IdDescriptionComplexes,
  TypeErreurComplexes,
} from "../core6e/detectiveComplexes.types";

/**
 * Modèle de 6gen99 « Détective d'erreurs : nombres complexes » : la copie de l'élève fictif (avec
 * son erreur), la même résolution sans erreur (corrigé), la ligne fausse et les valeurs attendues.
 * Source UNIQUE pour l'écran, la vérification et l'adaptateur de feuilles.
 *
 * Toutes les lignes sont construites par le même code, avec ou sans l'erreur (`err`) : la copie
 * reste cohérente avec son erreur (chaque ligne suivante est calculée à partir de la ligne fausse).
 * Valeurs EXACTES partout (entiers, fractions, un seul radical √m, angles kπ/q) : aucune instance
 * n'exige la calculatrice.
 */

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ---------------------------------------------------------------------------------------------
// Réels exacts (n/d)·√m et angles (n/d)·π
// ---------------------------------------------------------------------------------------------

export interface Surd {
  n: number;
  d: number;
  /** Sans facteur carré (1 : rationnel). */
  m: number;
}

function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

/** (n/d)·√m réduit : carrés sortis de la racine, fraction irréductible, dénominateur positif. */
export function surd(n: number, d = 1, m = 1): Surd {
  if (n === 0 || m === 0) return { n: 0, d: 1, m: 1 };
  let k = 1;
  let r = m;
  for (let f = 2; f * f <= r; f++) {
    while (r % (f * f) === 0) {
      r /= f * f;
      k *= f;
    }
  }
  let num = n * k;
  let den = d;
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = pgcd(num, den);
  return { n: num / g, d: den / g, m: r };
}

export const racine = (N: number): Surd => surd(1, 1, N);

export function valeurSurd(s: Surd): number {
  const v = (s.n / s.d) * Math.sqrt(s.m);
  return v === 0 ? 0 : v;
}

export function produitSurd(a: Surd, b: Surd): Surd {
  return surd(a.n * b.n, a.d * b.d, a.m * b.m);
}

/** Carré entier ou rationnel d'un surd (n²·m / d²) — ici toujours entier. */
export function carreSurd(s: Surd): number {
  return (s.n * s.n * s.m) / (s.d * s.d);
}

export function surdLatex(s: Surd): string {
  if (s.n === 0) return "0";
  const signe = s.n < 0 ? "-" : "";
  const an = Math.abs(s.n);
  if (s.m === 1) return s.d === 1 ? `${signe}${an}` : `${signe}\\dfrac{${an}}{${s.d}}`;
  const rac = `\\sqrt{${s.m}}`;
  const num = an === 1 ? rac : `${an}${rac}`;
  return s.d === 1 ? `${signe}${num}` : `${signe}\\dfrac{${num}}{${s.d}}`;
}

/** Valeur exacte non décimale (radical ou fraction de dénominateur autre que 2ᵃ5ᵇ). */
export function surdNonDecimal(s: Surd): boolean {
  if (s.m !== 1) return true;
  let d = s.d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d !== 1;
}

/** Partie imaginaire « b i » (sans signe initial : valeur absolue). */
function partieImaginaire(s: Surd): string {
  const an = Math.abs(s.n);
  if (s.m === 1 && s.d === 1) return an === 1 ? "i" : `${an}i`;
  if (s.m === 1) return `\\dfrac{${an}}{${s.d}}\\,i`;
  const rac = `\\sqrt{${s.m}}`;
  const num = an === 1 ? rac : `${an}${rac}`;
  return s.d === 1 ? `${num}\\,i` : `\\dfrac{${num}}{${s.d}}\\,i`;
}

/** a + bi en LaTeX (parties exactes). */
export function complexeLatex(re: Surd, im: Surd): string {
  if (im.n === 0) return surdLatex(re);
  const pi = partieImaginaire(im);
  if (re.n === 0) return `${im.n < 0 ? "-" : ""}${pi}`;
  return `${surdLatex(re)} ${im.n < 0 ? "-" : "+"} ${pi}`;
}

export const complexeEntierLatex = (x: number, y: number): string => complexeLatex(surd(x), surd(y));

/** Parenthèses autour d'un facteur à élever au carré ou à multiplier (négatif, radical, fraction, i). */
export function par(latex: string): string {
  return /^\d+$/.test(latex) ? latex : `(${latex})`;
}

/** Carré de « bi » écrit (« i^2 », « (-3i)^2 »). */
export function carreI(b: number): string {
  return b === 1 ? "i^2" : `(${coefI(b)})^2`;
}

/** Coefficient de i seul (« 3i », « -i », « i »). */
export function coefI(b: number): string {
  return b === 1 ? "i" : b === -1 ? "-i" : `${b}i`;
}

export interface Angle {
  n: number;
  d: number;
}

export function angle(n: number, d: number): Angle {
  if (n === 0) return { n: 0, d: 1 };
  const g = pgcd(n, d);
  const s = d < 0 ? -1 : 1;
  return { n: (s * n) / g, d: (s * d) / g };
}

export const ajouterAngles = (a: Angle, b: Angle): Angle => angle(a.n * b.d + b.n * a.d, a.d * b.d);
export const multiplierAngle = (a: Angle, k: number): Angle => angle(a.n * k, a.d);
export const diviserAngle = (a: Angle, k: number): Angle => angle(a.n, a.d * k);
export const valeurAngle = (a: Angle): number => (a.n === 0 ? 0 : (a.n * Math.PI) / a.d);

/** « \dfrac{2\pi}{3} », « -\pi », « \dfrac{\pi}{6} » (`frac` : `\frac`, pour un exposant). */
export function angleLatex(a: Angle, frac: "dfrac" | "frac" = "dfrac"): string {
  if (a.n === 0) return "0";
  const signe = a.n < 0 ? "-" : "";
  const an = Math.abs(a.n);
  const num = an === 1 ? "\\pi" : `${an}\\pi`;
  return a.d === 1 ? `${signe}${num}` : `${signe}\\${frac}{${num}}{${a.d}}`;
}

/** Argument d'un cos / sin : parenthèses si négatif. */
function argTrig(a: Angle): string {
  return a.n < 0 ? `\\left(${angleLatex(a)}\\right)` : a.n === 0 ? " 0" : angleLatex(a);
}

/** « k·angle » dans une ligne : parenthèses si négatif. */
function angleFacteur(a: Angle): string {
  return a.n < 0 ? `\\left(${angleLatex(a)}\\right)` : angleLatex(a);
}

/** « α + π » / « α − π » écrit proprement. */
function plusMoinsPi(alpha: Angle, signe: 1 | -1, tours = 1): string {
  const pi = tours === 1 ? "\\pi" : `${tours}\\pi`;
  return `${angleLatex(alpha)} ${signe > 0 ? "+" : "-"} ${pi}`;
}

/** cos et sin exacts d'un multiple de π/6 ou de π/4. */
export function cosSinExacts(a: Angle): { cos: Surd; sin: Surd } {
  let deg = Math.round((a.n * 180) / a.d) % 360;
  if (deg < 0) deg += 360;
  const ref = deg % 90;
  const quadrant = Math.floor(deg / 90);
  const table: Record<number, [Surd, Surd]> = {
    0: [surd(1), surd(0)],
    30: [surd(1, 2, 3), surd(1, 2)],
    45: [surd(1, 2, 2), surd(1, 2, 2)],
    60: [surd(1, 2), surd(1, 2, 3)],
  };
  const [c, s] = table[ref]!;
  const neg = (x: Surd): Surd => surd(-x.n, x.d, x.m);
  switch (quadrant) {
    case 0:
      return { cos: c, sin: s };
    case 1:
      return { cos: neg(s), sin: c };
    case 2:
      return { cos: neg(c), sin: neg(s) };
    default:
      return { cos: s, sin: neg(c) };
  }
}

// ---------------------------------------------------------------------------------------------
// Ligne fausse, description correcte, nombre de lignes
// ---------------------------------------------------------------------------------------------

export function indiceLigneFausse(e: DonneesDetectiveComplexes): number {
  switch (e.type) {
    case "racineOubliee":
    case "sansConjugue":
    case "doubleProduit":
    case "carreBi":
      return 0;
    case "rapportInverse":
    case "denominateur":
    case "carreI2":
    case "moduleOublie":
    case "sommeRacines":
      return 1;
    case "quadrant":
      return e.variante === "racines" ? 1 : 2;
    case "numerateurI2":
    case "termeATerme":
    case "reductionPi":
    case "moduleDivise":
      return 2;
    case "cosSin":
    case "pas2pi":
    case "inegaliteTriangulaire":
      return 3;
    case "racineNegatifs":
      return (e as ExerciceRacineProduit).position - 1;
  }
}

export function typeErreur(e: DonneesDetectiveComplexes): TypeErreurComplexes {
  return e.type;
}

export function descriptionCorrecte(e: DonneesDetectiveComplexes): IdDescriptionComplexes {
  return e.type;
}

export function nombreLignes(e: DonneesDetectiveComplexes): number {
  return e.variante === "racineProduit" ? 6 : e.variante === "racines" ? 5 : 4;
}

// ---------------------------------------------------------------------------------------------
// Données des supports
// ---------------------------------------------------------------------------------------------

/** Forme trigonométrique : directions de module 2, toujours a < 0 et |a| ≠ |b|. */
export const DIRECTIONS_TRIGO: { re: Surd; im: Surd; theta: Angle; alpha: Angle; alphaInverse: Angle; rapport: Surd; rapportInverse: Surd }[] = [
  { re: surd(-1), im: surd(1, 1, 3), theta: angle(2, 3), alpha: angle(-1, 3), alphaInverse: angle(-1, 6), rapport: surd(-1, 1, 3), rapportInverse: surd(-1, 3, 3) },
  { re: surd(-1, 1, 3), im: surd(1), theta: angle(5, 6), alpha: angle(-1, 6), alphaInverse: angle(-1, 3), rapport: surd(-1, 3, 3), rapportInverse: surd(-1, 1, 3) },
  { re: surd(-1), im: surd(-1, 1, 3), theta: angle(-2, 3), alpha: angle(1, 3), alphaInverse: angle(1, 6), rapport: surd(1, 1, 3), rapportInverse: surd(1, 3, 3) },
  { re: surd(-1, 1, 3), im: surd(-1), theta: angle(-5, 6), alpha: angle(1, 6), alphaInverse: angle(1, 3), rapport: surd(1, 3, 3), rapportInverse: surd(1, 1, 3) },
];

/** Moivre : directions de module 2, arguments multiples de π/6 (jamais ±π/4 ni ±3π/4 : cos ≠ sin).
 * `alpha` = arctan(b/a) (différent de `theta` quand a < 0 : correction de ±π à la ligne 1). */
export const DIRECTIONS_MOIVRE: { re: Surd; im: Surd; theta: Angle; alpha: Angle }[] = [
  { re: surd(1, 1, 3), im: surd(1), theta: angle(1, 6), alpha: angle(1, 6) },
  { re: surd(1, 1, 3), im: surd(-1), theta: angle(-1, 6), alpha: angle(-1, 6) },
  { re: surd(1), im: surd(1, 1, 3), theta: angle(1, 3), alpha: angle(1, 3) },
  { re: surd(1), im: surd(-1, 1, 3), theta: angle(-1, 3), alpha: angle(-1, 3) },
  { re: surd(-1), im: surd(1, 1, 3), theta: angle(2, 3), alpha: angle(-1, 3) },
  { re: surd(-1), im: surd(-1, 1, 3), theta: angle(-2, 3), alpha: angle(1, 3) },
  { re: surd(-1, 1, 3), im: surd(1), theta: angle(5, 6), alpha: angle(-1, 6) },
  { re: surd(-1, 1, 3), im: surd(-1), theta: angle(-5, 6), alpha: angle(1, 6) },
];

/** Racines n-ièmes : arguments de w (toujours a < 0) et angle de référence arctan(b/a). */
export const DIRECTIONS_RACINES: { phi: Angle; alpha: Angle; rapport: Surd }[] = [
  { phi: angle(2, 3), alpha: angle(-1, 3), rapport: surd(-1, 1, 3) },
  { phi: angle(-2, 3), alpha: angle(1, 3), rapport: surd(1, 1, 3) },
  { phi: angle(3, 4), alpha: angle(-1, 4), rapport: surd(-1) },
  { phi: angle(-3, 4), alpha: angle(1, 4), rapport: surd(1) },
  { phi: angle(5, 6), alpha: angle(-1, 6), rapport: surd(-1, 3, 3) },
  { phi: angle(-5, 6), alpha: angle(1, 6), rapport: surd(1, 3, 3) },
];

export function zTrigo(e: ExerciceFormeTrigo): { a: Surd; b: Surd } {
  const dir = DIRECTIONS_TRIGO[e.dir]!;
  return { a: produitSurd(surd(e.k), dir.re), b: produitSurd(surd(e.k), dir.im) };
}

export function numerateurQuotient(e: ExerciceQuotient): { a: number; b: number } {
  return { a: e.x * e.c - e.y * e.d, b: e.x * e.d + e.y * e.c };
}

export function moduleMoivre(e: ExerciceMoivre): number {
  return 2 * kMoivre(e);
}

export function kMoivre(e: ExerciceMoivre): number {
  return e.k;
}

export function zMoivre(e: ExerciceMoivre): { a: Surd; b: Surd } {
  const dir = DIRECTIONS_MOIVRE[e.dir]!;
  const k = surd(kMoivre(e));
  return { a: produitSurd(k, dir.re), b: produitSurd(k, dir.im) };
}

export function wRacines(e: ExerciceRacines): { a: Surd; b: Surd } {
  const { cos, sin } = cosSinExacts(DIRECTIONS_RACINES[e.dir]!.phi);
  return { a: produitSurd(surd(e.R), cos), b: produitSurd(surd(e.R), sin) };
}

export function rhoRacines(e: ExerciceRacines): number {
  return Math.round(e.R ** (1 / e.n));
}

// ---------------------------------------------------------------------------------------------
// Résolutions (avec ou sans l'erreur)
// ---------------------------------------------------------------------------------------------

interface Resolution {
  lignes: FragmentConsigne[][];
  champs: ChampDetectiveComplexes[];
}

function champReel(prefixe: string, s: Surd, opts: { angle?: boolean; ensemble?: boolean } = {}): ChampDetectiveComplexes {
  return { genre: "reel", prefixe, valeur: valeurSurd(s), latex: surdLatex(s), angle: false, ensemble: !!opts.ensemble, exacteNonDecimale: surdNonDecimal(s) };
}

function champAngle(prefixe: string, a: Angle, ensemble = false): ChampDetectiveComplexes {
  return { genre: "reel", prefixe, valeur: valeurAngle(a), latex: angleLatex(a), angle: true, ensemble, exacteNonDecimale: a.n !== 0 };
}

function champComplexe(prefixe: string, re: Surd, im: Surd): ChampDetectiveComplexes {
  return { genre: "complexe", prefixe, re: valeurSurd(re), im: valeurSurd(im), latex: complexeLatex(re, im) };
}

/** Somme de termes « coef·symbole » écrite avec ses signes (termes nuls omis). */
function sommeTermes(termes: [number, string][]): string {
  let s = "";
  for (const [coef, symbole] of termes) {
    if (coef === 0) continue;
    const abs = Math.abs(coef);
    const corps = symbole === "" ? `${abs}` : abs === 1 ? symbole : `${abs}${symbole}`;
    if (s === "") s = coef < 0 ? `-${corps}` : corps;
    else s += coef < 0 ? ` - ${corps}` : ` + ${corps}`;
  }
  return s === "" ? "0" : s;
}

function resolutionTrigo(e: ExerciceFormeTrigo, err: boolean): Resolution {
  const dir = DIRECTIONS_TRIGO[e.dir]!;
  const { a, b } = zTrigo(e);
  const aL = surdLatex(a);
  const bL = surdLatex(b);
  const A = carreSurd(a);
  const B = carreSurd(b);
  const r = Math.round(Math.sqrt(A + B));
  const L1 =
    err && e.type === "racineOubliee"
      ? [l(`|z| = ${par(aL)}^2 + ${par(bL)}^2 = ${A} + ${B} = ${A + B}`)]
      : [l(`|z| = \\sqrt{${par(aL)}^2 + ${par(bL)}^2} = \\sqrt{${A} + ${B}} = \\sqrt{${A + B}} = ${r}`)];
  const rCopie = err && e.type === "racineOubliee" ? A + B : r;
  const inverse = err && e.type === "rapportInverse";
  const alpha = inverse ? dir.alphaInverse : dir.alpha;
  const L2 = inverse
    ? [l(`\\arctan\\dfrac{${aL}}{${bL}} = \\arctan\\left(${surdLatex(dir.rapportInverse)}\\right) = ${angleLatex(alpha)}`)]
    : [l(`\\arctan\\dfrac{${bL}}{${aL}} = \\arctan\\left(${surdLatex(dir.rapport)}\\right) = ${angleLatex(alpha)}`)];
  const signe: 1 | -1 = b.n > 0 ? 1 : -1;
  const sansCorrection = err && e.type === "quadrant";
  const theta = sansCorrection ? alpha : ajouterAngles(alpha, angle(signe, 1));
  const L3 = sansCorrection
    ? [t("Donc "), l(`\\theta = ${angleLatex(theta)}`), t(".")]
    : [t("Comme "), l("a < 0"), t(" et "), l(signe > 0 ? "b > 0" : "b < 0"), t(" : "), l(`\\theta = ${plusMoinsPi(alpha, signe)} = ${angleLatex(theta)}`), t(".")];
  const L4 = [l(`z = ${rCopie}\\left(\\cos${argTrig(theta)} + i\\sin${argTrig(theta)}\\right)`)];
  return { lignes: [L1, L2, L3, L4], champs: [champReel("|z| =", surd(rCopie)), champAngle("\\arg z =", theta)] };
}

function resolutionQuotient(e: ExerciceQuotient, err: boolean): Resolution {
  const { a, b } = numerateurQuotient(e);
  const numL = complexeEntierLatex(a, b);
  const denL = complexeEntierLatex(e.c, e.d);
  const conjL = complexeEntierLatex(e.c, -e.d);
  const sansConj = err && e.type === "sansConjugue";
  const f = sansConj ? e.d : -e.d;
  const multL = complexeEntierLatex(e.c, f);
  const L1 = [l(`z = \\dfrac{(${numL})(${multL})}{(${denL})(${conjL})}`)];
  const moins = err && e.type === "denominateur";
  const D = moins ? e.c * e.c - e.d * e.d : e.c * e.c + e.d * e.d;
  const L2 = [t("Dénominateur : "), l(`(${denL})(${conjL}) = ${par(`${e.c}`)}^2 ${moins ? "-" : "+"} ${par(`${e.d}`)}^2 = ${D}`)];
  const i2 = err && e.type === "numerateurI2";
  const X = a * e.c + (i2 ? b * f : -b * f);
  const Y = a * f + b * e.c;
  const termes = sommeTermes([
    [a * e.c, ""],
    [a * f, "i"],
    [b * e.c, "i"],
    [b * f, "i^2"],
  ]);
  const L3 = [t("Numérateur : "), l(`(${numL})(${multL}) = ${termes} = ${complexeEntierLatex(X, Y)}`)];
  const re = surd(X, D);
  const im = surd(Y, D);
  const L4 = [l(`z = \\dfrac{${complexeEntierLatex(X, Y)}}{${D}} = ${complexeLatex(re, im)}`)];
  return { lignes: [L1, L2, L3, L4], champs: [champComplexe("z =", re, im)] };
}

function resolutionPuissance(e: ExercicePuissance, err: boolean): Resolution {
  const { a, b } = e;
  const zL = complexeEntierLatex(a, b);
  const bi = coefI(b);
  const carreBi = bi === "i" ? "i^2" : `(${bi})^2`;
  const sansDouble = err && e.type === "doubleProduit";
  const L1 = sansDouble
    ? [l(`(${zL})^2 = ${par(`${a}`)}^2 + ${carreBi}`)]
    : [l(`(${zL})^2 = ${par(`${a}`)}^2 + 2 \\cdot ${par(`${a}`)} \\cdot ${b < 0 ? `(${bi})` : bi} + ${carreBi}`)];
  const i2 = err && e.type === "carreI2";
  const P = a * a + (i2 ? b * b : -b * b);
  const Q = sansDouble ? 0 : 2 * a * b;
  const termes2 = sommeTermes([
    [a * a, ""],
    [Q, "i"],
    [b * b, "i^2"],
  ]);
  const PQ = complexeEntierLatex(P, Q);
  const L2 = [l(`= ${termes2} = ${PQ}`)];
  const croises = !(err && e.type === "termeATerme");
  // Ligne 3 : la distribution (produits non effectués) ; ligne 4 : les produits effectués, regroupés.
  const fP = par(`${P}`);
  const fQ = Q < 0 ? `(${coefI(Q)})` : coefI(Q);
  const fa = par(`${a}`);
  const fb = b < 0 ? `(${bi})` : bi;
  const produits: string[] = Q === 0 ? [`${fP} \\cdot ${fa}`, `${fP} \\cdot ${fb}`] : croises ? [`${fP} \\cdot ${fa}`, `${fP} \\cdot ${fb}`, `${fQ} \\cdot ${fa}`, `${fQ} \\cdot ${fb}`] : [`${fP} \\cdot ${fa}`, `${fQ} \\cdot ${fb}`];
  const L3 = [l(`(${zL})^3 = (${PQ})(${zL}) = ${produits.join(" + ")}`)];
  const termes4 = croises
    ? sommeTermes([
        [P * a, ""],
        [P * b, "i"],
        [Q * a, "i"],
        [Q * b, "i^2"],
      ])
    : sommeTermes([
        [P * a, ""],
        [Q * b, "i^2"],
      ]);
  const x = P * a - Q * b;
  const y = croises ? P * b + Q * a : 0;
  const final = complexeEntierLatex(x, y);
  const L4 = [l(termes4 === final ? `= ${final}` : `= ${termes4} = ${final}`)];
  return { lignes: [L1, L2, L3, L4], champs: [champComplexe("z^3 =", surd(x), surd(y))] };
}

/** Argument réduit de nθ (une réduction de 2π) et sa version fausse (π retiré au lieu de 2π). */
export function argumentsMoivre(e: ExerciceMoivre): { phi: Angle; theta: Angle; thetaFaux: Angle; sens: 1 | -1 } {
  const phi = multiplierAngle(DIRECTIONS_MOIVRE[e.dir]!.theta, e.n);
  const sens: 1 | -1 = phi.n > 0 ? -1 : 1;
  return { phi, theta: ajouterAngles(phi, angle(2 * sens, 1)), thetaFaux: ajouterAngles(phi, angle(sens, 1)), sens };
}

function resolutionMoivre(e: ExerciceMoivre, err: boolean): Resolution {
  const dir = DIRECTIONS_MOIVRE[e.dir]!;
  const { a, b } = zMoivre(e);
  const aL = surdLatex(a);
  const bL = surdLatex(b);
  const r = moduleMoivre(e);
  const L1 = [
    l(`|z| = \\sqrt{${par(aL)}^2 + ${par(bL)}^2} = \\sqrt{${carreSurd(a)} + ${carreSurd(b)}} = ${r}`),
    ...(a.n > 0
      ? [t(" et, comme "), l("a > 0"), t(" : "), l(`\\arg z = \\arctan\\dfrac{${bL}}{${aL}} = ${angleLatex(dir.theta)}`)]
      : [
          t(" ; "),
          l(`\\arctan\\dfrac{${bL}}{${aL}} = ${angleLatex(dir.alpha)}`),
          t(" et, comme "),
          l("a < 0"),
          t(" et "),
          l(b.n > 0 ? "b > 0" : "b < 0"),
          t(" : "),
          l(`\\arg z = ${plusMoinsPi(dir.alpha, b.n > 0 ? 1 : -1)} = ${angleLatex(dir.theta)}`),
        ]),
    t("."),
  ];
  const n = e.n;
  const sansModule = err && e.type === "moduleOublie";
  const R = sansModule ? r : r ** n;
  const L2 = sansModule ? [t("Module : "), l(`|z^{${n}}| = |z| = ${r}`), t(".")] : [t("Module : "), l(`|z^{${n}}| = |z|^{${n}} = ${r}^{${n}} = ${R}`), t(".")];
  const { phi, theta, thetaFaux, sens } = argumentsMoivre(e);
  const faux = err && e.type === "reductionPi";
  const Theta = faux ? thetaFaux : theta;
  const L3 = [
    t("Argument : "),
    l(`\\arg(z^{${n}}) = ${n} \\cdot ${angleFacteur(dir.theta)} = ${angleLatex(phi)}`),
    t(", ramené dans "),
    l("\\mathopen{]}-\\pi\\,;\\pi\\mathclose{]}"),
    t(" : "),
    l(`${angleLatex(phi)} ${sens > 0 ? "+" : "-"} ${faux ? "\\pi" : "2\\pi"} = ${angleLatex(Theta)}`),
    t("."),
  ];
  const { cos, sin } = cosSinExacts(Theta);
  const echange = err && e.type === "cosSin";
  const [c, s] = echange ? [sin, cos] : [cos, sin];
  const re = produitSurd(surd(R), c);
  const im = produitSurd(surd(R), s);
  const L4 = [l(`z^{${n}} = ${R}\\left(\\cos${argTrig(Theta)} + i\\sin${argTrig(Theta)}\\right) = ${R}\\left(${complexeLatex(c, s)}\\right) = ${complexeLatex(re, im)}`)];
  return {
    lignes: [L1, L2, L3, L4],
    champs: [champReel(`\\mathrm{Re}(z^{${n}}) =`, re), champReel(`\\mathrm{Im}(z^{${n}}) =`, im)],
  };
}

/** zⁿ exact (forme algébrique attendue). */
export function puissanceMoivre(e: ExerciceMoivre): { re: Surd; im: Surd } {
  const { theta } = argumentsMoivre(e);
  const R = surd(moduleMoivre(e) ** e.n);
  const { cos, sin } = cosSinExacts(theta);
  return { re: produitSurd(R, cos), im: produitSurd(R, sin) };
}

export function nomRacines(n: number): string {
  return n === 3 ? "cubiques" : "quatrièmes";
}

function resolutionRacines(e: ExerciceRacines, err: boolean): Resolution {
  const dir = DIRECTIONS_RACINES[e.dir]!;
  const { a, b } = wRacines(e);
  const aL = surdLatex(a);
  const bL = surdLatex(b);
  const A = carreSurd(a);
  const B = carreSurd(b);
  const L1 = [t("Module : "), l(`|w| = \\sqrt{${par(aL)}^2 + ${par(bL)}^2} = \\sqrt{${A} + ${B}} = \\sqrt{${A + B}} = ${e.R}`), t(".")];
  const signe: 1 | -1 = b.n > 0 ? 1 : -1;
  const sansCorrection = err && e.type === "quadrant";
  const phi = sansCorrection ? dir.alpha : dir.phi;
  const debut = [t("Argument : "), l(`\\arctan\\dfrac{${bL}}{${aL}} = \\arctan\\left(${surdLatex(dir.rapport)}\\right) = ${angleLatex(dir.alpha)}`)];
  const L2 = sansCorrection
    ? [...debut, t(", donc "), l(`\\arg w = ${angleLatex(phi)}`), t(".")]
    : [...debut, t(" ; comme "), l("a < 0"), t(" et "), l(signe > 0 ? "b > 0" : "b < 0"), t(" : "), l(`\\arg w = ${plusMoinsPi(dir.alpha, signe)} = ${angleLatex(phi)}`), t(".")];
  const n = e.n;
  const divise = err && e.type === "moduleDivise";
  const rho = divise ? surd(e.R, n) : surd(rhoRacines(e));
  const L3 = divise
    ? [t("Module des racines : "), l(`|z_k| = \\dfrac{|w|}{${n}} = \\dfrac{${e.R}}{${n}}${rho.d === 1 ? ` = ${surdLatex(rho)}` : ""}`), t(".")]
    : [t("Module des racines : "), l(`|z_k| = \\sqrt[${n}]{|w|} = \\sqrt[${n}]{${e.R}} = ${surdLatex(rho)}`), t(".")];
  const base = diviserAngle(phi, n);
  const grandPas = err && e.type === "pas2pi";
  const pas = grandPas ? angle(2, 1) : angle(2, n);
  const L4 = grandPas
    ? [t("Arguments : "), l(`\\theta_k = \\dfrac{\\arg w}{${n}} + 2k\\pi = ${angleLatex(base)} + 2k\\pi`), t(".")]
    : [t("Arguments : "), l(`\\theta_k = \\dfrac{\\arg w + 2k\\pi}{${n}} = ${angleLatex(base)} + k \\cdot ${angleLatex(pas)}`), t(".")];
  const thetas = Array.from({ length: n }, (_, k) => ajouterAngles(base, multiplierAngle(pas, k)));
  const rhoL = surdLatex(rho);
  const exp = (a: Angle) => (a.n < 0 ? `e^{-i${angleLatex(angle(-a.n, a.d), "frac")}}` : `e^{i${angleLatex(a, "frac")}}`);
  const liste = thetas.map((th, k) => `z_{${k}} = ${rhoL}\\,${exp(th)}`).join(",\\; ");
  const L5 = [t("Pour "), l(`k \\in \\{${Array.from({ length: n }, (_, k) => k).join(" ; ")}\\}`), t(" : "), l(liste), t(".")];
  return {
    lignes: [L1, L2, L3, L4, L5],
    champs: [champReel("|z_k| =", rho), ...thetas.map((th, k) => champAngle(`\\theta_{${k}} =`, th, true))],
  };
}

function racineLigne(N: number): string {
  const s = racine(N);
  const brut = `\\sqrt{${N}}`;
  const simple = surdLatex(s);
  return simple === brut ? brut : `${brut} = ${simple}`;
}

/** Somme de deux modules exacts en LaTeX (« 5 + \sqrt{13} », ou sa valeur si les deux sont entiers). */
function sommeModulesLatex(m1: Surd, m2: Surd): string {
  const brut = `${surdLatex(m1)} + ${surdLatex(m2)}`;
  if (m1.m === 1 && m2.m === 1 && m1.d === 1 && m2.d === 1) return `${brut} = ${m1.n + m2.n}`;
  if (m1.m === m2.m && m1.d === 1 && m2.d === 1) return `${brut} = ${surdLatex(surd(m1.n + m2.n, 1, m1.m))}`;
  return brut;
}

export function sommeZW(e: ExerciceModuleSomme): { s: number; tt: number } {
  return { s: e.a + e.c, tt: e.b + e.d };
}

function resolutionModuleSomme(e: ExerciceModuleSomme, err: boolean): Resolution {
  const { a, b, c, d } = e;
  const carre = err && e.type === "carreBi";
  const m1 = carre ? racine(a * a - b * b) : racine(a * a + b * b);
  const L1 = carre
    ? [l(`|z| = \\sqrt{${par(`${a}`)}^2 + ${carreI(b)}} = \\sqrt{${a * a} - ${b * b}} = ${racineLigne(a * a - b * b)}`)]
    : [l(`|z| = \\sqrt{${par(`${a}`)}^2 + ${par(`${b}`)}^2} = \\sqrt{${a * a} + ${b * b}} = ${racineLigne(a * a + b * b)}`)];
  const somme = err && e.type === "sommeRacines";
  const m2 = somme ? surd(Math.abs(c) + Math.abs(d)) : racine(c * c + d * d);
  const L2 = somme
    ? [l(`|w| = \\sqrt{${par(`${c}`)}^2 + ${par(`${d}`)}^2} = ${Math.abs(c)} + ${Math.abs(d)} = ${Math.abs(c) + Math.abs(d)}`)]
    : [l(`|w| = \\sqrt{${par(`${c}`)}^2 + ${par(`${d}`)}^2} = \\sqrt{${c * c} + ${d * d}} = ${racineLigne(c * c + d * d)}`)];
  const { s, tt } = sommeZW(e);
  const L3 = [l(`z + w = (${a} + ${par(`${c}`)}) + (${b} + ${par(`${d}`)})i = ${complexeEntierLatex(s, tt)}`)];
  const triangle = err && e.type === "inegaliteTriangulaire";
  const M = racine(s * s + tt * tt);
  const L4 = triangle
    ? [l(`|z + w| = |z| + |w| = ${sommeModulesLatex(m1, m2)}`)]
    : [l(`|z + w| = \\sqrt{${par(`${s}`)}^2 + ${par(`${tt}`)}^2} = \\sqrt{${s * s} + ${tt * tt}} = ${racineLigne(s * s + tt * tt)}`)];
  const champM: ChampDetectiveComplexes = triangle
    ? { genre: "reel", prefixe: "|z + w| =", valeur: valeurSurd(m1) + valeurSurd(m2), latex: sommeModulesLatex(m1, m2).split(" = ").pop()!, angle: false, ensemble: false, exacteNonDecimale: true }
    : champReel("|z + w| =", M);
  return { lignes: [L1, L2, L3, L4], champs: [champReel("|z| =", m1), champReel("|w| =", m2), champM] };
}

/** √(−n) écrit avec i (« 2i », « i », « i\sqrt{3} »). */
export function racineNegatifLatex(n: number): string {
  const s = racine(n);
  if (s.m === 1) return s.n === 1 ? "i" : `${s.n}i`;
  return `${s.n === 1 ? "" : s.n}i\\sqrt{${s.m}}`;
}

/** n·i² écrit (« i^2 », « 4i^2 »). */
function nI2(n: number): string {
  return n === 1 ? "i^2" : `${n}i^2`;
}

function resolutionRacineProduit(e: ExerciceRacineProduit, err: boolean): Resolution {
  const n = e.n;
  const ri = racineNegatifLatex(n);
  const Ea = n === 1 ? "\\sqrt{1}" : `\\sqrt{${n * n}}`;
  const Eb = `\\sqrt{${n} \\cdot ${n}}`;
  const Ec = `\\sqrt{(-${n}) \\cdot (-${n})}`;
  const Ed = `\\sqrt{-${n}} \\cdot \\sqrt{-${n}}`;
  const Ed2 = `\\left(\\sqrt{-${n}}\\right)^2`;
  const Ee = `${ri} \\cdot ${ri}`;
  const Ef = nI2(n);
  const fin = `-${n}`;
  const avant = e.position === 2 ? [Ec] : e.position === 3 ? [Ea, Ec] : [Ea, Eb, Ec];
  const apres = e.position === 2 ? [Ed2, n === 1 ? Ee : `(${ri})^2`, Ef, fin] : e.position === 3 ? [Ee, Ef, fin] : [Ee, fin];
  const ligne = (expr: string) => [l(`${n} = ${expr}`)];
  if (err) return { lignes: [...avant, Ed, ...apres].map(ligne), champs: [champReel(`${Ed} =`, surd(n))] };
  // Résolution corrigée : la ligne fausse est remplacée par le vrai calcul, et la chaîne s'arrête.
  return {
    lignes: [
      ...avant.map(ligne),
      [l(`${Ec} = ${Ea === "\\sqrt{1}" ? "\\sqrt{1}" : `\\sqrt{${n * n}}`} = ${n}`), t(", mais "), l(`${Ed} = ${Ee} = ${Ef} = ${fin}`), t(" : on ne peut pas passer de l'un à l'autre.")],
      [t("La « démonstration » s'arrête à la ligne "), l(`${e.position}`), t(" : elle ne prouve pas que "), l(`${n} = -${n}`), t(".")],
    ],
    champs: [champReel(`${Ed} =`, surd(-n))],
  };
}

function resolution(e: DonneesDetectiveComplexes, err: boolean): Resolution {
  switch (e.variante) {
    case "formeTrigo":
      return resolutionTrigo(e, err);
    case "quotient":
      return resolutionQuotient(e, err);
    case "puissance":
      return resolutionPuissance(e, err);
    case "moivre":
      return resolutionMoivre(e, err);
    case "racines":
      return resolutionRacines(e, err);
    case "moduleSomme":
      return resolutionModuleSomme(e, err);
    case "racineProduit":
      return resolutionRacineProduit(e, err);
  }
}

/** La copie de l'élève fictif (avec son erreur). */
export function copieEleve(e: DonneesDetectiveComplexes): FragmentConsigne[][] {
  return resolution(e, true).lignes;
}

/** La même résolution, sans erreur. */
export function correction(e: DonneesDetectiveComplexes): FragmentConsigne[][] {
  return resolution(e, false).lignes;
}

/** Champs de l'écran 3 : valeurs attendues (`avecErreur` : valeurs de la copie). */
export function champsCorrection(e: DonneesDetectiveComplexes, avecErreur = false): ChampDetectiveComplexes[] {
  return resolution(e, avecErreur).champs;
}

/** Les valeurs de la copie diffèrent-elles des bonnes (l'erreur se VOIT dans le résultat) ? */
export function erreurVisible(e: DonneesDetectiveComplexes): boolean {
  const bons = champsCorrection(e, false);
  const copie = champsCorrection(e, true);
  return bons.some((c, i) => {
    const k = copie[i]!;
    if (c.genre === "complexe" && k.genre === "complexe") return Math.abs(c.re - k.re) > 1e-9 || Math.abs(c.im - k.im) > 1e-9;
    if (c.genre === "reel" && k.genre === "reel") {
      if (!c.angle) return Math.abs(c.valeur - k.valeur) > 1e-9;
      const d = (((c.valeur - k.valeur) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      return d > 1e-9 && 2 * Math.PI - d > 1e-9;
    }
    return true;
  });
}

export function majuscule(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}
