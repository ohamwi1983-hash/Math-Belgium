import type { FragmentConsigne } from "../../export/genererFeuilleExercices";

/**
 * Couche core — « Le détective d'erreurs : intégrales et primitives » (6gen84, 6e, chapitre 4
 * « Intégrales et primitives », section « problemes », processus 3 TRANSFÉRER). Sur le modèle de
 * gen81/gen91 (4e).
 *
 * Un élève fictif a résolu un exercice du chapitre (3 à 5 lignes numérotées). UNE SEULE ligne est
 * fausse, et tout ce qui suit en découle (la copie reste cohérente avec son erreur). L'élève trouve
 * la ligne, nomme l'erreur, puis corrige la valeur de la ligne et le résultat final.
 *
 * Notation du cours : `\int_a^b f(x)\,dx`, `\left[F(x)\right]_a^b`, `\ln|x|`, méthode des disques
 * `V = \pi\int_a^b [f(x)]^2\,dx`, valeur moyenne `\dfrac{1}{b-a}\int_a^b f(x)\,dx`, condition
 * initiale `F(x_0) + C = y_0`, aires en u.a.
 */

/** Les sept types d'erreur du catalogue (une variante chacun). */
export type TypeErreurIntegrales = "affine" | "lnAbs" | "signe" | "aire" | "volume" | "bornes" | "constante";

/** Exercice support que la copie résout. */
export type SupportIntegrales = "integrale" | "conditionInitiale" | "aireCourbe" | "aireDeuxCourbes" | "volume" | "valeurMoyenne" | "cinematique";

/**
 * Scénario = type d'erreur + exercice support + ligne fausse (même étape d'une série à l'autre) :
 * - A1 : ∫ c·cos(kx) sur [0 ; π/(2k)], primitive c·sin(kx) sans diviser par k (ligne 1/4) ;
 * - A2 : ∫ (ax + b)ⁿ sur [0 ; 1], primitive sans diviser par a (ligne 2/4) ;
 * - L1 : ∫ c/x sur un intervalle négatif, primitive c·ln(x) (ligne 1/4) ;
 * - L2 : primitive de c/x sur ]−∞ ; 0[ avec condition initiale, c·ln(x) + C (ligne 1/4) ;
 * - G1 : ∫ c·sin(x), crochet [cos(x)] au lieu de [−cos(x)] (ligne 2/5) ;
 * - G2 : primitive de c·cos(x) avec condition initiale, −c·sin(x) + C (ligne 1/4) ;
 * - R1 : aire entre x² − k² et l'axe sur [0 ; m], sans découper en k (ligne 2/4) ;
 * - R2 : aire entre kx et x² sur [0 ; m], sans découper en k (ligne 2/4) ;
 * - V1 : volume de révolution de kx, carré oublié (ligne 2/4) ;
 * - V2 : volume de révolution de √(kx), π oublié (ligne 2/4) ;
 * - B1 : valeur moyenne, intégrale calculée F(a) − F(b) (ligne 2/3) ;
 * - C1 : primitive avec condition initiale, C mal isolée (ligne 3/4) ;
 * - C2 : cinématique, vitesse sans constante d'intégration (ligne 1/3).
 */
export type IdScenarioIntegrales = "A1" | "A2" | "L1" | "L2" | "G1" | "G2" | "R1" | "R2" | "V1" | "V2" | "B1" | "C1" | "C2";

/** Descriptions d'erreur proposées à l'écran 2 (la bonne + 3 leurres). */
export type IdDescriptionIntegrales =
  | "affine"
  | "lnAbs"
  | "signeSin"
  | "signeCos"
  | "aireRacines"
  | "aireIntersections"
  | "volumeCarre"
  | "volumePi"
  | "bornes"
  | "constanteIsolee"
  | "constanteOubliee"
  // leurres
  | "multiplierParA"
  | "exposant"
  | "developper"
  | "constanteIntegrale"
  | "signeCosFaux"
  | "deriveeInverse"
  | "pasDePrimitive"
  | "lnMoins"
  | "linearite"
  | "decoupeIntegrale"
  | "diviserParC"
  | "conditionSurf"
  | "constanteAbsente"
  | "valeurAbsolueGlobale"
  | "deriveeAuLieu"
  | "ordreCourbes"
  | "intersectionsFausses"
  | "volumeCube"
  | "volumeDeuxPi"
  | "constanteBornes"
  | "decoupeRacines"
  | "valeurF"
  | "primitiveDemi"
  | "vitesseDerivee"
  | "positionVitesse";

export interface ExerciceDetectiveIntegrales {
  scenario: IdScenarioIntegrales;
  /** Paramètres entiers du scénario (noms propres à chaque scénario, voir le modèle). */
  donnees: Record<string, number>;
  /** Les 4 descriptions de l'écran 2, dans l'ordre d'affichage (tiré à la génération : le QR code
   * rouvre le même ordre). */
  options: IdDescriptionIntegrales[];
}

/** Rationnel irréductible (dénominateur > 0). */
export interface Rationnel {
  n: number;
  d: number;
}

/** Terme d'une valeur exacte : coefficient rationnel × symbole (`""` = 1, `\pi`, `\ln(2)`, `\sqrt{3}`). */
export interface TermeExact {
  coef: Rationnel;
  symbole: string;
  valeur: number;
}

/** Valeur portée par une ligne (ce que l'écran 3 demande de corriger). */
export type ValeurLigne =
  | {
      genre: "nombre";
      /** Ce qui précède le champ (« Aire = », `V =`, `C =`…). */
      prefixe: FragmentConsigne[];
      termes: TermeExact[];
      unite?: string;
    }
  | {
      genre: "fonction";
      /** LaTeX avant le champ (`F(x)`, `\int \sin(x)\,dx`, `[f(x)]^2`, `v(t)`). */
      quantite: string;
      /** LaTeX de la bonne réponse (sans « + C »). */
      latex: string;
      variable: "x" | "t";
      /** Fonction de référence (calculée par le modèle à chaque appel, jamais stockée). */
      f: (x: number) => number;
      /** Points d'échantillonnage (tous dans le domaine de l'exercice). */
      points: number[];
      /** Une primitive quelconque suffit (comparaison à une constante près). */
      aConstantePres: boolean;
      /** « + C » affiché après le champ (ligne de primitive générale). */
      avecC: boolean;
    };
