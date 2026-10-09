import type { ExerciceProbabilitesProblemes } from "../core6e/probabilitesProblemes.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesProbabilitesProblemes";
import type { EtatSessionProbabilitesProblemes, PhaseProbabilitesProblemes, ResultatExerciceProbabilitesProblemes } from "./typesProbabilitesProblemes";
import { verifierEcran } from "./verificationProbabilitesProblemes";

/**
 * Couche B (6e) — moteur de session pour `6gen33`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionProbabilitesProblemes.test.ts` (fixtures locales factices) et
 * `generateurs6e/probabilitesProblemes/session.integration.test.ts` pour la preuve. Même patron que
 * `sessionIndependanceBayes.ts`/`sessionTiragesArbres.ts` : `soumettreReponseEcran(etat, valeurs:
 * string[])` UNIQUE, `etat.phase` porte déjà l'information de "quel écran", `verifierEcran` sait déjà
 * quoi vérifier (y compris pour les écrans "liste"/"choix"/"intervalle", tous sérialisés en
 * `string[]` — voir `verificationProbabilitesProblemes.ts`, en-tête).
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur tous les écrans (même convention que `6gen30`/`6gen31`/`6gen32`). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceProbabilitesProblemes): Pick<EtatSessionProbabilitesProblemes, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionProbabilitesProblemes(reglages: ReglagesSession6e, generateur: () => ExerciceProbabilitesProblemes): EtatSessionProbabilitesProblemes {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionProbabilitesProblemes): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionProbabilitesProblemes): EtatSessionProbabilitesProblemes {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionProbabilitesProblemes, resultat: ResultatExerciceProbabilitesProblemes): EtatSessionProbabilitesProblemes {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionProbabilitesProblemes, valeurs: string[]): EtatSessionProbabilitesProblemes {
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
  const phaseSuivante = phaseApres(phaseCourante);
  const scoresPartiels: Partial<Record<PhaseProbabilitesProblemes, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceProbabilitesProblemes = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
