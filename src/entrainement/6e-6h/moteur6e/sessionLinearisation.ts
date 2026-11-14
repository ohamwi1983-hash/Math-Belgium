import type { ExerciceLinearisation } from "../core6e/linearisationDonnees";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import { estPhaseChoix, phaseApres, phasesPourExercice } from "./typesLinearisation";
import type { EtatSessionLinearisation } from "./typesLinearisation";
import { verifierEcran } from "./verificationLinearisation";

/**
 * Couche B (6e) — moteur de session de `6gen89` « Linéariser des données ». Même patron que
 * `sessionLorenzGini.ts` (6gen82) : une seule tentative sur le choix fermé (représentation), trois sur
 * un champ libre. Une saisie illisible (`parse_error`) n'est jamais soumise ici : l'écran
 * (`EtapeLinearisation`) l'arrête avant, sans consommer de tentative.
 */

const POINTS_DE_BASE = 100;

/** 2 niveaux d'aide sur les champs libres, 1 sur les choix fermés. */
export const NIVEAU_AIDE_MAX = 2;

export function niveauAideMaxPhase(etat: EtatSessionLinearisation): number {
  return estPhaseChoix(etat.phase) ? 1 : NIVEAU_AIDE_MAX;
}

function etatExercice(exercice: ExerciceLinearisation) {
  return {
    exerciceCourant: exercice,
    phase: phasesPourExercice(exercice)[0],
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    revelesPartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionLinearisation(reglages: ReglagesSession6e, generateur: () => ExerciceLinearisation): EtatSessionLinearisation {
  return { reglages, generateur, indexExercice: 0, terminee: false, ...etatExercice(generateur()) };
}

export function tentativesMaxCourant(etat: EtatSessionLinearisation): number {
  return estPhaseChoix(etat.phase) ? 1 : etat.reglages.tentativesMax;
}

export function activerAideSuivante(etat: EtatSessionLinearisation): EtatSessionLinearisation {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxPhase(etat)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

export function soumettreReponseEcran(etat: EtatSessionLinearisation, valeurs: string[]): EtatSessionLinearisation {
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
