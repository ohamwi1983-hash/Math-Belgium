import type { Morceau, SolutionEnsemble } from "./inequation.types";

/**
 * gen68 — « Problèmes modélisés par une fonction de référence » (4e, chapitre 3, processus
 * TRANSFÉRER). Chaque famille est un CONTEXTE qui se traduit par une fonction de référence peu
 * transformée :
 * - `trajet` : durée t(v) = d/v (inverse) ;
 * - `potager` : côté c(A) = √A d'un carré d'aire A (racine carrée) ;
 * - `aquarium` : arête a(V) = ∛V d'un cube de volume V (racine cubique) ;
 * - `thermostat` : écart E(T) = |T − c| à une consigne (valeur absolue) ;
 * - `location` : coût horaire moyen C(x) = F/x + p (inverse translatée) ;
 * - `plaque` : aire A(c) = c² d'un carré de côté c (carré).
 */
export type FamilleProbleme = "trajet" | "potager" | "aquarium" | "thermostat" | "location" | "plaque";

/** Sens de la question concrète : « moins de » (<), « au plus » (≤), « plus de » (>), « au moins » (≥). */
export type SensQuestion = "<" | "≤" | ">" | "≥";

export interface ExerciceProblemesFonctionsReference {
  famille: FamilleProbleme;
  sens: SensQuestion;
  /** Paramètres du contexte (sens selon la famille, voir `generateurs/problemesFonctionsReference`) :
   * trajet {d, vmax, heures, minutes} ; potager {amax, k} ; aquarium {vmax, k} ;
   * thermostat {consigne, k} ; location {forfait, prixHeure, seuil} ; plaque {cote, k}. */
  p: Record<string, number>;
  /** Ordre d'affichage des 4 domaines proposés (indices dans `optionsDomaine`, 0 = la bonne). */
  ordreDomaine: number[];
  /** Ordre d'affichage des 4 interprétations proposées (0 = la bonne). */
  ordreInterpretation: number[];
}

/** Description complète d'une instance, calculée UNE fois (`decrireProbleme`) et partagée par
 * l'appli, le vérificateur et l'adaptateur papier. */
export interface DescriptionProbleme {
  /** Lettre de la variable (« v », « A »…) et nom de la fonction (« t », « c »…). */
  variable: string;
  nomFonction: string;
  /** Expression attendue en LaTeX (sans « t(v) = ») et évaluation numérique de référence. */
  expressionLatex: string;
  evaluer: (valeur: number) => number;
  /** Domaine imposé par le contexte (un seul morceau) et domaine algébrique (LaTeX). */
  domaineContexte: Morceau;
  domaineAlgebriqueLatex: string;
  /** 4 domaines proposés à l'écran 2 (LaTeX), le premier est le bon. */
  optionsDomaine: string[];
  /** Ensemble-solution de la question concrète, DÉJÀ restreint au domaine du contexte. */
  solution: SolutionEnsemble;
  /** Inéquation à résoudre (LaTeX), ex. « \dfrac{240}{v} < 2{,}5 ». */
  inequationLatex: string;
}
