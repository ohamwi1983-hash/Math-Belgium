/**
 * Couche B (5e) — types pour 5gen16 ("Convergence et divergence des suites"). 3 variantes
 * STRUCTURELLEMENT DISJOINTES, séquences FIXES et courtes (1 écran pour arithmétique/géométrique,
 * 2 pour quelconque) — même patron `ordreComplet`/`phaseInitiale`/`phaseApres` que le reste du
 * chantier, gardé pour l'uniformité malgré la simplicité de chaque séquence.
 */
import type { ExerciceConvergenceSuite } from "../core5e/convergenceSuites.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseConvergenceSuite = "classificationArithmetique" | "classificationGeometrique" | "diviserQuelconque" | "classifierQuelconque";

export function ordreComplet(exercice: ExerciceConvergenceSuite): PhaseConvergenceSuite[] {
  switch (exercice.variante) {
    case "arithmetique":
      return ["classificationArithmetique"];
    case "geometrique":
      return ["classificationGeometrique"];
    case "quelconque":
      return ["diviserQuelconque", "classifierQuelconque"];
  }
}

export function phaseInitiale(exercice: ExerciceConvergenceSuite): PhaseConvergenceSuite {
  return ordreComplet(exercice)[0];
}

export function phaseApres(exercice: ExerciceConvergenceSuite, phase: PhaseConvergenceSuite): PhaseConvergenceSuite | "termine" {
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(phase);
  return index + 1 < ordre.length ? ordre[index + 1] : "termine";
}

export interface ResultatExerciceConvergenceSuite {
  exercice: ExerciceConvergenceSuite;
  scores: Partial<Record<PhaseConvergenceSuite, number>>;
}

export interface EtatSessionConvergenceSuite {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceConvergenceSuite;
  exerciceCourant: ExerciceConvergenceSuite;
  phase: PhaseConvergenceSuite;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseConvergenceSuite, number>>;
  indexExercice: number;
  resultats: ResultatExerciceConvergenceSuite[];
  terminee: boolean;
  /** Statut `revelee` POST-soumission du DERNIER écran clos (A.1) — `etapeCourante.revelee` au
   * moment où `terminerEtape` lit l'état est structurellement toujours `false` (nouvel écran tout
   * juste démarré), donc ce champ est la seule source fiable pour colorer la ligne du récap. */
  derniereEtapeRevelee: boolean;
}
