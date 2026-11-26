// Copie 5e (6h) de `5e-4h/moteur5e/sessionDefinirSuite.ts` (56gen3 ← 5gen44, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { ExerciceDefinirSuite } from "../core/definirSuite";
import type { ReglagesSession5e } from "../../../../5e-4h/core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../../../../5e-4h/moteur/etapeTentatives";
import { estPhaseChoix, phaseApres, phasesPourExercice } from "./typesDefinirSuite";
import type { EtatSessionDefinirSuite } from "./typesDefinirSuite";
import { verifierEcran } from "./verificationDefinirSuite";

/**
 * Couche B (5e) — moteur de session de `5gen44`. Même patron que `sessionGrandsNombresLog.ts`
 * (6gen92) : une seule tentative sur le choix fermé (verdict), trois sur un champ libre. Une saisie
 * illisible (`parse_error`) n'est jamais soumise ici : l'écran (`EtapeDefinirSuite`) l'arrête avant,
 * sans consommer de tentative. Aucun point ni pénalité affichés (générateur d'apprentissage).
 */

const POINTS_DE_BASE = 100;

/** 2 niveaux d'aide sur les champs libres, 1 sur le choix fermé. */
export const NIVEAU_AIDE_MAX = 2;

export function niveauAideMaxPhase(etat: EtatSessionDefinirSuite): number {
  return estPhaseChoix(etat.phase) ? 1 : NIVEAU_AIDE_MAX;
}

function etatExercice(exercice: ExerciceDefinirSuite) {
  return {
    exerciceCourant: exercice,
    phase: phasesPourExercice(exercice)[0],
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    revelesPartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionDefinirSuite(reglages: ReglagesSession5e, generateur: () => ExerciceDefinirSuite): EtatSessionDefinirSuite {
  return { reglages, generateur, indexExercice: 0, terminee: false, ...etatExercice(generateur()) };
}

export function tentativesMaxCourant(etat: EtatSessionDefinirSuite): number {
  return estPhaseChoix(etat.phase) ? 1 : etat.reglages.tentativesMax;
}

export function activerAideSuivante(etat: EtatSessionDefinirSuite): EtatSessionDefinirSuite {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxPhase(etat)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

export function soumettreReponseEcran(etat: EtatSessionDefinirSuite, valeurs: string[]): EtatSessionDefinirSuite {
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
