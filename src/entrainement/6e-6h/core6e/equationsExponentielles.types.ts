/**
 * Couche core (6e) — contrat pour `6gen9` ("Résoudre une équation exponentielle", chapitre 2). 4
 * familles STRUCTURELLEMENT DISJOINTES — union discriminée par `famille`, jamais un seul type à
 * champs `| null` partagés (même principe que `equationsCyclometriques.types.ts`, 6gen3).
 *
 * **Familles A, C, D ont chacune plusieurs SOUS-TYPES/STYLES** (A : 3 sous-types A1/A2/A3, même
 * nombre d'écrans — 2 — mais un contenu/une vérification différents ; C : 3 styles de présentation
 * PUREMENT visuels de la même équation canonique `A·t²+B·t+C=0` ; D : 2 sous-types D1/D2,
 * structurellement différents mais concluant tous deux à ∅) — le sous-type/style est un second
 * discriminant à l'intérieur de la famille, jamais un second axe de tirage indépendant comme
 * gen55/gen58 (4e) : `famille` détermine déjà le NOMBRE d'écrans, `sousType`/`style` n'en change
 * jamais le nombre, seulement le contenu affiché/vérifié.
 *
 * **Variabilité assumée** (comme 6gen3) : plusieurs familles/sous-types produisent un nombre de
 * solutions variable d'un tirage à l'autre (0, 1 ou 2 selon les cas — A3, C) — c'est le signal
 * diagnostique recherché, pas un défaut de génération à corriger.
 */

/** Base d'une puissance — `estE=true` pour la base d'Euler (num/den alors sans objet), sinon un
 * rationnel `num/den` réduit (den=1 pour un entier). Famille A/B : `{2,3,5,7,5/2}`, jamais `e`.
 * Famille C : `{e,2,3,5}`. Famille D : `{2,3,4,5,7,e}` — voir chaque `familles/*.ts` pour la
 * justification du pool retenu quand le prompt ne le précise pas explicitement. */
export interface BaseExpo {
  estE: boolean;
  num: number;
  den: number;
}

/** Une valeur numérique EXACTE affichée à l'élève sous forme décodée (fraction réduite ou entier,
 * `den=1`) — jamais directement "base^p", pour forcer la reconnaissance (voir la doc de chaque
 * sous-type A). */
export interface ValeurExacteExpo {
  num: number;
  den: number;
}

export type SousTypeA = "A1" | "A2" | "A3";

/** A1 (direct) — `base^(mx+n) = [valeur numérique = base^p]`, toujours EXACTEMENT 1 solution. */
export interface ExerciceEqExpoA1 {
  famille: "A";
  sousType: "A1";
  base: BaseExpo;
  m: number;
  n: number;
  /** Exposant cible — écran 1 demande de le retrouver. */
  p: number;
  /** base^p, décodée (fraction/entier), affichée telle quelle à l'élève. */
  valeurNumerique: ValeurExacteExpo;
  /** Solution unique = (p-n)/m. */
  x: number;
}

/** A2 (avec racine) — `√(base^(mx+n) − [valeur numérique = base^c]) = 0`, toujours EXACTEMENT 1
 * solution. Écran 1 : reconnaître l'équation "radicande=0" (texte libre, équation), pas un simple
 * exposant comme A1/A3 — voir `formatEquationCibleA2Latex`. */
export interface ExerciceEqExpoA2 {
  famille: "A";
  sousType: "A2";
  base: BaseExpo;
  m: number;
  n: number;
  /** Exposant du terme soustrait sous la racine. */
  c: number;
  valeurNumerique: ValeurExacteExpo;
  x: number;
}

/** A3 (second degré en x) — `base^(ax²+bx+c) = [valeur numérique = base^d]`. **Variabilité
 * assumée** : 0, 1 ou 2 solutions selon le discriminant de `ax²+bx+(c-d)=0` — jamais un rôle fixe,
 * contrairement à A1/A2. `a/b/c/d` construits DEPUIS `solutions` ("cible d'abord"), jamais tirés
 * indépendamment — voir `familles/A.ts`. */
export interface ExerciceEqExpoA3 {
  famille: "A";
  sousType: "A3";
  base: BaseExpo;
  a: number;
  b: number;
  c: number;
  /** Exposant cible. */
  d: number;
  valeurNumerique: ValeurExacteExpo;
  /** 0, 1 (racine double) ou 2 éléments, triés croissant. */
  solutions: number[];
}

