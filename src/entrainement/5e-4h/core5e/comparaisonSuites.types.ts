// Contrat core — 5gen18 "Comparaison numérique de deux suites". 3 branches, chacune 2 suites de
// types/tendances différents (arithmétique vs géométrique, arithmétique décroissante vs croissante,
// géométrique à taux différents) — technique du cours : pas de résolution algébrique, un BALAYAGE de
// valeurs (simulation numérique directe) pour trouver le premier rang n où l'une des suites dépasse
// STRICTEMENT l'autre (« Bₙ > Aₙ », comme le cours). `nSeuil` est donc calculé par simulation en
// Couche A (jamais une formule fermée). Le tableau affiché à l'élève couvre une FENÊTRE de 4 rangs
// consécutifs décalée au hasard : le rang de bascule y occupe la 2e, la 3e ou la 4e ligne (jamais la
// 1re, pour que la ligne précédente — condition encore fausse — soit toujours visible). L'élève
// repère donc lui-même la bascule dans le tableau, au lieu de la trouver toujours à la ligne du
// milieu (ancien défaut : réponse devinable sans balayage).
//
// Notation du cours : Aₙ (suite du « côté A », `u` dans le code) et Bₙ (côté B, `v`).
//
// Les 3 branches partagent un même bassin de contextes narratifs (`ContexteComparaisonSuites`,
// `generateurs5e/comparaisonSuites/contextes.ts`) tiré aléatoirement à CHAQUE exercice, quelle que
// soit la branche — jamais un contexte fixe par branche.

export type FamilleComparaisonSuites = "villesCroissance" | "stockDemande" | "epargneCroissance";

/** "aDepasseB" : la condition testée est Aₙ > Bₙ. "bDepasseA" : la condition testée est Bₙ > Aₙ.
 * Dépassement STRICT, comme le cours (« le premier rang où Bₙ > Aₙ »). */
export type ConditionComparaison = "aDepasseB" | "bDepasseA";

/** Contexte narratif — bassin unique de 50 entrées partagé par les 3 branches. `sujetA`/`sujetB`
 * sont des groupes nominaux COMPLETS (article + nom, ex. "la population du village A"), jamais
 * recomposés au runtime — aucun accord grammatical calculé, même convention que les `Contexte*`
 * précédents (5gen20-24). `branchesAutorisees` restreint les rares contextes dont le sens narratif
 * est incompatible avec certaines branches plutôt que de forcer une adaptation qui ne tiendrait pas :
 * un contexte dont l'identité même est "un côté décroît, l'autre croît" (ex. réservoir qui se vide/se
 * remplit) n'a de sens QUE dans la branche `stockDemande` (seule branche à comporter un côté
 * décroissant) ; à l'inverse un contexte dont la grandeur est un CUMUL (ex. victoires cumulées) ne
 * peut par nature jamais décroître, donc en est exclu. `undefined` = les 3 branches (cas par défaut,
 * grande majorité des contextes). */
export interface ContexteComparaisonSuites {
  id: string;
  labelA: string;
  labelB: string;
  /** Groupe nominal court AVEC article (« le parc A », « l'école B ») — utilisé dans la question
   * « … le parc B dépasse le parc A », jamais le libellé de colonne sans article. */
  nomA: string;
  nomB: string;
  sujetA: string;
  sujetB: string;
  unite: string;
  periode: "an" | "mois";
  branchesAutorisees?: FamilleComparaisonSuites[];
}

interface ExerciceComparaisonSuitesCommun {
  contexte: ContexteComparaisonSuites;
  nSeuil: number;
  /** Les 4 rangs consécutifs du tableau (fenêtre décalée au hasard, voir l'en-tête). */
  nTable: number[];
  /** Aₙ et Bₙ aux rangs de `nTable` (valeurs exactes, arrondies à l'unité à l'affichage). */
  uTable: number[];
  vTable: number[];
  traductionValeur: number;
  condition: ConditionComparaison;
  uniteContexte: string;
  /** Année du rang n = 1 — non-null seulement si `contexte.periode === "an"`. En mode « mois », le
   * rang n EST le numéro du mois (« au cours du n-ième mois »), sans ancrage calendaire. */
  anneeDepart: number | null;
}

/** Côté A (géométrique, taux de croissance élevé) vs côté B (arithmétique, croissance linéaire) — A
 * finit toujours par dépasser B (Aₙ > Bₙ) grâce à la croissance exponentielle. */
export interface ExerciceVillesCroissance extends ExerciceComparaisonSuitesCommun {
  famille: "villesCroissance";
  condition: "aDepasseB";
  u1: number;
  tauxPct: number;
  v1: number;
  d: number;
}

/** Côté A (arithmétique décroissant) vs côté B (arithmétique croissant) — B finit toujours par
 * dépasser A (Bₙ > Aₙ). */
export interface ExerciceStockDemande extends ExerciceComparaisonSuitesCommun {
  famille: "stockDemande";
  condition: "bDepasseA";
  u1: number;
  d1: number;
  v1: number;
  d2: number;
}

/** Côté A (géométrique, taux élevé, valeur initiale plus faible) vs côté B (géométrique, taux plus
 * faible, valeur initiale plus élevée) — A finit toujours par dépasser B (Aₙ > Bₙ). */
export interface ExerciceEpargneCroissance extends ExerciceComparaisonSuitesCommun {
  famille: "epargneCroissance";
  condition: "aDepasseB";
  u1: number;
  r1Pct: number;
  v1: number;
  r2Pct: number;
}

export type ExerciceComparaisonSuites = ExerciceVillesCroissance | ExerciceStockDemande | ExerciceEpargneCroissance;

export type GenerateurExerciceComparaisonSuites = () => ExerciceComparaisonSuites;
