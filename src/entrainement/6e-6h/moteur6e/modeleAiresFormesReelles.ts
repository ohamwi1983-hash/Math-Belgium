import type { ExerciceAiresFormesReelles, ExerciceMurFormesReelles, ExerciceSectionFormesReelles, RepereArc } from "../core6e/airesFormesReelles.types";

/**
 * Couche B (6e) — modèle numérique de `6gen81` « Aires de formes réelles » : SOURCE UNIQUE des
 * valeurs attendues (écrans, récapitulatif, corrigé papier, barème). N'importe rien de
 * `generateurs6e/`.
 *
 * Arc de parabole (mur, section) de largeur `largeur`, de flèche `fleche` et de sens `sens`
 * (+1 : bosse vers le haut — fronton, tunnel ; −1 : creux sous l'axe — canal, gouttière). Dans le
 * repère « pied » (origine au pied gauche, axe des abscisses le long de la base) :
 *   f(x) = coef · x(x − largeur), coef = −sens · 4·fleche / largeur² ;
 * dans le repère « milieu » (origine au milieu de la base) : f(x) = sens·fleche + coef·x².
 */

export type PhaseFormesReelles = "modeliser" | "aire" | "total" | "peinture" | "cout" | "volume";

export function phasesExercice(e: ExerciceAiresFormesReelles): PhaseFormesReelles[] {
  switch (e.situation) {
    case "mur":
      return ["modeliser", "aire", "total", "peinture", "cout"];
    case "vitrail":
      return ["modeliser", "aire", "total", "cout"];
    case "section":
      return ["modeliser", "aire", "volume"];
    case "parcelle":
      return ["modeliser", "aire", "total", "cout"];
  }
}

export interface Arc {
  largeur: number;
  fleche: number;
  sens: 1 | -1;
}

export function arcExercice(e: ExerciceMurFormesReelles | ExerciceSectionFormesReelles): Arc {
  if (e.situation === "mur") return { largeur: e.L, fleche: e.k, sens: 1 };
  return { largeur: e.W, fleche: e.D, sens: e.contexte === "tunnel" ? 1 : -1 };
}

export function coefArc(arc: Arc): number {
  return (-arc.sens * 4 * arc.fleche) / (arc.largeur * arc.largeur);
}

/** Arc dans le repère « pied » (origine au pied gauche). */
export function fonctionArcPied(arc: Arc): (x: number) => number {
  const c = coefArc(arc);
  return (x) => c * x * (x - arc.largeur);
}

/** Bornes de l'arc dans un repère donné. */
export function bornesArc(arc: Arc, repere: RepereArc): [number, number] {
  return repere === "pied" ? [0, arc.largeur] : [-arc.largeur / 2, arc.largeur / 2];
}

/** Arc dans un repère donné (pied ou milieu). */
export function fonctionArc(arc: Arc, repere: RepereArc): (x: number) => number {
  const pied = fonctionArcPied(arc);
  const t = bornesArc(arc, repere)[0];
  return (x) => pied(x - t);
}

/** Coefficients (puissances croissantes) de l'arc développé dans un repère donné. */
export function coefficientsArc(arc: Arc, repere: RepereArc): number[] {
  const c = coefArc(arc);
  return repere === "pied" ? [0, -c * arc.largeur, c] : [arc.sens * arc.fleche, 0, c];
}

/** Aire d'un segment de parabole : (2/3) · base · flèche. */
export function aireArc(arc: Arc): number {
  return (2 / 3) * arc.largeur * arc.fleche;
}

// ============================================================================
// Vitrail.
// ============================================================================

export function fonctionsVitrail(e: Extract<ExerciceAiresFormesReelles, { situation: "vitrail" }>): { f: (x: number) => number; g: (x: number) => number } {
  const g = (x: number) => e.c * (x - e.m) ** 2 + e.d;
  const f = (x: number) => g(x) - e.A * ((x - e.m) ** 2 - e.s);
  return { f, g };
}

/** Coefficients croissants de f et g (vitrail). */
export function coefficientsVitrail(e: Extract<ExerciceAiresFormesReelles, { situation: "vitrail" }>): { f: number[]; g: number[] } {
  const g = [e.c * e.m * e.m + e.d, -2 * e.c * e.m, e.c];
  const h = [-e.A * (e.m * e.m - e.s), 2 * e.A * e.m, -e.A];
  return { g, f: g.map((v, i) => v + h[i]) };
}

// ============================================================================
// Parcelle.
// ============================================================================

