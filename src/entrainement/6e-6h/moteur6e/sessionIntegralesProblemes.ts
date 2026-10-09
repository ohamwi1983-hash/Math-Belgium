import type { ExerciceIntegralesProblemes } from "../core6e/integralesProblemes.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesIntegralesProblemes";
import type { EtatSessionIntegralesProblemes, PhaseIntegralesProblemes, ResultatExerciceIntegralesProblemes } from "./typesIntegralesProblemes";
import { verifierEcran } from "./verificationIntegralesProblemes";

/**
 * Couche B (6e) — moteur de session pour `6gen29`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionIntegralesProblemes.test.ts` (fixtures locales factices) et
 * `generateurs6e/integralesProblemes/session.integration.test.ts`. Mirroir structurel de
 * `sessionVolumesRevolution.ts` (6gen27), jamais importé (chaque générateur garde son propre moteur
 * de session — CLAUDE.md).
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceIntegralesProblemes): Pick<EtatSessionIntegralesProblemes, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionIntegralesProblemes(reglages: ReglagesSession6e, generateur: () => ExerciceIntegralesProblemes): EtatSessionIntegralesProblemes {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionIntegralesProblemes): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionIntegralesProblemes): EtatSessionIntegralesProblemes {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionIntegralesProblemes, resultat: ResultatExerciceIntegralesProblemes): EtatSessionIntegralesProblemes {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionIntegralesProblemes, valeurs: string[]): EtatSessionIntegralesProblemes {
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
  const scoresPartiels: Partial<Record<PhaseIntegralesProblemes, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const phaseSuivante = phaseApres(exercice, phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceIntegralesProblemes = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
