import type { ExerciceFormuleMoivre } from "../core6e/formuleMoivre.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesFormuleMoivre";
import type { EtatSessionFormuleMoivre, PhaseFormuleMoivre, ResultatExerciceFormuleMoivre } from "./typesFormuleMoivre";
import { verifierEcran } from "./verificationFormuleMoivre";

/**
 * Couche B (6e) — moteur de session pour `6gen38`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionFormuleMoivre.test.ts` (fixtures locales factices) et `generateurs6e/formuleMoivre/
 * session.integration.test.ts` pour la preuve. Mirroir structurel de `sessionNombresComplexes.ts`
 * (6gen34), simplifié : chaîne d'écrans FIXE (pas de branchement par famille/sous-type).
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide max — écrans 2 et 3 (`max=0` sur écran 1, voir `ui6e/formatFormuleMoivre.ts`). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceFormuleMoivre): Pick<EtatSessionFormuleMoivre, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionFormuleMoivre(reglages: ReglagesSession6e, generateur: () => ExerciceFormuleMoivre): EtatSessionFormuleMoivre {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionFormuleMoivre): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionFormuleMoivre): EtatSessionFormuleMoivre {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionFormuleMoivre, resultat: ResultatExerciceFormuleMoivre): EtatSessionFormuleMoivre {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionFormuleMoivre, valeurs: string[]): EtatSessionFormuleMoivre {
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
  const scoresPartiels: Partial<Record<PhaseFormuleMoivre, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const phaseSuivante = phaseApres(phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceFormuleMoivre = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
