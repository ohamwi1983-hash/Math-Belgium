import type { ExerciceImpedances } from "../core6e/impedancesComplexes";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import { PHASES_IMPEDANCES, estPhaseChoix, phaseApres } from "./typesImpedances";
import type { EtatSessionImpedances, PhaseImpedances } from "./typesImpedances";
import { controleAvantSoumission, verifierEcran } from "./verificationImpedances";

/**
 * Couche B (6e) — moteur de session de `6gen96`. Même patron que `sessionLirePlacerPlanComplexe.ts`
 * (6gen95) : choix fermé (nature du circuit) = UNE seule tentative, champs libres =
 * `reglages.tentativesMax` ; une saisie refusée par `controleAvantSoumission` (illisible, radians,
 * arrondi trop grossier…) ne consomme JAMAIS de tentative. Aucun point ni pénalité affichés.
 */

const POINTS_DE_BASE = 100;

/** 2 niveaux d'aide sur les écrans à champs, 1 sur le choix fermé. */
export function niveauAideMaxPhase(phase: PhaseImpedances): number {
  return estPhaseChoix(phase) ? 1 : 2;
}

export function tentativesMaxPhase(etat: EtatSessionImpedances): number {
  return estPhaseChoix(etat.phase) ? 1 : etat.reglages.tentativesMax;
}

function etatExercice(exercice: ExerciceImpedances) {
  return {
    exerciceCourant: exercice,
    phase: PHASES_IMPEDANCES[0],
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    revelesPartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionImpedances(reglages: ReglagesSession6e, generateur: () => ExerciceImpedances): EtatSessionImpedances {
  return { reglages, generateur, indexExercice: 0, terminee: false, ...etatExercice(generateur()) };
}

export function activerAideSuivante(etat: EtatSessionImpedances): EtatSessionImpedances {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxPhase(etat.phase)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

export function soumettreReponseEcran(etat: EtatSessionImpedances, valeurs: string[]): EtatSessionImpedances {
  if (etat.terminee) throw new Error("soumettreReponseEcran : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  if (controleAvantSoumission(exercice, phase, valeurs) !== null) return { ...etat, derniereTransitionRevelee: false };

  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, valeurs, {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: tentativesMaxPhase(etat),
    verifier: (r) => verifierEcran(exercice, phase, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const revelesPartiels = { ...etat.revelesPartiels, [phase]: revele };
  const suivante = phaseApres(phase);
  if (suivante === "termine") {
    const indexExercice = etat.indexExercice + 1;
    if (indexExercice >= etat.reglages.nombreExercices) {
      return { ...etat, etapeCourante, revelesPartiels, indexExercice, terminee: true, derniereTransitionRevelee: revele };
    }
    return { ...etat, indexExercice, ...etatExercice(etat.generateur()), derniereTransitionRevelee: revele };
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: suivante, revelesPartiels, derniereTransitionRevelee: revele };
}
