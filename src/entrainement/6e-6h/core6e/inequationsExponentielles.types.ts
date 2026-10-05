import type { EnsembleReelGuide } from "./ensembleReel.types";

/**
 * Couche core (6e) — contrat pour `6gen10` ("Résoudre une inéquation exponentielle", chapitre 2).
 * 5 familles STRUCTURELLEMENT DISJOINTES — union discriminée par `famille` (+ `sousType` pour C/D),
 * même principe que `equationsCyclometriques.types.ts` (6gen3) / `equationsExponentielles.types.ts`
 * (6gen9) : jamais un seul type à champs `| null` partagés.
 *
 * **Représentation des statuts ∅/ℝ — décision de conception explicite, documentée ici plutôt que
 * devinée silencieusement** (la spec source suggère de "réutiliser et étendre le mécanisme déjà en
 * place... avec ℝ comme nouvelle valeur de statut plutôt qu'un système séparé") :
 *
 * `EnsembleReelGuide` (`core6e/ensembleReel.types.ts`, déjà partagé par 6gen1/6gen3/6gen7) n'est
 * **PAS étendu** d'une 4e forme "vide" ici. Deux raisons :
 * 1. Dans CE générateur, ∅ et ℝ ne sont jamais des valeurs qu'un écran "constructeur d'intervalle"
 *    doit pouvoir représenter PARMI D'AUTRES — ce sont des conclusions FIXES et GARANTIES par
 *    construction pour des familles entières (famille B toujours ∅, famille C toujours ℝ — "paire
 *    contrastive délibérée", voir la spec). Aucun écran de ce générateur n'a jamais besoin de
 *    choisir entre ∅/ℝ/un intervalle particulier : chaque écran d'intervalle (familles A, D, E)
 *    produit TOUJOURS un intervalle propre (jamais ∅ ni ℝ, `m≠0`/racines réelles distinctes
 *    garantissent une demi-droite ou une union de 1-2 morceaux non dégénérée), et chaque écran
 *    ∅/ℝ (familles B, C) est une pure RECONNAISSANCE catégorielle, jamais un intervalle à
 *    construire.
 * 2. Étendre `FormeEnsembleReel` avec une 4e valeur forcerait à re-vérifier CHAQUE consommateur
 *    exhaustif existant (`verifierEnsembleReelGuide`, `formatEnsembleReelLatex`,
 *    `EnsembleReelGuideBuilder`) pour un bénéfice nul ici (aucun de leurs 3 générateurs actuels —
 *    6gen1/6gen3/6gen7 — ne produit ni ne consomme jamais un ensemble vide) : un risque non
 *    additif pour du code déjà livré et testé, alors qu'une solution ALONGSIDE (des écrans de
 *    reconnaissance catégorielle dédiés, JAMAIS un `EnsembleReelGuide`) couvre exactement le
 *    besoin réel sans toucher au type partagé.
 *
 * Le "mécanisme déjà en place" que la spec demande de réutiliser/étendre est en réalité le patron
 * BOOLÉEN "existe/n'existe pas" déjà établi par 5gen4/6gen3/6gen9 (`ReponseValeurOuVide`,
 * `verifierDEcran(_, existeUneSolution: boolean)` de 6gen9 notamment) — chaque écran ∅/ℝ de ce
 * générateur EST une extension directe de ce même patron catégoriel (un simple choix à 2 boutons,
 * jamais un 3e statut générique ajouté à `EnsembleReelGuide`) : famille B pose "cette inéquation
 * a-t-elle une solution ?" (attendu : non, ∅) exactement comme la famille D de 6gen9 ; famille C
 * pose "est-ce vrai pour tout x réel ?" (attendu : oui, ℝ) — la même mécanique catégorielle,
 * appliquée à une question différente. C'est en ce sens que ℝ devient "une nouvelle valeur de
 * statut" de CE mécanisme réutilisé, sans qu'aucun système séparé ne soit inventé — mais ce statut
 * reste local à `6gen10` (jamais remonté dans `core6e/ensembleReel.types.ts`).
 */

/** Base d'une puissance — `estE=true` pour la base d'Euler, sinon un rationnel `num/den` réduit
 * (`den=1` pour un entier). Réplique `BaseExpo` (6gen9) — dupliqué plutôt qu'importé, même
 * principe que `aleatoire.ts`/`rationnel.ts` (voir en-tête de `generateurs6e/inequationsExponentielles/rationnel.ts`). */
export interface BaseIneq {
  estE: boolean;
  num: number;
  den: number;
}

/** Valeur numérique EXACTE décodée (fraction réduite ou entier, `den=1`) — jamais affichée comme
 * "base^p" littéralement, voir `ExerciceIneqA`. */
export interface ValeurExacteIneq {
  num: number;
  den: number;
}

/** Symbole d'inégalité — tiré librement pour les familles A/D/E, restreint par construction pour
 * B (`{"<=","<"}` uniquement, voir `ExerciceIneqB`) et C (voir `ExerciceIneqCf`/`ExerciceIneqCk`). */
