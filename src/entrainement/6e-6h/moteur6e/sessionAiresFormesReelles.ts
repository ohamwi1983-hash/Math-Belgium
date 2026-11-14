import type { ExerciceAiresFormesReelles } from "../core6e/airesFormesReelles.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";
import { phasesExercice } from "./modeleAiresFormesReelles";
import type { PhaseFormesReelles } from "./modeleAiresFormesReelles";
import { verifierEcran } from "./verificationAiresFormesReelles";

/**
 * Couche B (6e) — moteur de session de `6gen81` « Aires de formes réelles ». Même patron que
 * `sessionParadoxesProbabilites.ts` (6gen76) : chaîne d'écrans propre à la situation
 * (`phasesExercice`), trois tentatives par écran (tous les écrans sont des champs libres), deux
 * niveaux d'aide. Une saisie illisible (`parse_error`) n'arrive jamais ici : l'écran la signale
 * sans soumettre (elle ne consomme aucune tentative).
 */

const POINTS_DE_BASE = 100;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatSessionFormesReelles {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceAiresFormesReelles;
  exerciceCourant: ExerciceAiresFormesReelles;
  phase: PhaseFormesReelles;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseFormesReelles, boolean>>;
  aidePartiels: Partial<Record<PhaseFormesReelles, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}

function etatExercice(exercice: ExerciceAiresFormesReelles) {
  return {
    exerciceCourant: exercice,
    phase: phasesExercice(exercice)[0],
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    revelesPartiels: {},
    aidePartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionFormesReelles(reglages: ReglagesSession6e, generateur: () => ExerciceAiresFormesReelles): EtatSessionFormesReelles {
  return { reglages, generateur, indexExercice: 0, terminee: false, ...etatExercice(generateur()) };
}

export function activerAideSuivante(etat: EtatSessionFormesReelles): EtatSessionFormesReelles {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

export function soumettreReponseEcran(etat: EtatSessionFormesReelles, valeurs: string[]): EtatSessionFormesReelles {
  if (etat.terminee) throw new Error("soumettreReponseEcran : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, valeurs, {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    verifier: (r) => verifierEcran(exercice, phase, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const revelesPartiels = { ...etat.revelesPartiels, [phase]: revele };
  const aidePartiels = { ...etat.aidePartiels, [phase]: etat.niveauAide > 0 };
  const phases = phasesExercice(exercice);
  const suivante = phases[phases.indexOf(phase) + 1];
  if (!suivante) {
    const indexExercice = etat.indexExercice + 1;
    if (indexExercice >= etat.reglages.nombreExercices) {
      return { ...etat, etapeCourante, revelesPartiels, aidePartiels, indexExercice, terminee: true, derniereTransitionRevelee: revele };
    }
    return { ...etat, indexExercice, ...etatExercice(etat.generateur()), derniereTransitionRevelee: revele };
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: suivante, revelesPartiels, aidePartiels, derniereTransitionRevelee: revele };
}
