import type { ExerciceFrequenceProbabilite } from "../core6e/frequenceProbabilite.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { estPhaseChoix, phaseApres, phaseInitiale } from "./typesFrequenceProbabilite";
import type { EtatSessionFrequenceProbabilite, PhaseFrequenceProbabilite, ResultatExerciceFrequenceProbabilite } from "./typesFrequenceProbabilite";
import { verifierEcran } from "./verificationFrequenceProbabilite";

/**
 * Couche B (6e) — moteur de session de `6gen75`. Même patron que `sessionCalculAires.ts` (6gen26) :
 * UNE fonction de soumission (`soumettreReponseEcran(etat, valeurs)`), tentatives par écran, et UNE
 * SEULE tentative sur les écrans à choix fermé (`estPhaseChoix`) — sinon le 2e essai se gagne par
 * élimination. N'importe rien de `generateurs6e/`.
 */

const POINTS_DE_BASE = 100;

/** Deux niveaux d'aide sur chaque écran. */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(
  exercice: ExerciceFrequenceProbabilite,
): Pick<EtatSessionFrequenceProbabilite, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "revelesPartiels" | "derniereTransitionRevelee"> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresPartiels: {},
    revelesPartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionFrequenceProbabilite(reglages: ReglagesSession6e, generateur: () => ExerciceFrequenceProbabilite): EtatSessionFrequenceProbabilite {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

export function tentativesMaxCourant(etat: EtatSessionFrequenceProbabilite): number {
  return estPhaseChoix(etat.exerciceCourant, etat.phase) ? 1 : etat.reglages.tentativesMax;
}

function reglagesEtape(etat: EtatSessionFrequenceProbabilite): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: tentativesMaxCourant(etat) };
}

export function activerAideSuivante(etat: EtatSessionFrequenceProbabilite): EtatSessionFrequenceProbabilite {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionFrequenceProbabilite, resultat: ResultatExerciceFrequenceProbabilite): EtatSessionFrequenceProbabilite {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) return { ...etat, resultats, indexExercice, terminee: true };
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionFrequenceProbabilite, valeurs: string[]): EtatSessionFrequenceProbabilite {
  if (etat.terminee) throw new Error("soumettreReponseEcran : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phaseCourante = etat.phase;

  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, valeurs, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEcran(exercice, phaseCourante, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const score = etapeCourante.score as number;
  const scoresPartiels: Partial<Record<PhaseFrequenceProbabilite, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const revelesPartiels: Partial<Record<PhaseFrequenceProbabilite, boolean>> = { ...etat.revelesPartiels, [phaseCourante]: revele };
  const phaseSuivante = phaseApres(phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceFrequenceProbabilite = { exercice, scores: scoresPartiels, revelesPartiels };
    return { ...cloturerExerciceOuSuivant({ ...etat, scoresPartiels, revelesPartiels }, resultat), derniereTransitionRevelee: revele };
  }
  return { ...etat, scoresPartiels, revelesPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
