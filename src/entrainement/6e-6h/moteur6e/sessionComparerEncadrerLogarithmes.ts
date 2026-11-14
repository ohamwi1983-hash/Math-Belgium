import type { ExerciceComparerEncadrerLog } from "../core6e/comparerEncadrerLogarithmes.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import { estPhaseChoix, phasesExercice } from "./typesComparerEncadrerLogarithmes";
import type { EtatSessionComparerEncadrerLog } from "./typesComparerEncadrerLogarithmes";
import { diagnostiquerEcran, verifierEcran } from "./verificationComparerEncadrerLogarithmes";

/**
 * Couche B (6e) — moteur de session de `6gen86`. Même patron que `sessionParadoxesProbabilites.ts`
 * (6gen76) : choix fermé → une seule tentative ; champ libre → `tentativesMax` ; une saisie
 * illisible (`parse_error`) ne consomme jamais de tentative (l'état est rendu inchangé).
 */

const POINTS_DE_BASE = 100;

/** 2 niveaux d'aide sur chaque écran. */
export const NIVEAU_AIDE_MAX = 2;

function etatExercice(exercice: ExerciceComparerEncadrerLog) {
  return {
    exerciceCourant: exercice,
    phase: phasesExercice(exercice)[0],
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    revelesPartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionComparerEncadrerLog(reglages: ReglagesSession6e, generateur: () => ExerciceComparerEncadrerLog): EtatSessionComparerEncadrerLog {
  return { reglages, generateur, indexExercice: 0, terminee: false, ...etatExercice(generateur()) };
}

export function activerAideSuivante(etat: EtatSessionComparerEncadrerLog): EtatSessionComparerEncadrerLog {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

export function soumettreReponseEcran(etat: EtatSessionComparerEncadrerLog, valeurs: string[]): EtatSessionComparerEncadrerLog {
  if (etat.terminee) throw new Error("soumettreReponseEcran : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  if (!estPhaseChoix(phase) && diagnostiquerEcran(exercice, phase, valeurs) === "parse_error") return { ...etat, derniereTransitionRevelee: false };
  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, valeurs, {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: estPhaseChoix(phase) ? 1 : etat.reglages.tentativesMax,
    verifier: (r) => verifierEcran(exercice, phase, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const revelesPartiels = { ...etat.revelesPartiels, [phase]: revele };
  const phases = phasesExercice(exercice);
  const index = phases.indexOf(phase);
  if (index === phases.length - 1) {
    const indexExercice = etat.indexExercice + 1;
    if (indexExercice >= etat.reglages.nombreExercices) {
      return { ...etat, etapeCourante, revelesPartiels, indexExercice, terminee: true, derniereTransitionRevelee: revele };
    }
    return { ...etat, indexExercice, ...etatExercice(etat.generateur()), derniereTransitionRevelee: revele };
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phases[index + 1], revelesPartiels, derniereTransitionRevelee: revele };
}
