import type { ExerciceGrandsNombres } from "../core6e/grandsNombresLog";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import { estPhaseChoix, phaseApres, phasesPourExercice } from "./typesGrandsNombresLog";
import type { EtatSessionGrandsNombres } from "./typesGrandsNombresLog";
import { verifierEcran } from "./verificationGrandsNombresLog";

/**
 * Couche B (6e) — moteur de session de `6gen92`. Même patron que `sessionLorenzGini.ts` (6gen82) :
 * une seule tentative sur le choix fermé (verdict), trois sur un champ libre. Une saisie illisible
 * (`parse_error`) n'est jamais soumise ici : l'écran (`EtapeGrandsNombresLog`) l'arrête avant, sans
 * consommer de tentative. Aucun point ni pénalité affichés (générateur d'apprentissage).
 */

const POINTS_DE_BASE = 100;

/** 2 niveaux d'aide sur les champs libres, 1 sur le choix fermé. */
export const NIVEAU_AIDE_MAX = 2;

export function niveauAideMaxPhase(etat: EtatSessionGrandsNombres): number {
  return estPhaseChoix(etat.phase) ? 1 : NIVEAU_AIDE_MAX;
}

function etatExercice(exercice: ExerciceGrandsNombres) {
  return {
    exerciceCourant: exercice,
    phase: phasesPourExercice(exercice)[0],
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    revelesPartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionGrandsNombres(reglages: ReglagesSession6e, generateur: () => ExerciceGrandsNombres): EtatSessionGrandsNombres {
  return { reglages, generateur, indexExercice: 0, terminee: false, ...etatExercice(generateur()) };
}

export function tentativesMaxCourant(etat: EtatSessionGrandsNombres): number {
  return estPhaseChoix(etat.phase) ? 1 : etat.reglages.tentativesMax;
}

export function activerAideSuivante(etat: EtatSessionGrandsNombres): EtatSessionGrandsNombres {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxPhase(etat)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

export function soumettreReponseEcran(etat: EtatSessionGrandsNombres, valeurs: string[]): EtatSessionGrandsNombres {
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
  const suivante = phaseApres(exercice, phase);
  if (suivante === "termine") {
    const indexExercice = etat.indexExercice + 1;
    if (indexExercice >= etat.reglages.nombreExercices) {
      return { ...etat, etapeCourante, revelesPartiels, indexExercice, terminee: true, derniereTransitionRevelee: revele };
    }
    return { ...etat, indexExercice, ...etatExercice(etat.generateur()), derniereTransitionRevelee: revele };
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: suivante, revelesPartiels, derniereTransitionRevelee: revele };
}
