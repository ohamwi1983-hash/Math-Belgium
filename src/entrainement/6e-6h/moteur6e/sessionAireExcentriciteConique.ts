import type { ExerciceAireExcentriciteConique } from "../core6e/aireExcentriciteConique.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesAireExcentriciteConique";
import type { EtatSessionAireExcentriciteConique, PhaseAireExcentriciteConique, ResultatExerciceAireExcentriciteConique } from "./typesAireExcentriciteConique";
import { verifierEcran } from "./verificationAireExcentriciteConique";

/**
 * Couche B (6e) — moteur de session pour `6gen60`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `generateurs6e/aireExcentriciteConique/session.integration.test.ts` pour le seul fichier
 * autorisé Couche A + Couche B ensemble. Mirroir structurel de
 * `sessionEquationConiqueCaracteristiques.ts` (6gen59), jamais importé (chaque générateur garde son
 * propre moteur de session — CLAUDE.md).
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide max sur les écrans qui en prévoient — `max=0` ailleurs (voir
 * `ui6e/formatAireExcentriciteConique.ts`, `niveauAideMaxEcran`). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceAireExcentriciteConique): Pick<EtatSessionAireExcentriciteConique, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionAireExcentriciteConique(reglages: ReglagesSession6e, generateur: () => ExerciceAireExcentriciteConique): EtatSessionAireExcentriciteConique {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionAireExcentriciteConique): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionAireExcentriciteConique): EtatSessionAireExcentriciteConique {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionAireExcentriciteConique, resultat: ResultatExerciceAireExcentriciteConique): EtatSessionAireExcentriciteConique {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionAireExcentriciteConique, valeurs: string[]): EtatSessionAireExcentriciteConique {
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
  const scoresPartiels: Partial<Record<PhaseAireExcentriciteConique, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const phaseSuivante = phaseApres(phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceAireExcentriciteConique = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
