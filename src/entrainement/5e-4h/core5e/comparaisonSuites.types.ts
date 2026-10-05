// Contrat core — 5gen18 "Comparaison numérique de deux suites". 3 branches, chacune 2 suites de
// types/tendances différents (arithmétique vs géométrique, arithmétique décroissante vs croissante,
// géométrique à taux différents) — technique INÉDITE sur la plateforme : pas de résolution
// algébrique, un balayage de valeurs (simulation numérique directe) pour trouver le seuil n où la
// condition bascule. `nSeuil` est donc calculé par simulation en Couche A (jamais une formule
// fermée), puis les 3 lignes du tableau affiché à l'élève couvrent TOUJOURS [nSeuil-1, nSeuil,
// nSeuil+1] — la condition est fausse à la première ligne, vraie aux 2 suivantes, ce qui teste
// explicitement le piège "erreur d'un cran" (confondre nSeuil et nSeuil-1/nSeuil+1).
//
// Les 3 branches partagent un même bassin de 50 contextes narratifs (`ContexteComparaisonSuites`,
// `generateurs5e/comparaisonSuites/contextes.ts`) tiré aléatoirement à CHAQUE exercice, quelle que
// soit la branche — jamais un contexte fixe par branche.

export type FamilleComparaisonSuites = "villesCroissance" | "stockDemande" | "epargneCroissance";

/** "uGeV" : la condition testée est u_n≥v_n. "vGeU" : la condition testée est v_n≥u_n. */
export type ConditionComparaison = "uGeV" | "vGeU";

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
  sujetA: string;
  sujetB: string;
  unite: string;
  periode: "an" | "mois";
  branchesAutorisees?: FamilleComparaisonSuites[];
}

interface ExerciceComparaisonSuitesCommun {
  contexte: ContexteComparaisonSuites;
  nSeuil: number;
  nTable: [number, number, number];
  uTable: [number, number, number];
  vTable: [number, number, number];
  traductionValeur: number;
  condition: ConditionComparaison;
  uniteContexte: string;
  /** Année de départ de la simulation — non-null seulement si `contexte.periode === "an"` (sinon la
   * traduction finale est un simple décompte de mois écoulés, sans ancrage calendaire). */
  anneeDepart: number | null;
}

/** Côté A (géométrique, taux de croissance élevé) vs côté B (arithmétique, croissance linéaire) — A
 * finit toujours par dépasser B (u_n≥v_n) grâce à la croissance exponentielle. */
export interface ExerciceVillesCroissance extends ExerciceComparaisonSuitesCommun {
  famille: "villesCroissance";
  condition: "uGeV";
  u1: number;
  tauxPct: number;
  v1: number;
  d: number;
}

/** Côté A (arithmétique décroissant) vs côté B (arithmétique croissant) — B finit toujours par
 * dépasser A (v_n≥u_n). */
export interface ExerciceStockDemande extends ExerciceComparaisonSuitesCommun {
  famille: "stockDemande";
  condition: "vGeU";
  u1: number;
  d1: number;
  v1: number;
  d2: number;
}

/** Côté A (géométrique, taux élevé, valeur initiale plus faible) vs côté B (géométrique, taux plus
 * faible, valeur initiale plus élevée) — A finit toujours par dépasser B (u_n≥v_n). */
export interface ExerciceEpargneCroissance extends ExerciceComparaisonSuitesCommun {
  famille: "epargneCroissance";
  condition: "uGeV";
  u1: number;
  r1Pct: number;
  v1: number;
  r2Pct: number;
}

export type ExerciceComparaisonSuites = ExerciceVillesCroissance | ExerciceStockDemande | ExerciceEpargneCroissance;

export type GenerateurExerciceComparaisonSuites = () => ExerciceComparaisonSuites;