export type ExerciceEqExpoA = ExerciceEqExpoA1 | ExerciceEqExpoA2 | ExerciceEqExpoA3;

/** B — `√(base^(m1x+n1)) = base^(m2x+n2)`. ~50% des tirages forcent `m1=2·m2` avec `n1≠2·n2` →
 * contradiction algébrique (∅) ; les autres tirages produisent 1 solution unique. */
export interface ExerciceEqExpoB {
  famille: "B";
  base: BaseExpo;
  m1: number;
  n1: number;
  m2: number;
  n2: number;
  /** `true` ⟺ `m1=2·m2` (et alors nécessairement `n1≠2·n2`, garanti à la génération). */
  contradictoire: boolean;
  /** Solution = (2n2-n1)/(m1-2m2), `null` ssi `contradictoire`. */
  x: number | null;
}

export type StyleC = "direct" | "carreDeguise" | "regroupement";

/**
 * C — changement de variable `t=base^x`, équation canonique `A·t²+B·t+C=0` (`t1`/`t2` = ses 2
 * racines RÉELLES DISTINCTES, toujours exactement 2 par construction — jamais 0 ni 1). 3 styles de
 * présentation PUREMENT visuels de cette MÊME équation canonique — le style ne change jamais
 * `A`/`B`/`C`/les racines, seulement la façon dont l'équation est AFFICHÉE à l'élève (voir
 * `ui6e/formatEquationsExponentielles.ts::formatEquationCLatex`) :
 * - `"direct"` — `A·base^(2x) + B·base^x + C = 0`.
 * - `"carreDeguise"` — `A·(base²)^x + B·base^x + C = 0`, `base²` affiché comme un nombre DIFFÉRENT
 *   de `base` (ex. base=2 → "4^x").
 * - `"regroupement"` — `base^(2x+1) + (base²)^x = D` (jamais de terme `B·base^x` séparé affiché) —
 *   nécessite structurellement `B=0` (racines opposées `t2=-t1`) et `A=base+1`, `D=-C` — voir
 *   `familles/C.ts` pour la preuve complète. Restreint à `base∈{2,3,5}` (jamais `e`, qui rendrait
 *   `A=e+1` irrationnel et `D` illisible) — écart documenté par rapport au pool générique `{e,2,3,5}`.
 */
export interface ExerciceEqExpoC {
  famille: "C";
  style: StyleC;
  base: BaseExpo;
  A: number;
  B: number;
  C: number;
  t1: number;
  t2: number;
  /** [t1,t2] triés croissant — toujours 2 éléments. */
  solutionsT: number[];
  /** Racines STRICTEMENT POSITIVES de `solutionsT`, converties en x via `x=log_base(t)`, triées
   * croissant — 0, 1 ou 2 éléments selon les signes de t1/t2. */
  solutionsX: number[];
}

export type SousTypeD = "D1" | "D2";

/** D1 — `c·base^(mx+n) = 0`, `c≠0`. Toujours ∅ : `base^(quoi que ce soit)` est strictement positif,
 * un produit par `c≠0` ne peut jamais s'annuler. */
export interface ExerciceEqExpoD1 {
  famille: "D";
  sousType: "D1";
  base: BaseExpo;
  c: number;
  m: number;
  n: number;
}

/** D2 — `base1^(m1x+n1) + base2^(m2x+n2) + k = 0`, `k≥0`. Toujours ∅ : somme de 2 termes
 * strictement positifs plus une constante non-négative, jamais nulle. */
export interface ExerciceEqExpoD2 {
  famille: "D";
  sousType: "D2";
  base1: BaseExpo;
  base2: BaseExpo;
  m1: number;
  n1: number;
  m2: number;
  n2: number;
  k: number;
}

export type ExerciceEqExpoD = ExerciceEqExpoD1 | ExerciceEqExpoD2;

export type ExerciceEquationExponentielle = ExerciceEqExpoA | ExerciceEqExpoB | ExerciceEqExpoC | ExerciceEqExpoD;

export type FamilleEquationExponentielle = ExerciceEquationExponentielle["famille"];

export type GenerateurExerciceEquationExponentielle = () => ExerciceEquationExponentielle;
