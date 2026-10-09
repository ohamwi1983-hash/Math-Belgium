import type { EnsembleReelGuide } from "./ensembleReel.types";

/**
 * Couche core (6e) — contrat pour `6gen15` ("Résoudre une inéquation logarithmique", chapitre 3
 * "Fonctions logarithmes"). 6 familles STRUCTURELLEMENT DISJOINTES — union discriminée par
 * `famille` (+ `sousType` pour B/C) — même principe que `inequationsExponentielles.types.ts`
 * (6gen10, chapitre 2), jamais un seul type à champs `| null` partagés.
 *
 * **Statuts ∅ (famille E, et un des deux cas de la famille F)** : même décision de conception que
 * `inequationsExponentielles.types.ts` (voir son en-tête pour la justification complète) —
 * `EnsembleReelGuide` n'est PAS étendu d'une 4e forme "vide" ici non plus. Famille E est une pure
 * reconnaissance catégorielle (booléen `estImpossible`), et la famille F représente chaque cas via
 * `ReponseCasBaseLog { estVide: boolean; ensemble: EnsembleReelGuide | null }` — jamais un 3e
 * statut ajouté au type partagé.
 *
 * **Convention "base"** : la base d'un logarithme dans ce générateur est toujours un rationnel
 * explicite (jamais `e` — la spec source ne demande jamais `ln`/base `e` comme base d'un
 * logarithme ici, contrairement à `BaseIneq` de 6gen10 qui devait représenter `e^x`). D'où
 * `BaseLog` plus simple que `BaseIneq` (pas de champ `estE`).
 *
 * **Écart documenté vis-à-vis de la spec source pour la famille D** : le texte de spec donne
 * "base∈{2,3,5}" pour la génération, mais l'aide de l'écran 4 mentionne explicitement le piège
 * "attention à l'inversion des bornes si base<1" — incohérent avec un pool de bases toutes >1.
 * Décision : le pool de la famille D est ÉTENDU pour inclure aussi des bases <1 (voir
 * `generateurs6e/inequationsLogarithmiques/familles/D.ts`), pour que ce piège soit réellement
 * rencontré par l'élève (et testable), conformément à l'intention pédagogique explicite de l'aide
 * elle-même plutôt qu'à la liste de pool sous-spécifiée.
 *
 * **Écart documenté pour la famille F** : le comparateur est restreint à `{"<",">"}` (jamais
 * `"<="`/`">="`) — seul ce sous-ensemble produit exactement la conclusion propre "∅ d'un côté,
 * domaine privé d'un point de l'autre" décrite par la spec (un comparateur large donnerait un
 * résultat différent — ℝ entier d'un côté, un singleton de l'autre — hors du cadre décrit).
 */

// ============================================================================
// Types communs.
// ============================================================================

/** Base d'un logarithme — rationnel réduit (`den=1` pour un entier). */
export interface BaseLog {
  num: number;
  den: number;
}

export type Comparateur = ">" | "<" | ">=" | "<=";

/** Un facteur affine `mx+n`, `m≠0` garanti par construction. */
export interface AffineLog {
  m: number;
  n: number;
}

// ============================================================================
// Famille A — log_base(u) R constante — 2 écrans.
// ============================================================================

/**
 * `log_base(mx+n) [comparateur] k`. Écran 1 : poser la CE (`mx+n>0`). Écran 2 : résoudre en
 * appliquant le bon sens (direct si `base>1`, inversé si `base<1`), intersecter avec la CE
 * correcte de l'écran 1. `argumentBrutEcran2` : solution de la comparaison sur l'argument SEULE
 * (sens déjà corrigé), AVANT intersection avec la CE — utile pour l'aide niveau 2 uniquement,
 * jamais pour la vérification (`solutionEcran2` reste la seule source de vérité pour la
 * correction).
 */
export interface ExerciceLogA {
  famille: "A";
  base: BaseLog;
  baseSuperieureA1: boolean;
  m: number;
  n: number;
  k: number;
  comparateur: Comparateur;
  ceEcran1: EnsembleReelGuide;
  argumentBrutEcran2: EnsembleReelGuide;
  solutionEcran2: EnsembleReelGuide;
}

// ============================================================================
// Famille B — log_base(f) R log_base(g), comparaison directe des arguments — 2 écrans, 2
// sous-types.
// ============================================================================

export type SousTypeB = "direct" | "racine";

/** Sous-type "direct" : `f(x)=mx+n`, `g(x)=m'x+n'`, tous deux affines. */
export interface ExerciceLogBDirect {
  famille: "B";
  sousType: "direct";
  base: BaseLog;
  baseSuperieureA1: boolean;
  f: AffineLog;
  g: AffineLog;
  comparateur: Comparateur;
  ceEcran1: EnsembleReelGuide;
  comparaisonBruteEcran2: EnsembleReelGuide;
  solutionEcran2: EnsembleReelGuide;
}

/**
 * Sous-type "avec racine" : `f(x)=\sqrt{ax+b}`, `g(x)=m'x+n'` (affine). Construit "depuis les
 * racines cibles" : `z1,z2` (racines de `ax+b-(m'x+n')^2`, distinctes) choisies EN PREMIER,
 * `a,b` DÉRIVÉS (voir `familles/B.ts` pour le détail algébrique) — garantit une comparaison
 * finale à racines entières, jamais irrationnelles (convention "fraction irréductible, jamais de
 * décimal", CLAUDE.md).
 */
export interface ExerciceLogBRacine {
  famille: "B";
  sousType: "racine";
  base: BaseLog;
  baseSuperieureA1: boolean;
  a: number;
  b: number;
  g: AffineLog;
  z1: number;
  z2: number;
  comparateur: Comparateur;
  ceEcran1: EnsembleReelGuide;
  comparaisonBruteEcran2: EnsembleReelGuide;
  solutionEcran2: EnsembleReelGuide;
}

