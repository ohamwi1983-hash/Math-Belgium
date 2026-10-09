/**
 * Couche core (6e) — contrat pour `6gen23` ("Calcul de primitives", chapitre 4 — "Intégrales et
 * primitives", PREMIER générateur de ce chapitre). 7 familles (A à G), tirage ÉQUIPROBABLE de la
 * famille puis d'un sous-type au sein de la famille (voir `generateurs6e/calculPrimitives/index.ts`).
 *
 * ============================================================================
 * **CONTRAT DE RÉUTILISATION — familles A, B, C, G (lire avant de modifier ce fichier)**
 * ============================================================================
 * `6gen24`/`6gen25`/`6gen26` (pas encore construits) réutiliseront intégralement la Couche A
 * (construction) et la Couche B (vérification) des familles A, B, C, G — JAMAIS D, E, F (trop
 * spécifiques : IBP cyclique, substitution trigonométrique, identités trigonométriques — la spec de
 * ce générateur exclut explicitement ces 3 familles de la réutilisation en aval). Concrètement :
 * - `6gen24` ajoute un écran "trouver la constante C depuis une condition initiale" après l'écran
 *   final de primitive — il a besoin d'évaluer NUMÉRIQUEMENT la primitive correcte en un point
 *   donné (`x=a`) pour résoudre `C = valeur_imposée − F(a)`.
 * - `6gen25`/`6gen26` ajoutent un écran d'intégrale définie / calcul d'aire — même besoin : évaluer
 *   `F(b)−F(a)`.
 *
 * **D'où le champ `primitiveReference: (x: number) => number` présent sur CHAQUE variante des 7
 * familles** (pas seulement A/B/C/G, par cohérence de contrat) : la primitive CORRECTE de
 * l'exercice, à une constante additive près (convention `C=0`), sous forme d'une fonction
 * ÉVALUABLE — jamais seulement une chaîne LaTeX d'affichage (`ui6e/formatCalculPrimitives.ts`
 * fournit séparément le rendu textuel/KaTeX). Un futur générateur n'a JAMAIS besoin de connaître la
 * structure interne d'un exercice A/B/C/G pour calculer `F(a)` — il appelle simplement
 * `exercice.primitiveReference(a)`. `integrandeReference: (x: number) => number` (bonus, présent
 * partout aussi) est la fonction f(x) elle-même — utile pour un futur générateur qui voudrait
 * ré-afficher l'énoncé ou vérifier une propriété de f, et déjà utilisé ICI par les tests de
 * cohérence interne (différentiation numérique de `primitiveReference`, comparée à
 * `integrandeReference`, sur chaque famille — voir `generateurs6e/calculPrimitives/*.test.ts`).
 *
 * Pour A/B/C/G spécifiquement, les fonctions de CONSTRUCTION exportées avec un nom stable sont :
 * `construireFamilleA`/`construireFamilleB`/`construireFamilleC`/`construireFamilleG` (tirage
 * équiprobable du sous-type interne) dans `generateurs6e/calculPrimitives/familles/{A,B,C,G}.ts` —
 * plus les constructeurs GRANULAIRES par sous-type (`construireFamilleADirecte`,
 * `construireFamilleC1`...`construireFamilleC4`, etc., voir chaque fichier) pour un contrôle fin.
 * Les fonctions de VÉRIFICATION exportées sont `diagnostiquerXxxEcranYyy`/`verifierXxxEcranYyy`
 * dans `moteur6e/verificationCalculPrimitives.ts` — voir l'en-tête de ce fichier pour le détail.
 *
 * ============================================================================
 * Toutes les valeurs numériques générées restent EXACTES (entiers/rationnels simples) — jamais de
 * décimal arrondi stocké (convention CLAUDE.md) ; seules les closures `*Reference` évaluent
 * numériquement (nécessaire pour l'échantillonnage de vérification, voir
 * `moteur6e/verificationCalculPrimitives.ts`).
 */

// ============================================================================
// Famille A — Primitives immédiates.
// ============================================================================