export function fonctionParcelle(e: Extract<ExerciceAiresFormesReelles, { situation: "parcelle" }>): (x: number) => number {
  return (x) => e.alpha * (x - e.m) ** 2 + e.k;
}

export function coefficientsParcelle(e: Extract<ExerciceAiresFormesReelles, { situation: "parcelle" }>): number[] {
  return [e.alpha * e.m * e.m + e.k, -2 * e.alpha * e.m, e.alpha];
}

// ============================================================================
// Valeurs EXACTES (rationnels) — source unique de l'intégrale, du corrigé et de l'écran.
// ============================================================================

/**
 * Rationnel irréductible (dénominateur > 0). Les coefficients de l'intégrande se calculent EXACTEMENT
 * depuis les données de l'instance (cotes décimales courtes, coefficient c de la berge) : relire un
 * flottant en fraction (`fractionDepuisValeur`, tolérance 1e-7) trouvait des fractions VOISINES mais
 * fausses (−0,0159143… lu −49/3079 au lieu de −55/3456, F(6,5) lu 11953/321…), et le corrigé de la
 * parcelle « à retrouver » finissait par écrire la primitive avec −0,0159x³ (écart de 0,006 à 0,009
 * sur l'aire).
 */
export interface FractionExacte {
  n: number;
  d: number;
}

function pgcdEntiers(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

export function fraction(n: number, d = 1): FractionExacte {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d) || d === 0) throw new Error(`fraction hors limites : ${n}/${d}`);
  const g = pgcdEntiers(n, d);
  const s = d < 0 ? -1 : 1;
  return { n: (s * n) / g || 0, d: (s * d) / g };
}

export const fAdd = (a: FractionExacte, b: FractionExacte): FractionExacte => fraction(a.n * b.d + b.n * a.d, a.d * b.d);
export const fSub = (a: FractionExacte, b: FractionExacte): FractionExacte => fraction(a.n * b.d - b.n * a.d, a.d * b.d);
export const fMul = (a: FractionExacte, b: FractionExacte): FractionExacte => fraction(a.n * b.n, a.d * b.d);
export const fDiv = (a: FractionExacte, b: FractionExacte): FractionExacte => fraction(a.n * b.d, a.d * b.n);
export const fVal = (a: FractionExacte): number => a.n / a.d;

/** Donnée décimale courte de l'instance (au plus 6 décimales : cotes, bornes, prix) en fraction exacte. */
export function fractionDecimale(v: number): FractionExacte {
  return fraction(Math.round(v * 1e6), 1e6);
}

/** Coefficient c de la parcelle : (y₀ − k)/m² si la berge est à retrouver (y₀ = distance au pont, décimale
 * courte), sinon le coefficient imprimé (décimal court ou −1/4, −1/5, −1/8, −1/10). */
function coefficientParcelleExact(e: Extract<ExerciceAiresFormesReelles, { situation: "parcelle" }>): FractionExacte {
  if (e.modele === "retrouver") {
    const m = fractionDecimale(e.m);
    const y0 = fractionDecimale(e.alpha * e.m * e.m + e.k);
    return fDiv(fSub(y0, fractionDecimale(e.k)), fMul(m, m));
  }
  for (let d = 1; d <= 1000; d++) {
    const n = Math.round(e.alpha * d);
    if (Math.abs(n / d - e.alpha) < 1e-12) return fraction(n, d);
  }
  return fractionDecimale(e.alpha);
}

/** Coefficients EXACTS (puissances croissantes) de l'intégrande du corrigé ; `null` pour le vitrail
 * (bornes irrationnelles, l'aire passe par la formule (4/3)·A·s^{3/2}). */
export function coefficientsExacts(e: ExerciceAiresFormesReelles): FractionExacte[] | null {
  switch (e.situation) {
    case "vitrail":
      return null;
    case "parcelle": {
      const c = coefficientParcelleExact(e);
      const m = fractionDecimale(e.m);
      return [fAdd(fMul(c, fMul(m, m)), fractionDecimale(e.k)), fMul(fraction(-2), fMul(c, m)), c];
    }
    case "mur":
    case "section": {
      const arc = arcExercice(e);
      const L = fractionDecimale(arc.largeur);
      const fl = fractionDecimale(arc.fleche);
      const c = fDiv(fMul(fraction(-arc.sens * 4), fl), fMul(L, L));
      return e.repere === "pied" ? [fraction(0), fMul(fraction(-1), fMul(c, L)), c] : [fMul(fraction(arc.sens), fl), fraction(0), c];
    }
  }
}