export type ExerciceLogB = ExerciceLogBDirect | ExerciceLogBRacine;

// ============================================================================
// Famille C — combiner en un seul log, comparer — 3 écrans, 2 sous-types.
// ============================================================================

export type SousTypeC = "produit" | "quotient";

/**
 * Sous-type "produit" : `log_base(f)+log_base(g) [comparateur] log_base(k)`, combiné en
 * `log_base(f·g) [comparateur] log_base(k)`. `f(x)=x+n1` (`m` fixé à 1, "f,g affines simples"),
 * `g(x)=m2x+n2`. Construit depuis des racines cibles `z1,z2` de `f(x)g(x)-k` — voir
 * `familles/C.ts`.
 *
 * Sous-type "quotient" : `log_base(f)-log_base(g) [comparateur] log_base(k)`, combiné en
 * `log_base(f/g) [comparateur] log_base(k)`. `f,g` affines quelconques (`m1,m2≠0`) — résolu par
 * un argument de positivité (CE garantit `g>0`, la comparaison `f/g R k` se ramène alors à une
 * inéquation AFFINE `f-k·g R 0`, jamais quadratique — voir `familles/C.ts`).
 */
export interface ExerciceLogC {
  famille: "C";
  sousType: SousTypeC;
  base: BaseLog;
  baseSuperieureA1: boolean;
  f: AffineLog;
  g: AffineLog;
  k: number;
  comparateur: Comparateur;
  ceEcran1: EnsembleReelGuide;
  solutionEcran3: EnsembleReelGuide;
}

// ============================================================================
// Famille D — quadratique en y=log_base(x) — 4 écrans.
// ============================================================================

/**
 * `A(log_base x)^2+B·log_base x+C [comparateur] 0`, construite depuis des racines cibles `y1,y2`
 * de `Ay^2+By+C` (`A(y-y1)(y-y2)`, `A≠0`). Écran 1 : CE (`x>0`, constante). Écran 2 : poser
 * `y=log_base x`, réécrire en inéquation du second degré en y (texte, vérifié par équivalence
 * algébrique — voir `verificationInequationsLogarithmiques.ts`). Écran 3 : résoudre en y
 * (`solutionEcran3`, calculée directement depuis `y1,y2,A,comparateur`). Écran 4 : convertir en x
 * via `x=base^y` (sens préservé si `base>1`, inversé si `base<1` — piège central) intersecté avec
 * la CE (`solutionEcran4`).
 */
export interface ExerciceLogD {
  famille: "D";
  base: BaseLog;
  baseSuperieureA1: boolean;
  y1: number;
  y2: number;
  A: number;
  B: number;
  C: number;
  comparateur: Comparateur;
  ceEcran1: EnsembleReelGuide;
  solutionEcran3: EnsembleReelGuide;
  solutionEcran4: EnsembleReelGuide;
}

// ============================================================================
// Famille E — domaine vide par construction — 1 écran.
// ============================================================================

/**
 * `log_base(f) [comparateur] log_base(g)`, `f(x)=x-p`, `g(x)=r-x`, `r<p` — CE (`f>0 ET g>0`)
 * TOUJOURS impossible (`x>p` et `x<r` avec `r<p` : aucune valeur commune). Écran unique : conclure
 * ∅ SANS résoudre l'inégalité principale.
 */
export interface ExerciceLogE {
  famille: "E";
  base: BaseLog;
  p: number;
  r: number;
  comparateur: Comparateur;
}

// ============================================================================
// Famille F — base paramétrique a, split a>1/0<a<1 — 3 écrans.
// ============================================================================

/**
 * `log_a(g(x)) [comparateur] log_a(f(x))`, `g(x)=x-p`, `f(x)=g(x)+(x-r)^2`, `r>p` (garanti par
 * construction — `r` toujours strictement à l'intérieur du domaine `x>p`, pour que "domaine privé
 * de `x=r`" soit toujours une VRAIE union de 2 morceaux, jamais un cas dégénéré). `a∈ℝ₀⁺\{1}` non
 * précisé — traité au cas par cas (a>1 / 0<a<1) à l'écran 3.
 *
 * **`comparateur` restreint à `{"<",">"}`** (jamais `"<="`/`">="`) — seul ce sous-ensemble donne
 * la conclusion propre "un cas ∅, l'autre = domaine privé de `x=r`" décrite par la spec (voir
 * l'en-tête de ce fichier et `familles/F.ts` pour la preuve). `casVideEstSuperieurA1` : `true` si
 * le cas `a>1` est celui qui donne ∅ (`comparateur===">"`), `false` si c'est le cas `0<a<1`
 * (`comparateur==="<"`).
 */
export interface ExerciceLogF {
  famille: "F";
  p: number;
  r: number;
  comparateur: "<" | ">";
  ceEcran1: EnsembleReelGuide;
  casVideEstSuperieurA1: boolean;
  ensembleSansR: EnsembleReelGuide;
}

/** Réponse à un cas de la famille F (a>1 OU 0<a<1) — jamais un `EnsembleReelGuide` étendu, voir
 * en-tête de ce fichier. */
export interface ReponseCasBaseLog {
  estVide: boolean;
  ensemble: EnsembleReelGuide | null;
}

export type ExerciceInequationLogarithmique = ExerciceLogA | ExerciceLogB | ExerciceLogC | ExerciceLogD | ExerciceLogE | ExerciceLogF;

export type FamilleInequationLogarithmique = ExerciceInequationLogarithmique["famille"];

export type GenerateurExerciceInequationLogarithmique = () => ExerciceInequationLogarithmique;