export type SousTypeA = "direct" | "diviserFraction" | "diviserProduit";

/** Un terme élémentaire de la somme (sous-type "direct") — 8 formes possibles (spec). */
export type TypeTermeA = "invX" | "puissance" | "expX" | "cosX" | "baseX" | "arctanTerme" | "arcsinTerme" | "constante";

export interface TermeA {
  type: TypeTermeA;
  /** Coefficient entier non nul (sauf "constante", qui EST le coefficient lui-même). */
  coef: number;
  /** Exposant (1..4), uniquement pour type "puissance". */
  n?: number;
  /** Base (2,3,5), uniquement pour type "baseX". */
  base?: number;
}

export interface ExerciceFamilleA_Direct {
  famille: "A";
  sousType: "direct";
  termes: TermeA[];
  primitiveReference: (x: number) => number;
  integrandeReference: (x: number) => number;
}

/** f(x) = (a·x^p + b·x^q) / x^r — nécessite de diviser chaque terme par x^r avant de reconnaître
 * les primitives immédiates (11.c/f de la spec source). */
export interface ExerciceFamilleA_DiviserFraction {
  famille: "A";
  sousType: "diviserFraction";
  a: number;
  p: number;
  b: number;
  q: number;
  r: number;
  /** Écran 1 — forme réécrite : a·x^(p-r) + b·x^(q-r). */
  rewrittenReference: (x: number) => number;
  primitiveReference: (x: number) => number;
  integrandeReference: (x: number) => number;
}

/** f(x) = c·x^k·√x — nécessite de combiner en un seul exposant (x^(k+1/2)) avant de primitiver. */
export interface ExerciceFamilleA_DiviserProduit {
  famille: "A";
  sousType: "diviserProduit";
  c: number;
  k: number;
  rewrittenReference: (x: number) => number;
  primitiveReference: (x: number) => number;
  integrandeReference: (x: number) => number;
}

export type ExerciceFamilleA = ExerciceFamilleA_Direct | ExerciceFamilleA_DiviserFraction | ExerciceFamilleA_DiviserProduit;

// ============================================================================
// Famille B — Fonctions composées, ajustement de coefficient.
// ============================================================================

export type TypeGFamilleB = "puissance" | "invU" | "expU" | "cosU" | "sinU" | "invUsq" | "invSqrtU";
export type TypeUFamilleB = "affine" | "puissance";

export interface ExerciceFamilleB {
  famille: "B";
  sousType: "unique";
  typeG: TypeGFamilleB;
  /** Exposant de g, uniquement pour typeG="puissance" (n≠-1). */
  nG?: number;
  typeU: TypeUFamilleB;
  /** Affine : u(x) = mAffine·x + nAffine. */
  mAffine?: number;
  nAffine?: number;
  /** Puissance : u(x) = x^pPuissance + cPuissance. */
  pPuissance?: number;
  cPuissance?: number;
  /** Coefficient affiché devant l'expression. */
  k: number;
  /** u'(x) = mCoef · x^expPart (représentation unifiée affine/puissance — voir en-tête
   * `generateurs6e/calculPrimitives/familles/B.ts`). */
  mCoef: number;
  expPart: number;
  /** k / mCoef, EXACT (peut être une fraction non entière). */
  facteurAjustement: number;
  uReference: (x: number) => number;
  uPrimeReference: (x: number) => number;
  primitiveReference: (x: number) => number;
  integrandeReference: (x: number) => number;
}

// ============================================================================
// Famille C — Substitution algébrique manuelle.
// ============================================================================

/** Sous-type 1 — x·√(ax+b). */
export interface ExerciceFamilleC1 {
  famille: "C";
  sousType: "1";
  a: number;
  b: number;
  k: number;
  uReference: (x: number) => number;
  xDeUReference: (u: number) => number;
  /** dx = du / uPrime(x) — uPrime constant ici (=a). */
  uPrimeReference: (x: number) => number;
  /** Intégrande réécrit en u SEUL (après substitution complète). */
  integrandeEnUReference: (u: number) => number;
  primitiveEnUReference: (u: number) => number;
  primitiveReference: (x: number) => number;
  integrandeReference: (x: number) => number;
}

