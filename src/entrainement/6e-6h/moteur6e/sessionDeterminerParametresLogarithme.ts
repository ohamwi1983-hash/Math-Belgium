import type { ExerciceDeterminerParametresLogarithme } from "../core6e/determinerParametresLogarithme.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesDeterminerParametresLogarithme";
import type { EtatSessionDeterminerParametresLogarithme, PhaseDeterminerParametresLogarithme } from "./typesDeterminerParametresLogarithme";
import { verifierEquationB, verifierFonction, verifierLireA } from "./verificationDeterminerParametresLogarithme";

/**
 * Couche B (6e) — moteur de session pour `6gen18`. N'importe jamais rien de `src/generateurs6e/`.
 * Trois écrans à champ libre (valeur, équation, expression) : `reglages.tentativesMax` partout, aucun
 * choix fermé à gagner par élimination.
 */

const POINTS_DE_BASE = 100;

/** 2 niveaux d'aide sur chaque écran. */
export const NIVEAU_AIDE_MAX = 2;

const VERIFICATEURS: Record<PhaseDeterminerParametresLogarithme, (exercice: ExerciceDeterminerParametresLogarithme, texte: string) => boolean> = {
  lireA: verifierLireA,
  equationB: verifierEquationB,
  fonction: verifierFonction,
};

function etatInitial(
  exercice: ExerciceDeterminerParametresLogarithme,
): Pick<
  EtatSessionDeterminerParametresLogarithme,
  "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "revelesPartiels" | "aidesPartielles" | "derniereTransitionRevelee"
> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresPartiels: {},
    revelesPartiels: {},
    aidesPartielles: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionDeterminerParametresLogarithme(
  reglages: ReglagesSession6e,
  generateur: () => ExerciceDeterminerParametresLogarithme,
): EtatSessionDeterminerParametresLogarithme {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

export function activerAideSuivante(etat: EtatSessionDeterminerParametresLogarithme): EtatSessionDeterminerParametresLogarithme {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

export function soumettreReponse(etat: EtatSessionDeterminerParametresLogarithme, texte: string): EtatSessionDeterminerParametresLogarithme {
  if (etat.terminee) throw new Error("soumettreReponse : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    verifier: (r) => VERIFICATEURS[etat.phase](exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const scoresPartiels = { ...etat.scoresPartiels, [etat.phase]: etapeCourante.score as number };
  const revelesPartiels = { ...etat.revelesPartiels, [etat.phase]: revele };
  const aidesPartielles = { ...etat.aidesPartielles, [etat.phase]: etat.niveauAide };
  const phaseSuivante = phaseApres(etat.phase);

  if (phaseSuivante === "termine") {
    const resultats = [...etat.resultats, { exercice, scores: scoresPartiels }];
    const indexExercice = etat.indexExercice + 1;
    if (indexExercice >= etat.reglages.nombreExercices) {
      return { ...etat, scoresPartiels, revelesPartiels, aidesPartielles, resultats, indexExercice, terminee: true, derniereTransitionRevelee: revele };
    }
    return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereTransitionRevelee: revele };
  }

  return {
    ...etat,
    scoresPartiels,
    revelesPartiels,
    aidesPartielles,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    phase: phaseSuivante,
    derniereTransitionRevelee: revele,
  };
}
