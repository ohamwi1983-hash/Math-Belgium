/**
 * Couche core (6e) — contrat pour `6gen14` ("Résoudre une équation exponentielle ou
 * logarithmique", chapitre 3 "Fonctions logarithmes"). 7 familles STRUCTURELLEMENT DISJOINTES
 * (union discriminée par `famille`, jamais un seul type à champs `| null` partagés) — même
 * principe que `exponentiellesProblemes.types.ts` (6gen12) —, chacune tirée de façon ÉQUIPROBABLE
 * (voir `generateurs6e/equationsExpLog/index.ts`).
 *
 * **Convention log avec base numérique** — ce chantier n'a PAS de fonction `log(x,base)` native
 * dans l'évaluateur partagé (`moteur6e/expressionExponentielle.ts`, seulement `ln`/`exp`, voir son
 * en-tête) : toute réponse ATTENDUE de l'élève qui implique un logarithme de base non-`e` s'exprime
 * donc TOUJOURS, côté saisie libre, comme un changement de base explicite `ln(argument)/ln(base)`
 * (convention déjà établie par `expressionExponentielle.test.ts`), jamais une notation
 * `log_base(...)` littérale qu'aucun évaluateur ne saurait lire. Ceci ne concerne QUE ce que
 * l'élève doit TAPER : l'énoncé affiché (KaTeX pur, jamais évalué) utilise librement `\log_{base}`
 * pour la lisibilité — voir `ui6e/formatEquationsExpLog.ts`.
 *
 * **`IssueSimplificationG`** (famille G) reste LOCALE à ce fichier plutôt que d'étendre
 * `EnsembleReelGuide`/`FormeEnsembleReel` (`core6e/ensembleReel.types.ts`) d'une 4e valeur — même
 * décision de conception, pour les mêmes raisons, que `core6e/inequationsExponentielles.types.ts`
 * (6gen10, voir son en-tête en toutes lettres) : aucun écran de ce générateur n'a jamais besoin de
 * choisir entre ∅/ℝ/un intervalle particulier au sein d'un même constructeur — chaque écran
 * "CE"/"intervalle" (D, E, F) produit toujours un intervalle propre, et l'écran de verdict de G est
 * une pure reconnaissance catégorielle à 3 issues, jamais un `EnsembleReelGuide`.
 */

// ============================================================================
// Famille A — base^(mx+n) = C, logarithme direct ou superflu (2 écrans).
// ============================================================================

export interface ExerciceEqLogA {
  famille: "A";
  base: number;
  m: number;
  n: number;
  /** Vrai si `C` a été choisi comme une puissance ENTIÈRE reconnaissable de `base` (log superflu,
   * réponse directe) — sinon `C` est une valeur générique qui exige un vrai logarithme. */
  estPuissancePropre: boolean;
  /** Exposant entier si `estPuissancePropre`, sinon `null`. */
  p: number | null;
  /** Second membre de l'équation (toujours > 0). */
  C: number;
  /** Exposant cible = log_base(C), valeur EXACTE (= `p` si `estPuissancePropre`, sinon
   * généralement irrationnelle) — réponse attendue de l'écran 1. */
  exposantCible: number;
  /** Solution x = (exposantCible-n)/m — réponse attendue de l'écran 2. */
  x: number;
}

// ============================================================================
// Famille B — bases différentes, ln des deux membres (2 écrans).
// ============================================================================

export interface ExerciceEqLogB {
  famille: "B";
  base1: number;
  base2: number;
  m1: number;
  n1: number;
  m2: number;
  n2: number;
  /** Solution x, valeur EXACTE (généralement irrationnelle) — réponse de l'écran 2. */
  x: number;
}

// ============================================================================
// Famille C — t-substitution, second degré, log final parfois nécessaire (3 écrans).
// ============================================================================

