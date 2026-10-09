import type { ExerciceProbabiliteHypergeometrique } from "../core6e/probabiliteHypergeometrique.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesProbabiliteHypergeometrique";
import type { EtatSessionProbabiliteHypergeometrique, PhaseProbabiliteHypergeometrique, ResultatExerciceProbabiliteHypergeometrique } from "./typesProbabiliteHypergeometrique";
import { verifierEcran } from "./verificationProbabiliteHypergeometrique";

/**
 * Couche B (6e) — moteur de session pour `6gen47`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `generateurs6e/probabiliteHypergeometrique/session.integration.test.ts` pour le seul
 * fichier autorisé Couche A + Couche B ensemble. Mirroir structurel de
 * `sessionDenombrementFondamental.ts` (6gen43), jamais importé (chaque générateur garde son propre
 * moteur de session — CLAUDE.md, "Pas de moteur de session unifié").
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide max sur les écrans qui en prévoient — `max=0` ailleurs (voir
 * `ui6e/formatProbabiliteHypergeometrique.ts`, `niveauAideMaxEcran`). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceProbabiliteHypergeometrique): Pick<EtatSessionProbabiliteHypergeometrique, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionProbabiliteHypergeometrique(reglages: ReglagesSession6e, generateur: () => ExerciceProbabiliteHypergeometrique): EtatSessionProbabiliteHypergeometrique {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionProbabiliteHypergeometrique): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionProbabiliteHypergeometrique): EtatSessionProbabiliteHypergeometrique {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionProbabiliteHypergeometrique, resultat: ResultatExerciceProbabiliteHypergeometrique): EtatSessionProbabiliteHypergeometrique {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionProbabiliteHypergeometrique, valeurs: string[]): EtatSessionProbabiliteHypergeometrique {
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
  const scoresPartiels: Partial<Record<PhaseProbabiliteHypergeometrique, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const phaseSuivante = phaseApres(phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceProbabiliteHypergeometrique = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
