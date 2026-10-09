/**
 * Couche core (6e) — contrat pour `6gen27` ("Volumes de révolution", chapitre 4 — "Intégrales et
 * primitives", après 6gen23/24/25/26). 4 familles (A à D), tirage ÉQUIPROBABLE de la famille puis,
 * pour A, d'un type de courbe (voir `generateurs6e/volumesRevolution/index.ts`).
 *
 * Formule de base : V = π∫[a;b] f(x)² dx (rotation de la courbe de f autour de l'axe des
 * abscisses) — rappelée dans la consigne générale de chaque famille
 * (`ui6e/formatVolumesRevolution.ts`).
 *
 * **Portée volontairement EXCLUE** (spec) : le cas d'un volume entre deux courbes dont la position
 * relative (laquelle est au-dessus) change à l'intérieur même de l'intervalle — trop casuistique,
 * même principe que l'aire à 3 courbes déjà exclue en 6gen26 (voir `core6e/calculAires.types.ts`).
 * La famille C de CE générateur garantit donc un ordre CONSTANT sur tout l'intervalle, par
 * construction (voir `generateurs6e/volumesRevolution/familleC.ts`).
 *
 * ============================================================================
 * **RÉUTILISATION — lire avant de modifier ce fichier**
 * ============================================================================
 * - Calcul de primitive élémentaire : `evaluerTermeA`/`primitiveTermeA`
 *   (`generateurs6e/calculPrimitives/familles/A.ts`, 6gen23) — réutilisées TELLES QUELLES pour tout
 *   terme de type "puissance"/"constante"/"expX"/"cosX" (fréquence/rythme=1). `TermeDeveloppe`
 *   ci-dessous ÉTEND `TermeA` de 2 formes supplémentaires (`expRate2`/`cosRate2`, fréquence=2)
 *   nécessaires UNIQUEMENT pour le développement du carré d'une fonction élémentaire NON
 *   polynomiale (exponentielle/trigonométrique, famille A) — un carré de somme polynomiale reste,
 *   lui, TOUJOURS représentable en `TermeA` pur (puissances entières) — voir en-tête
 *   `generateurs6e/volumesRevolution/termeDeveloppe.ts`.
 * - Comparaison "à une constante additive près" (vérification d'une primitive, écran dédié des
 *   familles A/B) : `diagnostiquerPrimitive` (`moteur6e/verificationCalculPrimitives.ts`, 6gen23)
 *   — réutilisée directement (Couche B ↔ Couche B libre entre générateurs, CLAUDE.md) par
 *   `moteur6e/verificationVolumesRevolution.ts`, jamais réimplémentée.
 * - Polynôme "depuis ses racines cibles" : `polynomeDepuisRacines`/`polynomeVersTermes`/
 *   `additionnerPolynomes`/`soustrairePolynomes`/`evaluerTermes`/`primitiverTermes`
 *   (`generateurs6e/calculAires/polynome.ts`, 6gen26) — réutilisées directement (Couche A ↔ Couche
 *   A libre) par les familles B/C de CE générateur pour la recherche de racines/intersections.
 *   `multiplierPolynomes` (produit général de 2 polynômes, nécessaire pour élever un polynôme au
 *   carré — jamais requis par 6gen26, qui ne fait que des sommes/un produit par facteur LINÉAIRE)
 *   est AJOUTÉ localement dans `generateurs6e/volumesRevolution/polynome.ts`, jamais rétro-ajouté à
 *   `calculAires/polynome.ts` (fichier d'un autre générateur, non modifié par celui-ci).
 *
 * ============================================================================
 * Construction "depuis les racines/paramètres cibles" (familles B, C) — convention du chantier,
 * identique à `core6e/calculAires.types.ts` : les racines/points d'intersection sont choisis
 * D'ABORD (entiers distincts, propres), le polynôme est DÉRIVÉ algébriquement pour les avoir
 * exactement, jamais l'inverse (tirage d'un polynôme puis recherche numérique de ses racines).
 */

import type { TermeA } from "./calculPrimitives.types";

// ============================================================================
// Famille A — Volume par rotation d'une courbe seule, bornes données (3 écrans).
// ============================================================================

export type TypeVolumeA = "polynomiale" | "exponentielle" | "trigonometrique";

