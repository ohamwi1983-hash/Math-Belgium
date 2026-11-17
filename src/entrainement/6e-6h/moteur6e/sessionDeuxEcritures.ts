import type { ExerciceDeuxEcritures } from "../core6e/deuxEcrituresComplexe";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import { PHASES_DEUX_ECRITURES, phaseApres } from "./typesDeuxEcritures";
import type { EtatSessionDeuxEcritures } from "./typesDeuxEcritures";
import { verifierEcran } from "./verificationDeuxEcritures";

/**
 * Couche B (6e) — moteur de session de `6gen94`. Même patron que `sessionLinearisationEuler.ts`
 * (6gen93) : trois tentatives par écran (champs libres uniquement). Une saisie illisible, ou une
 * valeur seulement arrondie là où une valeur exacte est attendue, n'est jamais soumise ici : l'écran
 * l'arrête avant, sans consommer de tentative. Aucun point ni pénalité affichés.
 */

const POINTS_DE_BASE = 100;

/** Deux niveaux d'aide par écran. */
export const NIVEAU_AIDE_MAX = 2;

function etatExercice(exercice: ExerciceDeuxEcritures) {
  return {
    exerciceCourant: exercice,
    phase: PHASES_DEUX_ECRITURES[0],
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    revelesPartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionDeuxEcritures(reglages: ReglagesSession6e, generateur: () => ExerciceDeuxEcritures): EtatSessionDeuxEcritures {
  return { reglages, generateur, indexExercice: 0, terminee: false, ...etatExercice(generateur()) };
}

export function activerAideSuivante(etat: EtatSessionDeuxEcritures): EtatSessionDeuxEcritures {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

export function soumettreReponseEcran(etat: EtatSessionDeuxEcritures, valeurs: string[]): EtatSessionDeuxEcritures {
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
