/**
 * Couche B (5e) — types pour 5gen17 ("Problèmes classiques sur les suites"). 7 scénarios
 * STRUCTURELLEMENT DISJOINTS (union discriminée par `scenario`, même principe que 5gen5/5gen12) —
 * 26 phases au total (3+3+3+3+5+4+5), chaque scénario traversant TOUJOURS sa séquence complète
 * (aucune instance n'est aléatoire, donc aucun saut conditionnel n'est nécessaire ici, contrairement
 * à 5gen5/5gen12/5gen13). `ORDRE_PHASES` (table `Record<Scénario,Phase[]>`) pilote
 * `phaseInitiale`/`phaseApres` par simple indexation — même patron que 5gen12.
 */
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";
import type { ExerciceSuiteClassique, ScenarioSuiteClassique } from "../core5e/suitesClassiques.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";

export type PhaseSuiteClassique =
  // echiquier
  | "u64"
  | "sommeTotaleEchiquier"
  | "poidsComparaison"
  // papyrusRhind
  | "poserSysteme"
  | "resoudreSysteme"
  | "suiteFinalePapyrus"
  // suitesCombinees
  | "poserEquationCombinees"
  | "resoudreRCombinees"
  | "suitesFinalesCombinees"
  // vitesse
  | "distance11"
  | "sommeTotale11"
  | "troisMethodes"
  // fibonacci
  | "dixTermes"
  | "formuleRecurrence"
  | "calculV5"
  | "resoudrePhi"
  | "proprieteInverse"
  // trianglesZigzag
  | "hauteursZigzag"
  | "airesZigzag"
  | "longueurZigzag"
  | "airesZigzagAC"
  // carresEmboites
  | "sommePartielleA"
  | "limitePuissanceA"
  | "sommeInfinieA"
  | "airesB"
  | "sommeInfinieB";

export const ORDRE_PHASES: Record<ScenarioSuiteClassique, PhaseSuiteClassique[]> = {
  echiquier: ["u64", "sommeTotaleEchiquier", "poidsComparaison"],
  papyrusRhind: ["poserSysteme", "resoudreSysteme", "suiteFinalePapyrus"],
  suitesCombinees: ["poserEquationCombinees", "resoudreRCombinees", "suitesFinalesCombinees"],
  vitesse: ["distance11", "sommeTotale11", "troisMethodes"],
  fibonacci: ["dixTermes", "formuleRecurrence", "calculV5", "resoudrePhi", "proprieteInverse"],
  trianglesZigzag: ["hauteursZigzag", "airesZigzag", "longueurZigzag", "airesZigzagAC"],
  carresEmboites: ["sommePartielleA", "limitePuissanceA", "sommeInfinieA", "airesB", "sommeInfinieB"],
};

export function ordreComplet(exercice: ExerciceSuiteClassique): PhaseSuiteClassique[] {
  return ORDRE_PHASES[exercice.scenario];
}

export function phaseInitiale(exercice: ExerciceSuiteClassique): PhaseSuiteClassique {
  return ordreComplet(exercice)[0];
}

export function phaseApres(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): PhaseSuiteClassique | "termine" {
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(phase);
  return index >= 0 && index + 1 < ordre.length ? ordre[index + 1] : "termine";
}

export interface ResultatExerciceSuiteClassique {
  exercice: ExerciceSuiteClassique;
  scores: Partial<Record<PhaseSuiteClassique, number>>;
}

export interface EtatSessionSuiteClassique {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceSuiteClassique;
  indexExercice: number;
  exerciceCourant: ExerciceSuiteClassique;
  phase: PhaseSuiteClassique;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseSuiteClassique, number>>;
  resultats: ResultatExerciceSuiteClassique[];
  terminee: boolean;
  /** POST-soumission — reflète la révélation de la DERNIÈRE phase venant de se clôturer (fermeture
   * d'exercice ou passage à la phase suivante). À distinguer de `etapeCourante.revelee`, qui décrit
   * l'écran PRÉ-soumission en cours et est donc structurellement toujours `false` juste après un
   * `soumettreEcran` réussi (voir `sessionSuiteClassique.ts`). */
  derniereEtapeRevelee: boolean;
}