/** Primitive (constante nulle) d'un polynôme exact, coefficients croissants. */
export function primitiveExacte(coeffs: FractionExacte[]): FractionExacte[] {
  return [fraction(0), ...coeffs.map((c, i) => fDiv(c, fraction(i + 1)))];
}

export function evaluerExact(coeffs: FractionExacte[], x: FractionExacte): FractionExacte {
  let s = fraction(0);
  let p = fraction(1);
  for (const c of coeffs) {
    s = fAdd(s, fMul(c, p));
    p = fMul(p, x);
  }
  return s;
}

/** Bornes exactes du corrigé (`null` pour le vitrail). */
export function bornesExactes(e: ExerciceAiresFormesReelles): [FractionExacte, FractionExacte] | null {
  if (e.situation === "vitrail") return null;
  const [a, b] = bornesCorrige(e);
  return [fractionDecimale(a), fractionDecimale(b)];
}

/** Intégrale SIGNÉE exacte F(b) − F(a) (`null` pour le vitrail). */
export function integraleExacte(e: ExerciceAiresFormesReelles): FractionExacte | null {
  const coeffs = coefficientsExacts(e);
  const bornes = bornesExactes(e);
  if (!coeffs || !bornes) return null;
  const F = primitiveExacte(coeffs);
  return fSub(evaluerExact(F, bornes[1]), evaluerExact(F, bornes[0]));
}

/** Aire exacte de la partie courbe, en u.a. (`null` pour le vitrail). */
export function aireExacte(e: ExerciceAiresFormesReelles): FractionExacte | null {
  const v = integraleExacte(e);
  if (!v) return null;
  return v.n < 0 ? fraction(-v.n, v.d) : v;
}

// ============================================================================
// Valeurs attendues.
// ============================================================================

/** Bornes de l'intégrale dans le repère du corrigé (celui du schéma quand la fonction est donnée). */
export function bornesCorrige(e: ExerciceAiresFormesReelles): [number, number] {
  switch (e.situation) {
    case "mur":
    case "section":
      return bornesArc(arcExercice(e), e.repere);
    case "vitrail":
      return [e.m - Math.sqrt(e.s), e.m + Math.sqrt(e.s)];
    case "parcelle":
      return [e.a, e.b];
  }
}

/** Aire de la partie courbe (positive) : arc, lentille, section, parcelle en u.a. */
export function aireCourbe(e: ExerciceAiresFormesReelles): number {
  switch (e.situation) {
    case "mur":
    case "section":
      return aireArc(arcExercice(e));
    case "vitrail":
      return (4 / 3) * e.A * Math.pow(e.s, 1.5);
    case "parcelle":
      // Valeur exacte (rationnelle) : la même que le corrigé écrit, aucun arrondi intermédiaire.
      return fVal(aireExacte(e)!);
  }
}

/** Intégrale SIGNÉE ∫ f entre les bornes du corrigé (négative pour le canal et la gouttière). */
export function integraleSignee(e: ExerciceAiresFormesReelles): number {
  if (e.situation === "section" && e.contexte !== "tunnel") return -aireCourbe(e);
  return aireCourbe(e);
}

/** Surface totale du mur (rectangle + arc), verre clair du vitrail, aire de la parcelle en m². */
export function valeurTotal(e: ExerciceAiresFormesReelles): number {
  switch (e.situation) {
    case "mur":
      return e.L * e.h + aireCourbe(e);
    case "vitrail":
      return e.W * e.H - aireCourbe(e);
    case "parcelle":
      return 100 * aireCourbe(e);
    case "section":
      return Number.NaN;
  }
}

export function litresPeinture(e: ExerciceMurFormesReelles): number {
  return (2 * valeurTotal(e)) / e.rendement;
}

export function nombrePots(e: ExerciceMurFormesReelles): number {
  return Math.ceil(litresPeinture(e) / e.contenance - 1e-9);
}

export function valeurCout(e: ExerciceAiresFormesReelles): number {
  switch (e.situation) {
    case "mur":
      return nombrePots(e) * e.prixPot;
    case "vitrail":
      return (aireCourbe(e) * e.prixColore + valeurTotal(e) * e.prixClair) / 100;
    case "parcelle":
      return valeurTotal(e) * e.prix;
    case "section":
      return Number.NaN;
  }
}

/** Volume de la section : m³ (canal, tunnel) ou litres (gouttière : cm² × cm → cm³ → L). */
export function valeurVolume(e: ExerciceSectionFormesReelles): number {
  const aire = aireCourbe(e);
  return e.contexte === "gouttiere" ? (aire * e.longueur * 100) / 1000 : aire * e.longueur;
}