/** Terme du développement de f(x)² — `TermeA` pur pour "polynomiale" (carré d'un binôme affine,
 * toujours puissance/constante après développement), ÉTENDU de 2 formes pour "exponentielle"
 * (`expRate2` = coef·e^{2x}, issu de (a·e^x)²) et "trigonometrique" (`cosRate2` = coef·cos(2x),
 * issu de l'identité cos²x=(1+cos2x)/2 appliquée à (a·cos x)²) — voir
 * `generateurs6e/volumesRevolution/termeDeveloppe.ts`. */
export type TermeDeveloppe = TermeA | { type: "expRate2"; coef: number } | { type: "cosRate2"; coef: number };

export interface ExerciceVolumeA {
  famille: "A";
  type: TypeVolumeA;
  /** f(x) — 2 termes (a·x+b / a·e^x+b, un vrai binôme pour forcer un développement de carré
   * authentique) ou 1 seul terme (a·cos(x), "trigonometrique" — l'identité EST le "développement",
   * voir en-tête `generateurs6e/volumesRevolution/familleA.ts`). */
  termes: TermeA[];
  a: number;
  b: number;
  /** f(x)², développée/simplifiée — réponse attendue de l'écran 1. */
  developpe: TermeDeveloppe[];
  fReference: (x: number) => number;
  developpeReference: (x: number) => number;
  /** Primitive de `developpe` (constante nulle) — réponse attendue de l'écran 2. */
  primitiveDeveloppeReference: (x: number) => number;
}

// ============================================================================
// Famille B — Volume par rotation, bornes à trouver (4 écrans).
// ============================================================================

export interface ExerciceVolumeB {
  famille: "B";
  /** f(x) polynomiale (quadratique), 2 racines RÉELLES r1<r2 — depuis
   * `polynomeDepuisRacines`/`polynomeVersTermes` (6gen26). Les bornes du volume sont EXACTEMENT
   * r1,r2 (à trouver par l'élève à l'écran 1). */
  termes: TermeA[];
  r1: number;
  r2: number;
  /** f(x)², développée — toujours `TermeA` pur (carré d'un polynôme). */
  developpe: TermeA[];
  fReference: (x: number) => number;
  developpeReference: (x: number) => number;
  primitiveDeveloppeReference: (x: number) => number;
}

// ============================================================================
// Famille C — Volume entre une courbe et une droite (4 écrans).
// ============================================================================

export type OrdreCourbes = "fSurG" | "gSurF";

export interface ExerciceVolumeC {
  famille: "C";
  /** f(x) — parabole. */
  termesF: TermeA[];
  /** g(x) = m·x+p — droite. */
  termesG: TermeA[];
  /** Points d'intersection de f et g (= bornes du volume) — r1<r2. */
  r1: number;
  r2: number;
  /** f≥g ou g≥f sur ]r1;r2[ — signe constant garanti PAR CONSTRUCTION (jamais vérifié a
   * posteriori), voir `generateurs6e/volumesRevolution/familleC.ts`. */
  ordre: OrdreCourbes;
  /** sup(x)²−inf(x)², développée — toujours `TermeA` pur (différence de 2 carrés de polynômes). */
  developpe: TermeA[];
  fReference: (x: number) => number;
  gReference: (x: number) => number;
  developpeReference: (x: number) => number;
  primitiveDeveloppeReference: (x: number) => number;
}

// ============================================================================
// Famille D — Comparaison à un cylindre englobant (3 écrans).
// ============================================================================

export interface ExerciceVolumeD {
  famille: "D";
  /** f(x) = k·√x sur [0;L] (paraboloïde) — k∈{1;1,5;2;2,5} représenté en fraction EXACTE
   * (kNum/kDen) pour l'affichage LaTeX, jamais en décimal (CLAUDE.md) — voir
   * `generateurs6e/volumesRevolution/familleD.ts`. */
  kNum: number;
  kDen: number;
  /** Carré parfait (4, 9, 16 ou 25) — garantit un rayon f(L)=k√L propre. */
  L: number;
  /** Volume du paraboloïde = π∫[0;L] k²x dx = π·k²·L²/2 (réponse attendue de l'écran 1). k,L
   * choisis pour rester EXACTEMENT représentables en `number` (voir en-tête du constructeur). */
  volumeParaboloide: number;
  /** Volume du cylindre englobant (rayon=k√L, hauteur=L) = π·k²·L² (réponse attendue de l'écran
   * 2). */
  volumeCylindre: number;
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceVolumesRevolution = ExerciceVolumeA | ExerciceVolumeB | ExerciceVolumeC | ExerciceVolumeD;

export type FamilleVolumesRevolution = ExerciceVolumesRevolution["famille"];

export type GenerateurExerciceVolumesRevolution = () => ExerciceVolumesRevolution;
