/**
 * Couche core (6e) — contrat pour `6gen49` ("Variables aléatoires discrètes et espérance"),
 * chapitre "Variables aléatoires et lois de probabilités" (ouvert par `6gen51` "Loi normale",
 * construit en parallèle — voir `docs/historique-6e.md`). 3 familles A/B/C, tirage ÉQUIPROBABLE de
 * la famille — voir `generateurs6e/variablesDiscretesEsperance/index.ts`.
 *
 * **Convention transversale à ce contrat** (identique à `denombrementFondamental.types.ts`,
 * 6gen43) : chaque variante porte déjà, PRÉ-CALCULÉES par la Couche A (jamais recalculées côté
 * Couche B — `moteur6e/` n'importe jamais `generateurs6e/`, voir CLAUDE.md), toutes les valeurs
 * numériques correctes attendues à chaque écran. La Couche B
 * (`moteur6e/verificationVariablesDiscretesEsperance.ts`) se contente de comparer la saisie élève à
 * ces valeurs.
 */

// ============================================================================
// Famille A — Loi discrète donnée : cumuls et événements contraires (3 écrans).
// ============================================================================

/** Un événement portant sur X, exprimé par un INDEX (ou une paire d'index) dans le tableau `xs` de
 * l'exercice — jamais une valeur de xᵢ directement, pour que la Couche A garde le contrôle total de
 * la traduction indices↔valeurs (voir `genererPaireEvenements`, `generateurs6e/
 * variablesDiscretesEsperance/familleA.ts`). Les 4 types couvrent exactement ceux de la mission :
 * "auMoins" (X≥xs[iMin]), "auPlus" (X≤xs[iMin]), "exact" (X=xs[iMin]), "intervalle"
 * (xs[iMin]≤X≤xs[iMax]). Comme `xs` est toujours une plage d'entiers CONSÉCUTIFS (voir en-tête
 * `familleA.ts`), l'ensemble d'indices couvert par un événement est TOUJOURS un intervalle
 * contigu d'indices — propriété exploitée par `ui6e/formatVariablesDiscretesEsperance.ts` pour un
 * affichage compact ("3≤X≤5") quel que soit le nombre de valeurs couvertes. */
export type TypeEvenementA = "auMoins" | "auPlus" | "exact" | "intervalle";

export interface EvenementLoiA {
  type: TypeEvenementA;
  iMin: number;
  /** Uniquement pour `type==="intervalle"`. */
  iMax?: number;
}

/**
 * Table de loi (`xs`/`ps`, même longueur `m`∈[5,8]) + 2 événements tirés parmi `evenement1`/
 * `evenement2`. `indices1`/`indices2` (ensembles d'indices dans `xs` RÉELLEMENT couverts par
 * chaque événement) et `contraires` (vérité terrain structurelle — intersection vide ET union =
 * univers complet, JAMAIS déduite d'une somme de probabilités, voir en-tête `familleA.ts`) sont
 * PRÉ-CALCULÉS ici : la Couche B ne fait que comparer.
 *
 * `psNumerateurs`/`psDenominateur` : `ps[i] = psNumerateurs[i]/psDenominateur` exactement (fraction
 * EXACTE, jamais réduite ici — l'affichage réduit à la volée, convention CLAUDE.md "fraction
 * irréductible, jamais de décimal"). `ps` (decimal) sert uniquement à la vérification par
 * tolérance côté Couche B. */
export interface ExerciceEsperanceA {
  famille: "A";
  xs: number[];
  psNumerateurs: number[];
  psDenominateur: number;
  ps: number[];
  evenement1: EvenementLoiA;
  evenement2: EvenementLoiA;
  indices1: number[];
  indices2: number[];
  /** Numérateur EXACT (sur `psDenominateur`) de `probabilite1`/`probabilite2` — somme entière des
   * `psNumerateurs` couverts par l'événement, jamais dérivée d'un arrondi décimal (voir en-tête
   * `familleA.ts`). Non réduite ici (l'affichage réduit à la volée, même convention que `ps`). */
  probabilite1Numerateur: number;
  probabilite2Numerateur: number;
  probabilite1: number;
  probabilite2: number;
  contraires: boolean;
}

// ============================================================================
// Famille B — Construire une loi de probabilité et calculer l'espérance (2 écrans, 2 sous-types).
// ============================================================================

export type SousTypeEsperanceB = "contexteDirect" | "hypergeometrique";

/** Une ligne de la loi de X — `probabiliteNumerateur`/`probabiliteDenominateur` : fraction EXACTE
 * (jamais réduite ici, voir en-tête famille A), `probabilite` : decimal (vérification tolérance). */
