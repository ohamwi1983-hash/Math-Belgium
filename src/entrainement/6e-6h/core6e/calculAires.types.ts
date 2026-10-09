/**
 * Couche core (6e) — contrat pour `6gen26` ("Calcul d'aires par intégrale", chapitre 4 —
 * "Intégrales et primitives"). 4 familles (A à D), tirage ÉQUIPROBABLE de la famille puis, pour D,
 * d'un sous-type au sein de la famille (voir `generateurs6e/calculAires/index.ts`).
 *
 * ============================================================================
 * **RÉUTILISATION — construction (Couche A) et vérification (Couche B) de 6gen23**
 * ============================================================================
 * Ce générateur réutilise le CALCUL DE PRIMITIVE déjà construit par `6gen23`
 * (`core6e/calculPrimitives.types.ts`) plutôt que de le réimplémenter :
 * - `evaluerTermeA`/`primitiveTermeA` (`generateurs6e/calculPrimitives/familles/A.ts`, exportées) —
 *   la table {type de terme → f(x)/F(x)} qui sait évaluer et primitiver un terme élémentaire
 *   (puissance de x, exponentielle, 1/x, cos(x), constante...). Famille A de CE générateur
 *   l'utilise directement sur un terme UNIQUE (signe garanti constant par construction) ; les
 *   familles B/C/D (courbes polynomiales construites depuis des racines cibles, voir plus bas)
 *   l'utilisent sur les termes "puissance"/"constante" issus du DÉVELOPPEMENT d'un produit de
 *   facteurs linéaires (`generateurs6e/calculAires/polynome.ts`).
 * - `diagnostiquerValeur`/`diagnostiquerEquivalenceFonction`/`diagnostiquerEnsembleValeurs`
 *   (`moteur6e/equivalenceExponentielle.ts`) — briques de vérification par échantillonnage déjà
 *   partagées par tout le chantier 6e, réutilisées telles quelles (jamais modifiées).
 *
 * **Portée volontairement DIFFÉRENTE de 6gen23** : ce générateur ne réutilise PAS les constructeurs
 * `construireFamilleA/B/C/G` de 6gen23 eux-mêmes (leurs courbes — sommes de plusieurs termes de
 * types variés, décompositions rationnelles...) car leur signe n'est pas contrôlable simplement sur
 * un intervalle choisi a priori (condition centrale de la spec de CE générateur : signe garanti
 * constant par construction pour les familles A/B, signe alternant CONNU À L'AVANCE pour la famille
 * C). La primitive de 6gen23 EST réutilisée (au niveau du TERME, cf. ci-dessus) ; sa Couche A de
 * tirage global ne l'est pas.
 *
 * **6gen25 (intégrales définies) n'est PAS importé** — construit en parallèle par un agent sœur au
 * moment où ce générateur est écrit, il n'existe pas dans ce worktree. L'évaluation d'une intégrale
 * définie nécessaire ici (`primitiveReference(b) - primitiveReference(a)`) est un calcul de 2
 * lignes, implémenté directement dans `generateurs6e/calculAires/` plutôt que d'introduire un
 * couplage entre générateurs sœurs indépendants pour un besoin aussi minime.
 *
 * ============================================================================
 * **Construction "depuis les racines cibles" (familles B, C, D) — convention du chantier**
 * ============================================================================
 * Les racines/points d'intersection sont choisis D'ABORD (entiers distincts, propres), puis le
 * polynôme est DÉRIVÉ algébriquement pour avoir exactement ces racines (produit de facteurs
 * linéaires développé — `generateurs6e/calculAires/polynome.ts`), jamais l'inverse (tirage d'un
 * polynôme puis recherche numérique de ses racines). Garantit des racines exactes et propres, ce
 * dont a besoin la vérification add-as-needed (`diagnostiquerEnsembleValeurs`, comparaison EXACTE
 * de l'ensemble de valeurs, jamais approchée).
 */

import type { TermeA } from "./calculPrimitives.types";

export type SigneFonction = "positif" | "negatif";

// ============================================================================
// Famille A — Aire courbe/axe, bornes données, signe constant (2 écrans).
// ============================================================================

export type TypeCourbeAireA = "exponentielle" | "rationnelle" | "trigonometrique";

export interface ExerciceAireA {
  famille: "A";
  type: TypeCourbeAireA;
  /** Le terme UNIQUE représentant f(x) — réutilise `evaluerTermeA`/`primitiveTermeA` de 6gen23. */
  terme: TermeA;
  a: number;
  b: number;
  /** Signe correct de f sur [a,b] — garanti constant par construction (voir chaque constructeur). */
  signe: SigneFonction;
  integrandeReference: (x: number) => number;
  primitiveReference: (x: number) => number;
}