export interface ExerciceEqLogC {
  famille: "C";
  base: number;
  A: number;
  B: number;
  /** Coefficient constant du second degré en t (nommé `Cc` pour éviter toute confusion avec la
   * famille "C" elle-même). */
  Cc: number;
  /** Racines RÉELLES de `A·t²+B·t+Cc=0` filtrées `t>0` (0, 1 ou 2 éléments — variabilité assumée),
   * triées croissant — réponse attendue de l'écran 2. */
  tValides: number[];
  /** x = log_base(t) pour chaque t de `tValides`, même ordre — valeur EXACTE (= un entier simple
   * si `t` est une puissance propre de `base`, sinon généralement irrationnelle) — réponse
   * attendue de l'écran 3. */
  xValides: number[];
}

// ============================================================================
// Famille D — log_x(N)=k / log_a(x)=k, deux sous-types selon la position de l'inconnue (2 écrans).
// ============================================================================

export type SousTypeD = "D1" | "D2";

/** D1 — `x` est la BASE du logarithme : `log_x(N)=k` ⟹ `x=N^(1/k)`. CE : `x∈ℝ₀⁺\{1}`. */
export interface ExerciceEqLogD1 {
  famille: "D";
  sousType: "D1";
  N: number;
  k: number;
  /** N^(1/k), valeur EXACTE (généralement irrationnelle) — réponse de l'écran 2. */
  x: number;
}

/** D2 — `x` est l'ARGUMENT du logarithme, base `a` connue : `log_a(x)=k` ⟹ `x=a^k` directement.
 * CE : `x>0` (`a` déjà connu, ≠1 par hypothèse générale). */
export interface ExerciceEqLogD2 {
  famille: "D";
  sousType: "D2";
  a: number;
  k: number;
  /** a^k — réponse de l'écran 2. */
  x: number;
}

export type ExerciceEqLogD = ExerciceEqLogD1 | ExerciceEqLogD2;

// ============================================================================
// Famille E — combiner des logs, rejet CE (3 écrans, variabilité assumée).
// ============================================================================

/**
 * `log_base(x-p) + log_base(x-q) = log_base(e·x+d)`, même base partout — "génération par
 * construction" (voir `familles/E.ts`) : `p`,`q` (CE des 2 premiers arguments) choisis en premier,
 * puis 2 racines ALGÉBRIQUES cibles `r1≠r2` choisies LIBREMENT, puis `e`,`d` DÉRIVÉS (`e` de la
 * somme, `d` du produit) pour que le second degré obtenu en combinant les 2 logs de gauche
 * (`(x-p)(x-q)=e·x+d`) ait EXACTEMENT ces 2 racines — jamais l'inverse. Le signe de `e` (positif ou
 * négatif — les deux sont tirés, contrairement à une première version qui forçait `e>0` : cela
 * s'est révélé PROUVER STRUCTURELLEMENT qu'exactement 1 racine survit toujours, jamais 0 ni 2, en
 * contradiction avec la variabilité voulue par le prompt — voir `familles/E.ts`) change la FORME de
 * la CE : `e>0` ⟹ demi-droite `x>ceInf` ; `e<0` ⟹ intervalle borné `]ceInf;ceSup[` — mais dans les
 * deux cas les bornes restent des valeurs EXACTES simples (`max(p,q)` ou `-d/e`, une fraction à
 * dénominateur ≤3 vu le pool de `e`), jamais un flottant illisible.
 */
export interface ExerciceEqLogE {
  famille: "E";
  base: number;
  p: number;
  q: number;
  e: number;
  d: number;
  /** Racines ALGÉBRIQUES de `x²-(p+q+e)x+(pq-d)=0` (toujours 2, réelles, distinctes par
   * construction — ce sont littéralement `r1`,`r2`, voir `familles/E.ts`), triées croissant — AVANT
   * filtrage CE. */
  racinesAlgebriques: number[];
  /** Borne inférieure OUVERTE de la CE. */
  ceInf: number;
  /** Borne supérieure OUVERTE de la CE, ou `null` pour `+∞` (`e>0`, demi-droite). */
  ceSup: number | null;
  /** Sous-ensemble de `racinesAlgebriques` compris dans `]ceInf;ceSup[` (ou `]ceInf;+∞[`), trié
   * croissant — 0, 1 ou 2 éléments (variabilité assumée) — réponse attendue de l'écran 3. */
  solutionsFinales: number[];
}

