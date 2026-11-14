/**
 * Couche A (6e) — types et calculs purs de `6gen82` « Inégalités de revenus : courbe de Lorenz et
 * coefficient de Gini » (chapitre 4 de 6e, section « problèmes », processus 3 TRANSFÉRER).
 *
 * Une courbe de Lorenz L vérifie L(0) = 0, L(1) = 1, L croissante, convexe et L(x) ≤ x sur [0 ; 1].
 * Familles retenues (toutes vérifient ces conditions) :
 * - `puissance` : L(x) = xⁿ, n ∈ {2 ; 3 ; 4} ou fractionnaire n ∈ {3/2 ; 5/2 ; 4/3 ; 5/3} (n > 1 : convexe) ;
 * - `mixte2` : L(x) = a·x² + (1 − a)·x, 0 < a < 1 (L′ = 2ax + 1 − a ≥ 0, L″ = 2a ≥ 0) ;
 * - `mixte3` : L(x) = a·x³ + (1 − a)·x, 0 < a < 1 ;
 * - `expo` : L(x) = (e^{kx} − 1)/(e^k − 1), k ∈ {1 ; 2 ; 3} (variante à la calculatrice).
 *
 * Aire de concentration 𝒜 = ∫₀¹ (x − L(x)) dx = 1/2 − ∫₀¹ L ; coefficient de Gini G = 2𝒜 ∈ [0 ; 1].
 * Ces fonctions sont la SOURCE UNIQUE des valeurs : générateur, vérification, textes et corrigé
 * papier les appellent toutes.
 */

export type FamilleLorenz = "puissance" | "mixte2" | "mixte3" | "expo";

export interface CourbeLorenz {
  famille: FamilleLorenz;
  /** n (puissance), a (mixte2, mixte3 — multiple de 0,1), k (expo). */
  parametre: number;
}

/** Contexte d'une seule répartition : un pays fictif (ménages, revenu total) ou une entreprise
 * (salariés, masse salariale). */
export type ContexteRepartition = "pays" | "entreprise";

export interface ExerciceLorenzLecture {
  variante: "lecture";
  contexte: ContexteRepartition;
  /** Nom du pays fictif (ignoré pour une entreprise). */
  nomPays: string;
  courbe: CourbeLorenz;
  /** Part de la population dont on lit la part des revenus : 0,5 ou 0,8 ; pour un exposant
   * fractionnaire, un carré (n = k/2) ou un cube (n = k/3) parfait, pour que L(p) reste un décimal
   * exact (calcul sans calculatrice). */
  p: number;
  /** Ordre d'affichage des 4 options d'interprétation (indices dans la liste canonique, 0 = juste). */
  ordreInterpretation: number[];
}

export interface ExerciceLorenzComparaison {
  variante: "comparaison";
  /** `pays` : deux pays fictifs ; `reforme` : un même pays avant (courbe 1) et après (courbe 2). */
  contexte: "pays" | "reforme";
  /** Deux pays (contexte `pays`) ; `[nom, nom]` du même pays pour `reforme`. */
  noms: [string, string];
  courbes: [CourbeLorenz, CourbeLorenz];
  /** Ordre d'affichage des deux verdicts (indices canoniques : 0 = « 1 plus inégalitaire »). */
  ordreVerdict: number[];
}

export interface ExerciceLorenzParametre {
  variante: "parametre";
  contexte: ContexteRepartition;
  nomPays: string;
  famille: "mixte2" | "mixte3";
  /** Valeur de a à retrouver (dans ]0 ; 1[). */
  a: number;
  /** Coefficient de Gini visé (= a/3 ou a/2). */
  giniVise: number;
}

export type ExerciceLorenzGini = ExerciceLorenzLecture | ExerciceLorenzComparaison | ExerciceLorenzParametre;

/** Arrondi qui gomme le bruit binaire (0,1 + 0,2…) des paramètres tirés en dixièmes/centièmes. */
export function nettoyer(v: number): number {
  return Math.round(v * 1e9) / 1e9;
}

export function evaluerLorenz(c: CourbeLorenz, x: number): number {
  const p = c.parametre;
  switch (c.famille) {
    case "puissance":
      return Math.pow(x, p);
    case "mixte2":
      return p * x * x + (1 - p) * x;
    case "mixte3":
      return p * x * x * x + (1 - p) * x;
    case "expo":
      return (Math.exp(p * x) - 1) / (Math.exp(p) - 1);
  }
}

/** ∫₀¹ L(x) dx — aire SOUS la courbe de Lorenz. */
export function integraleLorenz(c: CourbeLorenz): number {
  const p = c.parametre;
  switch (c.famille) {
    case "puissance":
      return 1 / (p + 1);
    case "mixte2":
      return p / 3 + (1 - p) / 2;
    case "mixte3":
      return p / 4 + (1 - p) / 2;
    case "expo":
      return 1 / p - 1 / (Math.exp(p) - 1);
  }
}

/** Aire de concentration 𝒜 = ∫₀¹ (x − L(x)) dx. */
export function aireConcentration(c: CourbeLorenz): number {
  return 0.5 - integraleLorenz(c);
}

/** Coefficient de Gini G = 2𝒜. */
export function coefficientGini(c: CourbeLorenz): number {
  return 2 * aireConcentration(c);
}

/** Vrai si les deux courbes se croisent strictement entre 0 et 1 (la figure seule ne permet alors
 * pas de dire laquelle est la plus inégalitaire). */
export function courbesSeCroisent(c1: CourbeLorenz, c2: CourbeLorenz): boolean {
  let signePrecedent = 0;
  for (let i = 1; i < 200; i++) {
    const x = i / 200;
    const d = evaluerLorenz(c1, x) - evaluerLorenz(c2, x);
    if (Math.abs(d) < 1e-6) continue;
    const s = Math.sign(d);
    if (signePrecedent !== 0 && s !== signePrecedent) return true;
    signePrecedent = s;
  }
  return false;
}

/** Coefficient de Gini en fonction de a (famille paramétrée) : a/3 (mixte2) ou a/2 (mixte3). */
export function giniEnFonctionDeA(famille: "mixte2" | "mixte3", a: number): number {
  return famille === "mixte2" ? a / 3 : a / 2;
}

/** Aire de concentration en fonction de a : a/6 (mixte2) ou a/4 (mixte3). */
export function aireEnFonctionDeA(famille: "mixte2" | "mixte3", a: number): number {
  return famille === "mixte2" ? a / 6 : a / 4;
}