/** Sous-type 2 — u = arctan(x) ou arcsin(x), k·u²·u'. */
export interface ExerciceFamilleC2 {
  famille: "C";
  sousType: "2";
  cyclo: "arctan" | "arcsin";
  k: number;
  uReference: (x: number) => number;
  uPrimeReference: (x: number) => number;
  integrandeEnUReference: (u: number) => number;
  primitiveEnUReference: (u: number) => number;
  primitiveReference: (x: number) => number;
  integrandeReference: (x: number) => number;
}

/** Sous-type 3 — u = √x, k/((1+x)√x). */
export interface ExerciceFamilleC3 {
  famille: "C";
  sousType: "3";
  k: number;
  uReference: (x: number) => number;
  xDeUReference: (u: number) => number;
  uPrimeReference: (x: number) => number;
  integrandeEnUReference: (u: number) => number;
  primitiveEnUReference: (u: number) => number;
  primitiveReference: (x: number) => number;
  integrandeReference: (x: number) => number;
}

/** Sous-type 4 — u = e^x+1, k·e^x/√(e^x+1). */
export interface ExerciceFamilleC4 {
  famille: "C";
  sousType: "4";
  k: number;
  uReference: (x: number) => number;
  uPrimeReference: (x: number) => number;
  integrandeEnUReference: (u: number) => number;
  primitiveEnUReference: (u: number) => number;
  primitiveReference: (x: number) => number;
  integrandeReference: (x: number) => number;
}

export type ExerciceFamilleC = ExerciceFamilleC1 | ExerciceFamilleC2 | ExerciceFamilleC3 | ExerciceFamilleC4;

// ============================================================================
// Famille D — Intégration par parties.
// ============================================================================

interface ExerciceFamilleD_IBPCommun {
  famille: "D";
  /** u(x) choisi pour l'IBP. */
  uReference: (x: number) => number;
  /** Second facteur g(x), tel que dv = g(x)dx. */
  gReference: (x: number) => number;
  uPrimeReference: (x: number) => number;
  /** v(x), primitive de g (constante nulle). */
  vReference: (x: number) => number;
  uvReference: (x: number) => number;
  /** v(x)·u'(x) — l'intégrande de la "nouvelle intégrale" (SANS le signe -). */
  integrandeVduReference: (x: number) => number;
  primitiveReference: (x: number) => number;
  integrandeReference: (x: number) => number;
}

export interface ExerciceFamilleD1 extends ExerciceFamilleD_IBPCommun {
  sousType: "1";
  a: number;
  b: number;
  kTrig: number;
  trig: "cos" | "sin";
}

export interface ExerciceFamilleD2 extends ExerciceFamilleD_IBPCommun {
  sousType: "2";
  c: number;
  kExp: number;
}

export interface ExerciceFamilleD3 extends ExerciceFamilleD_IBPCommun {
  sousType: "3";
  cyclo: "ln" | "arctan";
  k: number;
}

export interface ExerciceFamilleD4 extends ExerciceFamilleD_IBPCommun {
  sousType: "4";
  kExp: number;
  trig: "sin" | "cos";
}

/** Sous-type 5 — piège de simplification préalable, AUCUN écran d'IBP (écran unique direct). */
export interface ExerciceFamilleD5 {
  famille: "D";
  sousType: "5";
  base: number;
  k: number;
  primitiveReference: (x: number) => number;
  integrandeReference: (x: number) => number;
}

export type ExerciceFamilleD = ExerciceFamilleD1 | ExerciceFamilleD2 | ExerciceFamilleD3 | ExerciceFamilleD4 | ExerciceFamilleD5;

// ============================================================================
// Famille E — Substitution trigonométrique.
// ============================================================================

