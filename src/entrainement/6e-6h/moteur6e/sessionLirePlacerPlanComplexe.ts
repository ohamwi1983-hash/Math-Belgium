import type { ExerciceLirePlacer } from "../core6e/lirePlacerPlanComplexe.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import { estPhaseChoix, phaseApres } from "./typesLirePlacerPlanComplexe";
import type { EtatSessionLirePlacer, PhaseLirePlacer } from "./typesLirePlacerPlanComplexe";
import { messageSaisieNonDecomptee, verifierEcran } from "./verificationLirePlacerPlanComplexe";

/**
 * Couche B (6e) — moteur de session de `6gen95`. Même patron que `sessionOptimiserModeleLog.ts`
 * (6gen91) : choix fermé = une seule tentative, écrans ouverts (saisie ou placement) =
 * `reglages.tentativesMax` ; une saisie illisible, non réduite ou approchée (valeur exacte demandée)
 * ne consomme JAMAIS de tentative. Aucun point ni pénalité affichés (générateur d'apprentissage).
 */

const POINTS_DE_BASE = 100;

/** 2 niveaux d'aide sur les écrans ouverts, 1 sur le choix fermé. */
export function niveauAideMaxPhase(phase: PhaseLirePlacer): number {
  return estPhaseChoix(phase) ? 1 : 2;
}

export function tentativesMaxPhase(etat: EtatSessionLirePlacer): number {
  return estPhaseChoix(etat.phase) ? 1 : etat.reglages.tentativesMax;
}

function etatExercice(exercice: ExerciceLirePlacer) {
  return {
    exerciceCourant: exercice,
    phase: "lire" as const,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    revelesPartiels: {},
    aidePartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionLirePlacer(reglages: ReglagesSession6e, generateur: () => ExerciceLirePlacer): EtatSessionLirePlacer {
  return { reglages, generateur, indexExercice: 0, terminee: false, ...etatExercice(generateur()) };
}

export function activerAideSuivante(etat: EtatSessionLirePlacer): EtatSessionLirePlacer {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxPhase(etat.phase)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

export function soumettreReponseEcran(etat: EtatSessionLirePlacer, valeurs: string[]): EtatSessionLirePlacer {
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
