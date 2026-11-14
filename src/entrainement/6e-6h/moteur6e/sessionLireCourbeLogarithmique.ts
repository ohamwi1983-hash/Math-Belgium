import type { ExerciceLireCourbeLogarithmique } from "../core6e/lireCourbeLogarithmique.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import { estPhaseChoix, phasesExercice } from "./typesLireCourbeLogarithmique";
import type { EtatSessionLireCourbeLogarithmique, ReponseLireCourbeLog } from "./typesLireCourbeLogarithmique";
import { verifierEcran } from "./verificationLireCourbeLogarithmique";

/**
 * Couche B (6e) — moteur de session de `6gen85`. Même patron que `sessionIntegraleGraphique.ts`
 * (6gen77) : choix fermé → une seule tentative ; saisie libre → `reglages.tentativesMax`. Une saisie
 * illisible (`parse_error`) n'arrive jamais ici : l'écran la signale sans la soumettre (elle ne
 * consomme donc aucune tentative).
 */

const POINTS_DE_BASE = 100;

export const NIVEAU_AIDE_MAX = 2;

export function tentativesMaxCourant(etat: EtatSessionLireCourbeLogarithmique): number {
  return estPhaseChoix(etat.phase) ? 1 : etat.reglages.tentativesMax;
}

function etatExercice(exercice: ExerciceLireCourbeLogarithmique) {
  return {
    exerciceCourant: exercice,
    phase: phasesExercice(exercice)[0],
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    revelesPartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionLireCourbeLogarithmique(reglages: ReglagesSession6e, generateur: () => ExerciceLireCourbeLogarithmique): EtatSessionLireCourbeLogarithmique {
  return { reglages, generateur, indexExercice: 0, terminee: false, ...etatExercice(generateur()) };
}

export function activerAideSuivante(etat: EtatSessionLireCourbeLogarithmique): EtatSessionLireCourbeLogarithmique {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

export function soumettreReponseEcran(etat: EtatSessionLireCourbeLogarithmique, reponse: ReponseLireCourbeLog): EtatSessionLireCourbeLogarithmique {
  if (etat.terminee) throw new Error("soumettreReponseEcran : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const etapeCourante = soumettreEtapeTentatives<ReponseLireCourbeLog>(etat.etapeCourante, reponse, {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: tentativesMaxCourant(etat),
    verifier: (r) => verifierEcran(exercice, phase, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const revelesPartiels = { ...etat.revelesPartiels, [phase]: revele };
  const phases = phasesExercice(exercice);
  const suivante = phases[phases.indexOf(phase) + 1];
  if (suivante === undefined) {
    const indexExercice = etat.indexExercice + 1;
    if (indexExercice >= etat.reglages.nombreExercices) {
      return { ...etat, etapeCourante, revelesPartiels, indexExercice, terminee: true, derniereTransitionRevelee: revele };
    }
    return { ...etat, indexExercice, ...etatExercice(etat.generateur()), derniereTransitionRevelee: revele };
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: suivante, revelesPartiels, derniereTransitionRevelee: revele };
}
