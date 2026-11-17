import type { ExercicePositionsPlans } from "../core/positionsPlans.types";
import { ecransExercice } from "../ui/formatPositionsPlans";

/**
 * Session de gen101 (« Positions de deux plans et de trois plans ») : deux écrans, tous deux des
 * choix fermés (position ou issue, puis justification ou paire de points communs) — UNE tentative
 * chacun (décision de l'utilisateur), la bonne réponse est montrée après un échec. Aucun point
 * affiché.
 */

export interface EtatPositionsPlans {
  exercice: ExercicePositionsPlans;
  ecran: number;
  niveauAide: number;
}

export function demarrer(exercice: ExercicePositionsPlans): EtatPositionsPlans {
  return { exercice, ecran: 0, niveauAide: 0 };
}

export function nombreEcrans(exercice: ExercicePositionsPlans): number {
  return ecransExercice(exercice).length;
}

export function activerAide(etat: EtatPositionsPlans): EtatPositionsPlans {
  const max = ecransExercice(etat.exercice)[etat.ecran]!.aides.length;
  return { ...etat, niveauAide: Math.min(max, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatPositionsPlans): EtatPositionsPlans {
  return { ...etat, ecran: etat.ecran + 1, niveauAide: 0 };
}
