/**
 * Couche core (6e) — contrat pour `6gen36` ("Équations dans ℂ", chapitre 7 "Nombres complexes",
 * TROISIÈME générateur de ce chapitre après `6gen34`/`6gen35`). 6 familles (A-F), tirage
 * ÉQUIPROBABLE de la famille (`generateurs6e/equationsComplexes/index.ts`). Famille A a 2
 * sous-types (`sansBarre`/`avecBarre`, tirage équiprobable À L'INTÉRIEUR de la famille A — voir
 * `generateurs6e/equationsComplexes/familleA.ts`).
 *
 * ============================================================================
 * **CE FICHIER EST SPÉCIFIQUE À 6gen36 — PAS un module chapitre-7 partagé** (même règle que
 * `core6e/affixesRacines.types.ts`/`core6e/nombresComplexes.types.ts`, jamais une extension de
 * l'un de ces 2 fichiers).
 * ============================================================================
 *
 * ============================================================================
 * **Construction "à l'envers" depuis des racines/valeurs cibles (familles C-F)** — voir l'en-tête
 * de chaque `familleX.ts` pour la preuve détaillée par famille. Principe commun : on choisit
 * D'ABORD des entiers (racines, ou x/y pour une racine carrée complexe), puis on EN DÉDUIT les
 * coefficients de l'équation — jamais l'inverse (jamais un a,b,c tiré au hasard en espérant que
 * Δ/√Δ tombe juste). Garantit ALGÉBRIQUEMENT que toute valeur à saisir par l'élève reste un entier
 * ou un Gaussien entier EXACT, jamais un radical réel — cohérent avec `moteur6e/expressionComplexe.ts`
 * (aucun support de fonction `sqrt`) et la spec ("égalité EXACTE").
 */

export interface ValeurComplexe {
  re: number;
  im: number;
}

// ============================================================================
// Famille A — Linéaire en z, avec ou sans z̄.
// ============================================================================

export interface ExerciceFamilleASansBarre {
  famille: "A";
  sousType: "sansBarre";
  /** az+b=cz+d, coefficients complexes (Gaussiens entiers), a≠c. */
  a: ValeurComplexe;
  b: ValeurComplexe;
  c: ValeurComplexe;
  d: ValeurComplexe;
  /** z=(d-b)/(a-c) — solution unique. */
  z: ValeurComplexe;
}

/** 4 systèmes candidats à l'écran 1 — voir `generateurs6e/equationsComplexes/familleA.ts` et
 * `ui6e/formatEquationsComplexes.ts`. "correct" = {(a+b)x=c, (a-b)y=d}. Distracteurs : `signeInverseY`
 * (utilise (a+b) pour les 2 équations, oublie que z̄ change le signe de b devant y), `permuteXY`
 * (x et y échangés entre les 2 équations), `sansCombinaison` (ax=c, by=d — a et b non combinés). */
export type IdSystemeA = "correct" | "signeInverseY" | "permuteXY" | "sansCombinaison";

export interface ExerciceFamilleAAvecBarre {
  famille: "A";
  sousType: "avecBarre";
  /** az+bz̄=c+di, a,b,c,d réels entiers, a+b≠0, a-b≠0. */
  a: number;
  b: number;
  c: number;
  d: number;
  /** x=c/(a+b), y=d/(a-b) — TOUJOURS construits pour être entiers exacts (voir familleA.ts). */
  x: number;
  y: number;
}

export type ExerciceFamilleA = ExerciceFamilleASansBarre | ExerciceFamilleAAvecBarre;

// ============================================================================
// Famille B — Équation rationnelle en z : (az+b)/(cz+d)=k, a,b,c,d réels, k complexe, c≠0.
// ============================================================================

/** 4 équations développées candidates à l'écran 1 (après multiplication en croix
 * az+b=k(cz+d)=(kc)z+kd) — voir `familleB.ts`/`formatEquationsComplexes.ts`. "correct" =
 * {az+b=(kc)z+kd}. Distracteurs : `coteInverse` (multiplie (az+b) par k au lieu de (cz+d) —
 * (ka)z+kb=cz+d), `oublieC` (oublie le facteur c dans kc — az+b=kz+kd), `oublieD` (oublie de
 * multiplier d par k — az+b=(kc)z+d). */
export type IdEquationDeveloppeeB = "correct" | "coteInverse" | "oublieC" | "oublieD";

export interface ExerciceFamilleB {
  famille: "B";
  a: number;
  b: number;
  c: number;
  d: number;
  k: ValeurComplexe;
  /** kc = k·c, kd = k·d — coefficients de l'équation développée az+b=(kc)z+kd. */
  kc: ValeurComplexe;
  kd: ValeurComplexe;
  /** z=(kd-b)/(a-kc) — solution unique (a≠kc garanti à la construction). */
  z: ValeurComplexe;
}

