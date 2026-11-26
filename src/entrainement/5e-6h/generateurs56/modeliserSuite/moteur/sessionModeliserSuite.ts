// Copie 5e (6h) de `5e-4h/moteur5e/sessionModeliserSuite.ts` (56gen9 ← 5gen47, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { ExerciceModeliserSuite } from "../core/modeliserSuite";
import type { ReglagesSession5e } from "../../../../5e-4h/core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../../../../5e-4h/moteur/etapeTentatives";
import { estPhaseChoix, phaseApres, phasesPourExercice } from "./typesModeliserSuite";
import type { EtatSessionModeliserSuite } from "./typesModeliserSuite";
import { verifierEcran } from "./verificationModeliserSuite";

/**
 * Couche B (5e) — moteur de session de `5gen47`. Même patron que `sessionDefinirSuite.ts` (5gen44) :
 * une seule tentative sur le choix fermé (nature de la suite), trois sur un champ libre. Une saisie
 * illisible (`parse_error`) n'est jamais soumise ici : l'écran (`EtapeModeliserSuite`) l'arrête
 * avant, sans consommer de tentative. Aucun point ni pénalité affichés (générateur d'apprentissage).
 */

const POINTS_DE_BASE = 100;

/** 2 niveaux d'aide sur les champs libres, 1 sur le choix fermé. */
export const NIVEAU_AIDE_MAX = 2;

export function niveauAideMaxPhase(etat: EtatSessionModeliserSuite): number {
  return estPhaseChoix(etat.phase) ? 1 : NIVEAU_AIDE_MAX;
}

function etatExercice(exercice: ExerciceModeliserSuite) {
  return {
    exerciceCourant: exercice,
    phase: phasesPourExercice(exercice)[0],
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    revelesPartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionModeliserSuite(reglages: ReglagesSession5e, generateur: () => ExerciceModeliserSuite): EtatSessionModeliserSuite {
  return { reglages, generateur, indexExercice: 0, terminee: false, ...etatExercice(generateur()) };
}

export function tentativesMaxCourant(etat: EtatSessionModeliserSuite): number {
  return estPhaseChoix(etat.phase) ? 1 : etat.reglages.tentativesMax;
}

export function activerAideSuivante(etat: EtatSessionModeliserSuite): EtatSessionModeliserSuite {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxPhase(etat)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

export function soumettreReponseEcran(etat: EtatSessionModeliserSuite, valeurs: string[]): EtatSessionModeliserSuite {
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