// ============================================================================
// Famille B — Aire courbe/axe, bornes à trouver, signe constant (3 écrans).
// ============================================================================

export type TypeCourbeAireB = "parabole" | "cubique";

export interface ExerciceAireB {
  famille: "B";
  type: TypeCourbeAireB;
  /** f(x) sous forme développée (somme de `TermeA` puissance/constante), depuis les racines. */
  termes: TermeA[];
  /** Racines RÉELLES bornant la région de signe constant — r1 < r2 (pour "cubique", r1 est une
   * racine DOUBLE : le signe de f ne change qu'en r2, garantissant un signe constant sur ]r1,r2[). */
  r1: number;
  r2: number;
  signe: SigneFonction;
  integrandeReference: (x: number) => number;
  primitiveReference: (x: number) => number;
}

// ============================================================================
// Famille C — Signe changeant, découper et sommer (4 écrans) — piège central.
// ============================================================================

export interface ExerciceAireC {
  famille: "C";
  /** f(x) = A(x-r1)(x-r2)(x-r3), 3 racines DISTINCTES r1<r2<r3 — signe alternant automatiquement
   * (changement de signe à chaque racine simple), sous forme développée. */
  termes: TermeA[];
  r1: number;
  r2: number;
  r3: number;
  /** Signe de f sur ]r1,r2[ (signeGauche) et ]r2,r3[ (signeDroit) — toujours opposés. */
  signeGauche: SigneFonction;
  signeDroit: SigneFonction;
  integrandeReference: (x: number) => number;
  primitiveReference: (x: number) => number;
}

// ============================================================================
// Famille D — Aire entre deux courbes, avec variante paramètre (2 à 4 écrans).
// ============================================================================

export type SousTypeAireD = "bornesDonnees" | "bornesATrouver" | "parametre";
export type OrdreCourbes = "fSurG" | "gSurF";

interface ExerciceAireD_Commun {
  famille: "D";
  sousType: SousTypeAireD;
  ordre: OrdreCourbes;
}

/** Sous-types "bornesDonnees"/"bornesATrouver" — f(x)=A(x-r1)(x-r2)+g(x) (quadratique+droite),
 * h=f-g=A(x-r1)(x-r2) de signe constant sur ]r1,r2[ (mêmes bornes que l'intervalle d'aire — servent
 * de bornes DONNÉES pour le premier sous-type, à TROUVER par résolution f(x)=g(x) pour le second). */
export interface ExerciceAireD_Courbes extends ExerciceAireD_Commun {
  sousType: "bornesDonnees" | "bornesATrouver";
  termesF: TermeA[];
  termesG: TermeA[];
  /** h = f-g, sous forme développée — sert au calcul direct de l'aire (évite de re-soustraire deux
   * évaluations à chaque appel). */
  termesH: TermeA[];
  r1: number;
  r2: number;
  fReference: (x: number) => number;
  gReference: (x: number) => number;
  primitiveHReference: (x: number) => number;
}

export type MotifParametreAireD = "droiteParOrigine" | "paraboleDroiteHorizontale";

/** Sous-type "parametre" — f,g dépendent de m>0 ; bornes DONNÉES en toutes lettres dans l'énoncé
 * (fonctions de m, jamais "à trouver" — voir en-tête `generateurs6e/calculAires/familleD.ts` pour
 * la justification de ce choix de portée). `aireDeMReference(m)` est la formule fermée EXACTE de
 * l'aire en fonction de m (`m³/6` ou `(4/3)m^{3/2}` selon le motif) — calculée directement, jamais
 * réobtenue par résolution symbolique d'équation (convention "construire depuis la réponse", voir
 * en-tête `core6e/calculAires.types.ts`). */
export interface ExerciceAireD_Parametre extends ExerciceAireD_Commun {
  sousType: "parametre";
  motif: MotifParametreAireD;
  /** Valeur de m CHOISIE à la construction — c'est ELLE la réponse attendue de l'écran 4 (jamais
   * recalculée par résolution symbolique). */
  m: number;
  /** Cible = aireDeMReference(m) — la valeur numérique donnée à l'élève comme "aire visée". */
  cible: number;
  aireDeMReference: (m: number) => number;
}

export type ExerciceAireD = ExerciceAireD_Courbes | ExerciceAireD_Parametre;

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceCalculAires = ExerciceAireA | ExerciceAireB | ExerciceAireC | ExerciceAireD;

export type FamilleCalculAires = ExerciceCalculAires["famille"];

export type GenerateurExerciceCalculAires = () => ExerciceCalculAires;
