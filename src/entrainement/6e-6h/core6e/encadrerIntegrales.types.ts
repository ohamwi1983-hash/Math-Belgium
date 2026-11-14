/**
 * Couche A (6e) — types de `6gen79` « Comparer et encadrer des intégrales » (chapitre 4, section
 * `integralesdefinies`, processus 2 appliquer). Quatre variantes :
 *
 * - `signe` : signe de I = ∫ₐᵇ f(x) dx SANS la calculer — f de signe constant sur l'intervalle,
 *   bornes dans l'ordre croissant (`inverse: false`) ou échangées (`inverse: true`, I = ∫_q^p f).
 * - `comparer` : comparer I = ∫ f et J = ∫ g sur [p ; q] sans calcul — f ≤ g, f ≥ g, ou f − g
 *   change de signe (la propriété de comparaison ne permet alors pas de conclure).
 * - `encadrer` : encadrer I par m(b − a) et M(b − a), m et M minimum et maximum de f sur [a ; b]
 *   (f monotone, ou tableau de variations donné).
 * - `moyenne` : même fonction, puis encadrement de la valeur moyenne μ = I/(b − a) entre m et M.
 *
 * Les fonctions (`fn`) servent aux figures et aux vérifications ; les écritures exactes (`latex`)
 * et Unicode (`texte`, pour les SVG) sont écrites à la main dans le catalogue, jamais recalculées.
 */

export type VarianteEncadrerIntegrales = "signe" | "comparer" | "encadrer" | "moyenne";

/** Aide ou ligne de justification : phrase (finie par « : » quand une formule suit) + formule. */
export interface TexteAvecLatex {
  texte: string;
  latex?: string;
}

/** Fragment de justification (corrigé) : texte et formules mêlés. */
export type FragmentJustification = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

/** Nombre exact : écriture LaTeX, écriture Unicode (SVG du tableau de variations) et valeur. */
export interface NombreExact {
  latex: string;
  texte: string;
  valeur: number;
}

export interface ExerciceSigneIntegrale {
  variante: "signe";
  idFonction: string;
  fLatex: string;
  fn: (x: number) => number;
  /** Intervalle rangé dans l'ordre croissant : p < q. */
  p: NombreExact;
  q: NombreExact;
  /** `true` : l'intégrale demandée est ∫_q^p f (bornes échangées). */
  inverse: boolean;
  /** Signe (constant) de f sur [p ; q]. */
  signeF: "positif" | "negatif";
  aide1: TexteAvecLatex;
  aide2: TexteAvecLatex;
  justification: FragmentJustification[];
}

export type IssueComparaison = "fInfG" | "fSupG" | "change";

export interface ExerciceComparerIntegrales {
  variante: "comparer";
  idPaire: string;
  fLatex: string;
  gLatex: string;
  fn: (x: number) => number;
  gn: (x: number) => number;
  p: NombreExact;
  q: NombreExact;
  issue: IssueComparaison;
  aide1: TexteAvecLatex;
  aide2: TexteAvecLatex;
  justification: FragmentJustification[];
}

export interface TableauVariations {
  /** Abscisses (bornes et extremums locaux), dans l'ordre. */
  abscisses: NombreExact[];
  /** Pour chaque abscisse : f' s'y annule (0 dans la ligne de f'). */
  zeros: boolean[];
  /** Signe de f' entre deux abscisses consécutives. */
  signes: ("+" | "−")[];
  /** Valeurs de f aux abscisses. */
  valeurs: NombreExact[];
}

export interface ExerciceEncadrerIntegrale {
  variante: "encadrer" | "moyenne";
  idFonction: string;
  structure: "monotone" | "variations";
  fLatex: string;
  fn: (x: number) => number;
  a: NombreExact;
  b: NombreExact;
  /** b − a (entier ou fraction). */
  longueur: NombreExact;
  /** Monotone : sens de variation et dérivée (justification). */
  monotonie: "croissante" | "decroissante" | null;
  deriveeLatex: string;
  /** Variations : le tableau donné dans l'énoncé. */
  tableau: TableauVariations | null;
  m: NombreExact;
  M: NombreExact;
  /** m(b − a) et M(b − a). */
  borneInf: NombreExact;
  borneSup: NombreExact;
  /** Toutes les valeurs sont rationnelles (`exacte`) ou font intervenir e, ln, √ (`calculatrice`). */
  calcul: "exacte" | "calculatrice";
}

export type ExerciceEncadrerIntegrales = ExerciceSigneIntegrale | ExerciceComparerIntegrales | ExerciceEncadrerIntegrale;
