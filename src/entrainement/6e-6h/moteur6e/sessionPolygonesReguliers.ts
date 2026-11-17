import type { ExercicePolygones } from "../core6e/polygonesReguliers.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import { estPhaseChoix, phaseApres, phasesDe } from "./typesPolygonesReguliers";
import type { EtatSessionPolygones, PhasePolygones } from "./typesPolygonesReguliers";
import { messageSaisieNonDecomptee, verifierEcran } from "./verificationPolygonesReguliers";

/**
 * Couche B (6e) — moteur de session de `6gen97`. Même patron que `sessionLirePlacerPlanComplexe.ts`
 * (6gen95) : choix fermé = une seule tentative, écrans de saisie = `reglages.tentativesMax` ; une
 * saisie illisible, non réduite ou approchée (valeur exacte demandée) ne consomme JAMAIS de
 * tentative. Aucun point ni pénalité affichés (générateur d'apprentissage).
 */

const POINTS_DE_BASE = 100;

/** 2 niveaux d'aide sur les écrans de saisie, 1 sur un choix fermé. */
export function niveauAideMaxPhase(phase: PhasePolygones): number {
  return estPhaseChoix(phase) ? 1 : 2;
}

export function tentativesMaxPhase(etat: EtatSessionPolygones): number {
  return estPhaseChoix(etat.phase) ? 1 : etat.reglages.tentativesMax;
}

function etatExercice(exercice: ExercicePolygones) {
  return {
    exerciceCourant: exercice,
    phase: phasesDe(exercice)[0],
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    revelesPartiels: {},
    aidePartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionPolygones(reglages: ReglagesSession6e, generateur: () => ExercicePolygones): EtatSessionPolygones {
  return { reglages, generateur, indexExercice: 0, terminee: false, ...etatExercice(generateur()) };
}

export function activerAideSuivante(etat: EtatSessionPolygones): EtatSessionPolygones {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxPhase(etat.phase)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

export function soumettreReponseEcran(etat: EtatSessionPolygones, valeurs: string[]): EtatSessionPolygones {
  if (etat.terminee) throw new Error("soumettreReponseEcran : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  if (messageSaisieNonDecomptee(exercice, phase, valeurs) !== null) return { ...etat, derniereTransitionRevelee: false };

  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, valeurs, {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: tentativesMaxPhase(etat),
    verifier: (r) => verifierEcran(exercice, phase, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const revelesPartiels = { ...etat.revelesPartiels, [phase]: revele };
  const aidePartiels = { ...etat.aidePartiels, [phase]: etat.niveauAide > 0 };
  const suivante = phaseApres(exercice, phase);
  if (suivante === "termine") {
    const indexExercice = etat.indexExercice + 1;
    if (indexExercice >= etat.reglages.nombreExercices) {
      return { ...etat, etapeCourante, revelesPartiels, aidePartiels, indexExercice, terminee: true, derniereTransitionRevelee: revele };
    }
    return { ...etat, indexExercice, ...etatExercice(etat.generateur()), derniereTransitionRevelee: revele };
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: suivante, revelesPartiels, aidePartiels, derniereTransitionRevelee: revele };
}
