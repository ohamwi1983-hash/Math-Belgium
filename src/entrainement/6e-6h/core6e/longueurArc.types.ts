/**
 * Couche core (6e) — contrat pour `6gen28` ("Longueur d'un arc de courbe", chapitre 4 —
 * "Intégrales et primitives"). 3 familles (A à C), tirage ÉQUIPROBABLE de la famille
 * (`generateurs6e/longueurArc/index.ts`).
 *
 * ============================================================================
 * **PRINCIPE TRANSVERSAL CENTRAL — construit à l'envers, jamais f et les bornes indépendamment**
 * ============================================================================
 * La formule L=∫[a,b]√(1+f'(x)²)dx n'est presque JAMAIS calculable directement. Les 3 familles
 * sont donc chacune construites DEPUIS le résultat voulu, jamais l'inverse (même principe déjà
 * établi par 6gen26, voir `core6e/calculAires.types.ts`) :
 * - Famille A : n et f(x) choisis pour que 1+f'(x)² soit un carré parfait PAR CONSTRUCTION
 *   algébrique (identité vraie pour tout n — voir `generateurs6e/longueurArc/familleA.ts`).
 * - Famille B : k choisi, PUIS deux valeurs cibles ENTIÈRES t1<t2 de la substitution
 *   t=√(x²+k²) — les bornes réelles a,b sont déduites ENSUITE (a=√(t1²−k²), b=√(t2²−k²)),
 *   jamais l'inverse (tirer a,b puis espérer que t tombe juste).
 * - Famille C : cas de CONTRASTE délibéré — 1+f'(x)² est seulement AFFINE en x (jamais un carré
 *   parfait), bornes a,b tirées librement puisque la substitution standard s'applique quel que
 *   soit leur choix.
 *
 * ============================================================================
 * **RÉUTILISATION — évaluateur d'expression et briques de vérification (Couche B, `moteur6e/`)**
 * ============================================================================
 * Les courbes de ce générateur (sommes x^n/x^(−n), k·ln(x) menant à une décomposition en éléments
 * simples propre à la substitution t=√(x²+k²), x^(3/2)) ne correspondent à AUCUN `TermeA` de
 * `core6e/calculPrimitives.types.ts` (`generateurs6e/calculPrimitives/familles/A.ts` couvre des
 * termes élémentaires isolés, pas des sommes de puissances signées ni des primitives en variable
 * t) : leurs `xxxReference` sont donc des fermetures BESPOKE, écrites directement dans
 * `generateurs6e/longueurArc/famille{A,B,C}.ts`, jamais réobtenues depuis un constructeur de
 * 6gen23. Ce qui EST réutilisé tel quel (Couche B ↔ Couche B, réutilisation libre — CLAUDE.md) :
 * `diagnostiquerValeur`/`diagnostiquerEquivalenceFonction`
 * (`moteur6e/equivalenceExponentielle.ts`) et surtout `diagnostiquerPrimitive`
 * (`moteur6e/verificationCalculPrimitives.ts`, LA brique "primitive à une constante additive
 * près" du chantier) pour les écrans "trouver une primitive" des familles B (écran 3, en
 * variable t) et C (écran 2) — voir en-tête de `moteur6e/verificationLongueurArc.ts`.
 */

export interface ExerciceLongueurArcA {
  famille: "A";
  /** n∈{2,3,4} — f(x)=(1/2)[x^(n+1)/(n+1) + x^(1−n)/(n−1)], f'(x)=(1/2)(x^n−x^(−n)). */
  n: number;
  a: number;
  b: number;
  /** f(x) — donnée dans l'énoncé, l'élève n'a pas à la deviner (spec explicite). */
  fReference: (x: number) => number;
  /** f'(x) — réponse attendue de l'écran 1. */
  fPrimeReference: (x: number) => number;
  /** √(1+f'(x)²) SIMPLIFIÉE = (1/2)(x^n+x^(−n)) — réponse attendue de l'écran 2, sous cette forme
   * SPÉCIFIQUEMENT (pas n'importe quelle forme équivalente — voir en-tête de fichier
   * `verificationLongueurArc.ts`). */
  racineSimplifieeReference: (x: number) => number;
  /** Primitive de `racineSimplifieeReference` — sert au calcul de la longueur d'arc, écran 3. */
  primitiveReference: (x: number) => number;
}

export interface ExerciceLongueurArcB {
  famille: "B";
  /** k∈{1,2,3} — f(x)=k·ln(x), f'(x)=k/x, 1+f'(x)²=(x²+k²)/x². */
  k: number;
  /** Valeurs cibles ENTIÈRES de t=√(x²+k²) aux bornes — choisies EN PREMIER (voir en-tête de
   * fichier), t1<t2, toutes deux > k. */
  t1: number;
  t2: number;
  /** Bornes réelles DÉDUITES : a=√(t1²−k²), b=√(t2²−k²) — pas nécessairement entières (formes
   * exactes affichées en racine, jamais arrondies — CLAUDE.md "jamais de décimal"). */
  a: number;
  b: number;
  /** Intégrande réécrit en t (variable "t") = t²/(t²−k²) — réponse attendue de l'écran 2. */
  integrandeEnTReference: (t: number) => number;
  /** Primitive en t = t + (k/2)·ln|(t−k)/(t+k)| — réponse attendue de l'écran 3. */
  primitiveEnTReference: (t: number) => number;
}

export interface ExerciceLongueurArcC {
  famille: "C";
  /** f(x)=x^(3/2), f'(x)=(3/2)√x, f'(x)²=(9/4)x. */
  a: number;
  b: number;
  /** 1+f'(x)² = 1+(9/4)x — AFFINE en x, PAS un carré parfait (contraste avec la famille A, voir
   * en-tête de fichier). Réponse attendue de l'écran 1. */
  unPlusFPrimeCarreReference: (x: number) => number;
  /** Primitive de √(1+(9/4)x) = (8/27)·(1+(9/4)x)^(3/2) — réponse attendue de l'écran 2. */
  primitiveReference: (x: number) => number;
}

export type ExerciceLongueurArc = ExerciceLongueurArcA | ExerciceLongueurArcB | ExerciceLongueurArcC;

export type FamilleLongueurArc = ExerciceLongueurArc["famille"];

export type GenerateurExerciceLongueurArc = () => ExerciceLongueurArc;