export interface ExerciceFamilleE {
  famille: "E";
  sousType: "sinus" | "tangente";
  a: number;
  /** x(θ) — a·sin(θ) ou a·tan(θ). */
  xDeThetaReference: (theta: number) => number;
  /** dx = f(θ)·dθ — coefficient de dθ en fonction de θ. */
  dxCoefReference: (theta: number) => number;
  /** Expression simplifiée en θ (après identité pythagoricienne), SANS le facteur dx. */
  expressionSimplifieeThetaReference: (theta: number) => number;
  /** Intégrande COMPLET en θ (expression simplifiée × dx/dθ) — utilisé pour la primitive en θ. */
  integrandeThetaReference: (theta: number) => number;
  primitiveThetaReference: (theta: number) => number;
  primitiveReference: (x: number) => number;
  integrandeReference: (x: number) => number;
}

// ============================================================================
// Famille F — Identités trigonométriques.
// ============================================================================

export type SousTypeF = "tan" | "angleDoubleSin" | "angleDoubleCos" | "pythagoreanFactor" | "oddPowerSin" | "oddPowerCos";

export interface ExerciceFamilleF {
  famille: "F";
  sousType: SousTypeF;
  k: number;
  rewrittenReference: (x: number) => number;
  primitiveReference: (x: number) => number;
  integrandeReference: (x: number) => number;
}

// ============================================================================
// Famille G — Fractions rationnelles, décomposition en éléments simples.
// ============================================================================

/** Sous-type 1 — racines réelles distinctes : f(x) = [A(x-r2)+B(x-r1)] / ((x-r1)(x-r2)). */
export interface ExerciceFamilleG1 {
  famille: "G";
  sousType: "1";
  r1: number;
  r2: number;
  A: number;
  B: number;
  /** Décomposition posée, vars {A,B,x}. */
  decompositionReference: (vars: Record<string, number>) => number;
  primitiveReference: (x: number) => number;
  integrandeReference: (x: number) => number;
}

/** Sous-type 2 — fraction impropre : f(x) = [x²+(d-r)x+(e-rd)] / (x-r), quotient x+d, reste e/(x-r). */
export interface ExerciceFamilleG2 {
  famille: "G";
  sousType: "2";
  r: number;
  d: number;
  e: number;
  quotientReference: (x: number) => number;
  resteReference: (x: number) => number;
  decompositionReference: (vars: Record<string, number>) => number;
  primitiveReference: (x: number) => number;
  integrandeReference: (x: number) => number;
}

/** Sous-type 3 — dénominateur mixte x·(x²+1) : f(x)=[(A+B)x²+Cx+A]/(x(x²+1)). */
export interface ExerciceFamilleG3 {
  famille: "G";
  sousType: "3";
  A: number;
  B: number;
  C: number;
  decompositionReference: (vars: Record<string, number>) => number;
  primitiveReference: (x: number) => number;
  integrandeReference: (x: number) => number;
}

/** Sous-type 4 — quadratique irréductible seule : f(x) = γ/((x+h)²+m²), obtenu par complétion du
 * carré de x²+px+q (p=2h, q=h²+m²). */
export interface ExerciceFamilleG4 {
  famille: "G";
  sousType: "4";
  p: number;
  q: number;
  gamma: number;
  h: number;
  m: number;
  decompositionReference: (vars: Record<string, number>) => number;
  primitiveReference: (x: number) => number;
  integrandeReference: (x: number) => number;
}

export type ExerciceFamilleG = ExerciceFamilleG1 | ExerciceFamilleG2 | ExerciceFamilleG3 | ExerciceFamilleG4;

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceCalculPrimitives = ExerciceFamilleA | ExerciceFamilleB | ExerciceFamilleC | ExerciceFamilleD | ExerciceFamilleE | ExerciceFamilleF | ExerciceFamilleG;

export type FamilleCalculPrimitives = ExerciceCalculPrimitives["famille"];

export type GenerateurExerciceCalculPrimitives = () => ExerciceCalculPrimitives;
