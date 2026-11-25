/**
 * Types de `6gen49` « Variables aléatoires discrètes et espérance » (6e ch. 8, § 1) — refonte de
 * l'audit du chapitre (lots B et C).
 * - A : loi donnée en tableau ; deux événements décrits par des conditions variées (≤, <, ≥, >, =,
 *   ≠, pair, impair, entre, hors) ; P(E₁), P(E₂), puis « contraires ? » (verdict tiré d'abord, ni
 *   événement certain, ni impossible, ni deux fois le même ; dans la moitié des « non contraires »,
 *   P(E₁) + P(E₂) = 1 quand même : la somme ne suffit pas, comme le dit le cours).
 * - B : construire la loi (contexte direct : dé, roue, enquête — plusieurs issues peuvent donner la
 *   même valeur ; ou hypergéométrique), puis E(X).
 * - C : jeu avec mise (positive) : vérifier E(X) du gain net puis conclure (favorable / défavorable /
 *   équitable, verdict tiré d'abord) ; ou imposer la mise équitable puis juger une mise proposée.
 */

export type PredicatA =
  | { t: "le" | "lt" | "ge" | "gt" | "eq" | "ne"; k: number }
  | { t: "pair" | "impair" }
  | { t: "entre" | "hors"; a: number; b: number };

export interface ExerciceEsperanceA {
  famille: "A";
  /** Valeurs de X (entiers consécutifs). */
  xs: number[];
  /** Probabilités en vingtièmes (somme 20). */
  poids: number[];
  e1: PredicatA;
  e2: PredicatA;
  indices1: number[];
  indices2: number[];
  contraires: boolean;
}

export interface IssueB {
  /** Description de l'issue (« 1 ou 2 », « 0 enfant »). */
  label: string;
  valeur: number;
  effectif: number;
}

export interface ExerciceEsperanceB_ContexteDirect {
  famille: "B";
  sousType: "contexteDirect";
  /** Situation, en prose. */
  texte: string;
  /** Ce que compte X (« le gain algébrique du joueur, en euros »). */
  definitionX: string;
  issues: IssueB[];
  total: number;
  /** Unité affichée après E(X) (« € », « » ). */
  unite: string;
}

export interface ExerciceEsperanceB_Hypergeometrique {
  famille: "B";
  sousType: "hypergeometrique";
  texte: string;
  definitionX: string;
  N: number;
  K: number;
  n: number;
}

export type ExerciceEsperanceB = ExerciceEsperanceB_ContexteDirect | ExerciceEsperanceB_Hypergeometrique;

export type StatutJeuC = "favorable" | "defavorable" | "equitable";

export interface IssueJeuC {
  label: string;
  effectif: number;
  /** Gain brut (ce que le jeu rapporte, avant la mise), en euros, ≥ 0. */
  gainBrut: number;
}

export interface ExerciceEsperanceC {
  famille: "C";
  sousType: "verifier" | "imposer";
  texte: string;
  issues: IssueJeuC[];
  total: number;
  /** « verifier » : mise payée par le joueur ; « imposer » : mise proposée à juger (dernier écran). */
  mise: number;
  /** Verdict de la mise (`mise`) : tiré AVANT les nombres. */
  statut: StatutJeuC;
}

export type ExerciceVariablesDiscretesEsperance = ExerciceEsperanceA | ExerciceEsperanceB | ExerciceEsperanceC;

export type FamilleVariablesDiscretesEsperance = ExerciceVariablesDiscretesEsperance["famille"];