export interface LigneLoiB {
  valeur: number;
  probabiliteNumerateur: number;
  probabiliteDenominateur: number;
  probabilite: number;
}

/** Sous-type "contexte direct" : un tirage (urne, dé...) associe à chaque résultat un gain
 * (`issues[i].valeur`, DÉJÀ connu du contexte — `blocDonnees` l'affiche) et un effectif dont
 * découle la probabilité (à calculer). `issues` et `loi` restent parallèles (même ordre, même
 * longueur `m`∈[3,4]) — `loi` porte la RÉPONSE CORRECTE complète (valeur ET probabilité), `issues`
 * la description du contexte (libellé + effectif, affichés en données). */
export interface IssueContexteEsperanceB {
  label: string;
  valeur: number;
  effectif: number;
}

export interface ExerciceEsperanceB_ContexteDirect {
  famille: "B";
  sousType: "contexteDirect";
  phraseContexte: string[];
  issues: IssueContexteEsperanceB[];
  totalEffectifs: number;
  loi: LigneLoiB[];
  esperance: number;
}

/** Sous-type "hypergéométrique" : X = nombre de succès parmi `n` tirages sans remise dans une
 * population de taille `N` contenant `K` succès — RÉUTILISE `calculerHypergeo`
 * (`generateurs6e/probabiliteHypergeometrique/familleA.ts`, 6gen47) pour chaque valeur de `k`
 * possible, jamais réimplémenté (voir en-tête `familleB.ts`). `loi` couvre EXACTEMENT le support
 * complet `k∈[max(0,n-(N-K)), min(K,n)]` (les probabilités somment donc à 1 par construction, pas
 * seulement approximativement). */
export interface ExerciceEsperanceB_Hypergeometrique {
  famille: "B";
  sousType: "hypergeometrique";
  N: number;
  K: number;
  n: number;
  loi: LigneLoiB[];
  esperance: number;
}

export type ExerciceEsperanceB = ExerciceEsperanceB_ContexteDirect | ExerciceEsperanceB_Hypergeometrique;

// ============================================================================
// Famille C — Jeu équitable, espérance nulle (2-3 écrans, 2 sous-types).
// ============================================================================

export type SousTypeEsperanceC = "verifier" | "imposer";
export type StatutJeuC = "favorable" | "defavorable" | "equitable";

/** Une issue du jeu — `gainBrut` (avant soustraction éventuelle du paramètre `m`),
 * `probabiliteNumerateur`/`probabiliteDenominateur` (fraction EXACTE, même convention que famille
 * A/B), `probabilite` (decimal, vérification tolérance). Le gain NET (`gainBrut` pour "vérifier",
 * `gainBrut-m` pour "imposer") ne fait PAS partie de ce type — c'est la RÉPONSE attendue à l'écran
 * 1, jamais une donnée pré-affichée (voir `ui6e/formatVariablesDiscretesEsperance.ts`,
 * `blocDonneesC`, qui n'affiche que `gainBrut`). */
export interface IssueJeuC {
  label: string;
  gainBrut: number;
  probabiliteNumerateur: number;
  probabiliteDenominateur: number;
  probabilite: number;
}

/** `esperanceBrute` = Σ pᵢ·gainBrutᵢ. Pour "vérifier" : E = `esperanceBrute` (aucun `m`), `statutJeu`
 * est la vérité terrain (favorable/défavorable/équitable, seuil `TOLERANCE_ESPERANCE` côté Couche
 * B, jamais recalculé ici). Pour "imposer" : gain net = `gainBrut-m`, donc E(m) = `esperanceBrute`
 * − m (Σpᵢ=1) — LINÉAIRE en `m`, résolu par E(m)=0 ⟹ m=`esperanceBrute` (`mSolution`, valeur
 * identique à `esperanceBrute` par construction, champ séparé uniquement pour la lisibilité du
 * contrat — jamais une 2e vérité recalculée indépendamment). */
export interface ExerciceEsperanceC {
  famille: "C";
  sousType: SousTypeEsperanceC;
  phraseContexte: string[];
  issues: IssueJeuC[];
  esperanceBrute: number;
  statutJeu: StatutJeuC;
  mSolution: number;
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceVariablesDiscretesEsperance = ExerciceEsperanceA | ExerciceEsperanceB | ExerciceEsperanceC;

export type FamilleVariablesDiscretesEsperance = ExerciceVariablesDiscretesEsperance["famille"];
