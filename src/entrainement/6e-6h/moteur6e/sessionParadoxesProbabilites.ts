import type { ExerciceParadoxesProbabilites } from "../core6e/paradoxesProbabilites.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import { estPhaseChoix, phaseApres } from "./typesParadoxesProbabilites";
import type { EtatSessionParadoxes } from "./typesParadoxesProbabilites";
import { verifierEcran } from "./verificationParadoxesProbabilites";

/**
 * Couche B (6e) — moteur de session de `6gen76`. Même patron que `sessionIndependanceBayes.ts`
 * (6gen32), avec la règle permanente « une seule tentative sur un choix fermé » : `prediction` et
 * `conclure` se closent au premier « Valider » (la prédiction n'est jamais fausse : elle n'est pas
 * notée, seulement rappelée pour la confronter au calcul).
 */

const POINTS_DE_BASE = 100;

/** 2 niveaux d'aide sur les écrans 2 à 4 ; aucun sur la prédiction (intuition brute). */
export const NIVEAU_AIDE_MAX = 2;

export function niveauAideMaxPhase(etat: EtatSessionParadoxes): number {
  return etat.phase === "prediction" ? 0 : NIVEAU_AIDE_MAX;
}

function etatExercice(exercice: ExerciceParadoxesProbabilites) {
  return {
    exerciceCourant: exercice,
    phase: "prediction" as const,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    prediction: null,
    revelesPartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionParadoxes(reglages: ReglagesSession6e, generateur: () => ExerciceParadoxesProbabilites): EtatSessionParadoxes {
  return { reglages, generateur, indexExercice: 0, terminee: false, ...etatExercice(generateur()) };
}

export function activerAideSuivante(etat: EtatSessionParadoxes): EtatSessionParadoxes {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxPhase(etat)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

export function soumettreReponseEcran(etat: EtatSessionParadoxes, valeurs: string[]): EtatSessionParadoxes {
  if (etat.terminee) throw new Error("soumettreReponseEcran : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, valeurs, {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: estPhaseChoix(phase) ? 1 : etat.reglages.tentativesMax,
    verifier: (r) => verifierEcran(exercice, phase, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const revelesPartiels = { ...etat.revelesPartiels, [phase]: revele };
  const prediction = phase === "prediction" ? valeurs[0] : etat.prediction;
  const suivante = phaseApres(phase);
  if (suivante === "termine") {
    const indexExercice = etat.indexExercice + 1;
    if (indexExercice >= etat.reglages.nombreExercices) {
      return { ...etat, etapeCourante, revelesPartiels, prediction, indexExercice, terminee: true, derniereTransitionRevelee: revele };
    }
    return { ...etat, indexExercice, ...etatExercice(etat.generateur()), derniereTransitionRevelee: revele };
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: suivante, prediction, revelesPartiels, derniereTransitionRevelee: revele };
}
