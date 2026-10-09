import type { ExerciceProbabilitesEnsembles } from "../core6e/probabilitesEnsembles.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesProbabilitesEnsembles";
import type { EtatSessionProbabilitesEnsembles, PhaseProbabilitesEnsembles, ResultatExerciceProbabilitesEnsembles } from "./typesProbabilitesEnsembles";
import { verifierEcran } from "./verificationProbabilitesEnsembles";

/**
 * Couche B (6e) — moteur de session pour `6gen30`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionProbabilitesEnsembles.test.ts` (fixtures locales factices) et
 * `generateurs6e/probabilitesEnsembles/session.integration.test.ts` pour la preuve. Même patron
 * qu'`6gen23` (`soumettreReponseEcran(etat, valeurs: string[])` UNIQUE, `etat.phase` porte déjà
 * l'information de "quel écran", `verifierEcran` sait déjà quoi vérifier) — voir en-tête de
 * `sessionCalculPrimitives.ts` pour la justification complète, répliquée ici à l'identique.
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur tous les écrans (spec explicite pour chaque écran documenté). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceProbabilitesEnsembles): Pick<EtatSessionProbabilitesEnsembles, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionProbabilitesEnsembles(reglages: ReglagesSession6e, generateur: () => ExerciceProbabilitesEnsembles): EtatSessionProbabilitesEnsembles {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionProbabilitesEnsembles): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionProbabilitesEnsembles): EtatSessionProbabilitesEnsembles {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionProbabilitesEnsembles, resultat: ResultatExerciceProbabilitesEnsembles): EtatSessionProbabilitesEnsembles {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionProbabilitesEnsembles, valeurs: string[]): EtatSessionProbabilitesEnsembles {
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
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels: Partial<Record<PhaseProbabilitesEnsembles, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const phaseSuivante = phaseApres(phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceProbabilitesEnsembles = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
