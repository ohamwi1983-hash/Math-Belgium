import type { ExerciceMethodeGeneratrices } from "../core6e/methodeGeneratrices.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesMethodeGeneratrices";
import type { EtatSessionMethodeGeneratrices, PhaseMethodeGeneratrices, ResultatExerciceMethodeGeneratrices } from "./typesMethodeGeneratrices";
import { verifierEcran } from "./verificationMethodeGeneratrices";

/**
 * Couche B (6e) — moteur de session pour `6gen57`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionMethodeGeneratrices.test.ts` (fixtures locales) et
 * `generateurs6e/methodeGeneratrices/session.integration.test.ts` pour le seul fichier autorisé.
 * Mirroir structurel de `sessionDenombrementFondamental.ts` (6gen43), en plus simple : les 5 écrans
 * sont FIXES (`PhaseMethodeGeneratrices`, aucun branchement par famille), voir
 * `typesMethodeGeneratrices.ts`.
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide max sur chaque écran — `max=0` jamais (contrairement à `6gen43`, chaque écran
 * de ce générateur propose une aide, voir `ui6e/formatMethodeGeneratrices.ts`). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceMethodeGeneratrices): Pick<EtatSessionMethodeGeneratrices, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionMethodeGeneratrices(reglages: ReglagesSession6e, generateur: () => ExerciceMethodeGeneratrices): EtatSessionMethodeGeneratrices {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionMethodeGeneratrices): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionMethodeGeneratrices): EtatSessionMethodeGeneratrices {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionMethodeGeneratrices, resultat: ResultatExerciceMethodeGeneratrices): EtatSessionMethodeGeneratrices {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionMethodeGeneratrices, valeurs: string[]): EtatSessionMethodeGeneratrices {
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
  const scoresPartiels: Partial<Record<PhaseMethodeGeneratrices, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const phaseSuivante = phaseApres(phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceMethodeGeneratrices = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