// ============================================================================
// Famille F — changement de base (3 écrans).
// ============================================================================

/**
 * `log_x(a) + log_a(x) = k`, `a` connu. Changement de base : `log_x(a)=1/log_a(x)`, donc en posant
 * `y=log_a(x)` : `y+1/y=k` ⟺ `y²-ky+1=0`. `|k|>2` GARANTIT un discriminant `k²-4>0` (2 racines y
 * réelles distinctes, jamais nulles — leur produit vaut 1) — voir `familles/F.ts`.
 */
export interface ExerciceEqLogF {
  famille: "F";
  a: number;
  k: number;
  /** Racines y = [k±√(k²-4)]/2, triées croissant. */
  yValides: number[];
  /** x = a^y pour chaque y, même ordre — valeurs EXACTES (généralement irrationnelles,
   * `TOLÉRANCE NUMÉRIQUE` explicitement acceptée pour cette famille, voir prompt) — réponse
   * attendue de l'écran 3. */
  xValides: number[];
}

// ============================================================================
// Famille G — toujours vrai / toujours faux après simplification (2 écrans, 3 mécanismes).
// ============================================================================

/** Issue LOCALE à 6gen14 (jamais remontée dans `core6e/ensembleReel.types.ts`, voir en-tête du
 * fichier) : les 3 verdicts possibles une fois l'équation combinée/simplifiée. */
export type IssueSimplificationG = "vide_ce" | "vide_discriminant" | "vrai_partout";

/** Type 1 — `log_base(m1x+n1) = log_base(m2x+n2)` : solution algébrique UNIQUE, construite (voir
 * `familles/G.ts`) pour que la valeur commune des deux arguments à cette solution soit `≤0` —
 * violant donc STRUCTURELLEMENT la CE (`m1x+n1>0` et `m2x+n2>0`) ⟹ ∅. */
export interface ExerciceEqLogG_ViolationCE {
  famille: "G";
  type: "violationCE";
  base: number;
  m1: number;
  n1: number;
  m2: number;
  n2: number;
}

/** Type 2 — `log_base(m1x+n1) + log_base(m2x+n2) = log_base((m1x+n1)(m2x+n2))` : IDENTITÉ vraie
 * pour tout x de la CE (le membre de droite est, par construction, exactement le produit des deux
 * arguments de gauche — la règle du produit ne fait que la reconstituer). */
export interface ExerciceEqLogG_Identite {
  famille: "G";
  type: "identite";
  base: number;
  m1: number;
  n1: number;
  m2: number;
  n2: number;
}

/** Type 3 — `log_base(x²+b0) = log_base(c0)`, `0<c0<b0` ⟹ `x²=(c0-b0)<0` : ∅ par discriminant
 * négatif, SANS LIEN avec la CE cette fois (`x²+b0>0` pour tout x réel puisque `b0>0` — la CE de
 * cette famille est donc toujours ℝ, jamais la cause du ∅). */
export interface ExerciceEqLogG_DiscriminantNegatif {
  famille: "G";
  type: "discriminantNegatif";
  base: number;
  b0: number;
  c0: number;
}

export type ExerciceEqLogG = ExerciceEqLogG_ViolationCE | ExerciceEqLogG_Identite | ExerciceEqLogG_DiscriminantNegatif;

export type ExerciceEquationsExpLog = ExerciceEqLogA | ExerciceEqLogB | ExerciceEqLogC | ExerciceEqLogD | ExerciceEqLogE | ExerciceEqLogF | ExerciceEqLogG;

export type FamilleEquationsExpLog = ExerciceEquationsExpLog["famille"];

export type GenerateurExerciceEquationsExpLog = () => ExerciceEquationsExpLog;