export type Comparateur = ">" | "<" | ">=" | "<=";

// ============================================================================
// Famille A — même base, sens préservé/inversé selon base>1 ou base<1 — 2 écrans.
// ============================================================================

/**
 * `base^(mx+n) [comparateur] valeurNumerique` (`valeurNumerique = base^p`, toujours affichée
 * DÉCODÉE — jamais "base^p" littéralement, voir en-tête de `ExerciceEqExpoA1`, 6gen9, même
 * principe). Écran 1 : reconnaître `p`. Écran 2 : résoudre `mx+n [comparateur'] p`, où
 * `comparateur' = comparateur` si `baseSuperieureA1`, sinon `inverserComparateur(comparateur)` —
 * PIÈGE CENTRAL de la famille (spec explicite). `solutionEcran2` — TOUJOURS un seul morceau (demi-
 * droite), jamais ∅ ni ℝ (`m≠0` garanti par construction).
 */
export interface ExerciceIneqA {
  famille: "A";
  base: BaseIneq;
  m: number;
  n: number;
  p: number;
  valeurNumerique: ValeurExacteIneq;
  comparateur: Comparateur;
  baseSuperieureA1: boolean;
  solutionEcran2: EnsembleReelGuide;
}

// ============================================================================
// Famille B — TOUJOURS ∅ — 1 écran.
// ============================================================================

/**
 * `c·base^(±x) [comparateur] -k`, `c>0`, `k>0` — TOUJOURS ∅ (`base^(...)` strictement positif,
 * un multiple positif ne peut jamais être ≤/< un nombre négatif). `comparateur` restreint à
 * `{"<=","<"}` (jamais `>`/`>=`, qui rendrait l'inéquation trivialement TOUJOURS VRAIE — pas le
 * cas ∅ recherché ici, "rôle fixe" explicite de la spec).
 */
export interface ExerciceIneqB {
  famille: "B";
  base: BaseIneq;
  c: number;
  k: number;
  exposantNegatif: boolean;
  comparateur: Comparateur;
}

// ============================================================================
// Famille C — TOUJOURS ℝ — sous-type f (1 écran) ou k (2 écrans).
// ============================================================================

export type SousTypeC = "f" | "k";

/** C, sous-type f — `x·(base^x−1) ≥ 0`, `base>1` (peut être `e`). `comparateur` toujours FIXÉ à
 * `">="` (jamais tiré, jamais `">"`  seul — voir en-tête du fichier : `">"` échouerait
 * exactement en `x=0`, cassant la garantie "toujours ℝ" au profit de ℝ\{0}, un statut
 * STRUCTURELLEMENT différent). Écran unique : conclure ℝ directement, sans calcul d'intervalle. */
export interface ExerciceIneqCf {
  famille: "C";
  sousType: "f";
  base: BaseIneq;
  comparateur: Comparateur;
}

/**
 * C, sous-type k — `base1^(g(x)) [comparateur] base2^(2g(x))`, `g(x)=ax²+bx+c` avec `a>0` et
 * discriminant `<0` GARANTI par construction (`g(x)=a(x-x0)²+m0`, `m0>0` — voir `familles/C.ts`),
 * et `base1<base2²` GARANTI par construction (retry borné). Écran 1 : regrouper en
 * `(base1/base2²)^g(x) [comparateur] 1` (MÊME comparateur — diviser par `base2^(2g(x))>0` ne
 * change jamais le sens). Écran 2 : conclure ℝ — `comparateur` restreint à `{"<","<="}`  (JAMAIS
 * `">"`/`">="`) pour que, une fois inversé (`ratio=base1/base2²<1` toujours), la condition
 * `g(x) [comparateur inversé] 0` devienne `g(x) > 0`/`g(x) ≥ 0`, TOUJOURS vraie puisque `g(x)>0`
 * partout par construction — restreindre `comparateur` à `">"/">="`  aurait au contraire donné
 * `g(x) < 0`/`g(x) ≤ 0`, TOUJOURS FAUX (∅), rompant le rôle fixe "toujours ℝ" de la famille C.
 */
export interface ExerciceIneqCk {
  famille: "C";
  sousType: "k";
  base1: BaseIneq;
  base2: BaseIneq;
  a: number;
  b: number;
  c: number;
  comparateur: Comparateur;
}

export type ExerciceIneqC = ExerciceIneqCf | ExerciceIneqCk;

// ============================================================================
// Famille D — produit de 2 facteurs, tableau de signes — sous-type constant (2 écrans) ou
// variable (3 écrans).
// ============================================================================

export type SousTypeD = "constant" | "variable";

/** Premier facteur de D, sous-type "constant" — signe CONSTANT garanti par construction, jamais
 * variable : `positif:true` → `c·base^(mx+n)` (toujours >0, `c>0`) ; `positif:false` →
 * `-c·base^(mx+n)-d` (toujours <0, `c>0,d>0`). */