// ============================================================================
// Famille C — Quadratique, discriminant réel négatif : az²+bz+c=0, a,b,c réels, Δ<0.
// ============================================================================

export interface ExerciceFamilleC {
  famille: "C";
  a: number;
  b: number;
  c: number;
  /** Δ=b²-4ac — toujours <0 (construit depuis des racines cibles p±qi, voir familleC.ts). */
  delta: number;
  /** Racines (-b±i√|Δ|)/(2a) = p±qi — toujours des Gaussiens entiers exacts. */
  racines: [ValeurComplexe, ValeurComplexe];
}

// ============================================================================
// Famille D — Quadratique, discriminant complexe non réel : az²+bz+c=0, a réel, b,c complexes.
// ============================================================================

export interface ExerciceFamilleD {
  famille: "D";
  a: number;
  b: ValeurComplexe;
  c: ValeurComplexe;
  /** Δ=b²-4ac — TOUJOURS complexe non réel (construit depuis 2 racines cibles z1,z2 dont la
   * différence a une partie réelle ET imaginaire toutes 2 non nulles, voir familleD.ts). */
  delta: ValeurComplexe;
  /** Les 2 racines carrées de Δ, = ±a(z1-z2) — TOUJOURS des Gaussiens entiers exacts. */
  racinesDelta: [ValeurComplexe, ValeurComplexe];
  /** Racines de l'équation, z=(-b±√Δ)/(2a). */
  racines: [ValeurComplexe, ValeurComplexe];
}

// ============================================================================
// Famille E — Quartique biquadratique u=z² : az⁴+bz²+c=0, coefficients pouvant être complexes.
// ============================================================================

/** 4 équations en u candidates à l'écran 1 — voir `familleE.ts`/`formatEquationsComplexes.ts`.
 * "correct" = {aU²+bU+c=0}. Distracteurs : `exposantInverse` (aU+bU²+c=0, U et U² échangés),
 * `coefInverses` (cU²+bU+a=0, a et c échangés), `oublieB` (aU²+c=0, terme en b oublié). */
export type IdEquationEnU = "correct" | "exposantInverse" | "coefInverses" | "oublieB";

export interface ExerciceFamilleE {
  famille: "E";
  a: ValeurComplexe;
  b: ValeurComplexe;
  c: ValeurComplexe;
  /** u1,u2 — racines de au²+bu+c=0, chacune construite depuis un couple (x,y) d'entiers via
   * u=(x+yi)² (voir familleE.ts) — TOUJOURS un Gaussien entier exact, jamais un radical réel
   * nécessaire pour en extraire la racine carrée. */
  u1: ValeurComplexe;
  u2: ValeurComplexe;
  /** Racine carrée "génératrice" de chaque u (x1+y1i tel que u1=(x1+y1i)², idem u2) — les 2 racines
   * en z pour u_k sont ±(x_k+y_k i). */
  racineU1: ValeurComplexe;
  racineU2: ValeurComplexe;
  /** Les 4 racines de l'équation en z — piège central : 2 PAR valeur de u, jamais 1. */
  racines: [ValeurComplexe, ValeurComplexe, ValeurComplexe, ValeurComplexe];
}

// ============================================================================
// Famille F — Quartique générale à coefficients réels, 2 racines rationnelles + facteur
// quadratique à discriminant négatif.
// ============================================================================

export interface ExerciceFamilleF {
  famille: "F";
  /** az⁴+bz³+cz²+dz+e=0, coefficients réels entiers — construit à l'envers depuis r1,r2 (racines
   * rationnelles cibles) et p±qi (racines du facteur quadratique cible), voir familleF.ts. */
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  r1: number;
  r2: number;
  p: number;
  q: number;
  /** Quotient cubique après division par (z-r1) — 4 coefficients [z³,z²,z¹,z⁰]. */
  quotientCubique: [number, number, number, number];
  /** Quotient quadratique après division du quotient cubique par (z-r2) — 3 coefficients
   * [z²,z¹,z⁰]. Vaut toujours a·(z²-2pz+(p²+q²)). */
  quotientQuadratique: [number, number, number];
  /** Les 4 racines complètes : r1, r2, p+qi, p-qi. */
  racines: [ValeurComplexe, ValeurComplexe, ValeurComplexe, ValeurComplexe];
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceEquationsComplexes = ExerciceFamilleA | ExerciceFamilleB | ExerciceFamilleC | ExerciceFamilleD | ExerciceFamilleE | ExerciceFamilleF;

export type FamilleEquationsComplexes = ExerciceEquationsComplexes["famille"];

export type GenerateurExerciceEquationsComplexes = () => ExerciceEquationsComplexes;
