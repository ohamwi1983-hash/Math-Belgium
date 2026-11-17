import type { ExerciceDemontrerParallelisme } from "../core/demontrerParallelisme.types";
import { ecransExercice } from "../ui/formatDemontrerParallelisme";

/**
 * Session de gen103 (« Démontrer un parallélisme ») : 3 écrans (droite-plan) ou 4 (deux plans), tous
 * des choix fermés — UNE tentative chacun (décision de l'utilisateur), la bonne réponse est montrée
 * après un échec. Aucun point affiché.
 */

export interface EtatDemontrerParallelisme {
  exercice: ExerciceDemontrerParallelisme;
  ecran: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceDemontrerParallelisme): EtatDemontrerParallelisme {
  return { exercice, ecran: 0, niveauAide: 0 };
}

export function nombreEcrans(exercice: ExerciceDemontrerParallelisme): number {
  return ecransExercice(exercice).length;
}

export function activerAide(etat: EtatDemontrerParallelisme): EtatDemontrerParallelisme {
  const max = ecransExercice(etat.exercice)[etat.ecran]!.aides.length;
  return { ...etat, niveauAide: Math.min(max, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatDemontrerParallelisme): EtatDemontrerParallelisme {
  return { ...etat, ecran: etat.ecran + 1, niveauAide: 0 };
}