export type PremierFacteurD = { positif: true; c: number; base: BaseIneq; m: number; n: number } | { positif: false; c: number; d: number; base: BaseIneq; m: number; n: number };

/** Second facteur de D, sous-type "constant" — `quadratique` : `d·x²-e` (`d,e>0`, racines `±r`,
 * `e=d·r²` DÉRIVÉ — "cible d'abord", propreté entière garantie) ; `exponentiel` : `base^x-k`
 * (`k=base^p`, `p≥0` entier — DÉCODÉ en toutes lettres à l'affichage, jamais "base^p" littéral). */
export type SecondFacteurDConstant = { type: "quadratique"; d: number; r: number; e: number } | { type: "exponentiel"; base: BaseIneq; p: number; k: number };

export interface ExerciceIneqDConstant {
  famille: "D";
  sousType: "constant";
  premierFacteur: PremierFacteurD;
  secondFacteur: SecondFacteurDConstant;
  comparateur: Comparateur;
  /** Solution de l'inéquation résultant sur le second facteur SEUL, sens déjà corrigé selon le
   * signe du premier facteur (spec : "avec le bon sens (direct si premier facteur positif,
   * INVERSÉ si négatif)"). 1 morceau (branche exponentielle) ou jusqu'à 2 (branche quadratique,
   * "hors racines"). Jamais ∅ ni ℝ. */
  solutionEcran2: EnsembleReelGuide;
}

/** Direction du changement de signe d'un facteur à ZÉRO UNIQUE, en lisant x croissant. */
export type DirectionSigne = "negatif_puis_positif" | "positif_puis_negatif";

/**
 * Facteur à UN SEUL zéro, sous-type "variable" de D — deux familles de fonctions possibles :
 * `exponentiel` (`c·base^(sgn(x-zero))-c`, base>1, zéro EXACTEMENT en `x=zero` par construction du
 * décalage `x-zero` dans l'exposant) ou `lineaire` (`pente·(x-zero)`, `pente=1` ⟺ `x-zero` — négatif
 * avant zéro, positif après — `pente=-1` ⟺ `zero-x`, sens inversé).
 *
 * **Écart documenté par rapport à la proposition littérale de la spec** ("second facteur
 * polynomial x²-k²") : `x²-k²` a DEUX zéros (`±k`), contradictoire avec la description "second
 * facteur, zéro en un autre point" (singulier) donnée juste avant dans la même spec — remplacé
 * par un second facteur LINÉAIRE à un seul zéro, qui satisfait littéralement les deux exigences
 * de la spec (un facteur "polynomial", zéro en un seul point) sans la complexité d'un tableau de
 * signes à 4 régions (2 zéros par facteur). Décision documentée plutôt que devinée silencieusement
 * — voir `generateurs6e/inequationsExponentielles/familles/D.ts` pour le détail complet.
 */
export type FacteurUnZero = { type: "exponentiel"; base: BaseIneq; sgn: 1 | -1; c: number; zero: number } | { type: "lineaire"; pente: 1 | -1; zero: number };

export interface ExerciceIneqDVariable {
  famille: "D";
  sousType: "variable";
  facteur1: FacteurUnZero;
  zero1: number;
  sens1: DirectionSigne;
  facteur2: FacteurUnZero;
  zero2: number;
  sens2: DirectionSigne;
  comparateur: Comparateur;
  /** Construite par `combinerSignesDeuxZeros` (Couche A) — union possible de 1 ou 2 morceaux,
   * bornes des 2 zéros INCLUSES ssi `comparateur` non strict (`>=`/`<=`), EXCLUES ssi strict
   * (`>`/`<`) — voir la doc de `combinerSignesDeuxZeros`. */
  solutionEcran3: EnsembleReelGuide;
}

export type ExerciceIneqD = ExerciceIneqDConstant | ExerciceIneqDVariable;

// ============================================================================
// Famille E — bases différentes, même exposant affine — 2 écrans.
// ============================================================================

/**
 * `base1^(mx+n) [comparateur] base2^(mx+n)`, `base1≠base2`. Écran 1 : regrouper en
 * `(base1/base2)^(mx+n) [comparateur] 1` (MÊME comparateur). Écran 2 : résoudre selon
 * `ratioSuperieurA1` (`base1/base2>1` ⟺ sens préservé, sinon inversé) — même piège que la famille
 * A, sur le RAPPORT plutôt que sur `base` directement.
 */
export interface ExerciceIneqE {
  famille: "E";
  base1: BaseIneq;
  base2: BaseIneq;
  m: number;
  n: number;
  comparateur: Comparateur;
  ratioSuperieurA1: boolean;
  solutionEcran2: EnsembleReelGuide;
}

export type ExerciceInequationExponentielle = ExerciceIneqA | ExerciceIneqB | ExerciceIneqC | ExerciceIneqD | ExerciceIneqE;

export type FamilleInequationExponentielle = ExerciceInequationExponentielle["famille"];

export type GenerateurExerciceInequationExponentielle = () => ExerciceInequationExponentielle;
