import type { ExerciceArbreTableauEffectifs } from "../core6e/arbreTableauEffectifs.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesArbreTableauEffectifs";
import type { EtatSessionArbreTableauEffectifs, PhaseArbreTableauEffectifs, ResultatExerciceArbreTableauEffectifs } from "./typesArbreTableauEffectifs";
import { verifierEcran } from "./verificationArbreTableauEffectifs";

/**
 * Couche B (6e) — session de `6gen74`, même patron que `sessionIndependanceBayes.ts`. Seule
 * différence : l'écran « indépendance » est un CHOIX FERMÉ à deux issues — UN SEUL essai (convention
 * du site : un 2e essai donnerait la réponse par élimination), voir `tentativesMaxCourant`.
 */

const POINTS_DE_BASE = 100;

export const NIVEAU_AIDE_MAX = 2;

const PHASES_CHOIX_FERME: PhaseArbreTableauEffectifs[] = ["independance"];

export function tentativesMaxCourant(etat: EtatSessionArbreTableauEffectifs): number {
  return PHASES_CHOIX_FERME.includes(etat.phase) ? 1 : etat.reglages.tentativesMax;
}

function etatInitial(
  exercice: ExerciceArbreTableauEffectifs,
): Pick<EtatSessionArbreTableauEffectifs, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "revelesPartiels" | "derniereTransitionRevelee"> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(exercice),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresPartiels: {},
    revelesPartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionArbreTableauEffectifs(reglages: ReglagesSession6e, generateur: () => ExerciceArbreTableauEffectifs): EtatSessionArbreTableauEffectifs {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionArbreTableauEffectifs): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: tentativesMaxCourant(etat) };
}

export function activerAideSuivante(etat: EtatSessionArbreTableauEffectifs): EtatSessionArbreTableauEffectifs {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionArbreTableauEffectifs, resultat: ResultatExerciceArbreTableauEffectifs): EtatSessionArbreTableauEffectifs {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionArbreTableauEffectifs, valeurs: string[]): EtatSessionArbreTableauEffectifs {
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
  const phaseSuivante = phaseApres(exercice, phaseCourante);
  const scoresPartiels: Partial<Record<PhaseArbreTableauEffectifs, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const revelesPartiels: Partial<Record<PhaseArbreTableauEffectifs, boolean>> = { ...etat.revelesPartiels, [phaseCourante]: revele };

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceArbreTableauEffectifs = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant({ ...etat, revelesPartiels }, resultat), derniereTransitionRevelee: revele };
  }

  return {
    ...etat,
    scoresPartiels,
    revelesPartiels,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    phase: phaseSuivante,
    derniereTransitionRevelee: revele,
  };
}
