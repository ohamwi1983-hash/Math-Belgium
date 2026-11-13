/**
 * gen78 — « Équations trigonométriques à transformer » (4e, chapitre 5, section `equations`,
 * processus 2 APPLIQUER). Prolonge gen18 (« Quel angle ? », sin α = k, cos α = k, tan α = k) : on
 * transforme d'abord l'équation jusqu'à une ou plusieurs ÉQUATIONS DE BASE f(α) = k, puis on résout
 * chacune sur [0° ; 360°[ (angle de référence, puis solutions), et on réunit les solutions.
 *
 * Trois formes (variantes) :
 * - « affine » : a·f(α) + b = c (f = sin, cos ou tan) → une équation de base ;
 * - « carré » : a·f²(α) + b = c (f = sin ou cos) → f(α) = √k ou f(α) = −√k (une seule si k = 0,
 *   aucune si k < 0 : un carré n'est jamais négatif) ;
 * - « produit » : f(α) · (a·g(α) + b) = 0 → f(α) = 0 ou g(α) = −b/a.
 */
import type { FonctionTrig } from "./quelAngle.types";

export type { FonctionTrig };

export type VarianteEquationsTransformer = "affine-sin" | "affine-cos" | "affine-tan" | "carre-sin" | "carre-cos" | "produit";

/**
 * Valeur k du second membre d'une équation de base, gardée EXACTE : |k| = num·√racine / den
 * (fraction irréductible, `racine` sans facteur carré). `decimal` : à écrire en décimal (0,4 ;
 * 1,5…) — valeurs non remarquables, résolues à la calculatrice.
 */
export interface ValeurK {
  signe: 1 | -1 | 0;
  num: number;
  den: number;
  racine: 1 | 2 | 3;
  decimal: boolean;
}

/** Équation de base f(α) = k et sa résolution (tout est calculé à la génération). */
export interface EquationBase {
  fonction: FonctionTrig;
  k: ValeurK;
  /** Angle de référence α₀ ∈ [0° ; 90°] tel que f(α₀) = |k| — valeur EXACTE (non arrondie) ;
   * `null` si l'équation n'a pas de solution (|k| > 1 pour sin ou cos). */
  reference: number | null;
  /** Solutions dans [0° ; 360°[, triées, calculées depuis α₀ exact puis arrondies au dixième de
   * degré pour les valeurs non remarquables (entières sinon). */
  solutions: number[];
}

/** a·f(α) + b = c, ou a·f²(α) + b = c (`carre`). `b` peut être irrationnel (b = m·√r, alors c = 0). */
export interface MembreAffine {
  fonction: FonctionTrig;
  a: number;
  /** b = bEntier + bRacineCoef·√bRacine (l'un des deux est nul). */
  bEntier: number;
  bRacineCoef: number;
  bRacine: 1 | 2 | 3;
  c: number;
}

export type FormeEquation =
  | { type: "affine"; membre: MembreAffine }
  | {
      type: "carre";
      membre: MembreAffine;
      /** k = (c − b)/a, valeur de f²(α) (rationnelle, irréductible) */
      carreNum: number;
      carreDen: number;
      carreDecimal: boolean;
      /** Écriture « f²(α) = k » (sans coefficient ni terme constant). */
      nue: boolean;
    }
  | { type: "produit"; /** facteur nu f(α) */ nu: FonctionTrig; /** facteur a·g(α) + b (c = 0) */ affine: MembreAffine; nuEnPremier: boolean };

export interface ExerciceEquationsTransformer {
  variante: VarianteEquationsTransformer;
  forme: FormeEquation;
  /** Équations de base, dans l'ordre des facteurs (produit) ou +√k puis −√k (carré) ; vide si
   * l'équation de départ n'en a aucune (carré avec k < 0). */
  bases: EquationBase[];
  /** Au moins une valeur non remarquable : angles à la calculatrice, au dixième de degré. */
  calculatrice: boolean;
  /** Ensemble des solutions de l'équation de départ, trié (réunion des solutions des bases). */
  solutions: number[];
}

/** Écrans de l'exercice, dans l'ordre (voir `moteur/modeleEquationsTransformer.ts::ecransDe`). */
export type EcranEquationsTransformer =
  | { type: "bases" }
  | { type: "reference"; base: number }
  | { type: "solutions"; base: number }
  | { type: "ensemble" };
