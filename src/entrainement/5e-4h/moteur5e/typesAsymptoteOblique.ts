/**
 * Couche B (5e) — types pour 5gen21 ("Asymptote oblique"). Séquence FIXE par variante (même principe
 * que 5gen20, jamais de branche interne variable comme 5gen14) — `ordreComplet` dispatche par
 * `exercice.variante`. "conclureEquationAsymptote" est PARTAGÉE entre les 2 variantes (même écran,
 * même rôle — y=ax+b — indépendant de la technique de résolution utilisée en amont). 3 écrans par
 * variante, AUCUN écran de justification finale séparé (retiré — la limite tendant vers 0 est
 * désormais soit la technique même de la variante "viaLimites", soit implicite pour
 * "divisionEuclidienne").
 */
import type { ExerciceAsymptoteOblique } from "../core5e/asymptoteOblique.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseAsymptoteOblique = "diviserEuclidienne" | "ecrireFormeDeveloppee" | "calculerCoefficientA" | "calculerCoefficientB" | "conclureEquationAsymptote";

const ORDRE_DIVISION_EUCLIDIENNE: PhaseAsymptoteOblique[] = ["diviserEuclidienne", "ecrireFormeDeveloppee", "conclureEquationAsymptote"];
const ORDRE_VIA_LIMITES: PhaseAsymptoteOblique[] = ["calculerCoefficientA", "calculerCoefficientB", "conclureEquationAsymptote"];

export function ordreComplet(exercice: ExerciceAsymptoteOblique): PhaseAsymptoteOblique[] {
  return exercice.variante === "divisionEuclidienne" ? ORDRE_DIVISION_EUCLIDIENNE : ORDRE_VIA_LIMITES;
}

export function phaseInitiale(exercice: ExerciceAsymptoteOblique): PhaseAsymptoteOblique {
  return ordreComplet(exercice)[0];
}

export function phaseApres(exercice: ExerciceAsymptoteOblique, phase: PhaseAsymptoteOblique): PhaseAsymptoteOblique | "termine" {
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(phase);
  return index + 1 < ordre.length ? ordre[index + 1] : "termine";
}

export interface ResultatExerciceAsymptoteOblique {
  exercice: ExerciceAsymptoteOblique;
  scores: Partial<Record<PhaseAsymptoteOblique, number>>;
}

export interface EtatSessionAsymptoteOblique {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceAsymptoteOblique;
  exerciceCourant: ExerciceAsymptoteOblique;
  phase: PhaseAsymptoteOblique;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseAsymptoteOblique, number>>;
  indexExercice: number;
  resultats: ResultatExerciceAsymptoteOblique[];
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}
