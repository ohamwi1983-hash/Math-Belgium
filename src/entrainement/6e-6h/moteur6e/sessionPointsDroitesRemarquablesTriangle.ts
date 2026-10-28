import type { ExercicePointsDroitesRemarquablesTriangle } from "../core6e/pointsDroitesRemarquablesTriangle.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesPointsDroitesRemarquablesTriangle";
import type { EtatSessionPointsDroitesRemarquablesTriangle, PhasePointsDroitesRemarquablesTriangle, ResultatExercicePointsDroitesRemarquablesTriangle } from "./typesPointsDroitesRemarquablesTriangle";
import { verifierEcran } from "./verificationPointsDroitesRemarquablesTriangle";

/**
 * Couche B (6e) — moteur de session pour `6gen54`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `session.integration.test.ts` (`generateurs6e/pointsDroitesRemarquablesTriangle/`) pour le
 * seul fichier autorisé Couche A + Couche B ensemble. Mirroir structurel de
 * `sessionDenombrementFondamental.ts` (6gen43), jamais importé (chaque générateur garde son propre
 * moteur de session — CLAUDE.md, "Pas de moteur de session unifié").
 */

const POINTS_DE_BASE = 100;

/** 2 niveaux d'aide max sur les écrans qui en prévoient — `max=0` ailleurs (voir
 * `ui6e/formatPointsDroitesRemarquablesTriangle.ts`, `niveauAideMaxEcran`). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(
  exercice: ExercicePointsDroitesRemarquablesTriangle,
): Pick<
  EtatSessionPointsDroitesRemarquablesTriangle,
  "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "revelesPartiels" | "aidePartiels" | "derniereTransitionRevelee"
> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(exercice),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresPartiels: {},
    revelesPartiels: {},
    aidePartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionPointsDroitesRemarquablesTriangle(reglages: ReglagesSession6e, generateur: () => ExercicePointsDroitesRemarquablesTriangle): EtatSessionPointsDroitesRemarquablesTriangle {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionPointsDroitesRemarquablesTriangle): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax };
}

export function activerAideSuivante(etat: EtatSessionPointsDroitesRemarquablesTriangle): EtatSessionPointsDroitesRemarquablesTriangle {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionPointsDroitesRemarquablesTriangle, resultat: ResultatExercicePointsDroitesRemarquablesTriangle): EtatSessionPointsDroitesRemarquablesTriangle {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionPointsDroitesRemarquablesTriangle, valeurs: string[]): EtatSessionPointsDroitesRemarquablesTriangle {
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
  const score = etapeCourante.score as number;
  const scoresPartiels: Partial<Record<PhasePointsDroitesRemarquablesTriangle, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const revelesPartiels: Partial<Record<PhasePointsDroitesRemarquablesTriangle, boolean>> = { ...etat.revelesPartiels, [phaseCourante]: revele };
  const aidePartiels: Partial<Record<PhasePointsDroitesRemarquablesTriangle, boolean>> = { ...etat.aidePartiels, [phaseCourante]: etat.niveauAide > 0 };
  const phaseSuivante = phaseApres(phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExercicePointsDroitesRemarquablesTriangle = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant({ ...etat, revelesPartiels, aidePartiels }, resultat), derniereTransitionRevelee: revele };
  }

  return {
    ...etat,
    scoresPartiels,
    revelesPartiels,
    aidePartiels,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    phase: phaseSuivante,
    derniereTransitionRevelee: revele,
  };
}
