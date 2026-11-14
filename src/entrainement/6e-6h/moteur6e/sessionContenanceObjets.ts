import type { ExerciceContenanceObjets } from "../core6e/contenanceObjets.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import { estPhaseChoix, phaseApres } from "./typesContenanceObjets";
import type { EtatSessionContenance } from "./typesContenanceObjets";
import { verifierEcran } from "./verificationContenanceObjets";

/**
 * Couche B (6e) — moteur de session de `6gen83`. Même patron que `sessionParadoxesProbabilites.ts`
 * (6gen76) : une seule fonction de soumission, une seule tentative sur un choix fermé, 3 sur un
 * champ. Une saisie illisible (`parse_error`) n'arrive jamais ici : l'écran la refuse avant de
 * soumettre (aucune tentative consommée).
 */

const POINTS_DE_BASE = 100;
export const NIVEAU_AIDE_MAX = 2;

function etatExercice(exercice: ExerciceContenanceObjets) {
  return {
    exerciceCourant: exercice,
    phase: "modele" as const,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    revelesPartiels: {},
    aidePartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionContenance(reglages: ReglagesSession6e, generateur: () => ExerciceContenanceObjets): EtatSessionContenance {
  return { reglages, generateur, indexExercice: 0, terminee: false, ...etatExercice(generateur()) };
}

export function tentativesMaxCourant(etat: EtatSessionContenance): number {
  return estPhaseChoix(etat.exerciceCourant, etat.phase) ? 1 : etat.reglages.tentativesMax;
}

export function activerAideSuivante(etat: EtatSessionContenance): EtatSessionContenance {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

export function soumettreReponseEcran(etat: EtatSessionContenance, valeurs: string[]): EtatSessionContenance {
  if (etat.terminee) throw new Error("soumettreReponseEcran : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, valeurs, {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: tentativesMaxCourant(etat),
    verifier: (r) => verifierEcran(exercice, phase, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const revelesPartiels = { ...etat.revelesPartiels, [phase]: revele };
  const aidePartiels = { ...etat.aidePartiels, [phase]: etat.niveauAide > 0 };
  const suivante = phaseApres(phase);
  if (suivante === "termine") {
    const indexExercice = etat.indexExercice + 1;
    if (indexExercice >= etat.reglages.nombreExercices) {
      return { ...etat, etapeCourante, revelesPartiels, aidePartiels, indexExercice, terminee: true, derniereTransitionRevelee: revele };
    }
    return { ...etat, indexExercice, ...etatExercice(etat.generateur()), derniereTransitionRevelee: revele };
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: suivante, revelesPartiels, aidePartiels, derniereTransitionRevelee: revele };
}
